# หน้าทะเบียนและรหัสชิ้นที่ตรวจสิทธิ์ — บท 47

รุ่น 0.1 | 7 ตุลาคม 2569 (2026-10-07) | source `5db4f45` | **Proposal / BLOCKED — ยังไม่มีหน้า UI, QR/barcode image หรือ endpoint ของพัสดุ**

## 1 หน้าทะเบียนที่เสนอ

ใช้app shell/UIกลาง09และบัญชี08/DAL07 หน้าทดลองในเอกสารยังไม่ใช่หน้าที่เปิดใช้งานได้ อ่าน [INVENTORY_SCHEMA](INVENTORY_SCHEMA.md) และ [ASSET_CLASSIFICATION](ASSET_CLASSIFICATION.md)

| เส้นทางเสนอ                      | หน้าที่และข้อมูล                                                                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| /app/inventory/items             | item/code/ชื่อ/ชนิด/unit/category; filterหน่วยงานที่มีสิทธิ์/warehouseและpagination; ไม่แสดงqtyรวมต่างหน่วย                                     |
| /app/inventory/warehouses        | Organizationกลาง/คลัง/จุดเก็บ; labelและaddressversionที่มีหลักฐาน ไม่มีพิกัดหรือที่อยู่ที่เดา                                                   |
| /app/inventory/assets            | code/ชนิด/หมวด/สถานะ/location ณ วันที่อ้างอิง ตามscopeและpurpose; serial/price/custodian field policyแยก                                        |
| /app/inventory/assets/[asset_id] | รายชิ้น current/request/historyแยก; acquisition/cost/funding/owner/custody/location/evidenceตามสิทธิ์; unknownไม่เติม0หรือชื่อคนปลอม            |
| หน้าร่าง/แก้ข้อมูลและแผ่นรหัส    | sharedform/CAS revision/currentgrant/serverrequirements/privatefileupload/previewreview ก่อนcreate/effective; print permissionและauditตามpolicy |

ใช้keyboardได้ filterมีlabels/submit/reset focus/error summary/empty stateบอกวิธีลดเงื่อนไข statusมีข้อความไม่ใช้สีอย่างเดียว ที่375/768/1024/1440ตารางหรือlistใช้ได้ หน้าที่มีหลายunitแสดงหน่วยในทุกแถว ไม่มีการใช้ซ่อนเมนูเป็นสิทธิ์ ไม่แสดงstock0เมื่อแหล่งmovementยังไม่มี

การแก้draft/returnedใช้requestเดิมและrevision ถ้าถูกแก้พร้อมกันแจ้งconflictให้โหลดและตรวจความต่าง ไม่เปลี่ยนข้อมูลมีผลตั้งแต่กดส่ง การregister/แก้รหัส/เปลี่ยนclassification/cost/เจ้าของที่ต้องapproveใช้workflowกลางตามpolicy เมื่อมีผลเพิ่มversion/audit/outboxatomic ไม่สร้างapprovalengineพัสดุอีกชุด ไม่สร้างledgerเงินหรือstockจากGET/list/print

## 2 QR และ barcode เป็น pointer

QRเสนอpayloadเป็น canonical HTTPS same-origin URL `/app/inventory/assets/<opaque-resource-uuid>` เท่านั้น UUIDสุ่มเป็นรหัสชี้ทรัพยากร **ไม่ใช่ secret หรือ capability** ใช้UUIDจริงของAssetRegisterที่serverresolve ไม่เอาasset_code/serial/ชื่อคน/ราคา/แหล่งเงิน/objectkey/password/token/session/signeddownloadลิงก์ใส่ในภาพรหัส

barcodeทางเลือกใช้public opaque label identifierในnamespaceเดียว ผูกกับassetUUIDที่server ไม่ใช่รหัสlogin/token ข้อมูลบนแผ่นที่มนุษย์อ่านได้ให้policyกำหนด ข้อมูลขั้นต่ำ; ราคา/ข้อมูลคนไม่พิมพ์โดยปริยาย มีtext linkสำหรับใช้งานโดยไม่ต้องกล้อง ไม่มีgenerator/ภาพQR/barcodeในรอบนี้ ไม่มีdependencyใหม่

Originและredirectหลังloginต้องallowlist configที่ยืนยัน ปฏิเสธexternalorigin/protocol/query/fragment/userinfoผิดรูปแบบ ไม่เชื่อreturnToหรือQRinputจากclientให้ redirect ภายนอก โหมดlocalใช้loopbackHTTPได้เฉพาะconfigurationdevที่ตรวจแล้ว ไม่ใส่publicexamplehostดูเหมือนเปิดเว็บจริง

## 3 Server behavior ทุกครั้งที่อ่าน

1. แยกparse/validationออกจากการค้น resource ตรวจcurrent session/account/action ก่อนแสดงรายละเอียด unauthenticatedให้loginหรือdenyที่ไม่เปิดข้อมูลภายใน pending/noactivegrantdeny
2. DAL resolveAssetId→ownerOrg/warehouse/location/currentversion จากserver แล้วตรวจscopeที่ได้รับมอบหมายตามสายและช่วงเวลา ไม่ใช้orgที่QR/query/bodyส่งมาเป็นgrant asset/warehouse/address/filecontextต้องตรงกัน
3. คืนDTOตามfieldpolicy purpose/action: registerreadไม่ให้ราคา/custodian/contact/evidenceอัตโนมัติ มี permissionเฉพาะเมื่อpolicyยืนยัน ไฟล์ตรวจversion+CLEAN/currentfileACLอีกครั้ง แม้ทรัพย์สินอ่านได้ก็ไม่ถือว่าอ่านเอกสารทุกใบได้
4. คนไม่มีสิทธิ์/รหัสไม่มีอยู่ต้องไม่เผยexists/code/serial/owner/price/ประวัติหรือpreview ให้failure responseที่policyกำหนดสอดคล้อง ปิด shared/static cache ของprivateHTML/API/QRprint; ตรวจdownload/export/jobด้วยcurrentgrantsและrevocationprotocol
5. QRหรือbarcodeถูกส่งต่อยังไม่เปิดข้อมูลให้คนใหม่ การหมดsession/ถอนสิทธิ์/สิ้นช่วงมอบหมายมีผลในการอ่านครั้งถัดไป ไม่อ้างว่าลบไฟล์ที่คนได้รับแล้วได้ การเปลี่ยนผู้รับผิดชอบหรือที่อยู่ไม่เพิ่มสิทธิ์เว็บโดยอัตโนมัติ

UUIDในตัวอย่าง [inventory-47-plan](fixtures/inventory-47-plan.json)เป็นsynthetic descriptor ไม่มีresource/routeจริง ตรวจรูปแบบpayloadไม่ใช่การพิสูจน์authผ่าน ไม่ส่งลิงก์เพียงเพราะรู้UUIDไปสร้างsigneddownloadโดยข้ามACL

## 4 แผนตรวจรับและ blockers

| Case   | เมื่อระบบพร้อมต้องตรวจ                                                                                 | สถานะ   |
| ------ | ------------------------------------------------------------------------------------------------------ | ------- |
| P47-01 | itemกลางเดียวหลายคลัง/location groupedตามunit; ไม่มีmovementแสดงunavailable                            | NOT RUN |
| P47-02 | item/UOM/warehouse/location/category/FK-context/typeguards และไม่สร้างOrganization/Personซ้ำ           | NOT RUN |
| P47-03 | quantityexact/scale/discrete/finite/ratio และmoneyexact/known-unknownไม่มีfloat                        | NOT RUN |
| P47-04 | item-package-specificconversionที่มีรุ่น แยกdimension/units ไม่มีruledeny ไม่latestทับsnapshot         | NOT RUN |
| P47-05 | assetcodeuniqueรวมinactive/nativeconcurrentregister และsource_receipt+ordinalidentity                  | NOT RUN |
| P47-06 | samekey/hashretry/newhashconflict/CAS/evidence/audit/outboxatomic                                      | NOT RUN |
| P47-07 | assetunitจำนวนเต็ม serialoptional/nofakezero cost sourceunknownไม่official                             | NOT RUN |
| P47-08 | current/history/future/correctionvalid-at-known-at/custody-policyและoldnamesตามversion                 | NOT RUN |
| P47-09 | QRpayloadไม่มีPII/price/token/objectkey; generatordecodeได้ URLbarcodebindingตรงasset                  | NOT RUN |
| P47-10 | ไม่มีsession/noauthorityสแกนแล้วอ่านdetailsไม่ได้ ไม่เปิดHTML/API/preview/cache/static                 | NOT RUN |
| P47-11 | asset_id/warehouse/org/contextข้ามscopeผ่านURL/body/query/export/job/downloaddeny                      | NOT RUN |
| P47-12 | revoke/suspend/expiry/delegation/currentgrantระหว่างread/job/printและafterlogin                        | NOT RUN |
| P47-13 | privatefiledirty/CLEANversion/scan/ACL/newversionและmakerchecker/techdeny                              | NOT RUN |
| P47-14 | textlink/barcodekeyboard/labels/focus/empty/error/status/4viewportsไทย                                 | NOT RUN |
| P47-15 | unknownclassification/costthreshold/currency/custody/officialcodes/authoritydeny ไม่เดาค่าเสื่อม       | NOT RUN |
| P47-16 | registration/GET/QRprint/readไม่มีpayment/reservation/stock/roleassignmentใหม่และevidencehistoryไม่หาย | NOT RUN |

เกณฑ์47-01ผูกP47-01–08 เกณฑ์47-02ผูกP47-09–13/16 ทั้งสองBLOCKED ต้อง46/ส่วนกลาง/ADR/schema/migration/nativeDB/DAL/UI/filesจริงก่อนexecute ไม่ใช้fixture grouping/QRpointer validationแทนเกณฑ์ผ่าน `db:test` ปัจจุบันcore06ไม่runnerasset typecheck/lint/build/browser/QRdecode/nativeconstraints/worker/scan/currentDALยังNOT RUNรอบ47 ไม่เริ่ม48
