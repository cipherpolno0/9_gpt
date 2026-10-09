import { configured } from "@/server/portal/config";
import { PageIntro } from "@/shared/components/site-shell";
import { currentIdentity } from "@/server/portal/auth";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const ready = configured();
  if (ready && (await currentIdentity())) redirect("/app");
  const { error } = await searchParams;
  return (
    <>
      <PageIntro title="เข้าสู่พื้นที่ทำงาน">
        <p>
          ใช้บัญชีที่หน่วยงานมอบหมาย สิทธิ์ขึ้นอยู่กับหน้าที่ หน่วยงาน
          และช่วงเวลาที่ได้รับมอบหมาย
        </p>
      </PageIntro>
      {!ready && (
        <p role="status" className="mb-6 rounded-lg bg-secondary p-4">
          บริการบัญชียังไม่เปิดใช้งาน กรุณาติดต่อผู้ดูแลเว็บไซต์
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mb-6 rounded-lg border border-destructive p-4 text-destructive"
        >
          {error.slice(0, 240)}
        </p>
      )}
      <form
        action="/api/auth/login"
        method="post"
        className="max-w-md space-y-5"
      >
        <div>
          <label htmlFor="email" className="block mb-2">
            อีเมล
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            maxLength={254}
            required
            disabled={!ready}
            className="w-full rounded-lg border border-border bg-white p-3"
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-2">
            รหัสผ่าน
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            maxLength={256}
            required
            disabled={!ready}
            className="w-full rounded-lg border border-border bg-white p-3"
          />
        </div>
        <div>
          <label htmlFor="code" className="block mb-2">
            รหัสยืนยันสองขั้นตอน
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            disabled={!ready}
            className="w-full rounded-lg border border-border bg-white p-3"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            กรอกรหัสจากแอปยืนยันเมื่อบัญชีของคุณกำหนดให้ใช้
          </p>
        </div>
        <button
          disabled={!ready}
          className="rounded-lg bg-primary px-6 py-3 text-white disabled:opacity-50"
        >
          เข้าสู่ระบบ
        </button>
      </form>
    </>
  );
}
