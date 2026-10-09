import { PageIntro } from "@/shared/components/site-shell";
export default function Page() {
  return (
    <>
      <PageIntro title="ติดต่อเรา">
        ช่องทางติดต่อกลางชุดเดียวสำหรับทุกระบบ
      </PageIntro>
      <div
        className="rounded-xl border border-border bg-white p-6"
        role="status"
      >
        กำลังยืนยันช่องทางติดต่อและเวลาบริการของหน่วยงาน กรุณาอย่าส่งรหัสผ่าน
        token เลขบัตร หรือหลักฐานส่วนตัวผ่านช่องทางสาธารณะ
      </div>
    </>
  );
}
