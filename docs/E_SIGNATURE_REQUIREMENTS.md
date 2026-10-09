# ข้อกำหนดหลักฐานอนุมัติและลายมือชื่อ — บท 57

รุ่นเอกสาร 0.1 | 8 ตุลาคม 2569 (2026-10-08) | Proposal / BLOCKED / ไม่มี runtime

อ่านร่วมกับ [MASTER](../00_MASTER_PROMPT.md), [BLUEPRINT](../BLUEPRINT.md), [หลักฐานอนุมัติ](APPROVAL_EVIDENCE_CONTRACT.md), [สัญญา adapter](SIGNING_ADAPTER_CONTRACT.md), [flow ตรวจหนังสือ](CORRESPONDENCE_FLOW.md) และ [สิทธิ์เอกสาร](RECORD_ACCESS_CONTROL.md)

## สถานะที่พิสูจน์ได้

prerequisite56 ยัง BLOCKED บท56ส่งมอบ contracts เท่านั้น `corepack pnpm db:test` รอบ57 exit1 ไม่มี FileVersion, บัญชีและ grants ที่ใช้ตรวจสิทธิ์จริง, shared workflow, record ACL, approval evidence service หรือ signing adapter ใน schema/runtime โฟลเดอร์สารบรรณมี README เท่านั้น ไม่พบการเชื่อม provider หรือหลักฐานเจ้าของงานยืนยัน provider ในโค้ด/เอกสารที่ตรวจ โดยไม่อ่านค่า credential

ส่งมอบรอบนี้เป็นข้อกำหนด สัญญา interface และ fixture PLAN_ONLY ไม่ใช่บริการหลักฐานอนุมัติที่ใช้งานได้หรือผลตรวจ certificate จริง สถานะ `SIGNING_NOT_CONFIGURED` เป็นค่าที่กำหนดในสัญญาและ fixture ยังไม่มี endpoint คืนค่านี้จริง ทั้งเกณฑ์57-01/57-02 BLOCKED / NOT RUN ไม่เริ่ม58

## เรียนทีละขั้น

1. ระบุผู้กระทำจากบัญชีกลางที่ server ตรวจแล้ว ไม่รับชื่อผู้อนุมัติหรือเวลาจาก browser เป็นหลักฐานสิทธิ์
2. ให้ผู้อนุมัติอ่านรุ่นเนื้อหาและไฟล์เดียวกับรายการที่จะตัดสิน ตรึงรหัสรุ่นและ digest ไม่ใช้ชื่อไฟล์หรือ Document.latest แทนรุ่น
3. เมื่ออนุมัติ เก็บคำตัดสิน เวลา server อำนาจที่ใช้ snapshot และ hash ใน transaction เดียวกับ workflow/audit/outbox รักษาหลักฐานเดิมเมื่อแก้ไข
4. ถ้ายังไม่มี provider ยืนยัน ให้แสดงเพียง “มีหลักฐานอนุมัติภายใน” เมื่อมีหลักฐานจริง และ “ยังไม่ได้ตั้งค่าผู้ให้บริการลงนาม” ห้ามแสดงว่าลงนามทางการสำเร็จ
5. เมื่อได้รับ provider และ policy แล้ว จึงพัฒนา sandbox adapter ตรวจผลจากไฟล์ที่ได้จริงกับ input ที่อนุมัติ ตรวจ certificate/timestamp/revocation ตาม profile ที่ยืนยัน และแยกผลทางเทคนิคจากการยอมรับทางการ

## ความหมายที่ห้ามรวมกัน

| สิ่งที่มี                           | สิ่งที่บันทึกได้                                                                | สิ่งที่ยังสรุปไม่ได้                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| ภาพลายเซ็นหรือภาพสแกน               | ภาพที่แนบเป็น FileVersion ผ่าน MIME/scan/ACL                                    | ไม่พิสูจน์เจ้าของ private key หรือ certificate และไม่เป็น digital signature โดยตัวภาพ         |
| ปุ่มอนุมัติ                         | เจตนาตัดสินใน workflow เมื่อ server ตรวจสิทธิ์และตรึงรุ่นจริง                   | การกดปุ่มหรือเปิดหน้าอย่างเดียวไม่เป็นคำรับรองลายมือชื่อทางการ                                |
| Approval evidence ภายใน             | ตัวตนบัญชี สิทธิ์ ณ เวลาตัดสิน รุ่นเนื้อหา เวลา และหลักฐานความครบถ้วน           | hash อย่างเดียวไม่พิสูจน์ผู้ลงนามและไม่เป็น certificate-based digital signature               |
| ลายมือชื่ออิเล็กทรอนิกส์            | กระบวนการแสดงเจตนา/ระบุตัวผู้กระทำตามวิธีที่หน่วยงานยอมรับ                      | รูปแบบและผลทางกฎหมายของวิธีนี้ในโครงการยัง Needs Legal Review ไม่ประกาศใช้จากตารางนี้         |
| Digital signature แบบมี certificate | ต้องมี artifact และผลตรวจลายมือชื่อ/chain/trust/time/revocation จริงตาม profile | provider ตอบ success หรือแนบ certificate เฉย ๆ ไม่ทำให้ผ่านทุกเงื่อนไขหรือเป็นการรับรองทางการ |

อ้างอิงเชิงเทคนิค: [NIST FIPS186-5 abstract](https://csrc.nist.gov/pubs/fips/186-5/final) อธิบาย digital signature สำหรับตรวจการเปลี่ยนข้อมูลและยืนยันผู้ลงนาม; [RFC5280 §6](https://www.rfc-editor.org/rfc/rfc5280.html#section-6) กล่าวถึง certificate path validation และ [RFC3161 §2.4.2](https://www.rfc-editor.org/rfc/rfc3161.html#section-2.4.2) กำหนดผล timestamp ที่ผูก message imprint เอกสารเหล่านี้เป็นแหล่งเทคนิค ไม่ใช่การรับรองกฎหมายไทยหรือเลือก signing profile ให้หน่วยงาน ต้องตรวจฉบับปรับปรุง/errata และข้อกำหนด provider ที่จะใช้ก่อน implementation

## แยกสถานะในข้อมูลและข้อความหน้าเว็บ

| มิติ               | ค่าข้อเสนอ                                                             | ข้อความและเงื่อนไข                                                                                  |
| ------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| การอนุมัติ         | PENDING / APPROVED / SUPERSEDED / REVOKED                              | อนุมัติภายในมีผลเฉพาะ approved snapshot และ active permit ของ workflow                              |
| การเชื่อม provider | SIGNING_NOT_CONFIGURED / READY_SANDBOX / READY_PRODUCTION              | ขณะนี้ไม่ตั้งค่า; sandbox ไม่ใช้เป็น production approval                                            |
| งานลงนาม           | NOT_REQUESTED / QUEUED / PENDING / RECEIVED / FAILED / OUTCOME_UNKNOWN | RECEIVED แปลว่าได้รับ artifact ยังไม่ใช่ตรวจผ่าน                                                    |
| ผลตรวจทางเทคนิค    | NOT_PERFORMED / INDETERMINATE / INVALID / VALID_UNDER_PROFILE          | ผูก artifact/profile/verifier version/validation time และรายละเอียด checks ไม่ใช่ช่อง boolean เดียว |
| การยอมรับทางการ    | NOT_ASSESSED / BLOCKED / ACCEPTED_UNDER_POLICY                         | ปิดจนเจ้าของงานรับรอง policy/provider/authority และผลตรวจจริงครบ; ไม่อ้างว่าใช้ได้กับทุกกฎหมาย      |

`VALID_UNDER_PROFILE` ใช้ได้เฉพาะตรวจจริงครบตาม profile ที่ยืนยันและมีหลักฐานตรวจ ไม่อนุมานจาก hash เท่ากัน ส่วน certificate ถูกเพิกถอนต้องเก็บเวลา เหตุเพิกถอน และแหล่งข้อมูลที่ตรวจ รวมเวลาที่ใช้ประเมิน; ไม่ตัดสินความมีผลย้อนหลังจากสถานะปัจจุบันเพียงค่าเดียว การถอนอำนาจบัญชีไม่ใช่ certificate revocation และไม่ลบหลักฐานคำอนุมัติในอดีต

ข้อความ UI ต้องแสดงสิ่งที่มีจริง “หลักฐานอนุมัติภายใน ไม่ได้ยืนยันการลงนามทางการ” กับ “ยังไม่ได้ตั้งค่าผู้ให้บริการลงนาม” ห้าม badge “ลงนามทางการสำเร็จ” จาก approval evidence, รูปภาพ, hash, provider receipt หรือ mock response ถ้ายังไม่มี evidence จริง ให้แสดงว่ายังไม่มีหลักฐาน ไม่แสดงอนุมัติแล้วเพราะ fixture

## รุ่นเดิมและการแก้ไข

เมื่อ bytes/เนื้อหา/ผู้ลงนาม/ผู้รับ/รายการแนบหรือเงื่อนไขสำคัญเปลี่ยน ต้องยุติ active permit ของ candidate เดิมก่อนส่ง แล้วสร้าง RecordVersion/FileVersion และ review cycle ใหม่ เก็บหลักฐาน คำตัดสิน signed artifact และ validation report เก่า ไม่แก้ hash เดิมให้ตรงไฟล์ใหม่

การอ่านรุ่นอนุมัติใช้ manifest เดิมและตรวจ bytes ปัจจุบันจาก object รุ่นที่ตรึง ถ้าไม่ตรงให้ VERSION_MISMATCH/quarantine พร้อม incident และห้ามส่ง/ลงนาม ไม่แก้ object เดิมเงียบ ๆ การอัปโหลด Document รุ่นใหม่ไม่แปลว่าหลักฐาน V1 ถูกเปลี่ยนเป็น V2 อัตโนมัติ PDF ที่ browser บันทึกเป็น bytes ใหม่ต้องเข้าเอกสารกลางและตรวจรุ่นตามบท54ก่อนใช้ลงนาม

แยก `approved_input_hash` จาก `signed_output_hash`: container ที่ลงนามอาจมี bytes เพิ่ม จึงไม่บังคับ output hash ต้องเท่า input hash ต้องตรวจว่าครอบคลุมเนื้อหาที่อนุมัติและการเปลี่ยนแปลงที่ profile อนุญาตจริง ถ้ายังไม่รองรับรูปแบบ/ขอบเขตนั้นให้ INDETERMINATE และปิดการยอมรับ ไม่ใช้ whole-file hash เป็นตัวตรวจลายมือชื่อทางการ

## เงื่อนไขเปิด provider

O08/C03 ยืนยันผู้ให้บริการ sandbox/production, อำนาจและวิธีแสดงเจตนา, signer-to-central-account mapping, trust anchors, formats/algorithms, timestamp/revocation sources, permitted changes, retention/hold และขอบเขตยอมรับทางการ C02 ออกแบบ ADR/migration/RLS และเชื่อม shared workflow/document service เดิม ไม่สร้างบัญชีหรือคลังไฟล์อีกชุด

Private key ของผู้ลงนามอยู่ในระบบผู้ให้บริการหรืออุปกรณ์ลงนามที่รับรองนอกแอป ห้ามรับ/เก็บ/ส่ง key ของผู้ลงนามใน browser, DB, logs, repository หรือ worker job แอปใช้อ้าง provider job และเอกสารกลางเท่านั้น สิทธิ์เรียก provider ไม่ใช่อำนาจอนุมัติธุรกิจ

## แผนตรวจรับ

ทุกกรณีใน [fixture57](fixtures/approval-signing-57-plan.json) เป็น NOT_RUN `actual=null` ไม่ใช่ลายมือชื่อ/certificate/approved evidence จริง

| รหัส   | กรณีที่ต้องตรวจด้วยระบบจริง                                                        | สถานะ   |
| ------ | ---------------------------------------------------------------------------------- | ------- |
| P57-01 | อนุมัติแล้วผูกบัญชี เวลา สิทธิ์ manifest และไฟล์ที่อ่านเดียวกัน                    | NOT RUN |
| P57-02 | แก้ bytes ของไฟล์รุ่นเดิมหลังอนุมัติ ตรวจพบและห้ามส่ง                              | NOT RUN |
| P57-03 | เพิ่ม V2 ไม่แทนไฟล์ V1 ในหลักฐานเดิม                                               | NOT RUN |
| P57-04 | แก้สาระสำคัญต้อง review ใหม่และเก็บคำตัดสินเก่า                                    | NOT RUN |
| P57-05 | browser ส่ง approver/time/hash ปลอม server ไม่ใช้เป็นหลักฐาน                       | NOT RUN |
| P57-06 | maker checker ปฏิเสธผู้สร้างอนุมัติตนเอง                                           | NOT RUN |
| P57-07 | admin เทคนิคไม่มีอำนาจธุรกิจ อ่านหรืออนุมัติไม่ได้                                 | NOT RUN |
| P57-08 | delegation หมดอายุหรือถูกถอนก่อน commit ตัดสินไม่ได้                               | NOT RUN |
| P57-09 | แข่งอนุมัติ/เปลี่ยนรุ่นได้คำตัดสินหนึ่งชุดและ conflict                             | NOT RUN |
| P57-10 | retry เดิมได้ evidence เดิม ไม่ audit/outbox ซ้ำ                                   | NOT RUN |
| P57-11 | rollback ระหว่าง decision/evidence/audit/outbox ไม่เหลือครึ่งรายการ                | NOT RUN |
| P57-12 | read/download/export/search/worker ตรวจ current source-file ACL                    | NOT RUN |
| P57-13 | ไม่ตั้ง provider คืน SIGNING_NOT_CONFIGURED ไม่มี network/งานลงนาม                 | NOT RUN |
| P57-14 | internal evidence/image/hash ไม่แสดงลงนามทางการสำเร็จ                              | NOT RUN |
| P57-15 | provider success อย่างเดียวไม่มีผลตรวจ artifact ให้รับรองไม่ได้                    | NOT RUN |
| P57-16 | signed output hash ต่างอย่างถูกต้องต้องตรวจ content binding ตาม profile            | NOT RUN |
| P57-17 | แก้ signed artifact แล้วตรวจพบ เก็บผลเก่าและสร้างรุ่นใหม่                          | NOT RUN |
| P57-18 | certificate chain/trust/revocation ไม่ทราบหรือไม่ผ่าน ปิดการยอมรับ                 | NOT RUN |
| P57-19 | เวลา server/client ไม่แทน trusted timestamp ที่ตรวจจริง                            | NOT RUN |
| P57-20 | callback ปลอม/ซ้ำ/ผิดงาน/ผิดรุ่นไม่เปลี่ยนสถานะสำเร็จ                              | NOT RUN |
| P57-21 | provider timeout ไม่ retry สร้างลายมือชื่อเพิ่มโดยไม่ reconcile                    | NOT RUN |
| P57-22 | ผูก artifact/report/receipt/source ใน ACL และ legal hold เดิม                      | NOT RUN |
| P57-23 | sandbox ผ่านหรือ technical valid แต่ official policy ยัง TO VERIFY ไม่รับรองทางการ | NOT RUN |
| P57-24 | revalidation/revocation เพิ่มรายงานใหม่ ไม่เขียนทับผลตรวจในอดีต                    | NOT RUN |

เกณฑ์57-01 map P57-01–04/16–17/24 เกณฑ์57-02 map P57-13–15/18–19/23 ทั้งคู่ BLOCKED / NOT RUN การตรวจ JSON/digest/reference ไม่พิสูจน์ DB transaction/ACL/crypto/UI

## รุ่นและงานค้าง

schema/package0.6.0 core19 models migrationเดียว `20261003130000_core_foundation` คงเดิม ไม่มี migration/provider/key/signature จริง Contract ทั้งสามและ fixture รุ่น0.1; logical04 approval_evidence เป็นข้อเสนอ ต้อง ADR ให้รองรับ multi-file manifest/authority/review receipt/validation report ก่อน migration

แก้56และส่วนกลาง07/08/10/11/nativeDBก่อนบริการจริง ปิด Q006/Q009/Q023/Q025 ตามส่วนที่ใช้ และรัน P57 กับ PostgreSQL/Auth/Storage/worker/browser จริง เจ้าของงานตรวจนโยบายและ provider แยกจาก software QA [MASTERข้อ2](../00_MASTER_PROMPT.md) ระบุ “ก่อนเริ่มเขียนโค้ด สรุปแผนเป็นไทยไม่เกิน 10 บรรทัดแล้วรอคำว่า ‘ตกลง’” รอบนี้เตรียมเอกสารเมื่อ prerequisite ยังไม่ผ่าน ไม่เริ่ม runtime หรือบท58
