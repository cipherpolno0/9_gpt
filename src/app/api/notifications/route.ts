import { rpc, requireUuid } from "@/server/workflow/rpc";
import { privateHeaders, handle, jsonInput } from "@/server/workflow/http";
export async function GET() {
  return handle(async () =>
    Response.json(
      { rows: await rpc("notifications") },
      { headers: privateHeaders },
    ),
  );
}
export async function POST(request: Request) {
  return handle(async () => {
    const b = await jsonInput(request);
    await rpc("ack", [requireUuid(b.id)]);
    return Response.json({ ok: true }, { headers: privateHeaders });
  });
}
