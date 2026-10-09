# รายงานความก้าวหน้า pre–post — บท 28

รุ่น0.1 | 4 ตุลาคม 2569 | **Proposal / BLOCKED — ยังไม่มี learning report ที่ใช้งานจริง**

อ่าน [ASSESSMENT_RULES](ASSESSMENT_RULES.md), [LEARNING_FLOW](LEARNING_FLOW.md), [PRETEST_FLOW](PRETEST_FLOW.md) และ [LEARNING_CONTENT_POLICY](LEARNING_CONTENT_POLICY.md) ทั้งหมดส่วนdomainยังไม่ผ่าน ไม่มีpairedattempt/result/teacherassignment/report/exportservicesจริง ข้อมูลรายงานตัวอย่างเชิงโครงนี้ไม่ใช่ข้อมูลผู้เรียนหรือผลวิจัยจริง

## 1 การจับคู่และจำนวนครั้ง

PairRecordเสนอเก็บverifiedenrollment/curriculum/group, pre_attempt_id/post_attempt_id, pre_result_revision_id/post_result_revision_id, comparison_spec_version_id, pairing_policy_version_id, mode/comparability_status/reasoncode, report_revision/recorded_at/hash และsource/evidence refs FK/transactionตรวจทั้งสองattemptเป็นเจ้าของ/contextเดียวกันและphase PRE/POSTถูก ไม่มีจับคู่คนละคน/หลักสูตรเพราะคะแนนเหมือนกัน

Pairselectionต้องconfigurationมีรุ่นรับรอง เช่นโอกาสใดเป็นbaselineและpostที่ใช้เปรียบเทียบ **ยังไม่เลือกfirst/latest/bestเป็นค่าเริ่มต้นเอง** แสดงattempt/ผลรุ่นที่เลือกและจำนวนeligible/missing/withdrawnในรายงานที่ได้รับgrant การเลือกbestscoreเองทำให้ความหมายreportเปลี่ยน ไม่ใช้clientเลือกคู่เพื่อเลี่ยงpolicy

จำนวนครั้งทำซ้ำแยกPRE/POSTและนิยามstarted/submitted/graded/certifiedตามpolicy นับunique serveropportunity/attempt/receiptที่acceptedเท่านั้น ไม่เพิ่มจากreload/retry/duplicatejob Draft/expired/cancelledแสดงแยกตามนิยาม ไม่ถือทุกครั้งเป็นคะแนนfinalหรือเลือกค่าที่ดีขึ้นมาปิดค่าที่ลดลง

PairRecord/reportเดิมpinresult revisionsและcomparisonpolicy ถ้ามีregrade/review/withdrawalสร้างreportrevisionใหม่อ้างต้นทาง ไม่refreshรายงานปีเก่าให้กลายเป็นคะแนนล่าสุดโดยไม่ระบุcurrentversion ผู้ใช้ต้องมีสิทธิ์ปัจจุบันก่อนอ่านoldreportหรือdownload

## 2 ส่วนต่างคะแนนและหัวข้อ

| ช่องเสนอ             | วิธีคำนวณ/เงื่อนไข                                                                                            | ถ้าขาดเงื่อนไข                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| pre_score/post_score | exactscore/maxscoreจากresultrevisionที่policyอนุญาต พร้อมraw/certified/pendinglabels                          | แสดงรอตรวจ/ยังไม่มีผล ไม่ใช้0แทนNULL                                                               |
| raw_delta            | post_score − pre_score เมื่อsame comparable-scale/maxscore/weight และeligiblefinalnessตามspec                 | NOT_COMPARABLE ไม่แสดงตัวเลขdeltaปลอม                                                              |
| normalized_delta_pp  | 100×post_score/post_max − 100×pre_score/pre_max เมื่อspecอนุญาตและmax>0ทั้งคู่ ใช้exactdecimal/roundingpolicy | denominator0/unknown/scaleไม่รับรองให้notcomputable ไม่NaN; การหารคะแนนเต็มเองไม่พิสูจน์เทียบเคียง |
| topic_progress       | TopicMapping/coverage/weight/scorepolicyที่ตรึงของแต่ละattemptและcomparisonmapที่รับรอง                       | ไม่วัดหรือรอตรวจให้insufficientevidence ไม่labelหัวข้ออ่อน/ดีขึ้นจาก0หรือจากtopicsคนละcoverage     |
| retake_count         | distincteligibleopportunitiesตามนิยามPRE/POSTที่ตรึง                                                          | แสดงนิยาม/ข้อจำกัดของmissingdata ไม่ใช้requestcount                                                |

ppคือส่วนต่างจุดร้อยละ ไม่ใช่เปอร์เซ็นต์เพิ่มขึ้นสัมพัทธ์จากbaseline ไม่คำนวณrelativegainจากpre_score0หรือใช้ป้ายที่ทำให้ตีความผิด ยังไม่มีpolicyเลือกmetric/precision/thresholdการดีขึ้นที่รับรอง Q007/Q024

ทุกcomparisonแสดงSAME_ITEMSหรือCOMPARABLE_ITEMSและversions/ข้อจำกัดตามASSESSMENT_RULES ถ้ายังNOT_VERIFIEDให้คะแนนแยก/ข้อความ“ยังเปรียบเทียบไม่ได้” การเปลี่ยนคะแนนสองครั้งเป็นเพียงความต่างที่สังเกตตามเงื่อนไข ไม่สรุปว่าเกิดจากบทเรียนเชิงเหตุ ไม่สร้างeffectsize/p-valueหรือข้อสรุปวิจัยจากสองคะแนนในบทนี้

## 3 สิทธิ์รายบุคคลและรายงานรวม

ผู้เรียนดูเฉพาะselfผ่านUser-Person bindingที่ยืนยันแล้ว ครูต้องcurrentreport-read/exportgrantและassignmentผู้เรียน/กลุ่ม/วิชา/องค์กร/ช่วงเวลาที่รับรอง ไม่ใช้ผู้สอนอยู่จังหวัดเดียวกันเป็นสิทธิ์ดูทุกคน หรือใช้roleชื่อครูให้joinทั้งฐาน ก่อนquery/count/facet/pair/result/feedbackต้องscope/fieldpolicyผ่าน

รายงานรายคน/assignmentที่มีgrantเป็นprivateไม่ได้แปลว่าเผยแพร่aggregateต่อได้ Aggregateต้องpurpose/audience/groupdefinition/cohort/timewindow/approvedprivacy_policy_version และminimumgroup/suppression rulesที่ownerรับรอง หากยังไม่มีนโยบายให้denyaggregate ไม่มีthresholdเลขที่ผู้พัฒนาตั้งเองและไม่แสดง0คนแทนsuppressed

ป้องกันกลุ่มเล็กทั้งrowcountและdistinctpersons/pairedeligiblecontributors ไม่ให้คนเดียวทำหลายattemptทำgroupดูใหญ่ ต้องตรวจfilter/เวลา/สังกัด/topic/retake subgroup และผลรวม/ส่วนย่อยที่อาจใช้ลบกันหาค่าของกลุ่มที่ซ่อนไว้ ไม่เปิดtotal/average/delta/min-maxหรือcountที่ทำให้deriveข้อมูล suppressedกลับมาได้

complementary suppression/query restrictions/approvedcohorts/rounding/การเข้าถึงซ้ำและเวลารายงานเป็นpolicyที่ต้องออกแบบและทดสอบ leakageจริง การซ่อนcellเล็กอย่างเดียวไม่ถือปลอดภัยจากการเทียบหลายquery รายงานที่ต้องปิดให้ใช้safe“ไม่แสดงตามนโยบาย”โดยไม่คืนtruecountผ่านmetadata/error/exportหรือdownload

อ้างอิงแนวคิดความเสี่ยง: [ONS — Policy on protecting confidentiality in tables of birth and death statistics](https://www.ons.gov.uk/methodology/methodologytopicsandstatisticalconcepts/disclosurecontrol/policyonprotectingconfidentialityintablesofbirthanddeathstatistics) ตรวจอ่าน 4 ตุลาคม 2569 อธิบายว่าค่าที่ซ่อนอาจคำนวณคืนจากยอดรวม หรือจากการเปรียบเทียบตารางหลายชุดได้ จึงต้องพิจารณา secondary suppression และ differencing แยกกัน ใช้เป็นข้อมูลประกอบการออกแบบเท่านั้น เอกสารนั้นมีขอบเขตสถิติการเกิดและเสียชีวิตในอังกฤษและเวลส์ ไม่ใช่นโยบายไทยหรือเกณฑ์จำนวนขั้นต่ำของโครงการนี้ ค่า threshold และวิธีควบคุมรายงานยัง TO VERIFY ตาม Q008/Q025/Q016

Frontend/CSV/print/chart/tooltips/accessibletable/API/exportjobs/downloadต้องpolicyเดียวกัน Actorรีเควสต์exportแล้วยังต้องgrant ณ workerและเวลาdownload/stream ไม่ใส่รายงานส่วนตัวในpublicHTML/RSC/cache/static assets/progresspublicDTO ค่าrawคำตอบ/key/seed/hiddenrubric/sourceobjectkeyไม่ออกreport

## 4 เส้นทางและprojectionsเสนอ — ยังไม่มีจริง

| Route/commandเสนอ                                | บริการและเงื่อนไข                                                                                                       |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| POST /api/learning/posttests/start               | sharedAttempt.start POST ใช้guard27/opportunity/pins/retry/time26และcomparisonmapping28 ไม่มีPOSTengineอีกชุด           |
| POST /api/learning/attempts/{attempt_ref}/submit | sharedAttempt.submit snapshot/CAS/receipt26→objectivegraderหรือmanualoutbox ตามชนิด                                     |
| GET /api/learning/attempts/{attempt_ref}/result  | practiceResult.read self/assignedteacher+resultstatus/feedbackpolicy; no-store ไม่มีkey/rawanswersevidenceทั้งหมด       |
| POST /api/learning/grading/{grading_ref}/review  | manualGrading.record/check currentgrader/checkerassignment/rubric/expectedrevision/makerchecker; learnerเรียกdeny       |
| GET /api/learning/reports/pre-post               | learningReport.read pairing/comparability/currentrowfieldgrant; learnerself ครูเฉพาะassignment                          |
| POST /api/learning/reports/aggregate/export      | learningReport.export currentexport+approvedaggregateprivacy/dedupjob privatefilegateway; policyขาดdenyไม่defaultpublic |

LearnerReportDTOเสนอ safegroup/phase/attemptordinal/score/maxscore/resultstatus/comparisonlabel/allowedtopicrecommendations/retakedefinition/labelpractice ไม่มีstudent-person detailsของคนอื่น TeacherReportDTOเพิ่มเฉพาะrosterfieldsที่ได้รับgrant ไม่spread PersonPrivate AggregatedDTOผ่านsuppressionก่อนserialize/plot/tooltip ไม่มีpairIDs/ชื่อหรือsmallcellhiddenvaluesเก็บในJSแล้วซ่อนบนจอ

401/403/hidden404/409revisionตามบริการกลาง Errorต้องไม่เผยstudentexistence/คะแนนนอกgrant CSVtextsafeไม่executeสูตรและprivatefilesผ่านscan/ACLตาม10 Queue/receipt/audit/outboxใช้11 ไม่สร้างexportengine/emailอีกรอบใน28 Devไม่ส่งreportออกนอกsink

## 5 แผนตรวจรับ — ทั้งหมด NOT RUN

| Case   | ทำซ้ำเมื่อ27/foundationพร้อม                                                                    | ผลที่ต้องassert                                                                                   |
| ------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| P28-01 | ทั้ง9กลุ่ม POSTstartข้ามPRE/requiredlesson/contextและretryหลายtab                               | guard27 denyหรือcanonicalopportunity/pinsถูก ไม่เริ่มซ้ำ                                          |
| P28-02 | objectivefinalinput/key/weight/roundingpolicyเดิม replayหลังCMSv2/withdraw                      | itemscore/total/runreceipt/hashเดิมตามpinnedpolicy Currentwithdrawal/rightsยังบังคับไม่joinlatest |
| P28-03 | แก้serveralgorithm/rounding/keyหรือclientscore/hash/clock/submittedflag                         | clientdeny policyใหม่เป็นrevision/evidence ไม่แก้raw/certifiedต้นฉบับเงียบๆ                       |
| P28-04 | writingqueue/rubric/grader assignment/ผู้เรียนgradeเอง/creatorcertifyตนเอง                      | awaitingmanualไม่0 scope/rubric/makercheckerdeny rawกับcertifiedแยก                               |
| P28-05 | queue crash/commitackหาย/lease/revoke/gradingreplyrace/retry                                    | domain/score/receipt/audit/outbox/effectdedup currentauthorityไม่ใช้สิทธิ์เก่า                    |
| P28-06 | SAME_ITEMSsamecodeต่างversion/multiset/weights และCOMPARABLEต่างcoverage/noevidence             | mode/statusถูก ไม่เทียบเพราะชื่อหรือmaxscoreเท่ากันอย่างเดียว                                     |
| P28-07 | pairingคนอื่น/หลักสูตรอื่น/first-latest-bestไม่ได้config/retake/regrade/partial                 | deny/NOT_VERIFIEDหรือpinnedPairRecord ไม่เลือกดีที่สุดเอง countretryไม่เพิ่ม                      |
| P28-08 | rawdelta/normalizedpp/score0/max0/no-topicdata/mappingoverlap/pendingwriting                    | exactmetric/null/statusถูก ไม่มีNaN/doublecount/ดีขึ้นจากmissing0 ไม่มีcausalclaim                |
| P28-09 | learnerself/teacherassigned-unassigned/timeexpired/suspended IDbodyqueryexport                  | currentrow/fieldscopedenyทุกช่อง ไม่เปิดscore/roster/privateexistsนอกgrant                        |
| P28-10 | smallcohort/distinctperson/repeatedattempts/filter/total-subtotal/complementaryquery/timewindow | suppressedก่อนDTO ไม่derivehiddenvaluesหรือcountจากUI/API/CSV/tooltips/reportmetadata             |
| P28-11 | aggregatepolicyไม่พร้อม/withdrawgrantหลังrequestjob/download/publiccache                        | denyaggregate/job/download currentpolicy ไม่มีsmallcell/privateHTML/RSC/JS/staticleaks            |
| P28-12 | feedbackก่อน/หลังsubmit/raw/certified/officialembargoและExplanationcache                        | beforeไม่มีkey หลังต้องowner/releasepolicy ไม่keytableทั้งหมด/privatefeedbackpublic               |
| P28-13 | practicegrade/export/import/event spoof/privilegedRPCพยายามเขียนระบบ5                           | officialtables/consumer/effectsไม่เปลี่ยน DBcapabilitydeny ไม่officiallabelในreport               |
| P28-14 | correction/certification/resultwithdraw/oldreportdownload/reviewครั้งใหม่                       | revisionต้นทางยังตรวจได้ currentgrant/retentionใช้จริง ไม่เปลี่ยนoldPairRecord/officialresults    |

executionหลักฐานต้องprivate: source/migration/fixture/pins/algorithm/policy/actor/time/actualscoreassert/faultpoint/receipt/effectcounts/officialtablemanifestก่อนหลังและprivacyqueryชุดทดสอบ ห้ามpublishkey/รายชื่อ/คำตอบหรือsmallcellcanaryจริงบนrepo

## 6 Gate, versionsและข้อค้าง

เกณฑ์ตรวจซ้ำคะแนนเดิมหลังCMSเปลี่ยนKey **BLOCKED / NOT RUN** เกณฑ์ไม่มีคะแนนฝึกเป็นผลทางการ5 **BLOCKED / NOT RUN** ไม่ใช้ความว่างของofficialtables/ไม่มีAPI/moduleเป็นหลักฐานว่าnegativewriteหรือreportconsumerผ่าน

schema/app0.6.0 Prisma7.10.0 Next16.3.8 core19models/213scalarfields/migration1ไม่เปลี่ยน ไม่มีposttest/result/report/worker/aggregateprivacy runtimeหรือexecutabletests Q007/Q024ต้องcomparison/rubric/score-rounding/pairselection/retake/certification/naturalkeys Q005/Q006ต้องgrader/checkerauthority Q008/Q025/Q016ต้องsmallgroup/suppression/purpose/privatefeedback/retention Q023/Q011ต้องDAL/RLS/limitedwrite/queue/grant/consumernegativeจริง

ต้องปิด27และdependencyเดิมก่อนimplementation28 แล้วรันP28-01–14 ไม่มีข้อมูลจริง/productionเปลี่ยน ไม่เลื่อนไป29จากผลเอกสาร

## 7 ผลตรวจจริงในรอบบท 28

| คำสั่งหรือการตรวจ                                                                                                                              | ผลจริง                                                                                                                                             | ขอบเขตหลักฐาน                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Python inline ตรวจตาราง contract, routes, case IDs, links และ inventory                                                                        | PASS: 6 concepts ที่เสนอ, 6 routes ที่เสนอ, 14 case IDs ไม่ซ้ำ, 18 local links มีไฟล์ปลายทาง                                                       | ตรวจเอกสารและไฟล์ ไม่ได้เรียก endpoint หรือรัน P28                                                 |
| ตรวจ schema/package/lock/migration ด้วย Python                                                                                                 | PASS: 19 models / 213 scalar fields / migration 1; checksumเดิม; app 0.6.0 / Prisma 7.10.0 / Next 16.3.8 / lockfile 9; learning มี README เท่านั้น | รอบแรกตัวนับ regex ไม่นับชนิด scalar ที่ท้ายบรรทัด จึงแก้ parser แล้วตรวจผ่าน ไม่มี schema เปลี่ยน |
| `corepack pnpm exec prettier --ignore-path /dev/null --check docs/ASSESSMENT_RULES.md docs/LEARNING_REPORTS.md src/modules/learning/README.md` | PASS                                                                                                                                               | รูปแบบเอกสารสามไฟล์นี้                                                                             |
| `git diff --check`                                                                                                                             | PASS                                                                                                                                               | ไม่มี whitespace errors ใน diff ที่ตรวจ                                                            |
| `corepack pnpm secrets:check`                                                                                                                  | PASS                                                                                                                                               | ตรวจเฉพาะรูปแบบ secret ที่ script รองรับและไฟล์ที่ Git เห็น ไม่ใช่การรับรองว่าไม่มี secret ทุกชนิด |
| unit / lint / typecheck / build / native DB / API / browser / worker / P28-01–14                                                               | NOT RUN                                                                                                                                            | ไม่มี runtime เปลี่ยนและ prerequisite27 ยังไม่ผ่าน ไม่ใช้ผล starter เดิมแทนเกณฑ์บท 28              |

Migration เดิม: `20261003130000_core_foundation` SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่มี migration/seed ใหม่ในบทนี้ เอกสารสองไฟล์นี้ไม่ทำให้ posttest หรือรายงานใช้งานได้
