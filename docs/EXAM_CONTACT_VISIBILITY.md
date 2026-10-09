# การมอบหมายสนาม ผู้รับข้อสอบ และรายงานจัดส่ง — แบบเตรียมบท22

รุ่นเอกสาร0.1 | 4ตุลาคม2569 | sourceก่อนแก้ `30db964` | **Proposal / BLOCKED — ยังไม่มี ExamCenterAppointment, dispatch snapshots หรือบริการรายงานจริง**

บท22ต้องผ่าน21ก่อน [EXAM_SESSIONS](EXAM_SESSIONS.md) ยังเป็นแบบเตรียม และfoundation12/บุคคล18ยังBLOCKED เอกสารนี้กำหนดสัญญาพัฒนาต่อ ไม่ใช่schema/migration/รายงานหรือผลตรวจรับ จำนวนผู้ดำรงหน้าที่ อำนาจแต่งตั้ง ช่องทางปฏิบัติงาน และหลักฐานที่ต้องใช้ยัง **TO VERIFY** เมื่อไม่มีแหล่งรับรอง

## 1 แนวคิดทีละขั้น

1. ใช้Personเดิมอ้างหน้าที่ในสนามรายรอบ ไม่สร้างทะเบียนชื่อ/เบอร์ผู้รับข้อสอบอีกชุด คนหนึ่งอาจมีหลายหน้าที่เมื่อกฎรับรอง
2. ผูกการมอบหมายกับCenterSession จึงรู้ปีการศึกษา ประเภทและรอบจากExamSession ไม่หาผู้รับโดยใช้ชื่อสนามกับปีปัจจุบันอย่างเดียว
3. snapshotตอนแต่งตั้งกับsnapshotณวันจัดส่งมีคนละจุดประสงค์ เบอร์ที่เปลี่ยนภายหลังไม่เขียนทับรายงานจัดส่งที่ยืนยันแล้ว
4. สิทธิ์ดูหน้าที่ไม่เท่ากับสิทธิ์ดูเบอร์ส่วนตัว/ที่อยู่/เอกสาร และการเป็นผู้รับข้อสอบไม่ให้สิทธิ์อ่านเนื้อหาข้อสอบโดยอัตโนมัติ
5. เมื่อบุคคลพ้นหน้าที่หรือเสียชีวิต ให้ตรวจผลมีจริงและแจ้งสนามดำเนินการแต่งตั้งใหม่ ไม่เลือกผู้ประสานงานหรือบุคคลคนอื่นมารับแทนเอง

ใช้Person/Organization/บัญชี/เอกสาร/workflow/audit/outboxกลางร่วม9ระบบ อ้าง [DATA_DICTIONARY](DATA_DICTIONARY.md), [DATA_CLASSIFICATION](DATA_CLASSIFICATION.md), [PERSON_VISIBILITY](PERSON_VISIBILITY.md), [ADDRESS_VALIDATION](ADDRESS_VALIDATION.md), [PERSON_CHANGE_RECOVERY](PERSON_CHANGE_RECOVERY.md) และ [WORKFLOW_ENGINE](WORKFLOW_ENGINE.md)

## 2 สิ่งที่มีจริงและสัญญาAppointmentที่เสนอ

core06มีPerson/PersonNameHistory/PersonContact/Organization/NameHistory/AddressVersion/OrganizationContact/AcademicYearเท่านั้น ไม่มีCenterSession/Appointment/RoleAssignment/session/scanACL/รายงานที่ทำงานจริง โมดูลorganizationsยังREADME-only แบบ04มีexam_center_appointmentเป็นlogicalcontractไม่ใช่Prisma model

| ข้อมูลเสนอ          | ข้อบังคับเมื่อimplement                                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| ตัวตน/รุ่น          | UUIDของappointment revision, logicalassignmentref/replaceschain, expectedversion, actor/correlationและruleversion                                  |
| center_session_id   | FKCenterSession21 ที่ตรวจสนาม/รอบ/typeได้ ปีการศึกษาderiveผ่านExamSessionFK ถ้าเก็บyear/sessionซ้ำต้องcompositeFKไม่ให้ต่างรอบ                     |
| person_id           | FKPersonกลาง ผู้ได้รับแต่งตั้งอาจไม่มีบัญชี ไม่สร้างloginหรือPersonใหม่เพื่อให้เพิ่มappointmentได้                                                 |
| duty_code           | configurationมีรุ่นและแหล่งรับรอง แยกประธานสนามสอบ/ผู้รับข้อสอบ/ผู้ประสานงานจากPositionTypeและRoleเว็บ                                             |
| timeline            | effective_from/to dateช่วง`[start,end)`; recorded_at/superseded_at timestamptz; replaces_idและevidenceต้นทางคงอยู่                                 |
| หลักฐาน             | approvedrequest/decisionจากworkflowกลาง และFileVersionเอกสารแต่งตั้งที่scan/owner/ACLผ่าน ไม่มีDocumentmetadata06แทนscan                           |
| แหล่งบุคคล/หน่วยงาน | person_name_history_id/affiliation_history_id/organization_name_history_idที่ตรงPerson/Organizationและวัน/เวลาที่ใช้                               |
| ที่อยู่/ช่องทาง     | verifiedAddressVersionของpurposeจัดส่งตาม20 และtypedPersonContact/OrganizationContactrevisionที่อนุญาตตามงาน ไม่รับrawowner IDsจากclientเป็นสิทธิ์ |

refsหน้าที่ที่เสนอในdev: `DEMO_EXAM_DUTY_CHAIR`, `DEMO_EXAM_DUTY_RECIPIENT`, `DEMO_EXAM_DUTY_COORDINATOR` เป็นรหัสทดลองในเอกสาร **ยังไม่ได้seed** ไม่อ้างเป็นรหัสทางการ

ใช้UUID/FKRestrict/snake_case/RLSdeny by defaultผ่านmigrationตามADRหลังdependencyผ่าน ตรวจnonoverlapต่อ(center_session,person,duty)ตามแบบ04 แต่กฎจำนวนคนต่อหน้าที่/หลายที่นั่ง/ประธานกับผู้รับเป็นคนเดียวได้หรือไม่ต้องรับรองแยก Constraintนี้อย่างเดียวไม่บังคับจำนวนประธานหนึ่งคน และห้ามใช้onepersononedutyทั่วระบบโดยเดากฎ

Appointmentไม่ได้สร้างRoleAssignmentเอง ผู้ตรวจรับและผู้อนุมัติแต่งตั้งต้องมีaccount/action/scope/ช่วงมอบหมายปัจจุบันพร้อมmakerchecker แม้subjectไม่มีบัญชี และผู้ดูแลเทคนิคไม่ได้อำนาจธุรกิจอัตโนมัติ

## 3 แยกข้อมูลปฏิบัติงานกับข้อมูลที่ยืนยันจัดส่งแล้ว

| มุมข้อมูล              | แหล่ง/เวลา                                                                                     | การเปลี่ยนภายหลัง                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| ประวัติแต่งตั้ง        | revision/หลักฐาน/name/affiliationตามวันมีผลและknown_atของการแต่งตั้ง                           | เพิ่มrevisionเมื่อแก้ผิด ไม่แก้ฉบับ/auditเดิม                               |
| รายงานเตรียมจัดส่ง     | ผู้รับที่มีหน้าที่ ณ วันที่เสนอใช้ พร้อมช่องทาง/ที่อยู่ล่าสุดที่ตรวจได้ตามpurpose              | โหลดใหม่/ตรวจversionก่อนใช้ แสดงPREPAREDไม่ใช่หลักฐานว่าส่งแล้ว             |
| snapshotณวันจัดส่ง     | ตัวตนผู้รับ/หน้าที่/ช่องทาง/ที่อยู่ที่ยืนยันและใช้จริง พร้อมวันมีผล/วันบันทึก/operationreceipt | immutableหลังยืนยัน ไม่joinเบอร์/ชื่อ/ที่อยู่ใหม่แทนค่าที่ตรึงไว้           |
| คำขอแก้snapshot/รายงาน | อ้างต้นทาง+เหตุผล/หลักฐานและผลที่ขอแก้                                                         | เพิ่มamendment/revision ไม่ทำให้ต้นฉบับหายหรือรายงานเก่ากลายเป็นค่าปัจจุบัน |

logical04มีname/organization/addresssnapshotบางช่องในAppointment แต่ยังไม่มีcontactrevision/phonesnapshotและdispatchbinding ดังนั้นไม่อ้างว่าสัญญาเดิมปิดเกณฑ์เบอร์ปีเก่าได้ครบ ต้องเพิ่มdispatchsnapshotcontractอย่างชัดเจนโดยไม่เอาsnapshotตอนแต่งตั้งไปแทนข้อมูล ณ วันจัดส่ง

### DispatchRecipientSnapshotที่เสนอ — ไม่ใช่ระบบส่งพัสดุเต็มชุด

minimalbindingต้องอ้างoperation/รายการจัดส่งที่มีตัวตนและownerถูกต้อง เมื่อโมดูลเจ้าของสร้างจริง ไม่รับเลขส่งหรือUUIDที่ฐานไม่ตรวจว่าเป็นรายการของสนามนี้ บท22ไม่ได้สร้างcarrierAPI/เลขพัสดุ/การส่งข้อสอบจริง/การเบิกคลังหรือหนังสือสารบรรณทั้งระบบ

| ส่วนsnapshotเสนอ | ข้อมูลที่จำเป็น                                                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| binding          | dispatch_operation_ref+recipient_slot, CenterSessionFK, AppointmentrevisionFK, request/decision/receiptrefs; unique(operation,slot) และpayloadfingerprintสำหรับretry |
| วันเวลา          | actualdispatchreference/เวลาที่มีหลักฐาน, snapshotcaptured_at, recorded_at และsource_effective_date/source_recorded_at; dateไทย/instantมาตรฐาน แสดงพ.ศ.ที่UI         |
| ผู้รับ           | PersonFK/namehistory/affiliationhistory/dutyrevision และdisplaynameที่ใช้จริง ไม่copyทั้งPersonPrivate                                                               |
| ช่องทาง          | purpose WORK/PERSONAL, sourcecontacttypedrevision, ค่าและสถานะตรวจที่ยืนยันใช้ในงานนี้, verified_at/methodตามgrantและpolicy                                          |
| ที่อยู่          | mailingAddressVersion/namehistory/hostrelation/Geo sourceที่จำเป็นตาม20 พร้อมข้อความปลายทางที่ใช้จริง ไม่joinที่อยู่ปัจจุบันเมื่ออ่านรายงานปีเก่า                    |
| หลักฐานรายงาน    | reportrevision/templateversion/ruleversion, hashและFileVersionของรายงานprivateเมื่อสร้าง, resourceowner/evidencebindingสำหรับACL                                     |

เวลาที่สร้างรายงานหรือกดprintไม่ใช่หลักฐานactualdispatch หากยังไม่มีรายการ/หลักฐานว่าส่งจริง ให้คงPREPARED/NEEDS_CONFIRMATIONและไม่เดาวันส่ง การยืนยันsnapshotต้องตรวจcurrentauthority/appointmentstatus/versions/contact/addressverificationอีกครั้งในtransactionพร้อมreceipt/audit/outbox ถ้ามีส่วนผิดrollbackทั้งหมด

เมื่อส่งไปแล้วพบข้อมูลผิด ให้ทำamendment/correctionอ้างต้นฉบับและผลที่เกิดจริง ไม่ใช้updatephoneของPersonไปแก้snapshot ยืนยันซ้ำkeyเดิมpayloadเดิมหลังตรวจสิทธิ์คืนreceiptเดิม keyเดิมpayloadต่างกันconflict ไม่เพิ่มsnapshot/artifact/audit/outboxของผลเดิมซ้ำ

## 4 ช่องทาง/ที่อยู่เพื่อปฏิบัติงาน

เลือกช่องทางWORKที่ผ่านหลักฐานและfieldgrantของOrganization/ผู้รับตามpurposeก่อน ไม่มีWORKที่ตรวจได้ให้NEEDS_CONFIRMATION ไม่fallbackเบอร์ส่วนตัวจากPersonPrivate/PersonContactโดยอัตโนมัติ

ช่องทางPERSONALอาจใช้ในงานภายในเฉพาะเมื่อpolicy/purposeและrestrictedfieldgrantที่รับรองอนุญาตจริง ไม่เปิดสาธารณะหรือmap และไม่ให้สิทธิ์เพียงis_public_eligible/การเป็นผู้รับข้อสอบ การเก็บsnapshotต้องจำกัดเฉพาะค่าที่จำเป็นต่อการส่งครั้งนั้นพร้อมแหล่งที่มา ไม่เก็บเลขประจำตัว/วันเกิด/ที่อยู่บ้านทั้งชุดเพื่อทำรายงาน

AddressVersionต้องเป็นpurposeจัดส่งที่ตรวจตรงOrganization/ผู้รับและหน้าที่ ไม่เอาที่ตั้งสนามแทนปลายทางส่งหากผู้รับรับคนละสถานที่ ต้องตรวจpostal/Geo/hostpurposeตาม20 ส่วนที่อยู่ส่วนตัวต้องมีอำนาจ/purpose/fieldgrantที่รับรอง ไม่copyออกpublicdeliveryaddress

sourcecontactหลายรายการต้องให้กฎหรือผู้มีอำนาจยืนยันช่องที่จะใช้จริง ไม่หยิบแถวแรกหรือเลือกจากPersonอีกคนที่มีเบอร์เดียวกัน VERIFIED/REVIEW_DUE/UNCONFIRMEDบอกผลการตรวจ ไม่เดาว่าโทรติดเท่ากับยืนยันตัวตนหรืออำนาจรับข้อสอบ

## 5 รายงานและField-levelpolicy

รายงานจัดส่งเป็นprivateโดยdefault ไม่เพิ่มลงpublicDTOเดิม ตามclassification04 Appointmentและแหล่งชื่อ/สังกัด/ที่อยู่เป็นrestricted; ถ้ารายงานรวมช่องส่วนตัวที่ชั้นสูงกว่า ให้snapshot/artifactรับชั้นสูงสุดของข้อมูล ไม่ลดชั้นเพียงเป็นreport ต้องยืนยันmapping/retentionร่วมQ025ก่อนใช้จริง

| ผู้ใช้/งาน                          | ข้อมูลที่อาจได้เมื่อมีgrantครบ                                                                     | ข้อมูลที่ห้ามอนุมานว่าได้                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| ผู้ดูทำเนียบหรือanonymous           | เฉพาะpublicationDTOของPerson/Organizationที่ผ่านpolicyเดิม                                         | รายชื่อผู้รับข้อสอบ/เบอร์/ที่อยู่จัดส่ง/เอกสารแต่งตั้ง private              |
| เจ้าหน้าที่สนามตามscope             | duty/ช่วง/ผู้รับ/verificationlabel/historyตามrowและfieldgrants                                     | PersonPrivateทั้งชุด ช่องทางส่วนตัว/ข้อมูลสนามอื่น หรือexportที่ไม่มีaction |
| ผู้ปฏิบัติงานจัดส่งที่ได้รับมอบหมาย | เฉพาะชื่อ/ช่องทาง/ที่อยู่/snapshotที่จำเป็นต่อสนาม/ปี/รอบที่มอบหมาย และcontact/addresspurposegrant | รายงานทุกปีทุกสนามเพียงเพราะมีrolelogistics หรือเนื้อหาข้อสอบ               |
| ผู้ตรวจ/auditor                     | history/origin/evidenceตามaudit/field/documentACLปัจจุบัน                                          | secret/contactค่าดิบในauditlog/ข้อมูลนอกพื้นที่/ข้อสอบจากเอกสารแต่งตั้ง     |
| worker/export/download              | inheritedinitiatorหรือserviceassignmentที่ยืนยันได้และcurrentgrantทุกขั้น                          | สิทธิ์ค้างจากjobเก่าเมื่อถูกถอนหรือหมดช่วงมอบหมาย                           |

Role/grantเหล่านี้เป็นpolicycontractไม่ใช่บัญชี/permissionที่seedแล้ว ตรวจserverทั้งread/search/history/mutation/approve/export/print/download/workerและRLSdeny by default resolveCenterSession→ExamSession→ปี/type/Organizationจากฐาน ห้ามเชื่อปี/org_id/person_id/appointment_idที่clientส่งเพื่ออนุญาต

ตรวจscopeของสนาม/รอบ/ปี/สายที่ได้รับมอบหมายและfieldpolicyก่อนquery/count/projection เห็นcontactสำนักงานที่publicแล้วไม่ได้เปิดreportทั้งชุดให้สาธารณะ Queryปีเก่าไม่ยืมaccountgrantในอดีต ผู้สังกัดอื่นที่ไม่มีgrantไม่เห็นชื่อผู้รับ/สถานะยืนยัน/จำนวนไฟล์/privateexistenceผ่านURL/body/query/cursor/export

รายงานใช้allowlistแยกสำหรับข้อมูลหน้าที่และข้อมูลจัดส่งrestricted ไม่serializeทั้งPerson/contact/address/model ไม่ส่งhiddenfieldsในHTML/RSC/CSV/PDF/print/cache/clientstate แม้ซ่อนคอลัมน์ Contact/addressauditเก็บfieldnames/resource/correlation/errorcode ไม่rawค่า/ชื่อค้น/เหตุผล/secret และไม่คิดhashเบอร์อย่างเดียวเป็นการปกปิดเพียงพอ

## 6 เอกสารแต่งตั้งและการกันเนื้อหาข้อสอบ

หน้ารายงานให้documentrefของเอกสารแต่งตั้งที่bindingถูกประเภทและownerตามappointmentเท่านั้น Downloadต้องตรวจcurrentACL/FileVersionscan/privategatewayตามบท10 Exportreportไม่แนบbytes/ลิงก์signedของเอกสารโดยอัตโนมัติ

ไม่ใส่questionfile IDs/objectkeys/content/answerkeys/previewURLs/สิทธิ์อ่านต้นฉบับข้อสอบลงDTO/report/notification หน้าที่ผู้รับข้อสอบไม่ได้ให้permissionคลังข้อสอบระบบ3เอง การแนบFileVersionที่เป็นข้อสอบแล้วเปลี่ยนlabelเป็น“แต่งตั้ง”ต้องไม่ผ่านtypedpurpose/ownerreview เพียงMIMEถูกและscanผ่านยังไม่พิสูจน์ว่าไฟล์เหมาะกับรายงาน

artifact/privatePDFอยู่storageprivate มีsafe filenameไม่ใช้เบอร์ส่วนตัว/ชื่อเต็มในURL/log ประเมินoutputACLชั้นสูงสุด ข้อมูลไม่อยู่publicfolder/staticassets ความสามารถprint/exportต้องgrantต่างหาก Downloadgatewayตรวจทุกครั้งสำหรับเอกสารที่ต้องrevokeทันที ไม่อ้างsignedlinkที่ออกแล้วเพิกถอนได้ทันที

## 7 เมื่อผู้รับพ้นหน้าที่หรือเสียชีวิต

เชื่อมtypedperson-status/assignment eventsจาก17ที่commitและตรวจprovenanceแล้ว ไม่เชื่อpayloadจากclient ตรวจtargetappointment/basis/effective_dateและสถานะล่าสุด แยกtransferที่ยังไม่approved/effectiveจากผลที่ทำให้หมดหน้าที่จริง

| เหตุการณ์                                      | ผลที่เสนอ                                                                                                                              |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| ย้ายแต่ยังมีฐานหน้าที่สนามที่ถูกต้อง           | ตรวจpolicyและความสัมพันธ์จริง ไม่ยุติทุกappointmentของPersonโดยปริยาย                                                                  |
| ย้ายพ้นฐานหน้าที่/ยุติหน้าที่ที่เกี่ยวข้องมีผล | ปิดหรือเพิ่มrevisionตามผลที่อนุมัติ แจ้งสนามต้องreview/แต่งตั้งใหม่ หยุดใช้ผู้รับเดิมสำหรับงานใหม่ตามpolicy                            |
| เสียชีวิตมีผล                                  | วงจรบัญชีตาม17/08และappointmentตามกฎ พร้อมfollow-upให้สนาม ไม่มีautoเลือกบุคคลอื่น                                                     |
| ลาสิกขา                                        | ไม่เท่ากับเสียชีวิต/ระงับทั้งหมด ตรวจหน้าที่ที่ยังทำได้และฐานการมอบหมายตาม17                                                           |
| แก้สถานะผิด                                    | correctionใหม่อ้างevent/appointmentต้นทาง คืนหน้าที่หรือgrantเฉพาะตามคำอนุมัติ/currentconditions ไม่เปิดผู้รับเดิมหรือsessionทุกชุดเอง |

transactionของเจ้าของโมดูลสร้างappointmenteffects/receipt/audit/outboxหรือfollow-upที่จำเป็นเพียงทางเดียวตาม17 Consumerไม่ปิดช่วงซ้ำจากeventมีผลเดิม unique(event,businessoperation,target) และaggregateversions/leaseป้องกันretry/eventเก่าหลังcorrection ต้องทดสอบnativePGภายหลัง

การแจ้งเป็นnotificationกลางในเว็บ/devsink ไม่มีการส่งข้อความ/อีเมลภายนอกในบทนี้ Payloadขั้นต่ำเป็นactionneeded/resource/correlation ไม่copyเบอร์/ที่อยู่/เหตุผลdeath/ไฟล์ ส่งถึงผู้มีgrantปัจจุบันสำหรับสนามนั้นและตรวจซ้ำเมื่อเปิดเรื่อง

ถ้าหาคนรับที่ได้รับแต่งตั้ง/ช่องทางยืนยันไม่ได้ ให้REPLACEMENT_REQUIRED/NEEDS_CONFIRMATIONหรือUNKNOWNตามadapter ไม่ถือว่าไม่มีปัญหา ไม่เลือกchair/coordinator/บุคคลสำรองเอง การแต่งตั้งใหม่ผ่านworkflow/หลักฐาน/makerchecker/currentversions ไม่ลบsnapshotของสิ่งที่จัดส่งไปแล้ว

## 8 รายงานปีเก่าและServicesที่เสนอ — ยังไม่สร้าง

| บริการ/มุมรายงาน          | สัญญา                                                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Appointmenthistory        | queryeffective_date/known_atพร้อมCenterSessionปี/รอบ อ้างPerson/ชื่อ/หลักฐานrevisionที่ถูกต้อง ไม่joincurrentyearเอง |
| Workingrecipientreport    | currentหรือas-ofที่เลือกพร้อมsourceverification/purpose มีPREPAREDlabel ไม่อ้างว่าจัดส่งแล้ว                         |
| Historicaldispatchreport  | ใช้snapshotที่ยืนยันในdispatchoperationปี/รอบนั้นพร้อมpinnedcontacts/address/FileVersion ไม่joinเบอร์ใหม่            |
| Confirm/correctsnapshot   | transactioncurrentgrant/expectedversions/evidence +receipt/audit/outbox; correctionappendอ้างต้นทาง                  |
| Export/print/filedownload | samefields/scopeตามจอและactiongrantเพิ่มเติม ตรวจjob/downloadปัจจุบัน จำกัดจำนวนและเก็บprivateartifact               |

ตัวอย่างDEMO: ปีAรอบAมีDEMO_PERSON_RECIPIENT_Aรับและsnapshotช่องทางA ต่อมาปีBรอบBแต่งตั้งDEMO_PERSON_RECIPIENT_B/ช่องทางB แล้วcontactAถูกแก้ รายงานdispatchปีAต้องยังเป็นpersonA/ค่าAเดิม รายงานปีBเป็นpersonB/ค่าB ไม่ใช่ผู้รับปีปัจจุบันทั้งหมด refsนี้ไม่ใช่seed/เบอร์จริง/ผลqueryผ่าน

ไม่ใช้การเก็บsnapshotอ้างว่าเก็บข้อมูลส่วนตัวตลอดไป การretention/legalhold/ปกปิดเมื่อหมดpurposeต้องผ่านQ016/Q025; การถอนสิทธิ์อ่านหรือprivacycorrectionไม่ทำด้วยลบaudit/sourceต้นทางเอง และไม่เปลี่ยนissuedartifactเงียบๆ

## 9 แผนตรวจรับ — ทุกกรณี NOT RUN

ใช้Person/สนาม/รอบ/ปี/เอกสารและช่องทางที่ติดDEMO ไม่ใช้เบอร์/ที่อยู่คนจริง Canaryส่วนตัวในฐานทดสอบเป็นmarkerสมมติที่ไม่เผยสาธารณะ ไม่ส่งข้อสอบจริงหรือcarrierAPI ต้องผ่านnativeDB/authz/files/workflow/personhandlers21/22ก่อนรัน ไม่มีtestentrypoint22ในrepository

| รหัส   | กรณี                                                               | ผลที่ต้องพิสูจน์                                                                                  |
| ------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| P22-01 | 3หน้าที่/Personเดียวหลายหน้าที่/หลายสนามตามruleDEMO                | Personกลางเดียว timeline/cardinalityตามกฎ ไม่มีwebgrantเกิดจากappointment                         |
| P22-02 | ผู้รับAปีA ผู้รับBปีB เปลี่ยนcontact/name/addressAภายหลัง          | reportปีเก่า snapshotค่าA/แหล่งเดิม ปีBค่าB ไม่มีjoincurrentphones/receiver                       |
| P22-03 | appointmentปีเดียวหลายรอบ/ย้อนหลัง/อนาคต/วันไทยboundary            | CenterSession/type/yearตรงFK known_at/revisionsตรง ไม่มีcurrentyearfallback                       |
| P22-04 | PREPARED/contactเปลี่ยนก่อนยืนยัน/ไม่มีactualdispatchsource        | recheck/conflict ไม่อ้างsentหรือsnapshotวันจัดส่งจากวันที่print                                   |
| P22-05 | sourcehistoryผิดPerson/Organization/addresspurpose/verificationdue | rejectหรือNEEDS_CONFIRMATION ไม่หยิบช่องส่วนตัว/แถวแรกมาเติมเอง                                   |
| P22-06 | anonymous/directory/หน่วยBแก้ID URL year body query cursor export  | denyไม่รั่วชื่อผู้รับ/contacts/address/filemetadata/count/hiddenfields                            |
| P22-07 | ผู้มีscopeแต่ไม่มีprivatecontact/export/print/documentgrant        | fielddeny/actiondeny ไม่serializeค่าprivateในHTML/RSC/PDF/cache/static                            |
| P22-08 | revoked/expired/suspendedหลังqueueก่อนjob/download                 | currentDAL/ACLdeny ไม่ใช้grantที่snapshotหรือjobเก่า                                              |
| P22-09 | quarantine/ผิดowner/ข้อสอบเปลี่ยนlabelเป็นappointmentfile          | download/approve/reportbindingdeny ไม่มีquestionbytes/keys/previewในreport/notification           |
| P22-10 | transferpending/transfereffective/เสียชีวิต/ลาสิกขา                | เฉพาะผลที่เกี่ยวข้องตามกฎ แจ้งreplacement ไม่เลือกแทน ไม่ลบdispatchปีเก่า                         |
| P22-11 | eventretry/crashก่อนหลังcommit/leaseหมด/eventเก่าหลังcorrection    | effects/receipt/followup/notificationไม่ซ้ำ tokenเก่าเขียนไม่ได้ originยังอยู่                    |
| P22-12 | makerapprove/expectedversionเก่า/แก้สถานะผิด                       | deny/conflict คืนappointment/grantเฉพาะอนุมัติ ไม่แก้auditหรือคืนsessionเก่า                      |
| P22-13 | retryconfirmsnapshot/payloadต่าง/correctionหลังจัดส่ง              | uniqueoperation-slot/fingerprintถูก snapshotเดิมคงอยู่ amendmentสืบต้นทางได้                      |
| P22-14 | reportexport/privateartifact/logs/provider/dataminimization        | samefields/scope ไม่ใส่contact/address/PII/secretในlog ไม่มีcarrier/externalnotificationจริงในdev |

coreName/Addresshistory/unit/WASM/403starterหรือMarkdownนี้ไม่พิสูจน์reportphoneimmutable/crossscope/appointmentfileACLจริง ไม่ระบุPASSของP22ใด

## 10 Gate/versions/คำถามค้าง

app/schema0.6.0 Prisma7.10.0 core19models/213scalarfields/migration1 SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่เปลี่ยน ไม่มีAppointment/CenterSession/DispatchRecipientSnapshot/models/services/รายงาน22 source30db964ยังBLOCKED21

Q005/Q006ต้องผู้มีอำนาจ/หลักฐาน/จำนวนหน้าที่/ผู้แต่งตั้งแทน; Q002/Q024ต้องscopeรายสนาม/ปีรอบ/cardinality/sourcebinding/operationidentityและdispatchsnapshotเวลา; Q008/Q025ต้องprivatecontactpurpose/visibility/reliability/reportclassification/retention; Q016ต้องissuedreport/amendmenthistory; Q011/Q023ต้องPersonhandler/worker/dedupe/ACL/currentgrant/RLSจริง DB-06/Q027และDOCKER-05/Q026ยังเปิดตาม [UAT_SYSTEM_01](UAT_SYSTEM_01.md)

ขั้นต่อไปปิดDB-06→foundation06–12→13–17→ตรวจรับ18→19–21ก่อนappointments/report22 ไม่เลื่อนไป23จากผลเอกสาร ก่อนเขียนโค้ดมีแผนและอนุมัติตาม [00_MASTER_PROMPT](../00_MASTER_PROMPT.md) ข้อ2 ไม่ขออนุมัติแผน07เดิมซ้ำ ไม่สร้างระบบข้อสอบ/ส่งพัสดุหรือผู้รับอัตโนมัติลัดขอบเขต
