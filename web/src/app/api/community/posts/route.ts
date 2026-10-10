import { createCommunityPost, listCommunityPosts, type CommunityPost } from "@/lib/community-store";

export async function GET() {
  return Response.json(listCommunityPosts());
}

export async function POST(request: Request) {
  const input = await request.json() as Partial<Omit<CommunityPost, "id" | "createdAt" | "updatedAt" | "status">>;
  if (!input.kind || !input.title?.trim() || !input.content?.trim() || !input.authorRole || !input.authorDepartment) {
    return Response.json({ error: "請完成貼文內容與基本身分資料。" }, { status: 400 });
  }
  if (!(["交流", "活動", "徵才"] as string[]).includes(input.kind) || !(["學生", "校友", "教職員"] as string[]).includes(input.authorRole)) {
    return Response.json({ error: "貼文資料格式不正確。" }, { status: 400 });
  }
  return Response.json(createCommunityPost({
    kind: input.kind as CommunityPost["kind"], title: input.title.trim(), content: input.content.trim(),
    authorName: input.anonymous ? "東吳同學" : input.authorName?.trim() || "未具名使用者",
    authorDepartment: input.authorDepartment, authorRole: input.authorRole as CommunityPost["authorRole"],
    authorVerified: false, anonymous: Boolean(input.anonymous),
  }), { status: 201 });
}
