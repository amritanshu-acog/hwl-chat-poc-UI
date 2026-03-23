/**
 * test-performance.ts
 * -------------------
 * Task 42 — Retrieval API Latency Distribution
 *
 * Run: bun tests/scripts/test-performance.ts
 *
 * Requirements:
 *  - VITE_API_URL in .env
 *  - VITE_DEV_TOKEN in .env (valid JWT)
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";

// ─── Env ──────────────────────────────────────────────────────────────────────

const API_URL = process.env.VITE_API_URL;
const DEV_TOKEN = process.env.VITE_DEV_TOKEN;

if (!API_URL) {
  console.error("❌  VITE_API_URL not set in .env");
  process.exit(1);
}
if (!DEV_TOKEN) {
  console.error("❌  VITE_DEV_TOKEN not set in .env");
  process.exit(1);
}

// ─── Config ───────────────────────────────────────────────────────────────────

const MESSAGES = [
  "Hello",
  "I need help",
  "How do I submit a document?",
  "What is an invoice?",
  "Tell me about candidates",
  "Something is broken",
  "I don't understand",
  "Help with agreements",
  "What should I do first?",
  "Can you explain the process?",
  "How do I add a candidate?",
  "What are the steps to raise an invoice?",
  "I cannot find my agreement",
  "Who do I contact for help?",
  "What does this error mean?",
  "How long does this take?",
  "Is there a deadline?",
  "What happens after I submit?",
  "Can I undo this?",
  "Where do I find my documents?",
];

const THRESHOLDS = {
  good: 3000, // under 3s — good
  warn: 6000, // under 6s — acceptable
  // over 6s    — slow
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

type LatencyResult = {
  id: string;
  message: string;
  durationMs: number;
  status: number;
  action: string;
  grade: "good" | "acceptable" | "slow";
};

async function callAnswer(
  message: string,
): Promise<LatencyResult & { index: number }> {
  const start = Date.now();
  const res = await fetch(`${API_URL}/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEV_TOKEN}`,
    },
    body: JSON.stringify({ message }),
  });
  const durationMs = Date.now() - start;

  let action = "unknown";
  try {
    const body = (await res.json()) as Record<string, unknown>;
    action = String(body.action ?? "unknown");
  } catch {
    /* ignore */
  }

  const grade =
    durationMs < THRESHOLDS.good
      ? "good"
      : durationMs < THRESHOLDS.warn
        ? "acceptable"
        : "slow";

  return {
    index: 0,
    id: "",
    message,
    durationMs,
    status: res.status,
    action,
    grade,
  };
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function runTests() {
  console.log("\n=================================");
  console.log(" Task 42 — Performance Validation");
  console.log("=================================\n");
  console.log(`  Sending ${MESSAGES.length} queries...\n`);

  const results: LatencyResult[] = [];

  for (let i = 0; i < MESSAGES.length; i++) {
    const result = await callAnswer(MESSAGES[i]);
    result.id = `PF${String(i + 1).padStart(2, "0")}`;
    result.index = i + 1;

    const gradeIcon =
      result.grade === "good"
        ? "🟢"
        : result.grade === "acceptable"
          ? "🟡"
          : "🔴";

    console.log(
      `${gradeIcon}  [${result.id}] ${result.durationMs}ms — action: ${result.action} — "${result.message.slice(0, 40)}"`,
    );

    results.push(result);
  }

  // ─── Stats ──────────────────────────────────────────────────────────────────

  const durations = results.map((r) => r.durationMs).sort((a, b) => a - b);
  const total = durations.length;
  const sum = durations.reduce((a, b) => a + b, 0);

  const stats = {
    count: total,
    min: durations[0],
    max: durations[total - 1],
    avg: Math.round(sum / total),
    p50: percentile(durations, 50),
    p75: percentile(durations, 75),
    p95: percentile(durations, 95),
    good: results.filter((r) => r.grade === "good").length,
    acceptable: results.filter((r) => r.grade === "acceptable").length,
    slow: results.filter((r) => r.grade === "slow").length,
  };

  console.log("\n──────────────────────────────────────");
  console.log("  Latency Summary");
  console.log("──────────────────────────────────────");
  console.log(`  Min    : ${stats.min}ms`);
  console.log(`  Avg    : ${stats.avg}ms`);
  console.log(`  P50    : ${stats.p50}ms`);
  console.log(`  P75    : ${stats.p75}ms`);
  console.log(`  P95    : ${stats.p95}ms`);
  console.log(`  Max    : ${stats.max}ms`);
  console.log("──────────────────────────────────────");
  console.log(`  🟢 Good (< ${THRESHOLDS.good}ms)        : ${stats.good}`);
  console.log(
    `  🟡 Acceptable (< ${THRESHOLDS.warn}ms)  : ${stats.acceptable}`,
  );
  console.log(`  🔴 Slow (>= ${THRESHOLDS.warn}ms)       : ${stats.slow}`);
  console.log("──────────────────────────────────────\n");

  // ─── Write report ────────────────────────────────────────────────────────────

  const reportsDir = resolve(process.cwd(), "tests/reports");
  if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true });

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 15);
  const reportPath = `${reportsDir}/performance_${timestamp}.json`;

  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        task: "42 — Performance Validation",
        timestamp: new Date().toISOString(),
        thresholds: THRESHOLDS,
        stats,
        results,
      },
      null,
      2,
    ),
  );

  console.log(`📄  Report written to: ${reportPath}\n`);

  if (stats.slow > 0) {
    console.log(
      `⚠️   ${stats.slow} slow queries detected. Review report for details.\n`,
    );
  }
}

runTests().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
