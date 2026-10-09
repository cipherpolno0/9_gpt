# กฎคะแนนและการคำนวณผลสอบ — บท 38

รุ่น 0.1 | 5 ตุลาคม 2569 (2026-10-05) เวลาไทย | source `4e91fad` | **Proposal / BLOCKED — ยังไม่มี score staging/grading services จริง**

บท37ยังไม่ผ่านตาม [SEAT_ALLOCATION](SEAT_ALLOCATION.md) ไม่มีSubjectScore/ResultDraft/GradingRuleVersion/ExamSubject/SessionSubject/Application/SeatAllocation และAuth/DAL/FileVersion/workflow/outboxที่จำเป็นในPrisma จึงยังไม่สร้างบริการที่อ้างว่าให้ผลทางการได้ เอกสารนี้เป็นสัญญาต่อยอด ไม่ใช่schema/migration/กฎทางการหรือผลทดสอบgradingผ่าน

ใช้ [SCORE_IMPORT_REVIEW](SCORE_IMPORT_REVIEW.md), [RESULT_CERTIFICATION](RESULT_CERTIFICATION.md), [APPLICATION_SCHEMA](APPLICATION_SCHEMA.md), [ASSESSMENT_RULES](ASSESSMENT_RULES.md), [DATA_DICTIONARY](DATA_DICTIONARY.md) ฐานและPerson/Organization/Application/เอกสารกลางชุดเดียว ไม่เพิ่มทะเบียนผู้สมัครหรือlogin คะแนนระบบ3กับผลทางการระบบ5แยกขอบเขตการเขียน

## 1 แยกข้อมูลสี่ชั้น

| ชั้น         | Contractที่เสนอ                                                                                                                 | ความหมาย                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| คะแนนดิบ     | private source FileVersion/hash + raw staging row/cell/source locator + parser/template versions                                | หลักฐานจากไฟล์นำเข้า ยังไม่ใช่คะแนนที่ตรวจรับ ห้ามแก้rawให้เหมือนต้นฉบับไม่เคยผิด |
| คะแนนตรวจรับ | immutable SubjectScore revision + application/SessionSubject/GradingRuleVersion/accepted batch refs + recorder/checker/evidence | ผ่านcontext/range/evidence/difference checksและล็อกชุด ไม่เท่ากับผ่านสอบ          |
| ผลคำนวณ      | ResultDraft/ResultDraftItem/ResultScoreLink + pinned score versions/rules/algorithm/output trace/hash                           | คำนวณซ้ำจากinputเดิมได้ ไม่มีjoin latest scoreหรือCMS key                         |
| ผลรับรอง     | canonical workflow/certification decision + immutable result manifest + authorized human/recorded_at                            | เจ้าหน้าที่ที่มีอำนาจรับรองรุ่นที่ตรวจ ไม่ใช่public ResultReleaseและไม่เผยแพร่เอง |

คะแนนที่อ่านไฟล์ได้ไม่เท่ากับตรวจรับ ชุดล็อกไม่เท่ากับรับรองผล และรับรองไม่เท่ากับเผยแพร่คะแนนสาธารณะ ผลประกาศ/แบบผลทางการเป็นขอบเขตบทที่จะสั่งต่อ ไม่พัฒนาหรือเดาล่วงหน้า

## 2 Modelและrule contractที่เสนอ

logical04แยก ExamSubject/SessionSubject ของการสอบทางการจากคลังเรียนอยู่แล้ว GradingRuleVersionผูกPolicyVersion+SessionSubject; SubjectScoreใช้numeric(10,4)และscore_version_no; ResultScoreLinkผูกคะแนนกับResultDraftItemของApplicationเดียวกัน ทั้งหมดนี้ยังไม่มีในphysicalschema06

| Contract                                    | สิ่งที่ต้องตรึง/ตรวจ                                                                                                                                                                                                                                |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ExamSubject/SessionSubject                  | UUID/code/type-level/session binding และsubject inventoryที่รับรอง ไม่ใช้ชื่อวิชาหรือSubjectของระบบ3แทนรหัสทางการ                                                                                                                                   |
| GradingRuleVersion                          | PolicyVersion/sourceDocument/FileVersion/hash/issuer/edition/purpose/effective window/checker; verification/mode; typedsubject/context binding; min/max/precision/unit/rounding/weight/aggregation/absence/essay/eligibility/outcome rulesที่รับรอง |
| SubjectScore                                | Application/SessionSubject/SessionLevel-or-offering context + GradingRuleVersion + score_version_no/score_value + sourcefile/batch/reviewer/evidence/supersedes refs; rawและacceptedแยกไม่overwrite                                                 |
| ResultDraft/Item/ScoreLink                  | uniquecontext+draftversion; itemหนึ่งต่อApplication+snapshot; scorelinkหนึ่งต่อวิชา/ส่วนที่ruleรับรอง มีcompositeFKคน/contextตรงและpinsของคะแนนรุ่นที่เลือก                                                                                         |
| Batch lock/certification/amendment bindings | canonical raw/normalized/accepted/result manifest hashes, review revision, human decision/provenance/receipt/workflow refs; การแก้หลังล็อกเป็นเรื่องใหม่เชื่อมต้นทาง                                                                                |

ต้องalign SessionLevel/SessionSubject กับoffering/ช่วงชั้น21/35 และallocationrevision/amendmenttarget37ก่อนADR/dictionary/ERD/typedFK/migration ไม่แก้04ทั้ง128ตารางหรือcoreDDLเดิมทับเพราะสัญญานี้ ไม่สร้างbatchหรือworkflowแยกใน09

| Ref    | ข้อบังคับเสนอ                                                                                                                                |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| K38-01 | typedFKapplication/snapshot/seat-allocation-revision/subject/session/year/type/level/stage/centerตรงกัน เลขแสดงลำพังไม่เป็นidentity          |
| K38-02 | unique SubjectScore(application_id,session_subject_id,score_version_no) + immutable supersession/evidence; ไม่upsertacceptedscoreจากExcel    |
| K38-03 | composite ResultScoreLinkต้องsameApplication/sameSessionSubject/sameResultDraft context ไม่นำscoreของเพื่อนหรือคนละปีมารวม                   |
| K38-04 | grading/source/subject/evidence mode OFFICIALต้องverifiedและตรงscope/window; unknown NOT_READY ไม่latest/คะแนนปีก่อนแทน                      |
| K38-05 | rawhash/canonical manifest/checksum member set+versions+context มีschema/algorithm version; ไม่checksumยอดรวมอย่างเดียว                      |
| K38-06 | currentactor/action/resource/scope/fieldpolicy/assignment/second-checker/maker/CAS+receipt+audit/outbox atomicเมื่อlock/certify              |
| K38-07 | raw/accepted/calculated/certifiedไม่rewrite; หลังล็อกต้องapprovedamendmentและรุ่นใหม่ ไม่ลบscore/result/history                              |
| K38-08 | learning principals/events/tables/importkindไม่มีwrite capabilityหรือtypedFKไปofficialscores; provenance boundaryต้องบังคับnative/API/worker |

## 3 ตัวเลข กฎ และการตรวจซ้ำ

max_score numeric(10,4)ในแบบ04เป็นข้อเสนอชนิดข้อมูล ไม่ใช่หลักฐานว่าคะแนนเต็มหรือผ่านเท่าใด Min/max/scale/weights/rounding/absence/วิชาบังคับ/วิธีรวม/outcome ต้องsourceที่รับรอง Q004/Q024 TO VERIFY ไม่มีค่าdefaultผ่านหรือคะแนนเต็ม100

เก็บraw decimal representationตามsource/schemaและnormalizeด้วยกฎชัด ใช้exact decimalในการตรวจช่วง/รวม/น้ำหนัก ปฏิเสธNaN/Infinity, ค่ากำกวม, overflowหรือscaleเกินก่อนcast ไม่binary floatหรือcastแล้วปัดเงียบ ๆ เลขreference/seatเป็นtextแยกจากdecimalscore กฎรับnumeric cellของExcelต้องparser/schemaที่พิสูจน์semanticและprecision ถ้ายังไม่พร้อมไม่เดาค่าจากdisplay format

การคำนวณเก็บordered score refs/values/component units/ruleversion/hash/algorithmversion/rounding trace/outcomeและcanonical input/output checksum รุ่นนโยบายใหม่ไม่เปลี่ยนผลเดิมโดยอ่านlatest การrecomputeผลเก่าต้องinputและalgorithmรุ่นเดิมทั้งหมด ถ้าขาดartifactให้NOT_READY ไม่ใช้อัลกอริทึมใหม่แล้วอ้างเทียบเท่า

missing/absent/withheld/pending/invalidกับscore0ต้องแยก missingไม่เติมศูนย์ absentต้องผล/หลักฐานและruleที่รับรอง การหักคะแนน/อนุญาตค่าติดลบหรือcomponentsหลายผู้ตรวจต้องtypedrule/ADRชัดตามsource ไม่ผ่อนvalidationเพราะcellมีเครื่องหมายลบ

## 4 กระทู้ธรรมหรือข้อเขียน

คะแนนต้องเชื่อมofficial written grading evidenceจากผู้ตรวจที่มีอำนาจ: paper/reference/subject/context/rubric-or-marking-rule version/grader/grade revision/วันที่ตรวจ/คำรับรองตามกระบวนการ เอกสารกลางscan+ACLและตรวจเนื้อหา ไม่ใช้manual_grading/AnswerKeyของระบบ3เป็นแหล่งผลทางการ

ถ้ามีกระบวนการสองผู้ตรวจ/ตรวจทาน/ส่งผู้วินิจฉัย ต้องgraded evidenceครบตามruleก่อนaccepted/certified ไม่เฉลี่ยหรือเลือกค่าสูงเอง คะแนนปรนัยไม่เติมคะแนนข้อเขียน และAIไม่ให้grade/outcomeผ่านแทนผู้ตรวจทางการ การไม่มีหลักฐานให้PENDING_GRADING/NOT_READYไม่0

## 5 ตัวอย่างกฎทดลอง — ไม่ใช่การรับรองทางธรรม

`DEMO_GRADING_V1` เสนอวิชาสมมติ `DEMO_OBJ` และ `DEMO_ESSAY`, min0/max10/scale4, รวมแบบบวกตรงโดยไม่มีเกณฑ์ผ่าน คะแนน`2.2500`และ`3.5000`ได้`5.7500` outcome `DEMO_TOTAL_ONLY` เท่านั้น ไม่ชื่อวิชา/คะแนน/เกณฑ์ทางการ ตัวข้อเขียนยังต้องevidenceสมมติจากผู้ตรวจสมมติที่ติดป้าย

เมื่อทดลองสร้างDEMO_V2คนละกฎต้องคงผลV1และreferencesเดิมไว้ RecomputeV1ใช้V1ไม่latest ไม่ยกระดับDEMO/TO_VERIFYเป็นOFFICIAL/CERTIFIED_OFFICIALแม้ตัวอย่างรวมเลขตรง บทนี้ยังไม่มีruleconfiguration/seed/graderที่รันตัวอย่างนี้

## 6 แผนตรวจรับ — P38ทุกกรณี NOT RUN

| Case ref | กรณีเมื่อnative/API/runtimeพร้อม                                                          | Oracleที่ต้องพิสูจน์                                                                 |
| -------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| P38-01   | seatไม่พบ/retired/เลขซ้ำต่างรอบ/ผิดปี-center-level-stageหรือApplicant                     | ผูกallocationrevision/rosterที่ถูกต้องหรือblock ไม่มีaccepted/certifiedผิดคน         |
| P38-02   | วิชาผิด/extra seat-subject และ missing expected rows                                      | scoped mismatchครบ ไม่drop/เติม0/รับรองส่วนที่ขาดโดยเงียบ                            |
| P38-03   | duplicateภายในไฟล์/ข้ามbatch/samekey/newkey                                               | รายงานและunique/receiptกันacceptedscoreซ้ำ ไม่last-write-wins                        |
| P38-04   | นอกช่วง/NaN/Infinity/overflow/scaleเกิน/decimal localeกำกวม                               | rejected staging ก่อนcast ไม่มีcertifiedและไม่มีการปัดเงียบ                          |
| P38-05   | กระทู้/ข้อเขียนขาดgrader/rule/officialsource หรือclient/AIส่งคะแนนปรนัยแทน                | PENDING_GRADING/NOT_READY ไม่สร้างpassed/score0ทดแทน                                 |
| P38-06   | pre/posttest/manual_grading03/export-learning/importkind/event/DB roleพยายามเขียนofficial | denyทุกentrypointรวมworker/nativegrant ไม่copyหรือเชื่อsource_kindจากclient          |
| P38-07   | reader/importer/checker/certifierนอกscope/revoked/หมดassignmentและmakerรับรองเอง          | currentdeny ไม่มีPII/คะแนนเพื่อนจากquery/row/error/job                               |
| P38-08   | คนที่สองตรวจdiff/ACKเก่า/แก้row-score-rule-evidenceระหว่างตรวจและlock                     | reviewversion/hashตรงหรือ409refresh ห้ามlockเมื่อunresolved errors                   |
| P38-09   | samebatchrevisionสองคนlock/certifyพร้อมกัน/faultระหว่างscore-draft-receipt-outbox         | one canonical decision/versions หรือrollbackทุกชุด ไม่มีpartialcertified             |
| P38-10   | parser/sourcehash/manifestorder/members/context/templateเปลี่ยนหรือchecksumไม่ตรง         | STALE/TAMPER/NOT_READY checksumไม่แค่sum ไม่mixedbatch                               |
| P38-11   | รวมexactdecimal/weights/roundingด้วยpinsเดิม แล้วruleใหม่หรือCMSเปลี่ยน                   | recomputeinputV1ตรงoutput/hashV1 ไม่joinlatestหรือคะแนนฝึก                           |
| P38-12   | zero/absent/missing/withheld/pendingและวิชาบังคับ                                         | statusต่างกัน ผลตามruleverified unknownไม่passed/0                                   |
| P38-13   | แก้หลังล็อกผ่านamendment/returned/rejected/cancelled/approved/retry                       | score/resultrevisionใหม่เฉพาะอนุมัติ คงsource/decision/hashเดิม auditไม่rewrite      |
| P38-14   | seatamend/statusrulewithdraw/evidencewithdrawก่อนรับรอง                                   | impact/context/pins/revalidationจริง ไม่ใช้roster/currenttargetผิดเวลาด้วยlatestjoin |
| P38-15   | upload quarantine/MIME/macro/formula/external-link/ZIP expansion/limits                   | rejectหรือกัก ไม่preview/grade/certifyจากไฟล์ยังไม่ผ่าน                              |
| P38-16   | checksum batchล็อก/import retry/ACKlost/workerrestart/notification dedupe                 | receiptเดิม score/draft/outboxไม่เพิ่ม ผลcertifyไม่publishเอง                        |
| P38-17   | mismatchUIไทย/keyboard/filters/pagination/fieldlabels/4viewport                           | focus/errors/empty state/สถานะใช้ได้ ไม่มีชื่อ/คะแนนในlogหรือpubliccache             |
| P38-18   | manifests nonempty/typedFK/source provenance/HTML-RSC-cache/privatefiles/retention        | หลักฐานraw→accepted→calculated→certifiedครบ ไม่มีpublicPII/gradeหรือhistoryหาย       |

เกณฑ์38-01ผูกP38-01–05/08/10/12; เกณฑ์38-02ผูกP38-06/11/18 ทั้งสองเกณฑ์และทุกP38 **BLOCKED / NOT RUN** ตัวอย่างDecimalหรือเอกสารไม่พิสูจน์grading serviceทำงาน

## 7 Versions คำสั่ง และผลจริง

app/schema0.6.0 Prisma7.10.0 Next16.3.8 pnpm11.28.2 lockfile9 core19models/migration1 `20261003130000_core_foundation` SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่เปลี่ยน logical04ยัง128tablesProposal ไม่เพิ่มpackage/schema/migration/seed/runtime/worker ไม่แตะproduction

รอบ38อ่านrepository/Pythoninventoryจริง requiredscore-seat-auth models16ขาด modules05/09มีREADMEเท่านั้น DockerCLI/socketไม่มี loopback5432/5546ConnectionRefusedError `corepack pnpm db:test` exit1safeerrorไม่แยกenv/connection ไม่เดาสาเหตุย่อย DB-06/Q027และDOCKER-05/Q026ยังเปิด

ไม่รันtypecheck/lint/build/rootunit/SQLWASM/nativegrading/API/workerbusiness/browser/P38ในรอบ38 ไม่มีscorefile/acceptedscore/certifiedresult/UIจริง ไม่ใช้ผลบทก่อนหรือabsenceoftablesเป็นPASS ต้องผ่าน37และต้นทางก่อนimplementation38/acceptance บท39ยังไม่เริ่ม ไม่เดาขอบเขต ไม่push/deploy

## 8 คำสั่งและผลตรวจเอกสารรอบ38

```bash
corepack pnpm db:test
corepack pnpm exec prettier --ignore-path /dev/null --check docs/GRADING_RULES.md docs/SCORE_IMPORT_REVIEW.md docs/RESULT_CERTIFICATION.md src/modules/exams/README.md src/modules/exam-imports/README.md
git diff --check
git diff --cached --check
corepack pnpm secrets:check
```

db:test exit1ตามหัวข้อ7 ส่วนPrettier/whitespace/secretscheckผ่านตามขอบเขตตัวตรวจ Pythoninlineตรวจ K38-01–08/P38-01–18/I38-01–07/C38-01–06, 9mismatchcodes/6lifecycle states/4ชั้นคะแนน, 40local linksใน3สัญญาใหม่และ2README, traceabilityหัวข้อ32, DEC-160–163, versionheaders4ไฟล์ และ9changedfilesผ่าน ตรวจcore19models/migration1/checksumและschema/seed/package/lock/logical04/workerไม่เปลี่ยนผ่าน

เป็นdocument/inventorycheck ไม่ใช่execution18กรณีP38หรือตัวอย่างgrading ไม่มีคะแนนที่ตรวจรับ/ผลรับรอง/manifestจริงให้recompute ทั้งสองเกณฑ์ยังBLOCKED ต้องnative/API/worker/UIและfixture executionก่อนรับรอง
