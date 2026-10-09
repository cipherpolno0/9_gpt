# Schema contract คำขอหน่วยงานและสนามสอบ — บท 30

รุ่น 0.1 | 4 ตุลาคม 2569 | **Proposal / BLOCKED — ไม่ใช่ Prisma schema ที่ migrate ได้**

อ่าน [ORG_CENTER_REQUESTS](ORG_CENTER_REQUESTS.md), [DATA_DICTIONARY](DATA_DICTIONARY.md), [WORKFLOW_ENGINE](WORKFLOW_ENGINE.md), [ADR002](ADR/002-core-database.md), [ORGANIZATION_TYPES](ORGANIZATION_TYPES.md), [EXAM_SESSIONS](EXAM_SESSIONS.md) และ [ADDRESS_VALIDATION](ADDRESS_VALIDATION.md) physical schema core 0.6.0 ยังไม่มี User/ChangeRequest/RequestVersion/Workflow/FileVersion/ExamCenter/CenterSession ที่ FK เหล่านี้อ้าง

## 1 เจ้าของข้อมูลและการต่อ schema เดิม

ChangeRequest/RequestVersion เป็นหัวคำขอและ revision กลางร่วม PersonChangeRequest ระบบ1 ใช้ canonical workflow11 และ operation receipt/audit/outbox กลางเดิม OrganizationChangeRequest/ExamCenterChangeRequest เสนอ typed extension 1:1 ไม่สร้าง owner/request status/approval history อีกแหล่งที่เขียนคู่กัน เป้าหมายต้อง derive จาก server binding ห้ามใช้ `target_kind + arbitrary UUID` ที่ไม่มี FK หรือ org_id client เป็นสิทธิ์

| แบบเดิม04/11                                                         | สิ่งที่ต้องปรับก่อน implementation30                                                                                                                                | ผลที่ต้องรักษา                                                                                      |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| ChangeRequest.subject_kind/target_person/organization/center_session | เพิ่ม typed binding สำหรับ existingOrganization, proposedOrganization, existingExamCenter+ExamSession เมื่อ OPENยังไม่มีCenterSession; existingPersonของระบบ1คงเดิม | เลือก family และ FK จริง exactly-one ตามชนิด ไม่สร้างgeneric writable resourceที่ข้ามFK             |
| ChangeRequest.request_status awaiting_effect/activated ในlogical04   | mapเป็น canonical approved/effective ของ11 ผ่านADR/migrationทั้งหมดก่อนใช้จริง                                                                                      | activation conditionเป็นmetadata ไม่ให้สองenumบอกผลต่างกัน                                          |
| RequestVersion.proposed_changes JSONB + evidence_document_idเดี่ยว   | ใช้ typed organization/center revision และ RequestEvidence join ที่pinFileVersion/hash; JSONเฉพาะvalidatedoptional fieldsไม่ใช่FK/status/effectcode                 | sealedversionimmutable ไม่เก็บFKสำคัญหรือหลักฐานทั้งหมดในJSONลอย ๆ                                  |
| จัดตั้งใช้Organizationร่างในแบบ04                                    | เสนอเก็บ typed proposalในOrganizationChangeRevisionก่อน; resolve/reuseหรือcreate centralOrganizationเฉพาะeffectที่อนุมัติ                                           | rejected/cancelledไม่สร้างactiveทะเบียน ไม่ต้องทำdraftOrganizationที่currentqueryมองเป็นทะเบียนจริง |
| ActivationRecord unique(request_version_id) + StatusEvent            | เพิ่มtyped activatedtarget binding/create receipt เมื่อจัดตั้ง; sameapprovedversion/decision/context FK/guard; effect receiptหนึ่งตามversion                        | effect/history/provenanceต้นทางยังตรวจได้ ไม่สร้างทะเบียนหรือactivation ledgerอีกชุด                |

ข้อเปลี่ยนนี้ยังต้องปรับ DATA_DICTIONARY/ERD/ADR/migration พร้อม owner adaptersเมื่อ dependency พร้อม ไม่แก้ logical04ให้ดูเหมือนมีphysicalFKจริงในบทนี้ และไม่แก้ migration core เดิมให้แอบเพิ่มตาราง

## 2 รูปแบบและฟิลด์ร่วมเสนอ

ทุก PK ใช้ UUID `gen_random_uuid()`; Prisma modelอ่านรู้เรื่อง mapตาราง/คอลัมน์เป็นsnake_case schemaprivate; FK RESTRICT; created_at/recorded_at timestamptz, effective_on Gregorian date; row_version integer>=1; recordsที่seal/decision/effect append-onlyตามpolicy เก็บ supersedes/source refs ไม่physicaldeleteประวัติ

หัว ChangeRequest กลาง: id/request_code unique/requester_account_id FKบัญชีกลาง/creator provenance/policy_version_id FK/current_request_version_id/row_version/current workflow binding ส่วน RequestVersion: id/change_request_id FK/version_no>=1 unique(change_request_id,version_no)/effective_on/sealed_at/hash/submitted_at/recorded_at/current typed form/rule refs Version-to-header composite FKต้องตรง ChangeRequest ไม่ให้เอารุ่นคำขออื่นมาอนุมัติ

คำขอมี Family ORGANIZATION หรือ EXAM_CENTER และ operationจากconfigurationที่pin ไม่ใช้enumเดียวเปลี่ยนtypeองค์กร/typeสอบ/สถานะคำขอ/สถานะมีผล Scope/คนเสนอ/หน่วยผู้ร้องอ่านจาก currentverified User/Person/Organization grants ไม่มี defaultALLOWจากcreatorอย่างเดียว

## 3 Typed extensions เสนอ

| Concept/modelเสนอ          | ตาราง mapเสนอ                | ฟิลด์/typed FKและข้อบังคับ                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OrganizationChangeRequest  | organization_change_request  | change_request_id UUID PK/FKกลาง1:1; operation_code ESTABLISH/DISSOLVEจากrule; target_organization_id nullable FKOrganizationเดิม; target_type_id FKOrganizationType; ESTABLISHอาจexistingtargetเพื่อreuseตามapprovedidentitypolicyหรือproposalใหม่ DISSOLVEต้องexistingtarget; headerไม่เป็นสถานะทะเบียน                                                                                                               |
| OrganizationChangeRevision | organization_change_revision | request_version_id UUID PK/FK1:1; organization_change_request_id FK+compositeversionowner; target_base_row_version nullableเมื่อไม่มีexistingtarget; proposed_organization_code/nameเฉพาะESTABLISH; proposed_host_organization_id/proposed_parent_organization_id/relationship_type_id nullabletypedrefsตามกฎ19; form_rule_version refs; effective_onจากRequestVersionไม่copyแหล่งเวลา; exactlyvalidpayloadตามoperation |
| ExamCenterChangeRequest    | exam_center_change_request   | change_request_id UUID PK/FK1:1; exam_center_id required FKExamCenterกลาง; exam_session_id required FKExamSession; exam_type_id required FKExamTypeและcompositeFKsession/type; scope_code ROUNDเสนอ; operation OPEN/CLOSE/MOVEจากrule; center_session_id nullableเฉพาะOPENที่ยังไม่มี; ถ้ามี compositecontext(center,session)ต้องตรง; CLOSE/MOVEต้องexistingCenterSession                                               |
| ExamCenterChangeRevision   | exam_center_change_revision  | request_version_id UUID PK/FK1:1; exam_center_change_request_id FK+compositeversionowner; target/plan expectedversions; from_location_id/to_location_id typedFKOrganizationLocation/AddressVersionตาม20; MOVEปลายทางต้องvalidated/verifiedtime/context; OPENoffering/level/area/capacityเสนอผ่านbindingsตาม21ไม่รับJSONที่clientสั่งสร้างFKเอง; immutabletyped revisions                                                |
| RequestEvidence            | request_evidence             | id UUID; request_version_id FK; evidence_requirement_code/config FK; file_version_id FKกลาง10/document binding/hash/recorded_at/provenance; unique(request_version_id,evidence_requirement_code,file_version_id); scan/ACL/ownerตรวจปัจจุบันแต่hashตรึง ห้ามhashclientเป็นผลscan                                                                                                                                        |
| RequestTypeConfiguration   | request_type_configuration   | id UUID; configuration_code/version_no unique; PolicyVersionFK; family/operation/allowedOrganizationType-or-ExamType typedbindings; formtemplateversion/workflowdefinitionversion refs; required evidence/authority/target scope/conflict rule/effective time/window/purpose/retention refs; source_fileversion/issuer/evidence/status Proposalหรือconfirmedscope ไม่run codeจากconfig                                  |

FormTemplateVersion/RuleVersion/WorkflowDefinition มีต้นทางกลางตามADRและแบบ11 เมื่อเพิ่มจริงต้องกำหนดownermodelก่อน ไม่สร้าง form-template/PolicyVersionอีกสำเนาเพื่อเติมชื่อในตารางนี้ Allowedtype/evidence requirementsที่ใช้เป็นFKต้องjunctiontyped tables ไม่ JSON/free-text ที่เปลี่ยน contextได้โดยข้ามconstraint

ESTABLISHแบบproposalใหม่ต้องมีvalidatedproposedidentity+typeและsealedrevision binding; target_organization_idไม่มีจนeffect ไม่ยอมDISSOLVEโดยไม่มีexistingtarget เมื่อeffectตรวจunique/identityอีกครั้งและcreate/reuseOrganizationผ่านเจ้าของอย่างatomic จัดตั้งหน่วยการศึกษาภายในวัดเดิมต้องใช้identity/ความสัมพันธ์ที่รับรอง ไม่สร้างวัด/ที่อยู่สำเนาใหม่ การactivateบันทึกactualOrganizationFKในActivationRecord/sourcebindingเพื่ออ่านต้นทางได้โดยไม่แก้sealedproposal

OPENใช้ExamCenterแม่บทที่ระบบ2สร้าง/ยืนยันแล้ว จึงไม่ทำทะเบียนExamCenterใหม่ในระบบ4 หากยังไม่มีแม่บทต้องเข้าขั้นทะเบียนกลางที่รับรองก่อน PendingOPENไม่มีCenterSessionใช้งานจริง; effectเท่านั้นcreate/reopenCenterSessionตามapprovedruleและunique(exam_center_id,exam_session_id) ของ21 ไม่harddeleteรอบเดิมหรือcreateแม่บทต่อปี/ระดับ CLOSE/MOVEของROUNDไม่เปลี่ยนแม่บท/อีกtype/อีกปีโดยปริยาย

## 4 Constraints, concurrency และ indexes

| Constraint ref | สิ่งที่ต้อง enforceจริงเมื่อmigrate                                                                                                                        | การตรวจรับ      |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| SC30-01        | PK/RESTRICTFK/header-extension1:1/RequestVersion-owner compositebinding; exactlyone family extensionและtypedtargetตามoperation                             | P30-01/04/13    |
| SC30-02        | OrganizationType allowedpair/ExamSession-ExamType/contextCenterSession/locationowner/leveltype binding ไม่nullableuniqueที่ปล่อยwrongcontext               | P30-01/04/12    |
| SC30-03        | request_code unique; canonicalorganization_codeunique06; center-sessionunique21; naturalopportunity/operationreceipt fingerprint/activationversionunique11 | P30-02/06/11    |
| SC30-04        | sealedrevision/evidencebinding/approveddecisionmanifestimmutable; optimisticCAS/reviewcycle/terminaltransition guards                                      | P30-02/05/08/13 |
| SC30-05        | target/identityplan lock + expectedversions + effective timeline/incompatibilityrule ภายใต้native transaction; type/sessionต่างกันไม่blanketconflict       | P30-06/07/09/10 |
| SC30-06        | liveapprovedversion/currentauthority/effective_on/impact/scanACL + atomicdomainstatus/activation/audit/outbox; rejected/cancelledไม่มีactivation           | P30-02/03/08–11 |
| SC30-07        | private ENABLE/FORCE RLS/limitedruntime write/serverDAL/fieldpolicy/prooftrackingทุกread/write/export/print/download/job; makerchecker                     | P30-03–05/10/14 |
| SC30-08        | status/historyeffective interval valid/recorded_at/replace-provenance; no public secret/evidence/rawreason cache; noautomaticRoleAssignmentหรือใบสมัครย้าย | P30-02/09/12–14 |

CHECKใช้กับค่าภายในแถวที่ทำได้ FK/uniqueใช้กับbindingsที่กำหนด ส่วนexactlyone extension/ข้ามrow/time/authorityต้องconstraint triggerหรือownertransaction/limitedwritepathที่ออกแบบและทดสอบ ไม่อ้างPrisma CHECKธรรมดาบังคับทุกอย่างได้ Pendingplanที่มีผลวันเดียวกันไม่ใช้unique(requesttype,effective_on) เพราะOPEN/CLOSEคนละtypeอาจขัดกัน และdifferenttargetอาจไม่ขัดกัน ต้องcanonicaltarget dimensionและruleจริง

ดัชนีเลือกจากqueue/requester+status/time, target+status/effective_on, evidenceversionและworkflowcontextที่queryจริง ไม่เพิ่มindexซ้ำPK/uniqueหรือทุกFKโดยอัตโนมัติ ต้องEXPLAINก่อนรับรองperformance ห้ามเอาfullreason/source/evidence textไปpublicsearchindex

## 5 No-effect invariant

request mutationsก่อนeffectiveเขียนเฉพาะrequest/revision/decision/intentclaim/receipt/audit/outboxคำขอ ไม่เรียกOrganization/CenterSession activation adapter เหตุการณ์ `request.rejected`/`request.cancelled` ไม่ใช่domainstatus eventและconsumerห้ามใช้เป็น“ปิด”หรือ“ยุบ” ต้องใช้typed event family/approvedactivation source/versionที่ตรวจได้ พร้อมnative capabilitytests ไม่ใช้absenceoftables/ไม่มีconsumerอ้างPASS

คำขอที่failed/returned/rejected/cancelledไม่มีactiveorganization/status/location/relation/application/seat/role changes แม้workerเก่าถูกreplayหรือclientส่งstatus=effective การactiveeffectมีcurrentguard/uniqueActivationRecord/requestversion/receipt/leaseและtransactionครบ เกณฑ์นี้ต้องbefore-aftermanifestassertจริงไม่ใช่จำนวนrequestsหรือresponse403

## 6 สถานะจริง

สัญญาtyped extensions 6แนวคิด/constraints8ข้อ/coverage10กรณีเป็นProposal; physicalschema0.6.0/Prisma7.10.0/core19models/213scalarfields/migration1เดิม ไม่มีmigration/seedเพิ่ม ทุกP30NOT RUN ต้องผ่าน29และfoundation/หน่วยงาน19–22แล้วตกลงADR/dictionary/ERD/typedbindingsก่อนสร้างmigration/servicesตามMASTER ไม่เลื่อนไป31จากschema contract
