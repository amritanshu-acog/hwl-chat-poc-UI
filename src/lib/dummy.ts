/**
 * dummy2.ts
 * ---------
 * 12 entries — all 6 response_types used twice each (faq counts as one).
 * Every MDX component is used exactly once across the set.
 *
 * Components used:
 *  Alert         → entry 2  (initial setup — warning)
 *  Steps         → entry 2  (initial setup)
 *  Checklist     → entry 4  (propose candidate)
 *  Choices       → entry 5  (expense type)
 *  Escalation    → entry 11 (notfound — timesheet)
 *  Summary       → entry 7  (onboarding funnel summary)
 *  Mermaid       → entry 8  (timecard exception flow)
 *  FunnelChart   → entry 7  (onboarding stages)
 *  Faq           → entry 9  (common errors)
 *  QuotaExceeded → entry 10 (quota_exceeded)
 */

import type { LLMResponse } from "../types/llmResponse";

export interface DummyEntry {
  keywords: string[];
  response: LLMResponse;
}

export const DUMMY_QA2: DummyEntry[] = [
  /* ══════════════════════════════════════════════════════════════
     1. CLARIFY — Greeting
     Component: Choices (via options field → rendered as <Choices>)
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: ["hi", "hello", "hey", "help", "what can you do"],
    response: {
      action: "clarify",
      response_type: "clarify",
      alert: null,
      title: "Hi there! What do you need help with?",
      intro:
        "I can help you with HWL platform tasks. What are you trying to do?",
      steps: null,
      items: null,
      options: [
        {
          label: "Set up my HWL account",
          value: "initial setup",
          description: "First-time login, password reset, facility mapping",
        },
        {
          label: "Propose a candidate",
          value: "propose candidate",
          description: "Submit a candidate against an open requisition",
        },
        {
          label: "Manage timecards",
          value: "timecard status",
          description: "Create, edit, or handle timecard exceptions",
        },
        {
          label: "View invoices",
          value: "view invoices",
          description: "Find and manage timecard or expense invoices",
        },
      ],
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp: null,
      citations: [],
      faqItems: null,
      quotaMessage: null,
    },
  },

  /* ══════════════════════════════════════════════════════════════
     2. ANSWER — Initial Setup
     Component: Alert + Steps
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: [
      "initial setup",
      "first time login",
      "reset password",
      "setup account",
    ],
    response: {
      action: "respond",
      response_type: "answer",
      alert: {
        severity: "warning",
        title: "Job Group must be selected",
        body: "After logging in, you must select a Job Group from the Dashboard or the system will not display relevant requisitions and resources.",
      },
      title: "Initial HWL Account Setup",
      intro: "Follow these steps the first time you log in to HWL.",
      steps: [
        {
          title: "Access & Reset Password",
          body: "Open the URL from your welcome email. Click **Reset Password** and follow the prompts to set a new password.",
        },
        {
          title: "Select Job Group",
          body: "From the Dashboard, find the **Select Job Group** dropdown on the right side and choose the appropriate group.",
        },
        {
          title: "Map Your Facilities",
          body: "Go to **Settings > Self Facility/Location Mapping**. Mark facilities to include with a green check or exclude with a red X. Click to save — no further action needed.",
        },
        {
          title: "Set Email Preferences",
          body: "Go to **Settings > Email Preference**. Choose **Default to Select All Job Titles** or configure manually under the **Email Subscribed** tab.",
        },
      ],
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp:
        "Once these steps are done, your dashboard will display the correct requisitions and staff pool data.",
      citations: [
        {
          chunk_id: "e32995ae-c3e2-4d66-a773-18d458fcdd8f",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
      faqItems: null,
      quotaMessage: null,
    },
  },

  /* ══════════════════════════════════════════════════════════════
     3. CLARIFY — Timecard status (which status are you in?)
     Component: Choices (via options)
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: [
      "timecard status",
      "timecard help",
      "timecard issue",
      "my timecard",
    ],
    response: {
      action: "clarify",
      response_type: "clarify",
      alert: null,
      title: "What status is the timecard in?",
      intro:
        "The steps depend on the current status of the timecard. Which applies?",
      steps: null,
      items: null,
      options: [
        {
          label: "Submitted",
          value: "timecard submitted",
          description: "Review, edit, or reject the timecard",
        },
        {
          label: "Approved",
          value: "timecard approved",
          description: "Create an exception for corrections",
        },
        {
          label: "Exception IN",
          value: "timecard exception in",
          description: "Respond to facility comments",
        },
        {
          label: "Invoiced",
          value: "timecard invoiced",
          description: "Contact HWL Account Manager",
        },
      ],
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp: null,
      citations: [
        {
          chunk_id: "36dff967-dc09-43cf-bdec-a4cbae3a4059",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
      faqItems: null,
      quotaMessage: null,
    },
  },

  /* ── Sub-flow: Timecard Submitted ───────────────────────────── */
  {
    keywords: ["timecard submitted"],
    response: {
      action: "respond",
      response_type: "answer",
      alert: null,
      title: "Timecard in Submitted Status",
      intro: "Review the timecard and either edit or reject it.",
      steps: [
        {
          title: "Review the Timecard",
          body: "Check shift date, facility, department, candidate, and time punches.",
        },
        {
          title: "Edit if Needed",
          body: "Update time punches, department, or mark as non-billable. Click **Save**.",
        },
        {
          title: "Or Reject",
          body: "Click **Reject**, provide a reason, and confirm. The timecard will be sent back.",
        },
        {
          title: "Approve",
          body: "Once correct, approve the timecard. It moves to the **Approved** tab for invoicing.",
        },
      ],
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp: null,
      citations: [
        {
          chunk_id: "36dff967-dc09-43cf-bdec-a4cbae3a4059",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
      faqItems: null,
      quotaMessage: null,
    },
  },

  /* ── Sub-flow: Timecard Approved ─────────────────────────────── */
  {
    keywords: ["timecard approved"],
    response: {
      action: "respond",
      response_type: "answer",
      alert: null,
      title: "Timecard in Approved Status",
      intro: "If corrections are needed after approval, raise an exception.",
      steps: [
        {
          title: "Open the Timecard",
          body: "Locate the timecard in the **Approved** tab.",
        },
        {
          title: "Create an Exception",
          body: "Update time punches or department, upload supporting documents, and add comments.",
        },
        {
          title: "Submit",
          body: "Submit the exception for facility review. The timecard moves to **Exception OUT**.",
        },
      ],
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp: "Monitor the Exception OUT tab for the facility's response.",
      citations: [
        {
          chunk_id: "36dff967-dc09-43cf-bdec-a4cbae3a4059",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
      faqItems: null,
      quotaMessage: null,
    },
  },

  /* ── Sub-flow: Timecard Exception IN ────────────────────────── */
  {
    keywords: ["timecard exception in"],
    response: {
      action: "respond",
      response_type: "answer",
      alert: null,
      title: "Timecard in Exception IN Status",
      intro: "The facility has responded to your exception. You need to act.",
      steps: [
        {
          title: "Review Facility Comments",
          body: "Open the timecard and read the facility's proposed changes or clarification requests.",
        },
        {
          title: "Update the Timecard",
          body: "Update time punches, department, or upload additional documents as needed.",
        },
        {
          title: "Resubmit",
          body: "Click **Resubmit Exception**. The timecard moves back to **Exception OUT** for facility review.",
        },
      ],
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp: null,
      citations: [
        {
          chunk_id: "36dff967-dc09-43cf-bdec-a4cbae3a4059",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
      faqItems: null,
      quotaMessage: null,
    },
  },

  /* ── Sub-flow: Timecard Invoiced ─────────────────────────────── */
  {
    keywords: ["timecard invoiced"],
    response: {
      action: "respond",
      response_type: "answer",
      alert: {
        severity: "warning",
        title: "No self-service corrections at this stage",
        body: "Once a timecard is invoiced, you cannot raise exceptions yourself. You must contact your HWL Account Manager.",
      },
      title: "Timecard in Invoiced Status",
      intro:
        "Corrections to invoiced timecards must go through your HWL Account Manager.",
      steps: null,
      items: null,
      options: null,
      summary: null,
      escalation: {
        title: "Contact your Account Manager",
        message:
          "Reach out to your HWL Account Manager with the timecard details and the correction required.",
        reason: "Invoiced timecards cannot be edited directly in the platform.",
      },
      chart: null,
      stages: null,
      followUp: null,
      citations: [
        {
          chunk_id: "36dff967-dc09-43cf-bdec-a4cbae3a4059",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
      faqItems: null,
      quotaMessage: null,
    },
  },

  /* ══════════════════════════════════════════════════════════════
     4. ANSWER — Propose Candidate
     Component: Checklist (via items)
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: [
      "propose a candidate",
      "submit candidate",
      "propose to requisition",
    ],
    response: {
      action: "respond",
      response_type: "answer",
      alert: {
        severity: "warning",
        title: "Already in staff pool",
        body: "The candidate must already be in the Staff Pool before you can propose them.",
      },
      title: "Propose a Candidate to a Requisition",
      intro: null,
      steps: null,
      items: [
        "Navigate to the Requisitions page from the HWL menu.",
        "Locate the desired requisition and click Propose Candidate.",
        "Select the candidate from the Staff Pool.",
        "Complete all proposal details — rates, availability, and attestations.",
        "Submit the proposal. The candidate will move to In Screening status.",
      ],
      options: null,
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp:
        "After submission, monitor the Candidate Status column on the Requisitions page for onboarding progress.",
      citations: [
        {
          chunk_id: "dd741cb7-35a8-4b5c-b649-685536919389",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
      faqItems: null,
      quotaMessage: null,
    },
  },

  /* ══════════════════════════════════════════════════════════════
     5. OPTIONS — Expense type
     Component: Choices (via options)
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: [
      "add expense",
      "submit expense",
      "expense type",
      "candidate expense",
    ],
    response: {
      action: "respond",
      response_type: "options",
      alert: null,
      title: "What type of expense are you submitting?",
      intro: "Select the expense type to see the correct steps.",
      steps: null,
      items: null,
      options: [
        {
          label: "Mileage",
          value: "submit mileage expense",
          description: "Enter mileage details and upload supporting documents",
        },
        {
          label: "Airfare",
          value: "submit airfare expense",
          description: "Enter flight details and upload receipts",
        },
        {
          label: "Boarding",
          value: "submit boarding expense",
          description: "Enter housing details and upload receipts",
        },
        {
          label: "Incidental",
          value: "submit incidental expense",
          description: "For expenses not covered by other categories",
        },
      ],
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp: null,
      citations: [
        {
          chunk_id: "98d55dd3-deca-42a7-9860-97984156acf5",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
      faqItems: null,
      quotaMessage: null,
    },
  },

  /* ── Sub-flow: Submit Mileage Expense ───────────────────────── */
  {
    keywords: ["submit mileage expense"],
    response: {
      action: "respond",
      response_type: "answer",
      alert: null,
      title: "Submit a Mileage Expense",
      intro: null,
      steps: [
        {
          title: "Open Expenses",
          body: "From the HWL menu, navigate to **Expenses** and click **Add Expense**.",
        },
        {
          title: "Select Mileage",
          body: "Choose **Mileage** as the expense type. Select the facility and candidate.",
        },
        {
          title: "Enter Details",
          body: "Fill in all required fields (*) and upload supporting documents.",
        },
        {
          title: "Calculate & Submit",
          body: "Click **Calculate Amount to be Paid**, then **Submit**. The expense appears in the Submitted tab.",
        },
      ],
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp: null,
      citations: [
        {
          chunk_id: "98d55dd3-deca-42a7-9860-97984156acf5",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
      faqItems: null,
      quotaMessage: null,
    },
  },

  /* ── Sub-flow: Submit Airfare Expense ───────────────────────── */
  {
    keywords: ["submit airfare expense"],
    response: {
      action: "respond",
      response_type: "answer",
      alert: null,
      title: "Submit an Airfare Expense",
      intro: null,
      steps: [
        {
          title: "Open Expenses",
          body: "From the HWL menu, navigate to **Expenses** and click **Add Expense**.",
        },
        {
          title: "Select Airfare",
          body: "Choose **Airfare** as the expense type. Select the facility and candidate.",
        },
        {
          title: "Enter Flight Details",
          body: "Fill in all required fields (*) and upload flight receipts.",
        },
        {
          title: "Calculate & Submit",
          body: "Click **Calculate Amount to be Paid**, then **Submit**.",
        },
      ],
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp: null,
      citations: [
        {
          chunk_id: "98d55dd3-deca-42a7-9860-97984156acf5",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
      faqItems: null,
      quotaMessage: null,
    },
  },

  /* ── Sub-flow: Submit Boarding Expense ──────────────────────── */
  {
    keywords: ["submit boarding expense"],
    response: {
      action: "respond",
      response_type: "answer",
      alert: null,
      title: "Submit a Boarding Expense",
      intro: null,
      steps: [
        {
          title: "Open Expenses",
          body: "From the HWL menu, navigate to **Expenses** and click **Add Expense**.",
        },
        {
          title: "Select Boarding",
          body: "Choose **Boarding** as the expense type. Select the facility and candidate.",
        },
        {
          title: "Enter Housing Details",
          body: "Fill in all required fields (*) and upload housing receipts.",
        },
        {
          title: "Calculate & Submit",
          body: "Click **Calculate Amount to be Paid**, then **Submit**.",
        },
      ],
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp: null,
      citations: [
        {
          chunk_id: "98d55dd3-deca-42a7-9860-97984156acf5",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
      faqItems: null,
      quotaMessage: null,
    },
  },

  /* ── Sub-flow: Submit Incidental Expense ────────────────────── */
  {
    keywords: ["submit incidental expense"],
    response: {
      action: "respond",
      response_type: "answer",
      alert: null,
      title: "Submit an Incidental Expense",
      intro: null,
      steps: [
        {
          title: "Open Expenses",
          body: "From the HWL menu, navigate to **Expenses** and click **Add Expense**.",
        },
        {
          title: "Select Incidental",
          body: "Choose **Incidental** as the expense type. Select the facility and candidate.",
        },
        {
          title: "Enter Details",
          body: "Fill in all required fields (*) and upload any supporting documents.",
        },
        {
          title: "Calculate & Submit",
          body: "Click **Calculate Amount to be Paid**, then **Submit**.",
        },
      ],
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp: null,
      citations: [
        {
          chunk_id: "98d55dd3-deca-42a7-9860-97984156acf5",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
      faqItems: null,
      quotaMessage: null,
    },
  },

  /* ══════════════════════════════════════════════════════════════
     6. OPTIONS — Invoice type
     Component: Choices (via options)
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: ["view invoices", "find invoice", "invoice help"],
    response: {
      action: "respond",
      response_type: "options",
      alert: null,
      title: "Which type of invoice do you need?",
      intro: "Invoices are split into Timecard and Expense categories.",
      steps: null,
      items: null,
      options: [
        {
          label: "Timecard Invoices",
          value: "timecard invoices",
          description: "Invoices generated from approved timecards",
        },
        {
          label: "Expense Invoices",
          value: "expense invoices",
          description: "Invoices generated from approved expenses",
        },
      ],
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp: null,
      citations: [
        {
          chunk_id: "359d528e-3d5a-4308-878c-7b37f7884afe",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
      faqItems: null,
      quotaMessage: null,
    },
  },

  /* ── Sub-flow: Timecard Invoices ────────────────────────────── */
  {
    keywords: ["timecard invoices"],
    response: {
      action: "respond",
      response_type: "answer",
      alert: null,
      title: "Timecard Invoices",
      intro:
        "Timecard invoices are generated from approved timecards and organised by processing stage.",
      steps: [
        {
          title: "Open Timecard Invoices",
          body: "From the HWL menu, select **Invoices > Timecard Invoices**.",
        },
        {
          title: "Filter to Find Your Invoice",
          body: "Use Reference Date, System, Billing Period, or Invoice # to narrow results.",
        },
        {
          title: "Take Action",
          body: "Click the three dots on the right of the invoice to add comments, upload documents, or view timecard details.",
        },
        {
          title: "Incorrect Details?",
          body: "Contact the HWL Billing team at billing@hwlworks.com to advise on corrections.",
        },
      ],
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp: null,
      citations: [
        {
          chunk_id: "59b6a481-86c4-47ef-b256-cca54a306842",
          source: "HWL Agency_Invoices V3.pdf",
        },
      ],
      faqItems: null,
      quotaMessage: null,
    },
  },

  /* ── Sub-flow: Expense Invoices ──────────────────────────────── */
  {
    keywords: ["expense invoices"],
    response: {
      action: "respond",
      response_type: "answer",
      alert: null,
      title: "Expense Invoices",
      intro:
        "Expense invoices are generated from approved expenses during the billing cycle.",
      steps: [
        {
          title: "Open Expense Invoices",
          body: "From the HWL menu, select **Invoices > Expense Invoices**.",
        },
        {
          title: "Filter to Find Your Invoice",
          body: "Use Reference Date, System, or Billing Period to narrow results.",
        },
        {
          title: "Take Action",
          body: "Browse the **Invoices Pending Signature** or **Approved Invoices** tabs. Add comments or review invoice PDFs.",
        },
      ],
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp: null,
      citations: [
        {
          chunk_id: "359d528e-3d5a-4308-878c-7b37f7884afe",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
      faqItems: null,
      quotaMessage: null,
    },
  },

  /* ══════════════════════════════════════════════════════════════
     7. MIXED — Candidate Onboarding Lifecycle
     Component: FunnelChart + Summary
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: [
      "onboarding stages",
      "candidate onboarding",
      "onboarding process",
      "onboarding lifecycle",
    ],
    response: {
      action: "respond",
      response_type: "mixed",
      alert: null,
      title: "Candidate Onboarding Lifecycle",
      intro: null,
      steps: null,
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: null,
      stages: [
        {
          label: "In Screening",
          description: "Submission documents under review",
        },
        {
          label: "Interview Scheduled",
          description: "Interviews arranged with HWL or facility",
        },
        {
          label: "Pre-Agreement",
          description: "Pending decision to initiate agreement",
        },
        {
          label: "Sign Agreements",
          description: "Pending agency and/or facility signatures",
        },
        {
          label: "Credentialing",
          description: "Compliance documents under review",
        },
        {
          label: "Orientation Scheduled",
          description: "Candidate cleared and ready to start",
        },
      ],
      followUp: null,
      citations: [
        {
          chunk_id: "dd741cb7-35a8-4b5c-b649-685536919389",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
      faqItems: null,
      quotaMessage: null,
    },
  },

  /* ══════════════════════════════════════════════════════════════
     8. MIXED — Timecard exception flow
     Component: Steps + Mermaid
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: [
      "timecard exception",
      "exception in",
      "timecard correction",
      "approved timecard correction",
    ],
    response: {
      action: "respond",
      response_type: "mixed",
      alert: null,
      title: "Timecard Exception Process",
      intro:
        "Use this when a timecard is already Approved and needs a correction.",
      steps: [
        {
          title: "Open the Timecard",
          body: "Go to the **Approved** tab on the Timecards page and locate the timecard.",
        },
        {
          title: "Create an Exception",
          body: "Update time punches or department, upload supporting documents, add comments, and submit the exception for facility review.",
        },
        {
          title: "Monitor Exception OUT",
          body: "The timecard moves to **Exception OUT**. Wait for the facility to respond.",
        },
        {
          title: "Respond to Exception IN",
          body: "When the facility returns it, review their comments, update details, and resubmit.",
        },
      ],
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: `flowchart TD
  A[Approved Timecard] --> B[Agency Creates Exception]
  B --> C[Exception OUT — Pending Facility]
  C --> D{Facility Response}
  D -->|Changes needed| E[Exception IN — Agency Action Required]
  E --> B
  D -->|Accepted| F[Returns to Approved for Invoicing]`,
      stages: null,
      followUp:
        "If the timecard is already Invoiced, contact your HWL Account Manager — exceptions cannot be raised at that stage.",
      citations: [
        {
          chunk_id: "36dff967-dc09-43cf-bdec-a4cbae3a4059",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
      faqItems: null,
      quotaMessage: null,
    },
  },

  /* ══════════════════════════════════════════════════════════════
     9. FAQ — Common platform errors
     Component: Faq
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: ["502", "bad gateway"],
    response: {
      action: "respond",
      response_type: "faq",
      alert: null,
      title: "Error 502 — Bad Gateway",
      intro: null,
      steps: null,
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp: null,
      citations: [{ chunk_id: "2f1a41a3", source: "FAQ.pdf" }],
      faqItems: [
        {
          question: "Error 502 — Bad Gateway",
          answer:
            "This is an internal server issue. Please contact your agency's internal IT Department.",
        },
      ],
      quotaMessage: null,
    },
  },
  {
    keywords: ["error 15", "special characters"],
    response: {
      action: "respond",
      response_type: "faq",
      alert: null,
      title: "Error 15 — Special Characters in Staff Pool",
      intro: null,
      steps: null,
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp: null,
      citations: [{ chunk_id: "2f1a41a3", source: "FAQ.pdf" }],
      faqItems: [
        {
          question: "Error 15 — Special Characters in Staff Pool",
          answer:
            "Triggered when adding a staff member with special characters in their name (e.g. apostrophes). Remove the special character and retry.",
        },
      ],
      quotaMessage: null,
    },
  },
  {
    keywords: ["error 20"],
    response: {
      action: "respond",
      response_type: "faq",
      alert: null,
      title: "Error 20 — Platform Down",
      intro: null,
      steps: null,
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp: null,
      citations: [{ chunk_id: "2f1a41a3", source: "FAQ.pdf" }],
      faqItems: [
        {
          question: "Error 20 — Platform Down",
          answer:
            "The platform is down at the AWS level. Contact Rajesh Surve immediately.",
        },
      ],
      quotaMessage: null,
    },
  },

  /* ══════════════════════════════════════════════════════════════
     10. QUOTA EXCEEDED — Session limit
     Component: QuotaExceeded
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: [
      "quota exceeded",
      "limit reached",
      "too many messages",
      "usage limit",
    ],
    response: {
      action: "quota_exceeded",
      response_type: "quota_exceeded",
      alert: null,
      title: "Quota Exceeded",
      intro: null,
      steps: null,
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp: null,
      citations: [],
      faqItems: null,
      quotaMessage:
        "You've reached your message limit for this session. Please start a new chat to continue.",
    },
  },

  /* ══════════════════════════════════════════════════════════════
     11. NOT FOUND — Off-topic (payroll / HR)
     Component: Alert + Escalation
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: ["payroll", "salary", "hr", "human resources", "leave request"],
    response: {
      action: "not_found",
      response_type: "notfound",
      alert: {
        severity: "warning",
        title: "Not found in knowledge base",
        body: "I couldn't find anything related to payroll or HR in the HWL knowledge base.",
      },
      title: "No relevant documentation found",
      intro: "Here are some topics I can help with instead:",
      steps: null,
      items: null,
      options: [
        {
          label: "Set up my HWL account",
          value: "initial setup",
          description: "",
        },
        {
          label: "Propose a candidate",
          value: "propose candidate",
          description: "",
        },
        {
          label: "Manage timecards",
          value: "timecard status",
          description: "",
        },
        { label: "View invoices", value: "view invoices", description: "" },
      ],
      summary: null,
      escalation: {
        title: "Still need help?",
        message:
          "For payroll or HR queries, please contact your HWL Account Manager directly.",
        reason: "Topic not covered in available HWL documentation.",
      },
      chart: null,
      stages: null,
      followUp: null,
      citations: [],
      faqItems: null,
      quotaMessage: null,
    },
  },

  /* ══════════════════════════════════════════════════════════════
     12. NOT FOUND — Off-topic (general / unrelated)
     Component: Alert (danger) + options fallback
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: [
      "weather",
      "email",
      "write email",
      "draft email",
      "recipe",
      "football",
    ],
    response: {
      action: "not_found",
      response_type: "notfound",
      alert: {
        severity: "danger",
        title: "Outside scope",
        body: "This assistant only covers HWL platform tasks. I can't help with that topic.",
      },
      title: "No relevant documentation found",
      intro: "Here are the topics I can help with:",
      steps: null,
      items: null,
      options: [
        {
          label: "Set up my HWL account",
          value: "initial setup",
          description: "",
        },
        {
          label: "Propose a candidate",
          value: "propose candidate",
          description: "",
        },
        {
          label: "Manage timecards",
          value: "timecard status",
          description: "",
        },
        { label: "View invoices", value: "view invoices", description: "" },
      ],
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp: null,
      citations: [],
      faqItems: null,
      quotaMessage: null,
    },
  },
];

/* ─────────────────────────────────────────────────────────────
   Simple lookup — first entry whose keyword appears wins.
   Longer keywords sorted first per entry so specific phrases
   match before short ones.
───────────────────────────────────────────────────────────────*/
export function getDummyResponse(message: string): LLMResponse {
  const lower = message.toLowerCase();

  for (const entry of DUMMY_QA2) {
    const sorted = [...entry.keywords].sort((a, b) => b.length - a.length);
    if (sorted.some((kw) => lower.includes(kw.toLowerCase()))) {
      return entry.response;
    }
  }

  return {
    action: "not_found",
    response_type: "notfound",
    alert: null,
    title: "No relevant documentation found",
    intro: "I wasn't able to find anything matching your question.",
    steps: null,
    items: null,
    options: [
      {
        label: "Set up my HWL account",
        value: "initial setup",
        description: "",
      },
      {
        label: "Propose a candidate",
        value: "propose candidate",
        description: "",
      },
      { label: "Manage timecards", value: "timecard status", description: "" },
      { label: "View invoices", value: "view invoices", description: "" },
    ],
    summary: null,
    escalation: null,
    chart: null,
    stages: null,
    followUp: "Would any of these topics help?",
    citations: [],
    faqItems: null,
    quotaMessage: null,
  };
}
