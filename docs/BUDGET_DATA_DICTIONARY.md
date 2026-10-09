# Data dictionary งบประมาณ — บท 41

รุ่น 0.1 | 5 ตุลาคม 2569 (2026-10-05) | source `061673a` | **Proposal / BLOCKED — เป็นphysical contract ไม่ใช่DDLที่deployแล้ว**

ใช้ [BUDGET_SCHEMA](BUDGET_SCHEMA.md), [BUDGET_POLICY_CONFIG](BUDGET_POLICY_CONFIG.md), [DATA_DICTIONARY](DATA_DICTIONARY.md)logical04และ [ADR002](ADR/002-core-database.md) FiscalYearกลางเป็นmodelที่มีจริง ตารางอื่นในหน้านี้ยังไม่มีPrisma/migration ไม่แก้data_model.json128tablesหรือcoreโดยลัดADR

## 1 Common fields

FundingSource/BudgetPlan/Project/CostCenter/BudgetLineเสนอcommon fieldsดังนี้ (ชื่อmodelอ่านเข้าใจ mapคอลัมน์ด้านขวา) ชั้นทั้งหมดเสนอInternal/Restricted ต้องC03/O06รับรอง ไม่มีฟิลด์publicโดยdefault

| Model field / column | PostgreSQL / nullable | แหล่ง/FK/ข้อจำกัด |
| --- | --- | --- |
| id / id | uuid / ไม่ | PK gen_random_uuid() ไม่ใช้รหัสชื่อหรือเลขประชาชน |
| createdAt / created_at | timestamptz(6) / ไม่ | server UTC ไม่clienttime |
| updatedAt / updated_at | timestamptz(6) / ไม่ | server UTC |
| createdByActorId / created_by_actor_id | uuid / ไม่ | ServiceActorกลาง RESTRICT; provenance ไม่grant |
| updatedByActorId / updated_by_actor_id | uuid / ไม่ | ServiceActorกลาง RESTRICT |
| rowVersion / row_version | integer / ไม่ | default1; positive; CASก่อนmutation |
| isActive / is_active | boolean / ไม่ | defaulttrue ไม่ลบประวัติหรือให้publicvisibility |

immutableversion/linkrecordsใช้UUID/recordedAt/recordedByActorIdดังหัวข้อ8–9 ไม่ใช้updated_atแทนrecorded_atของหลักฐานย้อนหลัง Common auditไม่ใส่secret/ค่าข้อมูลส่วนตัวเต็มชุดในpayloadlog

## 2 FiscalYear — ใช้coreที่มีอยู่

ใช้commonfieldsที่มีจริง7ช่องและfieldต่อไปนี้ ไม่สร้างFiscalYearแยกต่อระบบ ตารางprivate.fiscal_yearมีrow_version_positive/ends_on>starts_on/CE1900–2200ในmigration06 ช่วงปีจริงยังQ017

| Field / column | ชนิด / nullable | ข้อจำกัด/ต้นทาง |
| --- | --- | --- |
| yearCode / year_code | text / ไม่ | uniqueตามcore |
| labelYearCe / label_year_ce | integer / ไม่ | ค่าCEในcore; UIแสดงBE ไม่persistdisplay_year_beจากlogical04ซ้ำ |
| startsOn / starts_on | date / ไม่ | date-onlyช่วงเริ่มรวมในcalendarpolicyที่pin |
| endsOn / ends_on | date / ไม่ | date-onlyปลายไม่รวม; corecheckends>starts |
| policyVersionId / policy_version_id | uuid / ไม่ | FK PolicyVersionกลาง RESTRICT |

AcademicYearกลางมีidentity/label/ช่วง/policyของตน เลขlabelเหมือนFYไม่ทำให้UUID/ความหมาย/ช่วงเท่ากัน ไม่joinด้วยlabelแทนFK calendarการเงินจริงต้องผู้รับผิดชอบยืนยัน ไม่เดาว่าเริ่มวันที่1ตุลาคมหรือเอาDEMOseedเป็นปีทางการ

## 3 FundingSource

| Field / column | ชนิด / nullable | ข้อจำกัด/ต้นทาง |
| --- | --- | --- |
| organizationId / organization_id | uuid / ไม่ | FK Organizationกลาง RESTRICT |
| sourceCode / source_code | text / ไม่ | K41-01 uniqueในองค์กร |
| labelTh / label_th | text / ไม่ | ชื่อแหล่งเงินสมมติในdev ไม่เดาหน่วยงานผู้ให้เงินจริง |
| currencyCode / currency_code | char(3) / ไม่ | pinกับpolicy currency; ไม่รับcurrencyจากclientเปลี่ยนยอดเดิม |
| policyVersionId / policy_version_id | uuid / ไม่ | FK PolicyVersion ruleการใช้แหล่งเงินที่ยืนยัน |
| evidenceDocumentId / evidence_document_id | uuid / ได้ | FK Documentกลาง RESTRICT; requiredก่อนapprovalตามpolicy |

เงื่อนไขใช้เงิน/หมวดที่อนุญาต/ช่วง/อำนาจอยู่ในpolicyมีรุ่น ไม่free-textเป็นbusinessdecision defaultsameorganizationbinding; การใช้แหล่งเงินข้ามองค์กรต้องpolicy+grant+หลักฐานชัดก่อนเปิด ไม่อนุมานจากชื่อแหล่งเงินกลาง

## 4 BudgetPlan

| Field / column | ชนิด / nullable | ข้อจำกัด/ต้นทาง |
| --- | --- | --- |
| organizationId / organization_id | uuid / ไม่ | FK Organizationกลาง |
| fiscalYearId / fiscal_year_id | uuid / ไม่ | FK FiscalYearกลาง; oneFYperplanversion |
| planCode / plan_code | text / ไม่ | seriescodeในorg/FY ไม่uniqueข้ามทุกปี |
| versionNo / version_no | integer / ไม่ | positive; K41-02 |
| titleTh / title_th | text / ไม่ | ชื่อแผน |
| validFromOn / valid_from_on | date / ไม่ | อยู่ในFY เริ่มรวม |
| validToOn / valid_to_on | date / ไม่ | อยู่ในFY ปลายไม่รวม มากกว่าstart |
| policyVersionId / policy_version_id | uuid / ไม่ | FK PolicyVersion currency/category/authorityที่pin |
| workflowInstanceId / workflow_instance_id | uuid / ได้ | FK engine11เมื่อพร้อม; draftยังไม่มีได้ |
| approvalDecisionId / approval_decision_id | uuid / ได้ | FK decision11ตรงresource/revision/hash; approvedต้องมี |
| evidenceDocumentId / evidence_document_id | uuid / ได้ | FK Document requiredตามpolicyก่อนsubmitted/approved |
| supersedesPlanId / supersedes_plan_id | uuid / ได้ | FK BudgetPlan RESTRICT seriesเดียว/รุ่นก่อน ไม่cycle |
| status / status | text / ไม่ | draft/approved/endedของแผนที่เสนอ; สถานะคำขออ่านจากWorkflowInstanceกลาง ไม่เพิ่มengineใหม่; statusไม่grant |

ไม่มีstoredtotalจากclient ยอดแผนคำนวณจากline/approvedallocationversionที่ตรงบริบทและcurrency ถ้าทำprojectionต้องpinversion/hashไม่sumทุกรุ่นพร้อมกัน

## 5 Project

| Field / column | ชนิด / nullable | ข้อจำกัด/ต้นทาง |
| --- | --- | --- |
| organizationId / organization_id | uuid / ไม่ | FK Organizationกลาง |
| projectCode / project_code | text / ไม่ | uniqueในorg K41-03 |
| titleTh / title_th | text / ไม่ | ชื่อโครงการ ไม่มีข้อมูลผู้สมัครส่วนตัว |
| startsOn / starts_on | date / ไม่ | เริ่มรวมของกิจกรรม |
| endsOn / ends_on | date / ไม่ | ปลายไม่รวม ends>starts |
| policyVersionId / policy_version_id | uuid / ไม่ | FK PolicyVersion |
| evidenceDocumentId / evidence_document_id | uuid / ได้ | FK Document requirementตามpolicy |

Projectไม่มีsinglefiscal_year_idหรือacademic_year_labelที่บังคับความหมายเดียว BudgetLineในหลายPlan/FYอ้างProjectเดียว; academiclinksตามหัวข้อ9; ExamSessionเชื่อมบริการกลางเมื่อระบบ5พร้อมตามlogical04 ไม่สร้างexamcopy

## 6 CostCenter

| Field / column | ชนิด / nullable | ข้อจำกัด/ต้นทาง |
| --- | --- | --- |
| organizationId / organization_id | uuid / ไม่ | FK Organizationกลาง |
| costCenterCode / cost_center_code | text / ไม่ | uniqueในorg K41-01 |
| labelTh / label_th | text / ไม่ | หน่วยรับผิดชอบต้นทุนชื่อสมมติ |
| validFromOn / valid_from_on | date / ไม่ | เริ่มรวมตามpolicy |
| validToOn / valid_to_on | date / ได้ | ปลายไม่รวมถ้ามี; ends>starts |
| policyVersionId / policy_version_id | uuid / ไม่ | FK PolicyVersion |

การเปิด/หมดอายุcostcenterไม่ให้หรือถอนRoleAssignmentเอง งานscopeใช้Auth/DAL07และOrganizationRelationที่ยืนยัน ไม่เชื่อcostcentercodeจากclientเป็นสิทธิ์

## 7 BudgetLine

| Field / column | ชนิด / nullable | ข้อจำกัด/ต้นทาง |
| --- | --- | --- |
| organizationId / organization_id | uuid / ไม่ | FK Organization/compositecontext |
| budgetPlanId / budget_plan_id | uuid / ไม่ | FK BudgetPlanร่วมorg/FY K41-04 |
| fiscalYearId / fiscal_year_id | uuid / ไม่ | contextFKFYเดียวกับplan ไม่ใช่academic_id |
| fundingSourceId / funding_source_id | uuid / ไม่ | compositeFK source/org/currency |
| projectId / project_id | uuid / ไม่ | FK Projectร่วมorg |
| costCenterId / cost_center_id | uuid / ได้ | FK CostCenterร่วมorg; requiredก่อนapprovalตามpolicyที่ยืนยัน ไม่สร้างdummycenter |
| categoryCodeId / category_code_id | uuid / ไม่ | FK ReferenceCodeกลุ่มbudget_categoryตามpolicy version ไม่free-textผังบัญชีที่เดา |
| categoryCodeSet / category_code_set | text / ไม่ | serverค่าคงที่budget_category + CHECK; compositeFKกับcategory_code_id→ReferenceCode(id,code_set) ต้องuniqueparentkeyผ่านmigration |
| lineCode / line_code | text / ไม่ | uniqueในplanversion K41-05 |
| currencyCode / currency_code | char(3) / ไม่ | source/planpolicyตรงกัน ก่อนaggregate/serialization |
| validFromOn / valid_from_on | date / ไม่ | subsetFY/plan/projectและpolicy availability |
| validToOn / valid_to_on | date / ไม่ | ปลายไม่รวม; ไม่ทับปีผิดด้วยlabel |
| policyVersionId / policy_version_id | uuid / ไม่ | FK PolicyVersionที่pin |

BudgetLinemetadataไม่มีavailable_balanceที่clientกำหนด การเก็บ/รวมยอดของversionและfuturepostingต้องtransaction/context/receiptตามschema ไม่รวมcurrencyต่างกันหรือรวมversionเก่าใหม่ซ้ำ

## 8 AllocationVersion

| Field / column | ชนิด / nullable | ข้อจำกัด/ต้นทาง |
| --- | --- | --- |
| id / id | uuid / ไม่ | PK gen_random_uuid() |
| recordedAt / recorded_at | timestamptz(6) / ไม่ | server UTCวันบันทึก ไม่วันมีผล |
| recordedByActorId / recorded_by_actor_id | uuid / ไม่ | FK ServiceActorกลาง RESTRICT |
| budgetLineId / budget_line_id | uuid / ไม่ | FK BudgetLine |
| versionNo / version_no | integer / ไม่ | positive uniqueในline K41-06 |
| rowVersion / row_version | integer / ไม่ | default1 positive; optimistic revisionร่างแยกจากversionNo; sealแล้วpayloadแก้ไม่ได้ |
| authorizedAmount / authorized_amount | numeric(20,2) / ไม่ | finite/nonnegative/range; stringingressก่อนcast ไม่binaryfloat |
| currencyCode / currency_code | char(3) / ไม่ | compositeFK budget_line_id+currency_code→BudgetLine(id,currency_code) และpolicyตรง |
| effectiveFromOn / effective_from_on | date / ไม่ | วันมีผลเริ่มรวมในlinewindow |
| effectiveToOn / effective_to_on | date / ไม่ | ปลายไม่รวมอยู่ในlinewindow; ช่วงมีผลที่resolveจากsupersessionไม่ทับซ้อน |
| policyVersionId / policy_version_id | uuid / ไม่ | FK PolicyVersion currency/rounding/authority/evidencepins |
| approvalDecisionId / approval_decision_id | uuid / ได้ | draftไม่มีได้; approved/effectiveต้องdecisionคนละcreator revision/hashตรง |
| evidenceDocumentId / evidence_document_id | uuid / ได้ | FK Documentกลาง requiredก่อนapprovalตามpolicy; FileVersion/hashผ่านscan/ACLต้องpinในproof |
| supersedesVersionId / supersedes_version_id | uuid / ได้ | FK AllocationVersion lineเดียว ไม่self/cycle ไม่overwriteเดิม |
| reason / reason | text / ได้ | requiredเมื่อแก้ตามpolicy Internal/Restricted ไม่public |
| payloadHash / payload_hash | text / ไม่ | canonicalcontext/amount/currency/policy/evidencehashไม่secret |
| status / status | text / ไม่ | draft/approved/effective/superseded/endedที่เสนอ แยกrequest/workflowจากeffectiveprojection |

การเปลี่ยนstatus/currentheadเก็บappend-only event/decisionที่engine11รองรับ ไม่แก้sealedamountเพื่อทำให้ยอดย้อนหลังดูตรง งานfutureledgerผูกapprovedversionและreversalที่ตรวจได้เมื่อถึงบทนั้น

## 9 ProjectAcademicYear

| Field / column | ชนิด / nullable | ข้อจำกัด/ต้นทาง |
| --- | --- | --- |
| id / id | uuid / ไม่ | PK gen_random_uuid() |
| recordedAt / recorded_at | timestamptz(6) / ไม่ | server UTC |
| recordedByActorId / recorded_by_actor_id | uuid / ไม่ | FK ServiceActorกลาง |
| projectId / project_id | uuid / ไม่ | FK Projectกลาง |
| academicYearId / academic_year_id | uuid / ไม่ | FK AcademicYearกลางคนละFKกับFY |
| validFromOn / valid_from_on | date / ไม่ | เริ่มรวมในproject/AYที่ระบุ |
| validToOn / valid_to_on | date / ไม่ | ปลายไม่รวม ต้องends>start |
| policyVersionId / policy_version_id | uuid / ไม่ | FK PolicyVersionรับรองmappingและcalendar |
| evidenceDocumentId / evidence_document_id | uuid / ได้ | FK Document provenanceตามpolicy |

บันทึกmappingจากหลักฐาน ไม่inferAYจากFYlabel ในตัวอย่างปีศึกษา2027เชื่อมprojectแล้วlineอยู่FY2026และFY2027ได้เมื่อช่วงตรง ต้องnativeFK/timequeriesจริงตามP41-07–10 ทั้งdictionary/constraints/history/schema ยังProposalไม่มีDDLใหม่
