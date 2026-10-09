import { registry } from "@/server/portal/registry";
import { PortalError } from "@/server/portal/config";
export async function GET(request: Request) {
  try {
    return Response.json(
      await registry("organizations", new URL(request.url).searchParams),
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    return Response.json(
      {
        error: e instanceof PortalError ? e.message : "บริการข้อมูลยังไม่พร้อม",
      },
      {
        status: e instanceof PortalError ? e.status : 503,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }
}
