import { rpc, requireUuid } from "@/server/workflow/rpc";
import { privateHeaders, handle, jsonInput } from "@/server/workflow/http";
import { PortalError } from "@/server/portal/config";
export async function POST(request: Request) {
  return handle(async () => {
    const b = await jsonInput(request);
    const doc = requireUuid(b.document_id);
    const account = requireUuid(b.account_id);
    if (
      b.revoke !== true &&
      (typeof b.ends_at !== "string" ||
        b.ends_at.length > 40 ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(
          b.ends_at,
        ) ||
        !Number.isFinite(Date.parse(b.ends_at)))
    )
      throw new PortalError(400, "ระบุวันสิ้นสุดพร้อมเขตเวลาให้ถูกต้อง");
    await rpc(
      b.revoke === true ? "revoke" : "share",
      b.revoke === true ? [doc, account] : [doc, account, b.ends_at],
    );
    return Response.json({ ok: true }, { headers: privateHeaders });
  });
}
