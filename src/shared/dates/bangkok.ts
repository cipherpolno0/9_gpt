/** Instants are Gregorian/UTC; only presentation uses Buddhist year. */
export const BUSINESS_TIME_ZONE = "Asia/Bangkok";

function validInstant(value: Date | string): Date {
  if (typeof value === "string" && !/(Z|[+-]\d{2}:\d{2})$/.test(value)) {
    throw new RangeError("วันเวลาต้องมี Z หรือ offset ชัดเจน");
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()))
    throw new RangeError("วันเวลาไม่ถูกต้อง");
  return date;
}

export function bangkokDateKey(value: Date | string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    calendar: "gregory",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(validInstant(value));
  const part = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** Date-only field -> midnight in Bangkok. Never parse ambiguous Thai input. */
export function bangkokDayStart(dateKey: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey))
    throw new RangeError("ใช้ YYYY-MM-DD ค.ศ.");
  const result = new Date(`${dateKey}T00:00:00+07:00`);
  if (
    !Number.isFinite(result.getTime()) ||
    bangkokDateKey(result) !== dateKey
  ) {
    throw new RangeError("วันที่ไม่มีอยู่จริง");
  }
  return result;
}

/** Both bounds are exclusive/inclusive instants: [start, end). */
export function isWithinBangkokDays(
  value: Date | string,
  startsOn: string,
  endsOn: string,
): boolean {
  const start = bangkokDayStart(startsOn).getTime();
  const end = bangkokDayStart(endsOn).getTime();
  if (end <= start) throw new RangeError("วันสิ้นสุดต้องหลังวันเริ่ม");
  const instant = validInstant(value).getTime();
  return instant >= start && instant < end;
}

export function buddhistYear(labelYearCe: number): number {
  if (
    !Number.isInteger(labelYearCe) ||
    labelYearCe < 1900 ||
    labelYearCe > 2200
  ) {
    throw new RangeError("ระบุปี ค.ศ. ที่รองรับ");
  }
  return labelYearCe + 543;
}

export function formatThaiInstant(value: Date | string): string {
  return new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(validInstant(value));
}

/** PostgreSQL DATE arrives from Prisma as UTC midnight; keep its date component. */
export function formatThaiDateOnly(value: Date): string {
  return new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(validInstant(value));
}
