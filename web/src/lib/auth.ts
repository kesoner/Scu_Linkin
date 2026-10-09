import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "linkin_admin";

function configuration() {
  const password = process.env.LINKIN_ADMIN_PASSWORD;
  const secret = process.env.LINKIN_AUTH_SECRET;
  return password && secret ? { password, secret } : null;
}

function signature(secret: string) {
  return createHmac("sha256", secret).update("linkin-admin-v1").digest("hex");
}

export function isAuthConfigured() {
  return Boolean(configuration());
}

export async function isAdmin() {
  const config = configuration();
  if (!config) return false;
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || token.length !== signature(config.secret).length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(signature(config.secret)));
}

export async function createAdminSession() {
  const config = configuration();
  if (!config) return false;
  (await cookies()).set(cookieName, signature(config.secret), { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 8 });
  return true;
}

export async function clearAdminSession() {
  (await cookies()).delete(cookieName);
}

export function passwordMatches(input: string) {
  const config = configuration();
  if (!config) return false;
  const expected = Buffer.from(config.password);
  const received = Buffer.from(input);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
