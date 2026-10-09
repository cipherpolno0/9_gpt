import { NextResponse } from "next/server";
import { currentIdentity } from "@/server/portal/auth";
import { PortalError } from "@/server/portal/config";
async function deny() {
  try {
    const user = await currentIdentity();
    return NextResponse.json(
      {
        error: user
          ? "บริการนี้ยังไม่ได้เปิดสิทธิ์ให้ทำรายการ"
          : "กรุณาเข้าสู่ระบบ",
      },
      {
        status: user ? 403 : 401,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof PortalError ? e.message : "บริการยังไม่พร้อม" },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
export const GET = deny;
export const POST = deny;
export const PUT = deny;
export const PATCH = deny;
export const DELETE = deny;
export const HEAD = deny;
export const OPTIONS = deny;
