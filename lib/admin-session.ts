export const ADMIN_COOKIE = "genecode_admin";

function getSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "genecode-dev-change-me"
  );
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isAllowedAdminEmail(email: string) {
  const allowed = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

export function verifyAdminCredentials(email: string, password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  if (!adminPassword || adminPassword.length < 6) return false;
  return isAllowedAdminEmail(email) && password === adminPassword;
}

export async function createAdminSessionToken(email: string) {
  const normalized = email.trim().toLowerCase();
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = `${normalized}|${expires}`;
  const sig = await hmacSha256Hex(getSecret(), payload);
  return `${payload}|${sig}`;
}

export async function parseAdminSessionToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const parts = token.split("|");
  if (parts.length !== 3) return null;
  const [email, expiresRaw, sig] = parts;
  const expires = Number(expiresRaw);
  if (!email || !expires || Date.now() > expires) return null;
  const payload = `${email}|${expires}`;
  const expected = await hmacSha256Hex(getSecret(), payload);
  if (sig !== expected) return null;
  if (!isAllowedAdminEmail(email)) return null;
  return email;
}
