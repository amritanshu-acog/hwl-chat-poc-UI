/**
 * index.ts
 * --------
 * Public surface of the HWL Assistant package.
 * Import from here when embedding the widget in a host app.
 */

export { HWLAssistant } from "./components/HWLAssistant";
export type { HWLAssistantProps, Message, Session } from "./types";
export { sendMessage } from "./services/api";
