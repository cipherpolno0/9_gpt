import Link from "next/link";
import { SiteShell, PageIntro } from "@/shared/components/site-shell";
import { publicNavigation } from "@/shared/navigation";
export default function Home() {
  return (
    <SiteShell>
      <section className="rounded-2xl border border-border bg-white p-6 sm:p-10">
        <PageIntro title="ศูนย์ข้อมูลคณะสงฆ์และการศึกษา">
          <p>บริการทะเบียน การศึกษา และงานบริหารผ่านเว็บไซต์เดียว</p>
        </PageIntro>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-primary px-6 py-3 text-white"
          >
            เข้าสู่พื้นที่ทำงาน
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border border-border px-6 py-3"
          >
            ติดต่อเจ้าหน้าที่
          </Link>
        </div>
      </section>
      <section
        aria-label="บริการสาธารณะ"
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {publicNavigation.slice(1).map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-border bg-white p-6 hover:border-primary"
          >
            <h2 className="text-xl font-semibold">{label}</h2>
            <p className="mt-3 text-sm text-muted-foreground">เปิดบริการ →</p>
          </Link>
        ))}
      </section>
      <p className="mt-8 leading-8 text-muted-foreground">
        ข้อมูลที่ยังไม่ได้รับอนุมัติให้เผยแพร่จะไม่แสดงในหน้าสาธารณะ
      </p>
    </SiteShell>
  );
}
