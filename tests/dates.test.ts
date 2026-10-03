import test from "node:test";
import assert from "node:assert/strict";
import {
  bangkokDateKey,
  bangkokDayStart,
  buddhistYear,
  formatThaiInstant,
  formatThaiDateOnly,
  isWithinBangkokDays,
} from "../src/shared/dates/bangkok";

test("วันไทยเปลี่ยนที่17:00UTC ทั้งก่อนและหลังเที่ยงคืน", () => {
  assert.equal(bangkokDateKey("2026-12-31T16:59:59.999Z"), "2026-12-31");
  assert.equal(bangkokDateKey("2026-12-31T17:00:00Z"), "2027-01-01");
  assert.equal(
    bangkokDayStart("2027-01-01").toISOString(),
    "2026-12-31T17:00:00.000Z",
  );
  assert.match(formatThaiInstant("2026-12-31T17:00:00Z"), /2570/);
  assert.equal(buddhistYear(2026), 2569);
});
test("หน้าต่างวันไทยเริ่มรวมปลายจบไม่รวม; ไม่ใช้วันUTCตัดสิทธิ์", () => {
  assert.equal(
    isWithinBangkokDays("2026-10-02T16:59:59Z", "2026-10-03", "2026-10-04"),
    false,
  );
  assert.equal(
    isWithinBangkokDays("2026-10-02T17:00:00Z", "2026-10-03", "2026-10-04"),
    true,
  );
  assert.equal(
    isWithinBangkokDays("2026-10-03T16:59:59.999Z", "2026-10-03", "2026-10-04"),
    true,
  );
  assert.equal(
    isWithinBangkokDays("2026-10-03T17:00:00Z", "2026-10-03", "2026-10-04"),
    false,
  );
});
test("date-only ไม่เลื่อนวัน และปฏิเสธวันที่กำกวม/วันที่ไม่มีจริง", () => {
  assert.match(formatThaiDateOnly(new Date("2026-01-01T00:00:00Z")), /2569/);
  assert.throws(() => bangkokDayStart("2026-02-29"));
  assert.equal(
    bangkokDayStart("2028-02-29").toISOString(),
    "2028-02-28T17:00:00.000Z",
  );
  assert.throws(() => bangkokDateKey("2026-10-03T12:00:00"));
  assert.throws(() => bangkokDayStart("03/10/69"));
  assert.throws(() => buddhistYear(2569));
});
