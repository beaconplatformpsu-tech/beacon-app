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
  createdAt
  updatedAt

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
  role
  permissions
  accountStatus
  emailVerified
  createdAt
  updatedAt

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
```

---

## 1. Public Content Paths (`/public_content`)
**Purpose:** Stores globally accessible catalog data like skills, resources, and career paths.
**Read:** Public (all users, including unauthenticated)
**Write:** Admin Only
- This data must NEVER include user-specific progress or metrics.
- All entities use stable IDs.

## 2. Index Paths (`/indexes`)
**Purpose:** Maps relations between entities without embedding. Supports many-to-many lookups.
**Read:** Public (for public content mapping)
**Write:** Admin Only
- Follows the structure `/indexes/{index_name}/{primary_id}/{secondary_id}: true`.
- Example: `/indexes/resources_by_skill/{skillId}/{resourceId}: true`.
- Resolves high-cardinality lookups securely and in real-time.

## 3. Relation Paths (`/relations`)
**Purpose:** Stores complex metadata for relationships that require more than a boolean index.
**Read:** Public
**Write:** Admin Only
- **`career_path_skills`**: Contains the `importanceLevel` and `minimumProficiencyLevel` required for a specific skill within a specific career path.
- **`learning_path_steps`**: Contains the `sortOrder` and strict requirements linking a resource/task/quiz to a Learning Path.

## 4. User Public/Basic Paths (`/users/{uid}`)
**Purpose:** Stores safe-to-read user metadata, typically public profiles and basic account state.
**Read:** Admin + Profile Owner (Can be extended to public if portfolio/profile sharing is enabled).
**Write:** Admin + Profile Owner.
- Includes `/profile`, `/preferences`, and `/onboarding`.
- Does not contain secure PII, passwords, or internal application states.

## 5. User Private Paths (`/user_private/{uid}`)
**Purpose:** The sole authoritative location for sensitive user progress, AI recommendations, CVs, and tasks.
**Read:** Admin + Profile Owner.
**Write:** Admin + Profile Owner.
- Decoupled from public profiles for security and payload optimization.
- Sub-collections like `/recommendations` and `/cv_analysis` keep AI outputs strictly private.
- **Data Ownership Rules:** A user completely owns their `/user_private/{uid}` tree.

## 6. Admin-Only Paths (`/user_admin_meta/{uid}`)
**Purpose:** Controls application-level authorization and status.
**Read:** Admin Only.
**Write:** Admin Only.
- Regular users CANNOT write to this path.
- Contains `role` (e.g., student vs admin) and `accountStatus`.
- If missing, the application defaults to basic privileges (e.g., `"student"`).

## 7. System Paths (`/system` & `/platform_settings`)
**Purpose:** Stores application global state, configuration, and logs.
**Read:** Admin Only (except `/platform_settings/public`).
**Write:** Admin Only.
- `/system/seed_meta`: Tracking seeding script runs to avoid duplicates.
- `/platform_settings/public`: E.g., `maintenanceMode` toggle.

## 8. Stats Paths (`/stats`)
**Purpose:** Real-time counters and aggregations for the platform dashboard.
**Read:** Public (or authenticated users).
**Write:** Admin Only (updated via Cloud Functions or secure backend).

---

## Read/Write Access Rules (Firebase Security Rules)

- **Unauthenticated Users:** Cannot read `user_private`, `users`, `user_admin_meta`. Can read `public_content` and `indexes`.
- **Authenticated Users (Students):** 
  - Read/Write to `users/$uid` and `user_private/$uid` where `$uid === auth.uid`.
  - Cannot write to `user_admin_meta`, `public_content`, `indexes`, or `relations`.
- **Admins:**
  - Read/Write across the entire database. Validated by checking `root.child('user_admin_meta').child(auth.uid).child('role').val() === 'admin'`.

## Data Ownership Rules
- All user-generated data (Tasks, Notes, Portfolios) must be scoped strictly under `user_private/{uid}` or `users/{uid}`.
- Shared documents (if introduced in the future) should be placed in a top-level `/shared` node with explicit ACLs. They should never be embedded in another user's private node.

## Seed Strategy
- The database is seeded locally or in staging using secure admin scripts running under an elevated service account (or locally impersonating an admin).
- **Idempotency:** Seed scripts must check `/system/seed_meta` or verify IDs to prevent duplicating base resources.
- Future seeds must respect the decoupling of `public_content` and `relations`.

## Validation Strategy
- The database is schema-less; however, schema enforcement occurs via two boundaries:
  1. **Application Layer:** Strict Zod parsing (`src/lib/validation.ts`) and TypeScript interfaces (`src/types/database.ts`).
  2. **Security Rules:** Basic shape and field validation within `database.rules.json`.
- The frontend must never bypass the Zod schema when writing to the RTDB.

## Future Expansion Strategy
- **New Features:** Add isolated root nodes or new collections inside `user_private`. Do not pollute `public_content` with user interactions.
- **Analytics:** Logs and usage data should go to `/system/ai_usage_logs` and eventually offloaded to BigQuery.
- **Social/Community Features:** Will require a new root node `/community` with strict indexing to prevent unbounded reads.
