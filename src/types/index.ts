export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
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

export interface Citation {
  chunk_id: string;
  source: string;
}

export interface MdxData {
  body: string;
}

export interface ResponseComponent {
  type: "mdx";
  data: MdxData;
}

export interface ApiResponse {
  session_id: string;
  action: "clarify" | "respond" | "not_found" | "quota_exceeded";
  response: string;
  response_type: "answer" | "options" | "mixed" | "notfound";
  citations?: Citation[];
}

export interface SendMessageResponse {
  body: string;
  citations: Citation[];
}
