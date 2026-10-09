# Test specifications ระบบ 8 — บท 58

รุ่นเอกสาร 0.1 | 8 ตุลาคม 2569 (2026-10-08) | NOT RUN / PLAN_ONLY / ไม่มี executable E2E

อ้าง [UAT](../../docs/UAT_SYSTEM_08.md), [คู่มือ](../../docs/MANUAL_EOFFICE.md), [fixture58](../fixtures/system08/coverage-plan.json), [workflow](../../docs/WORKFLOW_ENGINE.md) และ [ข้อกำหนดลงนาม](../../docs/E_SIGNATURE_REQUIREMENTS.md)

prerequisites53–57และsharedAuth/FileVersion/ACL/workflow/nativeDB/source servicesยังBLOCKED จึงไม่สร้างmock business engineให้testผ่านและไม่สร้างPlaywright/API testsที่เรียกrouteไม่มีอยู่จริง `pnpm test`17ข้อส่วนกลางผ่านรอบ58ไม่เป็นPASSด้านล่าง ทั้ง30กรณีactual=NULL ไม่มี source decision/file/receiptจริง

## วิธีทดสอบและหลักฐาน

ใช้TEST_บัญชีกลาง/บุคคล/หน่วยงาน/หน้าที่และsourceexamples4ชุดในฐานทดลอง ทำทุกwriteผ่านserviceเจ้าของ ทุกcaseต้องrecordedrun_id/commit/schema/migration/policyversion/configversion/actor-currentcontext/time/expected/actual/statusและevidence refs ไม่ใช้เวลาหรือจำนวนจากclientเป็นหลักฐาน

Happyflowหนังสือส่งทดลอง: draft→submitted→returned→resubmitted→reviewed→approved→registered→queued→delivered→explicitack→assigned→taskcompleted→explicitcaseclosed→scopedsearch ประเภทรับ/ภายใน/เวียนใช้policyของตนปีทะเบียน/priority/confidentialityแยกกัน ไม่เดาลำดับทางการจากhappyflowนี้ receipt/task/closeเป็นคนละมิติ

| รหัส   | ขั้นตอนทดสอบเมื่อระบบพร้อม                                                                    | ผลที่ต้องได้และหลักฐาน                                                                                                                      | สถานะ   |
| ------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| P58-01 | ผู้สร้างร่าง เลือกcentralPerson/Org/FileVersion บันทึก/reload และผู้แก้สองคนใช้revisionเดียว  | ร่างเดิมไม่ซ้ำ ผู้แพ้conflict โหลดรุ่นใหม่ ไม่เก็บsecretหรือbodyลับในlocalStorage                                                           | NOT RUN |
| P58-02 | ส่งตรวจ ส่งกลับพร้อมเหตุผล แก้และส่งใหม่ในเรื่องเดิม                                          | reviewcycle/revisions/เหตุผลครบ คำตัดสินเดิมยังอยู่ ไม่สร้างCorrespondenceซ้ำ                                                               | NOT RUN |
| P58-03 | creator/technicaladmin/out-of-scope/expireddelegateส่งapproveAPI แล้วผู้มีอำนาจคนอื่นตัดสิน   | denyตามcurrentrole/scope/time/makerchecker; approverอ่านexactmanifestแล้วdecision+evidence+audit+outboxatomic                               | NOT RUN |
| P58-04 | สองconnectionแข่งออกเลขnamespaceเดียว retryและVOIDเลขที่ออก                                   | uniqueorg-registerperiod-type-number หนึ่งเลขต่อoperation ไม่reuseVOID countersไม่client-derived/ไม่resetจากretry                           | NOT RUN |
| P58-05 | ทะเบียนรับ ส่ง ภายใน เวียน และเปลี่ยนpriority/class/registerperiodคนละปีงบ/การศึกษา           | typedconfig/fieldrequirements/steporderตามpolicy ประเภท/ด่วน/ลับ/ปีไม่สับสน policyไม่ยืนยันปิดofficialformat                                | NOT RUN |
| P58-06 | ส่งdirect+groupซ้ำcontextเดียว/คนเดียวสองcontext เพิ่มgroupmemberทีหลัง                       | dedupendpointเดียวเก็บorigins contextต่างแยก snapshotผู้รับคงเดิม newmemberไม่มีoldbookgrant                                                | NOT RUN |
| P58-07 | queued-worker-delivered เปิดnotificationและpreviewแต่ไม่กดรับทราบ                             | queued≠delivered≠acknowledged notificationseenไม่receipt ไม่autoassign/complete/close                                                       | NOT RUN |
| P58-08 | ผู้รับรับทราบcontextA retry และพยายามรับแทนB/peer/ปลอมclienttime                              | receiptหนึ่งชุดต่อendpoint/version/methodตามpolicy currentself-context/serverclock ไม่ackอีกหน้าที่                                         | NOT RUN |
| P58-09 | มอบหมายผู้มีtaskสิทธิ์แต่ไม่มีsecretfile grant แล้วตรวจเพิ่มสิทธิ์ตามworkflow                 | pending_accessไม่subject/body/file leak activateเมื่อcurrentrecord/source/file/class/CLEANครบ ไม่grantจากtask                               | NOT RUN |
| P58-10 | completedงานแรก ขณะอีกงานค้างแล้วขอปิดเรื่อง                                                  | siblingยังค้าง closureconditiondemo block ปิดได้เฉพาะผู้มีcloseaction+เหตุผล+หลักฐานเมื่อเงื่อนไขครบ                                        | NOT RUN |
| P58-11 | explicitclose แล้วค้นhistory/reopen-correctionตามpolicy                                       | closeeventคงเลข/receipt/files/คำตัดสิน/hold ไม่public/VOID/harddelete/ใหม่sourcepostingจากGET                                               | NOT RUN |
| P58-12 | ค้น/list/count/fulltext/snippet/thumbnail/HEAD-Range-304/preview/download/export/print/worker | authorizeก่อนcount/metadataทุกchannel ไม่รั่วPII/class/sourceprivate cacheไม่bypasscurrentgrant                                             | NOT RUN |
| P58-13 | บัญชีเดียวหน้าที่A+Bช่วงยังใช้ได้ อ่านหนังสือแต่ละcontext                                     | currentpolicyครบทั้งสองจึงอ่านตามactionที่มี แต่Bไม่เกิดจากA; context/receiptsแยกไม่ต้องloginใหม่                                           | NOT RUN |
| P58-14 | ตรงวันสิ้นสุดBและหลังสิ้นสุด ยังมีAactive แล้วลองread/export/ack/workerของB                   | half-openintervaldenyBทุกช่องทาง ไม่ใช้recipient/history/receiptเก่าเป็นgrant Aยังใช้ได้ตามscopeเดิม                                        | NOT RUN |
| P58-15 | หลังพ้นBขอexplicit historical readใหม่ที่policyอนุญาต จากผู้มีอำนาจอิสระ                      | เฉพาะaction/purpose/time/record-source-fileที่อนุมัติใหม่อ่านได้ ไม่คืนroleBหรือapprove/editโดยปริยาย                                       | NOT RUN |
| P58-16 | revoke session/grant/class/scanก่อนretry/download/export/workerและใช้oldlink                  | currentdenyทุกaccesspathตามที่ควบคุมจริง directStorageไม่bypass ไม่มีreceiptresponseลับจากretry ห้ามอ้างเรียกคืนdownloadedcopyได้           | NOT RUN |
| P58-17 | faultก่อนcommit/หลังcommit/workerส่งถึงก่อนackprocessing/leaseเก่ากลับมา และretry             | DBatomic decision-routing-audit-outbox; durableeffectdedup/fencing ไม่delivery/receiptซ้ำ partialต่อendpoint ไม่มีfakeexternalrollback      | NOT RUN |
| P58-18 | เปลี่ยนbody/files/recipients/templateหลังapprove และแก้bytesV1หลังตรึง                        | holdpermit VERSION_MISMATCH/newversion+review คงolddecision/hash/artifact ห้ามส่งlatestV2เป็นapprovedV1                                     | NOT RUN |
| P58-19 | techonly/otherorg/assignee/linkedsourceพยายามอ่านsecretrecordหรือprivateattachment            | denyไม่รั่วเรื่อง/filename/EXIF/OCR/rawindex source1/4/6/7linkไม่grant technicalroleไม่อ่านทุกเรื่อง                                        | NOT RUN |
| P58-20 | retentionครบกำหนดทดลอง แต่officialduration/authorityยังTO_VERIFY                              | เสนอรายการตรวจเฉพาะpolicyที่รับรอง ไม่purgeอัตโนมัติ ไม่เอาDEMOdaysเป็นกฎหมาย                                                               | NOT RUN |
| P58-21 | legalholdกับsharedfile/derivative/newversion แล้วลองclose/destruction/releaseไม่มีอำนาจ       | holdclosureรักษาหลักฐาน closeไม่release noactiveholdpurge auditไม่ถูกลบ raceต้องStorageprotocolจริงมิฉะนั้นexecutiondisabled                | NOT RUN |
| P58-22 | ขอdisclosure/redactionแล้วดูoutputและhiddenlayers/metadata/cache                              | reviewedfieldpurpose/newderivative/CLEAN/sourceauthorization ไม่CSSmaskหรือoverwriteheldoriginal ไม่publicfromclose/signature               | NOT RUN |
| P58-23 | source1คำสั่งย้าย→สารบรรณ→send→ack→ค้นย้อนหลัง                                                | actualFK sourceversion/decision/effective-recorded/recordmanifest/fileV1/hashเดียว ไม่เปลี่ยนPerson/สิทธิ์จากส่งหรืออ่าน                    | NOT RUN |
| P58-24 | source4คำสั่งเปิดสนามวันอนาคต→สารบรรณ→send→historyasof                                        | approvedsourceversion/activation/decision/fileV1สัมพันธ์จริง ไม่เปิดสนามก่อนวันมีผลจากregister/ack                                          | NOT RUN |
| P58-25 | source6ใบอนุมัติงบ→สารบรรณ→retry/close/search                                                 | actualledger-event/decision/evidence/fileV1pinning counts/ยอดsourceคงเดิม ไม่allocate/reserve/postจากอ่านหรือส่ง                            | NOT RUN |
| P58-26 | source7เอกสารรับพัสดุ/inspection→สารบรรณ→assign/close                                         | actualorder/receipt/inspection/decision/fileV1pinning รับของไม่จ่ายเงิน/เพิ่มstockซ้ำจากe-officeaction                                      | NOT RUN |
| P58-27 | แก้sourceexamplesทั้ง4เป็นV2แล้วอ่านเรื่องเก่าภายใต้currentACL                                | V1+oldsource/e-officedecisions/hashยังคง newcycle/V2/correctionreason-sourceevidenceย้อนถึงต้นเรื่องได้ ไม่copyไฟล์ต่อmodule                | NOT RUN |
| P58-28 | internalapproval/image/hash/unconfiguredproviderในUI/API/exportกับงานส่ง                      | SIGNING_NOT_CONFIGUREDไม่มีprovidercall/officialbadge artifact/profileactualvalidationจำเป็น ไม่fakecert/trustedtimestamp                   | NOT RUN |
| P58-29 | oldname/newname/ย้อนหลัง/lateoutbox/bodyThai/ปีทะเบียนสองปีและprojectionlag                   | snapshotnames/file/decision/เวลาeffective-recordedคงเดิม authorizedreportreconcile routing/receipt/task/closeevent ไม่สร้างธุรกรรมจากreport | NOT RUN |
| P58-30 | keyboard375/768/1024/1440 namecollision/XSS/quarantine/empty-error/conflict/slowresume        | ไทยlabel/focus/status/inputvalidationserver exactIDsไม่ใช้ชื่ออย่างเดียว scriptไม่ทำงาน scanไม่ผ่านใช้ไม่ได้ ownerpolicyUATแยกsoftwareQA    | NOT RUN |

## Race และ fault ที่ต้องสังเกตจริง

เลขใช้สองPostgreSQLconnectionsและbarrierที่จุดล็อก namespace ไม่ใช้Promise.allเรียกin-memorycounterเป็นหลักฐาน unique/CAS ผู้แพ้conflictอย่างเข้าใจได้ การยกเลิกเลขไม่reuse namespaceอื่นออกเลขซ้ำตัวเลขได้เมื่อpolicyอนุญาต

Delivery faultpoints: ก่อนroutingcommitทั้งหมดrollback; หลังroutingcommitและก่อนworkerส่งคงoutboxรอ; หลังdeliverycommitและก่อนjobreceipt workerretryeffectเดิม; leaseเก่าถูกfence; notificationseenไม่ack; receiveracktransactionrollbackต้องไม่เหลือreceiptครึ่งชุด การยืนยันcontextหนึ่งไม่เปลี่ยนcontextอื่น Revoke/class/scan/hold writersต้องร่วมguard protocol ไม่ถือrecheckครั้งเดียวป้องกันraceทุกชนิด

ACLต้องตรวจHTTPmetadata/cursor/count/body/filebytesและdirectStorage/RLSด้วย currentactor/role/context/purposeทุกaction `404`หรือ`403`ใช้responsepolicyที่ไม่เผยการมีresourceของคนนอก ยกเลิกsession/signURLexpireไม่พิสูจน์instantrevokeทุกช่องทาง ต้องบันทึกขอบเขตที่ตรวจได้และข้อจำกัดcopiesที่เคยdownloadแล้ว

## หลักฐานข้ามระบบ

Observerที่มีสิทธิ์ตรวจFKทั้งsourceและe-office: source_ref/source_version/source_decision/source_effective/source_recorded/document/file_version/object_version/bytehash/scanstatus/record_version/manifest/approvaldecision/evidence/dispatchpermit/routing/recipientcontext/receipt/task/closeevent/correctionrefs และcountsก่อนหลัง อ่านbytesจริงจากcentralStorageไม่ใช่เชื่อhashที่clientส่ง SourceFK restrict/provenance/currentACLและholdต้องผ่านทั้ง4ตัวอย่าง ไม่เอาTEST_ descriptorsนับเป็นcentralfileจริง

เกณฑ์58-01 map P58-06/08/09/12–16/19; เกณฑ์58-02 map P58-18/21/23–29 ทั้งคู่BLOCKED/NOT RUN softwareevidence=NULL/owner signoff=NULL officialpoliciesTO_VERIFY ไม่เลื่อนไป59จากผลตรวจเอกสาร
