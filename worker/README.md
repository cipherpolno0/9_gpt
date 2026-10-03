# ตัวรันงานแยกprocess

ใช้dependency/โค้ดจากrepositoryเดียว `pnpm worker:check` ตรวจSELECT1และRedisPINGในเครื่อง ไม่แก้ข้อมูล `pnpm worker:dev` ตรวจแล้วรอจนCtrl+C ยังไม่consumequeue/processExcel/scan/ส่งข้อความ ไม่มีbusinesshandlerที่ข้ามการตรวจสิทธิ์

เมื่อถึงบทworkerต้องตรวจgrantของผู้ริเริ่มใหม่ role/scope/ช่วงมอบหมาย/ACLก่อนแต่ละjob ใช้outbox/idempotency/auditร่วมโมดูล ไม่ใช้credentialprivilegedแทนการอนุญาต แผนhosting/scanner/queueยังQ011
