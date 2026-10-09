# กรณีตรวจรับ dry run — บท61

รุ่น0.1 | 9 ตุลาคม 2569 (2026-10-09) | **PLAN_ONLY / ทุกP61 NOT RUN**

อ่าน [staging/service contract](../../docs/IMPORT_STAGING_DRY_RUN.md), [codecatalog](../../docs/IMPORT_VALIDATION_CODES.md), [fixture/reference manifest](../fixtures/system09/validation-plan.json) และ [parser cases60](PARSING_CASES.md) ชุดนี้ไม่ใช่executable tests ไม่มีAPI/UI/worker/eligibilityที่ใช้ตรวจรับจริง NativePostgreSQLยังไม่พร้อม

## เงื่อนไขและหลักฐานร่วม

TEST A/Bต่างสำนักกับcurrentAuth/action/time/fieldscopeที่มีหลักฐาน Person/CandidateกลางTESTเดิมมีสองคนชื่อเหมือนแต่identityต่าง และคนหนึ่งมีhistoryหลายปี ไม่สร้างcandidateซ้ำเพื่อsetupcase ให้ใช้seedกลางเมื่อmodelsพร้อม Rawfilesต้องFileVersionprivate+CLEAN exacthash parser60READYครบ ไม่ใช้JSONclientเป็นparsedinputหรือServiceActorเป็นlogin

ทุกcaseเก็บimmutableinput/sourcehash+normalizeddigest/schema/rule/context/fact revision pins, servertime, authorization refs, HTTP/DB/workerผลและrow/cellของทุกissue ก่อนหลังเปรียบเทียบPerson/Enrollment/Candidate/Application/seat/score counts+rowversions/contenthash **เท่ากัน** success/error/retry/preview/export ไม่มีactualregistrymutationในบท61 Audit/staging/report/outboxเขียนได้ตามสิทธิ์ ไม่ถือtotalapplication0บนฐานว่างเป็นหลักฐานว่ากฎไม่write

ใช้12contextsคือ NK TRI/THO/EK stageNONE และ DS TRI/THO/EK × PRIMARY/SECONDARY/HIGHER ตรวจvalid/mismatchแต่ละcontextด้วยเอกสารและกฎDEMOที่ระบุชัด วันที่mock6–7ตุลาคม2569เป็นserver-testclockที่ควบคุมในisolatedtests ไม่ใช่registrationwindowจริง/clockclientหรือวันปีปัจจุบัน RuntimeOfficialต้องใช้sourceที่verifiedก่อนเสมอ

| รหัส   | Fixture/action                                                                                                | ผลที่ต้องตรวจจริง                                                                                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| P61-01 | validrowsทั้ง12contexts มีไทย/ต่างชาติ/ไม่มีเลขไทยตามpolicyที่กำหนด                                           | ตรวจครบทุกrow+remarks/runmanifest; registrycounts+versionsเดิมไม่มีPerson/Enrollment/Applicationใหม่                               |
| P61-02 | valid/invalid/exception/retry/preview/exportบนฐานเดิมมีคนและใบสมัครจริงสมมติ                                  | DBdryrunprincipalไม่มีregistrywritegrants; commandattemptwriteถูกdeny;staging/auditเท่านั้น                                        |
| P61-03 | B5wrongorg/B6outscope/C7closed/J8-J9duplicate/header4wrongversion                                             | locatorsheet/physicalrow/field/column/cellถูกพร้อมcodesและวิธีแก้; noautomaticfix                                                  |
| P61-04 | headers/required/type/ambiguousdate/year/remarksinvalid10จาก59                                                | ตรวจทุกrowไม่หยุดที่errorแรก; dependentchecksBLOCKEDไม่PASS;ไม่เดาปี/schemaใหม่                                                    |
| P61-05 | row_idซ้ำ, sameverifiedidentity+offering+slotหลายแถวในfileและremarksชี้ผิด                                    | DUPLICATE_ROW_ID/IN_FILE/ORPHAN_REMARK;relatedownrowsครบ;ไม่รวมด้วยชื่อ                                                            |
| P61-06 | sameidentity+opportunityในactivependingbatchเดียว/คนละactor; failed/cancelled/superseded                      | DUPLICATE_PENDING_BATCHเฉพาะpolicyactive;currentvisibilityไม่มีforeignbatchid/count/name;noreservation                             |
| P61-07 | existingApplicationเว็บ/Excel samekey เปลี่ยนorg/center/channel/idempotencykey                                | DUPLICATE_APPLICATION/safeconflict; Candidate/ใบเดิมไม่upsert;ไม่มีrandomslotหลบduplicate                                          |
| P61-08 | คนเดิมปี/ประเภท/offeringที่allowed กับretake/slotที่clientสร้างเอง                                            | allowedhistoryไม่personduplicate; slot/exclusivityจากservice05เท่านั้น policyunknownNOT_READY                                      |
| P61-09 | สองคนชื่อไทยคล้าย/ชื่อเหมือนแต่distinctverifiedidentities; ambiguousidentity                                  | ไม่merge/reusePersonจากชื่อ;warningไม่ยกเว้นidentityerror;ambiguousให้review                                                       |
| P61-10 | Thaiidentityผิดformat/checksum/policy; passportissuerต่าง;ไม่มีThaiID/evidenceverifiedและunverified           | sharedidentitypolicyใช้ทุกชนิด;noThaiIDrequiredทุกคน;checksumผ่านไม่identityapproval;ไม่แสดงrawforeignID                           |
| P61-11 | เลือกwrongAcademicYear/FiscalYear/ประเภทlevelstage/offering                                                   | CONTEXT_YEAR_MISMATCH/INVALID_GROUP,ไม่decodeปีจากfilenameหรือmixedcontext;12groupsแยกชัด                                          |
| P61-12 | สนามปิด/ยังไม่effectiveเปิด/รอบปิด/คำสั่งnotifyล่าช้า                                                         | CENTER_CLOSED/SESSION_CLOSEDตามeffectivequery/asof;ไม่เปิดจากprojectionstale/ย้ายผู้สมัครเงียบ                                     |
| P61-13 | beforeopen/exactopen/beforeclose/exactclose;clientclockปลอม                                                   | NOT_OPEN/CLOSEDตามserverrule36;unknownwindowNOT_READY;runexpiryไม่ขยายจากclient                                                    |
| P61-14 | priorqualification/stageผิด/มีเฉพาะคะแนนฝึก/รุ่นrulewithdrawn/TO_VERIFYOFFICIAL                               | INELIGIBLE/NOT_READY/FORM_NOT_VERIFIED;ไม่มีofficialeligibleจากค่าทดลอง/AI/practice                                                |
| P61-15 | evidenceขาด/PENDING/INFECTED/CLEANผิดperson/row/purpose/contentยังไม่ตรวจ                                     | REQUIRED/NOT_CLEAN/BINDING_MISMATCH/NOT_VERIFIEDตามช่องหลักฐาน;currentfileACLก่อนดูcontent                                         |
| P61-16 | wrongbatch/reportID/forgedpaginationcursor/downloadtargetและrevokegrantกลางงาน                                | denydefaultทุกroute/count/worker/download;ไม่มีPII/existence/foreigncountsผ่านissues                                               |
| P61-17 | raw+normalizedname/identity/formula-stringจากsourceและfieldpolicyไม่allow                                     | serverDTOmaskก่อนHTML/JS/tooltip/analytics/cache/export; rawยังprotectedและNFCleading0คงเดิม                                       |
| P61-18 | errorXLSXpayload =1+1,+1,-1,@SUM(1,1),tab/CR/LF/fullwidth/comma/quotes/newline/objectlikeformula              | typedstring+controlledstyles; XMLไม่มีf/external/macros/hiddenrawsheet;nativeopen-save-reopenไม่execute ไทย/zeroคงเดิม;CSVdisabled |
| P61-19 | ไฟล์V1→V2เปลี่ยนbytesแต่filenameเดิม หรือnormalizedrevisionเปลี่ยน                                            | checksum/genต่าง reportSTALEตรวจใหม่ sourceเดิมไม่แก้;newFileVersion/batchตาม60 ไม่reportV1serveV2                                 |
| P61-20 | เปลี่ยนtemplate/eligibility/identity/evidencepolicy/fieldvisibility versionแม้dataเดิม                        | STALEก่อนpreview/export/action; immutablemanifestเดิมยังตรวจได้ตามhistoricalACL                                                    |
| P61-21 | centerclose/orgmove/hierarchychange/priorresult/evidenceACLscanchange/application/pendingbatchsetเพิ่มหลังrun | factrevisionrecheckทำstaleแม้TTLยังอยู่/eventแจ้งล่าช้า;ไม่failopenเมื่อduplicatequeryล้ม                                          |
| P61-22 | exactexpiry/ถัดboundary/expiredassignment/serverclock; rereadartifactเก่า                                     | REPORT_EXPIREDหรือdenyตามcurrentaccess ไม่มีclientขยายTTL/ย้อนdate;historicalviewไม่activegrant                                    |
| P61-23 | keyเดิมsubmitdryrun2ครั้ง/workerduplicate/CASworkeroldgenerationผลช้า/payloadต่าง                             | run/effectเดียวสำหรับkey/payloadเดิม;409เมื่อpayloadต่าง;activegenerationไม่ทับกัน;oldhistoryอยู่                                  |
| P61-24 | DBoutage/workerabortก่อนครบrows/leaseexpire/failedpublishแล้วretry                                            | VALIDATION_INCOMPLETE/failedgenerationไม่มีpartialREADY;retryไม่duplicateissues;registryunchanged                                  |
| P61-25 | errors>0+warningsack/unknownchecks/errors0แต่checkedrowsไม่ครบ/notesAPPROVE_NOW                               | ackไม่waiveerror/freshness/identity;noREADYจากpartial;notesไม่คำสั่งmutation/approval                                              |
| P61-26 | previewfilter/cursor/page50-100/emptyrow/หลายsheetแถว5เหมือนกัน keyboard375/768/1024/1440                     | count/page/locatorsครบไม่ชนkey;labels/focus/status/error-summaryใช้ได้ไม่สีอย่างเดียว;ไม่commitendpointใน61                        |

## การตรวจรับและคำสั่ง

ยังไม่มี `test:validation` หรือrunnerระบบ09 ไม่เสนอคำสั่งruntimeที่ยังไม่มี `corepack pnpm db:test` รอบ61exit1เป็นหลักฐานprerequisiteไม่พร้อม ไม่ใช่P61รันแล้วfail JSON/referencechecksum/docchecksไม่แทนnative integration/security/eligibility/export/browserUAT

61-01ต้องผ่านP61-01/02/05–10/19–25ด้วยDBrowversionsจริงเพื่อพิสูจน์noProductionRegistryWrites และ61-02ผ่านP61-03–17/26พร้อมผิดสำนัก/scope/สนามปิด/คนซ้ำ/รุ่นผิดและlocatorที่แก้ได้ ทั้งสองBLOCKED/NOT_RUN ต้องปิด60/36และบริการกลางก่อน implementationตามแผนที่อนุมัติ ไม่เริ่ม62จากผลเอกสาร ไม่รับรองแบบ/identity/eligibilityทางการจากfixtureสมมติ
