import { rpc, requireUuid, requireRevision } from "@/server/workflow/rpc";
import { privateHeaders, handle, jsonInput } from "@/server/workflow/http";
import { PortalError } from "@/server/portal/config";
export async function GET() {
  return handle(async () =>
    Response.json({ rows: await rpc("requests") }, { headers: privateHeaders }),
  );
}
export async function POST(request: Request) {
  return handle(async () => {
    const b = await jsonInput(request);
    const key = requireUuid(b.idempotency_key, "key");
    const revision = requireRevision(b.revision);
    if (b.action === "save") {
      if (
        !b.payload ||
        typeof b.payload !== "object" ||
        Array.isArray(b.payload) ||
        !Array.isArray(b.file_version_ids)
      )
        throw new PortalError(400, "รูปแบบร่างไม่ถูกต้อง");
      if (
        ![
          "PERSON_CORRECTION",
          "ORGANIZATION_CHANGE",
          "EXAM_CENTER_CHANGE",
        ].includes(String(b.kind)) ||
        Object.entries(b.payload).some(
          ([key, value]) =>
            ![
              "subject",
              "reason",
              "target_id",
              "effective_on",
              "new_location",
            ].includes(key) ||
            typeof value !== "string" ||
            value.length > 2000,
        ) ||
        b.file_version_ids.length > 10
      )
        throw new PortalError(400, "ฟิลด์คำขอหรือประเภทไม่ถูกต้อง");
      const payload = Object.fromEntries(
        Object.entries(b.payload).map(([key, value]) => [
          key,
          (value as string).normalize("NFC"),
        ]),
      );
      const files = b.file_version_ids.map((x) => requireUuid(x, "หลักฐาน"));
      const result = await rpc("save", [
        b.id ? requireUuid(b.id) : null,
        requireUuid(b.organization_id),
        b.kind,
        JSON.stringify(payload),
        files,
        revision,
        key,
      ]);
      return Response.json(result[0], { headers: privateHeaders });
    }
    const result = await rpc("transition", [
      requireUuid(b.id),
      revision,
      b.action,
      typeof b.reason === "string" ? b.reason.normalize("NFC") : "",
      key,
    ]);
    return Response.json(result[0], { headers: privateHeaders });
  });
}
