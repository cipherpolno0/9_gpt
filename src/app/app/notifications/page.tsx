import { redirect } from "next/navigation";
import { currentIdentity } from "@/server/portal/auth";
import { rpc } from "@/server/workflow/rpc";
import { PortalError } from "@/server/portal/config";
import { Notices } from "@/ui/workflow/notices";
import type { NoticeRow } from "@/shared/workflow/types";
export default async function Page() {
  const identity = await currentIdentity();
  if (!identity) redirect("/login");
  let rows: NoticeRow[] | undefined;
  let message = "";
  try {
    rows = await rpc<NoticeRow>("notifications");
  } catch (e) {
    message = e instanceof PortalError ? e.message : "บริการยังไม่พร้อม";
  }
  return (
    <>
      <h1 className="mb-6 text-3xl font-semibold">แจ้งเตือนในเว็บไซต์</h1>
      {rows ? <Notices rows={rows} /> : <p role="status">{message}</p>}
    </>
  );
}
