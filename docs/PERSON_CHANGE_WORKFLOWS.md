# คำขอย้าย ลาออก ลาสิกขา และแจ้งมรณภาพ/เสียชีวิต — แบบเตรียมบท 16

รุ่นเอกสาร 0.1 | 4 ตุลาคม 2569 | **Proposal / BLOCKED — ยังไม่มี PersonChangeRequest, ฟอร์ม หรือบริการคำขอบท16**

บท16ต้องผ่าน15และ11ก่อน ปัจจุบันทั้งสองเป็นแบบเตรียมและfoundation12ยังBLOCKED เอกสารนี้กำหนดสัญญาสำหรับพัฒนาต่อเมื่อdependencyผ่าน ไม่ใช่schema/migration/APIหรือผลตรวจรับ คำสั่งทางการ หลักฐานที่ต้องใช้และผู้มีอำนาจยัง TO VERIFY

## 1 แนวคิดทีละขั้น

1. คำขอเป็นสิ่งที่เสนอให้ตรวจ ไม่ใช่ทะเบียนที่มีผลจริง การกดส่งบันทึกคำขอ/หลักฐาน/ประวัติตรวจ แต่ยังไม่ย้ายสังกัดหรือเปลี่ยนสถานะPerson
2. ชนิดเรื่องกับสถานะการตรวจเป็นคนละข้อมูล เช่น ชนิดขอย้ายมีสถานะsubmittedหรือreturnedได้ ส่วนสถานะPerson/สังกัด/หน้าที่มาจากเหตุการณ์ที่ตรวจและบันทึกผลแล้ว
3. ลาออกจากหน้าที่หรือการจ้างงานไม่เท่ากับลาสิกขา และลาสิกขาไม่เท่ากับเสียชีวิต ต้องระบุสิ่งที่เปลี่ยนชัดเจน ไม่ใช้enumเดียวแทนทุกความหมาย
4. ใครรู้trackingURLหรือrequestIDยังไม่ได้สิทธิ์เห็นเรื่อง ต้องตรวจบัญชี/scope/fieldgrant/ACLปัจจุบันทุกครั้ง

## 2 ชนิดเรื่องและผลต่อทะเบียน — ไม่ปนenum

รหัสด้านล่างเป็นชื่อภายในที่เสนอ ไม่ใช่รหัสทางการ ผลเกิดเฉพาะหลังตรวจครบ/approved/ถึงวันมีผลและmoduleinvariantsผ่านเท่านั้น

| request_typeเสนอ    | ข้อมูลเฉพาะประเภท                                                                                               | ผลที่ต้องจำกัดขอบเขต                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| TRANSFER_REQUEST    | affiliation/assignmentที่ขอย้าย, source/targetorganization, relation/positiontype, วันเสนอมีผล, เหตุผล/หลักฐาน  | ปิดและเพิ่มhistoryเฉพาะความสัมพันธ์หรือหน้าที่ที่อนุมัติ ไม่ย้ายทุกสังกัดของPersonโดยปริยาย               |
| RESIGNATION_REQUEST | resignation_target_kindแยกPOSITIONหรือEMPLOYMENT, targetrelationship/assignmentIDs, วันเสนอมีผล, เหตุผล/หลักฐาน | ยุติหน้าที่หรือความสัมพันธ์จ้างงานที่ระบุ ไม่เปลี่ยนสถานะบรรพชิต/คฤหัสถ์หรือชีวิตโดยอัตโนมัติ             |
| DISROBING_REQUEST   | Person, วันที่ผู้ร้องแจ้ง/เสนอ, หลักฐาน/เหตุผล, สถานะที่รับรองแล้ว                                              | บันทึกreligiousstatushistoryตามหลักฐาน ไม่บันทึกว่าเสียชีวิต หน้าที่ที่ต้องยุติต้องระบุตามpolicyที่ยืนยัน |
| DEATH_NOTICE        | Person, วันที่ตามข้อเท็จจริงที่แจ้ง, reporter/accountที่มีอำนาจ, หลักฐาน/เหตุผล                                 | บันทึกlife/statuseventที่ตรวจยืนยันแล้ว ไม่เปลี่ยนreligiousstatusเป็นคฤหัสถ์แทนการเสียชีวิต               |

ให้แยกอย่างน้อยrequest_type, workflow_status, affiliationhistory, positionassignmentlifecycle, religiousstatus และlife/statuseventเป็นคนละแนวคิด ไม่เอาapproved/returnedไปอยู่ในPerson.current_state และไม่เอาresigned/disrobed/deceasedเป็นค่าเดียวที่ใช้กับทุกเป้าหมาย

ความสัมพันธ์EMPLOYMENTต้องอ้างชนิดสังกัด/การจ้างที่เจ้าของรับรองในทะเบียนกลาง ไม่สร้างระบบบุคคลหรือการจ้างอีกชุดเพียงเพื่อให้ฟอร์มครบ ผู้ร้องแจ้งเสียชีวิตอาจเป็นเจ้าหน้าที่/ผู้แทนที่ได้รับอำนาจตามpolicy ไม่กำหนดให้Personผู้ถูกแจ้งต้องloginหรืออนุมัติเอง

คำว่าapprovedรับรองการตรวจ/อำนาจบันทึกตามworkflow ไม่อ้างว่าซอฟต์แวร์ทำให้ข้อเท็จจริงการลาสิกขาหรือเสียชีวิตเกิดขึ้น วันที่ข้อเท็จจริง วันที่เสนอมีผล วันที่ที่ผู้ตรวจรับรอง และrecorded_atต้องแยกกันเมื่อจำเป็น ห้ามเดาวันที่/หลักฐานเพื่อผ่านvalidation

## 3 PersonChangeRequestและrevisionที่เสนอ

ใช้PersonChangeRequestเป็นส่วนขยายคำขอกลางตามlogicaldictionary04 ผูกchange_request_idแบบหนึ่งต่อหนึ่ง; คำขอกลางเชื่อมWorkflowInstanceเดียวจาก11 ไม่สร้างworkflowengineหรือทะเบียนคำขออิสระอีกชุด Stateในหน้าจออ่านจากworkflowที่เป็นต้นทาง ไม่ทำenumสถานะสองชุดที่เปลี่ยนแยกกัน

| ส่วนข้อมูล        | สัญญาที่ต้องมีเมื่อimplement                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| ตัวคำขอ           | UUID, centralrequestFK, PersonFK, request_type, requesteraccountFK, ruleversion, row_version, review_cycle, correlation        |
| payloadตามชนิด    | validatedfieldsแยกTRANSFER/RESIGNATION/DISROBING/DEATH ไม่รับunknownkeysหรือรวมrawPerson/secretไว้ในJSON                       |
| วันเวลา           | requested_effective_dateและวันที่ข้อเท็จจริงที่จำเป็น เป็นdateมาตรฐาน; recorded_atเป็นinstant; UIพ.ศ./AsiaBangkok              |
| เป้าหมาย/snapshot | relationship/assignmentIDsและexpectedversionsที่มีสิทธิ์ พร้อมsnapshotก่อนเปลี่ยนและผลที่เสนอ                                  |
| เหตุผล/หลักฐาน    | reasonแบบจำกัดpurpose/ความยาว, evidenceFileVersion/hash, linkedresourcetype/owner, completenessตามกฎรุ่นที่ยืนยัน              |
| revision/receipt  | submittedpayload/evidence immutableตามreviewcycle; returnedแก้เป็นรุ่นใหม่; commandkeyและpayloadfingerprint/receiptสำหรับretry |
| ผลมีจริง          | effectivecommandreceipt/eventreferences/เวลาและruleversionที่ใช้ ไม่ถือapprovaldecisionเป็นactivationreceipt                   |

Person/Organization/PositionAssignment/AffiliationHistoryใช้ทะเบียนกลางเดิม requesterPersonกับsubjectPersonอาจต่างกันได้เมื่อpolicyผู้แทน/เจ้าหน้าที่อนุญาต ห้ามเชื่อrequester_id/person_id/org_id/roleจากclientเป็นสิทธิ์ ต้องresolveจากsession/bindingและทรัพยากรที่ตรวจได้ฝั่งserver

reasonและevidenceเป็นprivateโดยdefault การมีownerหรือis_public_eligibleไม่ได้ให้สิทธิ์เผยแพร่ หลักฐานต้องเป็นFileVersionที่scan/ACLผ่าน10 Documentmetadatacore06ไม่เพียงพอ การuploadretryไม่สร้างเอกสารใช้จริงซ้ำและไฟล์quarantineไม่ใช้submit/approve/effectiveตามpolicy

## 4 เส้นทางตรวจแบบมีรุ่น

| ขั้น                 | ผู้กระทำ/เงื่อนไข                                                                          | สิ่งที่เปลี่ยนได้                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| draft                | ผู้ร้องที่มีaction/scopeตรวจข้อมูลตนหรือเรื่องที่รับมอบหมาย                                | payload/attachmentsของdraftตามfieldgrant ไม่มีผลทะเบียน                                   |
| submitted            | completenessและbinding/scope/fileACLผ่าน; pinpayload/หลักฐาน/ruleversion                   | คำขอ/workflow/audit/outboxเท่านั้น                                                        |
| reviewing            | ผู้ตรวจที่มีอำนาจตามกฎและไม่ใช่ผู้สร้าง                                                    | decision/ผลตรวจไม่เปลี่ยนทะเบียนก่อนeffective                                             |
| returned             | ผู้ตรวจคืนพร้อมเหตุผลที่ผู้ร้องได้รับสิทธิ์เห็น                                            | เปิดแก้payloadในรุ่นใหม่ เก็บรุ่นเดิม; resubmitเพิ่มreview_cycle/row_versionและตรวจใหม่   |
| approved             | ขั้นตรวจครบและmakerchecker/versions/authorityผ่าน                                          | อนุมัติผลที่เสนอตามsnapshot วันอนาคตยังไม่active                                          |
| effective            | ถึงวันมีผลหรือรับรองการบันทึกย้อนหลังตามpolicy; ตรวจmodule/rights/evidenceปัจจุบันอีกครั้ง | transactionเปลี่ยนเฉพาะทะเบียน/history/สิทธิ์ที่ได้รับการรับรอง พร้อมaudit/outbox/receipt |
| rejected / cancelled | ผู้มีอำนาจตามconfigurationและเหตุผลที่อนุญาต                                               | จบรอบคำขอ ไม่เปลี่ยนทะเบียน ไม่ลบประวัติ/หลักฐาน                                          |

ลำดับผู้ตรวจ จำนวนขั้น เอกสารบังคับ อำนาจของพื้นที่ต้นทาง/ปลายทาง และการแจ้งแทนยังQ005/Q006/Q024 ไม่กำหนดจากการเดาตำแหน่งหรือมีชื่อผู้ลงนาม ใช้กฎDEMOที่ระบุชัดได้หลังfoundationพร้อม แต่ไม่รับรองงานทางการของTO_VERIFY

ผู้สร้างห้ามอนุมัติเรื่องตนแม้มีหลายroleหรือเป็นtechadmin แก้payload/evidence/วันเสนอมีผลหลังsubmittedต้องผ่านreturnedหรือrevisionprocessที่configurationรับรอง ไม่ยืมdecisionรอบเก่าอนุมัติรุ่นใหม่ และไม่ให้clientกำหนดผู้มีอำนาจ/approved/effectiveเอง

## 5 Transactionและผลของคำขอย้าย

submit/resubmitมีtransactionรวมrequestrevision/workflow/audit/outbox; **ไม่UPDATE Personstate, affiliation, positionหรือRoleAssignment** การapprovedล่วงหน้าก็ยังไม่เปลี่ยนทะเบียนactiveของวันนี้ก่อนวันมีผล

เมื่อeffective ต้องอ่านexpectedversionsของPerson/relationship/assignment/กฎและevidenceที่อ้าง ตรวจscopeต้นทาง/ปลายทางและfieldgrantของผู้ทำงานปัจจุบัน modulepeopleตรวจช่วง/seatcapacityจาก14 ถ้ารุ่นเปลี่ยนคืนconflictหรือพักapprovedตามpolicy ไม่แก้ผลเงียบ ๆ และไม่ทำให้effectiveสำเร็จเมื่อinvariantsไม่ผ่าน

ผลย้ายที่ยืนยันแล้วเสนอให้supersede/เพิ่มhistoryความสัมพันธ์ที่เลือก ปิดหน้าที่เก่าและเพิ่มหน้าที่ใหม่เฉพาะที่คำขออนุมัติ ส่วนสังกัดหรือหน้าที่อื่นยังคงข้อมูลตามจริง เก็บappointment/termination/correctionFileVersionเดิมและวันบันทึกที่ใหม่ ไม่เปลี่ยนsnapshotปีเก่าตามmasterใหม่

Websitegrantแยกจากตำแหน่ง การย้ายไม่สร้างสิทธิ์พื้นที่ใหม่จากชื่อหน้าที่เอง หากฐานอำนาจของgrantพื้นที่เก่าสิ้นสุด ต้องมีgrantchange/revocationที่ได้รับการรับรองในผลtransactionหรือกลไกตรวจdelegationปัจจุบันที่พิสูจน์ได้ ไม่คงสิทธิ์เก่าโดยไม่มีอำนาจ และไม่ถอนgrantอื่นที่ยังมีมอบหมายถูกต้องโดยเหมารวมทั้งบัญชี

death/disrobing/resignationต้องมีimpactplanที่เจ้าของรับรองต่อหน้าที่ สังกัด account/grantsและภาระที่เกี่ยวข้อง ไม่ยุติทุกอย่างจากenumเดียว การระงับบัญชีหรือถอนสิทธิ์ตามข้อเท็จจริงที่รับรองเป็นaccountlifecycleส่วนกลาง ไม่ลบPersonหรือผล/เอกสารย้อนหลัง

ทั้งหมดต้องใช้transaction/idempotency/uniqueconstraintsกับhistory/audit/outbox/activationreceipt เมื่อretryใช้request/revision/commandkeyเดิมไม่เพิ่มผลมีจริงหรือnotificationซ้ำ Workerตรวจinitiatorหรือauthorityที่ได้รับมอบหมายปัจจุบันตาม11 ไม่ใช้servicecredentialแทนอำนาจ หากหมดสิทธิ์ให้พักพร้อมรหัสสาเหตุ ไม่ทำผลธุรกิจหรือส่งข้อความสำเร็จเงียบ ๆ

## 6 ฟอร์มและการตรวจความครบถ้วน — ยังไม่มีHTML

ฟอร์มเลือกชนิดเรื่องก่อนแสดงช่องที่เกี่ยวข้อง แสดงPerson/เป้าหมายที่serverอนุญาต ระบุวันที่ตามความหมาย ไม่ให้ย้ายทุกสังกัดด้วยdropdownเดียว Reasonมีpurposehint/ความยาวจำกัด ไม่ขอเลขระบุตัวตน/เบอร์/ที่อยู่เต็มชุดเพิ่มโดยไม่จำเป็น

แยกสองส่วนในหน้ารายละเอียด: “ข้อมูลปัจจุบันที่มีผล” จากpeople/historyquery และ “คำขอที่กำลังตรวจ” จากworkflow/revision โดยวันที่มีผลอนาคตหรือคำขอreturnedต้องไม่ปรากฏเป็นสังกัดใหม่active แสดงวันบันทึก/วันเสนอมีผล/วันรับรองและข้อความสถานะที่ไม่ใช้สีอย่างเดียว

ก่อนส่งมีsummarychecklist: ชนิดและเป้าหมายถูกต้อง, วันที่ตามpolicy, เหตุผลครบ, หลักฐานชนิด/ขนาด/scan/ACLผ่าน, รุ่นข้อมูลยังตรง และยืนยันผลที่เสนอ ผู้ร้องแก้returnedได้เฉพาะช่องที่มีgrantพร้อมresubmit ไม่แก้decisionผู้ตรวจหรือไฟล์หลักฐานรุ่นเดิมทับ

Uploadแสดงquarantine/scanning/ready/rejectedอย่างชัดเจน ไม่ให้preview/downloadหรือใช้อ้างอนุมัติก่อนผ่าน ตรวจfileACLใหม่ทุกขั้น Returnedfeedback/evidenceของผู้ตรวจที่ไม่ให้ผู้ร้องอ่านต้องแสดงคำแนะนำที่ปกปิดข้อมูลแทนส่งrawreviewnote

keyboard/labels/errorlinkedinputs/focus/สถานะส่งและretryต้องตรวจหน้าจอจริงเมื่อimplement ไม่มีform/UIหรือbrowsertestในรอบนี้

## 7 Trackingและการป้องกันเหตุผล/หลักฐาน

เส้นทางเสนอ `/app/people/change-requests/[requestId]` อยู่หลังauth/DAL; หากมีทางเข้า `/requests/track` ตามBLUEPRINT ต้องไม่เปิดเรื่องprivateจากเลขอ้างอิงอย่างเดียว โดยdefaultแสดงเพียงคำแนะนำเข้าสู่ระบบ/ตรวจสิทธิ์ก่อนค้นเรื่อง ไม่มีanonymousDTOของลาออกหรือเสียชีวิตที่รับรองแล้วในบทนี้

| ผู้เข้าถึง                                      | ข้อมูลที่ให้ได้หลังpolicyยืนยัน                                 | ข้อมูลที่ปิดdefault                                                                                                     |
| ----------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| ผู้ร้อง                                         | เรื่องของตนตามpurpose/fieldgrant, revision/สถานะ/สิ่งที่ต้องแก้ | ข้อมูลบุคคลที่สาม/เหตุผลภายในผู้ตรวจ/เอกสารนอกACL                                                                       |
| subjectPersonที่bindingผ่าน                     | เฉพาะเรื่องที่policyให้read_self ไม่ให้จากPersonIDในclient      | เรื่องหรือfileที่ไม่มีaction/fieldgrant                                                                                 |
| ผู้ตรวจ/อนุมัติ                                 | เรื่องในscope/time/authorityพร้อมฟิลด์ที่หน้าที่ต้องใช้         | ไม่มีสิทธิ์อื่นจากตำแหน่ง/techadminเอง                                                                                  |
| ผู้ไม่มีresourcegrant / public / directory-only | ไม่มีข้อมูลเรื่องprivate                                        | เหตุผล ชนิดคำขอที่เผยข้อมูลอ่อนไหว สถานะ ชื่อ subject/reporter filecount/filename/id/hash/objectkey/preview/downloadURL |

requestID/URLยากเดา/PersonIDหรือpublicdirectoryentryไม่เป็นสิทธิ์ Trackingใช้responseไม่เผยว่ามีเรื่องซ่อนอยู่ตามerrorpolicyกลาง ไม่redirectไปไฟล์หรือใส่เหตุผลใน404/title/meta/OpenGraph/HTML/RSC/search/export/cache แม้clientแก้URL/body/query/fields/include/relationsเอง

หน้าและAPIprivateใช้no-store ไม่ใส่ข้อมูลในstaticassets/publicfolder count/facets/autocompleteก็ต้องกรองสิทธิ์ Notifications/outboxpayloadมีเพียงresourceeventขั้นต่ำ ไม่มีreason/evidenceหรือข้อความแจ้งเสียชีวิตต่อผู้หมดสิทธิ์ ก่อนเปิดลิงก์/read/download/export/jobต้องตรวจaccount/grants/ACLปัจจุบันอีกครั้ง

ไฟล์ที่ต้องrevokeทันทีใช้gatewayของdocuments10 ไม่อ้างว่าsignedURLที่ออกแล้วเพิกถอนได้ทันที Auditเก็บactor/resource/action/version/correlation/outcomeตาม11/15 ไม่logreason/rawชื่อ/querystring/body/token/filecontent รายละเอียดเหตุผลและหลักฐานอยู่resourceprivateที่มีpolicy ไม่copyลงauditเพื่อหลบfieldgrant

## 8 แผนตรวจรับ — ทุกกรณี NOT RUN

| รหัส   | การจำลอง                                                                     | ผลที่ต้องได้เมื่อimplementแล้ว                                                                     |
| ------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| P16-01 | สร้าง/submitขอย้ายแล้วอ่านทะเบียนและgrantsก่อนอนุมัติ                        | affiliation/position/Personstate/scopeเดิม ไม่มีgrantต้นทาง/ปลายทางเปลี่ยนจากpending               |
| P16-02 | approvedวันอนาคต และeffectiveถึงเวลา                                         | ก่อนวันยังactiveเดิม; ถึงวันมีผลเปลี่ยนเฉพาะเป้าหมายที่รับรองพร้อมhistory/audit/outbox             |
| P16-03 | ลาออกPOSITIONหรือEMPLOYMENT / ลาสิกขา / แจ้งเสียชีวิตแยกกัน                  | ไม่เปลี่ยนสถานะทุกด้านจากenumเดียว แต่ละimpactตามruleที่รับรอง                                     |
| P16-04 | ไม่มีgrant/มีเพียงdirectory-onlyแก้trackingURL/PersonID/query/include/export | ไม่ได้reason/requesttype/status/subject/filemetadata/preview/download และไม่รู้ว่ามีเรื่องซ่อนอยู่ |
| P16-05 | รู้objectkey/fileID/URLหรือสิทธิ์ถอนแล้วเรียกfile/job/APIซ้ำ                 | denyล่าสุด ไม่มีpublic/static/cacheleak; signedURLออกแล้วไม่ถูกอ้างว่าrevokeทันที                  |
| P16-06 | ผู้ร้องreturnedแก้date/payload/evidenceแล้วresubmit                          | revision/cycleใหม่ เก็บรุ่นเก่าไม่reuseapprovalเดิม ทะเบียนยังไม่เปลี่ยน                           |
| P16-07 | creatorapproveตนเอง/ข้อมูลเปลี่ยน/หลักฐานยังquarantine/อำนาจTO_VERIFY        | deny/conflict ไม่มีผลทะเบียน/auditสำเร็จจากคำสั่งที่แพ้                                            |
| P16-08 | effectiveย้ายแล้วgrantเดิมหมดฐานอำนาจ/ผู้ริเริ่มถูกถอนก่อนjob                | ไม่คงสิทธิ์เก่าโดยไร้อำนาจ ไม่ให้สิทธิ์ใหม่อัตโนมัติ jobตรวจปัจจุบันก่อนทำผล                       |
| P16-09 | retry/workerล่มก่อน-หลังcommitผลคำขอ                                         | receipt/history/audit/outbox/notificationไม่ซ้ำตามdedupe ไม่สูญเสียevent                           |
| P16-10 | readอดีตก่อนย้าย/ลาออก/แก้ย้อนหลังและknown_at                                | พบrevision/หน้าที่/เอกสารเดิมตาม14 ไม่ลบPersonหรือsnapshotปีเก่า                                   |
| P16-11 | ตรวจrequestform/currentvsrequest/keyboard/returned/scanstatusและlogs         | สถานะคำขอไม่เป็นทะเบียนactive ฟอร์มใช้งานได้ ไม่logreason/PII/secret                               |

## 9 Gateและหลักฐานที่ต้องรับรอง

sourceที่ตรวจคือf9b59d5 ไม่มีPersonChangeRequest/WorkflowInstance/services/form/account/DAL/FileVersionหรือoutboxจริง core0.6.0/Prisma7.10.0ยังmigration1 Q027/DB-06ยังเปิด และfoundation12/13/14/15กับ11ยังไม่ผ่าน

Q001/Q002ต้องประเภท/สังกัด/สาย, Q005/Q006ต้องผู้แทน/ผู้ตรวจ/อำนาจและเส้นทางแต่ละเรื่อง, Q024ต้องpayload/ผลกระทบ/ช่วงย้อนหลัง/จำนวนที่นั่งและsemanticsวันที่, Q008/Q023/Q025ต้องidentitybinding/fieldallowlist/evidence/purpose/log/retention ไม่เดาคำสั่งทางการ เอกสารบังคับหรือกฎหมาย

ปิดdependencyตาม [DATABASE](DATABASE.md) และ [FOUNDATION_ACCEPTANCE](FOUNDATION_ACCEPTANCE.md) ก่อนเพิ่มschema/migration/seed/forms16 โดยมีแผนและการอนุมัติตามMASTERข้อ2 ใช้ข้อมูลDEMOและengineกลางเดิมเมื่อพร้อม ไม่เลื่อนไปบท17จากผลตรวจเอกสาร
