/**
 * index.ts
 * --------
 * Public surface of the HWL Assistant package.
 * Import from here when embedding the widget in a host app.
 */

export type { HWLAssistantProps, Message } from "./types";
export { sendMessage } from "./services/api";
