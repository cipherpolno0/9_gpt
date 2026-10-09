import { NextResponse } from "next/server";
import { signIn, tokenCookie } from "@/server/portal/auth";
import {
  assertSameOrigin,
  boundedForm,
  PortalError,
} from "@/server/portal/config";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const form = await boundedForm(request);
    const email = form.get("email")?.trim() ?? "",
      password = form.get("password") ?? "",
      code = form.get("code") ?? "";
    if (
      email.length > 254 ||
      !email.includes("@") ||
      password.length < 1 ||
      password.length > 256
    )
      throw new PortalError(400, "กรุณากรอกบัญชีและรหัสผ่านให้ครบ");
    const { token, expiresAt } = await signIn(email, password, code);
    const response = NextResponse.redirect(new URL("/app", request.url), 303);
    response.cookies.set(tokenCookie, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    const e =
      error instanceof PortalError
        ? error
        : new PortalError(503, "บริการบัญชียังไม่พร้อม");
    // Cross-site and oversized requests do not get a reflected redirect.
    if ([403, 413, 415].includes(e.status))
      return NextResponse.json(
        { error: e.message },
        { status: e.status, headers: { "Cache-Control": "private, no-store" } },
      );
    const url = new URL("/login", request.url);
    url.searchParams.set("error", e.message);
    return NextResponse.redirect(url, 303);
  }
}
