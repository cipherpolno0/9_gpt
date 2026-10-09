import { assertSameOrigin, PortalError } from "../portal/config";
import { boundedBytes } from "../documents/files";
export const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
};
export async function jsonInput(request: Request) {
  assertSameOrigin(request);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new PortalError(415, "ส่งข้อมูลเป็น JSON");
  let value: unknown;
  try {
    value = JSON.parse((await boundedBytes(request, 16384)).toString("utf8"));
  } catch (error) {
    if (error instanceof PortalError) throw error;
    throw new PortalError(400, "ข้อมูลไม่ถูกต้อง");
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new PortalError(400, "ข้อมูลไม่ถูกต้อง");
  return value as Record<string, unknown>;
}
export async function handle(fn: () => Promise<Response>) {
  try {
    return await fn();
  } catch (error) {
    const e =
      error instanceof PortalError
        ? error
        : new PortalError(503, "บริการยังไม่พร้อม");
    return Response.json(
      { error: e.message },
      { status: e.status, headers: privateHeaders },
    );
  }
}
