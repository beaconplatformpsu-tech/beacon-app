import fs from "fs";
import path from "path";

export function generateSeedReport(
  options: any,
  payload: Record<string, any>,
  executionTimeMs: number
) {
  const timestamp = new Date().toISOString();
  const reportDir = path.join(process.cwd(), "generated");
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportPath = path.join(reportDir, "seed-report.md");
  
  const nodeCount = Object.keys(payload).length;
  
  const summary: Record<string, number> = {};
  Object.keys(payload).forEach(key => {
    const root = key.split('/')[0];
    summary[root] = (summary[root] || 0) + 1;
  });

  let markdown = `# Beacon Seed Execution Report\n\n`;
  markdown += `**Timestamp:** ${timestamp}\n`;
  markdown += `**Mode:** ${options.write ? "WRITE" : "DRY-RUN"}\n`;
  markdown += `**Scope:** ${options.only}\n`;
  markdown += `**Execution Time:** ${(executionTimeMs / 1000).toFixed(2)} seconds\n\n`;

  markdown += `## Configuration\n`;
  markdown += `- Skip AI: ${options.skipAi}\n`;
  markdown += `- Skip Supabase: ${options.skipSupabase}\n`;
  markdown += `- Force: ${options.force}\n\n`;

  markdown += `## Payload Summary\n`;
  markdown += `Total Nodes: **${nodeCount}**\n\n`;
  
  markdown += `| Root Node | Count |\n`;
  markdown += `|-----------|-------|\n`;
  for (const [root, count] of Object.entries(summary)) {
    markdown += `| \`/${root}\` | ${count} |\n`;
  }

  markdown += `\n## Logs\n`;
  markdown += `Successfully generated in memory. ${options.write ? 'Written to Firebase.' : 'Skipped Firebase write due to dry-run.'}\n`;

  fs.writeFileSync(reportPath, markdown);
  console.log(`\n📄 Detailed report saved to ${reportPath}`);
}
