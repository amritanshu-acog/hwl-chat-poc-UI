/**
 * test-golden.ts
 * --------------
 * Task — Golden Set End-to-End Validation
 *
 * Runs all 10 Golden Test scenarios against the hosted /answer API.
 * Produces a detailed JSON + human-readable report for prompt tuning.
 *
 * Run: bun tests/scripts/test-golden.ts
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
  console.error("❌  VITE_API_URL not set");
  process.exit(1);
}
if (!DEV_TOKEN) {
  console.error("❌  VITE_DEV_TOKEN not set");
  process.exit(1);
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Turn = { message: string; expectedAction: string };

type GoldenScenario = {
  id: string;
  title: string;
  description: string;
  turns: Turn[]; // 1 turn = single question; 2 turns = multi-turn
  expectedAction: string; // final expected action
  expectedResponseType: string; // final expected response_type
  expectedChunkIds: string[]; // chunk IDs that SHOULD appear in citations
  expectedKeyPhrases: string[]; // strings that SHOULD appear in the final response text
  expectedComponent: string; // UI component hint (for human review)
  forbiddenPhrases?: string[]; // strings that must NOT appear (negative rules)
  isNotFound?: boolean; // scenario 6 — expect escalation
};

type TurnResult = {
  turnIndex: number;
  message: string;
  status: number;
  durationMs: number;
  response: Record<string, unknown>;
};

type CheckResult = {
  check: string;
  passed: boolean;
  expected: string;
  actual: string;
};

type ScenarioResult = {
  id: string;
  title: string;
  passed: boolean;
  turnResults: TurnResult[];
  checks: CheckResult[];
  finalResponse: Record<string, unknown>;
  diagnostics: string[]; // human-readable failure reasons for prompt tuning
};

// ─── Golden Corpus ────────────────────────────────────────────────────────────

const GOLDEN_SCENARIOS: GoldenScenario[] = [
  {
    id: "G01",
    title: "Scenario 1 — Direct Specific Action (OKTA Auth)",
    description:
      "Single chunk match. Checks if a narrow, specific question maps to exactly one chunk and returns ordered steps.",
    turns: [
      {
        message: "How do I complete authentication on a new phone using OKTA?",
        expectedAction: "respond",
      },
    ],
    expectedAction: "respond",
    expectedResponseType: "answer",
    expectedChunkIds: ["e317f68d-c103-4995-8575-2614c65a1ac1"],
    expectedKeyPhrases: ["Product Engineering"],
    expectedComponent: "<Steps>",
  },

  {
    id: "G02",
    title: "Scenario 2 — Broad Topic (Timecard Clarification)",
    description:
      "Ambiguous query. Engine should trigger clarification with clickable options rather than dumping all timecard content.",
    turns: [
      {
        message: "I need help with timecards.",
        expectedAction: "clarify",
      },
    ],
    expectedAction: "clarify",
    expectedResponseType: "clarify",
    expectedChunkIds: ["19a10751-966c-4063-9075-eedc1ae37bcf"],
    expectedKeyPhrases: ["timecard", "ad hoc", "submitted", "exception"],
    expectedComponent: "<Choices> / options array",
    forbiddenPhrases: [],
  },

  {
    id: "G03",
    title: "Scenario 3 — Complex Compliance Rule (TB Skin Test)",
    description:
      "Specific numeric/regulatory constraint extraction. Must correctly explain the 2-document TB requirement.",
    turns: [
      {
        message: "Why can I only upload 2 TB skin tests instead of 1?",
        expectedAction: "respond",
      },
    ],
    expectedAction: "respond",
    expectedResponseType: "answer",
    expectedChunkIds: ["2461ff8f-e98b-45df-9b66-6cac0f61ed8c"],
    expectedKeyPhrases: ["Upload", "document", "twice"],
    expectedComponent: "<Alert type='warning'> or <Summary>",
  },

  {
    id: "G04",
    title: "Scenario 4 — Error Code Lookup (502 Bad Gateway)",
    description:
      "Alphanumeric error code isolation. Engine must map '502' to the system errors chunk and return diagnosis + steps.",
    turns: [
      {
        message: "I keep getting error 502 Bad Gateway when trying to submit.",
        expectedAction: "respond",
      },
    ],
    expectedAction: "respond",
    expectedResponseType: "answer",
    expectedChunkIds: ["4b764822-1ef5-4487-8c64-eaf1f37d9063"],
    expectedKeyPhrases: ["502", "IT", "server"],
    expectedComponent: "<Alert type='error'> + <Steps>",
  },

  {
    id: "G05",
    title: "Scenario 5 — Duplicate Chunk Merge (Password Reset)",
    description:
      "Two PDFs cover the same process. Engine must deduplicate and produce a single clean step list.",
    turns: [
      {
        message: "How do I reset my HWL password?",
        expectedAction: "respond",
      },
    ],
    expectedAction: "respond",
    expectedResponseType: "answer",
    expectedChunkIds: ["d035e9bf-071c-4c02-aa9e-173fcd069d98", "c16b8991"],
    expectedKeyPhrases: ["password", "reset", "URL", "login"],
    expectedComponent: "<Steps>",
  },

  {
    id: "G06",
    title: "Scenario 6 — Not Found / Graceful Escalation (API Integration)",
    description:
      "Out-of-domain question. No matching chunk exists. Must escalate with a pre-filled draft rather than hallucinating.",
    turns: [
      {
        message:
          "How do I integrate the HWL API into my hospital's custom ATS?",
        expectedAction: "not_found",
      },
    ],
    expectedAction: "not_found",
    expectedResponseType: "notfound",
    expectedChunkIds: [],
    expectedKeyPhrases: ["support", "contact", "API"],
    expectedComponent: "<Escalation>",
    isNotFound: true,
    forbiddenPhrases: ["here are the steps", "you can do this by"],
  },

  {
    id: "G07",
    title: "Scenario 7 — Multi-turn Contextual Follow-up (Tableau)",
    description:
      "Turn 1 asks a specific Tableau question. Turn 2 asks a vague follow-up ('in there'). Engine must resolve the context.",
    turns: [
      {
        message: "How do I export job needs using Tableau?",
        expectedAction: "respond",
      },
      {
        message: "What other reports are available in there?",
        expectedAction: "respond",
      },
    ],
    expectedAction: "respond",
    expectedResponseType: "answer",
    expectedChunkIds: ["61af1f57-1303-474c-917c-b6f2c6de8fff"],
    expectedKeyPhrases: ["BI Portal", "report", "agency"],
    expectedComponent: "<Checklist>",
  },

  {
    id: "G08",
    title: "Scenario 8 — Conditional Branch (Early Termination Timecards)",
    description:
      "Deep conditional logic. Engine must surface the correct workaround for assignments that ended early.",
    turns: [
      {
        message:
          "How do I handle timecards for an assignment that ended early?",
        expectedAction: "respond",
      },
    ],
    expectedAction: "respond",
    expectedResponseType: "answer",
    expectedChunkIds: ["9062c55e-de1e-486b-9a29-7b5f8f336a88"],
    expectedKeyPhrases: ["offline agreement", "adjustment"],
    expectedComponent: "<Summary> or <Steps>",
  },

  {
    id: "G09",
    title: "Scenario 9 — Negative Constraint (Excel in Expense Invoice)",
    description:
      "LLM must honour a strict negative rule. Answer must clearly refuse and explain Excel is not allowed.",
    turns: [
      {
        message: "Can I use Excel sheets in an expense invoice?",
        expectedAction: "respond",
      },
    ],
    expectedAction: "respond",
    expectedResponseType: "answer",
    expectedChunkIds: ["2646c509-6723-4d89-8401-55c7833acbbe"],
    expectedKeyPhrases: ["Excel", "cannot", "not"],
    expectedComponent: "<Alert type='error'> or <Alert type='warning'>",
    forbiddenPhrases: ["yes, you can"],
  },

  {
    id: "G10",
    title: "Scenario 10 — Status Mapping (Candidate Missing from Onboarding)",
    description:
      "Abstract frustration must be semantically mapped to the Compliance visibility chunk. Correct status explanation required.",
    turns: [
      {
        message: "Why is my candidate not showing up for onboarding anymore?",
        expectedAction: "respond",
      },
    ],
    expectedAction: "respond",
    expectedResponseType: "answer",
    expectedChunkIds: ["2461ff8f-e98b-45df-9b66-6cac0f61ed8c"],
    expectedKeyPhrases: ["onboarding", "assignment", "offline"],
    expectedComponent: "<Summary>",
  },
];

// ─── API Helpers ──────────────────────────────────────────────────────────────

async function callAnswer(
  message: string,
  sessionId?: string,
): Promise<{
  status: number;
  durationMs: number;
  body: Record<string, unknown>;
}> {
  const start = Date.now();
  const res = await fetch(`${API_URL}/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEV_TOKEN}`,
    },
    body: JSON.stringify({
      message,
      ...(sessionId ? { session_id: sessionId } : {}),
    }),
  });
  const durationMs = Date.now() - start;

  let body: Record<string, unknown> = {};
  try {
    body = await res.json();
  } catch {
    /* ignore */
  }

  return { status: res.status, durationMs, body };
}

// ─── Evaluation ───────────────────────────────────────────────────────────────

/**
 * Extract all visible text from the response for phrase matching.
 * Covers: intro, title, summary.body, steps[].body, items[], escalation.message, followUp
 */
function extractResponseText(body: Record<string, unknown>): string {
  const parts: string[] = [];

  for (const field of ["title", "intro", "followUp", "chart"]) {
    if (typeof body[field] === "string") parts.push(body[field] as string);
  }

  const summary = body.summary as Record<string, unknown> | null;
  if (summary) {
    if (typeof summary.title === "string") parts.push(summary.title);
    if (typeof summary.body === "string") parts.push(summary.body);
  }

  const escalation = body.escalation as Record<string, unknown> | null;
  if (escalation) {
    if (typeof escalation.title === "string") parts.push(escalation.title);
    if (typeof escalation.message === "string") parts.push(escalation.message);
  }

  const alert = body.alert as Record<string, unknown> | null;
  if (alert) {
    if (typeof alert.title === "string") parts.push(alert.title);
    if (typeof alert.body === "string") parts.push(alert.body);
  }

  if (Array.isArray(body.steps)) {
    for (const s of body.steps as Record<string, unknown>[]) {
      if (typeof s.title === "string") parts.push(s.title);
      if (typeof s.body === "string") parts.push(s.body);
    }
  }

  if (Array.isArray(body.items)) {
    for (const item of body.items) {
      if (typeof item === "string") parts.push(item);
    }
  }

  if (Array.isArray(body.options)) {
    for (const o of body.options as Record<string, unknown>[]) {
      if (typeof o.label === "string") parts.push(o.label);
      if (typeof o.description === "string") parts.push(o.description);
    }
  }

  if (Array.isArray(body.glossaryItems)) {
    for (const g of body.glossaryItems as Record<string, unknown>[]) {
      if (typeof g.term === "string") parts.push(g.term);
      if (typeof g.definition === "string") parts.push(g.definition);
    }
  }

  return parts.join(" ").toLowerCase();
}

function extractCitationIds(body: Record<string, unknown>): string[] {
  if (!Array.isArray(body.citations)) return [];
  return (body.citations as Record<string, unknown>[])
    .map((c) => String(c.chunk_id ?? ""))
    .filter(Boolean);
}

function evaluateScenario(
  scenario: GoldenScenario,
  turnResults: TurnResult[],
): { checks: CheckResult[]; diagnostics: string[] } {
  const checks: CheckResult[] = [];
  const diagnostics: string[] = [];

  // Final turn response
  const lastTurn = turnResults[turnResults.length - 1];
  const body = lastTurn.response;
  const responseText = extractResponseText(body);
  const citationIds = extractCitationIds(body);

  // ── 1. HTTP status ─────────────────────────────────────────────────────────
  const statusOk = lastTurn.status === 200;
  checks.push({
    check: "HTTP status is 200",
    passed: statusOk,
    expected: "200",
    actual: String(lastTurn.status),
  });
  if (!statusOk)
    diagnostics.push(`API returned ${lastTurn.status} — check auth or server.`);

  // ── 2. action ──────────────────────────────────────────────────────────────
  const actionMatch = body.action === scenario.expectedAction;
  checks.push({
    check: `action = "${scenario.expectedAction}"`,
    passed: actionMatch,
    expected: scenario.expectedAction,
    actual: String(body.action ?? "missing"),
  });
  if (!actionMatch)
    diagnostics.push(
      `WRONG ACTION: got "${body.action}" expected "${scenario.expectedAction}". ` +
        `Check triage prompt — routing logic may be misclassifying this query.`,
    );

  // ── 3. response_type ───────────────────────────────────────────────────────
  const rtMatch = body.response_type === scenario.expectedResponseType;
  checks.push({
    check: `response_type = "${scenario.expectedResponseType}"`,
    passed: rtMatch,
    expected: scenario.expectedResponseType,
    actual: String(body.response_type ?? "missing"),
  });
  if (!rtMatch)
    diagnostics.push(
      `WRONG RESPONSE_TYPE: got "${body.response_type}" expected "${scenario.expectedResponseType}". ` +
        `Formatter may be selecting the wrong envelope template.`,
    );

  // ── 4. expected chunk IDs present in citations ─────────────────────────────
  if (scenario.expectedChunkIds.length > 0) {
    for (const chunkId of scenario.expectedChunkIds) {
      // partial match — some IDs in the PDF are truncated
      const found = citationIds.some((id) =>
        id.startsWith(chunkId.slice(0, 8)),
      );
      checks.push({
        check: `citation contains chunk "${chunkId.slice(0, 8)}..."`,
        passed: found,
        expected: chunkId,
        actual:
          citationIds.length > 0 ? citationIds.join(", ") : "(no citations)",
      });
      if (!found)
        diagnostics.push(
          `MISSING CITATION: chunk "${chunkId}" not found in citations [${citationIds.join(", ")}]. ` +
            `Retrieval may have missed the target chunk — check embeddings or similarity threshold.`,
        );
    }
  } else if (scenario.isNotFound) {
    const noCitations = citationIds.length === 0;
    checks.push({
      check: "no citations (not_found scenario)",
      passed: noCitations,
      expected: "(empty)",
      actual: citationIds.length > 0 ? citationIds.join(", ") : "(empty)",
    });
    if (!noCitations)
      diagnostics.push(
        `NOT_FOUND scenario but citations were returned: [${citationIds.join(", ")}]. ` +
          `Retrieval may be returning low-relevance chunks instead of failing gracefully.`,
      );
  }

  // ── 5. expected key phrases ────────────────────────────────────────────────
  for (const phrase of scenario.expectedKeyPhrases) {
    const found = responseText.includes(phrase.toLowerCase());
    checks.push({
      check: `response contains key phrase: "${phrase}"`,
      passed: found,
      expected: `"${phrase}" in response text`,
      actual: found ? "✓ found" : "✗ not found",
    });
    if (!found)
      diagnostics.push(
        `MISSING KEY PHRASE: "${phrase}" not found in any response field. ` +
          `The LLM may have paraphrased away critical content, or the wrong chunk was used.`,
      );
  }

  // ── 6. forbidden phrases ───────────────────────────────────────────────────
  for (const phrase of scenario.forbiddenPhrases ?? []) {
    const found = responseText.includes(phrase.toLowerCase());
    checks.push({
      check: `response does NOT contain forbidden: "${phrase}"`,
      passed: !found,
      expected: `"${phrase}" absent`,
      actual: found ? "✗ FOUND (bad)" : "✓ absent",
    });
    if (found)
      diagnostics.push(
        `FORBIDDEN PHRASE FOUND: "${phrase}" — LLM may be hallucinating or ignoring negative constraints.`,
      );
  }

  // ── 7. multi-turn: all intermediate turns responded ───────────────────────
  if (turnResults.length > 1) {
    for (let i = 0; i < turnResults.length - 1; i++) {
      const tr = turnResults[i];
      const turn = scenario.turns[i];
      const ok =
        tr.status === 200 && tr.response.action === turn.expectedAction;
      checks.push({
        check: `Turn ${i + 1} action = "${turn.expectedAction}"`,
        passed: ok,
        expected: turn.expectedAction,
        actual:
          tr.status !== 200
            ? `HTTP ${tr.status}`
            : String(tr.response.action ?? "missing"),
      });
      if (!ok)
        diagnostics.push(
          `MULTI-TURN FAILURE at turn ${i + 1}: expected action "${turn.expectedAction}" ` +
            `got "${tr.response.action}". Conversation history may not be threading correctly.`,
        );
    }
  }

  // ── 8. response not empty ─────────────────────────────────────────────────
  const hasContent = responseText.trim().length > 10;
  checks.push({
    check: "response has non-trivial content",
    passed: hasContent,
    expected: "> 10 chars of text",
    actual: `${responseText.trim().length} chars`,
  });
  if (!hasContent)
    diagnostics.push(
      `EMPTY RESPONSE: response text is trivially short (${responseText.trim().length} chars). ` +
        `LLM may have returned a null/empty body or formatter collapsed all fields.`,
    );

  return { checks, diagnostics };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function runGoldenTests() {
  console.log("\n════════════════════════════════════════════");
  console.log("  Golden Test Suite — End-to-End Validation");
  console.log("════════════════════════════════════════════\n");

  const scenarioResults: ScenarioResult[] = [];

  for (const scenario of GOLDEN_SCENARIOS) {
    console.log(`\n▶  [${scenario.id}] ${scenario.title}`);
    console.log(`   ${scenario.description}`);
    console.log("   ─────────────────────────────────────────────");

    const turnResults: TurnResult[] = [];
    let sessionId: string | undefined;

    // Execute each turn (multi-turn shares session_id)
    for (let t = 0; t < scenario.turns.length; t++) {
      const turn = scenario.turns[t];
      console.log(`   Turn ${t + 1}: "${turn.message}"`);

      const { status, durationMs, body } = await callAnswer(
        turn.message,
        sessionId,
      );

      // Capture session_id from first turn for continuity
      if (t === 0 && typeof body.session_id === "string") {
        sessionId = body.session_id;
      }

      console.log(
        `           → status: ${status}  |  action: ${body.action ?? "?"}  |  ` +
          `response_type: ${body.response_type ?? "?"}  |  ${durationMs}ms`,
      );

      turnResults.push({
        turnIndex: t + 1,
        message: turn.message,
        status,
        durationMs,
        response: body,
      });
    }

    // Evaluate
    const { checks, diagnostics } = evaluateScenario(scenario, turnResults);
    const passed = checks.every((c) => c.passed);

    const icon = passed ? "✅" : "❌";
    console.log(`\n   ${icon}  Result: ${passed ? "PASSED" : "FAILED"}`);

    const failedChecks = checks.filter((c) => !c.passed);
    if (failedChecks.length > 0) {
      console.log(`\n   Failed checks (${failedChecks.length}):`);
      for (const fc of failedChecks) {
        console.log(`      ⚠️   ${fc.check}`);
        console.log(`            expected : ${fc.expected}`);
        console.log(`            actual   : ${fc.actual}`);
      }
      console.log(`\n   Diagnostics for prompt tuning:`);
      for (const d of diagnostics) {
        console.log(`      🔍  ${d}`);
      }
    }

    scenarioResults.push({
      id: scenario.id,
      title: scenario.title,
      passed,
      turnResults,
      checks,
      finalResponse: turnResults[turnResults.length - 1].response,
      diagnostics,
    });
  }

  // ─── Summary ───────────────────────────────────────────────────────────────

  const totalPassed = scenarioResults.filter((r) => r.passed).length;
  const totalFailed = scenarioResults.filter((r) => !r.passed).length;

  console.log("\n\n════════════════════════════════════════════");
  console.log("  Summary");
  console.log("════════════════════════════════════════════");
  console.log(`  Total   : ${scenarioResults.length}`);
  console.log(`  ✅ Passed: ${totalPassed}`);
  console.log(`  ❌ Failed: ${totalFailed}`);
  console.log("────────────────────────────────────────────");
  for (const r of scenarioResults) {
    const icon = r.passed ? "✅" : "❌";
    console.log(`  ${icon}  [${r.id}] ${r.title}`);
    if (!r.passed) {
      const fc = r.checks.filter((c) => !c.passed);
      console.log(
        `         ${fc.length} check(s) failed: ${fc.map((c) => c.check).join(" | ")}`,
      );
    }
  }
  console.log("════════════════════════════════════════════\n");

  // ─── Write report ──────────────────────────────────────────────────────────

  const reportsDir = resolve(process.cwd(), "tests/reports");
  if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true });

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 15);
  const reportPath = `${reportsDir}/golden_${timestamp}.json`;

  const report = {
    task: "Golden Set — End-to-End Validation",
    timestamp: new Date().toISOString(),
    summary: {
      total: scenarioResults.length,
      passed: totalPassed,
      failed: totalFailed,
    },
    scenarios: scenarioResults.map((r) => ({
      id: r.id,
      title: r.title,
      passed: r.passed,
      checks: r.checks,
      diagnostics: r.diagnostics,
      turns: r.turnResults.map((t) => ({
        turnIndex: t.turnIndex,
        message: t.message,
        status: t.status,
        durationMs: t.durationMs,
        action: t.response.action,
        response_type: t.response.response_type,
        session_id: t.response.session_id,
        citations: t.response.citations,
        fullResponse: t.response, // ← complete raw payload for prompt tuning
      })),
    })),
  };

  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄  Report written to: ${reportPath}\n`);

  if (totalFailed > 0) process.exit(1);
}

runGoldenTests().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
