"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-border bg-white p-6">
      <h1 className="text-xl font-semibold">ยังโหลดข้อมูลไม่ได้</h1>
      <p className="mt-3">กรุณาลองใหม่หรือติดต่อผู้ดูแลเว็บไซต์</p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-white"
      >
        ลองใหม่
      </button>
    </div>
  );
}
