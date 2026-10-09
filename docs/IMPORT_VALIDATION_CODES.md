# รหัสตรวจนำเข้าและวิธีแก้ — บท 61

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | **DEMO_IMPORT_VALIDATION_CODES_0.1 / Proposal / runtime NOT IMPLEMENTED**

ใช้ [staging/dry run contract](IMPORT_STAGING_DRY_RUN.md), [ELIGIBILITY_RULES](ELIGIBILITY_RULES.md), [parser60](XLSX_PARSING_LIMITS.md) และ [template59](EXCEL_TEMPLATE_CONTRACT.md) รหัสREQUIRED/CELL_MUST_BE_TEXT/AMBIGUOUS_DATE/AMBIGUOUS_YEAR/CONTEXT_YEAR_MISMATCH/INVALID_GROUP/EVIDENCE_REQUIRED/UNMAPPED_REMARK/ORPHAN_REMARKใช้ความหมายเดิมจาก59/60 ไม่แยกvalidatorอีกชุด Eligibility NOT_OPEN/CLOSED/INELIGIBLE/NOT_READYอ้างservice36 ผลที่กำหนดด้านล่างเป็นexpectedไม่ใช่ผลทดสอบผ่าน

## 1 รูปแบบ issue ที่ต้องคืนเมื่อมีสิทธิ์

Issueมีreport/run/issueIDที่opaque, sheet key/name, physicalrow>=1, column index/letter/cell reference, field_code, issue_code, severity, message_th, correction_hint, display_valueหรือค่าปกปิด, permittedrelatedrowreferences ข้อมูลraw/normalized/identity/applicationmatchingเก็บprivateฝั่งserver ไม่ส่งขึ้นclientด้วยทุกissueโดยปริยาย

fieldต้องตรงรุ่นschema Cellrefคำนวณจากphysicalrow/columnที่อ่านจริง ไม่เลื่อนเพราะแถวว่าง remarksแถว5ไม่ใช่ผู้สมัครแถว5 schema59 B=organization_code, C=exam_center_code, D=academic_year_code, E=exam_session_code, F=exam_type, G=level, H=stage, I=identity_type, J=identity_value, M=given_name, Q=birth_date, T=identity_evidence_ref, U=notes ค่าbatch-levelissueใช้row/column/cellNULLและแสดงที่หัวreport

ERRORทุกตัวblockREADY/commit ไม่ackเพื่อข้าม ส่วนWARNINGชื่อคล้ายใช้ได้เฉพาะdistinctverifiedidentities ไม่มีสิทธิ์mergeและยังต้องfreshness/eligibilityครบ Permissiondenyทั้งbatchเป็น403/404ตามpolicyก่อนคืนissue ไม่ใช้rowissueเปิดรายงานของคนอื่น UNKNOWN/outscope/detailจากregistryที่อ่านไม่ได้ใช้genericcode/messageไม่confirmexistence ค่าที่แสดงต้องallowlist/fieldpolicy currentaction/scope/time

## 2 Code catalog เสนอ 35 รหัส

| รหัส                      | Severity | ตำแหน่ง / เหตุ                                        | ข้อความไทยและวิธีแก้ที่อนุญาต                                               |
| ------------------------- | -------- | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| REQUIRED                  | ERROR    | fieldจำเป็นตามschema                                  | กรอกช่องที่รุ่นเทมเพลตกำหนด แล้วตรวจใหม่                                    |
| CELL_MUST_BE_TEXT         | ERROR    | cellเป็นnumber/boolean/errorแต่ต้องTEXT               | ตั้งชนิดข้อมูลตามเทมเพลตและกรอกค่าต้นฉบับใหม่ ไม่เติมศูนย์เดา               |
| AMBIGUOUS_DATE            | ERROR    | วันที่ไม่มีformatแน่ชัด                               | แก้เป็นรูปแบบวันที่ที่รุ่นกำหนด เช่นYYYY-MM-DD ค.ศ.ในschema59               |
| AMBIGUOUS_YEAR            | ERROR    | fieldปีไม่มีeraที่รับรอง                              | ระบุหลักฐาน/ใช้รุ่นmappingที่กำหนดระบบปี ไม่เดาแปลง543                      |
| SCHEMA_VERSION_MISMATCH   | ERROR    | batch/header/fieldไม่ได้อยู่ในรุ่นที่pin              | ดาวน์โหลดรุ่นที่ตรงกับงานแล้วนำเข้าตรวจใหม่ ไม่เลือกlatestเงียบ             |
| FORM_NOT_VERIFIED         | ERROR    | OFFICIALขาดsource/meaning/fields/rightsที่รับรอง      | รอแบบรับรองหรือใช้DEMOติดป้าย ไม่อ้างว่าเป็นแบบศ.3                          |
| CONTEXT_YEAR_MISMATCH     | ERROR    | Dหรือfieldปีไม่ตรงAcademicYearที่เลือก                | ใช้รหัสปีการศึกษาตรงcontext ไม่ใช้ปีงบหรือปีจากชื่อไฟล์แทน                  |
| INVALID_GROUP             | ERROR    | F/G/Hประเภทระดับช่วงชั้นไม่ตรงoffering                | เลือกกลุ่มที่ถูกต้อง นักธรรมใช้NONE ธรรมศึกษาแยกstageจากlevel               |
| UNKNOWN_ORGANIZATION      | ERROR    | Bไม่อยู่ในcatalogที่actorมีสิทธิ์ตรวจ                 | ตรวจรหัสสำนัก/สถานศึกษาในขอบเขตที่ได้รับมอบหมาย                             |
| ORG_CONTEXT_MISMATCH      | ERROR    | Bไม่ตรงสำนักที่เลือก/aggregatepolicy                  | เลือกบริบทให้ตรงหรือแยกไฟล์ตามหน่วยงานที่ได้รับมอบหมาย                      |
| SCOPE_DENIED              | ERROR    | B/C/identity/evidenceอยู่นอกscopeหรืออ่านไม่ได้       | ให้ผู้ได้รับมอบหมายแก้หรือเลือกข้อมูลในscope ไม่เผยว่าเป้าหมายมีอยู่หรือไม่ |
| UNKNOWN_EXAM_CENTER       | ERROR    | Cไม่อยู่ในcatalogที่อ่านได้                           | ตรวจรหัสสนามจากรอบที่เลือก ไม่ค้นสนามนอกscopeผ่านerror                      |
| CENTER_CONTEXT_MISMATCH   | ERROR    | C/Eสนามไม่ผูกรอบ/ประเภท/พื้นที่ที่กำหนด               | ใช้สนามและรอบกลางที่อนุญาต ไม่แก้nameเพื่อหลบcode                           |
| CENTER_CLOSED             | ERROR    | C/Eสนามไม่มีeffectiveopenณวันที่อ้างอิง               | ให้เจ้าหน้าที่ตรวจคำสั่ง/รอบหรือเลือกสนามที่เปิด ไม่ย้ายผู้สมัครอัตโนมัติ   |
| SESSION_CLOSED            | ERROR    | Eรอบปิด/ไม่พร้อมรับสมัคร                              | เลือกรอบที่เปิดตามทะเบียนและปฏิทินรุ่นที่ตรวจได้                            |
| NOT_OPEN                  | ERROR    | batch/rowยังไม่ถึงwindowตามserverclock                | ตรวจวันที่เปิดของรุ่นกฎ ไม่ปรับเวลาบนbrowser                                |
| CLOSED                    | ERROR    | batch/rowถึงหรือเลยเวลาปิด                            | ขอเจ้าของเรื่องตรวจตามนโยบาย ไม่ใช้dryrunเก่าหรือbackdate                   |
| INELIGIBLE                | ERROR    | fieldpredicateที่service36ระบุ                        | แก้ข้อเท็จจริง/หลักฐานตามreasonที่มีสิทธิ์ ไม่เดาประโยค/คะแนนผ่าน           |
| NOT_READY                 | ERROR    | rule/source/policy/factไม่พอวินิจฉัย                  | ให้ผู้รับผิดชอบยืนยันกฎหรือข้อมูลก่อน ไม่ถือunknownเป็นผ่าน                 |
| EVIDENCE_REQUIRED         | ERROR    | T/remarks.evidence_refหรือrequirementfieldขาด         | แนบเอกสารกลางตามrequirementcodeและตรวจใหม่                                  |
| EVIDENCE_NOT_CLEAN        | ERROR    | เอกสารPENDING/INFECTED/scanfailed                     | รอการตรวจหรือแทนไฟล์ตามบริการกลาง ห้ามclientตั้งCLEAN                       |
| EVIDENCE_BINDING_MISMATCH | ERROR    | หลักฐานไม่ผูกperson/row/context/purpose               | เลือกหลักฐานของเรื่องที่ถูกต้องภายใต้สิทธิ์ ไม่เปิดไฟล์คนอื่น               |
| EVIDENCE_NOT_VERIFIED     | ERROR    | scanผ่านแต่ยังไม่ตรวจเนื้อหา/อำนาจรับรอง              | ให้ผู้ตรวจที่ได้รับมอบหมายตรวจหลักฐาน Scanไม่แทนการรับรอง                   |
| IDENTITY_INVALID          | ERROR    | I/Jชนิด/รูปแบบ/issuerผิดpolicy                        | ใช้ประเภทตัวตนและข้อมูลตามหลักฐาน ไม่บังคับเลขไทยกับต่างชาติ/ไม่มีเลขไทย    |
| IDENTITY_REVIEW_REQUIRED  | ERROR    | identityไม่resolve/หลักฐานไม่ชัด/multiplematches      | ให้ผู้มีสิทธิ์ยืนยันตัวตนกลาง ไม่สร้างหรือmergeคนจากชื่อ                    |
| DUPLICATE_ROW_ID          | ERROR    | Aซ้ำในsheetผู้สมัครตามschema                          | แก้รหัสแถวTEXTให้ไม่ซ้ำพร้อมremarksที่อ้าง ไม่ซ่อนด้วยเปลี่ยนrownumber      |
| DUPLICATE_IN_FILE         | ERROR    | I/Jหรือkeyโอกาสสมัครตรงหลายแถว                        | ตรวจทุกคู่แถวในไฟล์ ไม่เพิ่มregistration_slotเองหรือautoรวมคน               |
| DUPLICATE_PENDING_BATCH   | ERROR    | canonicalidentity+opportunityมีactivependingbatch     | ให้เจ้าหน้าที่ตรวจความซ้ำ/ยกเลิกชุดที่ถูกต้องตามpolicy ไม่เปิดbatchนอกscope |
| DUPLICATE_APPLICATION     | ERROR    | keyกลางพบApplicationจากเว็บ/Excel                     | ให้ตรวจใบเดิมหรือamendmentตามworkflow ไม่สร้างใบใหม่ด้วยkeyสุ่ม             |
| UNMAPPED_REMARK           | ERROR    | remarks.remark_codeนอกmappingรุ่น                     | ใช้รหัสหมายเหตุที่กำหนด ข้อความAPPROVE_NOWไม่เป็นคำสั่งอนุมัติ              |
| ORPHAN_REMARK             | ERROR    | remarks.row_idไม่ชี้ผู้สมัครในไฟล์รุ่นนี้             | แก้referenceให้ตรงrow_id ไม่เดาจากชื่อหรือphysicalrow                       |
| NAME_SIMILAR_NOT_MERGED   | WARNING  | M/nameคล้ายแต่verifiedidentitiesต่างกัน               | ตรวจว่าชื่อกรอกถูก ยังคงสองคนแยกกัน การackไม่ให้สิทธิ์merge                 |
| REPORT_STALE              | ERROR    | batch-levelfile/normalized/rules/facts/contextเปลี่ยน | ตรวจdryrunรุ่นใหม่ เก็บรายงานเก่าไว้ตามสิทธิ์ ห้ามใช้เก่าcommit             |
| REPORT_EXPIRED            | ERROR    | batch-levelถึงexpires_at/serverboundary               | ตรวจใหม่ก่อนดำเนินการ ไม่ขยายอายุจากclientclock                             |
| VALIDATION_INCOMPLETE     | ERROR    | batch-levelตรวจไม่ครบเพราะDB/worker/limit/error       | แสดงจำนวนตรวจได้กับค้างและretryตามservice ไม่รายงานพร้อมเพราะerrors0บางส่วน |

parser-levelเช่นFORMULA_NOT_ALLOWED/DATE_PROTOCOL_MISMATCH/ZIP_EXPANSION_LIMITยังอ้าง60 ไม่เปลี่ยนเป็นroweligible ด้านCLOSED/NOT_OPENต้องแสดงfieldตำแหน่งที่rulepredicateระบุ ถ้าเป็นทั้งรอบให้batchissueและrelatedownrows ไม่สร้างbirthdatecolumnerrorแทนregistrationwindow

## 3 ตัวอย่างตำแหน่งและการปกปิด

ตัวอย่างTESTทั้งหมดไม่ใช่รายงานที่serverสร้าง: ผู้สมัครB5ผิดสำนัก → ORG_CONTEXT_MISMATCH; B6scopeเกิน → SCOPE_DENIED แสดง“ปกปิดตามสิทธิ์”; C7สนามปิด → CENTER_CLOSED; J8/J9ตัวตนและopportunityตรง → DUPLICATE_IN_FILE; headerrow4ผิดรุ่น → SCHEMA_VERSION_MISMATCHตรงheader/batch; หมายเหตุD5ขาดevidence → EVIDENCE_REQUIRED รักษาsheetแยกจากผู้สมัครแถว5

รหัสซ้ำคน/ใบสมัครไม่ส่งrawID หรือชื่อคนที่matchไปให้ผู้ไม่มีสิทธิ์ ความเหมือนชื่อเองไม่duplicateapplication แถวชื่อตรงกันแต่verifiedidentityต่างต้องไม่ merge ค่าในpreview/errorXLSXผ่านDTOpolicyก่อนสร้างไฟล์ ไม่สืบข้อมูลซ่อนจากtooltip/hiddenrows/sheets/exportcounts/APIcache

## 4 การเปลี่ยนรุ่นและตรวจรับ

Code/severity/predicate/fieldbinding/message templateเปลี่ยนสร้างversionใหม่ pinกับrunเดิม เหตุผลย้อนหลังยังอ้างรุ่นที่ตรวจ ไม่renamecodeแล้วทำissueเก่าหาย Native/HTTP/exporttestsต้องพิสูจน์ทุกlocation/crossscope/typedstrings/nofieldsleak แต่รอบ61ยังไม่มีservices/preview/XLSXreport

ดู [VALIDATION_CASES](../tests/system09/VALIDATION_CASES.md) และ [fixture/config](../tests/fixtures/system09/validation-plan.json)0.1 PLAN_ONLY เกณฑ์61-01ทะเบียนไม่ถูกสร้าง/61-02แสดงตำแหน่งแก้ทุกชนิดยังBLOCKED/NOT_RUN ตรวจเอกสารหรือexpectedfixtureไม่แทนservervalidation/eligibilityหรือการยืนยันแบบทางการ
