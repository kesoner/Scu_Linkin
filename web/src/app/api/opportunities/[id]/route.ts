import { setOpportunityStatus, updateOpportunity, type OpportunityStatus } from "@/lib/opportunity-store";
import type { Opportunity } from "@/lib/opportunities";
import { isAdmin } from "@/lib/auth";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return Response.json({ error: "需要管理員權限。" }, { status: 401 });
  const { status } = await request.json() as { status?: OpportunityStatus };
  const allowed: OpportunityStatus[] = ["草稿", "已發布", "已下架"];
  if (!status || !allowed.includes(status)) return Response.json({ error: "無效的狀態。" }, { status: 400 });
  const { id } = await context.params;
  if (!setOpportunityStatus(id, status)) return Response.json({ error: "找不到資訊。" }, { status: 404 });
  return Response.json({ ok: true });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return Response.json({ error: "需要管理員權限。" }, { status: 401 });
  const input = await request.json() as Partial<Omit<Opportunity, "id" | "updatedAt" | "official">>;
  if (!input.title || !input.category || !input.organizer || !input.deadline || !input.campus || !input.summary || !input.sourceUrl || !Array.isArray(input.departments) || !Array.isArray(input.tags)) {
    return Response.json({ error: "缺少必要欄位。" }, { status: 400 });
  }
  const { id } = await context.params;
  const updated = updateOpportunity(id, input as Omit<Opportunity, "id" | "updatedAt" | "official">);
  if (!updated) return Response.json({ error: "找不到資訊。" }, { status: 404 });
  return Response.json(updated);
}
