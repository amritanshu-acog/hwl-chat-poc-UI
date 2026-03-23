/**
 * test-schema-validation.ts
 * -------------------------
 * Task 31 — Structured JSON Schema Validation
 *
 * Run: bun tests/scripts/test-schema-validation.ts
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

// ─── Types ────────────────────────────────────────────────────────────────────

type TestResult = {
  id: string;
  message: string;
  passed: boolean;
  violations: string[];
  response: Record<string, unknown>;
};

// ─── Schema definition ────────────────────────────────────────────────────────

const VALID_ACTIONS = ["respond", "clarify", "not_found", "quota_exceeded"];
const VALID_RESPONSE_TYPES = [
  "answer",
  "options",
  "mixed",
  "notfound",
  "clarify",
  "quota_exceeded",
];

function validateSchema(body: Record<string, unknown>): string[] {
  const violations: string[] = [];

  // Required string fields
  if (typeof body.session_id !== "string" || body.session_id.length === 0)
    violations.push("session_id must be a non-empty string");

  if (typeof body.action !== "string" || !VALID_ACTIONS.includes(body.action))
    violations.push(
      `action must be one of: ${VALID_ACTIONS.join(", ")} — got: ${String(body.action)}`,
    );

  if (
    typeof body.response_type !== "string" ||
    !VALID_RESPONSE_TYPES.includes(body.response_type)
  )
    violations.push(
      `response_type must be one of: ${VALID_RESPONSE_TYPES.join(", ")} — got: ${String(body.response_type)}`,
    );

  // Nullable string fields
  for (const field of ["title", "intro", "summary", "escalation", "followUp"]) {
    const val = body[field];
    if (val !== null && val !== undefined && typeof val !== "string")
      violations.push(`${field} must be string or null — got: ${typeof val}`);
  }

  // Nullable array fields
  for (const field of ["steps", "items", "options"]) {
    const val = body[field];
    if (val !== null && val !== undefined && !Array.isArray(val))
      violations.push(`${field} must be array or null — got: ${typeof val}`);
  }

  // options items shape — if present must have label and value
  if (Array.isArray(body.options)) {
    body.options.forEach((opt, i) => {
      const o = opt as Record<string, unknown>;
      if (typeof o.label !== "string")
        violations.push(`options[${i}].label must be a string`);
      if (typeof o.value !== "string")
        violations.push(`options[${i}].value must be a string`);
    });
  }

  return violations;
}

// ─── Corpus ───────────────────────────────────────────────────────────────────

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
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function callAnswer(
  message: string,
  token: string,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const res = await fetch(`${API_URL}/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  let body: Record<string, unknown> = {};
  try {
    body = await res.json();
  } catch {
    body = {};
  }
  return { status: res.status, body };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function runTests() {
  console.log("\n=================================");
  console.log(" Task 31 — Schema Validation     ");
  console.log("=================================\n");

  const results: TestResult[] = [];

  for (let i = 0; i < MESSAGES.length; i++) {
    const message = MESSAGES[i];
    const id = `SC${String(i + 1).padStart(2, "0")}`;
    const { status, body } = await callAnswer(message, DEV_TOKEN!);

    if (status !== 200) {
      console.log(`❌  [${id}] "${message}" — unexpected status ${status}`);
      results.push({
        id,
        message,
        passed: false,
        violations: [`unexpected status: ${status}`],
        response: body,
      });
      continue;
    }

    const violations = validateSchema(body);
    const passed = violations.length === 0;
    const icon = passed ? "✅" : "❌";
    console.log(`${icon}  [${id}] "${message}"`);
    if (!passed) violations.forEach((v) => console.log(`      ⚠️   ${v}`));

    results.push({ id, message, passed, violations, response: body });
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n──────────────────────────────────────");
  console.log(
    `  Total: ${results.length}   ✅ Passed: ${passed}   ❌ Failed: ${failed}`,
  );
  console.log("──────────────────────────────────────\n");

  const reportsDir = resolve(process.cwd(), "tests/reports");
  if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true });

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 15);
  const reportPath = `${reportsDir}/schema_validation_${timestamp}.json`;

  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        task: "31 — Schema Validation",
        timestamp: new Date().toISOString(),
        total: results.length,
        passed,
        failed,
        results,
      },
      null,
      2,
    ),
  );

  console.log(`📄  Report written to: ${reportPath}\n`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
