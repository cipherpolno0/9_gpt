# สัญญาโครงสร้างงบประมาณ — บท 41

รุ่น 0.1 | 5 ตุลาคม 2569 (2026-10-05) | source `061673a` | **Proposal / BLOCKED — ไม่มี budget Prisma models/migration/services จริง**

## 1 สถานะและแนวคิด

บท40ยังBLOCKEDตาม [UAT_SYSTEM_05](UAT_SYSTEM_05.md) ส่วนกลางAuth/DAL/files/workflow/outboxและnativeDBยังไม่ผ่าน มีFiscalYear/AcademicYear/Organization/ReferenceCode/PolicyVersion/Document/ServiceActorกลางจริงในPrisma0.6.0 แต่โมดูลbudgetมีREADMEเท่านั้น ไม่มีFundingSource/BudgetPlan/Project/CostCenter/BudgetLine/AllocationVersion/ProjectAcademicYear จึงจัดschema contractและ [BUDGET_DATA_DICTIONARY](BUDGET_DATA_DICTIONARY.md) ก่อน ไม่สร้างDDLที่ขาดต้นทางสิทธิ์หรืออ้างว่ารันmigrationใหม่แล้ว

ขั้นแรกแยก “ปีที่จัดสอบ” ออกจาก “ปีที่ใช้เงิน” โครงการหนึ่งอ้างปีการศึกษาผ่านProjectAcademicYear แล้วมีBudgetLineในBudgetPlanของปีงบหลายปี แต่ละรายการมีFY/แหล่งเงิน/หน่วยงาน/currencyที่ชัด ขั้นถัดไปเก็บเงินเป็นข้อความทศนิยมที่ตรวจแล้วและNUMERIC ไม่คำนวณด้วยNumber สุดท้ายแยกdraft/approved/effective allocation versionsและหลักฐาน เพื่อไม่เปลี่ยนยอดย้อนหลังเมื่อแก้แผน

ใช้เว็บไซต์และฐานเดียวทั้ง9ระบบ ไม่สร้างOrganization/Person/บัญชี/เอกสาร/ปีอีกชุด **ยังไม่เชื่อม NBMS ธนาคาร หรือระบบบัญชีภายนอก และไม่อ้างว่าเป็นระบบบัญชีทางการ** งานจอง ผูกพัน เบิก จ่าย โอนและปิดงวดในBLUEPRINTยังอยู่นอกimplementationบท41

## 2 Models และความสัมพันธ์ที่เสนอ

| Model / table | หน้าที่และความสัมพันธ์ | สถานะ |
| --- | --- | --- |
| FiscalYear / private.fiscal_year | ใช้UUID/ปีCE/date range/PolicyVersionของcore06เดิม แสดงพ.ศ.ในUI | มีจริง ยังไม่ผ่านnativeDB gate |
| FundingSource / private.funding_source | แหล่งเงินของOrganization รหัส ชื่อ currency/policy/evidenceที่pin | logical04มี ไม่มีPrisma |
| BudgetPlan / private.budget_plan | แผนของOrganizationหนึ่งFiscalYear plan_code/version และช่วงใช้แผน | delta41เสนอ ไม่มีmodel |
| Project / private.project | โครงการกลางของOrganization มีช่วงดำเนินงาน คร่อมหลายปีงบได้ ไม่มีFYเดียวบังคับทั้งโครงการ | logical04มี ไม่มีPrisma |
| CostCenter / private.cost_center | หน่วยรับผิดชอบต้นทุนในOrganization รหัส/ชื่อ/ช่วงใช้งาน เป็นfinancial dimension ไม่ให้เว็บไซต์grantอัตโนมัติ | delta41เสนอ ไม่มีmodel |
| BudgetLine / private.budget_line | FK BudgetPlan/FiscalYear/FundingSource/Project/CostCenter/หมวดReferenceCode ช่วงใช้งบและcurrency | logical04มี ต้องเพิ่มtypedbindings ไม่มีPrisma |
| AllocationVersion / private.allocation_version | snapshotยอดจัดสรรรวมที่อนุมัติให้BudgetLineในรุ่นหนึ่ง pinpolicy/decision/evidence/effective-recorded time | delta41เสนอ ไม่มีmodel |
| ProjectAcademicYear / private.project_academic_year | FK ProjectกับAcademicYearและช่วงเชื่อมที่เจ้าหน้าที่รับรอง หลายต่อหลาย | delta41เสนอ ไม่มีmodel |

logical04มีallocationผูกbudget_eventและauthorized_amountNUMERIC(20,2)แล้ว AllocationVersionที่เสนอเป็นsnapshotของอำนาจจัดสรรแต่ละรุ่น ส่วนallocation/eventสำหรับโพสต์การเปลี่ยนยอดต้องเชื่อมรุ่นเมื่อถึงงานนั้น ไม่สร้างสองยอดให้บวกรวม: รุ่นใหม่ยอดเป้าหมาย120.00แทน100.00ต้องแยกการเปลี่ยน20.00 ไม่sum100+120เป็น220 การเปลี่ยนledgerและสูตรคงเหลือเต็มระบบต้องทดสอบในบทที่ผู้ใช้สั่งภายหลัง ไม่ทำreservation/obligation/paymentservicesใน41

ProjectExamSessionมีในlogical04แต่ExamSessionจริงยังขาด เมื่อพัฒนาต่อใช้FKกลางและตรวจAcademicYearตรงbinding ไม่รับfree-textปีหรือสร้างรอบสอบสำเนา บท41เสนอProjectAcademicYearเพียงส่วนเชื่อมที่จำเป็นต่อเกณฑ์

## 3 FK, unique และประวัติ

ทุกmodelเสนอUUIDPKและsnake_case @map/@@map อยู่private schema ใช้RESTRICTกับFKหลักฐาน/องค์กร/ปี ไม่cascadeลบประวัติ ใช้ServiceActorกลางเป็นprovenanceตามADR002และcurrentUser/grantsจาก07/08ที่ยืนยัน ผู้สร้างactorไม่ได้รับอำนาจจากการมีServiceActor ไม่สร้างUser/loginแทน ส่วนdecision/fileversion/workflowต้องต้นทาง11/10พร้อมก่อนFK/migrationจริง

| Ref | ข้อบังคับที่ต้องลงmigrationและDALเมื่อพร้อม |
| --- | --- |
| K41-01 | unique(organization_id, source_code) และ unique(organization_id, cost_center_code) สำหรับทะเบียน ไม่ใช้ชื่อเป็นbusinesskey |
| K41-02 | unique(organization_id, fiscal_year_id, plan_code, version_no); supersedes_plan_idอยู่seriesเดียว/รุ่นก่อนหน้า ไม่self/cycle |
| K41-03 | unique(organization_id, project_code); unique(project_id, academic_year_id, valid_from_on) และตรวจช่วงlinkไม่ทับซ้อนซ้ำ |
| K41-04 | BudgetLine compositeFKไปplan/org/FY, source/org/currency, project/org, costcenter/org และcategorygroupที่ถูกต้อง ไม่joinข้ามหน่วยจากclientorg_id |
| K41-05 | line_code uniqueในplan versionตามpolicyที่ยืนยัน ไม่ยึดunique04แบบorg/FY/source/lineจนเพิ่มรุ่นไม่ได้ ต้องADRdeltaก่อนDDL |
| K41-06 | unique(budget_line_id, version_no); supersedes_version_idอยู่lineเดียวและsource hash/approvedrevisionตรง ไม่มีallocationversionใหม่จากretryเดิม |
| K41-07 | date windowsเริ่มรวมปลายไม่รวม; linewindowอยู่ในFY/plan/project; AYlinkอยู่ในprojectและAYที่ระบุ ไม่บังคับlabelเลขปีเท่ากัน |
| K41-08 | ช่วงมีผลของlineเดียวที่resolveจากsupersession/currenthead/eventsห้ามทับซ้อน; ช่วงที่เคยอนุมัติในsealedpayloadคงเดิมไม่ใช้exclusionrawhistoryแทนcurrentsegments ต้องnative transaction/CAS/projectionproofก่อนรับรอง |
| K41-09 | amountfinite/nonnegative/NUMERIC(20,2)bounds; ingressตรวจcanonicalstring/scaleก่อนcast ทุกwriter ไม่มีCHECKหลังcastอย่างเดียวเพื่อจับrawscale |
| K41-10 | unique(actor, action, idempotency_key) receiptพร้อมrequesthash; keyเดิมpayloadต่างconflict; audit/outbox/decision/pinsในtransactionเดียว |

การแทนรุ่นใช้supersession eventตัดช่วงมีผลในprojectionที่ตรวจย้อนหลังได้ ไม่แก้sealedวันที่เดิม หากต้องmaterializeช่วงเพื่อconstraintsต้องADR/migrationแยกและnativeproofก่อนใช้

version_noเป็นรุ่นธุรกิจ ส่วนrow_versionเป็นครั้งแก้ร่างเพื่อCAS ทั้งสองมีคนละหน้าที่ ไม่ใช้การแก้ร่างเพิ่มยอดจัดสรรโดยอัตโนมัติ

draftแก้ด้วยrow_version ส่วนAllocationVersionที่seal/approvedแล้วแก้payloadไม่ได้ การปรับแผนเป็นรุ่นใหม่พร้อมเหตุผล/หลักฐาน/decisionใหม่ คงรุ่นต้นเรื่อง recorded_atแยกeffective_from_on และqueryณวันที่อ่านเฉพาะรุ่นที่ได้รับอนุมัติและมีผล ไม่แสดงรุ่นอนาคตก่อนวันที่ policyยังunverifiedหรือaccount/scopeอ่านไม่ได้ให้deny

CompositeFKต้องมีreferenceable UNIQUE keysตามคอลัมน์อ้างอิง: BudgetPlan(id,organization_id,fiscal_year_id), FundingSource(id,organization_id,currency_code), Project(id,organization_id), CostCenter(id,organization_id), BudgetLine(id,currency_code), ReferenceCode(id,code_set) BudgetLineต้องมีcategory_code_setที่serverกำหนดและCHECKเป็นbudget_categoryด้วย การเพิ่มuniquecoreReferenceCodeอยู่ในADRdelta/migrationเมื่อพร้อม ไม่ถือว่าPKidอย่างเดียวทำให้compositeFKสร้างได้แล้ว

ดัชนีเสนอเฉพาะqueryองค์กร+ปีงบ+แผน/status, ProjectAcademicYear academic_year_id+project_id และAllocationVersion line+effective date/version หลังEXPLAINจริง ไม่สร้างindexทุกคอลัมน์หรือรับรองดัชนีทั้งหมดในlogical04ว่าสำเร็จแล้ว ต้องrevision/currentgrantทุกread/edit/export/download/approve/job ไม่มีpublicbudgetDTOโดยdefault

## 4 เกณฑ์และdependency

รายละเอียดmoney/currency/rounding/18casesและตัวอย่างหนึ่งAYสองFYอยู่ [BUDGET_POLICY_CONFIG](BUDGET_POLICY_CONFIG.md); fieldsทุกmodelอยู่ [BUDGET_DATA_DICTIONARY](BUDGET_DATA_DICTIONARY.md) policy/inputเป็นDEMOตาม [budget-41-demo.json](fixtures/budget-41-demo.json) ไม่ใช่configที่runtimeโหลด ไม่มีseed/ServiceActorธุรกิจ/approveddecisionสร้างในบท41

ต้อง40และส่วนกลางผ่านจริง ลงADRdelta41/models/RLS/constraintsผ่านmigration ทดสอบPrisma/nativeDB/DAL/money/UI/exportก่อนผ่านเกณฑ์41 ทั้งสองยังBLOCKED ไม่ใช้ผลreference arithmetic/WASM/documentchecksแทนการเก็บและรวมเงินในแอปจริง ไม่เริ่ม42หรือเดาขอบเขต
