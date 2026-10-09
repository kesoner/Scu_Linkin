import { createOpportunity, listOpportunities } from "@/lib/opportunity-store";
import type { Opportunity } from "@/lib/opportunities";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  const items = listOpportunities();
  return Response.json(await isAdmin() ? items : items.filter((item) => item.status === "已發布"));
}

export async function POST(request: Request) {
  if (!await isAdmin()) return Response.json({ error: "需要管理員權限。" }, { status: 401 });
  const input = await request.json() as Partial<Omit<Opportunity, "id" | "updatedAt" | "official">>;
  if (!input.title || !input.category || !input.organizer || !input.deadline || !input.campus || !input.summary || !input.sourceUrl || !Array.isArray(input.departments) || !Array.isArray(input.tags)) {
    return Response.json({ error: "缺少必要欄位。" }, { status: 400 });
  }
  return Response.json(createOpportunity(input as Omit<Opportunity, "id" | "updatedAt" | "official">), { status: 201 });
}
