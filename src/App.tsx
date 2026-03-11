import { useAuth } from "./hooks/useAuth";
import { ChatPage } from "./pages/ChatPage";

export default function App() {
  const auth = useAuth();

  if (auth.status === "loading") return <div>Loading...</div>;

  if (auth.status === "unauthenticated")
    return <div>{auth.reason}</div>;

  return <ChatPage token={auth.token} userId={auth.payload.sub} />;
}