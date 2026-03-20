/**
 * errors.ts
 * ---------
 * Typed error classes for the API layer.
 * Callers (ChatPage) use `instanceof` to render appropriate UI for each failure mode
 * instead of branching on error message strings.
 */

/** HTTP 429 — session turn quota exhausted. Input should be locked. */
export class QuotaExceededError extends Error {
  override readonly name = "QuotaExceededError";
  constructor() {
    super(
      "You've reached the turn limit for this session. Please start a new chat to continue.",
    );
  }
}

/** HTTP 401 — JWT missing, malformed, or expired. Re-auth required. */
export class UnauthorizedError extends Error {
  override readonly name = "UnauthorizedError";
  constructor() {
    super("Your session has expired. Please reload the page to sign in again.");
  }
}

/** Any other non-2xx HTTP response that is not specifically handled above. */
export class ApiError extends Error {
  override readonly name = "ApiError";
  readonly status: number;
  constructor(status: number) {
    super(`Unexpected server error (HTTP ${status}). Please try again.`);
    this.status = status;
  }
}
