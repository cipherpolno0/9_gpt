# Accessibility review — บท 69

รุ่น 0.1 | 9 ตุลาคม 2569 | source `fc22ce8` | **PARTIAL_SOURCE_REVIEW / BROWSER_NOT_RUN**

ตรวจต้นฉบับ starter และ HTML ที่ HTTP คืนจริง เป้าหมายเสนอ WCAG 2.2 AA อยู่ Q018/TO VERIFY ยังไม่มีการรับรองทั้งเว็บไซต์ ตัวตรวจอัตโนมัติและการอ่าน source ไม่แทน keyboard/screen reader และเจ้าหน้าที่/ผู้เรียนตรวจใช้จริง

## ผลตรวจที่ทำจริง

HTML `/` มี `lang="th"`, h1 หนึ่งรายการ, main หนึ่งรายการ, skip link `#main-content` ตรง id และชื่อเว็บไทยครบ Source มี main `tabIndex={-1}`, section `aria-labelledby` ตรงหัวข้อ และข่าวไม่มีข้อมูลในรูปข้อความ ฟอนต์ Sarabun โหลดจากไฟล์ในโครงการ ข้อค้นพบเหล่านี้ยืนยันโครงสร้างที่ประกาศเท่านั้น ยังไม่ได้ทดลองว่ากด Tab/Enter แล้ว focus ย้ายจริง, หัวข้ออ่านถูกลำดับหรือภาษาไทยออกเสียงถูกต้อง

คำนวณ contrast จาก sRGB ที่ประกาศใน `src/app/globals.css` และ class ของหน้า starter ด้วย relative luminance; ตัวเลขเทียบ 4.5:1 ก่อนปัดเศษ คู่นี้เป็นข้อความขนาดปกติแบบ opaque ใน default state ไม่มีการวัดสี computed หลัง hover/focus/opacity/overlay หรือ screenshot

| คู่สี               | foreground / background | ratio คำนวณ | ผลเฉพาะ numeric threshold |
| ------------------- | ----------------------- | ----------- | ------------------------- |
| body                | #0f172a / #f8fafc       | 17.062934:1 | ≥ 4.5                     |
| primary text        | #1e3a8a / #f8fafc       | 9.899858:1  | ≥ 4.5                     |
| muted page          | #475569 / #f8fafc       | 7.242511:1  | ≥ 4.5                     |
| muted card          | #475569 / #ffffff       | 7.577664:1  | ≥ 4.5                     |
| default button text | #ffffff / #1e3a8a       | 10.357982:1 | ≥ 4.5                     |

สูตรและเกณฑ์อ้าง [W3C Understanding SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html); ขั้นต้นใช้ [WAI Easy Checks](https://www.w3.org/WAI/test-evaluate/preliminary/) ซึ่งไม่ใช่การตรวจทุกข้อ ความครบถ้วนต้องทดสอบ flow จริงและผู้ใช้ ไม่กล่าวว่าเว็บผ่าน WCAG จากห้าคู่สีนี้ ไม่มีปัญหา runtime ที่พิสูจน์ด้วย browser รอบนี้ จึงไม่แก้ UI จากการคาดเดา

## Review matrix

| รหัส   | ตรวจอะไรและเกณฑ์                                                                                                                                      | สถานะจริง / หลักฐาน                                                                                | ผู้ตรวจเสนอ              |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------ |
| A69-01 | language/landmarks/หัวข้อ/skip target และ contrast                                                                                                    | PARTIAL_SOURCE_REVIEW; [actual JSON](../tests/results/lesson69-results.json), ห้าคู่สีและ HTML     | C02                      |
| A69-02 | Tab/Shift+Tab/Enter/Escape, skip focus, ไม่มี trap, focus visible/not obscured, error summary กลับไป field ได้                                        | NOT_RUN; ต้อง browser และทุก flow บท 68                                                            | C02 + ผู้แทนผู้ใช้       |
| A69-03 | NVDA+Firefox หรือ VoiceOver+Safari รุ่นจริง: อ่านไทย, labels, roles, states, ตาราง, loading/errors, เวลาแบบทดสอบและ announcements                     | NOT_RUN; ต้องกำหนด OS/browser/reader และผู้ตรวจจริง ห้ามแทนด้วย accessibility tree อย่างเดียว      | C02 + O03 + ผู้แทนผู้ใช้ |
| A69-04 | axe บนหน้าและแต่ละ modal/error/loading/returned state; triage severity พร้อม manual validation                                                        | NOT_RUN; axe-core/@playwright/test ไม่มี, bundled browser ไม่มี ไม่รายงาน zero violations          | C02                      |
| A69-05 | มือถือ 375×812, 768×1024, desktop 1440×900, reflow 320 CSS px/zoom 400%, touch targets, portrait/landscape                                            | NOT_RUN; viewport จำลองแยกจากอุปกรณ์จริง บันทึก screenshot TEST เท่านั้น                           | C02 + ผู้ใช้             |
| A69-06 | PDF/Excel ไทย: วรรณยุกต์ไม่ตัด, text selection/read order, headings/table structure, A4, ศูนย์นำหน้าคงเดิม; accessible alternative หาก PDF ไม่ tagged | NOT_RUN; ไม่มี export จริง ไม่ถือว่า HTTP HTML/ฟอนต์ยืนยัน PDF/Excel                               | O05 + O08 + O09          |
| A69-07 | caption ไทยสัมพันธ์เวลา/transcript สำหรับ media, keyboard controls, ไม่ autoplayเสียง, alt ตามเนื้อหา                                                 | NO_CONTENT_TO_TEST; starter ไม่มีสื่อ ต้องทดสอบ media จริงเมื่อ CMS พร้อม ไม่ปิดเป็น PASS ทั้งระบบ | O03 + C04                |
| A69-08 | ฟอร์มครบทุกขั้น, Thai date/calendar labels, errors ไม่พึ่งสี, progress และ timeout/extend ตามกฎ, answers ไม่หาย                                       | NOT_RUN; wizard/import/quiz ยังไม่มีบริการ                                                         | O03 + O04 + O09          |
| A69-09 | ไม่ใส่ชื่อ/ข้อมูลลับใน accessible name, aria-live, hidden DOM, PDF metadata, search snippet ของอีก scope                                              | NOT_RUN; ต้อง current Auth A/B และไฟล์กลาง positive/negative                                       | C03 + C02                |

## วิธีทดสอบเมื่อ dependency พร้อม

1. ใช้ isolated central TEST accounts คนละบทบาทและสิทธิ์จริงตามบท 68 ไม่มีทะเบียนหรือ login สำรอง และไม่ใช้ client clock เปลี่ยนสิทธิ์
2. บันทึก commit, browser/OS/reader version, viewport/zoom, flow/state และ expectation ของแต่ละ case ไม่เติมผู้ตรวจหรือวันที่ตรวจล่วงหน้า
3. กด keyboard ใน browser จริงจนส่ง/แก้ error สำเร็จ ใช้ screen reader จริงอ่าน feedback; แยกปัญหา browser, timing, labels และ source ไม่ใช้ผล axe แทน manual
4. รัน axe ตรวจ state ที่เปิดจริง จัด issue เป็น id/route/state/severity/steps/expected/actual แล้วแก้ต้นเหตุและรัน case ที่เกี่ยวข้องซ้ำ เก็บผลก่อน/หลัง
5. ตรวจไฟล์ export จาก snapshot/filter เดียวกันด้วยเครื่องมืออ่านจริง และให้ผู้แทนผู้ใช้ตรวจภาษาไทย ไม่ผลิตฟอร์มทางการที่ TO VERIFY
6. screenshots/trace/HAR/storage state ต้องตรวจ privacy/credential และเก็บผ่าน private ACL/scan ห้าม commit authenticated raw trace แม้ข้อมูลชื่อ TEST เช่นเดียวกับ [UAT_MASTER](UAT_MASTER.md)

Current execution: browser, keyboard, screen reader, axe, mobile rendering, PDF/Excel และ media captions **ยังไม่ได้รัน**; actual screenshots/tester signoff ว่างทั้งหมด ไม่มีการเซ็นรับรอง accessibility แทนผู้ใช้ เมื่อข้อมูลยังไม่พร้อมต้องคง blocker และไม่เริ่มบท 70
