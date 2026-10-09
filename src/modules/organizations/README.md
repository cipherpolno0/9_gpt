# ระบบ 02 — หน่วยงานและสนามสอบ

เจ้าของงานเสนอ O02 ตามCharter โฟลเดอร์นี้เป็นที่ตั้งบริการของโมดูล บท05ยังไม่มีbusinessimplementation ตารางและสัญญาข้อมูลตามบท04 ไม่ใช้READMEแทนmodel/migration

เมื่อได้รับพรอมป์ต์บทลงมือ ให้หน้าเว็บและworkerเรียกserviceของโมดูล เจ้าของserviceตรวจactor/action/scope/เวลา/fieldvisibility/transaction/audit ใช้Person Organization บัญชีและเอกสารกลางร่วมกัน ไม่เขียนโมดูลอื่นโดยลัดกฎ

สถานะบท19: prerequisite18ยังBLOCKED อ่าน [ORGANIZATION_TYPES](../../../docs/ORGANIZATION_TYPES.md) เป็นแบบเตรียม ไม่มีOrganizationRelation/RelationType/services/หน้าลำดับสังกัดเพิ่ม ใช้Organizationกลางและhistoryเดิม ไม่เปลี่ยนparentทับประวัติ ไม่ให้scopeจากGeographyหรือHOSTED_AT และยังไม่รับรองparenttype/cycle/concurrencyจริง

สถานะบท20: prerequisite19ยังBLOCKED อ่าน [ADDRESS_VALIDATION](../../../docs/ADDRESS_VALIDATION.md) เป็นแบบเตรียม ไม่มีaddress/contactservices/OrganizationLocation/หน้าค้นหาที่ตั้งหรือmapruntime ช่องทางPERSONALไม่ออกpublic พิกัดต้องมีหลักฐานและpublicationpolicyก่อนpublicmap เอกสารเก่าต้องpinsourceaddress/FileVersionไม่joincurrentaddressแทน

สถานะบท21: prerequisite20ยังBLOCKED อ่าน [EXAM_SESSIONS](../../../docs/EXAM_SESSIONS.md) เป็นแบบเตรียม ไม่มีExamCenter/Session/CenterSession/schema/UIจริง สนามแม่บทใช้ร่วมหลายรอบ สถานะมีผล/ปฏิทินต้องมีหลักฐานและadapterที่ตรวจได้ ความจุเป็นสัญญาร่วมกับapplicationserviceระบบ5ไม่ใช่ใบสมัครในorganizations

สถานะบท22: prerequisite21ยังBLOCKED อ่าน [EXAM_CONTACT_VISIBILITY](../../../docs/EXAM_CONTACT_VISIBILITY.md) เป็นแบบเตรียม ไม่มีExamCenterAppointment/dispatchsnapshot/รายงานจริง ใช้Personกลางและsnapshotวันจัดส่งแยกประวัติแต่งตั้ง Reportprivateตรวจscope/fields/currentACL ไม่เปิดข้อสอบทางการหรือเลือกผู้รับแทนเองเมื่อคนเดิมพ้นหน้าที่

สถานะบท23: prerequisite19–22ยังBLOCKED ดู [UAT_SYSTEM_02](../../../docs/UAT_SYSTEM_02.md), [DATA_QUALITY_RULES](../../../docs/DATA_QUALITY_RULES.md) และ [MANUAL_ORGANIZATIONS](../../../docs/MANUAL_ORGANIZATIONS.md) เป็นแบบเตรียม ไม่มี import adapter/staging/DQ evaluator หรือ executable tests ระบบ2 ข้อมูล JSONเป็น DEMO offlineไม่ใช่ seed/adapteroutput; [test specification](../../../tests/system02/ACCEPTANCE_CASES.md) 18กรณียัง NOT RUN “ทั่วประเทศ”เป็นขอบเขตที่ต้องรองรับ ไม่ใช่ข้อมูลจริงครบหรือผล load ผ่าน
