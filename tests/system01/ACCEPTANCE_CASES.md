# กรณีทดสอบระบบบุคคล — บท18

รุ่น0.1 | 4ตุลาคม2569 | **Test specification / BLOCKED — ไม่ใช่ executable tests และทุก UAT18-T เป็น NOT RUN**

ดูสถานะและcoverageใน [UAT_SYSTEM_01](../../docs/UAT_SYSTEM_01.md) ใช้ [people-plan.csv](../fixtures/system01/people-plan.csv) และ [coverage-plan.csv](../fixtures/system01/coverage-plan.csv) เป็นข้อมูลสมมติเตรียมทดสอบ ยังไม่มีloader/seedของ18 การตรวจCSVไม่พิสูจน์FK/constraint/API/runtime

## เงื่อนไขก่อนรัน

- ผ่าน13–17พร้อมfoundationจริง มีDBแยกdev/test บัญชีOIDCสมมติ verifiedPersonbinding, RoleAssignment และpolicyที่ควบคุมเวลาทดสอบได้
- โหลดfixtureผ่านentrypointที่ต้องเพิ่มภายหลัง โดยสร้างUUID deterministicจากrefในnamespaceทดสอบเดียวและบันทึกmapping ปฏิเสธชื่อDB/URLproductionตามguard06 ห้ามนำCSVเข้าproduction
- ใช้กฎ `DEMO_UAT_RULE_CAPACITY_1` และ `DEMO_UAT_RULE_CAPACITY_2` ที่แยกscope/seatgroupชัดเจน ไม่ถือเป็นกฎทางการ; แผนหลายหน้าที่ของPerson01เป็นscenarioไม่ใช่คำยืนยันว่าคนจริงถือหน้าที่ชุดนี้ได้
- มีบัญชี `DEMO_UAT_ACCOUNT_AREA_A`, `DEMO_UAT_ACCOUNT_AREA_B`, `DEMO_UAT_ACCOUNT_DIRECTORY`, `DEMO_UAT_ACCOUNT_MAKER`, `DEMO_UAT_ACCOUNT_CHECKER`, `DEMO_UAT_ACCOUNT_SELF` และserviceworkerที่ได้รับมอบหมายจริง ห้ามstubอนุมัติทุกaction
- ทุกcaseเริ่มจากฐานfixtureที่สร้างใหม่หรือชุดข้อมูลแยก มีclock/queue/IdP fault hooksที่ควบคุมได้ หลักฐานFileVersionใช้ไฟล์สมมติ scan/ACLผ่าน ไม่ใช้Documentmetadataแทน

## กรณีและขั้นตอน

| Case      | ตั้งค่าและทำรายการ                                                                                                                 | สิ่งที่ต้อง assert / หลักฐาน                                                                                                                     |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| UAT18-T01 | โหลดfixtureสองครั้งที่DBว่างผ่านloaderจริง queryแต่ละC01–C16ด้วยscopeที่อนุญาต                                                     | 12คู่ระดับ×หน้าที่และ4branchtrackingครบ ไม่มีPerson/assignment/audit/outboxใช้จริงซ้ำ officialtypeที่ไม่รู้ยังTO VERIFY                          |
| UAT18-T02 | ค้นPerson01ด้วยชื่อปัจจุบัน ชื่อเดิม และฉายาสมมติ; กรองหน่วย/แผนก/status/dateหลายค่า                                               | ได้PersonIDเดียวตามgrant filterแบบAND/paginationตรงสัญญา15 ชื่อhiddenไม่รั่วในcount/facet/empty/export                                           |
| UAT18-T03 | บันทึกหน้าที่ช่วง2025-01-01ถึง2026-10-04และแต่งตั้ง2026-11-01; query2025-06-01,2026-10-04,2026-11-01                               | วันสิ้นสุดไม่รวม plannedก่อนวันเริ่ม queryอนาคตได้พร้อมlabel และหลักฐานแต่งตั้งเดิมยังอยู่                                                       |
| UAT18-T04 | มีผลแก้ย้อนหลัง2025-06-01 บันทึก2026-10-04; queryeffective_dateเดียวกับknown_atก่อน/หลังrecorded_at                                | ได้revisionตามเวลารับรู้ ไม่ลบฉบับเดิม ไม่ใช้หลักฐานอนาคตในผลknown_atอดีต                                                                        |
| UAT18-T05 | Person01มีC01/C07/C13ตามruleDEMOที่อนุญาต ปิดเฉพาะC01                                                                              | Personเดียวสัมพันธ์หลายหน่วย/หน้าที่ C07/C13ไม่หาย ไม่มีRoleAssignmentเกิดจากตำแหน่งเอง                                                          |
| UAT18-T06 | สร้างช่วงติดกัน ช่วงoverlap และacting/appointed ภายใต้capacity1/2 รวมสองtransactionแข่ง                                            | adjacentผ่านตามกฎ overlapผ่าน/ไม่ผ่านตามrule ไม่เกินseat ไม่มีconstraintหนึ่งคนหนึ่งตำแหน่งครอบทุกกรณี                                           |
| UAT18-T07 | ย้ายPerson01A→B: draft→submit→review→returned→แก้revision→resubmit→approve→effective                                               | ก่อนeffectiveไม่มีทะเบียน/grantเปลี่ยน aftereffectปิดเฉพาะเป้าหมาย ถอนสิทธิ์ต้นทางที่สิ้นฐานตามแผน Bไม่มีgrantใหม่จนผ่านอนุมัติที่มีอำนาจ        |
| UAT18-T08 | ทำเส้นทางreturned/approve/effectiveแยกลาออกPOSITIONและEMPLOYMENT                                                                   | ปิดเป้าหมายที่ระบุเท่านั้น ไม่เปลี่ยนreligious/lifestatusหรือสังกัดอิสระ                                                                         |
| UAT18-T09 | แจ้งDEATH_NOTICEโดยreporterที่ได้รับมอบหมาย ผ่านreturned/approve/effective; ทำproviderล่ม                                          | subjectไม่ต้องloginเอง ก่อนeffectiveไม่suspendจากdraft หลังeffectDAL/session/API/jobdeny providerpendingเห็นได้ และhistory/ผลสอบไม่ถูกลบ         |
| UAT18-T10 | DISROBING_REQUESTผ่านreturned/approve/effective มีlaygrantที่มีฐานอำนาจแยก                                                         | ไม่เท่ากับdeath ไม่suspendบัญชีทั้งหมด laygrantยังใช้ได้ตามช่วง ไม่มีgrantใหม่เกิดเอง                                                            |
| UAT18-T11 | แต่ละ4ชนิดสร้างเรื่องแยกเพื่อrejected/cancelled; makerพยายามapprove และ reviewerใช้expectedversionเก่า                             | ไม่มีผลทะเบียนจากreject/cancel makerถูกdeny staleversionconflict ไม่มีaudit/outboxบอกสำเร็จ                                                      |
| UAT18-T12 | effectiveในอนาคต2026-10-05 ใช้2026-10-04T16:59:59.999Zและ17:00:00Z พร้อมบัญชีหมดช่วง                                               | ก่อนเที่ยงคืนไทยยังplanned หลังถึงวันต้องตรวจauthorityใหม่ UIปี2569 storedCE ไม่ยืมสิทธิ์หมดอายุ                                                 |
| UAT18-T13 | สร้างcorrectionผิดสถานะของแต่ละ4ชนิด อ้างorigin/event/fileและapprovedrevision; ขอคืนหนึ่งgrant                                     | เพิ่มrevision/correctiveeventตามคำอนุมัติ คืนเฉพาะgrantปัจจุบันที่ผ่าน ไม่rollbacksnapshot/session ไม่แก้audit และไม่คืนสิทธิ์หมดอายุ/ฐานหายเอง  |
| UAT18-T14 | replayevent/retrycorrection เปลี่ยนUUIDแต่businesskeyเดิม แข่งworker crashก่อน/หลังcommit/ก่อนack leaseหมด eventเก่าหลังcorrection | receipt/effects/history/audit/notificationไม่เพิ่มซ้ำตามkey tokenเก่าเขียนไม่ได้ staleeventไม่ย้อนทะเบียน currentversions/historyตรวจได้         |
| UAT18-T15 | AREA_Aอ่าน/แก้/ส่งออกPersonที่มีเฉพาะB โดยเปลี่ยนURL ID body query include cursor batch และrequesttracking/fileID                  | denyไม่เผยrow/fields/count/existence/evidence/scopeใหม่ ตอบตามสัญญาdenyเดียว ไม่มีorg_id clientให้สิทธิ์                                         |
| UAT18-T16 | DIRECTORY/publicร้องfieldsของPersonPrivate/เบอร์/ที่อยู่/reason/identity/evidenceและค้นhiddenชื่อเดิม                              | DTO/export/print/html/RSC/cache/staticไม่มีfieldsต้องห้าม ไม่มีmetadata/filekeys/ชื่อhiddenรั่ว ใส่canaryสมมติในฐานทดสอบแล้วค้นจริง              |
| UAT18-T17 | exportตามscope/fieldgrant แล้วwithdrawgrantก่อนjob/ก่อนdownload; เปลี่ยนID/key และลองสูตรCSVสมมติ                                  | job/downloaddenyตามcurrentpolicy exportallowlistเหมือนจอ textformulaไม่execute privategatewayตรวจทุกครั้ง ไม่อ้างsignedURLออกแล้วrevokeทันที     |
| UAT18-T18 | SELFไม่มีbindingส่งperson_idคนอื่น จากนั้นverifiedbindingและเสนอแก้ข้อมูล                                                          | ก่อนbindingไม่มีread_self ไม่autolinkชื่อ/email หลังbindingอ่านเฉพาะfields/actionตน เสนอแก้ไม่เขียนทะเบียนทันที                                  |
| UAT18-T19 | login→expire session/revoke/suspend/assignmentหมดอายุ แล้วเรียกAPI/ServerAction/DALและjobซ้ำ                                       | denyฝั่งserverทุกentrypoint cacheไม่คืนข้อมูลเก่า ไม่ใช้แค่เมนูหายเป็นหลักฐาน revoke                                                             |
| UAT18-T20 | ใช้evidencequarantine/ปลอมนามสกุล/fileACLต่างscope/scanไม่ผ่าน และไฟล์historyรุ่นเก่า                                              | ไม่ใช้submit/approve/effectiveหรือdownloadไฟล์ไม่ผ่าน; ไฟล์เก่าที่ผ่านACLยังตรงhash/referenceต้นทาง                                              |
| UAT18-T21 | adapterผู้รับเอกสาร/รายการค้างไม่พร้อม แล้วcorrection/transferมีimpactreport                                                       | UNKNOWNไม่ใช่0 requiredgapบล็อก ไม่rewriteหนังสือส่งแล้ว รายงาน/exportfieldpolicyปัจจุบัน ไม่claimครอบคลุมโมดูลที่ไม่สร้าง                       |
| UAT18-T22 | keyboard/ThaiIMEค้นหลายfilter reset/pagination/empty/error ทดสอบ375/768/1024/1440                                                  | labels/focus/aria/statusไม่ใช้สีอย่างเดียว emptyแนะนำลดfilters รายงานภาพและขั้นตอนของเว็บจริง                                                    |
| UAT18-T23 | เปรียบเทียบmanifestก่อน/หลังทุกflowและcorrection พร้อมknown_atค้นอดีต                                                              | originrequest/revision/decision/audit/appointmentFileVersion/hash/ผลสอบเดิมยังตรง ไม่มีdeleteหรือแก้auditต้นทาง จำนวนnotificationตามdedupeไม่ซ้ำ |
| UAT18-T24 | เพิ่มประเภทการศึกษาจากรายการที่เจ้าของรับรอง แล้วค้น/assign/fieldscope/exportตามruleที่มีรุ่น                                      | ทุกประเภทที่รับรองมีcase+evidence ไม่เดาจาก4branch; unverifieddenyตามpolicyไม่สร้างgrantเอง                                                      |

แต่ละcaseบันทึกexecution ID, source commit, rule/fixture/migration version, actor refs, effective_date/known_at, commandหรือขั้นUI, ผลactual, assert และหลักฐานprivateที่ACL/retentionผ่าน ไม่มีsecretหรือชื่อผู้ค้นเต็มในtestlogs ผลเชิงธุรกิจทั้งหมดNOT RUN ณ รุ่นนี้

## รูปแบบการพิสูจน์ประวัติไม่หาย

ก่อนและหลังเก็บmanifestของtarget UUID/revision/effective intervals/recorded_at/superseded_at/evidence version+hash/audit IDsและผลสอบที่มีจริงผ่านserviceที่มีสิทธิ์ ใช้diffของรายการอ้างอิงและqueryknown_atเพื่อพิสูจน์ว่าoriginยังอยู่และตรวจได้ จำนวนrowอย่างเดียวไม่พอ และไม่ส่งmanifestprivateไปpublic repo

## การรันที่มีอยู่แล้ว

`corepack pnpm test` รันtestsระดับstarter/corehelperที่rootเท่านั้น ไม่อ่านโฟลเดอร์นี้และไม่รันUAT18-T บันทึกผลจริงไว้ในUAT_SYSTEM_01 ไม่เพิ่มtestskipหรือmockAPIที่ตอบผ่านเพื่อแทนระบบบุคคล หลังdependencyผ่านต้องสร้างintegration/browser/fault-injection entrypointsจริงและอัปเดตเอกสารคำสั่งก่อนตรวจรับซ้ำ
