import Link from "next/link";
import { PageIntro } from "@/shared/components/site-shell";
export default function Page() {
  return (
    <>
      <PageIntro title="คู่มือและแบบฟอร์ม">
        <p>เลือกคู่มือเริ่มต้นสำหรับใช้งานเว็บไซต์</p>
      </PageIntro>
      <a
        download
        href="/guides/getting-started.txt"
        className="inline-block rounded-lg bg-primary px-5 py-3 text-white"
      >
        ดาวน์โหลดคู่มือเริ่มต้น (ข้อความภาษาไทย)
      </a>
      <p className="mt-6 leading-8">
        แบบฟอร์มทางการจะเปิดให้ดาวน์โหลดเมื่อหน่วยงานยืนยันรุ่นและสิทธิ์เผยแพร่แล้ว
      </p>
      <Link href="/contact" className="mt-4 inline-block underline">
        สอบถามแบบฟอร์ม
      </Link>
    </>
  );
}
