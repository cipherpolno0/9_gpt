import { currentIdentity } from "@/server/portal/auth";
import { redirect } from "next/navigation";
import { configured } from "@/server/portal/config";
export default async function Page() {
  const identity = await currentIdentity();
  if (!identity) redirect("/login");
  if (!identity.grants.some((g) => g.actions.includes("admin.read")))
    return <p role="alert">ไม่มีสิทธิ์ดูสถานะบริการ</p>;
  return (
    <>
      <h1 className="text-3xl font-semibold">สถานะบริการ</h1>
      <p className="mt-6">
        การตั้งค่าบัญชีและฐานข้อมูล:{" "}
        {configured() ? "มีการตั้งค่า" : "ยังไม่ครบ"}
      </p>
      <p className="mt-4">
        สถานะนี้ไม่ได้ยืนยันสุขภาพ worker หรือความพร้อมธุรกรรม
        เจ้าหน้าที่เทคนิคไม่ได้รับสิทธิ์เปิดทะเบียนหรือเอกสารทั้งหมดจากหน้าที่นี้
      </p>
    </>
  );
}
