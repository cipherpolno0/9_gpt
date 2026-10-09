import { PortalError } from "./config";
export function registryFilter(params: URLSearchParams) {
  const q = (params.get("q") ?? "").normalize("NFC").trim();
  const raw = params.get("page") ?? "1";
  if (
    q.length > 80 ||
    !/^\d{1,3}$/.test(raw) ||
    Number(raw) < 1 ||
    Number(raw) > 800
  )
    throw new PortalError(400, "คำค้นหรือเลขหน้าไม่ถูกต้อง");
  const page = Number(raw);
  return {
    q,
    page,
    offset: (page - 1) * 25,
    pattern: "%" + q.replace(/[\\%_]/g, "\\$&") + "%",
  };
}
