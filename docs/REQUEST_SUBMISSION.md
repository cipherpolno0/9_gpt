# สัญญาบันทึกร่าง ส่งเรื่อง และ tracking — บท 31

รุ่น 0.1 | 4 ตุลาคม 2569 | sourceก่อนแก้ `532aa8c` | **Proposal / BLOCKED — ยังไม่มี server actions/services/tracking**

อ่าน [REQUEST_WIZARD](REQUEST_WIZARD.md), [ORG_CENTER_REQUESTS](ORG_CENTER_REQUESTS.md), [ORG_CENTER_REQUEST_SCHEMA](ORG_CENTER_REQUEST_SCHEMA.md), [WORKFLOW_ENGINE](WORKFLOW_ENGINE.md), [FOUNDATION_ACCEPTANCE](FOUNDATION_ACCEPTANCE.md) และ [ADR002](ADR/002-core-database.md) การออกแบบนี้ไม่มีPrisma models/FKหรือendpointจริง บท30ยังไม่ผ่าน

## 1 Action/service boundaries เสนอ

ทุกAction/RouteHandler/workerเรียกserviceกลางที่ตรวจcurrentaccount/action/typedresource/scope/assignment/fieldACL ไม่เชื่อrole/owner/org_id/target_id/configversionจากclient การอ่านlist/targetoptions/counts/facets/resume/evidence/status/notificationต้องpolicyเดียวกัน DTOallowlistไม่serializeraw RequestVersion/PersonPrivate/fileobjectkeyหรือreasonที่ไม่มีสิทธิ์

| Command ref | action/serviceเสนอ                       | payloadที่ยอมให้เสนอ                                                    | serverตรวจ/ผลตอบกลับ                                                                                                                      |
| ----------- | ---------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| A31-01      | listOwnDrafts / requestDraft.list        | cursor/filterที่allowlist                                               | currentreadgrantก่อนquery/count/facet; safepaginatedlist ไม่clientowner filterเป็นauthority                                               |
| A31-02      | beginDraft / requestDraft.begin          | server-issuedintent_ref/operation_id/typecontext                        | currentcreategrant; unique(actor,intent_ref)ตามapprovedintentpolicy; atomicheader+typedrevision+receipt; ไม่createจากGETหรือretry         |
| A31-03      | resumeDraft / requestDraft.read          | request_ref                                                             | owner/delegatedcurrentread/editและfieldACL; confirmedrevision/checkpoint/typedpayloadsafe; ไม่ถือcreatorUUIDเป็นgrantตลอดไป               |
| A31-04      | saveDraft / requestDraft.save            | request_ref/base_revision/operation_id/typedpatch                       | CASกับparentlock/operationfingerprint/currentdraftหรือreturnedcorrection; appendrevision/receipt; stale409ไม่มีpartialwrites              |
| A31-05      | attachEvidence / requestDraft.evidence   | request_ref/base_revision/operation_id/FileVersion refs/requirementrefs | request edit + file owner/resource/ACL/type/scanstatus; saveเป็นrevision; pendingไม่previewหรือsubmit Fileuploadใช้10เท่านั้น             |
| A31-06      | reviewDraft / requestDraft.validate      | request_ref/expected_revision                                           | currentbindings/form-rule/evidence/fieldrequirements/conflict precheck; SafeIssueDTOและreviewmanifest; ไม่grantถาวรเพื่อsubmit            |
| A31-07      | submitRequest / requestSubmission.submit | request_ref/expected_revision/operation_id/reviewmanifest ref           | serverderive allstate/context ปิดsealedsnapshot/checkcurrentconditions ในtransaction; WorkflowInstance/receipt/tracking/outboxตามด้านล่าง |
| A31-08      | trackRequest / requestTracking.read      | tracking_ref/paginationhistoryที่allowlist                              | signed-incurrentrequestread/fieldscope; trackingrefไม่capability; safeprojection/notificationlinksใช้policyเดียวกัน                       |

ชื่อactions/routesเป็นข้อเสนอ ยังไม่มีไฟล์หรือคำสั่งรัน เมื่อสร้างตามNext16.3.8ต้องใช้APIรุ่นที่ล็อกและsharedformcontrolsที่09ส่งมอบ ไม่เพิ่มbinaryuploadaction/rate limiter/CSRF/sessionระบบใหม่เป็นอีกสำเนาใน31 ต้องต่อส่วนกลางที่ได้รับตรวจรับจริง

ตรวจอ่านเอกสารติดตั้งจริง `node_modules/next/dist/docs/01-app/02-guides/server-actions.md` และ `data-security.md` วันที่4ตุลาคม2569: actionที่ใช้ต้องถือเป็นentrypointที่เรียกตรงได้ ตรวจauthz/input/returnDTOในactionและservice; page gateไม่ให้สิทธิ์action อาศัยframeworkorigin/CSRF/bodylimitsตามรุ่นและapprovedproxyconfigร่วมsession08 ไม่ตั้งallowedOriginswildcardเพื่อแก้ส่งไม่ผ่าน หากมีRouteHandlerต้องกำหนดprotectionsที่สอดคล้องไม่สมมติว่าได้ทั้งหมดจากform

## 2 Revision และ idempotency คนละหน้าที่

revisionกันข้อมูลเก่าทับใหม่ ส่วนoperation receiptกันงานเดิมทำซ้ำ เมื่อsaveACKหาย key/payloadเดิมต้องคืนacceptedreceiptภายใต้currentreadgrant แม้currentdraftrevisionจะเดินไปอีกค่า ไม่กลับไปmutateเก่าซ้ำ แต่keyเดิมpayloadต่างต้องconflict ไม่ให้เปลี่ยนkeyเพื่อเลี่ยงCAS

OperationReceiptกลาง11ผูก actor/request-or-draftintent/command/payloadfingerprint/acceptedversion/event refs uniqueตามnaturaloperationkeyและvalidatedpayloadcanonicalization ไม่logreason/body/files/token fingerprintคำนวณserverไม่client การเปลี่ยนkeyในsubmitยังต้องlive request/reviewcycle constraintsกันWorkflow/notificationซ้ำ

begin intentเป็นการเริ่มเรื่องโดยตั้งใจ ไม่dedupeทุกเรื่องบนtargetเดียวจนไม่สามารถยื่นคนละประเภทหรือคนละวันที่ตามrule เมื่อresume/returnedใช้existingrequestrefเสมอ ส่วนintentใหม่ต้องexplicitมีสิทธิ์และguardconflictingrequest30 ไม่autoเปิดnewheaderเมื่อ404/timeout

Draftrevisionที่serveracceptแล้ว/RequestVersionที่sealต้องมีprovenance/history ไม่แก้sealedrevisionใต้อำนาจapprovalเก่า Returnedcorrectionเพิ่มrevisionภายใต้headerเดิม การresubmitเพิ่มreview_cycleบนcanonicalWorkflowInstanceเดิมและตรึงsubmittedversionใหม่ เก็บStepDecisionsรอบก่อน แต่ไม่ใช้อนุมัติรุ่นใหม่ ไม่สร้างsecondworkflow/status source

แบบlogical04workflow_caseมีrequest_version/roundbinding ขณะที่11มีWorkflowInstance/review_cycle ต้องADR/dictionary/ERDให้หนึ่งownerและtypedbindingก่อนmigration31 ไม่แก้schemaคนละที่แล้วให้สองengineเดินคู่กัน

## 3 Completeness และ SafeIssueDTO

validationเดียวกับRequestTypeConfiguration/FormTemplateVersionที่pin แต่ตรวจeligibility/currentrulewithdrawalก่อนseal; draftpolicyยอมขาดบางช่องได้ ไม่ยอมunauthorizedtargetหรือunknownfields ผู้ร้องเปลี่ยนfamily/target/config/evidenceต้องinvalidate reviewmanifestและตรวจครบใหม่ตามpolicy ไม่มีlatestformfieldเปลี่ยนใต้snapshotโดยไม่แจ้ง

| Issue ref | reasoncodeเสนอ         | safeข้อความไทยตัวอย่าง                     | ผลที่ต้องบังคับ                                                              |
| --------- | ---------------------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| V31-01    | REQUIRED_FIELD         | “กรุณากรอกข้อมูลที่แบบคำขอนี้กำหนด”        | ผูกfieldpathที่allowlist/label ไม่คืนhiddenfieldหรือข้อมูลนอกscope           |
| V31-02    | TARGET_UNAVAILABLE     | “ไม่พบเป้าหมายที่คุณมีสิทธิ์ดำเนินการ”     | objectนอกscopeกับไม่พบใช้contractรูปแบบเดียวกัน ไม่ส่งชื่อองค์กรB            |
| V31-03    | CONTEXT_MISMATCH       | “ข้อมูลประเภทหรือรอบสอบไม่สอดคล้องกัน”     | typedFK/ExamType/session/year/OrganizationType/Locationbindingฝั่งserver     |
| V31-04    | EVIDENCE_NOT_READY     | “เอกสารยังไม่ผ่านเงื่อนไขก่อนส่ง”          | scan/type/size/ACL/currentFileVersion/requirementsจริง ไม่clientmarkclean    |
| V31-05    | REVISION_CONFLICT      | “ร่างมีรุ่นใหม่กว่า กรุณาตรวจทานอีกครั้ง”  | ไม่มีpartialsaveหรือmixedsnapshot; refreshภายใต้fieldgrant                   |
| V31-06    | POLICY_NOT_READY       | “ยังประเมินเงื่อนไขส่งเรื่องไม่ได้”        | rules/source/adapterที่จำเป็นขาดให้NOT_READY ไม่unknownเป็น0/ALLOW           |
| V31-07    | TARGET_PLAN_CONFLICT   | “ข้อเสนอมีเงื่อนไขขัดกับแผนที่ต้องตรวจสอบ” | canonicaltimelineguard30 ไม่เปิดreason/ชื่อผู้ร้องเรื่องอื่นผ่านerror        |
| V31-08    | EFFECTIVE_DATE_INVALID | “วันมีผลไม่ผ่านเงื่อนไขของคำขอนี้”         | Gregoriandate validation/pinnedwindow/Bangkokrule ไม่clientclock/วันพ.ศ.ในDB |

DTOเสนอ issue_code/allowedfield_path/localizedmessage/allowedrequiredstate/correlationref ไม่rawDBerror/stack/SQL/objectkey/formsourcecontents ทุกread/mutation errorต้องเคารพfieldgrant 401/403/hidden404/409/422/503หรือNOT_READYตามบริการกลางที่approved ไม่กำหนดว่าnativeRLSต้องตอบ403เสมอ

## 4 Submit transaction เสนอ

1. Resolve verifiedactor/session/currentgrantและrequestที่มีสิทธิ์ Lock request/currentdraft/typedtarget-plan guardตามorderร่วม30/11 ตรวจexpectedrevision/status draftหรือreturnedตามpolicyและreceiptเดิมที่acceptedแล้ว
2. Validate fields/type/FK/context/effective_on/form-rule/source-window/evidenceowner/FileVersion scanACL/targettimeline ตามcurrentpolicy หากreturnedให้ตรวจnewcycle/revisionโดยไม่ใช้decisionรอบก่อนและไม่แก้terminalstate
3. Seal typedRequestVersion/manifest/hashที่ตรวจจริง Bind workflowdefinition/rule/form/evidence pins snapshot ไม่รับclientcomplete=trueหรือhiddenpayloadhashเป็นคำรับรอง แก้fieldระหว่างtransactionต้องCASconflict/rollback
4. Firstsubmitสร้างWorkflowInstanceกลางพร้อมtypedrequest bindingและuniqueหนึ่งinstanceต่อrequestในfamilyนี้ Resubmitreturnedใช้instanceเดิมเพิ่มcycle/submittedsnapshotอย่างatomic Canonicalrequeststatusเป็นprojectionจากworkflowowner ไม่สร้างwritablestatusสองชุด
5. Firstsubmitออกtracking_refopaqueจากserver CSPRNGเสนอ32randombytesในformatที่approved แยกจากinternalrequest_code; unique tracking_refและstablebindingกับrequestเดียว ไม่มีลำดับปี/จังหวัด/ชื่อคนให้เดาง่าย Returnedresubmit/ทุกretryคงrefเดิม ไม่สร้างเลขใหม่จากคำสั่งเดิม
6. บันทึกOperationReceipt/auditและoutbox `request.submitted` ที่มีrequest/version/cycle/dedupekey/correlation/recipientbindingsปลอดภัยในtransactionเดียว ไม่ส่งnotificationก่อนcommit ไม่แก้Organization/ExamCenter/CenterSession/RoleAssignment/applicationตั้งแต่submit
7. commitแล้วค่อยคืนSafeSubmitReceipt(requestref/acceptedrevision/acceptedcycle/acceptedstatus/currentstatus/trackingref/correlation)ที่actorยังมีสิทธิ์อ่าน หากresponseหาย retryอ่านreceiptเดิมไม่sealedversion/workflow/outboxซ้ำ การlostACKไม่เปลี่ยนเป็นร่างใหม่

receipt ของรอบก่อนเป็นหลักฐานว่าเคยรับคำสั่ง ไม่ใช่สถานะปัจจุบัน หากเรื่องถูก returned/rejected หรือมี cycleใหม่แล้ว retry receiptเก่าต้องแสดง accepted_cycle/accepted_status แยก current_status ที่ผู้ใช้ยังมีสิทธิ์ดู UIห้ามใช้receiptเก่าเปลี่ยนreturnedกลับsubmittedหรือปลดล็อกข้อมูล New correctionต้องoperationใหม่/expectedrevisionของรอบใหม่

unique workflowbindingต้องDBenforceจริงไม่checktheninsert, tracking unique nullableก่อนfirstsubmitในChangeRequestเดิม ไม่สร้างทะเบียนtrackingอีกชุด สำหรับstep4 single-instance/cyclebindingและstep5 tracking_refยังต้องschemaADR/migrationใหม่พร้อมส่วนกลางและnative race tests บทนี้ไม่ได้เพิ่มcolumnหรือinstanceจริง

Notificationworkerกลาง11ตรวจrecipient/currentgrant/resourceACLและleaseทุกclaim/process/read ไม่ใส่fullreason/สถานที่ส่วนตัว/evidencecontentsในnotification; dedupekeyตามrequest/version/cycle/event/recipient ไม่หายเมื่อworkerหยุด devใช้sinkเท่านั้น Deliveryที่ล้มเหลวไม่rollbacksubmittedที่commitแล้ว outboxretry/deadletter/authorizedreplayใช้keyเดิม ไม่ส่งemailหรือข้อความภายนอกใน31

## 5 Tracking ref ไม่ใช่สิทธิ์อ่าน

เลขติดตามเป็นreferenceที่คาดเดายาก ไม่เป็นpassword/access token Default31เสนอsigned-intrackingเฉพาะrequestreadgrant; URL/history/evidence/exports/notificationยังตรวจaction/scope/fieldACLทุกครั้ง เมื่อgrantถอนเลขเดิมไม่เปิดข้อมูลของเรื่อง

หน้าpublicกลาง `/requests/track` ยังต้องpublication/trackingproof policyที่ยืนยัน ถ้ายังไม่มีให้ปิด/denyรายละเอียด ไม่ตอบprivateด้วยแค่tracking_ref ไม่ใช้วันเกิด/เบอร์โทรจากทะเบียนเป็นpasswordหรือสร้างloginอีกชุด หากอนาคตมีcapability token ต้องแยกpurpose/expiry/revocation/hash/ACL/retentionจากtracking_refและได้รับการรับรองก่อน ไม่ทำtokenในURLที่logหรือpubliccacheในบทนี้

อ้างอิง [OWASP IDOR Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html) ตรวจอ่าน4ตุลาคม2569: identifierที่คาดเดายากยังต้องobject-levelauthorization ตรวจโดยactorAสลับIDเป็นเรื่องของBครอบคลุมread/create/update/export/admin ทุกactionของwizard/trackingนี้ยังไม่มีผลทดสอบจริง

## 6 แผนตรวจรับ — ทุกกรณี NOT RUN

| Case   | ทำซ้ำเมื่อ30/foundationพร้อม                                                                                            | Assertionsที่ต้องมีหลักฐานจริง                                                                                                               |
| ------ | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| P31-01 | wizardทั้งC30-01–10ด้วยactorที่มีscope เลือกtarget/type/session/fields/file/review/submit                               | serverrequirementsครบตามform/rule; propercontext; submittedreceipt/instance/ref/outboxหนึ่งครั้ง ไม่มีactiveทะเบียนเปลี่ยน                   |
| P31-02 | begin/save ACKหาย/reload/backforward/หลายtab/operationเดิมต่างkeys                                                      | uniqueintent/header/acceptedrevision/receiptถูก ไม่createfromGETหรือretry; intentใหม่ยังอนุญาตตามpolicyไม่blanketdedupeทุกtarget             |
| P31-03 | saved draftresumeหลังlogout/relogin; unsavedoffline reload; shareddeviceuserB                                           | acknowledgeddraft/evidence/checkpointคงกับowner; unsentเตือนชัดไม่อ้างsaved; B/currentrevokedไม่อ่านlocal/serverdraftคนอื่น                  |
| P31-04 | two actors/tab savebaseเดียวกัน patchต่าง; keyเดิมpayloadต่าง; retrykeyเก่าหลังrevisionใหม่                             | CASให้หนึ่งสำเร็จ อีกconflict; no lastwritewins/auto bump; acceptedreceiptเดิมcurrentgrantไม่mutateซ้ำ                                       |
| P31-05 | returnedcorrection/newrevision/resubmit/reloadหลังACKหาย หลายรอบ                                                        | header/tracking/instanceเดิม cycleใหม่ decisionเก่าไม่อนุมัติใหม่ historyครบ outbox/notificationต่อcycleไม่ซ้ำ                               |
| P31-06 | A เปลี่ยนtarget_id/org/location/host/parent/session/type/FileVersionเป็นB ทั้งURL/query/FormData/hiddenfields/nativeRPC | currentDAL/RLS/typedFK/fieldACLdenybegin/save/review/submit/read/export/job ไม่storetargetนอกscopeในdraft; safeerrorไม่เผยB                  |
| P31-07 | fieldsขาด/unknown/malformed/required evidenceไม่มี/เลือกformpolicyเก่า/dateBEผิด/เปลี่ยนfamilytarget                    | servervalidationไม่clientอย่างเดียว; SafeIssueDTO/NOT_READYตามtype ไม่มีfallbackALLOWหรือmixedapprovedpayload                                |
| P31-08 | scanpending/ปลอมนามสกุล/oversize/ACLถอน/fileversionเปลี่ยนหลังreview/attachต่างowner                                    | privateupload10เท่านั้น preview/download/submitไม่ผ่านก่อนscanACL; evidence/hashpinsตรง newrevisionเมื่อเปลี่ยน                              |
| P31-09 | review→save/evidence/config/targetplanเปลี่ยน→submit แข่ง รวมrevoke/suspend/assignmentหมด                               | expectedrevision/currentrules/clock/authorityตรวจในtx conflict/denyไม่มีpartialworkflow/tracking/effect                                      |
| P31-10 | double-submitต่างopkeys/ล่มก่อนcommit/หลังcommitก่อนACK/returnednewcycle                                                | uniqueinstance/binding/tracking/requestversion/receipt/outboxatomic retryผลเดิมไม่สร้างduplicate; terminalstatusแก้ตรงไม่ได้                 |
| P31-11 | trackingcollisionจำลองในprivateharness/guessref/เลขจริงB/ไม่มีsession/revoke/ส่งเลขผ่านnotif                            | DBuniqueretryตามtx refเดิมstable ไม่มีgrantจากเลข; signedincurrentgrant/fieldACLทุกread safe404/nodataไม่privateoracle                       |
| P31-12 | workerหยุด/restart/deliverduplicate/leaseเก่า/recipientgrantwithdraw หลังsubmit                                         | domainsubmittedยังอยู่ durableoutbox/notification/devsinkdedupe currentrecipientcheck no fullreason/files; authorizedreplayไม่เพิ่มeventใหม่ |
| P31-13 | directServerActionPOST/RouteHandler/service/nativewrite originผิด/proxy/bodytamper/clientstatus=approved/effective      | authz/validation/CSRF-origin/session/layersตามcontract; no directactivation/writableownergrant; ไม่ใช้actionID/pagegateเป็นauthority         |
| P31-14 | publictrack/search/HTML/RSC/prefetch/static/cache/errors/export/fileobjectkey/notificationwithprivatecanary             | allowlist/no-storeและACL ไม่มีprivatepayload/เหตุผล/evidence/userPII/token; opaqueidentifierไม่เปิดdetailsต่อpublic                          |
| P31-15 | keyboardThaiIME/forms/review/conflict/filepending/status/focusและ375/768/1024/1440                                      | labels/step/errorsummary/focus/statusข้อความ/ไม่IMEEnterautosubmit/binaryUploadduplicate; ยังไม่อ้างWCAGconformanceจากtable                  |
| P31-16 | no-effectmanifestก่อนหลังdraft/save/returned/rejectedcancelled/retrysubmit/approvedอนาคต                                | activeOrg/CenterSession/status/location/application/role/historyไม่เปลี่ยนก่อนatomicactivation30; rawreason/secretไม่audit                   |

หลักฐานprivate: source/migration/fixture/type/form/rule/manifest/actor/currentassignments/serverclock/actionHTTP/CAS/receipt/instance/cycle/trackingbinding/outbox/effectcountsและnativebefore-afterregistrymanifest ไม่committrackingcapability/token/password/filecontents/fullreason/peerPII ไม่มีrunner/testsของ31ในpackage

## 7 Versions และ gate

schema/app0.6.0 Prisma7.10.0 Next16.3.8 pnpm11.28.2 lock9 core19models/213scalarfields/migration1เดิม SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` requestsREADME-only ไม่มีAuth/DAL/workflow/documents/sharedUIruntime บท31ไม่มีpages/actions/models/seed/tracking/workerจริง

เกณฑ์draftresume/returnedcorrectionไม่ซ้ำและtargettamperนอกscopeส่งไม่ได้ **BLOCKED / NOT RUN** Q001/Q003/Q005/Q006/Q024ต้องform/rule/workflow-cycle/trackingbinding/draftintent/authority Q002/Q004/Q017ต้องtypedtarget/context/date Q008/Q025/Q016ต้องreason/file/publicproof/offline/retention Q011/Q023ต้องcurrentDAL/RLS/scan/transaction/workers Q018/Q019/Q021ต้องsharedUI/browser/labels/4viewportจริง

ไม่ได้รันunit/lint/typecheck/build/nativeDB/SQLWASM/API/browser/worker31หรือenvironmentprobeใหม่ DB-06/Q027 DOCKER-05/Q026ยังเปิดตามUAT29 บท30/prerequisitesต้องผ่านก่อนimplementation31แล้วรันP31-01–16 ไม่เลื่อนไป32จากเอกสาร ไม่แก้production/ข้อมูลจริง

## 8 คำสั่งและผลตรวจจริงในบท31

| วิธี/คำสั่ง                                                                                                                                    | ผลจริง                                                                                                                                                     | ขอบเขต                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| git status/log และอ่าน schema/migration/module/package/lock                                                                                    | source532aa8c clean main ahead20ก่อนแก้; requestsREADME-only; Auth/Authz/Workflow/Documents/sharedUIยังไม่มี                                               | ยืนยันdependency ไม่ใช่allowedactionหรือscopeผ่าน                                                |
| Python inlineตรวจตารางIDs/coverage/links/inventory/version/docpaths                                                                            | PASS: 6steps/10coverage refsตรง30/8UIstates/8proposedactions/8SafeIssuecodes/16caseIDs/15local links; core19models/213scalarfields/migration1/checksumเดิม | ตรวจแผน ไม่executeCAS/workflow/tracking/entropy/P31                                              |
| `corepack pnpm exec prettier --ignore-path /dev/null --check docs/REQUEST_WIZARD.md docs/REQUEST_SUBMISSION.md src/modules/requests/README.md` | PASS                                                                                                                                                       | Markdown3ไฟล์นี้                                                                                 |
| `git diff --check` / `git diff --cached --check`                                                                                               | PASS working/staged7ไฟล์                                                                                                                                   | whitespace ไม่business/state/scope test                                                          |
| `corepack pnpm secrets:check` หลังstage                                                                                                        | PASS                                                                                                                                                       | เฉพาะแพตเทิร์น/scriptและไฟล์ที่Gitเห็น ไม่รับรองsecretทุกชนิด                                    |
| unit/lint/typecheck/build/nativeDB/SQLWASM/API/browser/worker/environmentprobe31/P31-01–16                                                     | NOT RUN                                                                                                                                                    | ไม่มีruntime/schemaเปลี่ยนและdependency30ยังขาด ไม่ใช้ผลrootunitเก่าหรือstarter403แทนสองเกณฑ์นี้ |

ชื่อcommitรอบนี้ “บทที่ 31: เตรียม wizard และการส่งคำขอที่ยังติด dependency” ไม่มีpush/deploy ไม่มีmigration/seed/pages/actionsที่อ้างใช้งานได้ ทุกP31ยังNOT RUN ต้องปิด30แล้วสร้าง/ตรวจruntimeก่อนรับรอง ไม่เลื่อนไป32

## 9 ตรวจ blocker ซ้ำก่อน implementation — 4 ตุลาคม 2569 เวลาไทย

sourceก่อนตรวจ `6574877` working treeสะอาด main ahead21 ตรวจตามพรอมป์ต์31เดิม ไม่มีหน้า/actions/runtimeเพิ่ม รอบนี้เป็นผลตรวจdependency ไม่ใช่การตรวจรับP31

| ตรวจจริง                         | ผล                                                                                                                                                                                                          | ผลต่อบท31                                                                                                                           |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| อ่าน Prisma/module files         | ไม่มีChangeRequest/RequestVersion/OrganizationChangeRequest/ExamCenterChangeRequest/WorkflowInstance/FileVersion/RoleAssignment/User; requestsมีREADMEเท่านั้น; Auth/Authz/Workflow/Documents/sharedUIไม่มี | ไม่สามารถต่อpages/actionsกับบริการกลางจริงได้                                                                                       |
| Python read-only Docker/TCPprobe | DockerCLI/socketไม่มี; loopback5432และ5546เป็นConnectionRefusedError                                                                                                                                        | ยังไม่มีnativePostgreSQLdevที่สองพอร์ตที่ตรวจ ไม่ตรวจcredentialsและไม่เริ่มdaemon                                                   |
| `corepack pnpm db:test`          | exit1; scriptแสดงข้อความฐานทดลองไม่สำเร็จโดยไม่แสดงcredential                                                                                                                                               | DB-06ยังไม่ผ่าน ไม่มีผลmigrate/seed/nativeintegrationPASS; ข้อความerrorไม่ได้แยกว่าขาดenvหรือconnection จึงไม่เดาสาเหตุย่อยจากerror |
| inventory/version/checksum       | core19models/213scalarfields/migration1เดิม; app0.6.0/Prisma7.10.0/Next16.3.8/pnpm11.28.2; migrationSHA256เดิม                                                                                              | ไม่มีschema/migration/seedใหม่                                                                                                      |

`db:test` ที่ตรวจโค้ดก่อนรันจำกัดAPP_ENVและฐานทดลองบนloopback ห้ามใช้production URLหรือresetฐานจริง ไม่มีการนำpassword/token/URLเชื่อมต่อออกlog ผลprobeและexit1เป็นblockerของการตรวจรับ ไม่ใช่defectCAS/targetscopeที่ได้รันแล้ว P31-01–16ยังNOT RUN

งานลงมือที่จำเป็นหลังมีdevPostgreSQLและผ่านdependency: (1) ตรวจรับDB-06/ส่วนกลางAuth-DAL-FileVersion-workflow-outboxที่ได้รับอนุมัติ (2) สร้างและตรวจรับtypedtargets/schemaบริการ30ตามcontractเดิม (3) ต่อwizard/actions31กับบริการจริง (4) รันnativeCAS/retry/returned/targetscopeพร้อมbrowserตามP31 ระหว่างนี้คงdeny by defaultและไม่เลื่อนไป32

ก่อนเริ่มโค้ด31ใช้แผนตาม [MASTER ข้อ2](../00_MASTER_PROMPT.md) ที่ระบุ“ก่อนเริ่มเขียนโค้ด สรุปแผนเป็นไทยไม่เกิน 10 บรรทัดแล้วรอคำว่า ‘ตกลง’” ยังไม่มีการอนุมัติแผนimplementation31แยกจากแผน07เดิม การอนุมัติ31ไม่ทำให้prerequisite30หรือDBacceptanceผ่านโดยตัวมันเอง รอบนี้บันทึกblockerที่พิสูจน์ได้ ไม่เริ่มโค้ดที่ไม่มีต้นทางสิทธิ์จริง
