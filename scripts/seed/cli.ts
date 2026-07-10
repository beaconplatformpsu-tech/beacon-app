export interface SeedOptions {
  dryRun: boolean;
  write: boolean;
  only: "users" | "public" | "resources" | "all";
  limit?: number;
  skipAi: boolean;
  skipSupabase: boolean;
  force: boolean;
}

export function parseCliArgs(): SeedOptions {
  const args = process.argv.slice(2);
  
  const options: SeedOptions = {
    dryRun: args.includes("--dry-run"),
    write: args.includes("--write"),
    only: "all",
    limit: undefined,
    skipAi: args.includes("--skip-ai"),
    skipSupabase: args.includes("--skip-supabase"),
    force: args.includes("--force")
  };

  // If neither specified, default to dry-run for safety
  if (!options.write && !options.dryRun) {
    options.dryRun = true;
  }

  // Parse --only
  const onlyIndex = args.indexOf("--only");
  if (onlyIndex !== -1 && args[onlyIndex + 1]) {
    const val = args[onlyIndex + 1];
    if (["users", "public", "resources", "all"].includes(val)) {
      options.only = val as any;
    } else {
      console.error(`❌ Invalid --only value: ${val}. Allowed: users, public, resources, all.`);
      process.exit(1);
    }
  }

  // Parse --limit
  const limitIndex = args.indexOf("--limit");
  if (limitIndex !== -1 && args[limitIndex + 1]) {
    options.limit = parseInt(args[limitIndex + 1], 10);
  }

  return options;
}
