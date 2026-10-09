# ร่างหนังสือ ตรวจและอนุมัติส่ง — บท 54

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | source `0585b6c` | **Proposal / BLOCKED — ไม่มี draft/review/preview pages หรือ services จริง**

บท53/ส่วนกลางยังไม่ผ่าน `corepack pnpm db:test` รอบ54exit1 core19modelsไม่มีRecordVersion/FileVersion/recordACL/WorkflowInstance สารบรรณมีREADMEเท่านั้น รอบนี้ทำสัญญากับ [workspace](CORRESPONDENCE_WORKSPACE.md), [previewsecurity](RECORD_PREVIEW_SECURITY.md), [fixture54](fixtures/correspondence-54-plan.json) PLAN ONLY ไม่สร้างworkflow/login/upload/registryอีกชุดหรือส่งหนังสือจริง

ใช้ [RECORDS_REGISTER_POLICY](RECORDS_REGISTER_POLICY.md), [E_OFFICE_SCHEMA](E_OFFICE_SCHEMA.md), [RECORD_DOCUMENT_ACCESS](RECORD_DOCUMENT_ACCESS.md), [WORKFLOW_ENGINE](WORKFLOW_ENGINE.md) ร่วมกัน เลขทะเบียนไม่เป็นคำอนุมัติ คำอนุมัติส่งไม่เป็นการส่ง/ผู้รับรับทราบ/ลายเซ็นดิจิทัลทางการ ไม่มีsigning-providerหรือtemplateทางการที่ยืนยัน

## 1 เริ่มร่างด้วยข้อมูลกลาง

1. เลือกCorrespondence/ประเภท/หน่วยงานตาม53 พร้อมcurrentaccount/action/scope/delegation/recordACL เวลาและfieldpolicy serverตรวจทุกช่องทาง ไม่ทำทะเบียนร่างแยกจากCorrespondence/RecordVersion
2. กรอกsubject/bodyแบบstructured rich text เลือกSignerจากPersonกลางพร้อมrole/Organization/evidenceที่กำหนด SignerPersonไม่เท่ากับapprover account ไม่เพิ่มอำนาจจากตำแหน่งหรือชื่อฝ่าย ต้องตรวจauthority/ช่วงมอบหมายและbindingที่ยืนยัน
3. เลือกRecipientsจากPersonหรือOrganizationกลางโดยรหัสและcontextสังกัด/หน้าที่ชัดเจน ตรวจcurrentidentity/currentaccess ไม่ใช้ชื่อ/emailเป็นkeyหรือเลือกคนแรกอัตโนมัติ เก็บRecipientSnapshotและselection-confirmationที่อ้างrecipient-set digest ชื่อเดิม/คนชื่อเหมือนยังPersonเดิมตามทะเบียน
4. แนบDocument/FileVersionserveridผ่านบริการ10 ต้องcurrentCLEAN/ACL/hash/compositebinding ชนิดที่อนุญาต ไม่รับrawobjectkey/signedURLหรือcopybinaryเพราะหลายโมดูลอ้าง กำหนดreview_dueที่มีcalendar/timezoneและpolicyตาม53 ไม่ใช้เวลาbrowserเป็นauthority
5. SaveDraftใช้expected_revisionและidempotencyreceipt11 Currentdraftแก้ได้ตามสถานะ; source/version/CASเปลี่ยน→conflictที่อ่านเข้าใจ คนสองคนหรือautosaveเก่าไม่ทับrevisionใหม่ ตรวจrequirementsฝั่งserverทั้งsubmit/review/approve ไม่client-only

## 2 รุ่นและวงรอบตรวจกลาง

ก่อนsubmit sealcandidate RecordVersionพร้อมcanonical digestของsubject/validatedbodyAST/signeridentity-context/recipientidentities-snapshots/attachmentsIDs-hashes/template/layout/font/content-policy versions/reviewdue/priority/confidentiality/source referencesและpermission-plan versionที่เสนอ หากมีgrantplanเพื่อส่งต้องตรวจอนุมัติตามบริการกลาง ไม่hashliveACL/scan/delivery/status/URL/token/simulationflagsเป็นเนื้อหา

Workflow54เป็นการใช้Definition/Instance/StepDecisionของ11ชนิดcorrespondence review ไม่สร้างengineเฉพาะสารบรรณ Reviewcycleทุกครั้งต้องpincandidate RecordVersion/digest/definition version; returnedcorrectionและmaterialeditเพิ่มRecordVersionและcycleใหม่ในrootCorrespondenceเดิม คำตัดสินเดิมคงimmutableและสืบรุ่นได้ ต้องADRสัญญาopen-next-cycleของ11ก่อนimplementation ถ้าengineยังไม่รองรับให้blockไม่เขียนengineทดแทน

| สถานะเรื่อง/วงรอบ          | Actionเสนอ                                          | ผล/ข้อบังคับ                                                                                                                                  |
| -------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| draft                      | save/validate/preview/submit                        | previewอ้างrevisionเฉพาะ ไม่มีapproved/send status; submitเมื่อrequirementsครบและserverrecipientconfirmตรง                                    |
| submitted/reviewing        | reviewerอ่านcandidate→เสนอความเห็น/return           | Currentauthorityกับpinnedhash/revision/หลักฐานครบ ความเห็นอยู่privateไม่fulltextaudit; notificationไม่ack                                     |
| returned                   | makerแก้เป็นcandidateใหม่→submit next cycle         | rootเรื่องเดิม decision/ไฟล์/recipientรุ่นก่อนคงอยู่ revisionเก่าไม่approveปนรุ่นใหม่                                                         |
| reviewing                  | approverอนุมัติหรือrejectพร้อมเหตุผล/หลักฐาน        | ผู้สร้างroot/ผู้แก้สาระสำคัญรุ่นนั้นห้ามapproveเอง verifiedPersonเดียวหลายaccountไม่หลบmakerchecker ผู้ลงนามหรือtechroleไม่grantเอง           |
| approved                   | สร้างApprovedRecordSnapshot/อนุมัติส่งที่pinทุกส่วน | snapshot immutableและreviewCycle/hash/evidence/currentapprovedpermit; ยังไม่SENT/ACK/SIGNED                                                   |
| approvedแล้วมีmaterialedit | holddispatchก่อนเพิ่มcandidate/nextcycle            | ถอนactiveส่งpermitของรุ่นเดิมโดยevent/CAS transactionเดียว แต่เก็บคำอนุมัติเก่าไว้เป็นhistory ไม่เปลี่ยนสถานะย้อนหลังว่าคนเดิมapproveรุ่นใหม่ |
| rejected/cancelled         | เก็บreason/evidence/history                         | ไม่ส่ง/ไม่ลบFileVersion/เลขทะเบียน VOIDตาม53แยกขั้นอำนาจ ไม่คืนเลขเงียบ ๆ                                                                     |

Materialeditรวมsubject/body/signer/recipients/attachments/template-render/font/ASTschema/calendar/rendereddate/timezone/sanitization policy/reviewdue/priority/confidentiality/grantplan/sourceสาระสำคัญ ค่าที่ไม่ใช่เนื้อหาเช่นcurrentaccessrevoke/scanrecall/deliveryไม่rewriteapproveddigest แต่blockการใช้งานตามpolicyปัจจุบัน การเปลี่ยนDocument.latestเป็นV2โดยไม่ได้แก้recordreference ไม่autoแทนV1 และไม่อนุมัติV2จากคำตัดสินV1

## 3 ตรึงสิ่งที่ได้รับอนุมัติ

ApprovedRecordSnapshotเสนอเป็นimmutablebindingของ53approval_evidence+11StepDecision/candidate version ไม่ทะเบียนใหม่ เก็บ record_version_id/reviewcycle/definition version/approvedcanonicaldigest/template-font-layout-content versions/signer snapshot/recipientsethash/attachmentID+bytehash/previewmanifesthash/artifact FileVersionเมื่อมี/ผู้ตรวจ-ผู้อนุมัติ/evidence/decided_at/recorded_at ตัวเลข revisionหรือfileidเพียงอย่างเดียวไม่พอถ้าข้อมูลถูกเขียนทับได้

approveใช้currentaccount/purpose/action/role+scope+time/delegation/makerchecker/fileACL/CLEAN/requirements/recipientconfirmationในtransactionกับrecordsource-CAS/decision/snapshot/activepermit/audit/outbox Uniqueactiveapprovalตามroot/cycleและbusinessreceiptต้องรองรับการอนุมัติแข่งเพียงครั้งเดียว ไม่sharebrowserstateเป็นหลักฐานapprove ต้องglobal lock/revoke/source-validation protocolร่วม11/53ก่อนnativeproof

Review must approveสิ่งที่previewนั้นแสดง: subject/body/signer/recipientset/attachments/template/data/font/layout/content-policyตรงcandidate manifest Ifservercanonicalization/rendererเปลี่ยนสิ่งที่เห็น ต้องcandidateและreviewใหม่ ไม่sanitizeหรือre-renderสาระสำคัญหลังอนุมัติแล้วใช้approvedhashเก่า หากpolicysecurityใหม่บล็อกoutputรุ่นเก่าให้hold/reviewใหม่ไม่แอบปรับhtmlแล้วส่ง

## 4 Guard ก่อนส่งที่โมดูลส่งต้องใช้ภายหลัง

Contract `authorizeApprovedDispatch(record_version_id, approved_snapshot_id, expected_root_revision)` ตรวจcurrentroot.activepermit/cycle/approvaldigest/currentauthorities/signerและrecipientcontext/record-source-fileACL/currentCLEAN/dependencies ส่งคืนopaqueimmutablemanifestเฉพาะเมื่อครบ ไม่รับsubject/body/recipientlist/template/filebytesใหม่จากclientหรือlookupDocument.latestแล้วส่งโดยใช้approvalเก่า หลักฐานอำนาจผู้อนุมัติตรวจ ณ เวลาตัดสินและapproval-validity policy ส่วนsender/worker/enqueuerตรวจgrantปัจจุบัน ไม่อนุมานว่าapproverต้องอยู่ตำแหน่งตลอดไปหรือให้olddecisionเพิ่มสิทธิ์sender officialdispatchต้องมีtemplate/อำนาจ/ข้อกำหนดที่ยืนยันตามpolicy; DEMOmanifestในfixtureเป็นreferencevalidation ไม่เป็นpermissionส่งจริง ไม่มีdispatch/routing/deliveryserviceที่implementใน54

- หากRecordVersionแก้หลังอนุมัติแต่ยังไม่reviewใหม่ → hold/conflict ไม่มีapproveddispatchmanifestใหม่ คำตัดสินV1ยังเป็นhistoricalแต่ไม่permitส่งV2
- หากbytehash FileVersionV1เปลี่ยนทั้งที่IDเดิม → integrity incident/quarantine/deny; อย่าแก้approvedhashให้ตรงหรือใส่bytesใหม่ ต้องauthorizedcentralrecoveryและreviewตามpolicy
- หากDocumentสร้างV2ที่ยังไม่ผูกcandidate → recordV1ยังpinV1 การเปิดpreviewรุ่นใหม่ต้องlabelชัด ไม่เอาV2ไปเป็นattachmentV1
- หากผู้รับ/ที่มอบหมาย/ACL/sourceเปลี่ยน → re-evaluate/holdตามpolicy ไม่เลือกคนรับแทนหรือpublicizefileอัตโนมัติ ผู้รับที่ไม่มีบัญชี/routeที่ยืนยันไม่autocreateบัญชีหรือส่งemailเอง
- การเปิดpreview/GET/print/PDFsave/notificationไม่allocateเลข/approve/send/ack การส่งจริง/receipt/signature/providerอยู่บทที่ผู้ใช้สั่งถัดไปไม่ทำล่วงหน้า รอบนี้ไม่ส่งข้อความถึงบุคคลใด

## 5 กรณีตรวจเมื่อ implementationพร้อม

| Case   | หลักฐานที่ต้องได้จริง                                                                              | สถานะ   |
| ------ | -------------------------------------------------------------------------------------------------- | ------- |
| P54-01 | draftsave/resume/autosave-old-revision/สองคนแก้/requirementsserver/currentauth                     | NOT RUN |
| P54-02 | subject/body/signer/recipient/file/reviewdueครบ/ไม่ครบทั้ง4registertypes                           | NOT RUN |
| P54-03 | submit→review→returned→candidateใหม่→review→approve rootเดิม/historyครบ                            | NOT RUN |
| P54-04 | maker/rootcreator/สาระสำคัญeditor/verifiedsamePerson/tech-role APIapprove deny                     | NOT RUN |
| P54-05 | approversสองnativeconnections/CASหนึ่งdecision/snapshot/outboxธุรกรรมเดียว                         | NOT RUN |
| P54-06 | previewedmanifest/approvalsnapshot/templatefont/attachments/recipientsethashตรง                    | NOT RUN |
| P54-07 | editทุกmaterialfieldหลังapproval holdactivepermit/cycleใหม่ olddecisionคงอยู่                      | NOT RUN |
| P54-08 | crafteddispatch requestV2/body/recipient/file/templateใหม่หรือoldrootrevision deny                 | NOT RUN |
| P54-09 | FileVersionIDเดิมbytesเปลี่ยน/documentlatestV2ไม่autouseV2/scanrecall deny                         | NOT RUN |
| P54-10 | recipientsชื่อเหมือน/หนึ่งPersonหลายcontext/forgedIDs/ambiguousname/currentgrants                  | NOT RUN |
| P54-11 | HTML/script/event/SVG/MathML/JS-URL/style/unknownASTnode/attrs/JSONprototypeinput                  | NOT RUN |
| P54-12 | safeASTtextที่มีscript-looking text renderเป็นliteralไม่execute ทุกscreen/print/error              | NOT RUN |
| P54-13 | paste/server import malformed/oversize/deepAST/renderer policyversionเปลี่ยน                       | NOT RUN |
| P54-14 | attachmentscurrentCLEAN/ACL/hash/privatepreview ไม่มีactiveembed/remotecontentfetch                | NOT RUN |
| P54-15 | DEMOtemplate watermark/officialunknown deny Sarabun/A4/fontsloaded/privatePDFprint                 | NOT RUN |
| P54-16 | samepreviewmanifest screen/print/export exactThai/longtext/pagination/version/revoke               | NOT RUN |
| P54-17 | crossorg record-source-fileACL fieldpolicy/HTMLcache/static/search/worker/CSRFdeny                 | NOT RUN |
| P54-18 | failpointdraft/submit/approval/hold/snapshot/receipt/auditoutbox precommitrollback postcommitretry | NOT RUN |
| P54-19 | keyboard/Thai labels/focus/conflict/emptystate 375/768/1024/1440                                   | NOT RUN |
| P54-20 | preview/GET/PDF/notificationไม่send/ack/signature/register grant คำอนุมัติไม่signedofficial        | NOT RUN |

Nativeprotocolสองconnections/barrier/observer/limitedroles/SQLSTATE/boundedretry/currentrevokeและprivateexecutionmanifestตาม11/53 ต้องmodel/migration/servicesจริงก่อน db:testcore06ไม่P54runner แต่ละcaseต้องexpected/actual/commit/DB-migration-policy versions/hash/decision/evidence/receipt/UIproof/ผู้ตรวจ/เวลา/issue ห้ามPGlite/mock/sanitizerreference/textescapeเป็นbrowserXSS PASS

เกณฑ์54-01ผูกP54-03–09/14/16–18/20 เกณฑ์54-02ผูกP54-10–14/17/19 ทั้งสอง **BLOCKED / NOT RUN** ไม่มีactualapprovedsnapshot/preview/browser/PDF/sanitizer/recipientselection โค้ด54ยังต้องแผนตามMASTERข้อ2และdependencyที่พร้อม ไม่เริ่ม55
