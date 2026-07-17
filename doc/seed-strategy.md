# Beacon Seed Strategy v2

The Beacon database seed scripts are strictly governed by **Database Contract v1**. They are designed to idempotently populate the database with professional, high-quality MVP content, while safeguarding production user data.

## What Gets Seeded
The professional seed focuses entirely on platform structure, metadata, and core curriculum:
1. **Categories**: Skill, Career, and Academic
2. **Curriculum**: Skills, Career Paths, Resources, Learning Paths, Practice Tasks, Projects, and Quizzes
3. **Relations**: Maps between Career Paths -> Skills, Learning Paths -> Steps
4. **Indexes**: Boolean hashmaps (e.g. `resources_by_skill`) generated dynamically at seed runtime
5. **System Metadata**: Stats tracking and quiz answer keys

## Security & Protective Boundaries
- **No Production Users**: The standard seed command does not seed fake users or clear the `/users` and `/user_private` roots.
- **Quiz Protection**: The `public_content/quizzes` root contains questions and options only. The `system/quiz_answer_keys` root securely houses the `correctOptionIndex` and explanations, making it impossible for standard client connections to cheat.
- **Strict Validation**: The `npm run seed:validate` script guarantees the following:
  - No legacy paths (e.g., `Skill.name`).
  - No duplicate IDs or duplicate slugs within collections.
  - No dummy content or `example.com` URLs.
  - No invalid enum values.
  - No missing required arrays.
  - All relation/index references strictly match existing entities.
  - Every public quiz has a matching system quiz_answer_keys record.
  - Public quizzes do not expose `correctOptionIndex` or `explanation`.
  - `system/quiz_answer_keys` is not public-readable.
  - `platform_settings/private` contains no keys, tokens, passwords, or secrets.
  - `AIUsageLog` does not contain raw prompt strings.
  - `FileReference` does not contain permanent `signedUrl`.

## Seed Commands

| Command | Action |
| --- | --- |
| `npm run seed:validate` | Performs strict validation checks on the memory payload without connecting to the DB. |
| `npm run seed:dry` | Builds the payload, validates it, and prints size and entity counts. **Safe.** |
| `npm run seed:dev` | Writes the validated payload to the database. Overwrites matching paths but leaves user data intact. |
| `npm run seed:reset:dev` | **DANGER**: Clears specific roots (`public_content`, `indexes`, `relations`, `stats`, `system/seed_meta`, `system/quiz_answer_keys`) and pushes a fresh payload. It **MUST NOT** clear: `users`, `user_private`, or `user_admin_meta`. |
| `npm run seed:bootstrap:admin` | Bootstraps the first admin account in Firebase Auth and Realtime DB. Run this once on empty projects. |
| `npm run seed:demo:users` | Creates demo student accounts and their associated profiles, tasks, and notes. Safe to run repeatedly. |
| `npm run seed:verify` | Verifies that the deployed seed matches the codebase schema and has all necessary relations. |

## Updating Seed Content
Seed content is statically defined inside `scripts/seed/masterData/`.
1. Modify the relevant file (e.g. `skills.ts`).
2. Run `npm run seed:dry` to ensure validation passes.
3. Run `npm run typecheck` to ensure the schema still holds.
4. Run `npm run seed:dev` against the emulator or staging database.
