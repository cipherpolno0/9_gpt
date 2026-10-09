import Link from "next/link";
import { publicNavigation } from "@/shared/navigation";
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6">
          <Link href="/" className="font-semibold text-primary">
            กองบริหารทะเบียนและวัดผล
            <span className="block text-sm font-normal text-muted-foreground">
              ศูนย์ข้อมูลคณะสงฆ์และการศึกษา
            </span>
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-primary px-5 py-2 text-primary-foreground"
          >
            เข้าสู่พื้นที่ทำงาน
          </Link>
        </div>
        <nav
          aria-label="เมนูสาธารณะ"
          className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 pb-4"
        >
          {publicNavigation.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-3 py-2 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto min-h-[60vh] max-w-6xl px-5 py-10"
      >
        {children}
      </main>
      <footer className="border-t border-border bg-white px-5 py-6 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3">
          <span>เว็บไซต์กองบริหารทะเบียนและวัดผล</span>
          <Link href="/contact">ติดต่อเรา</Link>
          <a href="#main-content">กลับขึ้นด้านบน</a>
        </div>
      </footer>
    </>
  );
}
export function PageIntro({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <p className="text-sm font-semibold text-primary">
        บริการกลาง · เว็บไซต์เดียว 9 ระบบ
      </p>
      <h1 className="mt-3 text-3xl font-semibold leading-relaxed">{title}</h1>
      <div className="mt-3 max-w-3xl leading-8 text-muted-foreground">
        {children}
      </div>
    </div>
  );
}
