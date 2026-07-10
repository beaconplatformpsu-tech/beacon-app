# Beacon Platform — Firebase RTDB Database Map

## Overview

This document describes the complete Firebase Realtime Database structure for the Beacon Platform. All paths are finalized and migration from any legacy structure is complete.

---

## Database Structure

```
/public_content                   ← PUBLIC READ, ADMIN WRITE
  /resources/{resourceId}          ← Single source of truth for all resources
  /skills/{skillId}
  /career_paths/{careerPathId}
  /skill_categories/{categoryId}
  /career_categories/{categoryId}
  /academic_categories/{categoryId}
  /announcements/{announcementId}

/indexes                          ← PUBLIC READ, ADMIN WRITE
  /resources_by_skill/{skillId}/{resourceId}: true
  /resources_by_type/{resourceType}/{resourceId}: true
  /resources_by_level/{level}/{resourceId}: true
  /resources_by_career_path/{careerPathId}/{resourceId}: true
  /resources_by_academic_category/{academicCategoryId}/{resourceId}: true
  /skills_by_category/{categoryId}/{skillId}: true
  /career_paths_by_category/{categoryId}/{careerPathId}: true

/relations                        ← PUBLIC READ, ADMIN WRITE
  /career_path_skills/{careerPathId}/{skillId}
    importanceLevel: "core" | "important" | "optional"
    minimumProficiencyLevel: "beginner" | "intermediate" | "advanced"
    learningOrder: number

/users/{uid}                      ← OWNER + ADMIN READ/WRITE
  /profile
  /preferences
  /onboarding

/user_private/{uid}               ← OWNER ONLY READ/WRITE
  /user_skills
  /notes
  /tasks
  /recommendations
  /cv_profile
  /cv_analysis

/user_admin_meta/{uid}            ← ADMIN ONLY
  role
  accountStatus
  emailVerified
  createdAt
  updatedAt

/support_messages/{messageId}     ← USER CREATE, ADMIN READ/MANAGE

/platform_settings
  /public                         ← PUBLIC READ, ADMIN WRITE
  /private                        ← ADMIN ONLY

/stats                            ← PUBLIC READ, ADMIN WRITE
  usersCount
  resourcesCount
  skillsCount
  careerPathsCount
  academicCategoriesCount
  careerCategoriesCount
  skillCategoriesCount
  supportMessagesCount
  updatedAt

/system                           ← ADMIN ONLY
  /seed_meta
  /migration_meta
  /admin_logs
```

---

## Path Access Matrix

| Path | Public Read | Auth Read | Admin Read | Admin Write | User Write |
|------|-------------|-----------|------------|-------------|------------|
| `public_content/*` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `indexes/*` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `relations/*` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `users/{uid}/profile` | ❌ | ✅ (own) | ✅ | ✅ | ✅ (own) |
| `user_private/{uid}` | ❌ | ✅ (own) | ✅ | ✅ | ✅ (own) |
| `user_admin_meta/{uid}` | ❌ | ❌ | ✅ | ✅ | ❌ |
| `support_messages` | ❌ | ❌ | ✅ | ✅ | ✅ (create) |
| `platform_settings/public` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `platform_settings/private` | ❌ | ❌ | ✅ | ✅ | ❌ |
| `stats` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `system` | ❌ | ❌ | ✅ | ✅ | ❌ |

---

## Required Enum Values

### Relation Enums
```
importanceLevel:          "core" | "important" | "optional"
minimumProficiencyLevel:  "beginner" | "intermediate" | "advanced"
```

### Resource Enums
```
sourceType:     "internal" | "external"
resourceType:   "Documentation" | "Course" | "Guide" | "Practice" | 
                "Article" | "Tool" | "Roadmap" | "Template" | "Checklist"
difficultyLevel: "Beginner" | "Intermediate" | "Advanced" | "All Levels"
language:       "en" | "ar"
```

### Skill Enums
```
difficultyLevel: "Beginner" | "Intermediate" | "Advanced"
```

### User Skill Enums
```
proficiency: "Beginner" | "Intermediate" | "Advanced" | "Expert"
```

---

## Seed Commands

| Command | Description | Safe? |
|---------|-------------|-------|
| `npm run seed:dry` | Validate payload in memory, print summary — **NO DB writes** | ✅ Always safe |
| `npm run seed:validate` | Alias for seed:dry — validates all data locally | ✅ Always safe |
| `npm run seed:dev` | Writes full payload to Firebase (creates backup first) | ⚠️ Writes to DB |
| `npm run seed:reset:dev` | Force-writes full payload, skips confirmation | ⚠️ Writes to DB |
| `npm run seed:users` | Seeds only auth users and profiles | ⚠️ Writes to DB |
| `npm run seed:public` | Seeds only public_content, relations, settings | ⚠️ Writes to DB |
| `npm run seed:resources` | Seeds only resources and resource indexes | ⚠️ Writes to DB |
| `npm run seed:indexes` | Rebuilds all indexes from live DB data | ⚠️ Writes to DB |
| `npm run seed:verify` | Verifies the live DB has correct structure | Requires DB connection |

---

## Environment Variables

Stored in `.env.seeder` (never commit this file).

| Variable | Description |
|----------|-------------|
| `FIREBASE_DATABASE_URL` | Your RTDB URL (e.g., `https://your-project.firebaseio.com`) |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to service account JSON (e.g., `service-account.json`) |
| `SEED_ADMIN_EMAIL` | Email of the admin user to create/update |
| `SEED_ADMIN_PASSWORD` | Password for admin user (only needed for creation) |
| `SEED_ADMIN_DISPLAY_NAME` | Admin display name |
| `SEED_STUDENT_EMAIL` | Email of the demo student user |
| `SEED_STUDENT_PASSWORD` | Password for demo student user |
| `SEED_STUDENT_DISPLAY_NAME` | Student display name |

---

## How to Validate Before Seeding

```bash
# 1. Always run dry-run first:
npm run seed:dry

# 2. Review the generated report:
cat generated/seed-report.md

# 3. If everything looks good, seed:
npm run seed:dev
```

---

## How to Reset Dev Database Safely

```bash
# This clears controlled paths and reseeds from scratch:
npm run seed:reset:dev

# Then verify the new structure:
npm run seed:verify
```

---

## Legacy Paths That Were Removed

The following paths should **never exist** in the database. If found, run `seed:reset:dev`:
- `academic_support_resources` — merged into `public_content/resources`
- `career_resources` — removed (use `indexes/resources_by_career_path`)
- `resource_by_skill` — renamed to `indexes/resources_by_skill`
- `resource_by_career_path` — renamed to `indexes/resources_by_career_path`
- `resource_by_type` — renamed to `indexes/resources_by_type`
- `skills` (top-level) — moved to `public_content/skills`
- `career_paths` (top-level) — moved to `public_content/career_paths`
- `seed_meta` (top-level) — moved to `system/seed_meta`

---

## ⚠️ Security Warning

- **NEVER commit** `service-account.json` or `.env.seeder` to source control.
- Both are listed in `.gitignore`. Verify with `git status` before any commit.
- Admin checks use the `user_admin_meta/{uid}/role` path in RTDB rules.
- Client-side code **NEVER** has access to the Firebase Admin SDK.
