export type ResponseAction =
  | "clarify"
  | "respond"
  | "not_found"
  | "quota_exceeded";

export type ResponseType =
  | "answer"
  | "options"
  | "mixed"
  | "notfound"
  | "clarify";

export interface LLMAlert {
  severity: "warning" | "info" | "danger";
  title: string;
  body: string;
}

export interface LLMStep {
  title: string;
  body: string;
}

export interface LLMOption {
  label: string;
  value: string;
  description?: string;
}

export interface LLMSummary {
  title: string;
  body: string;
  actions?: string[];
}

export interface LLMEscalation {
  title: string;
  message: string;
  reason?: string;
}

export interface LLMGlossaryItem {
  term: string;
  definition: string;
}

export interface LLMCitation {
  chunk_id: string;
  source: string;
}

export interface LLMResponse {
  action: ResponseAction;
  response_type: ResponseType;
  alert: LLMAlert | null;
  title: string;
  intro?: string | null;
  steps: LLMStep[] | null;
  items: string[] | null;
  glossaryItems?: LLMGlossaryItem[] | null;
  options: LLMOption[] | null;
  summary: LLMSummary | null;
  escalation: LLMEscalation | null;
  chart: string | null;
  followUp: string | null;
  citations: LLMCitation[];
}
