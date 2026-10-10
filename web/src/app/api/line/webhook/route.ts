import { verifyLineSignature } from "@/lib/line-webhook";

type LineWebhookPayload = {
  events?: Array<{ type?: string }>;
};

/**
 * LINE signs every webhook using the raw request body.  Keep this endpoint
 * public, but reject any request whose signature cannot be verified.
 * Message routing will be added after the public server and database are live.
 */
export async function POST(request: Request) {
  const body = await request.text();

  if (!process.env.LINE_CHANNEL_SECRET) {
    return Response.json({ error: "LINE webhook 尚未設定。" }, { status: 503 });
  }

  if (!verifyLineSignature(body, request.headers.get("x-line-signature"))) {
    return Response.json({ error: "LINE signature 驗證失敗。" }, { status: 401 });
  }

  let payload: LineWebhookPayload;
  try {
    payload = JSON.parse(body) as LineWebhookPayload;
  } catch {
    return Response.json({ error: "LINE webhook 格式錯誤。" }, { status: 400 });
  }

  // Acknowledge valid callbacks quickly. Do not log LINE user IDs or message
  // bodies; later handlers can add only the consented features we need.
  return Response.json({ ok: true, received: payload.events?.length ?? 0 });
}
