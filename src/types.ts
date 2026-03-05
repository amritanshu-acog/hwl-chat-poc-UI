export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string; // Can be plain text, markdown, or JSON string for Response components
  timestamp: Date;
  attachment?: { name: string; type: string };
}

export interface Session {
  sessionId: string;
  startedAt: Date;
  preview: string;
  messages: Message[];
}

export interface HWLAssistantProps {
  apiUrl: string;
  title?: string;
  theme?: { primaryColor?: string };
  placeholder?: string;
}

// Phase 2 extension points
export interface AgentHandoffPayload {
  sessionId: string;
  reason: string;
  context: Message[];
}

export interface HubSpotTicket {
  subject: string;
  description: string;
  sessionId: string;
  email?: string;
}

// Response Component Data Types
export type MDXComponentType =
  | "text"
  | "alert"
  | "steps"
  | "choices"
  | "checklist"
  | "escalation"
  | "summary";

export interface TextData {
  body: string;
}

export interface AlertData {
  severity: "warning" | "info" | "danger";
  title: string;
  body: string;
}

export interface StepData {
  title: string;
  body: string;
}

export interface StepsData {
  title?: string;
  intro?: string;
  steps: StepData[];
  followUp?: string;
}

export interface ChoiceData {
  label: string;
  value: string;
  description?: string;
}

export interface ChoicesData {
  question: string;
  options: ChoiceData[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked?: boolean;
}

export interface ChecklistData {
  title?: string;
  items: string[] | { id: string; label: string; checked?: boolean }[];
}

export interface EscalationData {
  title: string;
  message: string;
  reason?: string;
}

export interface SummaryData {
  title: string;
  body: string;
  actions?: string[];
}

export interface MDXComponent {
  type: MDXComponentType;
  data:
    | TextData
    | AlertData
    | StepsData
    | ChoicesData
    | ChecklistData
    | EscalationData
    | SummaryData;
}
