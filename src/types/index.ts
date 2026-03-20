import type { LLMResponse, ResponseAction, ResponseType } from "./llmResponse";

export type { LLMResponse, ResponseAction, ResponseType };

export interface Citation {
  chunk_id: string;
  source: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  action?: ResponseAction;
  response_type?: ResponseType;
  timestamp: Date;
  attachment?: { name: string; type: string };
  isHistorical?: boolean;
  /** Stored on live assistant messages so we can re-render MDX with selectedOption on click. */
  llmResponse?: LLMResponse;
}

export interface SessionListItem {
  session_id: string;
  title: string;
  filename: string;
  updated_at: string;
  turn_count: number;
}

export interface SessionTurn extends Partial<Omit<LLMResponse, "citations">> {
  type: "turn";
  role: "user" | "assistant";
  window: number;
  content: string;
  chunk_ids?: string[];
  citations?: Citation[];
  duration_ms?: number;
  ts: string;
}

export interface SessionHistory {
  session_id: string;
  user_id: string;
  title?: string;
  created_at: string;
  turns: SessionTurn[];
}

export interface HWLAssistantProps {
  apiUrl: string;
  title?: string;
  theme?: { primaryColor?: string };
  placeholder?: string;
}

export interface ApiResponse extends LLMResponse {
  session_id: string;
}

export interface SendMessageResponse {
  body: string;
  citations: Citation[];
  action: Exclude<ResponseAction, "quota_exceeded">;
  responseType: ResponseType;
  serverSessionId: string;
  /** Raw LLMResponse before jsonToMdx — stored on the Message for live selection freezing. */
  llmResponse: LLMResponse;
}
