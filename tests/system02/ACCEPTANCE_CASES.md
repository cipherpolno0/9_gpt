# กรณีตรวจรับระบบ2 — บท23

รุ่น0.1 | 4ตุลาคม2569 | **Test specification / BLOCKED — ไม่ใช่ executable tests; UAT23-T01–T18ทั้งหมดNOT RUN**

อ้าง [UAT_SYSTEM_02](../../docs/UAT_SYSTEM_02.md), [DATA_QUALITY_RULES](../../docs/DATA_QUALITY_RULES.md), [legacyfixture](../fixtures/system02/legacy-organizations-plan.json) และ [expectedfocus](../fixtures/system02/expected-quality-focus.json) Expectedfocusเขียนเองเพื่อวางtest ไม่ใช่adapteroutput และไม่ครอบทุกfinding

## Preconditions

ผ่าน19–22/foundationจริง มีnativePGtestDBแยกproduction, activeOIDCaccounts A/B/reviewer/checker/serviceassignments, Person/Organization/Geographyที่DEMO, rule/template/calendarที่pinversion, scanACL/workflow/sourceไฟล์ที่ตรวจได้ ตั้งclockตามfixtureและrightsที่denybydefault ไม่มีmockallowทุกrowเพื่อให้caseผ่าน

ใช้DEMOparent/type/countryprofile/cardinality/requiredchair-recipient/contactreview_dueที่รับรองสำหรับการทดลองเท่านั้น จัดtargetregistry/sourcehistory/fakeFileVersionsให้ตรงrefs fixture ไม่ใช้JSON refsเป็นUUID/FKจริง ไม่ส่งemail/ข้อสอบ/carrierออกนอกdevsink

## ขั้นทำซ้ำและassert

| Case      | ตั้งค่า/ทำรายการ                                                                         | ผลที่ต้อง assertภายหลังimplementation                                                                         |
| --------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| UAT23-T01 | ทะเบียนtypeทั้ง5ผ่านcreate→review→effective→read/updatehistoryตามscope                   | coreOrganizationเดียวต่อหน่วย Type/master/schema/UI/flowจริงครบ ไม่ใช้DEMOrefsในJSONแทนผลใช้งาน               |
| UAT23-T02 | Authorizedfile→scan→adapter→staging และretryfileเดิมสองครั้ง                             | stagingprivate/typedrowsไม่ซ้ำ ไม่มีOrganization/Application/RoleAssignmentใช้จริงเกิดจากparse                |
| UAT23-T03 | ชุดduplicatecode/mailingmissing/Geographyผิด/postalunknownตามL03–06                      | DQ23-01–05ตรงdemoapprovedrule ไม่มีเดารหัส/ที่อยู่เพื่อapply sourceเดิมคงอยู่                                 |
| UAT23-T04 | L08↔L09 temporalcycle และอีกcaseedgesคนละช่วง/chain พร้อมparallelwrites                  | DQ23-06ในintersectionจริง ไม่rejectdisjointด้วยunion; nativewritersไม่สร้างcycleจากrace                       |
| UAT23-T05 | เช็คmissingchair/recipientของL03หลายdate/ปีรอบกับadaptermissing                          | DQ23-08/09ตามrequiredrule DQ23-14INDETERMINATEเมื่อขาด ไม่autoเลือกแทนหรือcount0clean                         |
| UAT23-T06 | contactreview_dueก่อน/ตรง/หลังclockและpurenocoordinatesL02                               | DQ23-10needsreview ไม่suspendเอง DQ23-15INFO textlistใช้ได้ ไม่geocodeจากชื่อ                                 |
| UAT23-T07 | diffL01ชื่อใหม่/linkcandidate knownsource และL07ชื่อคล้ายไม่มีverifiedkey                | base/current/proposed/version/evidenceถูก fieldgrantไม่รั่ว เลือกreview/mergeด้วยหลักฐาน ไม่automerge         |
| UAT23-T08 | REQUEST_MERGE→impactplan→review คนสร้างapproveตัวเอง/unknownadapter/เปลี่ยนtargetversion | deny/conflict/block ต้องapprovalใหม่ ไม่มีharddelete/moveFK/rewritehistoryโดยdropdown                         |
| UAT23-T09 | applyยืนยันแล้ว crashก่อน/หลังcommit/retry/เปลี่ยนmappingfilepayload                     | transactionreceipt/history/audit/outboxไม่ซ้ำ keypayloadต่างconflict ไม่applydiffเก่าหลังsourceเปลี่ยน        |
| UAT23-T10 | กรองชื่อเดิม/รหัส/type/พื้นที่/chain/dateหลายเงื่อนไข paginate/empty/ThaiIME             | rows/count/facets/cursorตามcurrentgrant hiddenชื่อไม่เป็นsearchoracle keyboardlabel/focusที่375/768/1024/1440 |
| UAT23-T11 | reparent/moveaddressตามวันและknown_at อ่านdocument/reportsnapshotเก่า                    | source name/address/Geo/phone/FileVersionhashปีเก่าไม่joinค่าปัจจุบัน immutablehistory/auditยังตรวจได้        |
| UAT23-T12 | AREA_Aเปลี่ยนURL/body/query/include/chain/ปี/personID/filekeyไปB และstagingL10           | read/edit/review/export/file/jobdenyตามcurrentrow/fieldscope ไม่มีprivatecanary/targetexistenceนอกพื้นที่     |
| UAT23-T13 | export/print/publicDTO/map/HTML/RSC/cache/staticกับcanarycontactส่วนตัว                  | allowlistตรงจอ ไม่มีprivateในpublic/provider requests reportไม่มีเนื้อหาข้อสอบ/previewkeys                    |
| UAT23-T14 | revoke/suspend/assignmentหมดช่วงก่อนjob/apply/download แล้วเรียกAPIซ้ำ                   | latestserverDAL/RLS/workerACLdeny ไม่ใช้grantในdryrun/receipt/jobเก่า                                         |
| UAT23-T15 | fieldhistoryevidenceownerผิด/scanpending/fileปลอม/formulaในการส่งออก                     | denybinding/scanตาม10 outputtextไม่executeสูตร metadataDocumentไม่แทนFileVersionACL                           |
| UAT23-T16 | ไม่มีพิกัด/providerล่ม/JSdisabled รวมpubliccoordinatesที่ไม่มีpublication                | list/search/detailยังใช้ได้ ไม่ส่งprivatecoords/viewportและไม่เติมพิกัดเดา                                    |
| UAT23-T17 | Personrecipientพ้นหน้าที่/death/correctioneffective/queueหยุดแล้วretry                   | appointmenteffects/notificationdedupe ไม่เลือกแทนเอง reportsnapshotเก่าคง currentauthorityตรวจได้             |
| UAT23-T18 | รายงานคุณภาพ/coverage/คู่มือ/โลกรายการจริงกับDEMO/retention                              | unknown/not_evaluatedไม่แสดงclean100% labelsDEMOชัด ไม่อ้างข้อมูลจริงครบประเทศ ไม่hardcode2พื้นที่ในservice   |

หลักฐานแต่ละexecution: sourcecommit/migration/fixture/template/ruleversion, actor/scope/time, command/ขั้นUI, actualassert/faultpoint, privateartifactrefsที่ACLผ่านและmanifesthistoryก่อนหลัง ไม่มีrawชื่อค้น/เบอร์/address/password/tokenในlog ไม่เผยmanifestจริงบนpublicrepo

`corepack pnpm test` ที่มีจริงใช้rootglob tests/*.test.ts ไม่รันโฟลเดอร์นี้ ไม่มีintegration/stagingentrypoint23ที่อ้างว่าทำงานได้ ต้องสร้างหลังdependencyและแผนอนุมัติตามMASTER ไม่สร้างskiptestsหรือmockendpointที่ตอบPASSแทนระบบจริง
