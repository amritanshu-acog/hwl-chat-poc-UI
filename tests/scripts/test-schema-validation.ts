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

// ─── Schema definition (mirrors LLMResponse + ApiResponse exactly) ────────────

const VALID_ACTIONS = [
  "respond",
  "clarify",
  "not_found",
  "quota_exceeded",
] as const;

// "quota_exceeded" is a valid ResponseAction but NOT a valid ResponseType
const VALID_RESPONSE_TYPES = [
  "answer",
  "options",
  "mixed",
  "notfound",
  "clarify",
] as const;

const VALID_ALERT_SEVERITIES = ["warning", "info", "danger"] as const;

function validateSchema(body: Record<string, unknown>): string[] {
  const v: string[] = [];

  // ── session_id (injected by ApiResponse) ──────────────────────────────────
  if (typeof body.session_id !== "string" || body.session_id.length === 0)
    v.push("session_id must be a non-empty string");

  // ── action ────────────────────────────────────────────────────────────────
  if (
    typeof body.action !== "string" ||
    !(VALID_ACTIONS as readonly string[]).includes(body.action)
  )
    v.push(
      `action must be one of: ${VALID_ACTIONS.join(", ")} — got: ${String(body.action)}`,
    );

  // ── response_type ─────────────────────────────────────────────────────────
  if (
    typeof body.response_type !== "string" ||
    !(VALID_RESPONSE_TYPES as readonly string[]).includes(body.response_type)
  )
    v.push(
      `response_type must be one of: ${VALID_RESPONSE_TYPES.join(", ")} — got: ${String(body.response_type)}`,
    );

  // ── title: string (required, but may be empty for clarify responses) ────────
  if (
    body.title !== null &&
    body.title !== undefined &&
    typeof body.title !== "string"
  )
    v.push(`title must be a string or null — got: ${typeof body.title}`);

  // ── alert: LLMAlert | null ────────────────────────────────────────────────
  if (body.alert !== null && body.alert !== undefined) {
    if (typeof body.alert !== "object" || Array.isArray(body.alert)) {
      v.push("alert must be an LLMAlert object or null");
    } else {
      const a = body.alert as Record<string, unknown>;
      if (
        typeof a.severity !== "string" ||
        !(VALID_ALERT_SEVERITIES as readonly string[]).includes(a.severity)
      )
        v.push(
          `alert.severity must be one of: ${VALID_ALERT_SEVERITIES.join(", ")} — got: ${String(a.severity)}`,
        );
      if (typeof a.title !== "string") v.push("alert.title must be a string");
      if (typeof a.body !== "string") v.push("alert.body must be a string");
    }
  }

  // ── intro: string | null | undefined ─────────────────────────────────────
  if (
    body.intro !== null &&
    body.intro !== undefined &&
    typeof body.intro !== "string"
  )
    v.push(
      `intro must be string, null, or undefined — got: ${typeof body.intro}`,
    );

  // ── chart: string | null ──────────────────────────────────────────────────
  if (
    body.chart !== null &&
    body.chart !== undefined &&
    typeof body.chart !== "string"
  )
    v.push(`chart must be string or null — got: ${typeof body.chart}`);

  // ── followUp: string | null ───────────────────────────────────────────────
  if (
    body.followUp !== null &&
    body.followUp !== undefined &&
    typeof body.followUp !== "string"
  )
    v.push(`followUp must be string or null — got: ${typeof body.followUp}`);

  // ── steps: LLMStep[] | null ───────────────────────────────────────────────
  if (body.steps !== null && body.steps !== undefined) {
    if (!Array.isArray(body.steps)) {
      v.push(`steps must be an array or null — got: ${typeof body.steps}`);
    } else {
      (body.steps as unknown[]).forEach((step, i) => {
        const s = step as Record<string, unknown>;
        if (typeof s.title !== "string")
          v.push(`steps[${i}].title must be a string`);
        if (typeof s.body !== "string")
          v.push(`steps[${i}].body must be a string`);
      });
    }
  }

  // ── items: string[] | null ────────────────────────────────────────────────
  if (body.items !== null && body.items !== undefined) {
    if (!Array.isArray(body.items)) {
      v.push(`items must be an array or null — got: ${typeof body.items}`);
    } else {
      (body.items as unknown[]).forEach((item, i) => {
        if (typeof item !== "string")
          v.push(`items[${i}] must be a string — got: ${typeof item}`);
      });
    }
  }

  // ── options: LLMOption[] | null ───────────────────────────────────────────
  if (body.options !== null && body.options !== undefined) {
    if (!Array.isArray(body.options)) {
      v.push(`options must be an array or null — got: ${typeof body.options}`);
    } else {
      (body.options as unknown[]).forEach((opt, i) => {
        const o = opt as Record<string, unknown>;
        if (typeof o.label !== "string")
          v.push(`options[${i}].label must be a string`);
        if (typeof o.value !== "string")
          v.push(`options[${i}].value must be a string`);
        if (
          o.description !== undefined &&
          o.description !== null &&
          typeof o.description !== "string"
        )
          v.push(
            `options[${i}].description must be string or undefined — got: ${typeof o.description}`,
          );
      });
    }
  }

  // ── summary: LLMSummary | null ────────────────────────────────────────────
  if (body.summary !== null && body.summary !== undefined) {
    if (typeof body.summary !== "object" || Array.isArray(body.summary)) {
      v.push("summary must be an LLMSummary object or null");
    } else {
      const s = body.summary as Record<string, unknown>;
      if (typeof s.title !== "string") v.push("summary.title must be a string");
      if (typeof s.body !== "string") v.push("summary.body must be a string");
      if (s.actions !== undefined && s.actions !== null) {
        if (!Array.isArray(s.actions)) {
          v.push("summary.actions must be an array or undefined");
        } else {
          (s.actions as unknown[]).forEach((a, i) => {
            if (typeof a !== "string")
              v.push(
                `summary.actions[${i}] must be a string — got: ${typeof a}`,
              );
          });
        }
      }
    }
  }

  // ── escalation: LLMEscalation | null ─────────────────────────────────────
  if (body.escalation !== null && body.escalation !== undefined) {
    if (typeof body.escalation !== "object" || Array.isArray(body.escalation)) {
      v.push("escalation must be an LLMEscalation object or null");
    } else {
      const e = body.escalation as Record<string, unknown>;
      if (typeof e.title !== "string")
        v.push("escalation.title must be a string");
      if (typeof e.message !== "string")
        v.push("escalation.message must be a string");
      if (
        e.reason !== undefined &&
        e.reason !== null &&
        typeof e.reason !== "string"
      )
        v.push(
          `escalation.reason must be string or undefined — got: ${typeof e.reason}`,
        );
    }
  }

  // ── glossaryItems: LLMGlossaryItem[] | null | undefined ──────────────────
  if (body.glossaryItems !== null && body.glossaryItems !== undefined) {
    if (!Array.isArray(body.glossaryItems)) {
      v.push(
        `glossaryItems must be an array or null — got: ${typeof body.glossaryItems}`,
      );
    } else {
      (body.glossaryItems as unknown[]).forEach((item, i) => {
        const g = item as Record<string, unknown>;
        if (typeof g.term !== "string")
          v.push(`glossaryItems[${i}].term must be a string`);
        if (typeof g.definition !== "string")
          v.push(`glossaryItems[${i}].definition must be a string`);
      });
    }
  }

  // ── citations: LLMCitation[] (required, not nullable) ────────────────────
  if (!Array.isArray(body.citations)) {
    v.push("citations must be an array (never null)");
  } else {
    (body.citations as unknown[]).forEach((c, i) => {
      const cit = c as Record<string, unknown>;
      if (typeof cit.chunk_id !== "string")
        v.push(`citations[${i}].chunk_id must be a string`);
      if (typeof cit.source !== "string")
        v.push(`citations[${i}].source must be a string`);
    });
  }

  return v;
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
