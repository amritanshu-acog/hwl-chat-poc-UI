/**
 * dummy.ts
 * -----------
 * Static mock responses used when DEMO_MODE is enabled (no real API needed).
 * Add / edit entries here — the chat engine picks the best match automatically.
 *
 * Format: { keywords[], response: ResponseComponent[] }
 * The engine scores each entry by counting keyword hits in the user's message.
 */

import type { ResponseComponent } from "./types";

export interface DummyEntry {
  keywords: string[];
  // Rich structured response
  response: ResponseComponent[];
}

export const DUMMY_QA: DummyEntry[] = [
  /* ── 1. Requisition ─────────────────────────────────────────── */
  {
    keywords: ["requisition", "create", "how", "raise", "new"],
    response: [
      {
        type: "text",
        data: {
          body: "Here's how to create a new requisition in the system:",
        },
      },
      {
        type: "steps",
        data: {
          title: "Creating a Requisition",
          steps: [
            {
              title: "Navigate to Procurement",
              body: "Open the main menu and select **Procurement → New Requisition**.",
            },
            {
              title: "Fill in the Details",
              body: "Enter the item description, quantity, estimated cost, and required-by date.",
            },
            {
              title: "Attach Supporting Documents",
              body: "Upload any quotes or justification documents using the paperclip icon.",
            },
            {
              title: "Submit for Approval",
              body: "Click **Submit** — the request is automatically routed to your line manager.",
            },
          ],
          followUp:
            "You'll receive an email confirmation once the requisition is approved.",
        },
      },
    ],
  },

  /* ── 2. Onboarding ───────────────────────────────────────────── */
  {
    keywords: [
      "onboard",
      "onboarding",
      "new employee",
      "joining",
      "hire",
      "start",
    ],
    response: [
      {
        type: "alert",
        data: {
          severity: "info",
          title: "New Employee Onboarding",
          body: "The following checklist covers the standard onboarding steps for all new starters.",
        },
      },
      {
        type: "checklist",
        data: {
          title: "Onboarding Checklist",
          items: [
            {
              id: "it",
              label: "IT Setup — laptop, email, system access",
              checked: false,
            },
            {
              id: "hr",
              label:
                "HR Paperwork — contract, bank details, emergency contacts",
              checked: false,
            },
            {
              id: "badge",
              label: "Security Badge — collect from reception on Day 1",
              checked: false,
            },
            {
              id: "buddy",
              label: "Buddy Introduction — meet your assigned buddy",
              checked: false,
            },
            {
              id: "train",
              label:
                "Mandatory Training — complete all Day 1 e-learning modules",
              checked: false,
            },
          ],
        },
      },
    ],
  },

  /* ── 3. Leave / Time-off ─────────────────────────────────────── */
  {
    keywords: [
      "leave",
      "holiday",
      "time off",
      "annual leave",
      "vacation",
      "request leave",
    ],
    response: [
      {
        type: "text",
        data: {
          body: "You can request leave directly from the HR portal. Here are the options available:",
        },
      },
      {
        type: "choices",
        data: {
          question: "What type of leave do you need?",
          options: [
            {
              label: "Annual Leave",
              value: "annual",
              description: "Book holiday from your entitlement",
            },
            {
              label: "Sick Leave",
              value: "sick",
              description: "Report absence due to illness",
            },
            {
              label: "Parental Leave",
              value: "parental",
              description: "Maternity, paternity, or adoption leave",
            },
            {
              label: "Other",
              value: "other",
              description: "Special leave, unpaid leave, etc.",
            },
          ],
        },
      },
    ],
  },
];

/**
 * Scores a user message against a DummyEntry by counting keyword hits.
 */
function scoreEntry(message: string, entry: DummyEntry): number {
  const lower = message.toLowerCase();
  return entry.keywords.reduce(
    (acc, kw) => acc + (lower.includes(kw.toLowerCase()) ? 1 : 0),
    0,
  );
}

/**
 * Returns the best-matching dummy response for the given user message,
 * or a friendly fallback if nothing matches.
 */
export function getDummyResponse(message: string): ResponseComponent[] {
  let best: DummyEntry | null = null;
  let bestScore = 0;

  for (const entry of DUMMY_QA) {
    const score = scoreEntry(message, entry);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  if (best && bestScore > 0) return best.response;

  // Generic fallback
  return [
    {
      type: "text",
      data: {
        body: "I don't have a specific answer for that yet, but I'm here to help! Try asking about **requisitions**, **onboarding**, or **leave requests**.",
      },
    },
    {
      type: "choices",
      data: {
        question: "Or pick a topic to get started:",
        options: [
          {
            label: "How do I create a requisition?",
            value: "How do I create a requisition?",
          },
          {
            label: "Explain the onboarding process",
            value: "Explain the onboarding process",
          },
          {
            label: "How do I request leave?",
            value: "How do I request leave?",
          },
        ],
      },
    },
  ];
}
