import { SignJWT } from "jose";

export async function generateDemoToken(secret: string): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT({
    sub: "demo-user-001",
    name: "Demo User",
    email: "demo@hwl.com",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}
