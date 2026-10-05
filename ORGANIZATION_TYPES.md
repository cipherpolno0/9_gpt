# ทะเบียนหน่วยงาน ประเภท และลำดับสังกัด — แบบเตรียมบท19

รุ่นเอกสาร0.1 | 4ตุลาคม2569 | sourceก่อนแก้ `fc6afbe` | **Proposal / BLOCKED — ยังไม่มี OrganizationRelation, services หรือหน้าลำดับสังกัด**

บท19ต้องผ่าน18ก่อน ปัจจุบัน [UAT_SYSTEM_01](UAT_SYSTEM_01.md) ยังBLOCKED และfoundation12ยังไม่มีauthz/auth/files/workflowจริง จัดทำเฉพาะสัญญาออกแบบ ไม่เพิ่มschema/migration/seedหรืออ้างว่าระบบหน่วยงานใช้งานได้ กฎประเภท parent สายปกครอง อำนาจ และรหัสทางการที่ไม่มีหลักฐานใช้ **TO VERIFY**

## 1 แนวคิดทีละขั้น

1. Organizationคือทะเบียนหน่วยงานกลางหนึ่งรายการ ไม่ใช่ต้นไม้ที่มีparentช่องเดียว ทุกระบบอ้างUUIDเดิม ชื่อและที่อยู่เปลี่ยนได้ผ่านประวัติ
2. Relationบอกว่าใครสัมพันธ์กับใคร ในสายใด และวันใด เช่น สังกัดปกครองอาจต่างจากสังกัดการศึกษา ไม่เอาที่ตั้งทางภูมิศาสตร์มาแทนสายสังกัด
3. การย้ายปิดช่วงความสัมพันธ์เดิมและเปิดช่วงใหม่ด้วยrevision/หลักฐาน ไม่เปลี่ยนparentทับจนข้อมูลปีเก่าหาย
4. ตรวจวงจรเฉพาะสายที่กฎกำหนดเป็นhierarchyและช่วงเวลาที่มีผลร่วมกัน ต้องตรวจในtransactionที่กันการเขียนแข่งด้วย ไม่พอเพียงตรวจparent!=child
5. หลายหน่วยการศึกษาสามารถอ้างทะเบียนวัด/สถานศึกษาและที่อยู่ต้นทางเดียวกัน แต่ไม่ถือว่าชื่อหรือที่อยู่เหมือนกันแปลว่าเป็นหน่วยงานเดียวกันโดยอัตโนมัติ

อ้าง [BLUEPRINT](../BLUEPRINT.md), [DATA_DICTIONARY](DATA_DICTIONARY.md) แบบ04, [DATABASE](DATABASE.md), [WORKFLOW_ENGINE](WORKFLOW_ENGINE.md) และ [FOUNDATION_ACCEPTANCE](FOUNDATION_ACCEPTANCE.md) ใช้บัญชี/เอกสาร/คำขอ/auditกลางของเว็บ9ระบบ ไม่มีloginหรือทะเบียนหน่วยงานชุดใหม่

## 2 สิ่งที่มีจริงและสิ่งที่ต้องต่อยอด

| ส่วน                                 | core06ที่มีจริง                                                                                                       | สิ่งที่ยังไม่มี                                                  |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Organization                         | UUID, organization_code unique, OrganizationTypeFK, currentStatusFK, mergedIntoOrganizationFK, rowVersion, provenance | ไม่มีparentorganization column ไม่มีorganizationhierarchyservice |
| OrganizationType                     | type_code unique, label_th, verification_statusค่าเริ่มTO_VERIFY, is_active                                           | ยังไม่มีruleversion/allowedparenttype/confirmedtypepolicyservice |
| OrganizationNameHistory              | display_name, effective_from/to, recorded_at, superseded_at/replaces_id, evidenceDocumentFK                           | ไม่มีค้นชื่อเดิม/DTO/UIที่ได้รับอนุญาต                           |
| AddressVersion / OrganizationContact | อ้างOrganizationเดิม มีช่วงและหลักฐาน; AddressVersionอ้างGeography                                                    | ไม่มีsharedpremisesresolver หรือpublicationpolicyจริง            |
| Geography                            | code/kind/label/parentGeographyFK                                                                                     | geographyparentไม่ใช่OrganizationRelationและไม่ได้ให้Rolegrant   |
| Document / AuditLog                  | metadataDocument และ audit_logsกลาง                                                                                   | ไม่มีFileVersion/scan/ACL/บัญชีผู้อนุมัติจริง                    |

Prismaปัจจุบันไม่มีOrganizationRelation/OrganizationRelationType แบบlogicaldictionary04ที่มีรายการเหล่านี้ยังไม่ใช่migration OrganizationTypeFKปัจจุบันไม่ใช่ประวัติชนิดหน่วยงาน หากต้องแก้ชนิดย้อนหลังต้องกำหนดrevision/typehistoryอย่างมีหลักฐานก่อน ห้ามอัปเดตFKแล้วอ้างqueryอดีตว่าได้ชนิดเดิม

## 3 ประเภทหน่วยงานตามขอบเขตผู้ใช้

ชื่อรหัสด้านล่างเป็นrefสมมติในเอกสาร ไม่ใช่รหัสทางการ ไม่seedหรือเพิ่มmasterจริงในบทนี้ ประเภทที่อนุญาตให้เป็นparentในแต่ละสายต้องรับรองต่างหาก ไม่มีตารางอนุมานว่า“วัดต้องขึ้นกับองค์กรประเภทใด”จากชื่อเพียงอย่างเดียว

| ประเภทตามผู้ใช้ | refเตรียมสมมติ                        | สิ่งที่ต้องรับรอง                                                                | สถานะ     |
| --------------- | ------------------------------------- | -------------------------------------------------------------------------------- | --------- |
| วัด             | DEMO_ORG_TYPE_TEMPLE                  | namespaceรหัส/สถานะ/หลักฐาน/สายสัมพันธ์/อำนาจ                                    | TO VERIFY |
| สำนักเรียน      | DEMO_ORG_TYPE_STUDY_BUREAU            | เป็นหน่วยอิสระหรือหน่วยการศึกษาของทะเบียนเดิม และชนิดparent                      | TO VERIFY |
| สำนักศาสนศึกษา  | DEMO_ORG_TYPE_RELIGIOUS_STUDY_UNIT    | เป็นหน่วยอิสระหรือหน่วยภายใน และความสัมพันธ์กับวัด/สถานศึกษา                     | TO VERIFY |
| องค์กร          | DEMO_ORG_TYPE_ORGANIZATION            | รายการชนิดย่อย/บทบาทหน่วย/รหัสที่เจ้าของยืนยัน ไม่ใช้เป็นtypeอเนกประสงค์ให้grant | TO VERIFY |
| สถานศึกษา       | DEMO_ORG_TYPE_EDUCATIONAL_INSTITUTION | เกณฑ์ระบุตัวตน/รหัส/หน่วยเจ้าของ/แผนกที่อยู่ร่วม                                 | TO VERIFY |

Organization.organization_codeเป็นรหัสภายในที่coreบังคับuniqueอยู่แล้ว รหัสทางการภายนอกต้องมีissuer/namespace/evidence/วันมีผลที่ยืนยัน ไม่ลดuniqueเป็นแค่ชื่อหรือชนิดเพื่อยอมรหัสซ้ำ และไม่เดารูปแบบทะเบียนวัด/สถานศึกษา เปลี่ยนชื่อหรือย้ายสังกัดไม่สร้างOrganizationIDใหม่ด้วยเหตุนี้เพียงอย่างเดียว

พบชื่อคล้าย/รหัสภายนอกขัดกันให้เจ้าหน้าที่ตรวจหลักฐาน ไม่mergeอัตโนมัติ และไม่ใช้merged_into_organization_idเป็นการแทนreparentหรือปิดหน่วยโดยไม่มี workflow ตามกฎ

## 4 Relationtype และconfigurationที่เสนอ

กำหนดทิศทาง `parent → child` ให้แน่นอน ข้อมูลสายกับพื้นที่ทางภูมิศาสตร์เป็นคนละdimension RelationtypeUUIDอ้างconfigurationมีรุ่น ไม่ใช้free textจากclientเลือกว่าจะข้ามการตรวจวงจรหรือให้scope

| สาย/ความสัมพันธ์เสนอ                   | ความหมาย                                                       | ข้อมูลที่ต้องรับรอง                                              | ผลต่อสิทธิ์                                                    |
| -------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------- |
| GOVERNANCE                             | ลำดับสังกัดสายปกครองที่เจ้าของยืนยัน                           | chain_id, allowedtypepairs, rootpolicy, cardinality, cycle_group | descendantsได้เฉพาะchain/action/grantที่มอบหมายปัจจุบัน        |
| EDUCATION                              | สังกัดการศึกษาที่เจ้าของยืนยัน                                 | branch/chainที่ใช้, allowedtypepairs, cardinality/cycle_group    | ไม่รวมลูกสายปกครองหรือแผนกอื่นเอง                              |
| AREA_RESPONSIBILITY                    | หน่วยงานที่รับผิดชอบ/เจ้าของพื้นที่ตามความหมายที่เจ้าของรับรอง | หลักฐานอำนาจ/เขตGeography/ช่วงและขอบเขตหน้าที่                   | ไม่อนุมานจากaddressหรือให้สิทธิ์ทุกคนในจังหวัด                 |
| HOSTED_AT (ข้อเสนอเพื่อใช้ที่อยู่ร่วม) | หน่วยการศึกษาใช้สถานที่ของOrganizationต้นทาง                   | host/addressowner, ช่วงใช้สถานที่และevidence                     | ไม่เท่ากับสังกัดปกครอง/การศึกษา/กรรมสิทธิ์ และไม่เป็นscopeedge |

AREA_RESPONSIBILITYไม่ได้รับรองกรรมสิทธิ์ในที่ดินหรืออำนาจทางกฎหมายจากชื่อในเอกสาร ต้องยืนยันความหมาย“เจ้าของพื้นที่”ก่อนตั้งtype/fieldจริง HOSTED_ATเป็นข้อเสนอจำเป็นต่อการอ้างที่อยู่ร่วม ไม่เพิ่มระบบที่ตั้งแยกในบทนี้

configurationต้องมีrevision/status/effectiveinterval/evidenceและผู้รับรอง รวม relation_code, hierarchy_axis/chain_id, cycle_group, is_hierarchical, allowed_parent_types/child_types, parent_cardinality, permits_root, geography/branchconstraints และscope_usage ไม่อ้างdictionary04ที่มีเพียงrelation_codeว่าconstraintsเหล่านี้มีจริงแล้ว

TO VERIFYไม่ใช้กับทะเบียนทางการที่มีผลหรือเป็นขอบเขตสิทธิ์ ทดลองได้ด้วยruleที่ติดDEMOแยกnamespaceเท่านั้น อำนาจwebต้องมาจากRoleAssignment07 ไม่ใช่OrganizationType/Relationtypeเอง

## 5 OrganizationRelationและhistorycontract

ต่อlogicaldictionary04โดยเพิ่มผ่านmigrationเมื่อprerequisitesผ่าน เปิดRLSทุกตาราง deny by default ใช้UUID/FKRestrict/snake_case และtimelineแบบcoreเดิม ไม่ใช้parentช่องเดียวในOrganization

| ข้อมูลเสนอ   | ข้อบังคับ                                                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| ตัวตน/รุ่น   | UUIDของrevision พร้อมlogicalrelationrefหรือreplaceschainที่ตรวจได้; rowversion/graphversionสำหรับcommandconflict                         |
| endpoints    | parent_organization_id/child_organization_id FKOrganizationกลาง ห้ามself; relation_type_id FKconfigมีรุ่นและchain/axisที่รับรอง          |
| timeline     | effective_from/toเป็นdateช่วง`[start,end)`; recorded_at/superseded_atเป็นtimestamptz; replaces_idชี้revisionต้นทาง ห้ามsupersessioncycle |
| provenance   | actorที่ตรวจปัจจุบัน, source_request_id/approveddecision, ruleversion, FileVersion/hashผ่านscan/ACL และcorrelation                       |
| พื้นที่/แผนก | typedGeography/branchreferenceหรือbindingที่ฐานenforceตามrelationtype อาจไม่ใช้กับทุกสาย; ไม่เก็บrawaddress/ชื่อหน่วยซ้ำ                 |
| idempotency  | commandkey+fingerprint+receipt ตามengine11 uniqueผลธุรกิจ ไม่สร้างrelationrevisionซ้ำจากretry                                            |

evidenceDocumentFKของcoreเก็บmetadataเท่านั้น ข้อเสนอrelationต้องเพิ่มbindingกับFileVersion10ที่ตรวจowner/scan/ACL/versionจริง ไม่ใช้Document.lifecyclestatusเพื่อหลอกว่ามีscanแล้ว

ดัชนีเสนอตามquery: parent/chain/type/effectiveintervalสำหรับdescendants และ child/chain/type/effectiveintervalสำหรับparents; constraints/exclusionสำหรับduplicateedgeและoneparentruleที่ยืนยัน อาจใช้GiSTกับrange/partialcurrentknowledgeตามแผนmigration ไม่คัดลอกindexทุกFKจากlogicaldictionary04โดยไม่วัดquery ไม่อ้างindexแก้concurrentcycleได้

ห้ามช่วงของedgeเดิมชนกันในcurrentknowledgeตามkeyที่รับรอง ความสัมพันธ์ต่างสายไม่ถือว่าซ้ำ กฎchildมีparentได้หนึ่งหรือหลายหน่วยต้องระบุเป็นรายaxis/type ไม่ใช้oneparentทุกOrganizationโดยปริยาย

## 6 ตรวจparentและวงจรตามเวลา

ในtransaction resolveendpointsจากserver ตรวจcurrentactor/action/scopeของchild/parentและกฎย้ายต้นทาง/ปลายทาง ทั้งสองหน่วยต้องมีชนิด/สถานะที่ใช้ได้ในช่วงเสนอ ความเปลี่ยนแปลงชนิดภายในช่วงต้องแบ่งตรวจตามรุ่น ไม่ใช้labelปัจจุบันแทนประวัติชนิดที่ไม่มี

สำหรับสายhierarchical เมื่อเพิ่ม `P → C`:

1. ถ้าP=Cให้ปฏิเสธทันที FKอย่างเดียวไม่กันself
2. สร้างภาพgraphหลังการเปลี่ยนทั้งแผน เอาrevisionที่กำลังแทนออกและเพิ่มedgeใหม่ที่อนุมัติ ตรวจtypepairs/root/cardinality/duplicateintervalก่อน
3. ค้นเส้นทางจากCกลับไปP ภายในcycle_group/chainที่ruleกำหนด ไม่รวมทุกสายเป็นgraphเดียว และไม่ข้ามrelationtypeที่เป็นส่วนของcycle_groupเดียวกัน
4. ระหว่างเดินแต่ละedgeให้ตัดช่วงเวลาที่มีผลร่วมกับcandidateและedgesก่อนหน้า หากintersectionว่างเส้นทางนั้นไม่เป็นcycleตามเวลา หากถึงPพร้อมintersectionไม่ว่างต้องreject
5. ตรวจทั้งช่วงcandidateรวมอดีต/ปัจจุบัน/อนาคต และplannedapprovededgesที่กฎใช้จองลำดับไว้ ไม่ตรวจแค่วันที่กดsave วันมีผลของplannedrelationยังไม่ทำให้currentauthorizationเปลี่ยนก่อนเวลา

ตัวอย่างDEMO: A→Bมีผล2025-01-01ถึง2026-01-01; B→Aมีผล2026-01-01เป็นต้นไป ช่วงไม่ทับกันจึงไม่เป็นcycleด้วยเหตุสองedgeนี้ แต่ถ้าB→Aเริ่ม2025-12-01เกิดintersectionหนึ่งเดือนต้องreject ตัวอย่างนี้เป็นscenarioคำนวณไม่ใช่ข้อมูลseedหรือผลserviceผ่าน

ถ้าdataเดิมมีcycle/typemappingไม่ครบ ให้failclosedพร้อมรายงานที่ผู้มีสิทธิ์อ่านได้ ไม่ตัดedgeเพื่อสร้างtreeเงียบๆ และไม่หยุดค้นที่depthlimitแล้วอ้างว่าไม่มีcycle Limitใช้ป้องกันงานเกินกำหนดได้แต่กรณีถึงlimitต้องเป็นunresolved/block

### ป้องกันการเขียนแข่ง

row_versionของchildเดียวไม่พอสำหรับA→BและB→Aที่สองtransactionตรวจพร้อมกัน เสนอ transaction lockระดับcycle_group/chainที่ใช้keyคงที่ ทุกgraphwriter/import/revision/activationใช้ลำดับlockเดียวกัน และตรวจgraphใหม่หลังlock รวมserializable/retryตามแผนที่เลือก ต้องพิสูจน์nativePGไม่ใช่unitmemory

ฐานต้องไม่เปิดช่องruntimeเขียนrelationข้ามขั้นตรวจ ใช้restrictedwritepathและDBfunction/constrainttriggerที่ตรวจgraphพร้อมlockตามADRที่จะเลือกเมื่อimplement ไม่ใช้CHECKqueryข้ามแถวหรือให้servicecredentialข้ามRLSเป็นอำนาจธุรกิจ หากมีหลายcycle_groupต้องlockตามลำดับคงที่เพื่อลดdeadlock และrecheckทั้งแผนหลังretry

## 7 ย้ายสังกัดโดยคงประวัติ

สมมติCสังกัดAตั้งแต่2025-01-01และย้ายไปBวันที่2026-05-01 โดยใช้ruleDEMOที่อนุญาต:

| มุมที่ค้น                                        | ผลที่ต้องได้ภายหลังimplementation                                    |
| ------------------------------------------------ | -------------------------------------------------------------------- |
| effective_date2025-06-01, known_atหลังบันทึกย้าย | relationA→C พร้อมหลักฐานเดิมและช่วงถึง2026-05-01                     |
| effective_date2026-05-01, known_atหลังบันทึกย้าย | relationB→C เริ่ม2026-05-01; A→Cไม่activeในวันนี้                    |
| known_atก่อนบันทึกย้าย                           | ฉบับความรู้เดิมและหลักฐานเดิมตามเวลานั้น ไม่ใช่currentparentย้อนหลัง |
| approvedอนาคตก่อนวันมีผล                         | plannedแยกจากcurrentrelation ไม่ให้scopeใหม่ก่อนเวลา                 |

activationต้องsupersedeฉบับความรู้เดิมและสร้างrevisionช่วงต้นทางที่ปิดปลายพร้อมเปิดปลายทางในtransactionเดียวกัน เก็บoldrevision/FileVersion/decision/audit ไม่แก้เนื้อหาฉบับเดิมทับ ไม่ลบOrganization/ชื่อ/ที่อยู่/ผลสอบ/snapshotปีเก่า ผลหลัก/receipt/audit/outboxcommitพร้อมกันและretryไม่ปิดช่วงซ้ำ

การย้ายสำคัญผ่านคำขอ/workflowกลางตามengine11และผู้มีอำนาจที่ยืนยัน ผู้สร้างไม่อนุมัติของตน กฎต้นทาง/ปลายทางไม่ครบหรือtargetversionเปลี่ยนให้deny/conflict ไม่สลับparentก่อนworkflowapproved

queryประวัติใช้ `effective_from <= effective_date < effective_to` (NULLคือไม่มีปลาย) และ `recorded_at <= known_at < superseded_at` (NULLคือยังไม่ถูกแทน) พร้อมprojectionตามสิทธิ์ แสดงพ.ศ.ที่UI วันตัดรอบAsia/Bangkok ไม่เก็บปีพ.ศ.ในdate

## 8 ใช้ทะเบียนและที่อยู่ร่วมกัน

ถ้าวัด/สถานศึกษาเดิมมีหลายหน่วยการศึกษา ให้หน่วยเหล่านั้นอ้างOrganizationเดิมด้วยUUID เช่นภายหลังeducationunitมีorganization_id/hostreferenceและแผนก ไม่สร้างวัดชื่อเดียวอีกหลายรายการเพียงเพื่อธรรม/บาลี/สามัญ การแยกหน่วยที่มีตัวตนทางทะเบียนต่างกันต้องมีหลักฐานและหน่วยงานIDของตน พร้อมrelationกับhostเดิม

หากหน่วยการศึกษาเป็นส่วนภายในOrganizationเดียวกัน ให้ใช้organization_idนั้นตรงๆ ไม่สร้างHOSTED_ATจากOrganizationกลับมาหาตัวเองเพื่อแทนหน่วยภายใน

AddressVersionปัจจุบันมีorganization_idNOT NULL จึงไม่เปลี่ยนเจ้าของaddressฉบับเดิมให้หลายหน่วย แต่resolverที่เสนออ่านผ่านconfirmedhost/premisesrelationไปยังOrganizationผู้เก็บที่อยู่กลาง เลือกaddressversionตามeffective_date/known_atและตรวจACLทั้งทาง ไม่copyaddressTextลงแต่ละunit

การอ้างที่ตั้งร่วมไม่ใช่inheritanceทุกที่อยู่หรือสิทธิ์ หากหน่วยมีที่อยู่จัดส่งต่างจากสถานที่ตั้งให้สร้างAddressVersionของหน่วยนั้นพร้อมaddress_kind/ช่วง/เหตุผล/หลักฐาน ไม่overrideต้นทางกลาง และรายการเอกสาร/สมัครสอบปีเก่าต้องpinaddress/name/hostrelationrevisionที่ใช้ในเวลานั้น

มีหลายhostหรือหลายaddressที่ตรงช่วงต้องใช้purpose/ruleเลือกชัดเจน ไม่หยิบแถวแรกหรือส่งทุกที่อยู่ที่ไม่มีgrant แนวทางแยกphysicalsite/locationเพิ่มเติมต้องรับรองร่วมบทที่ตั้งเมื่อได้รับพรอมป์ต์ ไม่สร้างmodelระบบที่ตั้งทั้งชุดใน19

## 9 Services/หน้าลำดับสังกัดที่เสนอ — ยังไม่สร้าง

| สัญญาบริการ             | หน้าที่และpolicy                                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| ค้น/อ่านOrganization    | รหัส/ชื่อปัจจุบัน/ชื่อเดิม/typeตามวันที่ ภายใต้scope/fieldgrant ตรวจก่อนcount/facet/pagination/DTO                               |
| อ่านparents/descendants | ระบุchain/type/effective_date/known_atชัดเจน paginationbounded, nohiddennode/ชื่อ/edgecount/existenceoracle ไม่ถือUUIDเป็นสิทธิ์ |
| เตรียมreparentplan      | อ่านrule/targets/graphversionsและรายงานscopeimpact ไม่เขียนทะเบียนก่อนอนุมัติ                                                    |
| ทำให้reparentมีผล       | currentauthority/makerchecker/expectedversions/evidence/type/cycle/cardinalityในtransaction +audit/outbox/receipt                |
| อ่านที่อยู่ร่วม         | resolveconfirmedhostและaddresshistoryตามpurpose/ACL ไม่เชื่อhost/org_idจากclient                                                 |

การเลือกวันประวัติไม่ทำให้ใช้สิทธิ์บัญชีในอดีตแทนcurrentgrant บท07ต้องกำหนดread_historyของสาย/พื้นที่เดิมอย่างชัดเจน Querydata_dateไม่ใช่grant_time จึงเปลี่ยนวันที่เพื่ออ่านนอกพื้นที่ไม่ได้ การย้ายเปลี่ยนdescendantsต้องทำให้DAL/job/cacheใช้graphversionและสิทธิ์ปัจจุบัน ห้าม cachetreeprivateในpublic/staticassets

หน้าที่เสนอมีตัวเลือกสาย วันที่ แสดงcurrent/planned/historyต่างกัน labels/focus/keyboardและempty/error/deny ใช้sharedUI09 และสามารถแสดงรายการflatที่อ่านด้วยkeyboardได้ ไม่แสดงtreeที่รวมหน่วยไม่มีสิทธิ์หรือชื่อprivate ไม่มีหน้าหรือURLของ19ถูกสร้างในรอบนี้

## 10 แผนตรวจรับ — ทุกกรณี NOT RUN

ใช้refsDEMO_ORG_A/B/C, ruleDEMOที่ระบุtypepairs/axis/capacityและFileVersionสมมติ ไม่ใช้รหัส/ที่อยู่/หน่วยงานจริง nativePG+authz/files/workflow/servicesต้องพร้อมก่อน ไม่มีentrypoint19ที่อ้างว่ารันได้จากREADMEปัจจุบัน

| รหัส   | กรณี                                                                        | ผลที่ต้องพิสูจน์                                                                               |
| ------ | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| P19-01 | ประเภท5กลุ่ม รหัสซ้ำ/ชื่อคล้าย/retry                                        | uniqueinternalcode/typedFKตามกฎ ชื่อคล้ายไม่merge และไม่มีOrganization/receipt/auditใช้จริงซ้ำ |
| P19-02 | Cย้ายA→B ค้นปีเก่า/วันนี้/อนาคต/known_at                                    | relation/evidenceเดิมยังอยู่; plannedไม่เปลี่ยนcurrent; boundaryวันไทยตรง                      |
| P19-03 | parentตัวเอง/directcycle/indirectdescendant                                 | rejectทั้งserviceและrestrictedDBwrite path ไม่เปลี่ยนgraph                                     |
| P19-04 | cycleข้ามเวลาไม่ทับ/ทับเพียงวัน และtypeในcycle_groupเดียว                   | ตรวจintersectionทั้งช่วง ไม่rejectdisjointเพียงuniongraph ไม่ปล่อยmixedtypecycleในกลุ่มเดียว   |
| P19-05 | governance/education/areaสายต่างกัน/Geographyจากที่อยู่                     | ไม่ปนสาย/ให้grantเอง ใช้allowedpairs/cardinality/rootpolicyรายaxisตามรุ่น                      |
| P19-06 | reparentแข่ง A→B/B→A และสองparentเกินcardinality                            | ไม่เกิดcycle/overlapจากwrite skew มีrollback/conflict/retryปลอดภัย                             |
| P19-07 | แก้ย้อนหลัง/ชื่อเดิม/ชนิดหน่วยเปลี่ยน/ruleเปลี่ยน                           | origin/revision/evidencequeryได้ ไม่ใช้typeFKปัจจุบันปลอมประวัติที่ยังไม่มี                    |
| P19-08 | หลายหน่วยเรียนhostวัด/สถานศึกษาเดียวและที่อยู่จัดส่งต่าง                    | Organizationต้นทางเดียว addressไม่copy ค่าsnapshotเดิมไม่เปลี่ยน ACLของhost/historyผ่าน        |
| P19-09 | เปลี่ยนURL ID org_id relationtype/effective_date/known_at/export/cursor/job | denyตามcurrentgrantไม่รั่วnode/edge/privatefield ทั้งread/write/export/download/job            |
| P19-10 | makerapprove/TO_VERIFYrule/evidencequarantine/authorityถอนก่อนactivation    | deny/conflict ไม่สลับparentหรือมีaudit/outboxบอกสำเร็จ                                         |
| P19-11 | activationworkerretry/crashหลังcommit/cacheหลังreparent                     | ผลหนึ่งชุด historyไม่หาย currentdescendantscopeไม่ใช้cacheเก่า ไม่เพิ่มgrantปลายทางเอง         |
| P19-12 | tree/listUIkeyboard/4viewport/เลือกสายและวันที่/empty                       | sharedUI labels/focus/statusใช้ได้ ไม่มีprivategraphในHTML/cache/static                        |

ผลunit/coreWASM/starter403จากบทก่อนหรือMarkdownนี้ไม่ปิดP19ใด การผ่านcycleของGeography/mergedIntoในcoreไม่พิสูจน์OrganizationRelationtemporalcycleหรือconcurrentreparent

## 11 Gate/versions/คำถามค้าง

app/schema0.6.0 Prisma7.10.0 core19models/213scalarfields/migration1 SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่เปลี่ยน ไม่มีmodel/service/migration/seed19 สถานะ18ยังBLOCKEDจากsourcefc6afbe และDB-06/Q027ยังเปิดตามหลักฐานในUAT_SYSTEM_01

Q002ต้องสาย/allowedparent/root/cardinality/cyclegroups/เจ้าของพื้นที่; Q006ต้องอำนาจสร้างย้ายและปรับscope; Q024ต้องissuer/code/typehistory/หลายหน่วยเรียน/temporalrules; Q005ต้องผู้รับรองและผู้ตรวจ; Q008/Q025ต้องname/address/graphfieldpublicationและretention; Q023/Q011ต้องRLS/currentgrant/cache/transaction/workerจริง ไม่มีคำตอบแทนด้วยการเดากฎทางการ

ขั้นต่อไปปิดDB-06→foundation06–12→13–17→ตรวจรับ18ก่อนmodels/services/UI19 มีแผนและการอนุมัติตาม [00_MASTER_PROMPT](../00_MASTER_PROMPT.md) ข้อ2เมื่อเริ่มโค้ดจริง ไม่เลื่อนไปบท20จากผลตรวจเอกสาร ไม่ขออนุมัติแผน07เดิมซ้ำ
