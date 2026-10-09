import { redirect } from "next/navigation";
import { currentIdentity } from "@/server/portal/auth";
import { rpc } from "@/server/workflow/rpc";
import { PortalError } from "@/server/portal/config";
import { Files } from "@/ui/workflow/files";
import type { FileRow } from "@/shared/workflow/types";
export default async function Page() {
  const identity = await currentIdentity();
  if (!identity) redirect("/login");
  let rows: FileRow[] | undefined;
  let message = "";
  try {
    rows = await rpc<FileRow>("files");
  } catch (e) {
    message = e instanceof PortalError ? e.message : "บริการยังไม่พร้อม";
  }
  return (
    <>
      <h1 className="mb-6 text-3xl font-semibold">เอกสารและหลักฐานกลาง</h1>
      {rows ? (
        <Files rows={rows} grants={identity.grants} />
      ) : (
        <p role="status">{message}</p>
      )}
    </>
  );
}
