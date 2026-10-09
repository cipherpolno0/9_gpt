import { redirect } from "next/navigation";
import { currentIdentity } from "@/server/portal/auth";
import { rpc } from "@/server/workflow/rpc";
import { PortalError } from "@/server/portal/config";
import { Requests } from "@/ui/workflow/requests";
import type { FileRow, RequestRow } from "@/shared/workflow/types";
export default async function Page() {
  const identity = await currentIdentity();
  if (!identity) redirect("/login");
  let data: { rows: RequestRow[]; files: FileRow[] } | undefined;
  let message = "";
  try {
    const [rows, files] = await Promise.all([
      rpc<RequestRow>("requests"),
      rpc<FileRow>("files"),
    ]);
    data = { rows, files };
  } catch (e) {
    message = e instanceof PortalError ? e.message : "บริการยังไม่พร้อม";
  }
  return (
    <>
      <h1 className="mb-6 text-3xl font-semibold">คำขอและคิวตรวจ</h1>
      {data ? (
        <Requests
          {...data}
          grants={identity.grants}
          accountId={identity.accountId}
        />
      ) : (
        <p role="status">{message}</p>
      )}
    </>
  );
}
