"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { type NoticeRow, statusLabel } from "@/shared/workflow/types";
import { sendJson } from "./client";
export function Notices({ rows }: { rows: NoticeRow[] }) {
  const router = useRouter();
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function ack(id: string) {
    setBusy(true);
    try {
      await sendJson("/api/notifications", { id });
      router.refresh();
      setMessage("ทำเครื่องหมายอ่านแจ้งเตือนแล้ว");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "ยังบันทึกไม่ได้");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-4">
      <p>การอ่านแจ้งเตือนไม่ใช่การรับทราบหนังสือสารบรรณ</p>
      <p role="status">{message}</p>
      {!rows.length ? (
        <p>ยังไม่มีแจ้งเตือน</p>
      ) : (
        rows.map((row) => (
          <article key={row.id} className="rounded-xl border bg-white p-4">
            <p>
              คำขอ · {statusLabel[row.event_type] ?? row.event_type} ·{" "}
              {new Date(row.created_at).toLocaleString("th-TH", {
                timeZone: "Asia/Bangkok",
              })}
            </p>
            <Link href="/app/requests" className="mr-4 underline">
              ตรวจรายการคำขอ
            </Link>
            {row.acknowledged_at ? (
              <span>อ่านแล้ว</span>
            ) : (
              <button
                disabled={busy}
                className="underline"
                onClick={() => ack(row.id)}
              >
                ทำเครื่องหมายอ่านแจ้งเตือน
              </button>
            )}
          </article>
        ))
      )}
    </section>
  );
}
