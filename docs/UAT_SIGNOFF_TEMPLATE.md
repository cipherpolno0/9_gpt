# แบบบันทึกรับรอง UAT — บท 68

รุ่น0.1 | 9 ตุลาคม 2569 | **TEMPLATE / UNSIGNED / PENDING** ไม่เป็นหลักฐานรับรองของเจ้าหน้าที่ใด

ใช้ร่วม [UAT_MASTER](UAT_MASTER.md) และ [E2E_CASES](../tests/e2e/E2E_CASES.md) กรอกเมื่อมีผลรันจริงและผู้มีอำนาจยืนยันแล้ว ผู้พัฒนาห้ามเติมชื่อ อำนาจ วันที่รับรอง หรือลายมือชื่อแทน ไม่มีการรับรองทางการด้วยhash/ภาพลายเซ็น/ข้อความTemplateนี้

## 1 ข้อมูลรอบตรวจรับ — ยังว่าง

| field                                                     | ค่าปัจจุบัน / สิ่งที่ผู้รับผิดชอบต้องกรอก                                  |
| --------------------------------------------------------- | -------------------------------------------------------------------------- |
| signoff_record_ref                                        | ว่าง — อ้างเอกสารกลางที่สร้างจริงเมื่อพร้อม                                |
| run_ref / software_commit / environment                   | ว่าง — ตรงกับผลที่ตรวจรับ ไม่ใช้commitของtemplateเป็นผลE2E                 |
| system / flow / case IDs / role audience                  | ว่าง — ระบุขอบเขตที่รับรอง ไม่ใช้“ทั้งระบบผ่าน”แทนcase IDs                 |
| actual_tester_ref / assignment / scope / valid_from_to    | ว่าง — ผู้ทดสอบจริงจากบัญชี/Personกลาง ไม่TESTrolelabelที่ยังไม่มีaccount  |
| authorized_acceptor_ref / authority_evidence_version      | ว่าง — ตรวจอำนาจตามเอกสารที่หน่วยงานยืนยัน ไม่technicaladminโดยปริยาย      |
| config/rule/form/privacy versions                         | ว่าง — แยกConfirmed/DEMO/TO_VERIFY พร้อมแหล่งหลักฐาน                       |
| screenshot/trace-safe-report/FileVersion/correlation refs | ว่าง — หลักฐานจริงผ่านprivacy/ACL reviewer ไม่URLสาธารณะของrawtrace        |
| execution summary PASS/FAIL/BLOCKED/NOT_RUN               | ว่าง — อ่านactualrun ไม่คัดbaselinechecksเป็นbusinessPASS                  |
| software acceptance decision                              | PENDING — รอผู้รับรองกรอก                                                  |
| content/form/official-policy acceptance                   | PENDING / TO_VERIFY — ตรวจแยก ไม่ตามsoftwarePASSอัตโนมัติ                  |
| decided_at / effective_from / recorded_at                 | ว่าง — เวลาจริง/วันมีผลคนละความหมาย ไม่ใส่วันที่9ตุลาคมเพราะวันที่template |
| signature / approval evidence ref                         | ว่าง — ยังไม่ลงนามหรือกดอนุมัติจริง                                        |

## 2 ผลราย case และข้อค้าง — แถวว่างสำหรับกรอกจริง

| case_id | actual_observation | execution_status | evidence refs | defect/severity | responsible_actual_ref | agreed_due_date | retest result | signoff decision |
| ------- | ------------------ | ---------------- | ------------- | --------------- | ---------------------- | --------------- | ------------- | ---------------- |
| ว่าง    | ว่าง               | NOT_RUN          | ว่าง          | ว่าง            | ว่าง                   | ว่าง            | ว่าง          | PENDING          |

แยกหัวข้อการรับรอง: (ก) ซอฟต์แวร์/ข้อมูลไม่ซ้ำและกู้คืน (ข) สิทธิ์/ข้อมูลส่วนตัว (ค) เนื้อหาธรรม/เกณฑ์สอบ/แบบจริง (ง) อำนาจ/การเงิน/สารบรรณ ให้ผู้มีหน้าที่รับรองตามขอบเขตจริง ไม่ให้ผู้ทดสอบหนึ่งคนรับรองทุกฝ่ายเพราะมีบัญชีadmin

## 3 เงื่อนไขก่อนรับรอง

- ตรวจactualrefs/run/sourceversionและภาพกับresult ไม่อ้างภาพต้นแบบหรือHTTPsmokeแทนเส้นทางธุรกิจ
- ตรวจmaker-checker/currentauthority/period สิทธิ์ผู้รับรองต้องยังมีและไม่อนุมัติงานสำคัญที่สร้างเอง ใช้บัญชี/Personbindingกลางไม่ชื่อเหมือน
- รายการค้างและTO_VERIFYต้องยังค้าง หากconditionalต้องมีขอบเขต/owner/วันและหลักฐานที่เจ้าหน้าที่กำหนด ไม่ให้ผ่านcriticalsecurity/score/ledger/stock/duplicate/privacydefect
- รับรองรุ่นเฉพาะที่ตรวจ หากเปลี่ยนสาระสำคัญ/config/FileVersionหลังรับรองต้องรอบใหม่ เก็บคำตัดสินเดิม ไม่แก้ผลเก่าย้อนเป็นPASS
- เผยแพร่เอกสารรับรอง/ลงนาม/ส่งข้อความต้องมีคำสั่งและสิทธิ์ตามบริการกลาง ไม่ทำจากการสร้างtemplateนี้

**ผลปัจจุบัน: ไม่มีผู้ทดสอบหรือผู้รับรองลงชื่อ ไม่มีวันรับรอง ไม่มีลายมือชื่อ ไม่มีACCEPTEDcase ไม่มีUATeventจริง** ดูactualfieldsว่างใน [uat-plan](../tests/fixtures/e2e/uat-plan.json)
