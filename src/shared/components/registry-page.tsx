import Link from "next/link";
import { registry, type RegistryKind } from "@/server/portal/registry";
import { PortalError } from "@/server/portal/config";
import { redirect } from "next/navigation";
export async function RegistryPage({
  kind,
  query,
}: {
  kind: RegistryKind;
  query: { q?: string; page?: string };
}) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.page) params.set("page", query.page);
  let result;
  try {
    result = await registry(kind, params);
  } catch (e) {
    if (e instanceof PortalError && e.status === 401) redirect("/login");
    if (e instanceof PortalError && (e.status === 400 || e.status === 403))
      return (
        <p
          role="alert"
          className="rounded-xl border border-border bg-white p-6"
        >
          {e.message}
        </p>
      );
    throw e;
  }
  const href = (page: number) =>
    "/app/" +
    kind +
    "?" +
    new URLSearchParams({ q: result.q, page: String(page) });
  return (
    <>
      <h1 className="text-3xl font-semibold">
        {kind === "people" ? "ทะเบียนบุคคล" : "ทะเบียนหน่วยงาน"}
      </h1>
      <p className="mt-3 text-muted-foreground">
        แสดงข้อมูลที่มีผลปัจจุบัน เฉพาะหน่วยงานที่ได้รับสิทธิ์
      </p>
      <form className="my-6 flex flex-wrap gap-3">
        <label htmlFor="q" className="sr-only">
          ค้นชื่อหรือรหัส
        </label>
        <input
          id="q"
          name="q"
          defaultValue={result.q}
          maxLength={80}
          placeholder="ค้นชื่อหรือรหัส"
          className="min-w-0 grow rounded-lg border border-border bg-white p-3"
        />
        <button className="rounded-lg bg-primary px-5 py-3 text-white">
          ค้นหา
        </button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-left">
          <caption className="p-4 text-left">
            รายการหน้า {result.page} · อ่านข้อมูลเมื่อ{" "}
            {new Date(result.asOf).toLocaleString("th-TH", {
              timeZone: "Asia/Bangkok",
            })}
          </caption>
          <thead className="bg-secondary">
            <tr>
              <th scope="col" className="p-4">
                รหัสอ้างอิง
              </th>
              <th scope="col" className="p-4">
                ชื่อ
              </th>
              <th scope="col" className="p-4">
                รุ่นข้อมูล
              </th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr key={row.code} className="border-t border-border">
                <td className="p-4">{row.code}</td>
                <td className="p-4">{row.name || "ยังไม่มีชื่อที่มีผล"}</td>
                <td className="p-4">{row.revision}</td>
              </tr>
            ))}
            {result.rows.length === 0 && (
              <tr>
                <td colSpan={3} className="p-6">
                  ไม่พบรายการที่อ่านได้ตามคำค้นและสิทธิ์ปัจจุบัน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <nav aria-label="หน้ารายการ" className="mt-5 flex gap-6">
        {result.page > 1 && (
          <Link className="underline" href={href(result.page - 1)}>
            หน้าก่อนหน้า
          </Link>
        )}
        {result.hasMore && result.page < 800 && (
          <Link className="underline" href={href(result.page + 1)}>
            หน้าถัดไป
          </Link>
        )}
      </nav>
    </>
  );
}
