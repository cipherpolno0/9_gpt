"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { FileRow, Grant } from "@/shared/workflow/types";
import { sendJson, operationKey } from "./client";
export function Files({ rows, grants }: { rows: FileRow[]; grants: Grant[] }) {
  const router = useRouter();
  const key = useRef<{ body: string; key: string } | null>(null);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const organizations = [
    ...new Set(
      grants
        .filter(
          (g) => g.actions.includes("documents.upload") && g.organization_id,
        )
        .map((g) => g.organization_id!),
    ),
  ];
  async function upload(form: FormData) {
    const file = form.get("file") as File;
    const organization = form.get("organization_id") as string;
    const document = form.get("document_id") as string;
    if (file?.size > 4 * 1024 * 1024)
      return setMessage("ไฟล์ต้องไม่เกิน 4 MiB");
    if (!file || !file.size) return setMessage("เลือกไฟล์หลักฐาน");
    setBusy(true);
    setMessage("กำลังอัปโหลด");
    try {
      const hash = Array.from(
        new Uint8Array(
          await crypto.subtle.digest("SHA-256", await file.arrayBuffer()),
        ),
      )
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("");
      const params = new URLSearchParams({
        organization_id: organization,
        label: file.name,
      });
      if (document) params.set("document_id", document);
      const id = operationKey(key, {
        organization,
        document,
        label: file.name,
        hash,
      });
      const response = await fetch("/api/documents/versions?" + params, {
        method: "POST",
        headers: { "Content-Type": file.type, "Idempotency-Key": id },
        body: file,
        cache: "no-store",
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      key.current = null;
      router.refresh();
      setMessage("รับไฟล์แล้ว รอ worker สแกนก่อนใช้เป็นหลักฐานหรือดาวน์โหลด");
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "อัปโหลดไม่สำเร็จ ใช้ไฟล์เดิมลองใหม่ได้",
      );
    } finally {
      setBusy(false);
    }
  }
  async function share(form: FormData) {
    setBusy(true);
    try {
      const body = {
        document_id: form.get("document_id"),
        account_id: form.get("account_id"),
        ends_at: form.get("ends_at"),
        revoke: form.get("revoke") === "on",
      };
      await sendJson("/api/documents/access", body);
      setMessage("อัปเดตสิทธิ์เอกสารแล้ว");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "เปลี่ยนสิทธิ์ไม่ได้");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-6">
      <p>ไฟล์หลักฐานใช้คลังกลาง รุ่นใหม่ไม่เขียนทับรุ่นที่ส่งตรวจแล้ว</p>
      {!!organizations.length && (
        <form
          action={upload}
          className="grid gap-3 rounded-xl border bg-white p-5"
        >
          <label>
            หน่วยงานที่มีสิทธิ์อัปโหลด
            <select
              name="organization_id"
              className="block w-full rounded border p-2"
            >
              {organizations.map((id) => (
                <option key={id}>{id}</option>
              ))}
            </select>
          </label>
          <label>
            เอกสารเดิม (เว้นว่างเพื่อสร้างเอกสารใหม่)
            <select
              name="document_id"
              className="block w-full rounded border p-2"
            >
              <option value="">เอกสารใหม่</option>
              {rows
                .filter(
                  (r, i) =>
                    rows.findIndex((x) => x.document_id === r.document_id) ===
                    i,
                )
                .map((r) => (
                  <option key={r.document_id} value={r.document_id}>
                    {r.label} — {r.document_id}
                  </option>
                ))}
            </select>
          </label>
          <label>
            หลักฐาน PDF PNG JPEG (ไม่เกิน 4 MiB)
            <input
              name="file"
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              required
              className="block w-full"
            />
          </label>
          <button disabled={busy} className="rounded bg-primary p-3 text-white">
            อัปโหลดเพื่อสแกน
          </button>
        </form>
      )}
      <p role="status" aria-live="polite">
        {message}
      </p>
      {!rows.length ? (
        <p>ยังไม่มีเอกสารที่คุณมีสิทธิ์อ่าน</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-xl border bg-white p-4">
              <strong>{r.label}</strong> · รุ่น {r.revision} · {r.scan_status}
              <p className="break-all text-sm">รหัสเอกสาร {r.document_id}</p>
              {r.scan_status === "CLEAN" && (
                <a
                  className="underline"
                  href={"/api/documents/versions/" + r.id}
                >
                  ดาวน์โหลดรุ่นนี้
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
      {grants.some((g) => g.actions.includes("documents.share")) && (
        <form
          action={share}
          className="grid gap-3 rounded-xl border bg-white p-5"
        >
          <h2 className="text-xl font-semibold">สิทธิ์อ่านหลักฐานของผู้ตรวจ</h2>
          <p>
            สิทธิ์ของคำขอไม่เปิดไฟล์ให้อัตโนมัติ ระบุ Account ID
            กลางของผู้ตรวจที่ได้รับมอบหมาย
          </p>
          <label>
            เอกสาร
            <select
              name="document_id"
              className="block w-full rounded border p-2"
            >
              {rows
                .filter(
                  (r, i) =>
                    rows.findIndex((x) => x.document_id === r.document_id) ===
                    i,
                )
                .map((r) => (
                  <option key={r.document_id} value={r.document_id}>
                    {r.label} — {r.document_id}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Account ID ผู้รับสิทธิ์
            <input
              name="account_id"
              required
              className="block w-full rounded border p-2"
            />
          </label>
          <label>
            สิ้นสุดสิทธิ์ (ISO 8601 พร้อมเขตเวลา ไม่เกิน 30 วัน)
            <input
              name="ends_at"
              placeholder="2026-10-10T12:00:00+07:00"
              className="block w-full rounded border p-2"
            />
          </label>
          <label>
            <input name="revoke" type="checkbox" /> ถอนสิทธิ์อ่านเอกสารนี้
          </label>
          <button disabled={busy} className="rounded bg-primary p-3 text-white">
            บันทึกสิทธิ์
          </button>
        </form>
      )}
    </section>
  );
}
