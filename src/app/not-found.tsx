import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-5 py-14">
      <h1 className="text-2xl font-semibold">ไม่พบหน้าที่ต้องการ</h1>
      <p className="mt-4">ตรวจสอบที่อยู่หน้าเว็บแล้วลองอีกครั้ง</p>
      <Link href="/" className="mt-6 inline-block text-primary underline">
        กลับหน้าแรก
      </Link>
    </main>
  );
}
