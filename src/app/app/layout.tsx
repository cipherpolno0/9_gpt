import Link from "next/link";
import { redirect } from "next/navigation";
import { currentIdentity } from "@/server/portal/auth";
import { workNavigation } from "@/shared/navigation";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await currentIdentity();
  if (!identity) redirect("/login");
  const admin = identity.grants.some((g) => g.actions.includes("admin.read"));
  return (
    <>
      <header className="border-b border-border bg-white px-5 py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3">
          <Link href="/" className="font-semibold text-primary">
            กองบริหารทะเบียนและวัดผล
          </Link>
          <form action="/api/auth/logout" method="post">
            <button className="underline">ออกจากระบบ</button>
          </form>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 p-5 md:grid-cols-[230px_1fr]">
        <nav
          aria-label="พื้นที่ทำงาน"
          className="rounded-xl border border-border bg-white p-3"
        >
          {workNavigation.map(([href, label]) => (
            <Link
              href={href}
              key={href}
              className="block rounded-lg px-3 py-3 hover:bg-muted"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/app/exams/imports"
            className="block rounded-lg px-3 py-3 hover:bg-muted"
          >
            สมัครสอบผ่าน Excel
          </Link>
          {admin && (
            <Link href="/app/admin" className="block px-3 py-3">
              สถานะบริการ
            </Link>
          )}
          <Link href="/contact" className="block px-3 py-3">
            ติดต่อเรา
          </Link>
        </nav>
        <main id="main-content" tabIndex={-1} className="min-w-0">
          {children}
        </main>
      </div>
    </>
  );
}
