# คิวตรวจผู้สมัครและผลกระทบก่อนอนุมัติ — บท 37

รุ่น 0.1 | 5 ตุลาคม 2569 (2026-10-05) เวลาไทย | source `db51163` | **Proposal / BLOCKED — ไม่มี review queue/decision/impact services จริง**

ต่อ [ROSTER_WORKSPACE](ROSTER_WORKSPACE.md) PG-25 ใช้ [APPLICATION_STATES](APPLICATION_STATES.md), [ELIGIBILITY_RULES](ELIGIBILITY_RULES.md), [SEAT_ALLOCATION](SEAT_ALLOCATION.md) และหลักการ [REQUEST_IMPACT_CHECKS](REQUEST_IMPACT_CHECKS.md)/[PERSON_CHANGE_RECOVERY](PERSON_CHANGE_RECOVERY.md) ไม่สร้างworkflowหรือทะเบียนใบสมัครชุดใหม่

## 1 คิวและการตัดสินใจที่เสนอ

| งาน             | Guards/สิ่งที่แสดงตามสิทธิ์                                                                              | ผลที่ต้องรักษา                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| list/read queue | action+สายพื้นที่+ระดับที่มอบหมาย+ช่วงเวลา ตรวจก่อนfilter/count/pagination ตัวเลือกtypedcontextจากserver | snapshotที่ส่ง รุ่นกฎ/evidence metadata และผลตรวจปัจจุบัน ไม่privatebodyเต็ม          |
| ส่งกลับ         | currentreviewstep/assignment/makerchecker/expectedrevision พร้อมreason/evidenceที่policyกำหนด            | returnedภายใต้ApplicationIDเดิม คำตัดสิน/รุ่นเดิมคงอยู่                               |
| อนุมัติ         | currentapprovestep/authority/delegation/makerchecker/eligibility/impact/evidence/CAS                     | อ้างรุ่นที่ตรวจและtransactionตามSEAT_ALLOCATION ไม่clientapprovedหรือเทคนิคบังคับผ่าน |
| ปฏิเสธ          | currentauthority/step/revision พร้อมเหตุผลที่fieldACLควบคุม                                              | rejectedเก็บsnapshot/decision ไม่ลบคน/Enrollment                                      |
| ถอน             | ช่วงสถานะ/อำนาจตามpolicy; approvedต้องwithdrawalamendmentและdownstreamplanตาม35                          | ไม่directPATCH; allocationrelease/บัตร/reason/historyสัมพันธ์กับคำอนุมัติใหม่         |

submitted/reviewingในworkflow11 mapกับApplicationตาม35 ผู้ยื่น/ผู้แก้สาระไม่อนุมัติงานตนเอง ไม่ใช้role nameจากclientหรือservicecredentialเป็นgrant การอ่านหลักฐานต้องFileVersionกลางที่ผ่านscan+ACL และเจ้าหน้าที่ตรวจเนื้อหาตามหน้าที่ metadata Document06ไม่ใช่ไฟล์ที่ตรวจแล้ว

status/read/detail/action/export/jobตรวจสิทธิ์ปัจจุบันทุกครั้ง การถอนdelegation/sessionต้องทำให้API/งานคิวใช้ไม่ได้ตามpolicy ไม่เพียงซ่อนปุ่ม servererrorsไม่เปิดชื่อ/เหตุผล/เอกสารนอกพื้นที่ revisionเปลี่ยนให้409และโหลดใหม่ ไม่autoapproveSnapshotรุ่นใหม่

## 2 Impact report ที่ตรึงกับเรื่องและเวลาตรวจ

Contractเสนอ report_id/revision, application_id/submitted_snapshot_id/reviewcycle, person/org/center/session/offering IDs, policy/evidence/source versions, observed_at/valid_at/known_at, target guard epochs, adapter completeness, disposition/actionplanและผู้ตรวจ มีcorrelation/provenance ไม่secretหรือfullPIIในaudit

| Adapterเสนอ                | สิ่งที่เปรียบเทียบกับตอนสมัคร                                                     | ผลก่อนอนุมัติ                                                               |
| -------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Person status              | status eventsที่มีผลจริง/คำสั่งอนาคต/รายการแก้ย้อนหลัง ไม่เพียงชื่อหรือis_active  | แสดงeventref/ช่วงเวลา/ผลที่ruleกำหนด ให้เจ้าหน้าที่ตรวจตามหน้าที่           |
| Affiliation/positions      | ย้าย/พ้นหน้าที่/ยุติสังกัด และบทบาทผู้ยื่นที่ยังมีผล                              | ประเมินeligibility/currentgrantใหม่ ไม่เปลี่ยนscopeจากที่อยู่เอง            |
| Organization/center        | ยุบ/ปิด/ย้าย/คำสั่งแก้พร้อมวันที่มีผล แยกสนามแม่บทกับรอบ/ประเภท/ระดับที่เปิด      | หากcontextใช้งานไม่ได้ block/ต้องamendmentที่รับรอง ไม่โยกผู้สมัครเงียบ ๆ   |
| Exam calendar/capacity     | รอบ/เวลา/วันสอบ/quotas/pools/reservations/availability ตาม21                      | รายงานconditionปัจจุบัน ไม่รับประกันที่จากcountก่อนtransaction              |
| Application/evidence/rules | revision/snapshot/sealedpins/ผลประโยคเดิม/หลักฐาน/withdrawnrule/currentreviewstep | refreshเมื่อเปลี่ยน ไม่ใช้approval/evidenceรุ่นที่ไม่ตรง                    |
| Downstream work            | ที่นั่ง/บัตร/รายชื่อ/exportpending/การจัดส่งที่ownerยืนยันเกี่ยวข้อง              | แผนแก้และผู้รับรองตามขอบเขต ไม่ลบเอกสาร/ประวัติ/ผลสอบเพื่อทำรายการค้างเป็น0 |

Personลาสิกขาหรือพ้นตำแหน่งไม่เท่ากับขาดคุณสมบัติทุกประเภทหรือระงับบัญชีทั้งหมด ห้ามกำหนดผลแทนเจ้าของกฎ การเสียชีวิต/สิ้นสุดสถานะต้องอ้างเหตุการณ์ที่ตรวจและมีผลแล้วพร้อมrule; คำขอที่ยังไม่อนุมัติไม่เปลี่ยนทะเบียน current account/assignmentเป็นอีกguardต่างหาก

วันที่ตรวจอนุมัติกับวันที่สอบต้องแยก หากคำสั่งอนาคตจะกระทบวันสอบที่รอบกำหนดให้แสดงแผนล่วงหน้าตามpolicy ไม่ปิดสนามหรือเปลี่ยนPersonก่อนวันมีผล สถานะเปลี่ยนที่ทราบย้อนหลังใช้valid_at/known_atและsourceversion ไม่rewriteสิ่งที่เจ้าหน้าที่เคยเห็นหรือsnapshotเดิม

## 3 ความครบถ้วนและความสดของรายงาน

| Validation resultเสนอ | ความหมาย                                            | Decision guard                                                        |
| --------------------- | --------------------------------------------------- | --------------------------------------------------------------------- |
| NOT_READY             | adapter/model/rule/sourceไม่พร้อมหรือunknown        | ห้ามตีความcount0/ไม่มีeventและอนุมัติผ่าน                             |
| ACTION_REQUIRED       | มีผลกระทบที่ต้องแผน/แก้/ตรวจเพิ่มเติม               | ไม่กดackเพื่อข้ามinvariants; ต้องowner planที่รับรอง                  |
| STALE                 | target/application/rule/evidence/guard epochเปลี่ยน | refreshรายงานและให้ตรวจรุ่นใหม่                                       |
| READY                 | adaptersที่จำเป็นครบและเงื่อนไข/แผนตรงรุ่น          | ยังต้องcurrentauthority/maker/eligibility/capacityและtransactionguard |

UIแสดงก่อนตัดสินและserviceตรวจreportbindings/epochsอีกครั้งในtransaction writersของPerson/Organization/ExamCenter/status activationและallocation/amendmentต้องประสานstableguardเดียวกัน ไม่CASเฉพาะใบสมัครแล้วถือstatusอีกตารางไม่เปลี่ยน ผูกsource facts/validityตามpolicyที่รับรอง ไม่ตั้งTTLทางการเอง

การทดสอบเกณฑ์37-02ต้องfixturesที่มีผู้สมัครและสถานะเปลี่ยนจริง พร้อมsource order/evidence/versionและreport APIที่อ่านได้ตามscope ตรวจทั้งยุติหลังสมัคร/อนาคต/แก้ย้อนหลัง ไม่absenceoftablesหรือcount0เป็นหลักฐานผ่าน

## 4 Gate และกรณีทดสอบ

P37-02/08–11/13–14ในSEAT_ALLOCATIONยังNOT RUN ยังไม่มีคิว/report/decision/API/servicesหรือstatus adaptersจริง ไม่มีเอกสารกลาง/FileVersionให้preview Scope/fields/เหตุผลเอกสาร privateไม่publicจากtrackingID

ทั้งสองเกณฑ์37ยังBLOCKED ต้องผ่าน36และต้นทางก่อนimplementation บท38ยังไม่เริ่ม ไม่มีschema/migration/runtimeใหม่
