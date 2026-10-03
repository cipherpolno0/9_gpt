# การเชื่อมต่อฐานข้อมูลฝั่งserver

บท06สร้างschema/migrationและPrismaPg seedสำหรับฐานทดลองเท่านั้น ไม่มีruntimeDBclientบริการธุรกิจหรือqueryในหน้าเว็บ/worker ทุกprivate tableมีRLSdenyall

GeneratedPrisma7clientpathคือsrc/generated/prisma/client บทถัดไปที่เชื่อมruntimeต้องใช้limitedrole, verifiedrequestcontextและserverguard/transactionauditตามADR001/002 ไม่ใช้postgres/servicecredentialเป็นสิทธิ์ธุรกิจ ดูdocs/DATABASE.md และDB-06ก่อนพึ่งฐานทดลอง
