# ขอบเขตการต่อฐานข้อมูล

ส่วนนี้สำหรับconnection/transaction helperฝั่งserver โมดูลเป็นเจ้าของbusinessservice ไม่ให้หน้าเว็บ importpg/Prismaโดยตรง

Prisma7 ต้องใช้PrismaPgกับclientที่generateในsrc/generated/prisma/client.ts DBmigrationใช้DIRECT_DATABASE_URLแยกจากruntimeDATABASE_URL การเชื่อมDBไม่ส่งSupabase JWTเข้าRLSเอง ต้องสร้างlimited roleและrequestcontextด้วยtransactionและทดสอบdenyก่อนเปิดqueriesในบทที่เกี่ยวข้อง บท05ยังไม่มีclientfactoryหรือmodelเพื่อไม่เพิ่มสิทธิ์/queryล่วงหน้า
