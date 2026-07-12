# Beacon Platform - Professional Firebase Realtime Database Architecture

## Overview
This document outlines the strict, authoritative architecture of the Beacon Platform's Firebase Realtime Database. As a scalable platform integrating AI functionality, career tracking, and personalized learning, the database is normalized to eliminate duplication, strictly partitioned by access roles, and heavily reliant on indexes and relations for fast traversal.

This structure enforces the **ETC (Easier To Change)** and **DRY (Don't Repeat Yourself)** principles by keeping data single-sourced and orthogonal.

---

## High-Level Structure

```text
/public_content
  /resources
  /skills
  /career_paths
  /skill_categories
  /career_categories
  /academic_categories
  /learning_paths
  /practice_tasks
  /quizzes
  /projects
  /announcements

/indexes
  /resources_by_skill
  /resources_by_type
  /resources_by_level
  /resources_by_career_path
  /resources_by_academic_category
  /skills_by_category
  /career_paths_by_category
  /learning_paths_by_career_path
  /projects_by_skill
  /projects_by_career_path
  /quizzes_by_skill
  /practice_tasks_by_skill

/relations
  /career_path_skills
  /learning_path_steps

/users/{uid}
  /profile
  /preferences
  /onboarding

/user_private/{uid}
  /tasks
  /notes
  /bookmarks
  /skill_progress
  /skill_evidence
  /career_readiness
  /learning_progress
  /project_submissions
  /cv_profile
  /cv_analysis
  /portfolio
  /recommendations
  /weekly_plans
  /activity_log

/user_admin_meta/{uid}
  role (super_admin | content_admin | advisor | support_admin | student)
  permissions
  accountStatus

/support_messages

/platform_settings
  /public
  /private

/stats

/system
  /seed_meta
  /migration_meta
  /admin_logs
  /ai_usage_logs
  /quiz_answer_keys
```

---

## 1. Public Content Paths (`/public_content`)
**Purpose:** Stores globally accessible catalog data like skills, resources, and career paths.
**Read:** Public (all users, including unauthenticated)
**Write:** Users with `canManageContent` permissions (e.g., `content_admin`, `super_admin`)
- This data must NEVER include user-specific progress or metrics.
- Enums are strictly normalized to lowercase (e.g., `beginner`, `in_progress`, `high`).
- Arrays like `skillIds` or `careerPathIds` are **required** to ensure index parity.
- **Quiz Security:** Public quiz entities intentionally omit `correctOptionIndex` and `explanation`. Quiz answer keys must stay completely out of `public_content`. These are stored securely in `/system/quiz_answer_keys` or scored securely via backend edge functions.

## 2. Index Paths (`/indexes`)
**Purpose:** Maps relations between entities without embedding. Supports many-to-many lookups.
**Read:** Public (for public content mapping)
**Write:** Content Admins
- Follows the structure `/indexes/{index_name}/{primary_id}/{secondary_id}: true`.
- Resolves high-cardinality lookups securely and in real-time.

## 3. Relation Paths (`/relations`)
**Purpose:** Stores complex metadata for relationships that require more than a boolean index.
**Read:** Public
**Write:** Content Admins

## 4. Users Paths (`/users/{uid}`)
**Purpose:** Stores basic account state and application preferences.
**Read:** Profile Owner + Admins with `canManageUsers`.
**Write:** Profile Owner + Admins with `canManageUsers`.
- **Privacy Warning:** This is **NOT** a public path. It contains PII (e.g., `email`) and is restricted strictly to the user and authorized admins.
- **Public Profile Strategy:** If public profiles or sharable portfolios are required in the future, a dedicated node like `/public_profiles/{uid}` or `/public_portfolios/{slug}` will be introduced containing *only* intentionally shared data (without PII).

## 5. User Private Paths (`/user_private/{uid}`)
**Purpose:** The sole authoritative location for sensitive user progress, AI recommendations, CVs, and tasks.
**Read:** Profile Owner + Advisors (if `canViewPrivateStudentData` is true) + Super Admins.
**Write:** Profile Owner + Super Admins.
- Sub-collections like `/recommendations` and `/cv_analysis` keep AI outputs strictly private.
- **Data Ownership Rules:** A user completely owns their `/user_private/{uid}` tree. Shared or collaborative nodes must exist at the root level (e.g., `/shared_projects`), not inside a user's private tree.
- Content Admins and Support Admins cannot access private student data (`cv_analysis`, `notes`, etc.).

## 6. Admin-Only Paths (`/user_admin_meta/{uid}`)
**Purpose:** Controls application-level authorization and status.
**Read:** Owner (to verify own role) + Super Admins.
**Write:** Super Admins only.
- Defines roles: `super_admin`, `content_admin`, `advisor`, `support_admin`, `student`.
- Granular permissions define explicit capabilities (`canManageContent`, `canManageUsers`, etc.).
- Default role fallback is `student`.
- Support Admins can manage support messages but cannot manage users or read private student data.

## 7. System Paths (`/system` & `/platform_settings`)
**Purpose:** Stores application global state, configuration, and secure logic maps.
**Read:** Strictly bounded to relevant Admin roles (e.g., `canRunSystemActions`).
**Write:** Super Admins.
- `/system/quiz_answer_keys`: Secure storage mapping for grading quizzes out of public reach.
- `/platform_settings/private`: Application integration identifiers.

---

## TypeScript Organization

To enforce the database contract within the application, the TypeScript types are strictly separated by domain under `src/types/collections/`:
- `base.ts`: Shared foundational interfaces (`ID`, `UID`, `BaseEntity`, `FileReference`).
- `publicContent.ts`: Types for all catalog items in `/public_content`.
- `relations.ts`: Metadata interfaces for relation maps.
- `users.ts`: Core user profile and preference types.
- `userPrivate.ts`: Interfaces for all sensitive student progress and AI data.
- `system.ts`: Backend admin configurations, logs, and stats.

These modular collections are aggregated together in `src/types/database.ts`, which exports a single `DatabaseSchema` interface to enforce strict type-safety across all database interactions.

---

## Strict Security & Policy Guidelines

### Least Privilege Enforcement
Admins do **not** have blanket read/write access to the database by default. Access is granted explicitly through the boolean flags inside `/user_admin_meta/{uid}/permissions`. For example, a `content_admin` can write to `/public_content` but receives a "Permission Denied" if attempting to read a student's `/user_private/{uid}/cv_analysis`.

### Secret Management Policy
**API Keys and cryptographic secrets MUST NEVER exist in the Realtime Database.**
Even secure-sounding nodes like `/platform_settings/private` must only contain non-sensitive identifiers or config flags. All true secrets (OpenAI Keys, Stripe Secrets, API tokens) must live exclusively in Supabase Edge Functions secrets, Vercel Environment Variables, or a dedicated secure vault.

### File Storage Policy
File URLs stored in the RTDB (like CVs, profile pictures, project uploads, and skill evidence) use the `FileReference` interface. The database only stores the metadata (bucket path, URL, MIME type). **File signed URLs must not be stored permanently** since they expire. The physical files reside in Supabase Storage, guarded by Edge Functions that enforce access control matching the user's UID.

### AI Data Policy
Logs of AI usage and token counts are recorded in `/system/ai_usage_logs` strictly for telemetry and abuse prevention. **AI logs must not store raw prompts** to preserve user privacy and limit DB size. Individual AI feedback meant for the user is piped directly to `/user_private/{uid}/cv_analysis` or `/recommendations`.

### Normalization & Legacy Removal
All entities rely strictly on `title` (legacy fields like `Skill.name` are explicitly banned from the database contract). Enums are strictly lowercased and snake_cased where appropriate to prevent frontend mismatch errors.
