import { rpc, requireUuid } from "@/server/workflow/rpc";
import { privateHeaders, handle } from "@/server/workflow/http";
import { readObject } from "@/server/documents/storage";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const id = requireUuid((await params).id);
    const [file] = await rpc<{
      object_key: string;
      sha256: string;
      size_bytes: number;
      label: string;
      mime_type: string;
    }>("fileRead", [id]);
    const bytes = await readObject(
      file.object_key,
      file.sha256,
      file.size_bytes,
    );
    // Revalidate session + ACL after external I/O and before returning any bytes.
    await rpc("fileRead", [id]);
    return new Response(new Uint8Array(bytes), {
      headers: {
        ...privateHeaders,
        "Content-Type": file.mime_type,
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "sandbox; default-src 'none'",
        "Content-Disposition":
          "attachment; filename=\"document\"; filename*=UTF-8''" +
          encodeURIComponent(file.label),
      },
    });
  });
}
