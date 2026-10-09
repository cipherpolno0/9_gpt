import { NextResponse } from "next/server";
import { logout, tokenCookie } from "@/server/portal/auth";
import { assertSameOrigin, PortalError } from "@/server/portal/config";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await logout();
    const r = NextResponse.redirect(new URL("/login", request.url), 303);
    r.cookies.delete(tokenCookie);
    r.headers.set("Cache-Control", "private, no-store");
    return r;
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof PortalError
            ? e.message
            : "ออกจากระบบไม่ได้ กรุณาลองอีกครั้ง",
      },
      {
        status: e instanceof PortalError ? e.status : 503,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }
}
