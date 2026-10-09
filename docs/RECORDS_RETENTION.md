# สิทธิ์เอกสารและการเก็บรักษา — บท 56

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | source `c82341c` | **Proposal / BLOCKED — ยังไม่มี ACL/retention services หรือการทำลายจริง**

อ่าน [BLUEPRINT](../BLUEPRINT.md), [MASTER](../00_MASTER_PROMPT.md), [PROGRESS](PROGRESS.md), [workflow11](WORKFLOW_ENGINE.md), [เอกสารกลาง53](RECORD_DOCUMENT_ACCESS.md), [approval54](CORRESPONDENCE_FLOW.md) และ [delivery55](DOCUMENT_DELIVERY.md) ก่อนออกแบบ บท55ยัง BLOCKED ไม่มีAuth/DAL/FileVersion/ACL/scan/outbox consumer/approved snapshot core0.6.0มี19models Documentเป็นMETADATA_ONLY `corepack pnpm db:test` รอบ56 exit1 เอกสารนี้ไม่ใช่ migration/services/คำสั่งลบหรือการรับรองกฎหมาย

## 1 แนวคิดทีละขั้น

1. การดูแลระบบเป็นคนละอำนาจกับการอ่านหนังสือ ผู้ใช้ต้องผ่าน ACL ของเรื่อง รุ่นไฟล์ ผู้รับ/บริบทและชั้นความลับตาม [RECORD_ACCESS_CONTROL](RECORD_ACCESS_CONTROL.md) ทุกช่องทาง
2. อายุเก็บเป็น configuration ที่มีรุ่น แหล่งอำนาจ ผู้รับรองและวันเริ่มนับ ยังไม่มีจำนวนปีหรือกฎทางการที่ยืนยัน จึงไม่ใส่ค่าทดลองเป็นกฎหมาย
3. เมื่อครบอายุ ระบบเสนอรายการให้ตรวจ ยังไม่ลบทันที ต้องตรวจ legal hold และทุกระบบที่ยังอ้างหลักฐาน
4. คำขอทำลายผ่านผู้ตรวจและผู้อนุมัติคนละคนกับผู้สร้าง ตรึงรายการไฟล์/รุ่น/สำเนาและเงื่อนไขที่อนุมัติ ไม่เพิ่มไฟล์อื่นตอน workerทำงาน
5. เมื่อทำลายได้ตามนโยบาย ให้คงหลักฐานธุรกรรมและ auditขั้นต่ำของการทำลาย พร้อม tombstone ของไฟล์ แยกจาก binaryหรือข้อมูลส่วนตัวที่หมดความจำเป็น ไม่ใช้คำขอนี้ล้าง audit

## 2 Retention policy ที่ยังต้องยืนยัน

ใช้ PolicyVersionกลาง namespace RECORD_RETENTION และ Document.retention_policy_idตามlogical04 ไม่สร้างทะเบียน policy อีกชุด Core PolicyVersionมีจริงแต่ binding/typed validated configuration/evidence FileVersion/verification runtimeยังไม่มี ต้อง ADRก่อน migration

| ข้อมูล policy เสนอ                                                         | กฎตรวจ                                                                                                          |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| record/file category, owner organization, purpose, confidentiality         | ประเภทที่ไม่รู้หรือหลายpolicyขัดกัน block ไม่เลือกระยะที่สั้นที่สุดเอง                                          |
| version/verification/effective window/official source/rights/approver      | verifiedได้จากหลักฐานจริงและผู้รับผิดชอบ ไม่ใช่statusที่clientส่ง; TO VERIFYห้าม executeทำลายจริง               |
| anchor event + server date/calendar/timezone + duration rule               | เช่นปิดเรื่อง/สิ้นสุดวัตถุประสงค์เป็นProposal ต้องยืนยันเหตุการณ์เริ่ม ไม่ใช้created_atทุกชนิดหรือ FY/AYแทนเวลา |
| object families/copies/derivatives/index/export/backups + exclusion scope  | inventoryต้องครบและมีที่มา ข้อจำกัดbackupต้องแสดง ไม่อ้างทำลายทุกสำเนาจากprimaryหาย                             |
| eligible action/redact/destroy/archival + evidence/delegation/review route | หน่วยงานต้องยืนยันอำนาจ ไม่ให้adminเทคนิค/ผู้สร้างapproveเอง                                                    |
| audit/business provenance policyแยก + metadata minimization                | ไม่เก็บPIIเต็มชุดในauditเพื่อหลบretention ห้ามลบ auditการทำลายจากคำขอไฟล์เดียว                                  |

DEMOในfixtureใช้การบวกจำนวนวันเพื่อแสดงวิธีเท่านั้น ส่วน official duration=NULL/official destruction disabled ไม่มีการเดาระยะเก็บตามกฎหมาย Policyเปลี่ยนไม่ rewrite รุ่นที่ใช้ตัดสินเดิม แต่คำสั่งทำลายต้อง re-evaluate current obligations/hold/อำนาจและ impact; ถ้ารายการเปลี่ยนอย่างสำคัญให้กลับตรวจใหม่

## 3 Legal hold และประวัติ

logical04 retention_holdผูก Documentและมีheld_from/released_at ไม่เพียงพอสำหรับscope/evidence/authorization/history/race ต้องเสนอ HoldCase/HoldEvent/typed TargetBinding ที่mapของกลาง รองรับdocument-wide/record-family/file-version/source-evidence scopeและclosureของไฟล์อนุพันธ์/สำเนาอย่างชัดเจน ไม่ให้clientส่งSQL/URL/selectorเพื่อครอบทรัพยากรนอกอำนาจ

Holdที่รับตามอำนาจต้องป้องกัน destructive action/overwrite/การปกปิดที่ทำลายหลักฐาน แม้ file retentionครบกำหนดแล้ว Holdไม่เพิ่มสิทธิ์อ่านและไม่เปิดcase reasonให้ทุกadmin Scopeแบบdocument-wideครอบรุ่นใหม่/derivativesด้วย registration hook; file-versionเฉพาะรุ่นไม่ลามทุกเรื่องโดยไม่มีpolicy แต่ objectร่วม/สำเนาที่ใช้หลักฐานเดียวกันต้องclosureที่ตรวจได้

เสนอ provisional preservation holdเฉพาะ actorที่มีhold.placeและpolicyอนุญาต เพื่อป้องกันหลักฐานระหว่างตรวจ การแนบไฟล์pending scanไม่อนุญาตเปิด/ใช้ไฟล์นั้น; เก็บ opaque evidence refและตรวจแยก Unknown authorityห้ามใช้ ส่วน hold releaseต้องworkflow11/หลักฐาน/ผู้มีอำนาจปัจจุบัน/maker checkerและ append release event ไม่แก้เหตุผล/เวลาต้นทาง ไม่ auto releaseจากdue/enddateหรือ softinactive

เก็บ effective_at และ recorded_at ของhold/eventsแยก ย้อนตรวจว่าระบบรู้holdเมื่อใดได้ การบันทึกย้อนหลังไม่ใช่หลักฐานว่าคำสั่งที่ลบไปก่อนระบบรู้ถูกหยุดแล้ว ต้อง incident/recoveryตามสิ่งที่กู้ได้จริง ไม่สร้างประวัติว่าป้องกันสำเร็จ

## 4 คำขอทำลายและการคง audit

| ขั้นเสนอ                           | สิ่งที่ต้องตรวจ/บันทึก                                                                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| candidate                          | อายุจากpolicyที่ยืนยัน/anchor/inventory/source references/hold closure; ไม่มีการลบ                                                                        |
| draft/submitted/reviewing/returned | sharedworkflow11 คำขอเฉพาะรายการ ตรึงtarget manifest/hash/revision/currentpurpose/เหตุผล/หลักฐาน/ผลกระทบ รายการถูกส่งกลับเพิ่มรุ่นไม่สร้างทะเบียนไฟล์ใหม่ |
| approved                           | decisionที่ตรวจauthority/makerchecker มี approved destruction manifest; ยังไม่ถือdestroyed                                                                |
| queued/blocked                     | currentpolicy/active or provisionalhold/shared refs/storage capabilities/delegation/current inventory recheck; unknownสิ่งใดblockพร้อมcodeขั้นต่ำ         |
| executing/partial/reconciling      | central file serviceทำเฉพาะtargetsที่ตรึง รายงานผลแต่ละartifact ตรวจprovider outcome/failpoint/idempotency ไม่ทิ้งpartialหรือขยายtargetเอง                |
| verified_complete                  | มีผลยืนยันครบขอบเขตที่policyกำหนดพร้อมoutcome manifest; audit/event/tombstoneคงอยู่ ไม่ใช่เพียงqueueACK/404หนึ่งครั้ง                                     |

คำขอที่อนุมัติไม่เป็น bypass current hold ต้อง recheckทุกครั้ง การมีsource1/4/6/7หรือระบบอื่นยังต้องใช้หลักฐาน/sharedblob/reference/case/ภาระเก็บของอีกowner ต้องหยุด binary purgeจนทุก obligationที่เกี่ยวข้องรับรอง ไม่ใช้จำนวนreferenceจากcacheหรือแค่document.is_active=falseตัดสิน ถ้าคงbinaryเพื่ออีกระบบแต่ถอนสำเนาส่วนตัว ให้ระบุ scopeผลที่ทำจริงโดยไม่เปิดไฟล์นั้นให้ทุกคน

เสนอ FileVersion tombstone/provenance/statusและDestructionEventแบบappend เก็บopaque IDs/manifest digest/approved decision/policy/evidence ref/actor/server time/reason code/correlation/outcome ห้ามhard delete audit/receipt/approval/sourcehistory/ราคา/ผลสอบ/ledgerเพียงเพราะfileหมดneed original_filename/subject/body/PII/object keyไม่อยู่auditหรือtombstoneสาธารณะ Business historyที่ต้องลดPIIต้องpolicyแยก/controlled metadata redaction event ไม่เก็บสำเนาPIIซ่อนไว้ใน audit เพื่อให้ดูว่าimmutable

Destruction auditมีอายุเก็บ/สิทธิ์ของตนตามpolicyที่ยังต้องยืนยัน ไม่ประกาศว่าต้องเก็บตลอดไปตามกฎหมาย และไม่ใช้คำขอทำลายเอกสารปัจจุบันลบauditการทำลายของตนเอง legacy sensitive auditถ้ามี ต้องคำวินิจฉัย/กระบวนการเฉพาะที่แยกจากบทนี้ ไม่แก้ต้นทางเงียบ ๆ

## 5 Transaction กับ storage ไม่ใช่ธุรกรรมเดียว

คำขอ/decision/manifest/operationreceipt/audit/outboxบันทึกatomicในPostgreSQL ส่วนลบobjectภายนอกไม่อยู่transactionนั้น การ recheckholdครั้งเดียวก่อนHTTP deleteหรือใช้leaseอย่างเดียวไม่พิสูจน์ว่าชนะrace legalholdได้ จึง **ปิด destructive execution จน adapterและall-writer protocolพิสูจน์ว่ารับholdก่อนจุดตัดสินลบแล้วไม่มีการลบได้จริง** ไม่ยืนยันว่าStorageเป้าหมายมีnative legal hold/conditional delete/fencing

ADRต้องกำหนดการ serialize hold.place/release/ref registration/approval revokeกับpurge guardของobject familyและregistered writersทุกช่องทาง รวมbackend-enforced protectionหรือกลไกที่พิสูจน์ได้ หากไม่สามารถคุ้มครองช่วงDBcommit→external side effect หรือหยุดstaleworkerที่ส่งrequestไปแล้วได้ ต้องblock ไม่เรียกpoll+recheckเป็นraceproof ไม่ให้technicalcredentialลบผ่านbucketโดยหลบhold

Hold acceptedก่อน purge authorization: ทุกtargetที่ครอบต้องblocked; holdมาระหว่างexternal operation/ผลไม่ทราบ: หยุดงานที่ยังไม่ทำ เปิดincident/reconcileปกป้องส่วนที่เหลือและไม่claimว่ากู้binaryที่ถูกลบแล้วได้; native/providerproofต้องระบุจุดlinearizationและผลทั้งสองลำดับ ก่อนยืนยันเกณฑ์56-02ไม่มีช่องrace ไม่มีproviderหรือไฟล์จริงในรอบนี้

Workerตรวจcurrentrole/purpose/action/delegation/manifest/guardrevision/leasefence/hold/source refs ก่อนทำและก่อนบันทึกผล outcomeต่อartifactใช้unique(request-version,artifact-id,operation) และstable provideroperationidentityตามadapterที่ยืนยัน Unknowntimeoutห้ามblind retryแล้วอ้างcompleted ต้องreconcile exact object/version/hash inventory; ผลabsence404ไม่พอระบุว่าลบสิ่งที่อนุมัติแล้ว ถ้าhash/versionไม่ตรงให้ integrity incidentไม่ลบlatestอัตโนมัติ

## 6 Derivatives backups และการกู้คืน

Inventoryต้องรวมprimary/ทุกversionที่ขอ/thumbnail/OCR/fulltext index/cache/generated export/replicaและbackupที่policyระบุ เป็นdependencyของcentralDocument/FileVersion ไม่สร้างcopyไฟล์ในสารบรรณ Holdต้องคุ้มครองสำเนาที่เป็นหลักฐานและderived contentที่ทำลายหลักฐานได้ Cleanthumbnailไม่เท่ากับpreview ACL

ถ้าprimaryถูกทำลายแล้วแต่index/cache/backupยังไม่ล้างหรือพิสูจน์ไม่ได้ ให้partial/reconcilingและcurrentgatewaydeny ไม่ verified_completeระดับทุกสำเนา Backupที่ลบรายไฟล์ไม่ได้ต้องapprovedpolicy/expiry/restore suppression scopeที่ยืนยัน unknownbackupobligationblockปิดงาน ห้ามอ้างallcopiesdeletedพร้อมbackupยังอยู่

Restoreต้องนำtombstones/hold events/currentpoliciesกลับก่อน exposeไฟล์/ดัชนี ตรวจcurrentACL/scan/purpose ห้ามrestorebackupแล้วหนังสือที่ทำลายหรือถูกถอนสิทธิ์กลับมาอ่านได้เอง การกู้hold caseต้องauthorizedincident/evidenceตามสิ่งที่มีจริง ไม่ส่งไฟล์คืนจากobject IDที่ไม่ยืนยัน

## 7 กรณีตรวจรับที่ต้องรันจริง

| Case   | หลักฐานที่ต้องได้จริง                                                                                    | สถานะ   |
| ------ | -------------------------------------------------------------------------------------------------------- | ------- |
| P56-01 | technicaladmin/no business action/expiredsession/unknownpolicy readและworker deny                        | NOT RUN |
| P56-02 | current record-version-file-recipient-context-classification-source intersectionsทุกaction               | NOT RUN |
| P56-03 | fulltext/snippet/highlight/count/facet/autocomplete/indexapiไม่เผยunauthorizedหนังสือ                    | NOT RUN |
| P56-04 | thumbnail/EXIF/alt/filename/sourcebytes/HEAD/size/preview headersไม่leakเมื่อdeny                        | NOT RUN |
| P56-05 | preview/exportcurrentCLEAN/hash/derivativepurpose ไม่มีactiveหรือunscannedcontent                        | NOT RUN |
| P56-06 | private no-store/304/ETag/Range/browser/sharedcache/currentrevoke ไม่คืนstalebody                        | NOT RUN |
| P56-07 | export/search/thumbnailworker currentgrant/lease/policyrevokeและfieldallowlist                           | NOT RUN |
| P56-08 | source1/4/6/7 linksไม่grant read/metadata/file ทั้งสองทิศ                                                | NOT RUN |
| P56-09 | controlleddisclosureใหม่มีindependentreview/source-approvedallowlist/redactionderivative ไม่เผยoriginal  | NOT RUN |
| P56-10 | selfapproval/technicalrole/ลดชั้นหรือเพิ่มrecipientsโดยไม่review deny                                    | NOT RUN |
| P56-11 | policyversion/anchor/calendar/unknownofficialduration block destructiveexecution                         | NOT RUN |
| P56-12 | active/provisionalholdครอบrecord/document/file/derivatives/newversionตามscope                            | NOT RUN |
| P56-13 | hold releaseมีauthority/evidence/makerchecker/event ไม่autoexpireหรือเพิ่มreadgrant                      | NOT RUN |
| P56-14 | requestmanifest/sharedrefs/inventory/candidate revision/returned approval pin ไม่ขยายtarget              | NOT RUN |
| P56-15 | expiredretentionแต่hold/sharedobligation/unknownbackup/policypending ยังไม่ลบ                            | NOT RUN |
| P56-16 | native hold-vs-purge/allwriters/providerprotect barrierไม่มีacceptedholdถูกละเมิด                        | NOT RUN |
| P56-17 | storagetimeout/stalelease/versionhashdrift/idempotency/perartifact reconcile ไม่ลบlatestหรือfakecomplete | NOT RUN |
| P56-18 | approveddestroyคงauditdecision/actor/manifest/tombstone/sourcehistory ไม่ลบauditการทำลาย                 | NOT RUN |
| P56-19 | index/thumbnail/cache/export/replica/backuppartialรายงานจริง ไม่claimallcopiesgone                       | NOT RUN |
| P56-20 | transactionalhistoryแยกPIIfile/minimumaudit/metadataredactionpolicyไม่มีhiddenPIIcopy                    | NOT RUN |
| P56-21 | backuprestoreใช้hold/tombstone/currentACLก่อนexpose ไม่คืนdestroyedcontentอัตโนมัติ                      | NOT RUN |
| P56-22 | หลักฐานแชร์1/4/6/7และholdของownerอื่นป้องกันdeleteแม้localreferenceinactive                              | NOT RUN |
| P56-23 | DBapproval-audit-outbox failpoints/commitresponse/providerpartial/retrycurrentauth/receiptไม่ซ้ำ         | NOT RUN |
| P56-24 | privatehold/disclosure/destruction UIข้อความไทย/keyboard/4sizes/ไม่มีreasonลับในerrorหรือpublictracking  | NOT RUN |

[fixture56](fixtures/records-retention-56-plan.json) เป็น PLAN_ONLY expecteddescriptors/actual=NULL ไม่จริงหรือมีเจ้าหน้าที่รับรอง เกณฑ์56-01 mapP56-01–10/24 และ56-02 mapP56-11–23 ทั้งคู่ **BLOCKED / NOT RUN** ต้องruntime/nativeStorage/DB/API/browser/ownerpolicyหลักฐานจริง ไม่เริ่ม57
