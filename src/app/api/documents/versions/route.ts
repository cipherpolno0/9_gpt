import { rpc, requireUuid } from "@/server/workflow/rpc";
import { privateHeaders, handle } from "@/server/workflow/http";
import { assertSameOrigin } from "@/server/portal/config";
import {
  boundedBytes,
  inspectUpload,
  maximumWebUploadBytes,
} from "@/server/documents/files";
import { putObject } from "@/server/documents/storage";
export async function GET() {
  return handle(async () =>
    Response.json({ rows: await rpc("files") }, { headers: privateHeaders }),
  );
}
export async function POST(request: Request) {
  return handle(async () => {
    assertSameOrigin(request);
    const q = new URL(request.url).searchParams;
    const org = requireUuid(q.get("organization_id"), "หน่วยงาน");
    const key = requireUuid(request.headers.get("idempotency-key"), "key");
    const document = q.get("document_id")
      ? requireUuid(q.get("document_id"), "เอกสาร")
      : null;
    // Authenticate and check upload scope before buffering an untrusted body.
    const { currentIdentity } = await import("@/server/portal/auth");
    const identity = await currentIdentity();
    const { PortalError } = await import("@/server/portal/config");
    if (!identity) throw new PortalError(401, "กรุณาเข้าสู่ระบบ");
    if (
      !identity.grants.some(
        (g) =>
          g.organization_id === org && g.actions.includes("documents.upload"),
      )
    )
      throw new PortalError(403, "ไม่มีสิทธิ์อัปโหลดในหน่วยงานนี้");
    const bytes = await boundedBytes(request, maximumWebUploadBytes);
    const file = inspectUpload(
      bytes,
      q.get("label") ?? "",
      request.headers.get("content-type") ?? "",
    );
    const [version] = await rpc<{
      id: string;
      document_id: string;
      object_key: string;
    }>("filePrepare", [
      org,
      document,
      file.label,
      file.mime,
      file.size,
      file.sha256,
      key,
    ]);
    await putObject(version.object_key, bytes, file.mime, file.sha256);
    const [scanStatus] = await rpc<string>("fileUploaded", [
      version.id,
      file.sha256,
    ]);
    return Response.json(
      {
        id: version.id,
        document_id: version.document_id,
        scan_status: scanStatus,
      },
      { status: 201, headers: privateHeaders },
    );
  });
}
