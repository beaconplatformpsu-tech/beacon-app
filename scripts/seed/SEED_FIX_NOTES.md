# Beacon Seed Folder Fix Notes

This seed folder was cleaned for Professional Seed v2.

## Main fixes
- Removed generated/filler master data from active seed output.
- Replaced quizzes with meaningful professional quizzes and protected answer keys.
- Added stronger validation for references, indexes, stats, answer-key protection, duplicated IDs, duplicated slugs, invalid enums, unsupported resource types, and filler content.
- Added professional internal resources to cover previously uncovered skills such as CI/CD, leadership, and financial analysis.
- Fixed duplicated resource skill references.
- Aligned skills and career paths with existing category IDs.
- Updated demo user seeder to use the separated config API.
- Deprecated old helper scripts that used generated seed content.
- Removed dummy credential fallbacks in AI and Supabase storage helpers.

## Recommended first clean seed order
```bash
npm run seed:validate
npm run seed:dry
npm run typecheck
npm run build
npm run seed:dev
npm run seed:bootstrap:admin
npm run seed:verify
```

Since Auth and Realtime Database are empty, `seed:reset:dev` is not needed for the first run.
