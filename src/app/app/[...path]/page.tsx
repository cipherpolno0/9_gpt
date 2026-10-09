import { notFound } from "next/navigation";
import { currentIdentity } from "@/server/portal/auth";
import { redirect } from "next/navigation";
const areas = new Map([
  ["exams", "ผู้สมัครและผลสอบ"],
  ["requests", "คำขอและสถานะหน่วยงาน"],
  ["learning", "การเรียนรู้"],
  ["correspondence", "สารบรรณ"],
  ["budget", "งบประมาณ"],
  ["inventory", "วัสดุและครุภัณฑ์"],
]);
export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  if (!(await currentIdentity())) redirect("/login");
  const { path } = await params;
  const title =
    path?.join("/") === "exams/imports"
      ? "สมัครสอบผ่าน Excel"
      : path?.length === 1
        ? areas.get(path[0])
        : undefined;
  if (!title) notFound();
  return (
    <>
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-6 rounded-xl border border-border bg-white p-6">
        บริการนี้ยังไม่เปิดให้ทำรายการ
        รายการเดิมและหลักฐานจะไม่ถูกสร้างหรือเปลี่ยนจากการเปิดหน้านี้
      </p>
    </>
  );
}
