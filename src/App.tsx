import { useCallback } from "react";
import { useAuth } from "./hooks/useAuth";
import { ChatPage } from "./pages/ChatPage";
import { APP_CONFIG } from "./config";

// ─── Auth boundary screens ────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-current"
          style={{ color: APP_CONFIG.primaryColor }}
        />
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    </div>
  );
}

function UnauthScreen({ reason }: { reason: string }) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50 px-6">
      <div className="max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center">
        <div className="mb-4 text-3xl">🔒</div>
        <h1 className="mb-2 text-base font-semibold text-slate-800">
          Access required
        </h1>
        <p className="text-sm text-slate-500">{reason}</p>
      </div>
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function App() {
  const auth = useAuth();

  /**
   * Called by ChatPage when the backend returns 401 (token expired mid-session).
   * Clears the stored token so the next load triggers the host app auth flow.
   */
  const handleUnauthorized = useCallback(() => {
    sessionStorage.removeItem(APP_CONFIG.jwtStorageKey);
    window.location.reload();
  }, []);

  if (auth.status === "loading") return <LoadingScreen />;

  if (auth.status === "unauthenticated")
    return <UnauthScreen reason={auth.reason} />;

  return (
    <ChatPage
      token={auth.token}
      userId={auth.payload.sub}
      displayName={auth.payload.name ?? auth.payload.email ?? auth.payload.sub}
      onUnauthorized={handleUnauthorized}
    />
  );
}