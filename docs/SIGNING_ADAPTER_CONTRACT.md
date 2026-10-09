# สัญญา interface ผู้ให้บริการลงนาม — บท 57

รุ่นเอกสาร 0.1 | 8 ตุลาคม 2569 (2026-10-08) | Proposal / PLAN_ONLY / ยังไม่มี adapter implementation

อ้าง [ข้อกำหนด](E_SIGNATURE_REQUIREMENTS.md), [หลักฐานอนุมัติ](APPROVAL_EVIDENCE_CONTRACT.md), [เอกสารกลาง](RECORD_DOCUMENT_ACCESS.md), [การส่ง](DOCUMENT_DELIVERY.md), [ACL](RECORD_ACCESS_CONTROL.md) และ [การเก็บรักษา](RECORDS_RETENTION.md)

## Interface ที่ต้องพัฒนาภายหลัง

สัญญาเป็น typed DTO ในเอกสาร ไม่ใช่ TypeScript interface/service ที่ compile และเรียกใช้ได้ ยังไม่เลือก provider SDK/algorithm/format/trust root การตั้งค่าจริงต้องมาจาก owner-confirmed PolicyVersion และอำนาจจาก shared workflow ไม่สร้าง engine ลงนามปลอม

| Operation            | Input ที่ server เตรียมหลัง authorize  | Output / ผลข้างเคียงตามสัญญา                                                      |
| -------------------- | -------------------------------------- | --------------------------------------------------------------------------------- |
| getCapabilities      | purpose + configuration version        | configured status, environment, verified provider/profile ref; ไม่เปิด credential |
| requestSigning       | SigningInput                           | SigningReceipt; network ได้เฉพาะ READY_* ที่ยืนยัน และ input เท่ารุ่น approved    |
| reconcileSigning     | job_ref + operation_ref + input_digest | SigningReceipt/OUTCOME_UNKNOWN; query งานเดิมก่อน retry เมื่อผลไม่ทราบ            |
| ingestProviderResult | authenticated event ref + job binding  | receipt idempotent; artifact กักในเอกสารกลางจนตรวจครบ ไม่ถือเป็น success          |
| validateArtifact     | ValidationInput                        | ValidationReport append-only; validator มีรุ่นและ profile ที่ยืนยัน               |

ทุก operation รวม polling/callback ingestion/validator/worker ตรวจ technical capability และ current business authorization/source ACL ตาม operation โดยละเอียด Callback เป็นการรับผลของงานเดิมที่ server อนุมัติ ไม่ใช่การสั่งลงนามใหม่หรือให้สิทธิ์อ่านไฟล์ ถ้าอำนาจถูกถอนให้เก็บผลที่รับอย่างจำกัดเพื่อ reconcile และระงับการส่ง/ยอมรับ ไม่ยกระดับ receipt เป็น official success

## ชนิดข้อมูล

| DTO              | ฟิลด์บังคับและชนิด                                                                                                                                                                                                                                                                            | NULL / ข้อกำหนด                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| SigningInput     | operation_ref:string, evidence_ref:string, decision_ref:string, record_version_ref:string, manifest_digest:sha256hex, input_file_version_ref:string, approved_input_hash:sha256hex, signer_account_ref:string, provider_config_ref:string, profile_ref:string, environment:SANDBOX/PRODUCTION | server-derived; account/purpose/authority/recipient/source refs ไม่รับเชื่อจาก client |
| SigningReceipt   | status:SigningStatus, operation_ref:string, provider_job_ref:string/null, received_at:UTC/null, artifact_ref:FileVersion/null, provider_receipt_ref:DocumentVersion/null, reason_code:string/null                                                                                             | RECEIVED ต้องผูก artifact; provider claim ไม่ใช่ ValidationReport                     |
| ValidationInput  | artifact_ref:FileVersion, artifact_hash:sha256hex, evidence_ref:string, approved_input_ref:FileVersion, profile_ref:string, trust_policy_ref:string, validation_at:UTC, verifier_version:string                                                                                               | exact object version; ปฏิเสธ URL/bytes ที่ไม่ทราบ provenance                          |
| ValidationReport | validation_ref:string, input_ref:string, artifact_ref:FileVersion, artifact_hash:sha256hex, checked_at:UTC, evaluation_time:UTC, evaluation_time_basis:string, verifier_version:string, profile_ref:string, checks:CheckResult[], technical_status:ValidationStatus                           | append-only; mandatory checks ที่ไม่ได้รันต้อง UNKNOWN ไม่ default PASS               |
| CheckResult      | name:string, status:PASS/FAIL/UNKNOWN/NOT_APPLICABLE, evidence_ref:DocumentVersion/null, reason_code:string/null                                                                                                                                                                              | NOT_APPLICABLE ได้เมื่อ verified profile ระบุเหตุผล; ไม่ใช้ซ่อนการตรวจที่จำเป็น       |

`SigningStatus` = SIGNING_NOT_CONFIGURED / QUEUED / PENDING / RECEIVED / FAILED / OUTCOME_UNKNOWN; `ValidationStatus` = NOT_PERFORMED / INDETERMINATE / INVALID / VALID_UNDER_PROFILE แยก official policy acceptance ตามข้อกำหนดหลัก ไม่มี private key หรือไฟล์ certificate ดิบใน response สาธารณะ

Report ต้องบันทึก signature verification, content/approved input binding, format+allowed modifications, signer identity mapping, certificate chain/trust/policy/key usage/validity, timestamp signature+imprint+trust เมื่อ profile ต้องการ, revocation source/status/checked_at/this_update/next_update/revoked_at/reason ตามข้อมูลจริง และ missing checks รายงาน uncertainty ถ้าไม่มี trusted time อย่าแทนด้วย client/server clock เป็น trusted timestamp

ต้องระบุ `signature_scope` ว่าครอบคลุม FileVersion/เนื้อหาใดจริง รวมรายการแนบที่อยู่ใน manifest แต่ไม่ได้ถูกลงนาม การลงนามเฉพาะไฟล์หลักไม่รับรอง bytes ของเอกสารแนบอัตโนมัติ ถ้า policy ต้องครอบคลุมหลายไฟล์แต่ provider รองรับเพียงไฟล์เดียวให้ BLOCKED จนได้วิธีผูกเนื้อหาที่ตรวจจริงและรับรองโดยเจ้าของงาน ห้ามเพิ่มภาพ/หน้า/ผู้รับหรือแปลง PDF หลังอนุมัติโดยไม่มี review ใหม่ ยกเว้นการเพิ่มโครงสร้างลายมือชื่อที่ verified profile อนุญาตและตรวจ content binding แล้ว

Trust anchors/algorithm/profile/validation time policy ไม่ใช้ค่าที่ callback ส่งมาให้เลือกเอง certificate subject ไม่เท่ากับ Person/account mapping อัตโนมัติ และ GOOD revocation ณ เวลาปัจจุบันอย่างเดียวไม่พิสูจน์สถานะในอดีตทั้งหมด แหล่งข้อมูลไม่พร้อมหรือ format ไม่รองรับให้ INDETERMINATE; เก็บ report ใหม่เมื่อ revalidate ไม่ overwrite report เก่า

## เมื่อยังไม่ได้ตั้งค่า

ทุกคำขอลงนามที่ผ่าน authorization แล้วต้องได้ error/result code SIGNING_NOT_CONFIGURED ตามตัวอย่างด้านล่าง ผู้ไม่มีสิทธิ์ตอบ deny ก่อนเปิดรายละเอียดการตั้งค่าหรือหลักฐาน ตัวอย่างนี้เป็น expected DTO ไม่ใช่ response จาก endpoint ที่มีจริง

```json
{
  "status": "SIGNING_NOT_CONFIGURED",
  "operation_ref": "DEMO-OP-57-1",
  "provider_job_ref": null,
  "received_at": null,
  "artifact_ref": null,
  "provider_receipt_ref": null,
  "reason_code": "PROVIDER_NOT_CONFIRMED",
  "technical_validation": "NOT_PERFORMED",
  "official_acceptance": "BLOCKED",
  "official_success": false,
  "message": "ยังไม่ได้ตั้งค่าผู้ให้บริการลงนาม มีได้เฉพาะหลักฐานอนุมัติภายในที่ตรวจได้"
}
```

ไม่มี network call/job/artifact/certificate/timestamp/signature สร้างจาก fallback ไม่ย้าย internal approval เป็น signed state และไม่คืนภาพลายเซ็นที่สร้างขึ้นทดแทน ถ้ายังไม่มี internal evidence จริงให้ส่วนหลักฐานเป็นว่าง ไม่แต่งชื่อผู้อนุมัติหรือ hash

## การเชื่อมและความล้มเหลว

1. shared workflow ตรึง approved evidence/input และ signing operation ที่มี unique idempotency key+request fingerprint; job outbox เกิดพร้อม audit ใน DB transaction
2. worker ตรวจ candidate/permit/current authorization/CLEAN/byte hash/config/environment ก่อน network ใช้ fencing/lease ตามบริการกลาง การถอนสิทธิ์แข่งกับ external effect ต้องมี protocol ที่ยืนยัน; recheck เพียงครั้งเดียวไม่พิสูจน์ race
3. provider รับ operation เดิม; เมื่อ timeout ต้อง reconcile provider job เดิม ห้ามสมมติ exactly-once ถ้า provider ไม่รองรับ idempotency/query หยุดงาน ambiguous ให้เจ้าหน้าที่ตรวจ ไม่สร้างงานลงนามใหม่อัตโนมัติ
4. callback ตรวจ authentication ตาม spec provider, event freshness/replay, operation/job/input/version/environment binding, limits และ unique event ก่อนรับ ไม่ fetch remote URL จาก payload ที่ไม่ allowlist; receipt ไม่เป็น trust anchor ไม่ log token
5. artifact ที่รับลง Document/FileVersion กลางใหม่ ผ่านชนิด/scan/ACL/content binding/validation ตาม profile เก็บทั้ง input/output hashes และ reports ไม่ overwrite input; private key ไม่เข้าแอป
6. finalization ล็อก operation/candidate/permit และตรวจ current policy/authority อีกครั้ง ถ้ารุ่นถูกแก้/permit ระงับ เก็บ artifact ไว้ reconcile ตาม retention/hold แต่ห้ามส่งเป็นรุ่นอนุมัติใหม่ การเรียก provider และ DB commit ไม่เป็น transaction เดียวกัน

| Failure                                   | ผลที่ต้องเก็บ                            | การกู้คืน                                                                       |
| ----------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| provider ไม่ตั้งค่า                       | SIGNING_NOT_CONFIGURED ไม่มีผลภายนอก     | เจ้าของยืนยัน provider/config ก่อนพัฒนา ไม่เปิด flag ลอย ๆ                      |
| bytes/candidate เปลี่ยน                   | VERSION_MISMATCH + old evidence          | กักไฟล์/ระงับส่ง เปิดรุ่นและ review ใหม่                                        |
| callback ปลอมหรือ binding ผิด             | reject audit ที่ไม่ใส่ secret/payloadลับ | ไม่เปลี่ยน evidence/job เป็น success                                            |
| network timeout/commit ล้มหลังรับผล       | OUTCOME_UNKNOWN + operation refs         | reconcile งานเดิม เก็บ receipt idempotent ไม่ rollback external signature สมมติ |
| certificate/timestamp/revocation ไม่ทราบ  | INDETERMINATE + missing checks           | ตรวจแหล่งจริงใหม่ เก็บรายงานใหม่ รักษารายงานเดิม                                |
| technical valid แต่ policy/อำนาจไม่ยืนยัน | official BLOCKED                         | เจ้าของตรวจนโยบาย ไม่ใช้ technical PASS แทน signoff                             |

Delivery55 รับได้เฉพาะ exact artifact/record snapshot และ dispatch permit ที่ยังใช้ได้ตามนโยบาย ไม่ส่งเพราะ callback status=success หรือภาพปรากฏบน PDF การมีลายมือชื่อไม่เพิ่ม read/download/export ACL ผู้รับหรือ worker

## งานค้างและการตรวจรับ

ต้อง ADR/migration ของ signing_operation/receipt/report/approved manifest ตาม Q023 โดยไม่เปลี่ยน logical04 ที่เป็นประวัติแบบเงียบ ๆ ต้อง verified provider contract/trust/identity/time/revocation/privacy/outage/key custody ตาม Q009/Q025 และ current authorization protocol ตาม Q006 ไม่มี signing SDK/dependency/keys/provider network/migration/test code ในรอบ57 P57-13–24 NOT RUN; fixture/JSON reference ไม่เป็น cryptographic verification
