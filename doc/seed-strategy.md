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
- **Strict Validation**: The `npm run seed:validate` script guarantees that no legacy schemas slip through, no dummy data (like `example.com`) is injected, and all relations/indexes match 100% with the provided arrays.

## Seed Commands

| Command | Action |
| --- | --- |
| `npm run seed:validate` | Performs strict validation checks on the memory payload without connecting to the DB. |
| `npm run seed:dry` | Builds the payload, validates it, and prints size and entity counts. **Safe.** |
| `npm run seed:dev` | Writes the validated payload to the database. Overwrites matching paths but leaves user data intact. |
| `npm run seed:reset:dev` | **DANGER**: Wipes `public_content`, `indexes`, `relations`, `stats`, and `system` nodes entirely, then pushes a completely fresh payload. Does *not* wipe users. |

## Updating Seed Content
Seed content is statically defined inside `scripts/seed/masterData/`.
1. Modify the relevant file (e.g. `skills.ts`).
2. Run `npm run seed:dry` to ensure validation passes.
3. Run `npm run typecheck` to ensure the schema still holds.
4. Run `npm run seed:dev` against the emulator or staging database.
