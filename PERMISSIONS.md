# สิทธิ์และขอบเขตข้อมูล — เว็บไซต์กองบริหารทะเบียนและวัดผล

บท 02 | รุ่นเอกสาร 1.2 | 3 ตุลาคม 2569 (2026-10-03) | สิทธิ์เป็นสัญญาออกแบบ ยังไม่มี RLS/policyจริง

## 1 หลักการตัดสินสิทธิ์

Permission คือทำอะไรได้ ส่วน scopeคือทำกับรายการไหนได้ ต้องผ่านทุกเงื่อนไข ไม่ใช่มี roleชื่อเดียวแล้วทำได้ทุกเรื่อง serverต้องใช้ sessionที่ตรวจแล้วและgrantล่าสุด RLSเป็นชั้นฐานข้อมูลเสริม ทุกตารางของโครงการเปิดRLSและนโยบายdefaultปฏิเสธ ก่อนมีallowที่ชัด

ภายใน: active_account + valid_session + module_action_grant + valid_assignment_time + target_in_assigned_scope + workflow_state + field_visibility + ACLเมื่อมีเอกสาร + maker_checkerเมื่อเป็นงานสำคัญ

read_selfใช้ person/enrollment/ownershipที่ผูกกับบัญชีจริงแทนtarget_scopeของเจ้าหน้าที่ แต่ไม่ให้สิทธิ์ของคนอื่น publicใช้approved_projectionเฉพาะข้อมูลที่อนุญาต ไม่ใช้RLSของเจ้าหน้าที่ขยายสิทธิ์anonymous ข้อมูลต้องห้ามสาธารณะคือเลขประจำตัวประชาชน วันเกิด ที่อยู่ส่วนตัว เบอร์ส่วนตัวและหลักฐานส่วนตัว

scopeต้องเป็นหน่วยตนและหน่วยใต้สังกัดใน **สายและชนิดความสัมพันธ์ที่ได้รับมอบหมาย** ภูมิศาสตร์ สายปกครอง และสังกัดการศึกษาเป็นคนละมิติ ไม่มีสิทธิ์เพียงเพราะอยู่จังหวัดเดียวกัน ผู้มีหลายหน้าที่ใช้หลายgrantที่รับรอง แต่อำนาจแต่ละรายการต้องหาgrantที่ครบเงื่อนไข ไม่รวมคนละgrantให้เกิดอำนาจใหม่ที่ไม่มีใครมอบ

ช่วงgrantใช้ valid_from <= server_now < valid_to ถ้ามี valid_to เป็นข้อเสนอช่วงปิดปลายตาม Q017; ถ้าเวลา/สาย/ชนิดความสัมพันธ์ไม่ชัดให้ปฏิเสธ ผู้มีตำแหน่งในทำเนียบไม่เท่ากับมีaccountหรือapproval grant

## 2 สิทธิ์แยกตามการกระทำ

| รหัส | actionเสนอ | ความหมาย | เงื่อนไขเพิ่ม |
| --- | --- | --- | --- |
| P01 | read_self | ดูข้อมูลของตน | ต้องผูก user_account กับ person/enrollment/ผู้ถือครองอย่างตรวจได้; ไม่ขยายไปคนอื่น |
| P02 | read_scope | ตรวจ/ดูข้อมูลในพื้นที่ | หน่วยตน+หน่วยลูกในสายที่ได้รับมอบหมายและช่วงเวลา; ACL/field visibilityเพิ่มเมื่อเกี่ยวข้อง |
| P03 | edit | สร้าง/แก้/ปิดใช้งาน | module grant+scope+สถานะที่แก้ได้; การเปลี่ยนหน่วยต้องผ่านทั้ง old/new scope |
| P04 | submit | ส่งตรวจ/ส่งคำตอบ/ยืนยันงาน | ระบุ module/actionและ owner ของงาน; submit importไม่เท่ากับ approve application |
| P05 | approve | ตรวจรับ/อนุมัติตามอำนาจ | เฉพาะประเภทเรื่อง วงเงิน แหล่งเงิน/รอบและช่วงมอบหมายที่รับรอง; maker≠checker |
| P06 | publish | เผยแพร่ | grantแยกจาก approve; เฉพาะรุ่นอนุมัติและนโยบายเปิดเผยที่รับรอง |
| P07 | download | ดาวน์โหลด/ส่งออก/พิมพ์ | grantแยกจากดู พร้อม scope/ACL/fileversion/scan status และ projection |
| P08 | manage_accounts | จัดการบัญชี | ขอบเขตบัญชีที่มอบหมาย; ไม่รับอำนาจธุรกิจหรือยกระดับตนโดยอัตโนมัติ |
| P09 | read_public | ดูเนื้อหาสาธารณะ | เฉพาะ public projection ที่อนุญาตแล้ว; ใช้เฉพาะข้อมูลขั้นต่ำ ไม่ใช่สิทธิ์ฐาน private |
| P10 | restore | สำรอง/กู้คืนแบบควบคุม | environment+operationที่ได้รับมอบหมาย; ควบคุมผู้ปฏิบัติและหลักฐานตรวจรับ |
| P11 | read_audit | อ่านหลักฐานตรวจสอบ | ภารกิจตรวจและ scopeที่ได้รับมอบหมาย; ห้ามแก้/ลบ audit_logs |

P01/P02ไม่ให้P03/P05/P06/P07/P08อัตโนมัติ P04ส่งตรวจไม่ใช่อนุมัติ P05อนุมัติไม่ใช่เผยแพร่ P07โหลดไม่ใช่สิทธิ์แก้ไฟล์ P08บัญชีไม่ใช่สิทธิ์งบ/ผลสอบ เรื่องสำคัญต้องบังคับ creator_id != approver_id และscope/อำนาจ/ช่วงเวลาของผู้อนุมัติถูกต้องตาม Q006

## 3 Matrixบทบาทที่เสนอ

ชื่อบทบาทคือหน้าที่ออกแบบ ไม่ใช่ชื่อตำแหน่งทางการหรือผู้ได้รับแต่งตั้ง เครื่องหมาย “—” หมายถึงไม่ให้สิทธิ์จากบทบาทนั้น ค่าอื่นมีเงื่อนไขทุกข้อในหัวข้อ1/2 และมอบgrantจริงตาม Q005/Q006 ตัวบุคคลอาจมีหลายบทบาทที่รับรองโดยไม่ข้ามmaker-checker

| บทบาท | หน้าที่ | P01 ตน | P02 พื้นที่ | P03 แก้ | P04 ส่ง | P05 อนุมัติ | P06 เผยแพร่ | P07 โหลด | P08 บัญชี | ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-PUBLIC | ผู้เยี่ยมชม | — | — | — | — | — | — | ไฟล์ public ตาม P09 | — | P09 |
| R-SELF | เจ้าของข้อมูล/ผู้เรียน | ของตน | — | เสนอแก้ของตนตาม workflow | ของตน/attempt | — | — | เฉพาะของตนที่มี grant | — | ไม่มี field private ของคนอื่น |
| R-REGISTRY | เจ้าหน้าที่ทะเบียน | ตาม binding ของตน | ทะเบียนใน scope | people/organizations ตาม grant | เรื่องที่รับผิดชอบ | — | — | ตาม scope+grant | — | ตรวจพื้นที่ไม่เท่ากับมี approval |
| R-AREA-REVIEW | ผู้ตรวจข้อมูลพื้นที่ | ของตน | ทะเบียน/คำขอใน scope | เฉพาะคำวินิจฉัย/ส่งกลับตาม grant | ส่งผลตรวจ | เฉพาะเรื่องที่มอบหมายแยก | — | ตาม scope+grant | — | Q006 สำหรับอำนาจอนุมัติ |
| R-SCHOOL | เจ้าหน้าที่สำนัก/สถานศึกษา | ของตน | ผู้สมัครหน่วยที่มอบหมาย | application/import draft | สมัคร/commit import | — | — | template/รายงานตาม grant | — | Excel ไม่อนุมัติสมัครหรือผลสอบ |
| R-CENTER | เจ้าหน้าที่สนามสอบ | ของตน | สนามและรอบที่มอบหมาย | คะแนน/ที่นั่งตาม grant | คะแนนเพื่อรับรอง | — | — | เอกสารรอบตาม grant+ACL | — | ผู้รับข้อสอบไม่มี answer-key grant |
| R-TEACHER | ผู้สอน/ผู้จัดทำบทเรียน | ของตน | กลุ่มผู้เรียนที่มอบหมาย | เนื้อหา/rubric ตาม grant | เนื้อหาเพื่อรับรอง | — | — | เนื้อหาที่มี grant | — | เฉลยไม่เปิดด้วย read lesson |
| R-CONTENT-REVIEW | ผู้ตรวจเนื้อหา | ของตน | หลักสูตรที่รับผิดชอบ | คำวินิจฉัยตาม grant | ผลตรวจ | เนื้อหาที่มอบหมาย ไม่ใช่ตนสร้าง | — | ตาม grant | — | ผลการเรียนไม่ใช่ผลสอบทางการ |
| R-REQUEST-APPROVER | ผู้อนุมัติคำขอ | ของตน | ประเภทเรื่อง/พื้นที่มอบหมาย | ไม่แก้ต้นฉบับของผู้เสนอ | ส่งกลับ/ตัดสิน | เฉพาะประเภทเรื่องที่รับรอง | — | หลักฐานตาม ACL | — | maker-checker และเวลามอบหมาย |
| R-RESULT-APPROVER | ผู้รับรองผลสอบ | ของตน | สนาม/รอบมอบหมาย | คำวินิจฉัย ไม่เขียนคะแนนต้นฉบับแทน | ผลตรวจ | ผลสอบที่มอบหมาย ไม่ใช่ตนสร้าง | — | ตาม grant | — | ไม่มี publish โดยอัตโนมัติ |
| R-PUBLISHER | ผู้เผยแพร่ผล/เนื้อหา | ของตน | เฉพาะรุ่นที่จะเผยแพร่ | — | — | — | เฉพาะ module/รุ่นอนุมัติ | ตาม grant | — | ไม่เป็นอนุมัติจาก publish; Q008 |
| R-FINANCE | เจ้าหน้าที่การเงิน | ของตน | หน่วย/แหล่งเงิน/ปี | งบร่าง/บันทึกตาม grant | รายการการเงิน | — | — | รายงานงบตาม grant | — | exact decimal และ period rules |
| R-FINANCE-APPROVER | ผู้อนุมัติการเงิน | ของตน | งบตามอำนาจ | คำวินิจฉัย | ส่งกลับ/ตัดสิน | ตามวงเงิน ไม่ใช่ตนสร้าง | — | ตาม grant | — | อำนาจรอ Q006 ไม่เดาวงเงิน |
| R-INVENTORY | เจ้าหน้าที่พัสดุ | ของตน | คลัง/หน่วยมอบหมาย | stock/asset ตาม grant | ขอซื้อ/adjustment | — | — | รายงานตาม grant | — | approval/disposalต้อง grant แยก |
| R-OFFICE | เจ้าหน้าที่สารบรรณ/ผู้รับ | ของตน | เรื่องที่ scope+ACL | ตาม grantและสถานะ | รับทราบ/ส่ง/มอบหมายตาม grant | เฉพาะเรื่องที่ได้รับมอบหมายแยก | — | P07+ACL ไม่ได้จากดูอย่างเดียว | — | หนังสือลับไม่เปิดตาม roleทั่วไป |
| R-TECH-ADMIN | ผู้ดูแลเทคนิค | ของตน | สถานะเทคนิคขั้นต่ำ | ตั้งค่าที่มอบหมาย ไม่ใช่แก้ธุรกิจ | คำขอบัญชี/บทบาทตาม workflow | — | — | หลักฐานเทคนิคที่มี grant | บัญชีตามขอบเขต | P10 เฉพาะ grantสำรอง; ไม่มีงบ/ผลสอบ/เอกสารลับโดยปริยาย |
| R-AUDITOR | ผู้ตรวจสอบ | ของตน | ภารกิจตรวจที่มอบหมาย | — | — | — | — | รายงาน/หลักฐานตาม grant+ACL | — | P11 แบบ read-only |

## 4 ขอบเขตข้อมูลและบริการต่อระบบ

| ระบบ | หน่วยขอบเขตเสนอ | เงื่อนไขเฉพาะ | UCที่ตรวจ |
| --- | --- | --- | --- |
| 01 | personของตน; organization/หน้าที่ของเจ้าหน้าที่ตามสาย | ฟิลด์private/historyแยกvisibility; ขอย้ายตรวจold/newscopeและauthority; ไม่รับสิทธิ์จากตำแหน่งเอง | UC-S01-01, UC-S01-02 |
| 02 | organization subtreeตามrelationtype; center_sessionตามปี/รอบ | parent/childไม่เป็นวงจร; scopeทั้งสองด้านเมื่อreparent/ย้าย; ผู้รับข้อสอบไม่รับanswer-key ACL | UC-S02-01, UC-S02-02 |
| 03 | enrollment/attemptตน; curriculum/groupที่ผู้สอนรับมอบหมาย | no answer_keyก่อนส่ง; rubric/manualgradingแยก; published contentไม่เปิดdraft | UC-S03-01, UC-S03-02 |
| 04 | request subject/targetและประเภทเรื่องที่รับมอบหมาย | approval maker-checker; activationมีผลจริงและตรวจ grantอีกครั้ง; publictrackingไม่เปิดข้อมูลprivateด้วยเลขลำดับ | UC-S04-01, UC-S04-02 |
| 05 | organizationผู้สมัคร; exam_session+center_sessionของเจ้าหน้าที่ | approvalและpublishแยก; score/releaseเป็นรุ่น; publicค้นเฉพาะapprovedreleaseแยกปี | UC-S05-01, UC-S05-02, UC-S05-03 |
| 06 | organization+funding_source+fiscal_year+วงเงิน/ประเภทเรื่อง | technical adminไม่approve; exactdecimal/periodlock; ผู้ตรวจสอบread-only | UC-S06-01, UC-S06-02 |
| 07 | warehouse/organization+assetcustody+งบที่อ้าง | stocktransferตรวจต้นทางปลายทาง; adjustment/disposalต้องapprovalแยก | UC-S07-01, UC-S07-02 |
| 08 | correspondence ACL+fileversion+recipient/assignment | fulltext/preview/download/export/print/cacheใช้ACLเดียวกัน; techadminไม่อ่านหนังสือลับโดยปริยาย | UC-S08-01, UC-S08-02 |
| 09 | import_batch owner+organization+exam_session+สิทธิ์ล่าสุด | native Data API/RPCต้องไม่เขียนapplicationด้วยgrantimportที่ผิดscope; commitผ่านserviceระบบ5 | UC-S09-01, UC-S09-02 |

## 5 ช่องทางที่ต้องตรวจและป้องกันการยกระดับ

| ช่องทาง | เงื่อนไขที่ต้องผ่าน | ผลตรวจรับภายหลัง |
|---|---|---|
| UI/route/server action/appAPI | session, grant, scope, fieldvisibility, workflowและACL | ซ่อนเมนูอย่างเดียวไม่ผ่าน; directAPI denialทุกระบบตาม TRACEABILITY |
| native Data API/RPC | RLS/read grants/write checksและexecute privileges; ตรวจinput scopeใหม่ | SELECTไม่คืนแถวprivate; INSERT/UPDATE/DELETEผิดสิทธิ์ไม่สำเร็จ; RPCprivilegedไม่exposeทั่วไป |
| Storage/preview/full text | scan passed, privatebucket, documentACL+version+grant | URLเดาหรือfileversionของคนอื่นไม่โหลด; search/autocompleteไม่คืนprivate metadata |
| export/download/print/cache | P07แยกจากดู; reauthorizeทุกคำขอ; cacheไม่แชร์privateข้ามactor/scope | ผู้ดูได้แต่ไม่มีP07พิมพ์ไม่ได้; public DTOไม่มีฟิลด์ต้องห้าม |
| worker/job/outbox | initiating_actor, request scope, latest grant/time และpolicyversion | ถอนgrantหลังdryrunแต่ก่อนjobต้องหยุด; servicecredentialไม่ให้businessauthorityอัตโนมัติ |
| admin/accountmanagement | P08จำกัดบัญชีและworkflowมอบgrant | ผู้ดูแลเทคนิคไม่สร้างapprovalgrantให้ตนเอง; ปิดบัญชีแล้วsession/grantที่พึ่งบัญชีนั้นใช้ต่อไม่ได้ |
| restore/backup | P10จำกัดoperation/env; หลักฐานและผู้ตรวจรับ | nativeRPCของผู้ใช้ทั่วไปไม่restore; เทคนิครับเฉพาะoperationที่มอบหมาย ไม่เปิดไฟล์ลับทั่วไป |

RLSสำหรับUPDATEต้องควบคุมทั้ง rowเดิมและค่าที่จะเขียน ไม่รับ organization_id/user_id/roleที่ clientแอบเปลี่ยนเป็นหลักฐานสิทธิ์ ตาราง role_assignment/scope/document_acl/audit_logsไม่มีสิทธิ์ให้ผู้ใช้เขียนgrant/ACL/logตามใจ ไม่ให้harddeleteข้อมูลจริงหรือแก้/ลบ auditผ่านbusinessrole

การใช้service credentialต้องเก็บฝั่งserverและจำกัดoperation มีactor/correlationและตรวจอำนาจต้นทาง ไม่ใช้เป็นวิธีหลีกเลี่ยงRLSเพื่อให้ฟีเจอร์ผ่านทดสอบ หากออกsigned URL ต้องยืนยันอายุและผลการเพิกถอนใน Q019; หากต้องตัดสิทธิ์ทันทีหลังrevokeให้ใช้ช่องทางproxyที่ตรวจล่าสุด ไม่อ้างว่าจะถอนPDF/ไฟล์ที่ผู้ใช้บันทึกไว้แล้วจากเครื่องเขาได้

## 6 ผลลัพธ์การปฏิเสธและAudit

appAPI: ไม่มีsession401, actionไม่มีสิทธิ์403, objectไม่พบหรืออยู่นอกscope404 ในรูปแบบไม่เผยตัวตนของobject ส่วนnativeAPIทดสอบ no private rows/no unauthorized writesตาม REQUIREMENTS ไม่เดาว่าทุกRLSfailureเป็น403

ทุกsuccessfulเพิ่ม/แก้/ปิดใช้งานต้องมีaudit_logsในธุรกรรมเดียว ข้ออนุมัติ/เผยแพร่มีผู้กระทำ rule/version หลักฐานวันที่มีผลและเวลาบันทึก แยกจากaccess_denied/operationalevents อ่านlogเฉพาะ P11และภารกิจ ไม่มีpassword/token/servicekey/ข้อความส่วนตัวเต็มชุดในlog directnativeSELECTที่ไม่ผ่านappไม่อ้างว่าappสามารถauditทุกครั้งเอง

## 7 กรณีปฏิเสธสำคัญนอกเหนือจากUCรายระบบ

| Test ID | การลองข้ามสิทธิ์ | ผลที่คาดหวัง | REQ |
|---|---|---|---|
| TC-C-AUTH | ทุกprivateendpointไม่มีtoken/tokenหมด | 401 ไม่มีข้อมูลprivateหรือmutation | REQ-C05, REQ-C06 |
| TC-C-SELF | ผู้สร้างกดapproveงบ/คำขอ/ผลตัวเองโดยAPI | 403 ไม่เปลี่ยนstate/ledger/release | REQ-C07 |
| TC-C-ADMIN | techadminเรียกอนุมัติงบ/ผลหรือpublish | 403จากไม่มีP05/P06 ไม่รับธุรกิจจากP08 | REQ-C05, REQ-C07 |
| TC-C-ESCALATE | techadminหรือuserเขียนrole_assignmentให้ตนผ่านnativeAPI/RPC | ไม่เพิ่มgrant อำนาจอนุมัติไม่เปลี่ยน | REQ-C05, REQ-C06 |
| TC-C-DOWNLOAD | ผู้มีreadไม่มีP07เรียกdownload/printของprivatefile | 403/no bytes; nativeStorageไม่คืนไฟล์ | REQ-C15 |
| TC-C-PUBLISH | approverไม่มีP06publishผลที่ตนรับรอง | 403 ไม่มีpublicreleaseใหม่ | REQ-S05, REQ-C08 |
| TC-N05-01 | ถอนgrantหลังdryrunแล้วcommit/job; หรือUPDATEเปลี่ยนorgไปสายB | ไม่มีmutation; jobไม่ใช้snapshotgrantที่หมดแล้ว; nativewriteไม่ได้ | REQ-N05 |
| TC-C-CACHE | userBเรียกcache/export/searchของuserA | ไม่คืนprivatepayload/field/count/filelinkของA | REQ-C08, REQ-C15 |
| TC-C-AUDIT | บังคับauditwritefail แล้วทำmutation; ผู้ใช้พยายามแก้log | mutationrollback; logเดิมไม่ถูกแก้/ลบ | REQ-C11 |

ทุกกรณีในตารางคือ PLANNED / NOT RUN บทนี้ตรวจเอกสารเท่านั้น นโยบายจริงและรายชื่อรับมอบหมายรอ Q002/Q005/Q006/Q008/Q019
