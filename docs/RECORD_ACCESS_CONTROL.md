# Record ACL และการเชื่อมต้นเรื่อง — บท 56

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | source `c82341c` | **Proposal / BLOCKED — ยังไม่มี services/policies ที่ทดสอบจริง**

ใช้ [RECORDS_RETENTION](RECORDS_RETENTION.md), [ACL53](RECORD_DOCUMENT_ACCESS.md), [approval54](CORRESPONDENCE_FLOW.md), [delivery55](DOCUMENT_DELIVERY.md), [PERMISSIONS](PERMISSIONS.md) และ [controlled disclosure](CONTROLLED_DISCLOSURE.md) ร่วมกัน ไม่มีอีกaccount/file registryหรือworkflow

## 1 Action และ identity ที่ต้องตรวจ

สิทธิ์เรื่อง/version/representationไม่เป็น ORกับfile/source ACL และการเป็นadminเทคนิคไม่เป็นrecord reader โดยปริยาย ทุกread/preview/download/print/export/search/thumbnail/HEAD/Range/conditionalresponse/workerมี explicit actionของตน Workerใช้ current delegated system authorityเฉพาะpurpose หรือcurrentinitiatorตาม11 ไม่servicecredentialแทนอำนาจธุรกิจ

| ชั้นตรวจเสนอ            | Guard                                                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| account/action          | activeverifiedaccount/session/role-permission/ช่วงมอบหมาย/currentdelegation/actionตรงchannel                                        |
| record/version          | currentorg/explicitrecordscope/record ACL/versionbinding/fieldpolicy/securityfloor                                                  |
| recipient/accessbinding | frozen verified account-context endpoint55หรือexplicit approved purpose-specific accessbinding ไม่ใช้late groupmembership/task/link |
| classification          | currentclearance+purpose/securityfloor ปรับเพิ่มชั้นทำให้oldgrantไม่พอ; oldimmutableversionไม่bypassfloor                           |
| source                  | current source module action/scope/fieldpurpose สำหรับrepresentationนั้น ไม่มีlink=grant                                            |
| FileVersion             | exactdocument-version/purpose/hash/current file action ACL/currentCLEAN ไม่Document.latestหรือbucket URLจากclient                   |
| representation/field    | allowedDTO/derivativeapprovedpolicy/currentartifactstatus ไม่คืนoriginal/filemetadataส่วนเกิน                                       |
| worker                  | current role/purpose/grants/lease-fence/target revisionและactionก่อนอ่านและcommit ไม่plaintextjobpayload                            |

Hold/destruction reviewอาจมี metadata-only purpose/actionเพื่อรักษาหลักฐาน ไม่ต้องเปิดbinaryทุกเรื่อง แต่ต้องexplicitpermission/fieldallowlistของงานนั้น ไม่ให้คำว่าreviewerเข้าถึงcontentเอง การ place holdไม่เพิ่มreadสิทธิ์ แยกhold.place/release/destruction.propose/review/approve/executeจากrecordreadโดยชัดเจน

การreplay operationreceipt ตรวจ currentauthก่อนคืนรายละเอียด ถ้าหมดสิทธิ์ให้ generic forbidden/hidden-resource404ตามpolicy ไม่เปิดชื่อเรื่อง/ผู้รับ/จำนวนผล/holdreason Evidence scanspendingไม่ถูกเปิดอ่าน แม้ป้องกันไว้ด้วยhold

## 2 ACL reconciliation กับแบบกลาง

logical04มี user/grant/document/file_version/record_version/recipient_snapshot/retention_hold แต่ runtimeมีเฉพาะDocumentmetadataและPolicyVersion ต้อง ADR typed RecordAccessBinding/FileAccessPolicy/DisclosureBinding/HoldTarget/multiplecurrentpurpose/clearance-policy versions/record-source resolver/currentsecurityfloor ก่อนmigration ไม่เขียน SQLpolicyที่อนุมานaccountจากServiceActor/GUC/browserroles

ทุกPrisma/query/directdatabaseapi/storagegateway/indexprojection/exportjobต้อง limited writer/reader + serverDAL/RLSตาม07/10 ไม่มีendpoint fallbackให้technicalservice roleโหลดrawindex/thumbnail Errorlogs/auditเก็บopaque IDs/action/policy/fieldnames/servertime/correlationไม่body/subject/PII/fullsearch/recipientlist/objectkeys

## 3 Link จากระบบ 1, 4, 6 และ 7

| ต้นเรื่อง                         | สิ่งอ้างอิง                                         | เงื่อนไขก่อนแสดงlink/เปิด                                                                                        |
| --------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| ระบบ1 person status order         | PersonChangeRequest/StatusEvent + approved evidence | เจ้าหน้าที่/เจ้าของต้องsource purposeที่อนุญาตและrecord/version/file currentrights ไม่คืนเหตุผลลับจากperson page |
| ระบบ4 organization/center order   | OrganizationChangeRequest/status event              | source requestscope+record/fileclass+currentrecipient; publictrackingไม่คืนprivateletterจากUUID                  |
| ระบบ6 budget approval             | approved plan/disbursement/ledger reference         | financialscope+fieldpolicy+record/fileaction เห็นยอดไม่เท่ากับเห็นหนังสือหรือinvoice                             |
| ระบบ7 procurement/assets approval | procurement/order/disposal reference                | warehouse/org/purpose scope+record/source/filepolicy task/custodyไม่grantหนังสือ                                 |

ใช้central Document ID/FileVersion IDเดิม พร้อมsource_kind/id/versionและtypedbinding ไม่มี binarycopiesเพิ่มจากการlink กรณีsourceอ่านได้แต่recordอ่านไม่ได้ DTOให้เฉพาะข้อมูลที่sourcepolicyอนุญาต ไม่แสดงชื่อหนังสือ/filename/holdcase existence; recordอ่านได้แต่sourceอ่านไม่ได้ resolverไม่บอกtitle/reasonของsourceนั้น สถิติ/count/previewทั้งสองทิศตรวจเช่นเดียวกัน Source5หรือระบบอื่นที่แชร์ไฟล์ยังเป็นobligationในการretentionแม้ไม่เป็นเมนูที่ทดสอบ56

## 4 Full text thumbnail และ projection

authorizationต้องอยู่ก่อนคืนrow/count/facet/snippet/highlight/autocompleteและcurrentrevalidationก่อนresponse ไม่กรองหลังlimitหรือให้unauthorizedtextร่วมrank/facetsแล้วค่อยเอาrowออก Raw searchindexต้องprivateและมีentry→record/version/source/representation/clearance/fieldpolicy provenance ไม่มีpublicrawindex API/ตารางOCRที่อ่านผ่านrecord RLSได้โดยไม่ตรวจindexเอง

Indexworkerใช้specificsystemdelegation/purposeและsource-filepolicy เก็บtextตามapprovedfields ส่วนค้นหาให้currentactor predicatesก่อนsnippet generation staleindex/queue/cacheไม่เป็นเหตุคืนข้อมูลเมื่อgrantถอนหรือsecurityfloorเพิ่ม ถ้าindexไม่รองรับACL/policyrevisionตามprotocolต้องปิดfulltextของประเภทนั้น ไม่fallbackค้นrawทั้งหมดและไม่claimtiming-safeจนทดสอบ

Thumbnail/preview artifactมีparentFileVersion/hash/purpose/policy/scan/owner/contextและaccessgateเดียวกับrepresentation ไม่public image URL, openGraph/link unfurl, alt/EXIF/original filename/OCR/response Content-Disposition/Content-Length/ETagเป็นทางอ้อมให้ทราบเรื่องก่อนผ่านสิทธิ์ Controlledlink previewไม่fetchprotectedcontentให้botหรือthirdparty metadataendpoint HEAD/Range/304ตรวจก่อนส่งheadersเสมอ

ขอบเขตsearch/private DTO/fulltext/thumbnail/cache/nativegatewayP56-01–08ทั้งหมดNOT RUN ไม่มี index/thumbnailจริง ให้เก็บbrowser/network/storage/directSQLnegativeproofก่อนเปิด ไม่ถือว่าหาwordในfixtureไม่พบแปลว่าไม่รั่ว
