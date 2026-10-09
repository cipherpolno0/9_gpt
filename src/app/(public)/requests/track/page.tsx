import Link from "next/link";
import { PageIntro } from "@/shared/components/site-shell";
export default function Page() {
  return (
    <>
      <PageIntro title="ติดตามคำขอ">
        <p>
          เจ้าของเรื่องตรวจรายละเอียดและหลักฐานได้ในพื้นที่ทำงานตามสิทธิ์ของตน
        </p>
      </PageIntro>
      <Link
        href="/login"
        className="rounded-lg bg-primary px-5 py-3 text-white inline-block"
      >
        เข้าสู่ระบบเพื่อติดตามเรื่อง
      </Link>
      <p className="mt-6">การติดตามด้วยเลขสาธารณะยังไม่เปิดใช้งาน</p>
    </>
  );
}
