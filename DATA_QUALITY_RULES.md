# คุณภาพทะเบียนหน่วยงานและสัญญานำเข้า staging — บท23

รุ่น0.1 | 4ตุลาคม2569 | **Proposal / BLOCKED — ยังไม่มี rule evaluator หรือ import adapter ที่ทำงานจริง**

prerequisite19–22ยังไม่ผ่านตาม [UAT_SYSTEM_02](UAT_SYSTEM_02.md) กฎนี้เป็นสัญญาทดสอบ/พัฒนาต่อ ไม่ใช่ผลสำรวจคุณภาพข้อมูลจริง “ทั่วประเทศ”หมายถึงรองรับขอบเขตหน่วยงานและพื้นที่ตามแหล่งที่รับรอง ไม่อ้างว่ามีข้อมูลจริงครบจังหวัดหรือทุกหน่วยแล้ว

## 1 วิธีใช้กฎทีละขั้น

1. ตรึงsource/file/template/ruleversion, เวลาประเมิน, วันที่ข้อมูลมีผล, known_atและscopeของผู้ตรวจ
2. ตรวจsyntax/รหัส/typedreferences แล้วตรวจgraphตามเวลาและความพร้อมของสนาม/ผู้รับในรอบที่ระบุ
3. แยก FAIL, NEEDS_REVIEW, INFO, INDETERMINATE และ NOT_EVALUATED ไม่ตีความadapterไม่พร้อมหรือไม่มีสิทธิ์อ่านว่า“ไม่มีปัญหา”
4. สร้างfindingที่ผูกsource/targetrevision/evidence พร้อมผลกระทบ ไม่แก้ทะเบียนหรือเลือกผู้รับ/mergeเอง
5. ผู้มีอำนาจพิจารณาหลักฐานและworkflowกลางก่อนcommitผลจากstaging ตรวจversions/currentgrantซ้ำ

fieldต่างกันอาจมีผลต่างกัน: ขาดที่อยู่จัดส่งอาจบล็อกdispatchแต่ยังเก็บdraftได้ ไม่มีพิกัดไม่ทำให้หน่วยงานผิด และcontactครบกำหนดตรวจไม่ได้แปลว่าเบอร์ผิดหรือบัญชีต้องระงับ

## 2 Catalogกฎ — สถานะruntimeทุกข้อ NOT RUN

| Rule    | สิ่งที่ตรวจตามversion/เวลา                                                 | ผลเสนอเมื่อพบ                         | การจัดการ                                                                                  |
| ------- | -------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------ |
| DQ23-01 | internalorganization_codeซ้ำในbatchหรือชนtargetที่ไม่resolveได้            | FAIL                                  | coreuniqueยังต้องบังคับ ไม่เติมรหัสสุ่ม/สร้างหน่วยซ้ำเพื่อให้ผ่าน                          |
| DQ23-02 | issuer/namespace/externalidentityหรือtargetที่เสนอลิงก์ขัดกัน/หลักฐานไม่พอ | NEEDS_REVIEW                          | รหัสภายนอกต่างกันไม่พิสูจน์คนละหน่วยหรือหน่วยเดียวกัน ต้องตรวจissuer/evidence ไม่automerge |
| DQ23-03 | physical/mailingpurposeที่requiredตามกฎไม่มีข้อมูลหรือยังไม่verified       | FAILสำหรับoperationที่ต้องใช้         | draftคงได้ แต่dispatch/effectiveที่ต้องใช้หยุด ไม่แทนด้วยบ้าน/ที่ตั้งอื่นเอง               |
| DQ23-04 | province/district/subdistrictkindหรือparentchainไม่ตรงsourceversion        | FAIL                                  | เสนอเจ้าหน้าที่ตรวจ ไม่เดาจากlabelหรือเปลี่ยนจังหวัดเพื่อผ่าน                              |
| DQ23-05 | postalcodeไม่ตรงcountryprofile/sourceหรือยังไม่รับรอง                      | NEEDS_REVIEW/FAILตามoperation         | ไม่เดารหัสไปรษณีย์ โครงDEMOprofileไม่ใช่patternทางการ                                      |
| DQ23-06 | hierarchicalcycleในcycle_group/chainที่มีintervalintersectionร่วมกัน       | FAIL                                  | self/direct/descendant/อนาคตตรวจทั้งแผนพร้อมnativeconcurrency ไม่unionคนละเวลา/สายผิด      |
| DQ23-07 | allowedparenttype/chain/root/cardinalityยังไม่รับรองหรือผิดรุ่น            | INDETERMINATEหรือFAILเมื่อกฎยืนยันผิด | บล็อกผลมีจริงที่ต้องใช้ ไม่ถือOrganizationTypeให้scopeเอง                                  |
| DQ23-08 | สนามรายรอบขาดchairที่requiredและมีผลตามdate/rule                           | FAILสำหรับเปิดใช้งานที่ต้องมี         | กฎจำนวนchairยังTO VERIFY แจ้งแต่งตั้ง ไม่เลือกชื่อจากพนักงาน/ผู้รับเอง                     |
| DQ23-09 | ขาดrecipientที่requiredหรือหมดช่วง/พ้นหน้าที่ ณ วันdispatch                | FAILสำหรับdispatch                    | ไม่ใช้ผู้รับปีปัจจุบันแทนปีเก่า ไม่autoเลือกcoordinator                                    |
| DQ23-10 | contactverificationยังไม่ครบ/ขัดกัน/ถึงreview_dueตามpolicy                 | NEEDS_REVIEW                          | แสดงสิ่งที่ตรวจ/วัน ไม่ปรับupdated_atให้เหมือนverified_at ไม่ลบช่องทางหรือsuspendเอง       |
| DQ23-11 | field/publicvisibilityหรือsource/target scopeไม่ผ่าน                       | FAIL/ACCESS_DENIED                    | ไม่เปิดcontacts/privateaddress/appointmentfiles ให้ค้น/ส่งออก/mergeนอกscope                |
| DQ23-12 | diff/approval/map/sourcefingerprintหรือexpectedtargetversion stale         | FAIL/CONFLICT                         | สร้างdryrun/diffrevisionใหม่และreviewใหม่ ไม่ยืมapprovalเดิม                               |
| DQ23-13 | sourcehistory/typedowner/evidence/snapshotrevisionที่จำเป็นขาดหรือไม่ตรง   | NEEDS_REVIEW/FAIL                     | ไม่joincurrentname/address/phoneแทนต้นฉบับหรือDocumentmetadataแทนscan                      |
| DQ23-14 | requiredadapter/status/ข้อมูลที่ต้องตรวจยังไม่สร้าง/อ่านไม่ได้             | INDETERMINATE                         | ไม่แสดงcount0/clean100%; requiredgapบล็อกoperationตามrule                                  |
| DQ23-15 | ไม่มีพิกัดที่ผ่านหลักฐาน/publication                                       | INFO                                  | textlist/detailยังใช้งานได้ ไม่name-geocode/default0 หรือถือไม่มีแผนที่คือข้อมูลผิด        |
| DQ23-16 | ชื่อ/ที่อยู่คล้าย แต่ไม่มีverifiedidentityที่ยืนยันหน่วยเดียวกัน           | NEEDS_REVIEW                          | เสนอคู่ให้ตรวจ ไม่merge/split/autolinkด้วยความคล้ายหรือscoreอย่างเดียว                     |

gatesและseverityแต่ละoperationต้องเป็นconfigurationมีรุ่น/owner/evidence การตรวจmissingchair/recipientใช้CenterSession/ปี/รอบ/effective_dateและcurrentknowledge ไม่ใช้สนามแม่บทไม่มีปี Statusระบบ4ไม่พร้อมต้องINDETERMINATE ไม่ACTIVEสมมติ

findingขั้นต่ำ: rule_id/version, batch/dryrunversion, source_row_ref, typedtargetrefเมื่อมีgrant, assessmentclock/effective_date/known_at, resultcategory, safeerrorcode, affectedfieldnames, evidence refs/currentversions, reviewstatus และcorrelation ไม่ใส่rawเบอร์/ที่อยู่/ชื่อค้น/secretในauditlogหรือnotification

## 3 Importadaptercontract — ยังไม่ได้สร้าง

แหล่งเดิมอาจมีschema/encoding/codebookต่างกัน ใช้adapterมีsource_namespace/templateversionและtypedmapping ที่เจ้าของรับรอง รับเฉพาะauthorizedsourcefileหรือentrypointที่กำหนด ไม่fetchURLที่อยู่ในrowหรือเดาschemaทุกไฟล์เอง

ลำดับเสนอ: privateupload→quarantine/ชนิด/ขนาด/scan/ACLตาม10→parse/normalizeแบบจำกัดfields→stagingที่RLS/owner/scopeผ่าน→matching/diff/DQ→humanreview→commandapplyที่workflow/currentversionsผ่าน ไม่มีขั้นparse/DQเขียนOrganizationหรือcreateApplication

logical04 import_batch/import_rowผูกexam_sessionและmatched_person_idสำหรับExcelสมัครสอบ จึงใช้กับองค์กรเดิมโดยไม่ปรับtypedcontractไม่ได้ ต้องออกแบบsharedimportprimitive/organizationtargetextensionผ่านADR/migrationเมื่อพร้อม ไม่ยืมexam_sessionปลอมหรือบันทึกorganization_idลงmatched_person_id ไม่สร้างใบสมัครหรือworkflowengineใหม่

stagingเป็นworkspaceชั่วคราวprivateไม่ใช่ทะเบียนหน่วยงานใช้งานจริง fieldsเสนอ: batchUUID/targetkind=ORGANIZATION/source_namespace/fileversion/hash/template/ruleversion/initiator/currentowner/scope; rowUUID+source_row_ref/row_number/dryrunversion/normalizedallowlist/sourcefingerprint/mappingdecision/targetexpectedversions/findings/evidence/receiptrefs

unique(batch,dryrunversion,row_number)และsource-rowidentityต้องมีnamespaceชัด Retryfile/parse/applyไม่เพิ่มnormalizedrowsหรือOrganization/audit/outboxใช้จริงซ้ำ Fingerprintใช้canonicalfieldsที่จำเป็น ไม่lograwsourcefileหรือค่าติดต่อ การแก้mapping/file/targetทำให้diffapprovalเดิมใช้ไม่ได้

## 4 รายงานความต่างและการเลือก merge

เปรียบเทียบbase/current/proposedตามfieldgrant ชื่อ/รหัส/source/Geography/relationtimeline/contactpurpose/history/evidenceที่ยืนยันได้ Unknownและunverifiedไม่เท่ากับNULLที่อนุมัติให้ลบ ต้องแสดงsource/targetversionsและแต่ละfieldที่reviewได้ ไม่แสดงtargetcandidateนอกscopeเพื่อเป็นexistenceoracle

| การเลือกของผู้ตรวจเสนอ | ผลที่อนุญาต                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| LINK_EXISTING          | ผูกsourceidentityกับOrganizationเดิมเมื่อverifiednamespace/evidenceผ่าน ไม่rewritehistoryเอง               |
| PROPOSE_CREATE         | เสนอOrganizationใหม่เมื่อมีหลักฐานว่าต่างหน่วย ไม่ใช้ชื่อคล้าย/รหัสชนเป็นเหตุสร้างเพื่อข้ามunique          |
| PROPOSE_UPDATE_HISTORY | สร้างคำขอแก้ชื่อ/ที่อยู่/สังกัด/contactตาม19–22พร้อมtimelineและเหตุผล ไม่UPDATEค่าปัจจุบันทับ              |
| REQUEST_MERGE          | คำขอใหม่อ้างsource-target/evidence/impactplan ผู้มีอำนาจอนุมัติ ไม่mergeจริงจากdropdownหรือsimilarityscore |
| REJECT/DEFER           | คงfinding/reason/evidenceตามretention ไม่dropแถวเงียบๆหรือแก้sourceต้นฉบับ                                 |

Entitymergeไม่ใช่การcopyfieldหรือเปลี่ยนparent ต้องตรวจrelations/cycles/keys/center-session/appointments/เอกสาร/ประวัติ/รายการค้างกับโมดูลเจ้าของ ถ้าadapterผลกระทบrequiredไม่พร้อมให้UNKNOWN/block ไม่moveFKทุกตารางหรือharddeleteผู้แพ้เอง `merged_into_organization_id`coreไม่ได้พิสูจน์businessmergeครบหรือให้สิทธิ์เพิ่ม

applyหลังอนุมัติต้องcurrentactor/action/scope/time/evidence/currentversion/makerchecker ผ่านและtransactionรวมdomainhistory/mapping/receipt/audit/outbox หากconflictrollbackทั้งคำสั่ง ไม่สมัครผู้เรียน/ส่งข้อสอบ/เพิ่มRoleAssignmentจากการนำเข้าหน่วยงาน

## 5 ชุดข้อมูลทดลองและขอบเขตคำว่า“ทั่วประเทศ”

[legacy-organizations-plan.json](../tests/fixtures/system02/legacy-organizations-plan.json) เป็น10legacyrows/5typerefs/6Geographyrefsสมมติสองพื้นที่ มีข้อผิดพลาดตั้งใจและcanaryส่วนตัว **DEMO_OFFLINE_PLAN_NOT_STAGED** ไม่ได้ผ่านvalidator/นำเข้าฐาน ไม่ใช่ข้อมูลจังหวัดจริง รหัสไปรษณีย์DEMOไม่ใช่รหัสส่งจริง

[expected-quality-focus.json](../tests/fixtures/system02/expected-quality-focus.json) เป็นรายการexpectedfocusที่เขียนเตรียมเอง **HAND_AUTHORED_EXPECTED_FOCUS_NOT_EXECUTED** ไม่ใช่รายงานจากadapterและไม่exhaustive ทุกrowอาจมีfindingอื่นตามruleจริงที่ยังไม่สร้าง/ยังTO VERIFY ไม่มีrowที่ประกาศruntimePASSจากไฟล์นี้

รองรับขอบเขตทั่วประเทศต้องอ้างGeographysource/หน่วยงาน/สายที่รับรอง ไม่hardcodeเฉพาะพื้นที่A/Bในservice ต้องเพิ่มcoveragecodebook/country/ภูมิศาสตร์และloadtestsตามQ014เมื่อมีข้อมูลและimplementationจริง ไม่มีข้อมูลจริงครบ/จำนวนจังหวัด/เปอร์เซ็นต์coverageประเทศที่รับรองในรอบนี้

## 6 Gateและการตรวจซ้ำ

ทุกDQ23ยังNOT RUNเชิงruntime ดูกรณีทำซ้ำใน [ACCEPTANCE_CASES](../tests/system02/ACCEPTANCE_CASES.md) และคู่มือ [MANUAL_ORGANIZATIONS](MANUAL_ORGANIZATIONS.md) ไม่ใช้การอ่านJSON/labelครบหรือrootunit17แทนstaging/merge/DBconstraints ผ่าน

schema/app0.6.0 Prisma7.10.0 migrationcore1ไม่เปลี่ยน ต้องปิดDB-06/foundationและ19–22ก่อนadapter/evaluator/testsจริง กฎofficialcode/Geography/postal/type/parent/cardinality/authority/purpose/retentionยังQ002/Q005/Q006/Q008/Q011/Q016/Q023/Q024/Q025/Q027 TO VERIFY ไม่สร้างคำตอบกฎหมายหรือข้อมูลคนจริงเอง
