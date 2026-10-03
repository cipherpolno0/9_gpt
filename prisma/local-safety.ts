export function assertLocalDatabase(
  raw: string | undefined,
  environment: string | undefined,
  mode: "demo" | "test",
): string {
  if (!raw || !["local", "test"].includes(environment ?? "")) {
    throw new Error("อนุญาตเฉพาะ APP_ENV=local/test และ URL ฐานทดลอง");
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("URL ฐานทดลองไม่ถูกต้อง");
  }
  const database = url.pathname.slice(1);
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    url.search !== "" ||
    url.hash !== "" ||
    !(
      mode === "demo"
        ? /^sangha_ch06_demo(?:_[a-z0-9]+)?$/
        : /^sangha_ch06_test(?:_[a-z0-9]+)?$/
    ).test(database)
  ) {
    throw new Error("ปฏิเสธเป้าหมายที่ไม่ใช่ฐานทดลองบท06บน loopback");
  }
  return raw;
}
