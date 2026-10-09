"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type RequestRow,
  type FileRow,
  type Grant,
  kindLabel,
  statusLabel,
} from "@/shared/workflow/types";
import { sendJson, operationKey } from "./client";
export function Requests({
  rows,
  files,
  grants,
  accountId,
}: {
  rows: RequestRow[];
  files: FileRow[];
  grants: Grant[];
  accountId: string;
}) {
  const router = useRouter();
  const op = useRef<{ body: string; key: string } | null>(null);
  const decision = useRef<{ body: string; key: string } | null>(null);
  const organizations = [
    ...new Set(
      grants
        .filter(
          (g) => g.organization_id && g.actions.includes("requests.create"),
        )
        .map((g) => g.organization_id!),
    ),
  ];
  const [editing, setEditing] = useState<RequestRow | null>(null),
    [step, setStep] = useState(1),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const [org, setOrg] = useState(organizations[0] ?? ""),
    [kind, setKind] = useState("ORGANIZATION_CHANGE");
  const [payload, setPayload] = useState<Record<string, string>>({
    subject: "",
    reason: "",
    target_id: organizations[0] ?? "",
    effective_on: "",
    new_location: "",
  });
  const [evidence, setEvidence] = useState<string[]>([]);
  const missing = [
    !payload.subject.trim() ? "หัวเรื่อง" : "",
    payload.reason.trim().length < 10 ? "เหตุผลอย่างน้อย 10 ตัวอักษร" : "",
    !payload.target_id ? "หน่วยงานหรือบุคคลเป้าหมาย" : "",
    !/^\d{4}-\d{2}-\d{2}$/.test(payload.effective_on) ? "วันมีผล" : "",
    !evidence.length ? "หลักฐานที่ผ่าน scan" : "",
  ].filter(Boolean);
  function resume(row: RequestRow) {
    setEditing(row);
    setOrg(row.organization_id);
    setKind(row.kind);
    setPayload(row.payload);
    setEvidence(row.file_version_ids);
    setStep(1);
    setMessage("เปิดร่างรุ่น " + row.revision);
    op.current = null;
  }
  function clear() {
    setEditing(null);
    setPayload({
      subject: "",
      reason: "",
      target_id: org,
      effective_on: "",
      new_location: "",
    });
    setEvidence([]);
    setStep(1);
    op.current = null;
  }
  async function save(submit: boolean) {
    setBusy(true);
    setMessage("กำลังบันทึก");
    try {
      const body = {
        action: "save",
        id: editing?.id ?? null,
        organization_id: org,
        kind,
        payload,
        file_version_ids: evidence,
        revision: editing?.revision ?? 0,
      };
      const result = await sendJson("/api/requests", {
        ...body,
        idempotency_key: operationKey(op, body),
      });
      const updated = {
        ...body,
        ...result,
        tracking_code: editing?.tracking_code ?? "",
        snapshot_hash: "",
        data_mode: "SYNTHETIC",
        created_by_account_id: accountId,
        decisions: editing?.decisions ?? [],
      } as RequestRow;
      setEditing(updated);
      op.current = null;
      if (submit) {
        const send = {
          action: "submitted",
          id: result.id,
          revision: result.revision,
          reason: "",
        };
        await sendJson("/api/requests", {
          ...send,
          idempotency_key: operationKey(decision, send),
        });
        setMessage("ส่งคำขอแล้ว ติดตามผลในรายการด้านล่าง");
        clear();
      } else setMessage("บันทึกร่างแล้ว กลับมาแก้จากรายการเดิมได้");
      router.refresh();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "เครือข่ายขัดข้อง โหลดรายการล่าสุดก่อนลองใหม่",
      );
      router.refresh();
    } finally {
      setBusy(false);
    }
  }
  async function act(form: FormData) {
    setBusy(true);
    try {
      const body = {
        action: form.get("action"),
        id: form.get("id"),
        revision: Number(form.get("revision")),
        reason: form.get("reason"),
      };
      await sendJson("/api/requests", {
        ...body,
        idempotency_key: operationKey(decision, body),
      });
      decision.current = null;
      setMessage("บันทึกคำตัดสินแล้ว");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "บันทึกคำตัดสินไม่ได้");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }
  const has = (action: string, organization: string) =>
    grants.some(
      (g) => g.organization_id === organization && g.actions.includes(action),
    );
  return (
    <section className="space-y-6">
      <p className="rounded-xl border border-amber-300 bg-amber-50 p-4">
        พื้นที่ทดลองข้อมูลสมมติ · คำอนุมัติยังไม่เปลี่ยนสถานะทะเบียนจริง ·
        กฎและอำนาจทางการรอยืนยัน
      </p>
      <Link className="underline" href="/app/documents">
        อัปโหลดหลักฐานและให้สิทธิ์ผู้ตรวจ
      </Link>
      <p role="status" aria-live="polite">
        {message}
      </p>
      {!!organizations.length && (
        <div className="space-y-4 rounded-xl border bg-white p-5">
          <h2 className="text-xl font-semibold">
            {editing ? "แก้ร่างเดิม รุ่น " + editing.revision : "สร้างร่างใหม่"}
          </h2>
          <ol className="flex flex-wrap gap-4" aria-label="ขั้นตอนคำขอ">
            {["ประเภทและหน่วยงาน", "รายละเอียด", "หลักฐาน", "ตรวจทาน"].map(
              (label, i) => (
                <li key={label}>
                  <button
                    type="button"
                    aria-current={step === i + 1 ? "step" : undefined}
                    onClick={() => setStep(i + 1)}
                    className={step === i + 1 ? "font-semibold underline" : ""}
                  >
                    {i + 1}. {label}
                  </button>
                </li>
              ),
            )}
          </ol>
          {step === 1 && (
            <div className="grid gap-3">
              <label>
                ประเภท
                <select
                  disabled={!!editing}
                  value={kind}
                  onChange={(e) => {
                    setKind(e.target.value);
                    setPayload({
                      ...payload,
                      target_id:
                        e.target.value === "PERSON_CORRECTION" ? "" : org,
                    });
                  }}
                  className="block w-full rounded border p-2"
                >
                  {Object.entries(kindLabel).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                หน่วยงานที่ได้รับมอบหมาย
                <select
                  disabled={!!editing}
                  value={org}
                  onChange={(e) => {
                    setOrg(e.target.value);
                    setPayload({
                      ...payload,
                      target_id:
                        kind === "PERSON_CORRECTION" ? "" : e.target.value,
                    });
                  }}
                  className="block w-full rounded border p-2"
                >
                  {organizations.map((id) => (
                    <option key={id}>{id}</option>
                  ))}
                </select>
              </label>
              <label>
                {kind === "PERSON_CORRECTION"
                  ? "Person ID กลางในหน่วยงานนี้"
                  : "Organization ID เป้าหมาย"}
                <input
                  value={payload.target_id ?? ""}
                  onChange={(e) =>
                    setPayload({ ...payload, target_id: e.target.value })
                  }
                  className="block w-full rounded border p-2"
                />
              </label>
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-3">
              {[
                ["subject", "หัวเรื่อง"],
                ["reason", "เหตุผล"],
                ["new_location", "ที่ตั้งใหม่ (ถ้ามี)"],
                ["effective_on", "วันที่มีผล"],
              ].map(([field, label]) => (
                <label key={field}>
                  {label}
                  {field === "reason" ? (
                    <textarea
                      value={payload[field] ?? ""}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          [field]: e.target.value.normalize("NFC"),
                        })
                      }
                      className="block min-h-24 w-full rounded border p-2"
                    />
                  ) : (
                    <input
                      type={field === "effective_on" ? "date" : "text"}
                      value={payload[field] ?? ""}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          [field]: e.target.value.normalize("NFC"),
                        })
                      }
                      className="block w-full rounded border p-2"
                    />
                  )}
                </label>
              ))}
            </div>
          )}
          {step === 3 && (
            <fieldset className="grid gap-2">
              <legend>เลือกรุ่นหลักฐานที่ผ่าน scan (ไม่เกิน 10)</legend>
              {files
                .filter((f) => f.scan_status === "CLEAN")
                .map((f) => (
                  <label key={f.id}>
                    <input
                      type="checkbox"
                      checked={evidence.includes(f.id)}
                      onChange={(e) =>
                        setEvidence(
                          e.target.checked
                            ? [...evidence, f.id]
                            : evidence.filter((id) => id !== f.id),
                        )
                      }
                    />{" "}
                    {f.label} · รุ่น {f.revision}
                  </label>
                ))}
              {!files.some((f) => f.scan_status === "CLEAN") && (
                <p>ยังไม่มีหลักฐานที่ผ่าน scan และมีสิทธิ์อ่าน</p>
              )}
            </fieldset>
          )}
          {step === 4 && (
            <div className="space-y-3">
              <p>
                {kindLabel[kind]} · หน่วยงาน {org}
              </p>
              <dl>
                {Object.entries(payload).map(([key, value]) => (
                  <div key={key} className="break-words">
                    <dt className="font-semibold">
                      {(
                        {
                          subject: "หัวเรื่อง",
                          reason: "เหตุผล",
                          target_id: "เป้าหมาย",
                          effective_on: "วันมีผล",
                          new_location: "ที่ตั้งใหม่",
                        } as Record<string, string>
                      )[key] ?? key}
                    </dt>
                    <dd>{value || "ยังไม่ระบุ"}</dd>
                  </div>
                ))}
              </dl>
              <p>หลักฐาน {evidence.length} รุ่น</p>
              {missing.length > 0 && (
                <p className="text-red-800">ส่งไม่ได้: {missing.join(" / ")}</p>
              )}
              <p>ระบบตรวจสิทธิ์และความครบถ้วนซ้ำก่อนบันทึกและส่ง</p>
              <button
                disabled={busy || missing.length > 0}
                onClick={() => save(true)}
                className="rounded bg-primary p-3 text-white"
              >
                บันทึกและส่งตรวจ
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              disabled={busy}
              onClick={() => save(false)}
              className="rounded border p-3"
            >
              บันทึกร่าง
            </button>
            {step < 4 && (
              <button
                disabled={busy}
                onClick={() => setStep(step + 1)}
                className="rounded border p-3"
              >
                ถัดไป
              </button>
            )}
            <button
              disabled={busy}
              onClick={clear}
              className="rounded border p-3"
            >
              เริ่มร่างใหม่
            </button>
          </div>
        </div>
      )}
      <h2 className="text-xl font-semibold">เรื่องของฉันและคิวตามสิทธิ์</h2>
      {!rows.length ? (
        <p>ยังไม่มีคำขอในขอบเขตของคุณ</p>
      ) : (
        rows.map((row) => {
          const owner = row.created_by_account_id === accountId;
          const actions =
            owner && ["draft", "submitted", "returned"].includes(row.status)
              ? ["cancelled"]
              : !owner &&
                  row.status === "submitted" &&
                  has("requests.review", row.organization_id)
                ? ["returned", "reviewed"]
                : !owner &&
                    row.status === "reviewed" &&
                    has("requests.approve", row.organization_id)
                  ? ["approved", "rejected"]
                  : [];
          return (
            <article
              key={row.id}
              className="space-y-3 rounded-xl border bg-white p-5"
            >
              <h3 className="text-lg font-semibold">
                {row.payload.subject || "ร่างยังไม่มีหัวเรื่อง"} ·{" "}
                {statusLabel[row.status]}
              </h3>
              <p className="break-all">
                เลขติดตาม {row.tracking_code} · รุ่น {row.revision}
              </p>
              <p>{row.payload.reason}</p>
              <p>
                วันมีผล {row.payload.effective_on || "ยังไม่ระบุ"} · ที่ตั้งใหม่{" "}
                {row.payload.new_location || "ไม่ระบุ"}
              </p>
              <div>
                หลักฐานที่ส่งตรวจ:{" "}
                {row.file_version_ids.map((id) => (
                  <a
                    key={id}
                    href={"/api/documents/versions/" + id}
                    className="mr-3 inline-block underline"
                  >
                    ดาวน์โหลดรุ่น {id.slice(0, 8)}
                  </a>
                ))}
              </div>
              {owner && ["draft", "returned"].includes(row.status) && (
                <button
                  onClick={() => resume(row)}
                  className="rounded border p-3"
                >
                  แก้ร่างเดิม
                </button>
              )}
              {!!actions.length && (
                <form action={act} className="grid gap-3">
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="revision" value={row.revision} />
                  <label>
                    คำตัดสิน
                    <select name="action" className="block rounded border p-2">
                      {actions.map((action) => (
                        <option key={action} value={action}>
                          {statusLabel[action]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    เหตุผล (อย่างน้อย 10 ตัวอักษร)
                    <textarea
                      name="reason"
                      minLength={10}
                      required
                      className="block min-h-20 w-full rounded border p-2"
                    />
                  </label>
                  <button
                    disabled={busy}
                    className="rounded bg-primary p-3 text-white"
                  >
                    บันทึกคำตัดสินรุ่นนี้
                  </button>
                </form>
              )}
              <details>
                <summary>ประวัติคำตัดสินและหลักฐานรุ่น</summary>
                <p className="break-all">
                  Hash รุ่นปัจจุบัน {row.snapshot_hash}
                </p>
                <ol>
                  {row.decisions.map((d, i) => (
                    <li key={i} className="my-2 break-all">
                      รุ่น {d.revision} · {statusLabel[d.decision]} · {d.reason}
                      <br />
                      วันที่{" "}
                      {new Date(d.decided_at).toLocaleString("th-TH", {
                        timeZone: "Asia/Bangkok",
                      })}{" "}
                      · การมอบหมาย {d.authority_assignment_id} · hash{" "}
                      {d.snapshot_hash}
                    </li>
                  ))}
                </ol>
              </details>
            </article>
          );
        })
      )}
    </section>
  );
}
