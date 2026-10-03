# ข้อกำหนดและกรณีใช้งาน — เว็บไซต์กองบริหารทะเบียนและวัดผล

บทที่ 02: เขียนข้อกำหนดและสิทธิ์ที่ตรวจรับได้ | รุ่นเอกสาร 1.2 | 3 ตุลาคม 2569 (2026-10-03)

## 1 แนวคิดและขอบเขตของบท

Use case คือเรื่องที่ผู้ใช้ทำตั้งแต่เริ่มจนได้ผล เช่น “อัปโหลดไฟล์แล้วตรวจข้อผิดพลาด” Acceptance คือผลที่นับหรือสังเกตได้ว่าเรื่องนั้นผ่าน เช่น “ไฟล์ผิด 1 แถวต้องยังไม่เพิ่มใบสมัคร” Traceability คือการตามรหัสเดียวจากข้อกำหนดไปหน้าจอ ข้อมูล บริการ และการทดสอบ

บท 01 ผ่านเอกสารและ Git ที่ commit `f3bbce8` โครงการใช้บัญชี person organization application เอกสารและหน้ากลางชุดเดียวตาม [BLUEPRINT](../BLUEPRINT.md) และ [MASTER](../00_MASTER_PROMPT.md) ใช้เทคโนโลยี Supabase/Vercel ล่าสุด

บท 02 จัดทำสัญญาออกแบบและกรณีทดสอบเท่านั้น ชื่อ tables/services/routes/API เป็น **Proposal** ยังไม่มี UI, schema, migrations, RLS หรือระบบทดสอบ runtime ผลทดสอบใน catalog ทุกกรณีคือ **PLANNED / NOT RUN** การตรวจเอกสารไม่ใช้แทนผล API หรือ RLS จริง

ทุก use case อยู่ภายใต้ข้อกำหนดร่วม REQ-C01–REQ-C20 จาก [Charter](PROJECT_CHARTER.md) สิทธิ์ P01–P11 และเงื่อนไขใน [PERMISSIONS](PERMISSIONS.md) กฎทางการอยู่ Q001–Q020 ไม่เดาชื่อแบบ/ตำแหน่ง/ระเบียบ เจ้าของตาม O01–O09/C01–C04 ยังเป็นบทบาทเสนอ ไม่ใช่การแต่งตั้งบุคคลจริง

### คำที่ใช้บ่อยในเอกสาร

| คำ | ความหมายภาษาง่าย |
|---|---|
| Actor / Input / Process / Output | ผู้ทำรายการ / ข้อมูลที่กรอก / ขั้นตอนทำงาน / ผลที่ได้รับ |
| Permission / Validation / Error / Acceptance / Audit | สิทธิ์ / ตรวจความถูกต้อง / ข้อผิดพลาด / เกณฑ์ผ่าน / หลักฐานย้อนหลัง |
| API | ช่องทางที่โปรแกรมเรียกข้อมูลหรือทำรายการ การเรียกตรงคือไม่ผ่านปุ่มบนหน้าเว็บ |
| backend service | ส่วนทำงานเบื้องหลังที่รักษากฎ เช่น ตรวจใบสมัคร ก่อนบันทึก |
| grant / scope / ACL | สิทธิ์ที่มอบหมาย / รายการหรือพื้นที่ที่รับผิดชอบ / รายชื่อผู้มีสิทธิ์เข้าถึงเอกสาร |
| RLS | กฎที่ฐานข้อมูลใช้จำกัดแถวข้อมูลตามสิทธิ์ แม้เรียกฐานข้อมูลโดยตรง |
| happy path | กรณีผู้มีสิทธิ์กรอกข้อมูลถูกต้อง แล้วทำรายการสำเร็จตามขั้นตอน |
| native Data API | ช่องทางเรียกฐานข้อมูลของ Supabase โดยตรง แยกจาก API ที่เว็บไซต์สร้าง |
| payload / DTO | ข้อมูลที่ส่งไปมา / ชุดข้อมูลที่เลือกส่งเฉพาะฟิลด์ที่อนุญาต |
| snapshot / version | สำเนาข้อมูล ณ วันทำรายการ / รุ่นข้อมูลที่ใช้อ้างอิงย้อนหลัง |
| transaction / idempotency | ชุดงานที่ต้องสำเร็จหรือย้อนกลับร่วมกัน / กดซ้ำแล้วไม่เกิดรายการซ้ำ |
| receipt / correlation_id | ใบยืนยันผลรายการ / รหัสตามรอยงานเดียวกันข้ามหลายขั้น |
| quarantine / scan | กักไฟล์ยังไม่ให้ใช้ / ตรวจไฟล์ก่อนอนุญาตเข้าถึง |
| outbox / worker | รายการงานรอทำที่ผูกกับธุรกรรม / ตัวทำงานเบื้องหลัง |
| RPO / RTO | ช่วงข้อมูลที่ยอมสูญเสียได้ / เวลาที่ต้องใช้คืนบริการ ต้องวัดและรับรองก่อนใช้จริง |
| PLANNED / NOT RUN | วางกรณีทดสอบไว้แล้ว แต่ยังไม่ได้รันกับระบบจริง |

## 2 เงื่อนไขร่วมและสัญญาข้อผิดพลาด

ในข้อมูลทดสอบให้มีสายสมมติ A/B คน A/B หน่วย A/ลูกA/หน่วยB และ assignment มีช่วงเวลา ตรวจ actorจาก sessionที่เชื่อถือได้ ไม่ใช้ role/person/organizationที่ clientส่งเป็นหลักฐาน authority ผู้สร้างห้ามอนุมัติเรื่องสำคัญของตน การเห็นเมนูหรือโหลดหน้าได้ไม่ใช่การอนุญาต API

| เงื่อนไขของ app API | ผลที่กำหนดเสนอ | การแก้ไข/หลักฐาน |
|---|---|---|
| ไม่มี session/หมดอายุ/tokenไม่ถูก | 401 ไม่คืนข้อมูลภายใน | เข้าสู่ระบบกลางแล้วกลับงานเดิม ร่างที่เคยมีสิทธิ์แก้เก็บตาม policy |
| ตัวตนถูกแต่ actionไม่มี grant | 403 ไม่ทำ mutation | errorไทยแบบไม่เผยข้อมูล private และ correlation_id |
| objectไม่อยู่ใน scope/ACL หรือไม่พบจริง | 404 รูปแบบเดียวกัน | ไม่เผยว่า objectของสายอื่นมีอยู่ |
| รุ่นเก่า ขั้นตอนผิด keyเดิมแต่payloadต่าง | 409 ไม่มีผลบางส่วน | reloadรุ่นที่มีสิทธิ์ หรือคืนreceiptเดิมถ้าเป็น retrypayloadเดียว |
| ข้อมูลไม่ผ่าน schema/กฎ | 422 พร้อมฟิลด์/เลขแถวที่มีสิทธิ์ดู | เก็บร่าง/รายงานerror; ไม่เดาแบบหรือปี |
| ไฟล์เกินเพดาน/ผิดชนิด | 413 / 415 | รักษา quarantine และไม่สร้างธุรกรรมใบสมัคร |
| scan/job/บริการไม่พร้อม | 503 หรือสถานะ queued/failedที่ชัด | retryตาม receipt และสิทธิ์ล่าสุด; ไม่มีธุรกรรมค้างบางส่วน |

Supabase native Data API อาจตอบชุดว่างเมื่อ RLS ซ่อนแถว หรือปฏิเสธ/เปลี่ยน 0 แถวเมื่อเขียนผิดสิทธิ์ จึงทดสอบ **ไม่คืนข้อมูล/ไม่เปลี่ยนข้อมูล** ไม่กำหนดว่าต้องเป็น403เสมอ ทุกระบบมี testเรียก app APIตรงและ testเรียก native APIตรงโดยไม่ผ่าน UI ผู้ไม่มี session/private grantไม่คืนข้อมูล และทุก updateตรวจ new values ไม่เพียงใช้scopeของrecordเดิม

successful business mutation ต้องมี audit_logs ร่วมธุรกรรม; auditล้มเหลวแล้วธุรกรรมต้องไม่สำเร็จ logมี actor/action/target/time/correlation/ruleversionตามจำเป็น ไม่เก็บ secret หรือ payloadส่วนตัวทั้งชุด การถูกปฏิเสธผ่าน app APIเก็บ access_denied metadataแบบลดข้อมูล; direct native APIที่ข้าม appจะพิสูจน์จากผลทดสอบและบันทึกบริการที่ตั้งค่า ไม่อ้างว่า appเห็น/บันทึกทุกSELECTที่เรียกตรง หากต้องเก็บครบต้องออกแบบหลักฐานเพิ่มเติมก่อนเปิดจริง

## 3 Use cases ครบ 9 ระบบและบริการกลาง

| รหัส UC | ระบบ | เรื่อง | REQ หลัก |
| --- | --- | --- | --- |
| UC-S01-01 | 01 | ตรวจข้อมูลของตนและทะเบียนตามพื้นที่ | REQ-S01 |
| UC-S01-02 | 01 | เสนอแก้/ย้ายและทำให้ประวัติมีผล | REQ-S01 |
| UC-S02-01 | 02 | ดูและปรับทะเบียนหน่วยงาน/ที่ตั้ง | REQ-S02 |
| UC-S02-02 | 02 | เปิดสนามรายรอบและมอบหมายผู้รับข้อสอบ | REQ-S02 |
| UC-S03-01 | 03 | ก่อนเรียน–บทเรียน–หลังเรียนและความก้าวหน้า | REQ-S03 |
| UC-S03-02 | 03 | จัดทำ ตรวจ และเผยแพร่บทเรียน/คำถาม | REQ-S03 |
| UC-S04-01 | 04 | สร้างและส่งคำขอจัดตั้ง/ยุบ/เปลี่ยนสนาม | REQ-S04 |
| UC-S04-02 | 04 | ตรวจ อนุมัติ ทำให้มีผลและติดตามคำขอ | REQ-S04 |
| UC-S05-01 | 05 | สมัคร ตรวจคุณสมบัติ อนุมัติและออกที่นั่ง | REQ-S05 |
| UC-S05-02 | 05 | รับคะแนน ตรวจรับรอง และเผยแพร่ผล | REQ-S05 |
| UC-S05-03 | 05 | ค้นผลสอบแยกปีและข้อมูลเผยแพร่ | REQ-S05 |
| UC-S06-01 | 06 | จัดสรร จอง และเปลี่ยนเป็นผูกพัน | REQ-S06 |
| UC-S06-02 | 06 | บันทึกจ่าย กลับรายการและรายงานปีงบ | REQ-S06 |
| UC-S07-01 | 07 | ขอซื้อ ตรวจรับและเคลื่อนไหววัสดุ | REQ-S07 |
| UC-S07-02 | 07 | ครุภัณฑ์ ผู้ถือครอง ยืมคืน ซ่อมและตรวจนับ | REQ-S07 |
| UC-S08-01 | 08 | ลงทะเบียนหนังสือ ส่งตรวจและส่งตามรุ่น | REQ-S08 |
| UC-S08-02 | 08 | อ่าน รับทราบ มอบหมาย ดาวน์โหลดและพิมพ์หนังสือ | REQ-S08 |
| UC-S09-01 | 09 | เทมเพลต อัปโหลดและตรวจ dry run | REQ-S09 |
| UC-S09-02 | 09 | ยืนยันนำเข้า retry และแก้ชุดที่มีข้อมูลปลายทาง | REQ-S09 |
| UC-C01 | C | บัญชีกลางและการจัดการบัญชีโดยผู้ดูแล | REQ-C01, REQ-C05, REQ-C06, REQ-C07, REQ-C11 |
| UC-C02 | C | เนื้อหาและบริการกลางสาธารณะ | REQ-C02, REQ-C03, REQ-C04, REQ-C08, REQ-C13, REQ-C15 |
| UC-C03 | C | สำรองและทดสอบกู้คืนฐานกับเอกสาร | REQ-C05, REQ-C06, REQ-C11, REQ-C20, REQ-N04 |

### UC-S01-01 — ตรวจข้อมูลของตนและทะเบียนตามพื้นที่

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | เจ้าของข้อมูล; เจ้าหน้าที่ทะเบียนที่ได้รับมอบหมาย; ผู้เยี่ยมชมใช้เฉพาะ public projection |
| Input | person_id ที่เลือก ตัวกรองปี/พื้นที่ และ session ถ้าอ่านข้อมูลภายใน |
| Process | ยืนยันตัวตนถ้าอ่านภายใน แยก read_self จาก read_scope ตรวจ person ที่ผูกบัญชีหรือ scope ที่มีผล เลือกฟิลด์ตาม visibility และประวัติที่มีสิทธิ์ |
| Output | ข้อมูลตน/ทำเนียบในขอบเขต หรือ DTO สาธารณะที่ไม่มีข้อมูลต้องห้าม |
| Permission | P01 สำหรับตน; P02 สำหรับพื้นที่; P09 เฉพาะข้อมูลที่รับรองเผยแพร่ ไม่มีสิทธิ์แก้โดยการอ่านได้ |
| Validation | รหัสบุคคลต้องเป็นรหัสกลาง ปี/ตัวกรองถูกชนิด scope มาจาก server ไม่รับ client เป็นข้อพิสูจน์ |
| Error | ภายใน session ไม่ถูกต้อง 401; รหัสข้าม scope 404; action ไม่มีสิทธิ์ 403; public ไม่มีรายการคืนชุดว่าง ไม่เผยหลักฐานส่วนตัว |
| Acceptance | บัญชีที่ผูก person A อ่านข้อมูลตน A ได้; อ่าน person B โดยแก้ URL ไม่ได้; เจ้าหน้าที่สาย A เห็นหน่วยลูกสาย A แต่ไม่เห็นสาย B; public ไม่มีข้อมูลส่วนตัว 4 กลุ่ม |
| Audit | ข้อมูล private ที่อ่านผ่านบริการบันทึก access metadata ตาม policy โดยไม่คัด payload ส่วนตัว; ไม่สร้าง business mutation log สำหรับการอ่าน |

**Happy path:** TC-S01-01-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-S01-01-A: เรียก `GET /api/people/{person_id}` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-S01-01-R: ใช้ JWTที่จำกัดสิทธิ์เรียก native Data API/StorageหรือRPCที่เกี่ยวข้องตรง พยายามอ่าน/เขียนข้อมูลของ UCโดยไม่มี grant ต้องไม่คืน private rows/ไฟล์ ไม่เปลี่ยนข้อมูล และไม่เรียก privileged RPCสำเร็จ; ไม่ใช้ service credentialของผู้ดูแลเป็นบัญชีทดสอบผู้ไม่มีสิทธิ์

**TO VERIFY:** Q001, Q002, Q008


### UC-S01-02 — เสนอแก้/ย้ายและทำให้ประวัติมีผล

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | เจ้าของข้อมูลหรือผู้แก้ทะเบียน; ผู้ตรวจ/ผู้อนุมัติที่รับมอบหมายแยกจากผู้สร้าง |
| Input | ชนิดคำขอ person_id หน้าที่เป้าหมาย รุ่นข้อมูล วันที่มีผล และ file_version หลักฐาน |
| Process | สร้างร่าง ส่งตรวจ ประเมินผลกระทบ ตรวจผู้อนุมัติและ maker-checker อนุมัติ แล้วเมื่อถึงวันมีผลจึงปิดประวัติเดิม/สร้างประวัติใหม่และทบทวนสิทธิ์ตามการมอบหมาย |
| Output | คำขอมีเลขอ้างอิง ประวัติเดิม/ใหม่พร้อม effective_at/recorded_at; บัญชีไม่รับสิทธิ์พื้นที่ใหม่อัตโนมัติจากชื่อตำแหน่ง |
| Permission | P03/P04 ภายใต้ people; P05 ต้องเป็นผู้อนุมัติเรื่องนี้ใน scope และช่วงเวลานั้น; ตรวจ old/new scope สำหรับการย้าย |
| Validation | หลักฐานผ่าน scan+ACL วันมีผลและประเภทถูก schema ผู้สร้างต่างจากผู้อนุมัติ ไม่ทับช่วงหน้าที่ที่ขัดกฎ รุ่นข้อมูลยังล่าสุด |
| Error | 422 ข้อมูลไม่ครบ; 409 รุ่นเก่าหรือหน้าที่ทับซ้อน; 403 อนุมัติตน; 404 รายการข้ามสาย; error ไม่เปลี่ยนสถานะบางส่วน |
| Acceptance | ส่งคำขอย้ายแล้วสังกัดยังเดิม; อนุมัติล่วงหน้าแล้วก่อนวันมีผลยังเดิม; ถึงวันมีผลมีประวัติใหม่ครบและข้อมูลปีเก่าไม่เปลี่ยน; ลาออก ลาสิกขาและเสียชีวิตใช้ผลกระทบแยก |
| Audit | audit_logs: create/update/submit/approve/activate/deactivate พร้อม actor และ initiating_actor ของ job, target, rule_version, correlation_id; กฎธุรกรรมกับ log สำเร็จร่วมกัน |

**Happy path:** TC-S01-02-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-S01-02-A: เรียก `POST /api/people/change-requests` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-S01-02-R: ใช้ JWTที่จำกัดสิทธิ์เรียก native Data API/StorageหรือRPCที่เกี่ยวข้องตรง พยายามอ่าน/เขียนข้อมูลของ UCโดยไม่มี grant ต้องไม่คืน private rows/ไฟล์ ไม่เปลี่ยนข้อมูล และไม่เรียก privileged RPCสำเร็จ; ไม่ใช้ service credentialของผู้ดูแลเป็นบัญชีทดสอบผู้ไม่มีสิทธิ์

**TO VERIFY:** Q001, Q002, Q005, Q006, Q016


### UC-S02-01 — ดูและปรับทะเบียนหน่วยงาน/ที่ตั้ง

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | เจ้าหน้าที่ทะเบียนหน่วยงานตาม scope และผู้ตรวจข้อมูลพื้นที่ |
| Input | organization_id ประเภท ความสัมพันธ์ parent_id ที่ตั้ง/ที่อยู่ ช่องทางติดต่อ รุ่นข้อมูลและวันมีผล |
| Process | ตรวจ read/edit scope ของต้นทางและหน่วยแม่ ตรวจซ้ำ/วงจร เสนอแก้ตาม workflow แล้วเก็บชื่อ/ที่อยู่รุ่นใหม่ ไม่เขียนทับประวัติ |
| Output | ทะเบียนกลางและรุ่นที่อยู่ใช้ได้ทุกระบบ โดยปีเก่าอ้าง snapshot เดิม |
| Permission | P02 อ่านพื้นที่; P03/P04 แก้และส่งตรวจ; P05 เฉพาะเรื่องที่ workflow กำหนด ไม่ได้สิทธิ์จากอยู่จังหวัดเดียวกัน |
| Validation | parent ตามประเภทที่รับรอง ไม่มี cycle ไม่ใช้ชื่อเป็น key การย้ายต้องมี scope ต้นทาง/ปลายทางและแผนเรื่องค้าง |
| Error | 404 หน่วยนอก scope; 403 action ไม่มีสิทธิ์; 409 รหัสซ้ำ/cycle/version conflict; 422 ที่อยู่ไม่ครบ |
| Acceptance | สร้างหน่วยสมมติหนึ่งรหัสใช้กับสมัครสอบและพัสดุได้; เปลี่ยนที่อยู่ปัจจุบันแล้ว snapshot ปีเก่าเท่าเดิม; cycle และการย้ายข้ามสายโดยไม่มี grant ถูกปฏิเสธ |
| Audit | audit_logs ของการสร้าง/แก้/ส่งตรวจ/ปิดใช้งานและความสัมพันธ์ พร้อมก่อน–หลังเป็น reference/ฟิลด์ที่จำเป็น ไม่เก็บข้อมูลส่วนตัวเต็มชุด |

**Happy path:** TC-S02-01-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-S02-01-A: เรียก `PATCH /api/organizations/{organization_id}` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-S02-01-R: ใช้ JWTที่จำกัดสิทธิ์เรียก native Data API/StorageหรือRPCที่เกี่ยวข้องตรง พยายามอ่าน/เขียนข้อมูลของ UCโดยไม่มี grant ต้องไม่คืน private rows/ไฟล์ ไม่เปลี่ยนข้อมูล และไม่เรียก privileged RPCสำเร็จ; ไม่ใช้ service credentialของผู้ดูแลเป็นบัญชีทดสอบผู้ไม่มีสิทธิ์

**TO VERIFY:** Q002, Q005, Q015


### UC-S02-02 — เปิดสนามรายรอบและมอบหมายผู้รับข้อสอบ

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | เจ้าหน้าที่สนาม/ทะเบียนและผู้มีอำนาจตามรอบ |
| Input | exam_center_id exam_session_id person_id ของประธาน/ผู้รับข้อสอบ ช่วงมอบหมาย ที่อยู่จัดส่ง และคำสั่งอ้างอิง |
| Process | ตรวจสนามแม่บทและคำสั่งมีผล สร้าง center_session มอบหมายจาก person กลาง และ snapshot ผู้รับ/ที่อยู่เมื่อจัดส่ง |
| Output | สนามรายรอบและข้อมูลจัดส่งเฉพาะรอบพร้อมหลักฐาน |
| Permission | P02/P03/P04 ตามสนามและรอบ; P05 เมื่อ workflow ต้องอนุมัติ; P07 เอกสารจัดส่งต้องมี download grant และ ACL |
| Validation | สนามยัง active วันที่เปิดอยู่ในรอบ ผู้รับมาจาก person กลาง ไม่รับชื่อแทน key การเปิดสนามซ้ำใช้ unique business key |
| Error | 409 สนามรอบเดิมซ้ำ; 422 คำสั่งยังไม่มีผล/ข้อมูลผู้รับไม่ครบ; 404 สนามข้าม scope; 403 ดาวน์โหลดข้อสอบลับแม้เป็นผู้รับจัดส่ง |
| Acceptance | หนึ่งสนามเปิดได้หลายปีด้วยคนละ center_session; เปลี่ยนผู้รับปีใหม่ไม่เปลี่ยนใบจัดส่งปีเก่า; ผู้รับข้อสอบไม่มีสิทธิ์อ่านเนื้อหาข้อสอบลับเพียงเพราะมีชื่อ |
| Audit | audit_logs ของการเปิดสนาม มอบหมายและแก้ที่อยู่ snapshot พร้อมรอบและหนังสือหลักฐาน |

**Happy path:** TC-S02-02-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-S02-02-A: เรียก `POST /api/exam-centers/{exam_center_id}/sessions` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-S02-02-R: ใช้ JWTที่จำกัดสิทธิ์เรียก native Data API/StorageหรือRPCที่เกี่ยวข้องตรง พยายามอ่าน/เขียนข้อมูลของ UCโดยไม่มี grant ต้องไม่คืน private rows/ไฟล์ ไม่เปลี่ยนข้อมูล และไม่เรียก privileged RPCสำเร็จ; ไม่ใช้ service credentialของผู้ดูแลเป็นบัญชีทดสอบผู้ไม่มีสิทธิ์

**TO VERIFY:** Q002, Q004, Q005, Q006


### UC-S03-01 — ก่อนเรียน–บทเรียน–หลังเรียนและความก้าวหน้า

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | ผู้เรียนที่ผูกบัญชีกับ person และ enrollment ของตน |
| Input | curriculum_id group_id attempt_id คำตอบ/งานเขียน และคำสั่งบันทึกหรือส่ง |
| Process | เลือกหนึ่งใน 9 กลุ่ม เริ่ม pretest จาก assessment blueprint รุ่นที่เผยแพร่ บันทึกคำตอบ สรุปหัวข้อ เรียนบทเรียน แล้วทำ posttest ตามเงื่อนไข backend; ข้อเขียนเข้าผู้ตรวจตาม rubric |
| Output | attempt snapshot คะแนนฝึกก่อน/หลังและ learning_progress ของตน; ไม่เขียน result_release ของระบบ 5 |
| Permission | P01 ตามผู้เรียนตนเอง; P04 ส่ง attempt ของตน; ผู้สอน P02 เฉพาะกลุ่มผู้เรียนที่มอบหมาย |
| Validation | มี 9 กลุ่มประถม/มัธยม/อุดม × ตรี/โท/เอก คำถามมีรุ่น ไม่ส่ง answer_key ก่อนส่ง คำตอบเข้าคู่ attempt_item และส่งซ้ำให้ receipt เดิม |
| Error | 409 attempt ส่งแล้วหรือขั้นยังไม่ปลดล็อก; 422 คำตอบไม่ตรง schema; 404 attempt ของผู้อื่น; 401 session หมดแล้วให้กลับเข้าสู่ระบบและ resume ร่างได้ |
| Acceptance | ครบ 9 กลุ่มเดินก่อน–เรียน–หลังได้; ก่อนส่งไม่มีเฉลยใน payload; posttest ของตน resume ได้หลังเครือข่ายขาด; คะแนนฝึกไม่ปรากฏเป็นผลทางการ |
| Audit | audit_logs ของสร้าง attempt บันทึกคำตอบ ส่งและ manual_grading ตาม actor/correlation; เนื้อหาคำตอบอยู่ response ที่มีสิทธิ์ ไม่คัดทั้งหมดลง log |

**Happy path:** TC-S03-01-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-S03-01-A: เรียก `POST /api/learning/attempts/{attempt_id}/submit` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-S03-01-R: ใช้ JWTที่จำกัดสิทธิ์เรียก native Data API/StorageหรือRPCที่เกี่ยวข้องตรง พยายามอ่าน/เขียนข้อมูลของ UCโดยไม่มี grant ต้องไม่คืน private rows/ไฟล์ ไม่เปลี่ยนข้อมูล และไม่เรียก privileged RPCสำเร็จ; ไม่ใช้ service credentialของผู้ดูแลเป็นบัญชีทดสอบผู้ไม่มีสิทธิ์

**TO VERIFY:** Q007, Q014, Q018


### UC-S03-02 — จัดทำ ตรวจ และเผยแพร่บทเรียน/คำถาม

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | ผู้สอน ผู้ตรวจเนื้อหา และผู้เผยแพร่เนื้อหาที่แยก grant |
| Input | curriculum/group/topic lesson_version question_version เฉลย rubric และหลักฐานสิทธิ์ใช้ |
| Process | สร้างเนื้อหาร่าง ส่งผู้ตรวจ อนุมัติแล้วผู้มี publish grant เผยแพร่รุ่น; attempt ที่เกิดแล้วคง snapshot เก่า |
| Output | บทเรียนและคำถามรุ่นอนุมัติ หรือร่างที่มองเห็นเฉพาะผู้มีสิทธิ์ |
| Permission | P03/P04 สำหรับผู้เขียนที่ได้รับมอบหมาย; P05 ตรวจเนื้อหาสำคัญโดยคนอื่น; P06 แยก publish; P07 ไม่ให้โหลด answer_key จากสิทธิ์ดูบทเรียนอย่างเดียว |
| Validation | กลุ่ม/วิชาถูก master ข้อปรนัยมีเฉลยรุ่นเดียว ข้อเขียนมี rubric สิทธิ์ใช้และผู้ตรวจได้รับยืนยันก่อนเผยแพร่เนื้อหาจริง |
| Error | 403 เขียนแล้วอนุมัติเอง/เผยแพร่โดยไม่มี P06; 409 รุ่นยังไม่รับรองหรือแก้หลังอนุมัติ; 404 หลักสูตรนอก grant |
| Acceptance | ร่างไม่ปรากฏ public; ผู้เขียนส่งได้แต่อนุมัติตนไม่ได้; ผู้เผยแพร่เผยแพร่เฉพาะรุ่นรับรอง; แก้คำถามไม่เปลี่ยนคะแนน attempt เก่า |
| Audit | audit_logs ของรุ่นเนื้อหา submit/approve/publish/unpublish และ rule/rubric references; ไม่เก็บ answer_key ใน log สาธารณะ |

**Happy path:** TC-S03-02-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-S03-02-A: เรียก `POST /api/learning/content/{content_id}/publish` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-S03-02-R: ใช้ JWTที่จำกัดสิทธิ์เรียก native Data API/StorageหรือRPCที่เกี่ยวข้องตรง พยายามอ่าน/เขียนข้อมูลของ UCโดยไม่มี grant ต้องไม่คืน private rows/ไฟล์ ไม่เปลี่ยนข้อมูล และไม่เรียก privileged RPCสำเร็จ; ไม่ใช้ service credentialของผู้ดูแลเป็นบัญชีทดสอบผู้ไม่มีสิทธิ์

**TO VERIFY:** Q007, Q005, Q006, Q018


### UC-S04-01 — สร้างและส่งคำขอจัดตั้ง/ยุบ/เปลี่ยนสนาม

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | ผู้เสนอจากหน่วยที่ได้รับมอบหมายและผู้ตรวจคำขอ |
| Input | request_type target_organization/center รุ่นแบบ หลักฐาน และวันมีผลเสนอ |
| Process | เลือกชนิดเรื่องจาก configuration สร้างร่าง ตรวจหลักฐาน ทำ impact assessment เรื่องค้าง ส่งเข้าคิวผู้ตรวจ โดยยังไม่เปลี่ยนทะเบียน |
| Output | เลขคำขอ รุ่นคำขอ สถานะส่งตรวจและรายการผลกระทบ |
| Permission | P03/P04 ตามคำขอและ scope เป้าหมาย; ผู้ตรวจ P02/P03 เฉพาะที่รับมอบหมาย; การส่งไม่ให้อำนาจอนุมัติ |
| Validation | หน่วยเป้าหมายถูกชนิด เอกสารผ่าน scan+ACL การยุบมีแผนใบสมัคร/ทรัพย์สิน/หน้าที่ค้าง ไม่ย้ายรายการอัตโนมัติ |
| Error | 422 แบบ/หลักฐานหรือแผนผลกระทบไม่ครบ; 409 มีคำขอชนิดเดียวค้างหรือรุ่นเปลี่ยน; 404 หน่วยข้ามสาย |
| Acceptance | ส่งคำขอสมมติแล้วทะเบียน active ยังเดิม; แสดง impact พร้อมรายการค้างตามสิทธิ์; ผู้เสนอในสาย A สร้างเรื่องของสาย B ผ่าน API ไม่ได้ |
| Audit | audit_logs ของ draft/update/submit และ impact version พร้อม actor/target/correlation; ไม่แก้ status_event จนขั้นมีผล |

**Happy path:** TC-S04-01-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-S04-01-A: เรียก `POST /api/requests` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-S04-01-R: ใช้ JWTที่จำกัดสิทธิ์เรียก native Data API/StorageหรือRPCที่เกี่ยวข้องตรง พยายามอ่าน/เขียนข้อมูลของ UCโดยไม่มี grant ต้องไม่คืน private rows/ไฟล์ ไม่เปลี่ยนข้อมูล และไม่เรียก privileged RPCสำเร็จ; ไม่ใช้ service credentialของผู้ดูแลเป็นบัญชีทดสอบผู้ไม่มีสิทธิ์

**TO VERIFY:** Q005, Q006, Q009


### UC-S04-02 — ตรวจ อนุมัติ ทำให้มีผลและติดตามคำขอ

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | ผู้ตรวจ ผู้อนุมัติ; ผู้ติดตามที่มี tracking capability ตามนโยบาย |
| Input | request_id รุ่นล่าสุด decision เหตุผล วันที่มีผล และ tracking reference ที่พิสูจน์สิทธิ์ |
| Process | ตรวจ scope อำนาจและ maker-checker ส่งกลับ/ปฏิเสธ/อนุมัติ เมื่อถึงวันจริง job ตรวจสิทธิ์/กฎมีผลอีกครั้งแล้วสร้าง status_event; public tracking คืนเฉพาะ projection |
| Output | decision และ activation_record ที่ตรวจย้อนหลังได้; public tracking ไม่คืนหลักฐานส่วนตัว |
| Permission | P02/P05 สำหรับเรื่องตามอำนาจ; P09 เฉพาะ public tracking projection ตาม Q019; การรู้เลขลำดับคำขอไม่ใช่ grant |
| Validation | สถานะรอการตัดสินยังเป็นรุ่นเดียว ผู้สร้างไม่อนุมัติตน ผู้รับมอบหมายยังมีผล activation idempotent และมีแผนผลกระทบ |
| Error | 403 maker-checker/อำนาจหมด; 409 รุ่นเปลี่ยนหรือมีการเพิกถอน; 404 request/ tracking proof ไม่ตรง; 503 job ยังทำไม่ได้ต้องคง approved_pending_effect |
| Acceptance | อนุมัติล่วงหน้าไม่เปลี่ยนสนามก่อนวันจริง; retry activation ไม่สร้าง event ซ้ำ; public ไม่เดาคำขออื่นจากเลขต่อเนื่อง; การแก้คำสั่งเก็บประวัติเดิม |
| Audit | audit_logs ของ return/reject/approve/activate/revoke พร้อมเหตุผลและ evidence references; job เก็บทั้ง initiating_actor และ system_actor |

**Happy path:** TC-S04-02-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-S04-02-A: เรียก `POST /api/requests/{request_id}/decisions` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-S04-02-R: ใช้ JWTที่จำกัดสิทธิ์เรียก native Data API/StorageหรือRPCที่เกี่ยวข้องตรง พยายามอ่าน/เขียนข้อมูลของ UCโดยไม่มี grant ต้องไม่คืน private rows/ไฟล์ ไม่เปลี่ยนข้อมูล และไม่เรียก privileged RPCสำเร็จ; ไม่ใช้ service credentialของผู้ดูแลเป็นบัญชีทดสอบผู้ไม่มีสิทธิ์

**TO VERIFY:** Q005, Q006, Q009, Q019


### UC-S05-01 — สมัคร ตรวจคุณสมบัติ อนุมัติและออกที่นั่ง

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | เจ้าหน้าที่สำนัก/สถานศึกษา; เจ้าหน้าที่สนามที่รับมอบหมาย; ผู้อนุมัติสมัคร |
| Input | person_id organization_id exam_session_id level/form_version eligibility evidence และ idempotency_key |
| Process | Application service ตรวจคน/หน่วย/หน้าต่าง/กฎรุ่น สร้างใบสมัครกลาง ส่งตรวจ อนุมัติตามอำนาจแล้วจัดที่นั่งในธุรกรรมที่รักษาความไม่ซ้ำ |
| Output | application snapshot การตรวจคุณสมบัติและ seat_allocation เฉพาะปี/สนาม |
| Permission | P03/P04 ตามหน่วยผู้สมัคร; P05 อนุมัติเฉพาะเรื่องที่มอบหมาย; P02 สำหรับเจ้าหน้าที่สนามตามรอบ; ผู้ดูแลเทคนิคไม่มี grant นี้ |
| Validation | business key กันคนสมัครซ้ำปี/ประเภท/ระดับตามกฎยืนยัน หลักฐานครบ ที่นั่งไม่ซ้ำ ตรวจ UTC/server time เทียบหน้าต่างไทย; ไม่เดา ศ.3 |
| Error | 422 คุณสมบัติ/แบบยังไม่ยืนยันสำหรับงานจริง; 409 สมัครหรือที่นั่งชนกัน; 403 อนุมัติตน/ไม่มีอำนาจ; 404 หน่วย/สนามนอก scope |
| Acceptance | สมัครผ่านเว็บและ Excel ด้วย business key เดียวมี application เดียว; กดซ้ำ receipt เดิม; ไม่มี seat ซ้ำในรอบที่อนุมัติ; แบบไม่ยืนยันใช้เฉพาะ schema ทดลอง |
| Audit | audit_logs ของ application/create/submit/approve และ seat_allocation; ทุกการเปลี่ยนสำเร็จร่วมกับ audit/outbox |

**Happy path:** TC-S05-01-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-S05-01-A: เรียก `POST /api/exams/applications` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-S05-01-R: ใช้ JWTที่จำกัดสิทธิ์เรียก native Data API/StorageหรือRPCที่เกี่ยวข้องตรง พยายามอ่าน/เขียนข้อมูลของ UCโดยไม่มี grant ต้องไม่คืน private rows/ไฟล์ ไม่เปลี่ยนข้อมูล และไม่เรียก privileged RPCสำเร็จ; ไม่ใช้ service credentialของผู้ดูแลเป็นบัญชีทดสอบผู้ไม่มีสิทธิ์

**TO VERIFY:** Q003, Q004, Q005, Q006


### UC-S05-02 — รับคะแนน ตรวจรับรอง และเผยแพร่ผล

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | เจ้าหน้าที่คะแนน ผู้รับรองผล และผู้เผยแพร่ที่ได้รับ grant แยกกัน |
| Input | รอบสอบ score rows rule_version draft_version หลักฐานและคำสั่ง publish |
| Process | ตรวจรายชื่อ/วิชา/ระดับ mismatch สร้างคะแนนดิบและ draft ให้ผู้รับรองคนอื่นตรวจ; publisher ตรวจ P06 และนโยบาย Q008 แล้วสร้าง release snapshot พร้อม published_at; แก้หลังเผยแพร่เป็นรุ่นแก้ไข |
| Output | คะแนน/ผลร่างภายในและ result_release รุ่นที่อนุญาตเผยแพร่ แยกจาก learning score |
| Permission | P03/P04 คะแนนในสนาม/รอบ; P05 รับรองโดยไม่ใช่ผู้สร้างงานสำคัญ; P06 เผยแพร่ตามนโยบายเฉพาะ; P05 ไม่ให้ P06 อัตโนมัติ |
| Validation | subject/seat/person ตรง snapshot คะแนนอยู่ช่วงที่กฎรับรองกำหนดไม่มี mismatch รุ่นเผยแพร่ต้องเป็นรุ่นรับรองล่าสุด ไม่เดาคะแนนผ่าน |
| Error | 422 mismatch/เกณฑ์ยังไม่ยืนยัน; 409 draft เปลี่ยนหลังรับรอง; 403 self-approve/tech admin/publish ไม่มี grant; 404 สนามข้ามสาย |
| Acceptance | คะแนนผิดคนไม่เข้าสู่ release; draft ไม่ปรากฏ public; approver ที่ไม่มี P06 เผยแพร่ไม่ได้; release มีคนรับรองคนละคนกับผู้สร้างและเวลาที่ตรวจย้อนกลับได้ |
| Audit | audit_logs ของ score import/update/submit/approve/publish/amend อ้าง release/rule/version; ไม่ลบผลที่ประกาศแล้ว |

**Happy path:** TC-S05-02-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-S05-02-A: เรียก `POST /api/exams/result-drafts/{draft_id}/publish` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-S05-02-R: ใช้ JWTที่จำกัดสิทธิ์เรียก native Data API/StorageหรือRPCที่เกี่ยวข้องตรง พยายามอ่าน/เขียนข้อมูลของ UCโดยไม่มี grant ต้องไม่คืน private rows/ไฟล์ ไม่เปลี่ยนข้อมูล และไม่เรียก privileged RPCสำเร็จ; ไม่ใช้ service credentialของผู้ดูแลเป็นบัญชีทดสอบผู้ไม่มีสิทธิ์

**TO VERIFY:** Q004, Q005, Q006, Q008


### UC-S05-03 — ค้นผลสอบแยกปีและข้อมูลเผยแพร่

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | ผู้เยี่ยมชมทั่วไป; เจ้าหน้าที่หรือเจ้าของข้อมูลตามสิทธิ์เมื่อดูรายละเอียดภายใน |
| Input | academic_year_id ประเภท/ระดับ/พื้นที่ คำค้น และ pagination; ปี พ.ศ. ที่เลือกมีการ map ชัด |
| Process | แปลงปีที่ผู้ใช้เลือกเป็นรหัสปี ตรวจ release ที่อนุมัติเผยแพร่ กรองก่อนนับ/แบ่งหน้า คืน public DTO และ cache ตามปี/release version; รายละเอียดภายในต้อง auth/scope |
| Output | ผลเฉพาะปีที่เลือกพร้อมแหล่งรอบ/รุ่นเผยแพร่และ pagination หรือไม่พบข้อมูล |
| Permission | P09 เฉพาะ release public; P01/P02 สำหรับรายละเอียดภายใน; P07 export แยกจากสิทธิ์ดูผล |
| Validation | ปีต้องเลือกชัด ไม่รวมผลต่างปี ไม่ส่งเลขประชาชน วันเกิด ที่อยู่ส่วนตัว เบอร์ส่วนตัวหรือหลักฐาน; query ปลอดภัยและจำกัดปริมาณตาม Q014 |
| Error | 422 ปี/ตัวกรองผิด; 200 empty สำหรับปีไม่มี release; 404 รายละเอียด private ข้าม scope; ไม่เผยจำนวน draft ที่ยังไม่ประกาศ |
| Acceptance | คนสมมติชื่อเดียวมีผลสองปี เลือกปีหนึ่งได้เฉพาะ release ปีนั้น; draft ไม่ปรากฏแม้เรียก API ตรง; response และ PDF สาธารณะไม่มี 4 กลุ่มข้อมูลส่วนตัว |
| Audit | การค้น public ไม่สร้าง business mutation; เก็บ operational metrics แบบลดข้อมูล; private export บันทึก event ผู้ส่งออก/ปี/release โดยไม่เก็บข้อความค้นที่เป็นข้อมูลส่วนตัวทั้งหมด |

**Happy path:** TC-S05-03-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-S05-03-A: anonymousเรียกpublic APIตรงมีสิทธิ์เฉพาะreleaseที่เผยแพร่; เพิ่มตัวกรอง include_private/include_draft หรือเรียก private resultAPIต้องไม่คืนข้อมูล draft/ส่วนตัว; เลือกปีที่ไม่มีreleaseคืน200ชุดว่าง

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-S05-03-R: anonymous/native Data APIพยายามอ่าน subject_score, result_draft, application_snapshotส่วนprivateต้องไม่ได้ private rows; public projectionถ้ามีคืนเฉพาะreleaseที่อนุญาต ไม่ได้สิทธิ์UPDATE/INSERT

**TO VERIFY:** Q008, Q014, Q017


### UC-S06-01 — จัดสรร จอง และเปลี่ยนเป็นผูกพัน

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | เจ้าหน้าที่การเงิน ผู้ตรวจและผู้อนุมัติตามแหล่งเงิน/วงเงิน |
| Input | fiscal_year_id funding_source_id budget_line amount หลักฐาน version และ idempotency_key |
| Process | แผน/จัดสรรผ่าน workflow ตาม policy โพสต์จองใน transaction ตรวจคงเหลือพร้อมกัน แล้วเปลี่ยนจองเป็นผูกพันโดยย้ายยอดไม่บวกซ้ำ |
| Output | budget_event/reservation/obligation และยอดคงเหลือแบบ exact decimal |
| Permission | P02/P03/P04 การเงินเฉพาะหน่วย/แหล่งเงิน/ปี; P05 ตามอำนาจวงเงินจริงที่ยืนยัน ผู้ดูแลเทคนิคไม่มีสิทธิ์โดย role admin |
| Validation | amount เป็น decimal ไม่ใช้ float ยอดบวก/ไม่เกินคงเหลือ งวดอนุญาต ผู้สร้างต่างผู้อนุมัติ ตรวจ concurrent transaction |
| Error | 409 งบไม่พอ/งวดปิด/รุ่นเปลี่ยน; 422 หมวดหรือวงเงินยังไม่ยืนยันงานจริง; 403 self-approve/tech admin; 404 งบนอก scope |
| Acceptance | งบ 100000 จอง 20000 เหลือ 80000 เปลี่ยนผูกพัน 20000 ยังคง 80000; retry key เดิมมี budget_event เดิม; งานพร้อมกันไม่จองเกินงบ |
| Audit | audit_logs ร่วม transaction กับ budget_event และ outbox; event โพสต์แล้วไม่ hard delete ใช้ reversal ตามอำนาจ |

**Happy path:** TC-S06-01-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-S06-01-A: เรียก `POST /api/budget/reservations` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-S06-01-R: ใช้ JWTที่จำกัดสิทธิ์เรียก native Data API/StorageหรือRPCที่เกี่ยวข้องตรง พยายามอ่าน/เขียนข้อมูลของ UCโดยไม่มี grant ต้องไม่คืน private rows/ไฟล์ ไม่เปลี่ยนข้อมูล และไม่เรียก privileged RPCสำเร็จ; ไม่ใช้ service credentialของผู้ดูแลเป็นบัญชีทดสอบผู้ไม่มีสิทธิ์

**TO VERIFY:** Q006, Q010, Q017


### UC-S06-02 — บันทึกจ่าย กลับรายการและรายงานปีงบ

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | เจ้าหน้าที่การเงิน ผู้อนุมัติ และผู้ตรวจสอบที่มี read grant |
| Input | obligation_id amount_paid payment_evidence fiscal_year_id period และคำสั่ง reversal ที่อ้างต้นฉบับ |
| Process | ตรวจอำนาจ/งวด/หลักฐาน บันทึกจ่ายและลดภาระใน transaction; ถ้าผิดสร้าง reversal ตาม workflow; รายงานแยกปีงบจากปีการศึกษาและพิมพ์ HTML ตามสิทธิ์ |
| Output | disbursement/ledger รายงานปีงบและหลักฐานการจ่ายในระบบ ไม่โอนธนาคารอัตโนมัติ |
| Permission | P03/P04 และ P05 ตามธุรกรรมการเงิน; P02 อ่านปี/แหล่งเงินใน scope; P07 export/print แยก |
| Validation | ไม่จ่ายเกินภาระ outstanding paid/reserved/obligation ไม่หักซ้อน reversal อ้างรายการเดิมและเหตุผล |
| Error | 409 จ่ายเกิน/งวดปิด/receipt ซ้ำไม่ตรง payload; 403 ผู้ตรวจสอบพยายามแก้หรืออนุมัติ; 404 งบต่างหน่วย |
| Acceptance | จากผูกพัน 20000 จ่าย 5000 ภาระค้าง 15000 ค่าใช้จ่าย 5000 คงเหลือ 80000; รายงานปีงบไม่ดึงปีการศึกษามาแทน; reversal เก็บต้นฉบับครบ |
| Audit | audit_logs ของบันทึกจ่าย reversal close-period และ export metadata; ไม่ log เลขบัญชีหรือหลักฐานส่วนตัวเต็มไฟล์ |

**Happy path:** TC-S06-02-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-S06-02-A: เรียก `POST /api/budget/disbursements` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-S06-02-R: ใช้ JWTที่จำกัดสิทธิ์เรียก native Data API/StorageหรือRPCที่เกี่ยวข้องตรง พยายามอ่าน/เขียนข้อมูลของ UCโดยไม่มี grant ต้องไม่คืน private rows/ไฟล์ ไม่เปลี่ยนข้อมูล และไม่เรียก privileged RPCสำเร็จ; ไม่ใช้ service credentialของผู้ดูแลเป็นบัญชีทดสอบผู้ไม่มีสิทธิ์

**TO VERIFY:** Q006, Q010, Q012, Q017


### UC-S07-01 — ขอซื้อ ตรวจรับและเคลื่อนไหววัสดุ

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | เจ้าหน้าที่พัสดุ ผู้ตรวจรับ ผู้อนุมัติเรื่อง และผู้ดูแลงบตาม grant |
| Input | item_id warehouse_id quantity procurement/order/receipt references budget_line_id และ idempotency_key |
| Process | ขอซื้อผ่าน workflow อนุมัติแล้วเรียก budget service จองงบ คำสั่งซื้อเปลี่ยนเป็นผูกพัน ตรวจรับเข้าคลังได้บางส่วน เบิก/โอนสร้าง ledger พร้อมตรวจ stock/หน่วย |
| Output | procurement/order/goods_receipt/stock_movement อ้างงบและหลักฐานกลาง |
| Permission | P03/P04 ในคลังที่มอบหมาย P05 ตามเรื่อง/วงเงินรับรอง ตรวจ scope คลังต้นทางและปลายทางเมื่อโอน; การเงินแยกจากพัสดุ |
| Validation | quantity/หน่วยถูก master ไม่ติดลบ ไม่รับเกินยอดค้างถ้าไม่มีกฎยืนยัน retry key/payloadตรง ตรวจงบผ่าน service เจ้าของ |
| Error | 409 stock ไม่พอ/receipt ซ้ำ payload ต่าง; 422 หน่วยหรือหลักฐานไม่ครบ; 404 คลังข้าม scope; 403 ไม่มี approval grant |
| Acceptance | รับบางส่วนเพิ่ม stock เท่ารับจริง; รับของไม่โพสต์จ่ายเงิน; เบิกพร้อมกันไม่ทำให้คงเหลือติดลบ; retry ไม่ตัดซ้ำ; โอนสองคลังสำเร็จร่วมกัน |
| Audit | audit_logs ของ procurement approval receipt stock movement และ outbox; service ข้ามงบใช้ correlation เดียวและ compensation ที่มีหลักฐานเมื่อจำเป็น |

**Happy path:** TC-S07-01-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-S07-01-A: เรียก `POST /api/inventory/stock-movements` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-S07-01-R: ใช้ JWTที่จำกัดสิทธิ์เรียก native Data API/StorageหรือRPCที่เกี่ยวข้องตรง พยายามอ่าน/เขียนข้อมูลของ UCโดยไม่มี grant ต้องไม่คืน private rows/ไฟล์ ไม่เปลี่ยนข้อมูล และไม่เรียก privileged RPCสำเร็จ; ไม่ใช้ service credentialของผู้ดูแลเป็นบัญชีทดสอบผู้ไม่มีสิทธิ์

**TO VERIFY:** Q006, Q010, Q011


### UC-S07-02 — ครุภัณฑ์ ผู้ถือครอง ยืมคืน ซ่อมและตรวจนับ

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | เจ้าหน้าที่ครุภัณฑ์ ผู้ถือครองที่ดูตนได้ ผู้ตรวจนับ และผู้อนุมัติปรับ/จำหน่าย |
| Input | asset_id person_id destination อาการซ่อม stocktake findings วันมีผลและหลักฐาน |
| Process | สร้าง asset รายชิ้น มอบหมาย/ยืม/คืน/โอน/ซ่อม เก็บ timeline; ตรวจนับต่างใช้ request adjustment และ approval ไม่แก้ยอดเดิม; จำหน่ายปิดใช้งานพร้อมเหตุผล |
| Output | ทะเบียนรายชิ้นและ asset_assignment/loan/maintenance/stocktake/disposal ที่มีประวัติ |
| Permission | P01 ผู้ถือครองดูรายการตน; P02/P03/P04 เจ้าหน้าที่ตามหน่วย; P05 ปรับ/จำหน่ายสำคัญโดยไม่ใช่ผู้สร้าง; P07 รายงานตาม scope |
| Validation | ผู้ถือครองอ้าง person กลาง ช่วงยืม/assignment ไม่ขัดกัน QR เป็นรหัสไปหน้าตรวจสิทธิ์ ไม่บรรจุข้อมูลส่วนตัว; ค่าเสื่อมรอ policy |
| Error | 409 มีผู้ถือครองช่วงซ้อน/ยังยืมค้าง; 422 ไม่มีหลักฐานปรับยอด; 403 ปรับหรือจำหน่ายโดยไม่มีอำนาจ; 404 QR/asset นอก scope |
| Acceptance | โอนแล้วตรวจผู้ถือครองเก่าได้; scan QR ไม่เปิดข้อมูลลับต่อผู้ไม่มีสิทธิ์; adjustment ยังไม่เปลี่ยน ledger จนรับรอง; จำหน่ายไม่ hard delete |
| Audit | audit_logs ของ asset/assignment/loan/return/repair/stocktake adjustment/disposal พร้อมหลักฐานและวันมีผล |

**Happy path:** TC-S07-02-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-S07-02-A: เรียก `POST /api/inventory/assets/{asset_id}/events` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-S07-02-R: ใช้ JWTที่จำกัดสิทธิ์เรียก native Data API/StorageหรือRPCที่เกี่ยวข้องตรง พยายามอ่าน/เขียนข้อมูลของ UCโดยไม่มี grant ต้องไม่คืน private rows/ไฟล์ ไม่เปลี่ยนข้อมูล และไม่เรียก privileged RPCสำเร็จ; ไม่ใช้ service credentialของผู้ดูแลเป็นบัญชีทดสอบผู้ไม่มีสิทธิ์

**TO VERIFY:** Q006, Q010, Q016


### UC-S08-01 — ลงทะเบียนหนังสือ ส่งตรวจและส่งตามรุ่น

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | เจ้าหน้าที่สารบรรณ ผู้ตรวจและผู้ลงนาม/อนุมัติที่มีสิทธิ์เฉพาะ |
| Input | record_type register_year recipients จาก person/org version_file confidentiality urgency และกำหนดเสร็จ |
| Process | ตรวจไฟล์ scan+ACL ลงเลขแบบ atomic จาก register_counter สร้างรุ่น ส่งตรวจ อนุมัติโดยผู้มีอำนาจและส่งรุ่นที่อนุมัติแก่ recipient_snapshot; แก้หลังอนุมัติเป็นรุ่นใหม่ |
| Output | ทะเบียนรับ/ส่ง/ภายใน/เวียน รุ่นหนังสือ route และงานติดตาม |
| Permission | P03/P04 ที่สารบรรณมอบหมายพร้อม ACL; P05 ตามผู้มีอำนาจเรื่อง; P06 เผยแพร่สาธารณะต้อง grant แยก ไม่ได้จากการส่งหนังสือ |
| Validation | เลขไม่ซ้ำตามทะเบียน/ปีที่ policy รับรอง ผู้รับชื่อเหมือนเลือก person/org จริงที่สมมติหรือยืนยัน รุ่นไฟล์ไม่ถูกแก้; ไม่อ้างลายมือชื่อดิจิทัลทางการจากปุ่มอนุมัติ |
| Error | 409 เลข/รุ่นขัดกัน; 422 ผู้รับกำกวมหรือไฟล์ไม่ผ่าน scan; 403 ACL/อนุมัติตน; 404 หนังสือข้าม ACL |
| Acceptance | ส่งหนังสือหนึ่งฉบับให้หลายคนได้จาก file_version เดียว; เลขพร้อมกันไม่ซ้ำ; content แก้หลังรับรองส่งรุ่นใหม่ก่อนใช้; ผู้ดูแลเทคนิคเปิดหนังสือลับไม่ได้โดย role เดียว |
| Audit | audit_logs ของ record/version/register/submit/approve/send และ recipients references; ไม่บันทึกเนื้อหาหนังสือลับเต็มชุด |

**Happy path:** TC-S08-01-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-S08-01-A: เรียก `POST /api/office/records/{record_id}/send` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-S08-01-R: ใช้ JWTที่จำกัดสิทธิ์เรียก native Data API/StorageหรือRPCที่เกี่ยวข้องตรง พยายามอ่าน/เขียนข้อมูลของ UCโดยไม่มี grant ต้องไม่คืน private rows/ไฟล์ ไม่เปลี่ยนข้อมูล และไม่เรียก privileged RPCสำเร็จ; ไม่ใช้ service credentialของผู้ดูแลเป็นบัญชีทดสอบผู้ไม่มีสิทธิ์

**TO VERIFY:** Q005, Q006, Q009, Q017


### UC-S08-02 — อ่าน รับทราบ มอบหมาย ดาวน์โหลดและพิมพ์หนังสือ

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | ผู้รับหนังสือ ผู้ได้รับมอบหมาย และผู้มี download grant+ACL |
| Input | record_id file_version_id receipt action assignee_id due_at และ export/print request |
| Process | ตรวจ ACL ของเรื่องและรุ่นทุกช่องทาง อ่าน preview รับทราบแบบ explicit แล้วมอบหมายตามอำนาจ; download/HTML print ตรวจ P07 ก่อนคืนเนื้อหา; notification เชื่อมหน้าต้นทาง |
| Output | receipt/assignment และไฟล์หรือหน้า print ของรุ่นที่มีสิทธิ์ |
| Permission | P02 ในเรื่องที่ ACL อนุญาต; P04 รับทราบ/ส่งงานของตน; P03 มอบหมายตาม scope; P07 download/print แยกจากดู; technical admin ไม่มี ACL อัตโนมัติ |
| Validation | ผู้รับ/assignee มี identityชัด assignment ไม่ออกนอกขอบเขตที่อนุญาต file_version ตรงเรื่อง scan ผ่าน การรับทราบใช้ explicit action ไม่ใช่อ่าน notification |
| Error | 403 ไม่มี P07 หรือ ACL; 404 เรื่อง/รุ่นข้ามสิทธิ์; 409 งานเปลี่ยน/รุ่นใหม่ต้องรับทราบใหม่ตาม policy |
| Acceptance | เปิด notification ไม่สร้าง receipt; รับทราบกดซ้ำไม่ซ้ำ; ผู้ดูได้แต่ไม่มี P07 โหลด/print ไม่ได้; full text และ URL native Storage ไม่คืนหนังสือให้ผู้ไม่มี ACL |
| Audit | audit_logs ของ receipt/assignment และ download/print event metadata ผู้กระทำ/รุ่น/เวลาขอบเขต; ไม่อ้างว่าระบบถอน PDF ที่ผู้ใช้ดาวน์โหลดแล้วจากเครื่องเขาได้ |

**Happy path:** TC-S08-02-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-S08-02-A: เรียก `POST /api/office/records/{record_id}/acknowledge` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-S08-02-R: ใช้ JWTที่จำกัดสิทธิ์เรียก native Data API/StorageหรือRPCที่เกี่ยวข้องตรง พยายามอ่าน/เขียนข้อมูลของ UCโดยไม่มี grant ต้องไม่คืน private rows/ไฟล์ ไม่เปลี่ยนข้อมูล และไม่เรียก privileged RPCสำเร็จ; ไม่ใช้ service credentialของผู้ดูแลเป็นบัญชีทดสอบผู้ไม่มีสิทธิ์

**TO VERIFY:** Q009, Q019


### UC-S09-01 — เทมเพลต อัปโหลดและตรวจ dry run

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | เจ้าหน้าที่นำเข้าของหน่วยที่มอบหมายและผู้ตรวจข้อมูล |
| Input | template_version exam_session_id organization_id XLSX และเอกสารแนบที่อ้างรุ่นกลาง |
| Process | ให้ดาวน์โหลดเทมเพลตกลางผ่าน ExcelJS upload quarantine ตรวจ MIME/magic ZIP expansion formula/external links/macros/encryption/ขนาด สแกน อ่านเป็น text schema รักษาศูนย์นำหน้า ตรวจคน/รหัส/คุณสมบัติ/scope ใน worker แล้วรายงานแถว |
| Output | import_batch/import_row/validation_issue รายแถวและจำนวน error/warning; ยังไม่มี application ใหม่จาก dry run |
| Permission | P07 เทมเพลตกลางที่รับรอง; P03/P04 imports ตามหน่วย/รอบ; job ตรวจ initiating_actor และขอบเขตล่าสุด; O09 ไม่รับสิทธิ์ approve application อัตโนมัติ |
| Validation | จำนวนแถว/ขนาดเพดานทดลองต้องยืนยันด้วย load test; schema มีรุ่น ปี/วันที่กำกวมต้อง error ไม่เดา; warningsต้องรับทราบ; worker bounded resources |
| Error | 413 เกินเพดานที่ตั้งค่า; 415 ชนิดไฟล์ไม่รองรับ; 422 schema/formula/แถวผิด; 403 scope/job grant ถูกถอน; 503 scan/job ไม่พร้อมคง quarantine |
| Acceptance | ไฟล์ผิด 1 แถวแสดง error พร้อมเลขแถว/ฟิลด์; ศูนย์นำหน้า/วรรณยุกต์ไทยไม่หาย; dry run ไม่เพิ่ม application; scan ยังไม่ผ่าน commit ไม่ได้; ไม่มี logเนื้อหาไฟล์ทั้งชุด |
| Audit | audit_logs ของสร้าง batch upload validation state update พร้อม hash/template version/actor/correlation และ issue counts ไม่เก็บเลขประชาชนจากเซลล์ลง log |

**Happy path:** TC-S09-01-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-S09-01-A: เรียก `POST /api/exams/imports/dry-run` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-S09-01-R: ใช้ JWTที่จำกัดสิทธิ์เรียก native Data API/StorageหรือRPCที่เกี่ยวข้องตรง พยายามอ่าน/เขียนข้อมูลของ UCโดยไม่มี grant ต้องไม่คืน private rows/ไฟล์ ไม่เปลี่ยนข้อมูล และไม่เรียก privileged RPCสำเร็จ; ไม่ใช้ service credentialของผู้ดูแลเป็นบัญชีทดสอบผู้ไม่มีสิทธิ์

**TO VERIFY:** Q003, Q004, Q011, Q017


### UC-S09-02 — ยืนยันนำเข้า retry และแก้ชุดที่มีข้อมูลปลายทาง

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | เจ้าหน้าที่นำเข้าที่มีสิทธิ์ของ batch; ผู้ตรวจ/ผู้อนุมัติใบสมัครแยกกันตามระบบ 5 |
| Input | batch_id batch_version acknowledgement_warnings idempotency_key และ scope/rule version |
| Process | ตรวจ scan/dry run error=0 warningsรับทราบ ตรวจ actor/scope/ปี/หน้าต่าง/กฎและข้อมูลล่าสุดอีกครั้ง ใช้ application service ใน transaction ทั้งชุดภายใต้เพดาน; retryคืน commit_receipt เดิม; ถอนชุดที่มี seat/score/release ใช้ amendment workflow |
| Output | ใบสมัครกลางและ commit_receipt ที่ครบทั้งชุด หรือไม่มีรายการธุรกิจบางส่วนจากงานที่ย้อนกลับ; สถานะนำเข้ายังไม่เท่ากับอนุมัติสอบ |
| Permission | P04 commit imports ตามหน่วย/rอบที่มอบหมาย; ไม่ใช่ P05 application approval; jobตรวจ grantล่าสุด ห้ามเชื่อข้อมูล scope จาก XLSX |
| Validation | batch_versionตรง error=0 scope/rule/windowยังถูกต้อง keyเดียวกับpayloadต่างต้อง conflict unique business keyกันซ้ำกับสมัครผ่านเว็บ |
| Error | 409 batchเปลี่ยน/duplicate key payloadต่าง/สิทธิ์หรือหน้าต่างเปลี่ยน; 422 errorsค้าง; 403 commit batchคนอื่นหรือ grantหมด; 503 transaction failแล้ว rollback |
| Acceptance | 100 แถวสมมติที่รับได้ commit สำเร็จได้ 100 receipt references; failure ระหว่างชุดไม่เกิดใบสมัครค้างบางส่วน; retryมีapplicationเดิม; มีseatแล้วไม่ลบปลายทางเมื่อขอแก้ชุด |
| Audit | audit_logs/import commit_receipt/application mutations/outbox สำเร็จร่วม transaction; retry ไม่เพิ่ม business eventซ้ำ; amendment เก็บต้นฉบับและใบคำขอแก้ |

**Happy path:** TC-S09-02-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-S09-02-A: เรียก `POST /api/exams/imports/{batch_id}/commit` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-S09-02-R: ใช้ JWTที่จำกัดสิทธิ์เรียก native Data API/StorageหรือRPCที่เกี่ยวข้องตรง พยายามอ่าน/เขียนข้อมูลของ UCโดยไม่มี grant ต้องไม่คืน private rows/ไฟล์ ไม่เปลี่ยนข้อมูล และไม่เรียก privileged RPCสำเร็จ; ไม่ใช้ service credentialของผู้ดูแลเป็นบัญชีทดสอบผู้ไม่มีสิทธิ์

**TO VERIFY:** Q003, Q004, Q005, Q006, Q011


### UC-C01 — บัญชีกลางและการจัดการบัญชีโดยผู้ดูแล

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | ผู้ใช้เข้าสู่ระบบ; ผู้ดูแลเทคนิคที่รับ P08; ผู้มีอำนาจมอบบทบาทธุรกิจตาม Q006 |
| Input | บัญชี session account_id คำขอเปิด/ปิดบัญชีและคำขอมอบหมาย role/scope/time |
| Process | เข้าสู่ระบบครั้งเดียวผ่าน Auth ตรวจบัญชี active และ person binding; admin จัดการบัญชีตามอำนาจ การให้บทบาทธุรกิจต้องผ่านผู้รับรองต่างคนและไม่อนุญาตยกระดับสิทธิ์ตน |
| Output | session/สถานะบัญชีกลางและคำขอมอบหมายมีหลักฐาน ไม่เกิด login รายระบบ |
| Permission | P08 ตามขอบเขตดูแลบัญชี ไม่ให้ P05 งบ/ผลสอบ P06 publish หรือ private ACL อัตโนมัติ; public login ไม่ใช้ P09 เป็นสิทธิ์เข้าข้อมูลภายใน |
| Validation | บัญชี/คนไม่กำกวม role assignmentจากเจ้าของอำนาจ ไม่รับ client claimsเป็นข้อมูลจริง; ปิดบัญชีแล้ว revoke sessionและงานที่ยังไม่เริ่มตรวจใหม่ |
| Error | 401 credentials/sessionไม่ถูก; 403 ผู้ดูแลยกระดับตนหรือ roleไม่รับรอง; 409 binding/assignmentซ้อน; ไม่เปิดเผย password/token ใน error |
| Acceptance | บัญชีเดียวเข้าได้เฉพาะเมนูที่มีสิทธิ์; tech admin ปิดบัญชีตามอำนาจได้แต่ approveงบ/resultหรือมอบ grantนั้นให้ตนไม่ได้; direct API admin ของผู้ใช้ทั่วไปถูกปฏิเสธ |
| Audit | audit_logs ของเปิด/แก้/ปิดบัญชีและ grant/revoke ระบุผู้ขอ/ผู้รับรอง/timewindow; credential/tokenไม่บันทึก; login eventใช้ metadataตามpolicy |

**Happy path:** TC-C01-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-C01-A: เรียก `POST /api/admin/accounts/{account_id}/changes` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-C01-R: ใช้ JWTที่จำกัดสิทธิ์เรียก native Data API/StorageหรือRPCที่เกี่ยวข้องตรง พยายามอ่าน/เขียนข้อมูลของ UCโดยไม่มี grant ต้องไม่คืน private rows/ไฟล์ ไม่เปลี่ยนข้อมูล และไม่เรียก privileged RPCสำเร็จ; ไม่ใช้ service credentialของผู้ดูแลเป็นบัญชีทดสอบผู้ไม่มีสิทธิ์

**TO VERIFY:** Q002, Q005, Q006, Q018, Q019


### UC-C02 — เนื้อหาและบริการกลางสาธารณะ

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | ผู้เยี่ยมชมทั่วไป; ผู้จัดทำ/ผู้รับรองเนื้อหากลางที่มี grant |
| Input | คำค้นข่าว download_id contact topic และรุ่นเนื้อหาที่จะเผยแพร่ |
| Process | ผู้จัดทำสร้างร่าง ผู้รับรองตรวจ แล้วผู้มี P06 เผยแพร่เฉพาะเนื้อหาและไฟล์ผ่าน scan; publicดูต้นทางเดียว; แต่ละโมดูลทำทางลัดเข้าต้นทางเดียวไม่คัดข้อมูลติดต่อ |
| Output | ข่าว ไฟล์ดาวน์โหลดและข้อมูลหน่วยงาน/ติดต่อกลางชุดเดียวตามรุ่นที่อนุญาต |
| Permission | P09 สำหรับเนื้อหาที่เผยแพร่; P03/P04/P05/P06 สำหรับผู้รับผิดชอบส่วนกลางเฉพาะที่มอบหมาย; P07 ไฟล์ publicเผยแพร่และ scanผ่าน ไม่เท่ากับ private file grants |
| Validation | เนื้อหาจริงที่มาจาก C04 รับรอง ตัวเลือกบทบาทไม่เกิดจากการเป็น admin; ไฟล์ยัง quarantineไม่ถูกเผยแพร่ public DTOไม่มีข้อมูลส่วนตัวต้องห้าม |
| Error | 404 ข่าว/ไฟล์ร่างหรือไม่เผยแพร่; 403 direct publish ของผู้เยี่ยมชม; 422 ไฟล์ยังไม่ผ่าน scan/ข้อมูลจริงยังไม่รับรอง |
| Acceptance | เมนู 7/9 และ3กลุ่มตาม BLUEPRINT; contact/download/news/login/notificationsมีต้นทางเดียว; ผู้เยี่ยมชม APIตรงไม่เห็นข่าวร่างหรือ private file และ publishไม่ได้ |
| Audit | audit_logs ของเนื้อหา create/update/approve/publish/deactivate; publicreadเก็บ operational metricsขั้นต่ำ ไม่คัดข้อความติดต่อที่เป็นข้อมูลส่วนตัวเข้า log |

**Happy path:** TC-C02-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-C02-A: เรียก `POST /api/site-content/{content_id}/publish` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-C02-R: ใช้ JWTที่จำกัดสิทธิ์เรียก native Data API/StorageหรือRPCที่เกี่ยวข้องตรง พยายามอ่าน/เขียนข้อมูลของ UCโดยไม่มี grant ต้องไม่คืน private rows/ไฟล์ ไม่เปลี่ยนข้อมูล และไม่เรียก privileged RPCสำเร็จ; ไม่ใช้ service credentialของผู้ดูแลเป็นบัญชีทดสอบผู้ไม่มีสิทธิ์

**TO VERIFY:** Q005, Q008, Q015


### UC-C03 — สำรองและทดสอบกู้คืนฐานกับเอกสาร

| หัวข้อ | รายละเอียด |
| --- | --- |
| Actor | ผู้ดูแลสำรองที่รับ grantเฉพาะและเจ้าของงานตรวจยอด |
| Input | backup manifest ของฐาน/ไฟล์/config references restore target แยกจาก production และคำสั่งทดสอบที่อนุมัติ |
| Process | ตรวจ P10 สำรองฐานกับไฟล์จริงแยกกันและอ้าง manifest/hash สอดคล้องกัน กู้ในพื้นที่แยก ปิด outbox/notification outboundระหว่าง restore ตรวจธุรกรรม/รุ่นไฟล์/RLSและวัด RPO/RTO แล้วเจ้าของงานรับรอง |
| Output | รายงานจำนวน/ยอด/hash ผลกู้คืนและเวลาที่วัดได้ ไม่แก้ production ในการทดสอบ |
| Permission | P10 restore environment ที่อนุญาต; tech adminไม่มีสิทธิ์อ่านไฟล์ลับจาก backupโดยปริยาย ต้องมี privileged operation ที่จำกัดและตรวจสอบ |
| Validation | backup ครอบคลุม DB+Storage bytesและ ACL/config ที่จำเป็น แยกจากการสำรอง Git; secretส่งผ่านช่องทางที่อนุมัติไม่ใส่ manifest/repo; ตรวจไม่มีผลแจ้งเตือนหรือจ่ายซ้ำจาก replay |
| Error | 403 ผู้ไม่รับมอบหมายเรียก restore; 409 manifest/hashไม่ตรง; 503/restore_failedคงพื้นที่ทดสอบและไม่เปลี่ยน production |
| Acceptance | กู้ข้อมูลสมมติได้ครบตาม manifest: คน/ใบสมัคร/ผล/ledger/stock/file_versions และhashของไฟล์; negative RLSยังปฏิเสธข้ามสาย; วัดเวลาจริงเทียบเป้าหมายที่ Q012รับรอง |
| Audit | audit_logs/operational evidence ของผู้สั่ง backup/restore/ตรวจรับ ไม่คัดข้อมูลลับใน log; มี receiptและเวลาจริง เจ้าของข้อมูลดูเฉพาะรายงานที่มีสิทธิ์ |

**Happy path:** TC-C03-H: actorตาม Actor มี grant+scope+เวลาและข้อมูลสมมติถูกต้อง เดิน Process แล้วตรวจ Output/Acceptance พร้อมรายการ auditที่กำหนด

**เรียก API โดยไม่มีสิทธิ์:** TC-C03-A: เรียก `POST /api/admin/restore-drills` ตรงด้วย sessionที่ไม่มี action grant/อยู่สาย Bหรือไม่ได้ ACL ต้องไม่คืนข้อมูล privateและไม่เปลี่ยนธุรกิจ; app APIคืน403ถ้าactionไม่มีสิทธิ์หรือ404ถ้าobjectถูกซ่อน public-readใช้projectionเท่านั้น

**ทดสอบ RLS/Storage/RPC โดยตรง:** TC-C03-R: JWTของผู้ใช้ทั่วไปเรียก native RPC/ข้อมูล backupหรือStorage backupตรง ต้องปฏิเสธ privileged operationและไม่คืนไฟล์/แถว; backup serviceไม่ถูก exposeให้anon/authenticatedโดยทั่วไป

**TO VERIFY:** Q008, Q009, Q012, Q016


## 4 ข้อกำหนดเวลา การเข้าถึง สำรอง และหลักฐาน

| REQ | สถานะ | หัวข้อ | เจ้าของ | ข้อกำหนด | เกณฑ์ตรวจที่ต้องรันภายหลัง | ประเด็นยืนยัน |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-N01 | Confirmed | วันเวลาไทยและ พ.ศ. | C02 | Asia/Bangkok เป็นเขตแสดง/ตีความวันทางธุรกิจ เก็บ instant เป็น UTC/timestamptz และวันล้วนเป็น date ไม่แปลง timezoneจนวันเลื่อน | TC-N01-01: 2026-12-31T16:59:59Z → 31 ธ.ค. 2569 23:59:59; 17:00Z → 1 ม.ค. 2570 00:00; ทดสอบเครื่อง clientต่าง timezone ได้ผลเดียวกัน | Q017 |
| REQ-N02 | Confirmed | ปีการศึกษาแยกปีงบ | O05 + O06 | academic_year_id แยก fiscal_year_id; แสดง labelพ.ศ.ที่ตั้งค่าไว้ ไม่ deriveปีงบจาก academic year หรือตั้งวันเริ่ม/สิ้นโดยเดา | TC-N02-01: สอบปีการศึกษาหนึ่งอ้างงบอีกปีได้โดยไม่เปลี่ยนผลค้นปี; start/endวันธุรกิจมาจากรุ่นตั้งค่าที่รับรอง | Q004, Q010, Q017 |
| REQ-N03 | Proposal | การเข้าถึงสำหรับผู้พิการ | C02 + O03 | เสนอ WCAG 2.2 ระดับ AA สำหรับ pagesและcomplete flows รวม public/app/login/form/import/learning/print review; เกณฑ์ย่อยด้านล่างเป็น checklist ไม่ใช่คำรับรองครบมาตรฐาน | TC-N03-01..04: automated audit ไม่มี serious/criticalที่ยังไม่แก้ใน flowที่ตรวจ; manual keyboard/screen reader/zoom และ auth paste ผ่านพร้อมหลักฐานรายข้อ | Q018 |
| REQ-N04 | Confirmed + Proposal | สำรองและกู้คืน | C02 + C01 | ต้องมี backup+restore evidence ทั้งฐานและไฟล์จริงกับ configที่จำเป็น; เป้าหมาย RPO 24h/RTO 4h เป็นข้อเสนอรอ Q012 ไม่ใช่ SLA | TC-N04-01: restore แยกพื้นที่ตรวจ counts/budget/stock/results/file_version/hash/ACL; วัด RPO/RTOจริง ไม่เกิด outbox replayส่งหนังสือซ้ำ | Q012, Q016 |
| REQ-N05 | Confirmed | สิทธิ์ล่าสุดและ old/new scope | C02 | ทุก read/mutate/export/print/job ตรวจ grantตามเวลาและscopeล่าสุด; updateตรวจทั้ง recordเดิมและค่าใหม่; roleไม่มี grantห้ามทำแม้แก้ payloadโดยตรง | TC-N05-01: ถอน roleหลัง dry runแต่ก่อน commit/jobเริ่มแล้วถูกปฏิเสธ ไม่มี mutation; เปลี่ยน organization_idไปสายอื่นไม่ได้ทั้ง appAPI/directDataAPI | Q002, Q006, Q019 |
| REQ-N06 | Proposal | ข้อผิดพลาด API และ recovery | C02 | สัญญา HTTP ตาม Error contract; errorไทย มี codeและcorrelation ไม่มี secret/ข้อมูลที่ไม่มีสิทธิ์; conflict/timeoutให้ retryตามreceipt ไม่ใช่ทำรายการใหม่ซ้ำ | TC-N06-01: tokenเสีย401 actionไม่มีสิทธิ์403 hidden resource404 version409 validation422; retryที่สำเร็จแต่ตอบกลับหายคืน receipt เดิม; API nativeใช้เกณฑ์no rows/no writeแทนเดาสถานะHTTP | Q011, Q014, Q019 |


### วันเวลาและปี

- แสดงเวลา `Asia/Bangkok` ใน UI/error/รายงาน/HTML print; วันที่แสดงเป็น พ.ศ. และระบุปีที่เลือกชัด
- instant เช่น published_at, recorded_at ใช้ UTC/timestamptz; date-only เช่นวันมีผลที่เป็นวันปฏิทินไทย เก็บ dateและตีความตามเขตไทย โดยไม่ใช้ timezoneแปลงจนวันเลื่อน เก็บเวลาบันทึกแยกจากวันที่มีผล
- machine API ใช้ ISO 8601 ที่มี timezone/offsetเมื่อเป็น instant; Excel schemaระบุชนิดและcalendarชัด ผู้ใช้ส่งวันที่กำกวม เช่น 01/02/69 โดยไม่มีschemaต้อง errorไม่เดา แปลง พ.ศ.–ค.ศ.ครั้งเดียวตามfield/calendarที่ระบุ ไม่ลบ543ซ้ำ
- หน้าต่างสมัครใช้เวลาฝั่ง server: starts_at <= now < ends_at เป็นสัญญาเสนอใน DEC-017 ต้องผ่าน Q017กับเจ้าของงานก่อนใช้จริง ไม่ใช้เวลาเครื่องผู้ใช้ตัดสิน
- academic_year_id กับ fiscal_year_id คนละ reference มี label/ช่วงวันที่คนละconfig ไม่ถือว่าปีงบเริ่มวันใดโดยเดา; การค้นผลเลือกปีการศึกษาชัด ส่วนรายงานงบเลือกปีงบชัด

### Accessibility: ข้อเสนอเกณฑ์ย่อยของ WCAG 2.2 AA

เกณฑ์ย่อยต่อไปนี้เป็นการออกแบบของโครงการตามแหล่งมาตรฐานด้านล่าง ยังต้องยืนยันขอบเขต/อุปกรณ์ใน Q018 และไม่ใช่การตรวจครบทุกข้อ WCAG:

1. TC-N03-01: flowสำคัญทำด้วยแป้นพิมพ์ได้ ไม่มี trap มี focusที่เห็นและไม่ถูกบัง label/heading/ตารางอ่านลำดับได้ และข้อมูลสถานะให้screen readerรับรู้
2. TC-N03-02: contrastข้อความทั่วไป >=4.5:1 ข้อความใหญ่ >=3:1 และองค์ประกอบจำเป็น >=3:1 ตามข้อยกเว้นมาตรฐาน ไม่ใช้สีเป็นข้อมูลเดียว
3. TC-N03-03: zoom200%ข้อความไม่หาย; reflowที่320 CSS pxไม่เสียฟังก์ชัน ส่วนตารางที่จำเป็นสองมิติมีพื้นที่เลื่อนและชื่อที่เข้าถึงได้ ปุ่มเป้าหมายอย่างน้อย24×24 CSS pxหรือใช้ข้อยกเว้นตามมาตรฐานที่บันทึกไว้
4. TC-N03-04: ฟอร์มมีlabel/errorสัมพันธ์กัน ข่าว/ภาพมีalternative textเมื่อจำเป็น authอนุญาตpassword manager/paste และไม่บังคับแบบทดสอบความจำโดยไม่มีทางเลือกตามเกณฑ์; การเรียนสื่อเสียง/วิดีโอมีทางเลือกที่เหมาะสมตามเนื้อหาที่เผยแพร่

automated audit ใช้ช่วยตรวจพร้อม manual keyboard/screen reader และการตรวจfull flow ไม่ใช้คะแนนจากเครื่องมือเพียงตัวเดียวรับรองมาตรฐาน HTML printต้องมีข้อความไทยที่เลือก/อ่านได้และลำดับเอกสาร ไม่ใช้ภาพทั้งหน้าแทนข้อความ หากต้องส่ง PDFที่รับรอง accessibility ต้องตรวจผลPDFจริงตามขอบเขต Q018ก่อนอ้างว่าผ่าน

### สำรองข้อมูลและการกู้คืน

ต้องครอบคลุมฐานข้อมูล ไฟล์จริงใน Storage รุ่นไฟล์ ACL/configที่จำเป็น และแหล่งconfig/secretsผ่านช่องทางที่ได้รับอนุญาต แยกจากการเก็บโค้ดใน Git เอกสาร Supabaseระบุว่าการสำรองฐานข้อมูลไม่รวมเนื้อไฟล์ Storage จึงออกแบบ manifest+hashและการสำรองไฟล์แยกกัน [เอกสาร Supabase](https://supabase.com/docs/guides/platform/backups)

TC-N04-01 ต้องกู้ในพื้นที่แยกและตรวจจำนวน/ความสัมพันธ์ของ person/application/release งบ stock file_version และ hashไฟล์พร้อม negative authorization หลัง restore ระงับ outbox/แจ้งเตือนและ side effectsก่อน replay เพื่อไม่สร้างรายการซ้ำ วัดข้อมูลที่สูญเสียสูงสุดและเวลาฟื้นคืนจริงเทียบ RPO/RTOที่เจ้าของโครงการรับรอง เป้าหมาย24ชั่วโมง/4ชั่วโมงยังเป็นข้อเสนอ Q012 และต้องตรวจช่วงพีคอีกครั้ง

## 5 หลักฐานและเกณฑ์จบบท 02

DOC-02-01: ทุกระบบ 01–09 มี Actor/Input/Process/Output/Permission/Validation/Error/Acceptance/Audit พร้อม happy path และ direct app/native API denial; DOC-02-02: ทุก REQจาก CharterและREQ-N01–N06มี matrixเชื่อม UC/page/table/service/บท/test; DOC-02-03: สิทธิ์แยกการกระทำ มีscope/เวลา/ACL/maker-checkerและtech adminไม่รับอำนาจงบหรือผล; DOC-02-04: มีวันเวลาไทย/พ.ศ./ปีแยก/accessibility/backupและแยกผลตรวจเอกสารจาก testที่ยังไม่ได้รัน

บทนี้ไม่ใช้ข้อความรับรองการใช้งานหรือความปลอดภัยเป็นเกณฑ์ลอย ๆ ผลจริงต้องมีคำสั่ง สภาพแวดล้อม ข้อมูลสมมติ expected/actual และหลักฐานไฟล์ที่อ้างอิง test_id ผ่านจึงเปลี่ยน PLANNEDเป็นPASS ส่วนที่ไม่ผ่านต้องบันทึกfail/blockerและrecoveryก่อนเลื่อนไปบทถัดไป

## 6 แหล่งทางการที่อ่านประกอบข้อเสนอ

- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) — เกณฑ์accessibilityที่ตรวจได้; ขอบเขตระดับ AAเป็นข้อเสนอ ไม่ใช่ผลทดสอบบทนี้
- [Supabase Database Backups](https://supabase.com/docs/guides/platform/backups) — แยก backupฐานจากเนื้อไฟล์ Storage; บทนี้ไม่เลือกแพ็กเกจบริการหรือสัญญาSLA
- [PostgreSQL Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html) — instantและdate-onlyต่างกัน; การแสดง พ.ศ./เขตไทยเป็นข้อกำหนดของโครงการ
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — RLSประกอบกับการตรวจserverและgrants; งานservice credentialต้องควบคุมตามกติกาโครงการ

อ่านวันที่ 3 ตุลาคม 2569; ให้ตรวจเอกสารตรงเวอร์ชันที่เลือกอีกครั้งเมื่อถึงบทimplementation ไม่แต่งกฎทางการจากแหล่งเทคนิค
