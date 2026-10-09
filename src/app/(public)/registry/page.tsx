import { PageIntro } from "@/shared/components/site-shell";
export default function Page() {
  return (
    <>
      <PageIntro title="ทะเบียน">
        ข้อมูลบุคลากร หน่วยงาน และสนามสอบที่ได้รับอนุญาตให้เผยแพร่
        เจ้าหน้าที่ใช้พื้นที่ทำงานเพื่อดูข้อมูลตามสิทธิ์
      </PageIntro>
      <div
        className="rounded-xl border border-border bg-white p-6"
        role="status"
      >
        ยังไม่มีชุดทะเบียนที่ได้รับอนุมัติให้เผยแพร่
        จึงไม่มีข้อมูลบุคคลปรากฏในหน้านี้
      </div>
    </>
  );
}
