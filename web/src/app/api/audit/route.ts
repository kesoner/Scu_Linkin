import { isAdmin } from "@/lib/auth";
import { listAuditEvents } from "@/lib/opportunity-store";

export async function GET() {
  if (!await isAdmin()) return Response.json({ error: "需要管理員權限。" }, { status: 401 });
  return Response.json(listAuditEvents());
}
