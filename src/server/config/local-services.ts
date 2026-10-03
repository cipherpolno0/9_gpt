type Values = Record<string, string | undefined>;

export function localServices(values: Values) {
  if (values.APP_ENV !== "local")
    throw new Error("ต้องกำหนดสภาพแวดล้อมเป็นเครื่องตนเอง");
  const parse = (value: string | undefined, protocols: string[]) => {
    if (!value) throw new Error("ยังตั้งค่าบริการไม่ครบ");
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new Error("รูปแบบค่าบริการไม่ถูกต้อง");
    }
    if (
      !protocols.includes(url.protocol) ||
      !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)
    ) {
      throw new Error("บทนี้อนุญาตบริการในเครื่องตนเองเท่านั้น");
    }
    if (url.search || url.hash)
      throw new Error("ไม่รับค่าบริการที่มีตัวเลือกเพิ่มเติมในบทนี้");
    return value;
  };
  return {
    databaseUrl: parse(values.DATABASE_URL, ["postgresql:", "postgres:"]),
    redisUrl: parse(values.REDIS_URL, ["redis:"]),
  };
}
