# ระบบ 04 — คำขอ

เจ้าของงานเสนอ O04 ตามCharter โฟลเดอร์นี้เป็นที่ตั้งบริการของโมดูล บท05ยังไม่มีbusinessimplementation ตารางและสัญญาข้อมูลตามบท04 ไม่ใช้READMEแทนmodel/migration

เมื่อได้รับพรอมป์ต์บทลงมือ ให้หน้าเว็บและworkerเรียกserviceของโมดูล เจ้าของserviceตรวจactor/action/scope/เวลา/fieldvisibility/transaction/audit ใช้Person Organization บัญชีและเอกสารกลางร่วมกัน ไม่เขียนโมดูลอื่นโดยลัดกฎ

สถานะบท30: prerequisite29ยังBLOCKED อ่าน [ORG_CENTER_REQUESTS](../../../docs/ORG_CENTER_REQUESTS.md) และ [ORG_CENTER_REQUEST_SCHEMA](../../../docs/ORG_CENTER_REQUEST_SCHEMA.md) รุ่น0.1 Proposal/BLOCKED เป็นcontract/flow10กรณี ไม่ใช่Prisma models/migration/services typedextensionsต่อChangeRequest/RequestVersion/workflowกลาง OrganizationและExamCenter/ExamType/sessionเดิม ROUNDscopeทดลองยังต้องยืนยัน ไม่มีactiveeffectก่อนapproved+ถึงวัน+atomicactivation rejected/cancelledไม่เปิดปิดยุบย้ายทะเบียน C30/P30ทุกกรณีNOT RUN ไม่เลื่อนไป31

สถานะบท31: prerequisite30ยังBLOCKED อ่าน [REQUEST_WIZARD](../../../docs/REQUEST_WIZARD.md) และ [REQUEST_SUBMISSION](../../../docs/REQUEST_SUBMISSION.md) รุ่น0.1 เป็นcontract6steps/8actions/16cases ไม่มีpages/actions/CAS/FileVersion/tracking/notifruntime Draft/returnedใช้headerเดิม revision+receiptแยกกัน Firstsubmitcanonicalworkflow/uniqueopaqueเลขเดิมกับoutboxatomic เลขไม่readgrant currenttargetscopeทุกsave/submit Defaultsignedintracking ไม่สร้างบัญชี/เอกสารชุดใหม่ ทุกP31NOT RUN ไม่เลื่อนไป32

สถานะบท32: prerequisite31ยัง BLOCKED อ่าน [REQUEST_REVIEW](../../../docs/REQUEST_REVIEW.md) และ [REQUEST_IMPACT_CHECKS](../../../docs/REQUEST_IMPACT_CHECKS.md) รุ่น0.1 เป็นสัญญาคิว6บริการ/16แผนทดสอบและผลกระทบ4ด้าน/10ประเภท ไม่มีqueue/decision/impact servicesจริง ต่อworkflow/DAL/filesกลาง ไม่สร้างengine/บัญชี/ใบสมัครซ้ำ ตรวจcurrentauthority/delegation/maker/CASและterminalหนึ่งชุดแยกopinion แผนยุบ/ปิดมีผู้สมัครต้องรับรอง sourceversionครบ missingadapterNOT_READYไม่0 ไม่autoโยกคนหรือแก้sealedrevision ทุกP32 NOT RUN ไม่เลื่อนไป33

สถานะบท33: prerequisite32ยังBLOCKED อ่าน [REQUEST_EFFECTIVE_RULES](../../../docs/REQUEST_EFFECTIVE_RULES.md)0.1 เป็นactivation/history/trackingcontract5services/16P33plans ไม่มีactivationworker/projection/หน้าติดตามจริง ต่อworkflow/DAL/files/outbox/ownertransactionกลาง Receipt+businessuniqueกันeffectซ้ำ แยกrequestedday/effective/recorded/deliveredและfutureplanจากactualhistory Publicpolicyขาดdeny ไม่autoโยกผู้สมัคร/เพิ่มสิทธิ์/แก้snapshotเก่า ทุกP33NOT RUN ไม่เลื่อนไป34

สถานะบท34: prerequisites30–33ยังBLOCKED อ่าน [UAT_SYSTEM_04](../../../docs/UAT_SYSTEM_04.md), [MANUAL_REQUESTS](../../../docs/MANUAL_REQUESTS.md), [ACCEPTANCE_CASES](../../../tests/system04/ACCEPTANCE_CASES.md) และ [fixtureplan](../../../tests/fixtures/system04/coverage-plan.json)0.1 แผน22cases/10types/3branchesไม่executabletests/seed Recoverynewrequest/decision/eventอ้างsourceorder/reasonไม่ลบstatus/auditเดิม Nonemptyidentity/FK/hash/snapshotoracleไม่count0เป็นPASS Rootunit17ตรวจstarterไม่ระบบ4 ทุกUAT34NOT RUN ไม่มีruntime/migrationเพิ่ม ไม่เลื่อนไป35
