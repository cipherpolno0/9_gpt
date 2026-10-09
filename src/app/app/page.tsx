import Link from "next/link";
import { currentIdentity } from "@/server/portal/auth";
import { redirect } from "next/navigation";
export default async function Page() {
  const identity = await currentIdentity();
  if (!identity) redirect("/login");
  const allowed = new Set(identity.grants.flatMap((g) => g.actions));
  return (
    <>
      <h1 className="text-3xl font-semibold">ภาพรวมพื้นที่ทำงาน</h1>
      <p className="mt-4 leading-8">
        บัญชีของคุณใช้ร่วมกันทุกระบบ
        ข้อมูลทะเบียนจะแสดงเฉพาะหน่วยงานที่ได้รับมอบหมาย
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          ["people.read", "/app/people", "ทะเบียนบุคคล"],
          ["organizations.read", "/app/organizations", "ทะเบียนหน่วยงาน"],
        ]
          .filter(([action]) => allowed.has(action))
          .map(([, href, label]) => (
            <Link
              href={href}
              key={href}
              className="rounded-xl border border-border bg-white p-6 text-xl font-semibold"
            >
              {label} →
            </Link>
          ))}
      </div>
      {allowed.size === 0 && (
        <p className="mt-6">
          ยังไม่มีหน้าที่ที่มีผลในขณะนี้ กรุณาติดต่อผู้ดูแลสิทธิ์
        </p>
      )}
      <p className="mt-8 text-muted-foreground">
        งานสมัครสอบ งบประมาณ พัสดุ และสารบรรณยังไม่เปิดให้บันทึกธุรกรรม
      </p>
    </>
  );
}
