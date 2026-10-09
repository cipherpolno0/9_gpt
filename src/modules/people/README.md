# ระบบ 01 — ทะเบียนบุคคล

เจ้าของงานเสนอ O01 ตามCharter โฟลเดอร์นี้เป็นที่ตั้งบริการของโมดูล บท05ยังไม่มีbusinessimplementation ตารางและสัญญาข้อมูลตามบท04 ไม่ใช้READMEแทนmodel/migration

เมื่อได้รับพรอมป์ต์บทลงมือ ให้หน้าเว็บและworkerเรียกserviceของโมดูล เจ้าของserviceตรวจactor/action/scope/เวลา/fieldvisibility/transaction/audit ใช้Person Organization บัญชีและเอกสารกลางร่วมกัน ไม่เขียนโมดูลอื่นโดยลัดกฎ

สถานะบท13: ได้รับพรอมป์ต์แล้ว แต่ prerequisite12ยังBLOCKED จึงยังไม่มีschema/migration/search/DALบุคลากรเพิ่มเติม อ่าน [PERSON_FIELDS](../../../docs/PERSON_FIELDS.md), [JSP_MAPPING](../../../docs/JSP_MAPPING.md) และ [FOUNDATION_ACCEPTANCE](../../../docs/FOUNDATION_ACCEPTANCE.md) เอกสารสองรายการแรกเป็นแบบเตรียม ไม่ใช่บริการที่เรียกใช้ได้

สถานะบท14: prerequisite13ยังไม่ผ่าน มีเพียง [POSITION_RULES](../../../docs/POSITION_RULES.md) เป็นแบบเตรียม ไม่มีservices/หน้าประวัติ/seedตำแหน่ง ยังไม่ใช้PositionAssignmentเป็นเว็บไซต์RoleAssignment

สถานะบท15: prerequisite14ยังไม่ผ่าน มีเพียง [PERSON_VISIBILITY](../../../docs/PERSON_VISIBILITY.md) เป็นแบบเตรียม ไม่มีหน้าค้นหา/พื้นที่ของฉัน/DTO/export runtime และไม่ให้read_selfก่อนverifiedaccount-Personbinding

สถานะบท16: prerequisite15/11ยังไม่ผ่าน มีเพียง [PERSON_CHANGE_WORKFLOWS](../../../docs/PERSON_CHANGE_WORKFLOWS.md) เป็นแบบเตรียม ไม่มีrequest/ฟอร์ม/activation/tracking runtime แยกชนิดคำขอจากทะเบียนที่มีผลและใช้workflowกลางเมื่อพร้อม

สถานะบท17: prerequisite16ยังไม่ผ่าน มีเพียง [PERSON_CHANGE_RECOVERY](../../../docs/PERSON_CHANGE_RECOVERY.md) เป็นแบบเตรียม ไม่มีeventhandlers/scope/accountsync/correction/impactreport runtime คืนสิทธิ์เฉพาะรายการอนุมัติและเก็บauditต้นทาง ไม่อ้างโมดูลที่ยังไม่สร้างว่าไม่มีผลกระทบ

สถานะบท18: prerequisites13–17ยังไม่ผ่าน อ่าน [UAT_SYSTEM_01](../../../docs/UAT_SYSTEM_01.md) และ [MANUAL_PEOPLE](../../../docs/MANUAL_PEOPLE.md) มีCSVสมมติและ [test specification](../../../tests/system01/ACCEPTANCE_CASES.md) เท่านั้น ไม่seedหรือรันUAT/executablepeopletests และไม่อ้าง จศป. ครบโครงสร้างทางการ
