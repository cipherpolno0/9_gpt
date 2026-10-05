# นำเข้าคะแนน staging และหน้าตรวจ mismatch — บท 38

รุ่น 0.1 | 5 ตุลาคม 2569 (2026-10-05) เวลาไทย | source `4e91fad` | **Proposal / BLOCKED — ไม่มี score import/parser/mismatch UI จริง**

ต่อ [GRADING_RULES](GRADING_RULES.md), [RESULT_CERTIFICATION](RESULT_CERTIFICATION.md), [SEAT_ALLOCATION](SEAT_ALLOCATION.md), [FORM_TEMPLATE_REGISTRY](FORM_TEMPLATE_REGISTRY.md) ใช้เอกสาร/upload/staging infrastructureร่วมกับระบบ9เมื่อพร้อม แต่score writerเป็นบริการระบบ5 ไม่Application importerหรือlearning03 service

## 1 Pipelineที่เสนอ

| ขั้น                     | Contract                                                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| I38-01 Upload            | currentimport action/scope/year-type-session-center-context จากserver; privatequarantine/idempotentupload/size-MIME-content-extension-scanก่อนparse                      |
| I38-02 Parse             | pinnedscoretemplate/machine-schema/parser version เก็บsourcefilehash/rawrow-cell-locatorอย่างจำกัด ไม่formula/macro/external links/encrypted file/ZIP expansionเกินเพดาน |
| I38-03 Expected set      | ตรึงeligible examiner roster/allocationrevision/application snapshot/SessionSubject inventory ณเวลาสอบและscopeที่รับรอง ไม่queryเลขลำพังทั่วประเทศ                       |
| I38-04 Match             | typed year/type/level/stage/center/namespace-seat/application-subject mapping; unresolved/ambiguous matchไม่เลือกคนจากชื่อคล้าย                                          |
| I38-05 Validate          | range/scale/units/status/essaygradingevidence/rule verified/expected completeness + duplicate/crossbatchตามbusinesskey ไม่commitacceptedscore                            |
| I38-06 Difference review | raw→normalized→previousaccepted/newscore diff+issue code+source/version/hash; checkerคนละmakerรับรองตรงbatch revision                                                    |
| I38-07 Lock/commit       | commandตรวจcurrentgrants/context/hash/revision/evidence/rule/rosterอีกครั้ง แล้วcanonical score batch+receipt/audit/outbox transactionตามRESULT_CERTIFICATION            |

Template registryหนึ่งชุดร่วม05/09 แต่purposeคะแนนต้องbinding/machine-schema/layout/versionที่รับรองเฉพาะ ไม่เอาแบบสมัครศ.1/2/3/5/6มาอนุมานเป็นแบบคะแนนหรือแบบศ.4/8 การรับไฟล์สำเร็จไม่อนุมัติคะแนนหรือประกาศผล

Raw row contract: upload/batch/parser/schema revisions, row/source locator, literalcell representations/private error refs, claimedcontextที่ยังไม่trusted, resolved typed IDs, normalizeddecimal/status/evidence refs, immutable rawhash/validationrevision/checkerdecision. แก้rowให้เพิ่มstagingrevisionและreviewใหม่ไม่overwriteต้นฉบับ หากแก้ไฟล์ต้นฉบับให้อัปโหลดFileVersionใหม่และตรึงแหล่งใหม่

## 2 Expected กับ actual ที่ต้องตรวจ

| Mismatch codeเสนอ        | นิยาม/การแก้                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| SEAT_NOT_FOUND           | ไม่พบallocationในroster/contextที่มีสิทธิ์ ณวันสอบ; block ไม่สร้างApplicantหรือSeatใหม่จากคะแนน                    |
| CONTEXT_MISMATCH         | year/type/session/center/level/stage/applicationไม่ตรง; แก้source/contextโดยrevisionและตรวจใหม่                    |
| SUBJECT_MISMATCH         | ไม่อยู่SessionSubject inventory/กฎของคนและรอบนั้น; block ไม่matchชื่อวิชาแบบfuzzy                                  |
| MISSING                  | expected keyที่ต้องมีไม่มีในactual; ไม่เติม0 ไม่มีapprovedabsence policyให้NOT_READY                               |
| EXTRA                    | actual keyอยู่นอกexpected set; ไม่dropเงียบ ๆ ไม่รวมผลหรือเปิดข้อมูลของอีกพื้นที่                                  |
| DUPLICATE                | canonicalrow keyซ้ำในrevisionหรือชนaccepted sourceที่นโยบายไม่ให้ซ้ำ; รายงานทั้งสองแหล่งในscope ไม่last-write-wins |
| SCORE_INVALID            | ช่วง/precision/format/scale/statusกำกวมหรือผิดrule; rejectedstagingไม่castแก้ให้ผ่าน                               |
| GRADING_EVIDENCE_PENDING | ข้อเขียน/กระทู้ขาดhuman grading/rule/evidenceที่ตรวจ; pendingไม่ปรนัยหรือAIทดแทน                                   |
| SOURCE_NOT_READY         | template/rule/roster/source/scan/adapterไม่พร้อม; block ไม่unknown=count0หรือverifiedจากclient                     |

Expected keyเสนอ `(exam_sitting_context, allocation_revision_id, session_subject_id, verified_component_key)` component keyมาจากruleเมื่อมีหลายส่วน ไม่UUIDสุ่มเพื่อหลบduplicate; หนึ่งfinalscoreต่อSubjectScore businessbindingที่รับรอง sourceหลายผู้ตรวจเป็นgradeevidenceไม่แปลว่าfinalscoreสองแถว

Compareในscopeเดียวกันทั้งexpected/actual ต้องมีsnapshot completeness/manifest/watermarkของrosterและsubjects ไม่เอาglobalรายชื่อทั้งหมดให้browserนับmissing เลขศูนย์นำหน้า/canonicalnumberตามกฎ37เป็นtext เมื่อมีamendment/เลขretiredหรือปีอื่นใช้history ณ exam sittingและsourceที่verified ไม่latestheadมาเปลี่ยนคนเจ้าของscore

coverageของbatchต้องระบุจากschema/policyที่รับรอง เช่นวิชาหรือส่วนของสนามที่มีอำนาจนำเข้า ไม่ถือทุกไฟล์ต้องเป็นทุกรายวิชาทั้งรอบ และไม่ให้clientลดexpected setจนmissingหาย การlockbatchใช้expected setตามcoverageที่ตรึง แต่การรับรองResultDraftต้องรวมaccepted batchesให้ครบทุกวิชาที่กฎผลสอบกำหนด พร้อมmanifest lineage ไม่รับรองคนที่ยังขาดคะแนนวิชาบังคับเพราะไฟล์หนึ่งครบแล้ว

การนำเข้าข้ามbatchที่เป็นการแก้ค่าต้องexplicitamendment/source lineage ไม่upsertทับคะแนนที่ล็อก หากครั้งแรกให้แสดงdiff“รายการใหม่” ส่วนแก้คะแนนแสดงpreviousaccepted revisionกับvalue/status/evidence/pinsเดิมครบตามfieldACL ไม่มีข้อมูลส่วนตัวเต็มในlogหรือerror

## 3 Scope และ provenance

file/template metadataที่ผู้ใช้กรอกเป็นinput ไม่proofว่าเป็นคะแนนทางการ Serverresolve upload owner/import kind/currentaccount/grant/contextและตรวจallowed source workflow โมดูล3/eventlearning.* ไม่มีcapabilityเขียนscore05 แม้เปลี่ยนsource_kindในbody/file headerก็ไม่ได้สิทธิ์

ทุกrow/report/count/detail/preview/download/worker/commitตรวจcurrentaction-resource-scope-fieldpolicy ใช้service05ร่วมทุกช่องทาง Unknownหรือobjectนอกscopeใช้safeerrorไม่เปิดว่าเลข/คะแนนเพื่อนมีอยู่ Filename/cells/learner namesไม่ใส่telemetry/auditเต็ม ตัวcheckerอ่านหลักฐานด้วยgatewayที่จะพัฒนาต่อ ไม่objectkeyหรือpublic URL

## 4 หน้าตรวจที่เสนอ — ยังไม่สร้าง

ให้เลือกcontextปี/ประเภท/รอบ/สนาม/ระดับ/ช่วงชั้นจากสิทธิ์ server แสดงbatch/source/parser/schema/hash/revision/status พร้อมตารางissue filters/missing-extra-duplicate/diff/วิธีแก้และเลขsource rowตามscope อนุญาตexpectedrevision correction/resume เฉพาะstateที่รับรอง มีปุ่มส่งตรวจ/ส่งกลับ/lockตามgrantจริง

keyboard/ThaiIME/pagination/labels/error summary/aria-describedby/focus/currentrevision conflict/empty state/status textไม่สีอย่างเดียว และ375/768/1024/1440ต้องbrowserจริง ไฟล์raw/score/ชื่อไม่publicHTML/RSC/cache/static assets fieldที่ไม่ได้สิทธิ์ไม่ส่งแล้วซ่อนคอลัมน์

## 5 Gate และตรวจรับ

P38-01–10/14–18ในGRADING_RULESเป็นแผน ยังไม่มีstaging/rawfile/parser/manifest/acceptedscore/UI/service/API/workerจริง ExcelJSยังไม่อยู่package/lockจากบท36 และบริการไฟล์10ยังBLOCKED ไม่เพิ่มparser/packageหรือuploadระบบใหม่ในบท38

ทั้งสองเกณฑ์38ยังBLOCKED ต้องผ่าน37และต้นทางก่อนimplementation บท39ยังไม่เริ่ม ไม่มีschema/migration/runtimeใหม่
