import type { LLMResponse } from "../types/llmResponse";

export interface DummyEntry {
  keywords: string[];
  response: LLMResponse;
}

export const DUMMY_QA2: DummyEntry[] = [
  /* ══════════════════════════════════════════════════════════════
     1. CLARIFY — Greeting
     action: clarify | response_type: answer (Choices)
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: ["hi", "hello", "hey", "what can you do"],
    response: {
      action: "clarify",
      response_type: "answer",
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
    },
  },

  /* ══════════════════════════════════════════════════════════════
       FAQ — Error 502 Bad Gateway
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: [
      "502 error",
      "bad gateway",
      "getting 502 error",
      "502 bad gateway",
    ],
    response: {
      action: "respond",
      response_type: "answer",
      alert: null,
      title: "Error 502 Bad Gateway",
      intro: null,
      steps: null,
      items: null,
      options: null,
      summary: {
        title: "",
        body: "It is an internal server issue. Please contact the agency's internal IT Department.",
      },
      escalation: null,
      chart: null,
      stages: null,
      followUp: null,
      citations: [
        {
          chunk_id: "2f1a41a3-d03a-41aa-b245-bb05be4da066",
          source: "FAQ.pdf",
        },
      ],
    },
  },

  /* ══════════════════════════════════════════════════════════════
       FAQ — Error 20
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: ["error 20", "getting 20 error", "what does error 20 mean"],
    response: {
      action: "respond",
      response_type: "answer",
      alert: null,
      title: "Error 20",
      intro: null,
      steps: null,
      items: null,
      options: null,
      summary: {
        title: "",
        body: "Platform is down at the AWS level — will need to contact Rajesh Surve immediately.",
      },
      escalation: null,
      chart: null,
      stages: null,
      followUp: null,
      citations: [
        {
          chunk_id: "2f1a41a3-d03a-41aa-b245-bb05be4da066",
          source: "FAQ.pdf",
        },
      ],
    },
  },
  /* ══════════════════════════════════════════════════════════════
     2. ANSWER — Initial Setup
     Component: Alert + Steps
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: [
      "initial setup for HWL",
      "first-time HWL login",
      "reset HWL password",
      "verify HWL email",
      "select job group in HWL",
      "facility mapping HWL",
      "self-mapping HWL",
      "HWL notification message",
      "email preferences HWL",
    ],
    response: {
      action: "respond",
      response_type: "answer",
      alert: null,
      title: "Initial Set Up",
      intro:
        "This procedure is for new HWL users who are logging in for the first time. These actions are necessary to ensure the system generates the desired information and operates correctly.",
      steps: [
        {
          title: "Initial Access, Password Reset, Verify Email",
          body: "New users will receive a system-generated email containing a URL, temporary username, and password. Click the URL to access the login page. Select **Reset Password** to initiate the password setup process. Follow the onscreen prompts to set up a new password and log in successfully.",
        },
        {
          title: "Selecting Job Group",
          body: "From the Dashboard tab, locate the **Select Job Group** dropdown on the right side. Choose the appropriate job group to display relevant resources.",
        },
        {
          title: "Self Facility/Location Mapping",
          body: "Navigate to the HWL menu and select **Settings**, then **Self Facility/Location Mapping**. Two categories will appear: **Show Excluded** and **Show Included**. Click into the desired category to update preferences: mark facilities you want to include with a green check and mark facilities you want to exclude with a red X. Click the check or X to save preferences. Once saved, no further action is required.",
        },
        {
          title: "HWL Notification Message",
          body: "Upon initial login, if email preferences are not set, a notification message will appear. To stop the message from appearing, set email preferences or check the **Do not show this message** box.",
        },
        {
          title: "Verify | Change Email",
          body: "Navigate to the **Verify | Change Email** screen under **Settings**. Options: **Default Selection** — enroll to receive all HWL notifications automatically. **Manual Configuration** — customize email preferences via the Email Preference page. **Exit** — no action is taken. The message will reappear unless **Do not show this message again** is selected.",
        },
        {
          title: "Email Preference Management",
          body: "Navigate to **Settings** then **Email Preference**. To subscribe to job titles, select **Job Titles Subscribed** and click **Default to Select All Job Titles** or manually select specific titles. To manage email notifications, navigate to the **Email Subscribed** tab and mark desired notifications in green to receive them or gray to opt out.",
        },
      ],
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp:
        "Facility mapping and email preferences can be updated at any time. Notifications will continue to appear until preferences are set or the Do not show this message box is checked.",
      citations: [
        {
          chunk_id: "e32995ae-c3e2-4d66-a773-18d458fcdd8f",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
    },
  },

  /* ══════════════════════════════════════════════════════════════
     3. CLARIFY — Timecard status
     action: clarify | response_type: options (Choices)
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
      response_type: "options",
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
    },
  },

  /* ══════════════════════════════════════════════════════════════
     5. OPTIONS — Expense type
     Component: Choices
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: [
      "add expense",
      "submitting expense",
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
    },
  },

  /* ══════════════════════════════════════════════════════════════
     6. OPTIONS — Invoice type
     Component: Choices
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: ["viewing invoices", "find invoice", "invoice help"],
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
    },
  },

  /* ══════════════════════════════════════════════════════════════
     7. MIXED — Candidate Onboarding Lifecycle
     Component: FunnelChart
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
    },
  },

  /* ══════════════════════════════════════════════════════════════
     8. MIXED — Timecard exception flow
     Component: Steps + Mermaid
  ══════════════════════════════════════════════════════════════ */
  /* ══════════════════════════════════════════════════════════════
     9. MIXED — Timecard status lifecycle flow
     Component: Steps + Mermaid
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: [
      "timecard status",
      "submitted timecard",
      "approved timecard",
      "timecard lifecycle",
      "timecard invoicing",
      "timecard approval process",
      "pre-invoice timecard",
      "invoiced timecard",
    ],
    response: {
      action: "respond",
      response_type: "mixed",
      alert: null,
      title: "Timecard Status Lifecycle",
      intro:
        "Each timecard moves through a series of statuses before it reaches invoicing. Here's what to do at every stage.",
      steps: [
        {
          title: "Submitted — Review & Act",
          body: "Open the timecard from the **Submitted** tab. Verify shift date, facility, department, candidate, and time punches. **Edit** to correct punches or department, or **Reject** with a written reason. Approved timecards move to the Approved tab.",
        },
        {
          title: "Approved — Raise an Exception if Needed",
          body: "If a correction is required after approval, create an exception: update time punches or department, attach supporting documents, add comments, and submit for facility review. The timecard will move to **Exception OUT**.",
        },
        {
          title: "Exception IN — Respond to Facility",
          body: "The facility has returned the timecard with comments or proposed changes. Review their feedback, update the relevant details or upload documents, then resubmit the exception.",
        },
        {
          title: "Exception OUT — Wait for Facility",
          body: "The timecard is pending a facility decision. Monitor this tab and take action only if it returns to **Exception IN**.",
        },
        {
          title: "Pre-Invoice — Final Corrections",
          body: "Make any last corrections before the invoice is generated. If changes are still needed, raise an exception and submit for facility review.",
        },
        {
          title: "Invoiced — Escalate if Required",
          body: "No further edits can be made once a timecard is Invoiced. Contact your **HWL Account Manager** for any adjustments or corrections at this stage.",
        },
      ],
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: `flowchart TD
  A[Timecard Submitted] --> B{Agency Review}
  B -->|Edit or Approve| C[Approved]
  B -->|Reject| D[Rejected — Reason Provided]
  C --> E{Correction Needed?}
  E -->|No| F[Pre-Invoice]
  E -->|Yes| G[Agency Creates Exception]
  G --> H[Exception OUT — Pending Facility]
  H --> I{Facility Response}
  I -->|Changes Requested| J[Exception IN — Agency Action]
  J --> G
  I -->|Accepted| C
  F --> K[Invoiced]
  K --> L[Contact HWL Account Manager for Adjustments]`,
      stages: null,
      followUp:
        "Only time punches and department can be edited directly. Any other changes require creating a new timecard entirely.",
      citations: [
        {
          chunk_id: "36dff967-dc09-43cf-bdec-a4cbae3a4059",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
    },
  },

  /* ══════════════════════════════════════════════════════════════
     9. NOT FOUND — Off-topic (payroll / HR)
     Component: NotFound + Escalation
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
      title: "",
      intro: null,
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
    },
  },

  /* ══════════════════════════════════════════════════════════════
     10. NOT FOUND — Off-topic (general / unrelated)
     Component: NotFound + Alert
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
      title: "",
      intro: null,
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
      citations: [
        {
          chunk_id: "dd741cb7-35a8-4b5c-b649-685536919389",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
    },
  },

  /* ══════════════════════════════════════════════════════════════
     REQUISITIONS — Main entry point
     Component: options — Choices
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: [
      "where do i find requisitions",
      "how do i access requisitions",
      "i need help with requisitions",
      "requisition help",
    ],
    response: {
      action: "respond",
      response_type: "options",
      alert: null,
      title: "What do you need help with on Requisitions?",
      intro: "Select a topic and I'll walk you through it.",
      steps: null,
      items: null,
      options: [
        {
          label: "What does the Requisitions page show?",
          value: "requisition page details",
          description: "Columns, buttons, and how to read the page",
        },
        {
          label: "How do I propose a candidate?",
          value: "how do i propose a candidate",
          description: "Step-by-step guide to submitting a candidate",
        },
        {
          label: "candidate is in screening what does that mean",
          value: "candidate is in screening what does that mean",
          description: "Onboarding stages from screening to orientation",
        },
        {
          label: "My candidate shows Backup Profile — what do I do?",
          value: "what is backup profile status",
          description: "What backup status means and next steps",
        },
      ],
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp: null,
      citations: [
        {
          chunk_id: "dd741cb7-35a8-4b5c-b649-685536919389",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
    },
  },

  /* ══════════════════════════════════════════════════════════════
     REQUISITIONS — Subflow: Page details
     Component: answer — Checklist
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: [
      "requisition page details",
      "what does the requisition page show",
      "what are the columns on requisition",
      "how do i read the requisition page",
      "what information is on the requisition page",
    ],
    response: {
      action: "respond",
      response_type: "answer",
      alert: null,
      title: "What the Requisitions Page Shows",
      intro:
        "The Requisitions page gives you a full picture of every open requisition and the candidates proposed against them. Here is what each column means.",
      steps: null,
      items: null,
      glossaryItems: [
        {
          term: "Facility/System",
          definition: "The broadcasting facility name and its location.",
        },
        {
          term: "Specialty/Dept.",
          definition: "The department the candidate will be working in.",
        },
        {
          term: "Shift Type",
          definition: "The working shift the candidate is expected to cover.",
        },
        {
          term: "Job Title",
          definition:
            "The appropriate job titles associated with the requisition.",
        },
        {
          term: "Requisition",
          definition: "The requisition name. Click it to see full details.",
        },
        {
          term: "Days Posted",
          definition: "How long the requisition has been live.",
        },
        {
          term: "Group Order",
          definition: "Indicates whether multiple candidates are needed.",
        },
        {
          term: "Start/End",
          definition: "The desired start and end dates for the placement.",
        },
        {
          term: "Candidate Status",
          definition:
            "Shows the current onboarding stage of each proposed candidate.",
        },
        {
          term: "Action/Status",
          definition:
            "Buttons to take action such as proposing candidates or viewing schedules.",
        },
      ],
      options: null,
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp:
        "Click the Requisition name to drill into full details, or use the Action/Status buttons to take action on a candidate.",
      citations: [
        {
          chunk_id: "dd741cb7-35a8-4b5c-b649-685536919389",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
    },
  },

  /* ══════════════════════════════════════════════════════════════
     REQUISITIONS — Subflow: Propose a candidate
     Component: answer — Alert + Steps
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: [
      "how do i propose a candidate",
      "propose a candidate",
      "submit a candidate",
      "i want to propose someone",
      "how to submit candidate to requisition",
      "i need to propose a candidate",
      "candidate not showing up to propose",
      "propose candidate button",
    ],
    response: {
      action: "respond",
      response_type: "answer",
      alert: {
        severity: "warning",
        title: "Candidate must already be in your Staff Pool",
        body: "Before you can propose someone, they need to exist in your Staff Pool. If you cannot find the candidate in the proposal screen, check your Staff Pool first.",
      },
      title: "How to Propose a Candidate",
      intro:
        "Here are the steps to propose a candidate against an open requisition.",
      steps: [
        {
          title: "Go to the Requisitions Page",
          body: "From the HWL menu, navigate to **Requisitions** to see all open requisitions.",
        },
        {
          title: "Find the Requisition",
          body: "Locate the requisition you want to fill and click **Propose Candidate** in the Action/Status column.",
        },
        {
          title: "Select the Candidate",
          body: "A list of your Staff Pool will appear. Select the candidate you want to propose.",
        },
        {
          title: "Fill in Proposal Details",
          body: "Complete all required fields — this includes rates, availability dates, and any attestation questions.",
        },
        {
          title: "Submit the Proposal",
          body: "Click **Submit**. The candidate will immediately move to **In Screening** status and appear in the Candidate Status column.",
        },
      ],
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp:
        "Once submitted, keep an eye on the Candidate Status column to track where your candidate is in the onboarding process.",
      citations: [
        {
          chunk_id: "dd741cb7-35a8-4b5c-b649-685536919389",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
    },
  },

  /* ══════════════════════════════════════════════════════════════
     REQUISITIONS — Subflow: Onboarding stages
     Component: mixed — FunnelChart + Steps + Mermaid
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: [
      "what happens after i propose a candidate",
      "candidate onboarding stages",
      "onboarding process",
      "onboarding lifecycle",
      "candidate is in screening what does that mean",
      "how long does onboarding take",
      "what are the stages after proposal",
    ],
    response: {
      action: "respond",
      response_type: "mixed",
      alert: null,
      title: "Candidate Onboarding Stages",
      intro:
        "Once you propose a candidate, they move through up to six onboarding stages before they are cleared to start. Here is what each stage means and what to expect.",
      steps: [
        {
          title: "In Screening",
          body: "HWL or the facility is reviewing the submission documents you provided with the proposal.",
        },
        {
          title: "Interview Scheduled",
          body: "An interview has been arranged between the candidate and HWL or the facility team.",
        },
        {
          title: "Pre-Agreement",
          body: "A decision is pending on whether to move forward with a formal placement agreement.",
        },
        {
          title: "Sign Agreements",
          body: "The placement agreement is ready. Either the agency or facility — or both — need to sign. You will see a **Sign Agreement** button in the Action/Status column.",
        },
        {
          title: "Credentialing",
          body: "The facility is reviewing the candidate's compliance documents to confirm they meet all requirements.",
        },
        {
          title: "Orientation Scheduled",
          body: "The candidate has cleared all checks and is ready to begin their assignment. The Action/Status column will show **No Action**.",
        },
      ],
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: `flowchart TD
  A[Candidate Proposed] --> B[In Screening]
  B --> C[Interview Scheduled]
  C --> D[Pre-Agreement]
  D --> E[Sign Agreements]
  E --> F[Credentialing]
  F --> G[Orientation Scheduled]
  G --> H[Ready to Start]`,
      stages: null,
      followUp:
        "If your candidate has been stuck in the same stage for a while, contact your HWL Account Manager for an update.",
      citations: [
        {
          chunk_id: "dd741cb7-35a8-4b5c-b649-685536919389",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
    },
  },

  /* ══════════════════════════════════════════════════════════════
     REQUISITIONS — Subflow: Backup profile status
     Component: answer — Alert + Steps
  ══════════════════════════════════════════════════════════════ */
  {
    keywords: [
      "what is backup profile status",
      "backup profile",
      "backup status",
      "my candidate shows backup",
      "candidate is in backup",
      "what does backup mean on requisition",
      "candidate stuck on backup profile",
      "backup profile what do i do",
    ],
    response: {
      action: "respond",
      response_type: "answer",
      alert: {
        severity: "info",
        title: "Backup does not mean rejected",
        body: "Backup Profile status means your candidate is on standby for this requisition. They have not been turned down — the facility simply has not confirmed them yet.",
      },
      title: "My Candidate Shows Backup Profile — What Do I Do?",
      intro:
        "Backup Profile is a holding status. Here is what it means and the recommended steps to take.",
      steps: [
        {
          title: "Do Not Withdraw Immediately",
          body: "Backup status does not mean the candidate has been rejected. Avoid withdrawing them right away.",
        },
        {
          title: "Wait 12 Hours",
          body: "Give the facility at least 12 hours to review and act on the proposal before taking further steps.",
        },
        {
          title: "Re-propose to Another Requisition",
          body: "After 12 hours with no movement, re-propose the candidate to a different open requisition that fits their profile.",
        },
        {
          title: "Submit to Another Facility Simultaneously",
          body: "You can propose the same candidate to another facility at the same time — keeping the backup status on the original requisition does not block this.",
        },
      ],
      items: null,
      options: null,
      summary: null,
      escalation: null,
      chart: null,
      stages: null,
      followUp:
        "If the backup status persists beyond 24 hours with no update, reach out to your HWL Account Manager for visibility.",
      citations: [
        {
          chunk_id: "dd741cb7-35a8-4b5c-b649-685536919389",
          source: "HWL Agency_HWL User Guide_ V4.pdf",
        },
      ],
    },
  },
];

/* ─────────────────────────────────────────────────────────────
   Simple lookup — first entry whose keyword appears wins.
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
    intro:
      "I can help you troubleshoot — try rephrasing or asking something more specific. Here are a few examples of what I can help with:",
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
    followUp: null,
    citations: [],
  };
}
