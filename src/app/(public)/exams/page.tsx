import { PageIntro } from "@/shared/components/site-shell";
export default function Page() {
  return (
    <>
      <PageIntro title="สอบธรรมสนามหลวง">
        สืบค้นผลนักธรรมและธรรมศึกษารายปีจากรุ่นผลที่รับรองเผยแพร่
        ชื่อและสังกัดอ้างอิง ณ ปีสมัคร
      </PageIntro>
      <div
        className="rounded-xl border border-border bg-white p-6"
        role="status"
      >
        ยังไม่มีผลสอบที่รับรองเผยแพร่ ไม่แสดงคะแนนฝึก ผลร่าง
        หรือข้อมูลผู้เรียนส่วนตัว
      </div>
    </>
  );
}
