import { clearAdminSession, createAdminSession, isAdmin, isAuthConfigured, passwordMatches } from "@/lib/auth";

export async function GET() {
  return Response.json({ configured: isAuthConfigured(), admin: await isAdmin() });
}

export async function POST(request: Request) {
  const { password } = await request.json() as { password?: string };
  if (!isAuthConfigured()) return Response.json({ error: "尚未設定管理員帳號。" }, { status: 503 });
  if (!password || !passwordMatches(password)) return Response.json({ error: "密碼錯誤。" }, { status: 401 });
  await createAdminSession();
  return Response.json({ ok: true });
}

export async function DELETE() {
  await clearAdminSession();
  return Response.json({ ok: true });
}
