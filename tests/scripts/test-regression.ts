/**
 * test-regression.ts
 * ------------------
 * Task 40 — Regression Test Script (Drop 1 + Drop 2 combined)
 *
 * Runs all available test scripts in sequence and produces a combined report.
 *
 * Run: bun tests/scripts/test-regression.ts
 *
 * Requirements:
 *  - VITE_API_URL in .env
 *  - VITE_DEV_TOKEN in .env (valid JWT)
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";
import { spawnSync } from "child_process";

// ─── Types ────────────────────────────────────────────────────────────────────

type SuiteResult = {
  suite: string;
  script: string;
  passed: boolean;
  exitCode: number;
  durationMs: number;
  output: string;
};

// ─── Config ───────────────────────────────────────────────────────────────────

const SUITES = [
  {
    suite: "37 — Widget State Validation",
    script: "tests/scripts/test-widget-states.ts",
  },
  {
    suite: "31 — Schema Validation",
    script: "tests/scripts/test-schema-validation.ts",
  },
  {
    suite: "32 — Guardrail Simulation",
    script: "tests/scripts/test-guardrails.ts",
  },
  {
    suite: "42 — Performance Validation",
    script: "tests/scripts/test-performance.ts",
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function runRegression() {
  console.log("\n==========================================");
  console.log(" Task 40 — Regression Suite (Drop 1 + 2) ");
  console.log("==========================================\n");

  const results: SuiteResult[] = [];

  for (const { suite, script } of SUITES) {
    console.log(`\n▶  Running: ${suite}`);
    console.log(`   Script : ${script}`);
    console.log("─".repeat(50));

    const start = Date.now();

    const proc = spawnSync("bun", [script], {
      encoding: "utf-8",
      env: process.env,
      cwd: process.cwd(),
    });

    const durationMs = Date.now() - start;
    const exitCode = proc.status ?? 1;
    const passed = exitCode === 0;
    const output = (proc.stdout ?? "") + (proc.stderr ?? "");

    // Print the script output inline
    console.log(output.trim());

    const icon = passed ? "✅" : "❌";
    console.log(
      `\n${icon}  ${suite} — ${passed ? "PASSED" : "FAILED"} in ${durationMs}ms`,
    );

    results.push({ suite, script, passed, exitCode, durationMs, output });
  }

  // ─── Summary ───────────────────────────────────────────────────────────────

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalMs = results.reduce((sum, r) => sum + r.durationMs, 0);

  console.log("\n==========================================");
  console.log(" Regression Summary");
  console.log("==========================================");
  results.forEach((r) => {
    const icon = r.passed ? "✅" : "❌";
    console.log(`  ${icon}  ${r.suite} (${r.durationMs}ms)`);
  });
  console.log("──────────────────────────────────────────");
  console.log(`  Total suites : ${results.length}`);
  console.log(`  ✅ Passed    : ${passed}`);
  console.log(`  ❌ Failed    : ${failed}`);
  console.log(`  ⏱  Total time: ${(totalMs / 1000).toFixed(1)}s`);
  console.log("==========================================\n");

  // ─── Write report ──────────────────────────────────────────────────────────

  const reportsDir = resolve(process.cwd(), "tests/reports");
  if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true });

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 15);
  const reportPath = `${reportsDir}/regression_${timestamp}.json`;

  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        task: "40 — Regression Suite",
        timestamp: new Date().toISOString(),
        totalMs,
        total: results.length,
        passed,
        failed,
        suites: results.map(({ output, ...rest }) => rest), // exclude raw output from report
      },
      null,
      2,
    ),
  );

  console.log(`📄  Report written to: ${reportPath}\n`);

  if (failed > 0) {
    console.log(
      `⚠️   ${failed} suite(s) failed. Check individual reports in tests/reports/ for details.\n`,
    );
    process.exit(1);
  }
}

runRegression().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
