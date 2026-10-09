# หน้าร่าง ส่งกลับแก้ และส่งคำขอ — บท 31

รุ่น 0.1 | 4 ตุลาคม 2569 | source ก่อนแก้ `532aa8c` | **Proposal / BLOCKED — ยังไม่มีหน้าคำขอหรือ Server Actions ที่ใช้งานได้**

บท 30 ยังไม่ผ่านตาม [ORG_CENTER_REQUESTS](ORG_CENTER_REQUESTS.md) / [schema contract](ORG_CENTER_REQUEST_SCHEMA.md) requestsมีREADMEเท่านั้น ส่วนกลางขาด Auth/DAL/UI/FileVersion/workflow/outbox เอกสารนี้กำหนดหน้าที่ต้องสร้างเมื่อ dependency พร้อม ไม่ใช่หน้าจอที่เปิดใช้งานแล้ว อ่านสัญญาบันทึก/ส่ง/trackingใน [REQUEST_SUBMISSION](REQUEST_SUBMISSION.md)

## 1 ผู้ร้องทำงานทีละขั้น

1. เข้าบัญชีกลาง เลือก “ร่างของฉัน” หรือเริ่ม intent ใหม่ที่ server อนุญาต คำขอเก่าที่กลับมาแก้ต้องเปิด request ref เดิม ไม่เรียก create ใหม่ทุกครั้งที่โหลด wizard
2. เลือกประเภทและเป้าหมายใน scope กรอกฟิลด์ตาม form/rule รุ่นที่โหลดจาก server หน่วยงาน/สนาม/ประเภทสอบมีต้นทางกลาง ไม่กรอกทะเบียนอีกสำเนา
3. บันทึกร่างด้วย expected revision; server receiptเท่านั้นยืนยันว่าบันทึกแล้ว ร่างอาจยังไม่ครบตาม draft policy แต่ยังต้องผ่านสิทธิ์และชนิดข้อมูล ห้ามเก็บ target นอก scope แล้วหวังตรวจเฉพาะตอนส่ง
4. แนบ FileVersion ผ่านบริการเอกสารกลาง รอ type/size/scan/ACL/owner binding ผ่าน ก่อนส่งเรื่อง ไม่อัปโหลด binaryผ่านwizard Server Actionอีกเส้นทางหนึ่งหรือวางใน public folder
5. ตรวจทาน snapshot ที่มีสิทธิ์อ่าน พร้อมรายการขาด/ติดเงื่อนไข การโหลดหน้า review ไม่รับประกันว่าส่งได้ serverต้องตรวจรุ่น/สิทธิ์/หลักฐานใหม่ใน transaction ตอน submit
6. เมื่อ commitสำเร็จจึงแสดง submitted/เลขติดตาม/receipt Notificationมาจาก outboxกลาง สถานะคำขอไม่เปลี่ยนทะเบียนจน approvedและeffectiveตาม30 หากACKหายให้retry intentเดิม ไม่สร้างเรื่องซ้ำ

## 2 Wizard ร่วมหกขั้น — ยังเป็นแบบเสนอ

| Step ref | ขั้น                 | ข้อมูลที่แสดง/รับ                                                                                              | เงื่อนไขไปต่อและการบันทึก                                                                                                                         |
| -------- | -------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| W31-01   | เลือกประเภท          | ORGANIZATION/EXAM_CENTER + operation + organizationtypeหรือexamtypeจากconfiguration                            | โหลดเฉพาะประเภทที่current action/scope/ruleอนุญาต ป้ายProposal/TO VERIFYชัด ไม่clientเลือกformเวอร์ชันเพื่อข้ามกฎ                                 |
| W31-02   | ระบุเป้าหมาย         | OrganizationเดิมหรือtypedESTABLISHproposal; ExamCenter/ExamSession/CenterSession/type/yearสำหรับROUND          | server resolve typedFK/context/scopeรวมhost/parent/locationที่เกี่ยวข้อง ไม่มีจังหวัดจากclientเป็นgrant; OPENที่ยังไม่มีCenterSessionใช้binding30 |
| W31-03   | รายละเอียดและวันมีผล | เหตุผล typedproposedfields/ที่ตั้งใหม่เฉพาะMOVE/effective_on Gregorian dateแสดงพ.ศ.                            | validate draft schema/ruleversion/identity/ช่วงใช้สถานที่; ไม่เดาพิกัดหรือวันสอบ ห้ามbrowserส่งeffective/approved/graderrole                      |
| W31-04   | เอกสาร               | evidence requirementรายการ/Document/FileVersionที่มีสิทธิ์/statusscan/version/hash displayที่policyอนุญาต      | attach/detachโดยsave revision; pending scanบันทึกลิงก์ในdraftได้ตามpolicyแต่ไม่preview/download/submit; changedFileVersionต้องใหม่และrevalidate   |
| W31-05   | ตรวจทาน              | safe versionedsummary/changes/evidence status/field issues/Proposal label; requeststatusคนละส่วนกับทะเบียนจริง | summaryจากserver DTOไม่spreadrawrecord; แก้ไขย้อนขั้นต้องsave/CASก่อนreviewใหม่ ข้อมูลขาดไม่หายเพราะกดnext                                        |
| W31-06   | ส่งและรับผล          | submitexpectedversion/manifest/opkey → committedreceipt/trackingref หรือsafeconflict/issues                    | submitมีcurrent validation/authorizationเอง pendingไม่เท่ากับsubmitted; disablebuttonช่วยUXแต่unique/receiptฝั่งserverกันซ้ำ                      |

ใช้shared form controls/layout09เมื่อสร้างจริง ไม่คัด wizard หนึ่งชุดต่อ10ประเภท ฟิลด์แสดงตามconfigแต่serverใช้allowlist/schemaเดียวกัน หน้า/routeเสนอ `/app/requests`, `/app/requests/new`, `/app/requests/{request_ref}/edit`, `/app/requests/{request_ref}/review`, `/app/requests/{tracking_ref}` ยังไม่มีจริง Refไม่ให้สิทธิ์เปิดหน้าโดยตัวมันเอง

การเปลี่ยน family/operation/targetหลังเริ่มมีevidenceต้องexplicit edit ที่มีสิทธิ์พร้อมnew draftrevision และinvalidate field/evidence bindingsที่ไม่เข้าประเภทเดิม ห้ามแอบเปลี่ยนcanonicaltargetผ่านhiddenfield เงื่อนไขอนุญาตเปลี่ยนในdraft/returnedต้องpolicyที่รับรอง ถ้าไม่อนุญาตให้บอกเปิดเรื่องใหม่อย่างชัดเจน ไม่autoสร้างสำเนาเมื่อformโหลดไม่ได้

## 3 Field requirements ตามสิบกรณี

ทุกแถวต้องเหตุผล/effective_on/form-rule-workflow versions/ผู้ร้องที่serverยืนยัน และหลักฐานตามconfigที่มีสถานะตรวจแล้วเมื่อsubmit ไม่กำหนดชื่อ/จำนวนหลักฐานทางการหรือเหตุผลขั้นต่ำเอง รายละเอียดauthority/source/rulesยังTO VERIFYตาม30

| Coverage ref | ประเภท                | ฟิลด์เฉพาะที่ต้องตรวจฝั่ง serverก่อนส่ง                                                                                    | ถ้าขาดหรือไม่ตรง                                                   |
| ------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| C30-01       | จัดตั้งสำนักเรียน     | allowedOrganizationType, typedidentity/proposedcode/nameหรือreuseที่รับรอง, host/parent/chain refsตามpolicy                | fieldissues/NOT_READY ไม่สร้างOrganization active                  |
| C30-02       | ยุบสำนักเรียน         | existingOrganization/type/baseversion, impact evidenceตามrequirement, effective date                                       | NOT_READYเมื่อadapter/ruleขาด ไม่ถือimpactunknownเป็น0             |
| C30-03       | จัดตั้งสำนักศาสนศึกษา | typedproposal/reuse/type/host/parentตามกฎของหน่วยนี้                                                                       | ไม่ใช้กฎสำนักเรียนแทนโดยไม่มีconfig                                |
| C30-04       | ยุบสำนักศาสนศึกษา     | existingOrganization/type/baseversion/requiredimpact/source                                                                | ปฏิเสธtypeไม่ตรง ไม่มีdeleteหรือautoย้ายสังกัด                     |
| C30-05       | เปิดสนามนักธรรม       | ExamCenter+ExamSession+ExamTypeนักธรรม/context ROUND; proposedoffering/area/capacityตาม21; CenterSession nullableเฉพาะOPEN | ไม่ใช้levelแทนtype หรือสร้างแม่บทซ้ำ                               |
| C30-06       | ปิดสนามนักธรรม        | existingCenterSessionในcenter/session/typeที่ตรง/expectedversion/impactrequirements                                        | ไม่ปิดธรรมศึกษาหรือทุกปีตามโดยอัตโนมัติ                            |
| C30-07       | ย้ายสนามนักธรรม       | existingCenterSession+context/verifieddestinationLocation-AddressVersion/evidence/interval                                 | ไม่รับfree textหรือพิกัดเดาเป็นvalidatedvenue ไม่rewriteเอกสารเก่า |
| C30-08       | เปิดสนามธรรมศึกษา     | center/session/typeธรรมศึกษา/ROUND/offering-level-stage-area-capacityที่ruleกำหนด                                          | compositecontext/requiredfieldsจากconfig ไม่copyนักธรรมทุกช่อง     |
| C30-09       | ปิดสนามธรรมศึกษา      | existingCenterSessionและcontext/impact/source/dateตามrule                                                                  | ไม่ปิดนักธรรมตามหรือโยกApplicationเอง                              |
| C30-10       | ย้ายสนามธรรมศึกษา     | existingcontext/destinationtypedFK/verification/evidence/วันตามrule                                                        | scopeทั้งต้นทาง/ปลายทางต้องผ่าน ไม่แก้centraladdressแม่บทเอง       |

ต่อให้clientซ่อนฟิลด์ผิดหรือส่งundefined ทุกrequired/type/enum/FK/rule/ACLตรวจในserviceอีกครั้ง เมื่อขาดsource/rule/adapterที่จำเป็นให้“ยังประเมินเงื่อนไขไม่ได้”ตามpolicy ไม่เลือกfallbackALLOWเพื่อให้ส่งผ่าน

## 4 Draft resume และ returned correction

serverเก็บ request UUID/intentreference/current draftrevision/row_version/confirmedcheckpointตาม policy ไม่ใช้ step/browserlocalstorage เป็นสถานะ canonical การกลับมาโหลดต้อง current read/edit scope ก่อนคืนsafeDTO ทั้งpayload/evidence/history สถานะdraft/submitted/returned/approved/effectiveแสดงตามserver ไม่ใช้Querystringกำหนด

saveDraftส่งrequestref, base_revision, operation_idและtypedpatch allowlist serverlock parent request/CAScurrentdraft versionที่ตรง แล้วappendrevision/receipt/auditในtransaction draftrevisionที่acceptแล้วไม่แก้ย้อนหลัง Policydraft/returnedแยกจากsealedsubmittedrevision การmergeด่วนโดยบวกrevisionหรือlastwritewinsทำให้หลักฐานผิด ห้ามใช้

กรณีสองคนแก้พร้อมกัน ให้หนึ่งสำเร็จ อีกคน409 พร้อมcurrent revisionและข้อความปลอดภัย ให้ผู้มีสิทธิ์อ่านใหม่และเลือกแก้patchที่ต้องการ ไม่คืนpayloadคู่แข่งที่ไม่มีfieldgrant หรือautoส่งpatchเก่าด้วยrevisionใหม่ หากtarget/config/evidenceต่างแล้วต้องตรวจครบใหม่

returnedเปิดheaderเดิมพร้อมsealedsubmittedsnapshot/return decisionที่มีสิทธิ์อ่าน ทำ correction revisionใหม่ภายใต้headerเดิมแล้วresubmit new reviewcycle เมื่อcommitสำเร็จ คำอนุมัติ/decisionเดิมไม่อนุมัติรุ่นใหม่ ทั้งheader/เลขติดตามเดิมคงเดิม ไม่สร้างWorkflowInstance/notificationซ้ำจากreload ดูรายละเอียดในREQUEST_SUBMISSION

ไม่รับประกันdraftที่ยังไม่ACKอยู่หลังreloadเครือข่ายขาด ใน31เสนอserver-firstdraft: แสดง“มีการแก้ไขที่ยังไม่บันทึก”และเตือนออกหน้าอย่างเหมาะสม ไม่บอกบันทึกแล้วจากdebounce/stepเปลี่ยน Persistentofflinequeueของreason/filemetadataต้องQ008/Q016/Q025และownerbinding/retentionก่อนสร้าง ไม่เขียนข้อมูลส่วนตัวลงlocalstorageเพื่อแก้ปัญหาโดยไม่กำหนดนโยบาย

## 5 สถานะและข้อความสำหรับ keyboard

| UI ref  | สถานะจริงที่ต้องแสดงเมื่อพัฒนา  | ข้อความ/การตอบสนองเสนอ                                                                              |
| ------- | ------------------------------- | --------------------------------------------------------------------------------------------------- |
| UI31-01 | loading / resume                | “กำลังโหลดร่างที่คุณมีสิทธิ์แก้ไข” ไม่แสดงprivatepayloadเก่าจากcacheก่อนgrant                       |
| UI31-02 | empty / ไม่มีdraft              | บอกเริ่มคำขอที่ได้รับสิทธิ์ได้ ไม่มี autoสร้างจากpageview                                           |
| UI31-03 | unsaved / saving / saved        | “ยังไม่บันทึก”/“กำลังบันทึก”/“บันทึกแล้ว”ตามserverACK ไม่ใช้สีอย่างเดียว                            |
| UI31-04 | fieldissues / policy-not-ready  | errorsummaryไทยลิงก์ไปlabel/fieldที่แก้ได้ ระบุreasoncodeปลอดภัย ไม่มีชื่อเป้าหมายนอกscope          |
| UI31-05 | conflict                        | “ร่างมีรุ่นใหม่กว่า กรุณาอ่านและตรวจทานก่อนบันทึก” ไม่ทับnewer payload                              |
| UI31-06 | file-pending / failed / allowed | “เอกสารอยู่ระหว่างตรวจ”/“เอกสารไม่ผ่านตรวจ”/สถานะอนุญาต ไม่เปิดprivatepreviewก่อนscan               |
| UI31-07 | returned                        | เหตุผล/หลักฐานเฉพาะfieldACL ลิงก์แก้headerเดิม แยกจากทะเบียนstatus                                  |
| UI31-08 | submitted / session-denied      | submittedเฉพาะreceiptcommit; 401กลับloginกลาง/403/hidden404ตามcontract ไม่คืนชื่อหรือreasonนอกgrant |

Step labels/fieldset/legend/inputlabel/วันพ.ศ.ที่ชัด ใช้Tab/ShiftTab/Enter/SpaceและThaiIMEได้ ไม่submitเพราะเปลี่ยนfocusหรือcomposition Enterผิดจังหวะ Errorsมีaria-describedby/status announcementตามappropriate semantics focusไปerrorsummaryเมื่อส่งไม่สำเร็จ การแจ้งsavingไม่แย่ง focusหรือประกาศทุกkeystroke Dialogไม่trapผิดและreturnfocus ปุ่มย้อนขั้นไม่ล้างtypeddataที่ยังมีสิทธิ์

ต้องตรวจ375/768/1024/1440จริง รวมlabels/longThai/errorstates/file status/contrast/focus ปัจจุบันไม่มีwizard/screenreader/browsertests ไม่อ้างresponsiveหรือaccessibilityผ่านจากตารางนี้ การตรวจหน้าdesktopอย่างเดียวไม่ปิดกรณีมือถือ

## 6 เกณฑ์และการส่งต่อ

draftresume/returnedcorrectionไม่ซ้ำ และเปลี่ยนtarget_idนอกscopeส่งไม่ได้: **BLOCKED / NOT RUN** ดูแผน P31-01–16ในREQUEST_SUBMISSION ยังไม่สร้างpages/serveractions/migration/seed/servicesจริง บท30และfoundation07/08/09/10/11/ทะเบียน19–22ขาด ต้องปิดก่อนimplementation31 ไม่เลื่อนไป32จากเอกสาร

core app/schema0.6.0 Prisma7.10.0 Next16.3.8 pnpm11.28.2 lock9 19models/213scalarfields/migration1เดิม ใช้request/evidence/form/workflow/notificationกลาง ไม่เพิ่มบัญชี/ทะเบียน/เอกสารอีกชุด ไม่มีproductionหรือข้อมูลจริงเปลี่ยน
