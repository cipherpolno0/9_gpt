import { PageIntro } from "@/shared/components/site-shell";
export default function Page() {
  return (
    <>
      <PageIntro title="คลังข้อสอบและการเรียน">
        สำหรับนักธรรมตรี โท เอก และธรรมศึกษาตามช่วงชั้น
        คะแนนฝึกก่อนและหลังเรียนแยกจากผลสอบทางการ
      </PageIntro>
      <div
        className="rounded-xl border border-border bg-white p-6"
        role="status"
      >
        ยังไม่มีเนื้อหาที่เจ้าของหลักสูตรรับรองให้เผยแพร่
      </div>
    </>
  );
}
