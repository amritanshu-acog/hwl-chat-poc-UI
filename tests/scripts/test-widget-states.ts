/**
 * test-widget-states.ts
 * ---------------------
 * Task 37 — Widget State Validation
 *
 * Run: bun tests/scripts/test-widget-states.ts
 *
 * Requirements:
 *  - VITE_API_URL in .env
 *  - VITE_DEV_TOKEN in .env (valid JWT)
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
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
  description: string;
  passed: boolean;
  expected: string;
  actual: string;
  note?: string;
};

const results: TestResult[] = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function record(
  id: string,
  description: string,
  passed: boolean,
  expected: string,
  actual: string,
  note?: string,
) {
  const icon = passed ? "✅" : "❌";
  console.log(`${icon}  [${id}] ${description}`);
  if (!passed) {
    console.log(`      Expected : ${expected}`);
    console.log(`      Got      : ${actual}`);
  }
  if (note) console.log(`      Note     : ${note}`);
  results.push({ id, description, passed, expected, actual, note });
}

async function callAnswer(
  message: string,
  sessionId: string | null,
  token: string,
): Promise<{
  status: number;
  body: Record<string, unknown>;
  durationMs: number;
}> {
  const fields: Record<string, string> = { message };
  if (sessionId) fields.session_id = sessionId;

  const start = Date.now();

  const res = await fetch(`${API_URL}/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(fields),
  });

  const durationMs = Date.now() - start;

  let body: Record<string, unknown> = {};
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  return { status: res.status, body, durationMs };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

async function runTests() {
  console.log("\n==============================");
  console.log(" Task 37 — Widget State Tests ");
  console.log("==============================\n");

  // S01 — Valid message returns a structured envelope
  {
    const { status, body } = await callAnswer("Hello", null, DEV_TOKEN!);
    const validActions = ["respond", "clarify", "not_found", "quota_exceeded"];
    const passed =
      status === 200 &&
      typeof body.action === "string" &&
      validActions.includes(body.action as string);
    record(
      "S01",
      "Valid message returns structured envelope with known action",
      passed,
      `status 200 and action is one of: ${validActions.join(", ")}`,
      `status ${status}, action: ${String(body.action)}`,
    );
  }

  // S02 — API responds within 10 seconds (loading state window)
  {
    const { status, durationMs } = await callAnswer("Hello", null, DEV_TOKEN!);
    const passed = status === 200 && durationMs < 10000;
    record(
      "S02",
      "API responds within 10 seconds",
      passed,
      "response in under 10000ms",
      `${durationMs}ms`,
      "Widget should show spinner for exactly this duration",
    );
  }

  // S03 — Invalid token returns 401
  {
    const fakeToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4IiwiZXhwIjoxfQ.fake";
    const { status } = await callAnswer("Hello", null, fakeToken);
    const passed = status === 401;
    record(
      "S03",
      "Invalid token returns 401",
      passed,
      "status 401",
      `status ${status}`,
      "Widget should show UnauthorizedError, not crash",
    );
  }

  // S04 — No token returns 401
  {
    const res = await fetch(`${API_URL}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hello" }),
    });
    const passed = res.status === 401;
    record(
      "S04",
      "Missing token returns 401",
      passed,
      "status 401",
      `status ${res.status}`,
      "Widget should surface auth gate, not blank screen",
    );
  }

  // S05 — QuotaExceededError is defined in errors.ts
  {
    const errorsPath = resolve(process.cwd(), "src/services/errors.ts");
    const content = existsSync(errorsPath)
      ? readFileSync(errorsPath, "utf-8")
      : "";
    const passed = content.includes("QuotaExceededError");
    record(
      "S05",
      "QuotaExceededError is defined in src/services/errors.ts",
      passed,
      "QuotaExceededError class or export found",
      passed ? "found" : "not found",
      "Widget must show quota message on 429, not generic error",
    );
  }

  // S06 — Malformed JSON catch block exists in api.ts
  {
    const apiPath = resolve(process.cwd(), "src/services/api.ts");
    const content = existsSync(apiPath) ? readFileSync(apiPath, "utf-8") : "";
    const passed = content.includes(
      "Server returned an unexpected response format",
    );
    record(
      "S06",
      "Malformed JSON response is caught in api.ts",
      passed,
      "catch block with user-friendly message found in api.ts",
      passed ? "found" : "not found",
      "Widget should show readable error, not raw exception",
    );
  }

  // S07 — Network failure is handled (unreachable host)
  {
    try {
      await fetch(`http://127.0.0.1:1/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEV_TOKEN}`,
        },
        body: JSON.stringify({ message: "Hello" }),
        signal: AbortSignal.timeout(3000),
      });
      record(
        "S07",
        "Network failure throws an error",
        false,
        "fetch to throw on unreachable host",
        "did not throw — unexpected",
      );
    } catch (err) {
      const isExpected =
        err instanceof TypeError ||
        err instanceof Error ||
        (err as Error).name === "TimeoutError";
      record(
        "S07",
        "Network failure throws an error",
        isExpected,
        "TypeError or TimeoutError",
        (err as Error).name,
        "Widget should show friendly error, not crash",
      );
    }
  }

  // S08 — session_id returned on first turn
  {
    const { status, body } = await callAnswer("Hello", null, DEV_TOKEN!);
    const passed =
      status === 200 &&
      typeof body.session_id === "string" &&
      body.session_id.length > 0;
    record(
      "S08",
      "session_id returned on first turn",
      passed,
      "session_id is a non-empty string",
      `session_id: ${String(body.session_id)}`,
      "Widget must store this and send on subsequent turns",
    );
  }

  // S09 — session_id is consistent across turns
  {
    const first = await callAnswer("Hello", null, DEV_TOKEN!);
    const sessionId = first.body.session_id as string | undefined;

    if (!sessionId) {
      record(
        "S09",
        "session_id is consistent across turns",
        false,
        "session_id from first turn",
        "first turn returned no session_id — cannot test continuation",
      );
    } else {
      const second = await callAnswer("Tell me more", sessionId, DEV_TOKEN!);
      const passed =
        second.status === 200 && second.body.session_id === sessionId;
      record(
        "S09",
        "session_id is consistent across turns",
        passed,
        `same session_id: ${sessionId}`,
        `returned: ${String(second.body.session_id)}`,
      );
    }
  }

  // ─── Summary ─────────────────────────────────────────────────────────────

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n──────────────────────────────────────");
  console.log(
    `  Total: ${results.length}   ✅ Passed: ${passed}   ❌ Failed: ${failed}`,
  );
  console.log("──────────────────────────────────────\n");

  // ─── Write report ─────────────────────────────────────────────────────────

  const reportsDir = resolve(process.cwd(), "tests/reports");
  if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true });

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 15);

  const reportPath = `${reportsDir}/widget_states_${timestamp}.json`;

  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        task: "37 — Widget State Validation",
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
