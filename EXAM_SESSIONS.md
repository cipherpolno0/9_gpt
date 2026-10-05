# สนามสอบแม่บท รอบสอบ และเงื่อนไขรับสมัคร — แบบเตรียมบท21

รุ่นเอกสาร0.1 | 4ตุลาคม2569 | sourceก่อนแก้ `f389af4` | **Proposal / BLOCKED — ยังไม่มี ExamCenter/ExamSession schema, บริการหรือหน้าจัดการรอบสอบ**

บท21ต้องผ่าน20ก่อน [ADDRESS_VALIDATION](ADDRESS_VALIDATION.md) ยังเป็นแบบเตรียม และfoundation12ยังไม่มีauthz/auth/files/workflowจริง จึงจัดทำสัญญาเพื่อพัฒนาต่อ ไม่เพิ่มmigration/seedหรือทะเบียนรับสมัครอีกชุด กฎช่วงชั้น ปฏิทิน ความจุ อำนาจและสถานะที่ยังไม่มีหลักฐานใช้ **TO VERIFY**

## 1 แนวคิดทีละขั้น

1. สนามแม่บทบอกตัวตนของสนาม เช่นหน่วยงานหรือสถานที่กลางที่ใช้สอบ ส่วนรอบสอบบอกปีการศึกษา ประเภท และปฏิทิน สนามหนึ่งใช้ได้หลายรอบโดยไม่สร้างสนามใหม่ทุกปี
2. CenterSessionคือการเปิดสนามในรอบหนึ่ง มีระดับที่รับ ความจุ พื้นที่รับสมัครและสถานะของตน ปิดรอบหนึ่งไม่ทำให้สนามแม่บทหรือรอบอื่นหาย
3. นักธรรมและธรรมศึกษาอ้างExamTypeคนละรายการ ระดับอ้างExamLevelภายใต้ประเภทนั้น ช่วงชั้นเป็นอีกdimensionตามconfiguration ไม่ใช้แทนระดับตรี/โท/เอกหรือเดาว่าใช้กับทุกประเภท
4. คำขอเปิด/ปิดสนามเป็นสิ่งกำลังขอ สถานะที่มีผลมาจากเหตุการณ์ที่ตรวจแล้ว ระบบรับสมัครต้องตรวจผลปัจจุบัน ไม่ใช้สถานะsubmitted/approvedแทนactive
5. ความจุและสถานะต้องตรวจพร้อมการจองที่นั่งในtransaction ไม่พอเพียงเห็นตัวเลขว่างบนหน้าจอหรือผลdry-runก่อนหน้านั้น

ใช้ Organization/Person/ปีการศึกษา/บัญชี/เอกสาร/workflow/audit/outboxกลางร่วม9ระบบ ตาม [BLUEPRINT](../BLUEPRINT.md), [DATA_DICTIONARY](DATA_DICTIONARY.md), [WORKFLOW_ENGINE](WORKFLOW_ENGINE.md), [ORGANIZATION_TYPES](ORGANIZATION_TYPES.md) และ [FOUNDATION_ACCEPTANCE](FOUNDATION_ACCEPTANCE.md)

## 2 สิ่งที่มีจริงกับ logicalcontract

| ส่วน                                                                 | สถานะก่อนแก้                                                                                  |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| AcademicYear                                                         | core06มีUUID/yearCode unique/labelYearCe/ช่วงdate/PolicyVersionFK แยกFiscalYear               |
| ExamType                                                             | core06มีtypeCode unique/label/verificationStatusค่าเริ่มTO_VERIFY                             |
| ExamLevel                                                            | core06อ้างExamType; unique(examTypeId,levelCode) และ unique(id,examTypeId)                    |
| ExamCenter/ExamSession/SessionLevel/CenterSession/CenterSessionLevel | มีlogicaldictionary04เท่านั้น ไม่มีPrisma models/migration/servicesจริง                       |
| ที่ตั้ง/สถานะ/การรับสมัคร                                            | ไม่มีOrganizationLocation20/StatusEventระบบ4/Applicationserviceระบบ5หรือช่องExcel9ที่ทำงานได้ |

บท21ไม่สร้างระบบรับสมัคร ระบบสถานะหน่วยงาน หรือปฏิทินทางการแทนโมดูลที่ยังไม่พัฒนา สัญญาสถานะ/การใช้ที่นั่งด้านล่างเป็นdependencyที่จำเป็นต่อสนามและรอบ ไม่มีhandlerหรือadapterที่คืนALLOWโดยสมมติว่าพร้อมแล้ว

## 3 Schemacontractที่เสนอ — ต่อแบบ04

ใช้UUID/FKRestrict/snake_case/RLSdeny by defaultทุกmodel เมื่อimplementผ่านmigrationตามADR ชื่อmodelด้านล่างยังไม่ถูกเพิ่มจริง provenanceใช้บัญชี/serviceassignmentที่ตรวจสิทธิ์ได้ ไม่ถือServiceActorbootstrapเป็นผู้อนุมัติ

| Modelเสนอ          | ตัวตนและFKสำคัญ                                                                                                           | key/ข้อบังคับ                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| ExamCenter         | center_code, OrganizationFKหรือtypedbindingกับสถานที่กลางที่สร้างและรับรองแล้ว; history/หลักฐานตัวตน                      | center_code unique; ไม่รับfree-textชื่อ/ที่อยู่เป็นสนามอีกทะเบียน                                              |
| ExamSession        | AcademicYearFK, ExamTypeFK, session_code, registration_opens_at/closes_at, pinnedcalendar/ruleversion, expectedrowversion | unique(academic_year_id,exam_type_id,session_code), unique(id,exam_type_id); opens<closes                      |
| SessionLevel       | ExamSessionFK, ExamLevelFK, exam_type_id                                                                                  | unique(exam_session_id,exam_level_id), unique(id,exam_session_id); compositeFKต้องทำให้ประเภทระดับตรงกับรอบ    |
| CenterSession      | ExamCenterFK, ExamSessionFK, effective-statusreference, versions/evidence, การอ้างที่ตั้งตามรอบ                           | unique(exam_center_id,exam_session_id), unique(id,exam_session_id)                                             |
| CenterSessionLevel | CenterSessionFK, SessionLevelFK, exam_session_id, capacityและallocationpolicy/poolreferences                              | unique(center_session_id,session_level_id); compositeFKทั้งสองฝั่งต้องexam_sessionเดียวกัน; capacityinteger>=0 |

ExamCenterในแบบ04มีunique(organization_id) ใช้ได้เมื่อหนึ่งสนามแม่บทต่อหน่วยงานเป็นกฎที่รับรอง หากหน่วยงานมีหลายสถานที่/สนามจริงต้องยืนยันidentitykeyร่วมกับสถานที่กลางและแก้logicalcontract/migrationโดยมีหลักฐาน **ไม่ถอดuniqueทิ้งหรือสร้างOrganizationสำเนา**เพื่อให้เพิ่มสนามได้ บทนี้ยังไม่มีcentralplace modelจริง จึงใช้ข้อเสนอtypedbindingไม่ใช้UUIDสถานที่อิสระที่FKตรวจไม่ได้

ถ้าขยายจากOrganizationFKของแบบ04ไปใช้สถานที่กลาง ต้องมีtypedFK/bindingที่ฐานตรวจได้และกฎเลือกแหล่งตัวตนชัดเจน กรณีใช้สองทางเลือกให้enforceexactlyoneที่ฐาน ไม่รับทั้งคู่หรือไม่มีทั้งคู่และไม่fallbackไปชื่อสถานที่free text

ตัวตนสนามไม่ผูกกับปี/ประเภท/ระดับ ส่วนsession_codeต้องมีnamespaceที่รับรอง ไม่ใช้รหัสรอบเดียวuniqueทั่วทุกปีโดยไม่จำเป็น และไม่ใส่policyversionในidentitykeyเพื่อสร้างรายการสนามหรือรอบใหม่ทุกครั้งที่แก้กฎ การแก้ปฏิทิน/สถานะเก็บrevisionที่อ้างตัวตนเดิมและevidence

### ช่วงชั้นและวันที่สอบ

logical04 SessionLevelไม่มีช่วงชั้นหรือวันที่สอบ จึงต้องเสนอสัญญาเพิ่มอย่างชัดเจน: offeringของSessionLevelอ้างช่วงชั้น/กลุ่มที่configurationรับรอง และcalendarentriesระบุระดับ/กลุ่ม/วันสอบหรือช่วงเวลาที่มีหลักฐาน ไม่เก็บช่วงชั้นเป็นfree textในPersonหรือเพิ่มExamLevelซ้ำตามช่วงชั้น

ถ้าระดับเดียวมีหลายช่วงชั้น เสนอchildofferingbinding stablekey (session_level_id, stage_key) โดยstage_keyNOT NULLจากconfiguration ใช้NOT_APPLICABLEที่รับรองเมื่อไม่ใช้ช่วงชั้น ไม่ใช้NULLในuniqueแล้วคิดว่ากันduplicateได้ ห้ามเปลี่ยนuniqueSessionLevelเป็นหลายแถวต่อระดับโดยไม่ปรับFK/ตัวตนทั้งหมด กฎช่วงชั้น/การรับหลายกลุ่ม/ความจุquotaต่อกลุ่มยัง TO VERIFY

วันที่สอบเป็นdateหรือเวลาสอบเป็นinstantตามความละเอียดที่แหล่งรับรอง ไม่เติมเวลา9นาฬิกาเอง หากมีหลายวิชา/วัน/สถานที่ให้calendarentriesที่typedbindingและpinrule/source ไม่ใส่วันสอบเดียวแล้วอ้างครอบคลุมทุกระดับ ขอบเขตนี้ไม่สร้างคลังข้อสอบหรือคะแนน

## 4 หลายรอบที่สนามเดียว — ตัวอย่างไม่ใช่seed

refsด้านล่างเป็นDEMOทั้งหมด ไม่มีวันสอบทางการหรือรายการใช้จริงถูกสร้าง

| สนามแม่บท           | AcademicYearref      | ประเภทจากผู้ใช้ | session_codeสมมติ | ระดับจากconfiguration  |
| ------------------- | -------------------- | --------------- | ----------------- | ---------------------- |
| DEMO_EXAM_CENTER_01 | DEMO_ACADEMIC_YEAR_A | นักธรรม         | DEMO_ROUND_A      | ระดับที่DEMOconfigระบุ |
| DEMO_EXAM_CENTER_01 | DEMO_ACADEMIC_YEAR_A | ธรรมศึกษา       | DEMO_ROUND_A      | ระดับที่DEMOconfigระบุ |
| DEMO_EXAM_CENTER_01 | DEMO_ACADEMIC_YEAR_A | นักธรรม         | DEMO_ROUND_B      | ระดับที่DEMOconfigระบุ |
| DEMO_EXAM_CENTER_01 | DEMO_ACADEMIC_YEAR_B | นักธรรม         | DEMO_ROUND_A      | ระดับที่DEMOconfigระบุ |

แถวทั้งสี่ควรมีExamCenterหนึ่งรายการ ExamSessionสี่รายการ และCenterSessionสี่รายการเมื่อโหลดจริง แต่ตารางไม่ใช่ผลuniqueconstraintผ่าน ระดับหลายรายการใช้SessionLevel/CenterSessionLevelภายในรอบ ไม่สร้างCenterSessionซ้ำต่อทุกระดับ

## 5 Calendarconfigurationมีรุ่น

ใช้PolicyVersionกลางเป็นฐานอ้างรุ่น แล้วกำหนดtypedcalendarcontractที่มีปี/ประเภท/รอบ/ระดับ/ช่วงชั้น/วันสอบ/ช่วงสมัคร/timezone/source/evidence/ผู้รับรอง/effective_from/recorded_atที่จำเป็น ไม่มีcalendarserviceนี้ในcoreจริง

| กฎปฏิทิน          | สัญญา                                                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| แหล่งปัจจุบัน     | ต้องระบุหลักฐานสำหรับปีและรอบนั้น ไม่ดึงวันจากเว็บเก่าหรือบวกหนึ่งปีอัตโนมัติเพื่อสร้างวันปีปัจจุบัน                               |
| ความไม่แน่ใจ      | ไม่มีหลักฐานให้TO VERIFY/registrationNOT_READY ไม่ประกาศวันสอบที่เดา; DEMOแยกnamespaceและข้อความทดลอง                              |
| เวลา              | registrationwindowเป็นtimestamptz `[opens,closes)` ใช้clockserver; date-onlyตัดรอบAsia/Bangkok; UIพ.ศ.เก็บCE/instantมาตรฐาน        |
| ปี                | AcademicYearแยกFiscalYearและปีปฏิทิน ไม่ใช้ปีในURLเป็นสิทธิ์หรือกำหนดวันสอบเอง วันนอกช่วงปีศึกษาต้องตรวจruleที่รับรอง ไม่ย้ายปีเอง |
| เปลี่ยนปฏิทิน     | เพิ่มrevision/หลักฐาน/currentversionsและผลกระทบต่อผู้สมัคร/ที่นั่ง/หนังสือผ่านworkflow ไม่แก้แถวต้นทางจนค้นรุ่นที่เคยใช้ไม่ได้     |
| วันสอบ/สถานที่ทับ | ตรวจslot/พื้นที่จริงและresourcepoolร่วม ไม่คิดว่าสองประเภทสอบใช้ความจุเต็มของห้องเดียวพร้อมกันได้โดยอัตโนมัติ                      |

configต้องpinในรายการสมัคร/การจองตามpurposeที่เจ้าของโมดูล5รับรอง เพื่อสืบว่าตัดสินตามกฎใด แต่การรับสมัครครั้งใหม่/งานคิวต้องตรวจwindow/status/authority/capacityปัจจุบัน ไม่ยืมruleเก่าที่เปิดรับหลังปิดรอบ

## 6 สถานะมีผลและขอบเขตรับสมัคร

แยกอย่างน้อยสนามแม่บท, รอบสอบ, การเปิดสนามในรอบ, level/offering, registrationwindow และคำขอ ระบบ4ในอนาคตเป็นเจ้าของstatus/requesteventsตามขอบเขตที่ยืนยัน ไม่ให้คำขอdraft/submitted/approvedเปลี่ยนสถานะมีผลเอง

status_event_idในlogicalCenterSessionเป็นเพียงreference ไม่พอแทนtimeline ต้องresolveสถานะที่มีผล ณ เวลาตัดสิน พร้อมdimension/effectiveinterval/recorded_at/approvedsource/รุ่นหลักฐาน แยกสถานะสนามปิดจากสถานะหน่วยงานเจ้าของ และเงื่อนไขรอบcancelled/pausedตามpolicy ไม่ถือis_activeเพียงช่องเดียวเป็นกฎรับสมัครครบ

adapterสถานะต้องtypedbindingกับOrganization/CenterSessionที่ถูกต้อง ตรวจaccount/serviceassignmentและeventprovenance ไม่ใช้JSONeventจากclientเป็นการอนุมัติ หากระบบ4/adapter/mappingยังไม่สร้าง ให้ **UNRESOLVED / NOT_READY และdenyรับสมัคร** ไม่คืนACTIVEปลอม กฎทดลองใช้statusconfigurationDEMOที่ตรวจหลักฐานครบ ไม่ใช่ทางลัดproduction

พื้นที่รับสมัครต้องอ้างscope/Geography/OrganizationRelation/ประเภท/ระดับ/ช่วงชั้นที่ruleรับรอง มีช่วงมีผลและevidence geographyที่ตั้งสนามไม่แปลว่ารับได้ทุกผู้สมัครในจังหวัดนั้น และไม่ใช้ที่อยู่Personหรือorg_idclientเป็นgrant ต้องresolveสังกัด/พื้นที่ที่ใช้ตามpolicyจากทะเบียนกลาง

การปิดรอบหนึ่งไม่ลบสนาม/ผู้สมัคร/seat/results/historyในรอบเก่า งานเปลี่ยนสนามหรือปิดระหว่างมีที่นั่งแล้วต้องมีimpactplan/ผู้อนุมัติ ไม่ยกเลิกใบสมัครหรือย้ายผู้สมัครทั้งหมดจากการเปลี่ยนstatusโดยปริยาย

## 7 ความจุและสัญญาที่ระบบรับสมัครต้องใช้

capacityเป็นจำนวนเต็มไม่ติดลบ 0หมายถึงไม่มีที่นั่งรับเพิ่ม ไม่ใช่unlimited ค่าที่ไม่ทราบเป็นNOT_READYไม่อนุมานจากความจุปีก่อน capacityต่อCenterSessionLevel/ช่วงชั้นอาจมีquotaและresourcepoolร่วม ต้องรับรองก่อนเปิดรับ

`used = confirmed + active_reservations` เป็นข้อเสนอเมื่อpolicyกำหนดว่าการจองชนิดใดกินที่นั่ง draftไม่ได้กินเองโดยปริยาย กฎreservationexpiry/cancellation/waitlist/seatcount/batchpartialacceptanceยัง TO VERIFY ไม่มีการสร้างSeatAllocation/ใบสมัครหรือคืนquotaจริงในบทนี้

การลดcapacityต่ำกว่าusedต้องblock/ผ่านแผนแก้ผลกระทบตามผู้มีอำนาจ ห้ามปล่อยused>capacityแล้วลบseatหรือผู้สมัครเพื่อให้ยอดตรง การหมดอายุหรือคืนที่นั่งเป็นcommandในtransactionพร้อมreceipt ไม่ลดยอดจากreadqueryหรือworkerที่ได้รับงานซ้ำโดยไม่มีdedupe

ถ้ารอบ/ระดับหลายชุดใช้ห้อง/ช่วงเวลาร่วม ต้องรวมresourcepoolและruleการใช้slotเพื่อป้องกันoverbookingทั้งสนาม ไม่ใช้capacityของแต่ละรอบแยกกันจนรวมเกินสถานที่จริง โครงpool/quotaเป็นข้อเสนอdependencyเมื่อimplement ไม่อ้างmodel04 CenterSessionLevel.capacityแก้กรณีแชร์ห้องได้ครบแล้ว

### การตัดสินรับสมัครที่เสนอ

| เงื่อนไข                                  | ผลภายในที่มีสิทธิ์อ่าน                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------------------- |
| บัญชี/action/scopeไม่ผ่าน                 | DENIED ใช้ข้อความตามpolicyไม่เผยexistence/privatefield                             |
| สถานะ/กฎ/หลักฐาน/calendarไม่พร้อม         | NOT_READY ไม่รับหรือจองที่นั่ง                                                     |
| registrationยังไม่เปิด/ปิดแล้ว            | NOT_OPEN / CLOSED ไม่ใช้เมนูเปิดอยู่หรือdryrunเก่าแทนclockserver                   |
| center/session/levelofferingไม่เปิดตามวัน | INACTIVE/UNAVAILABLEตามdimensionที่รับรอง ไม่ขยายผลไปทุกปีเอง                      |
| พื้นที่/ประเภท/ระดับ/ช่วงชั้นไม่ตรง       | INELIGIBLE_OR_SCOPE_DENIED ตามfieldpolicyที่เปิดได้ ไม่มีแก้สังกัดให้ผ่านอัตโนมัติ |
| capacity/pool/quotaไม่เหลือ               | FULL ไม่overflow/waitlistเองถ้านโยบายไม่อนุญาต                                     |
| ผ่านทุกเงื่อนไข                           | ELIGIBLE_TO_ATTEMPT ไม่ใช่การันตีจองสำเร็จ ต้องทำcommandที่ตรวจซ้ำในtransaction    |

คำอธิบายและavailablecountในpublicต้องผ่านpublicationallowlistแยก ไม่ส่งcapacityledger/รายชื่อผู้สมัคร/privateIDs การคืนeligibilitybooleanหรือsignedpermitนอกtransactionไม่ได้ล็อกที่นั่ง

โมดูล5และช่องExcel9ต้องเรียกapplicationserviceเดียวกันเมื่อสร้างจริง ภายในcommandตรวจเงื่อนไขล่าสุดและทำapplication +reservation/seat/ledger +receipt/audit/outboxในtransactionเดียวกันในฐานกลางตามธุรกิจที่ยืนยัน ไม่สร้างApplicationในorganizationsหรือexams-importอีกชุด

ทุกwriterที่เปลี่ยนwindow/status/quota/poolและallocate/releaseต้องใช้ลำดับlocks/versionsที่กำหนดร่วมกัน ถ้าปิดรอบcommitก่อนallocationมีผลต้องdeny raceสองผู้สมัครแย่งที่นั่งสุดท้ายต้องได้หนึ่งผลเท่านั้น แนวทางSQLatomiccounter/rowlocks/serializableเลือกและทดสอบnativePGภายหลัง row_versionอย่างเดียวไม่พอเมื่อหลายpool/quotasแชร์ทรัพยากร

กำหนดlinearizationpointสำหรับclock/cutoffในtransactionตามpolicyที่รับรอง ไม่ตรวจnowตอนเริ่มjobครั้งเดียวแล้วยอมรับหลังdeadlineนานๆ อนุมัติ/commitแข่งกับcloseต้องมีผลชัดเจนและauditable NativePGintegration testsต้องพิสูจน์ ไม่ใช้การคิดavailablecountบนclient

Idempotencykeyผูกคำสั่ง/actor/resourceกับfingerprint uniquebusinessconstraintsของใบสมัคร/ที่นั่งต้องยืนยันร่วมโมดูล5ไม่เดากฎหนึ่งคนหนึ่งใบทุกประเภท/ระดับ keyเดิมpayloadเดิมหลังตรวจสิทธิ์คืนreceipt ไม่กินที่นั่งเพิ่ม; payloadต่างกันconflict ไม่ให้เปลี่ยนkeyเพื่อข้ามduplicatepolicy

## 8 หน้าจัดการและservicesที่เสนอ — ยังไม่สร้าง

| ส่วนเสนอ         | การทำงาน                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| รายการสนามแม่บท  | ค้นรหัส/Organization/พื้นที่ตามscope อ้างname/address/location20 ไม่copyที่ตั้งและช่องติดต่อ; ไม่ต้องมีพิกัดจึงใช้ได้     |
| ตั้งรอบสอบ       | เลือกAcademicYear/ExamType/ระดับ/ช่วงชั้น/calendarversionที่รับรอง แสดงDEMO/TO VERIFY/current/plannedชัดเจน               |
| เปิดสนามในรอบ    | CenterSessionและlevel/offering/area/capacity/quotas พร้อมevidence/ผู้ตรวจ ไม่สร้างสนามแม่บทซ้ำต่อระดับ                    |
| ดูสถานะและimpact | แสดงคำขอระบบ4แยกผลมีจริง unresolvedไม่แสดงเปิดรับ capacitychanges/statuschangesมีconflict/ผลกระทบ                         |
| consumercontract | บริการอ่านeffectiveconditionsและcommandintegrationกับapplicationservice5เมื่อพร้อม latestauthzทุกread/mutation/export/job |

ใช้sharedUI09 keyboardlabels/focus/statusที่ไม่ใช้สีอย่างเดียวและ375/768/1024/1440 ไม่มีหน้าจริง/URL/sessionformถูกสร้างในรอบนี้ Backendต้องdenyแม้ผู้ใช้ส่งIDs/ปี/type/level/area/จำนวนจากURL/bodyโดยไม่ผ่านหน้า และต้องตรวจcompositeFKกับscopeอีกครั้ง

## 9 แผนตรวจรับ — ทุกกรณี NOT RUN

ใช้สนาม/Organization/Person/ปี/config/slot/poolที่ติดDEMO ไม่มีวันสอบปัจจุบันทางการที่เดา ต้องมีnativePG/authz/files/workflow/สถานะและservices20/21จริงก่อนรัน ไม่มีtestentrypoint21ในrepository

| รหัส   | กรณี                                                            | ผลที่ต้องพิสูจน์                                                                                       |
| ------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| P21-01 | สนามเดียว4รอบตามmatrix/หลายระดับ/retry                          | ExamCenterเดียว Session/CenterSessionไม่ชนunique ไม่เพิ่มแม่บทต่อปี/ประเภท/ระดับ                       |
| P21-02 | levelผิดประเภท/CenterSessionLevelผิดรอบ/ช่วงชั้นซ้ำ             | compositeFK/typepolicy/stableofferingkeyreject ไม่มีcrosssessionbinding                                |
| P21-03 | หนึ่งOrganizationหลายสถานที่/ย้ายที่ตั้ง                        | identityตามกฎที่ยืนยัน ไม่มีcopyOrganizationหรือdropuniqueเพื่อให้ผ่าน pinaddressเดิมต่อรอบ            |
| P21-04 | calendarปีเก่า/ไม่มีหลักฐาน/เปลี่ยนรุ่น/ช่วงชั้นไม่ยืนยัน       | NOT_READYหรือDEMOเท่านั้น ไม่ยืมวันเว็บเก่าปีปัจจุบัน ไม่มีdefaultวัน/เวลาสอบ                          |
| P21-05 | ก่อนเปิด/ตรงopens/ก่อนcloses/ตรงcloses/เที่ยงคืนไทย             | `[opens,closes)` clockserver/CE-BEถูก ไม่มีรับหลังปิดจากผลdryrunเก่า                                   |
| P21-06 | ขอบเขตรับสมัคร/ปี/type/level/area/Stageแก้ในURL/body/export/job | deny/currentpolicyและfieldscope ไม่เชื่อclient/ที่ตั้งให้สิทธิ์                                        |
| P21-07 | pendingopen/approvedอนาคต/effectiveclose/unresolvedระบบ4        | คำขอไม่เปลี่ยนผลจริง unresolveddeny ปิดรอบนี้ไม่ลบรอบเก่า                                              |
| P21-08 | capacity0/unknown/full/shrinkต่ำกว่าused                        | ปฏิเสธถูกเงื่อนไข ไม่unlimited/เดาความจุ/ลบseatเอง                                                     |
| P21-09 | 2คำสั่งแย่งseatสุดท้ายหรือquota/poolร่วมต่างระดับ/ประเภท        | หนึ่งสำเร็จ usedไม่เกินทั้งpool/quota พร้อมrollbackไม่มีใบสมัครใช้จริงค้าง                             |
| P21-10 | close/withdrawauthorityแข่งallocation/workerretryหลังdeadline   | lateststatus/authority/cutoffที่linearizationpointตรง policy ไม่รับจากcacheเก่า                        |
| P21-11 | retrycommand/crashก่อนหลังcommit/releaseexpired/cancelซ้ำ       | receipt/application/seat/audit/outboxไม่เพิ่มซ้ำ counterไม่ติดลบ history/ผลเดิมไม่หาย                  |
| P21-12 | manual/Excel/applicationconsumerใช้conditionsเดียวกัน           | backenddecisionและallocationpolicyตรงกัน ไม่สร้างใบสมัคร/loginอีกชุด ไม่ใช้Exceldryrunเป็นสิทธิ์commit |
| P21-13 | makerapprove/scanpending/ruleเปลี่ยน/แก้รุ่นย้อนหลัง            | deny/conflictตามcurrentversions หลักฐาน/ปฏิทินรุ่นที่เคยใช้สืบได้                                      |
| P21-14 | public/cache/privatecapacityledger/keyboard4viewport            | ไม่มีข้อมูลผู้สมัคร/privatefields publiccalendarผ่านpolicy UIlabels/empty/TO VERIFYชัดเจน              |

unique/จำนวนrowในตารางMarkdownไม่ใช่ผลmigrate/seedผ่าน coreExamLevelcompositekeyที่มีแล้วไม่พิสูจน์FKSessionLevelใหม่ และunit/WASM/403starterเดิมไม่ปิดเกณฑ์closed/fullรับสมัครจริง

## 10 Gate/versions/คำถามค้าง

app/schema0.6.0 Prisma7.10.0 core19models/213scalarfields/migration1 SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่เปลี่ยน Sourcef389af4 organizations/exams/exam-importsยังREADME-only ไม่มีExamCenter/Session/CenterSession/SessionLevel/capacity/Application/statusadapterจริง

Q004/Q017ต้องปี/ปฏิทินประเภทระดับช่วงชั้น/เวลาตัดสิน/หลักฐานปัจจุบัน; Q002/Q024ต้องidentityสนาม/สถานที่/พื้นที่/uniquekeys/slotpool/จำนวนที่นั่ง/การกินคืนquota; Q005/Q006ต้องผู้มีอำนาจ/คำขอสถานะ; Q008/Q025ต้องpubliccalendar/count/privacy; Q011/Q023ต้องRLS/transaction/applicationservice/revocation/worker/adapterจริง DB-06/Q027และDOCKER-05/Q026ยังเปิดตามหลักฐาน [UAT_SYSTEM_01](UAT_SYSTEM_01.md)

ขั้นต่อไปปิดDB-06→foundation06–12→13–17→ตรวจรับ18→19→20ก่อนschema/UI/services21 จากนั้นเชื่อมระบบ4/5/9เมื่อได้รับพรอมป์ต์และdependencyพร้อม ไม่อ้างว่าระบบรับสมัครใช้สัญญานี้ได้แล้ว ไม่เลื่อนไป22จากผลเอกสาร ก่อนเขียนโค้ดต้องมีแผนและอนุมัติตาม [00_MASTER_PROMPT](../00_MASTER_PROMPT.md) ข้อ2 ไม่ขออนุมัติแผน07เดิมซ้ำ
