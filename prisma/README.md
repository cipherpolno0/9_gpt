# เครื่องมือฐานข้อมูลบท05

มีPrisma7 configและdatasource PostgreSQL แต่ยังไม่มีmodel/migration ไม่สร้าง128ตารางล่วงหน้า ไม่มีauth.usersในPostgreSQLเดี่ยวของCompose และไม่อ้างว่าเป็นSupabase local stack

`pnpm db:validate` ตรวจschemaเท่านั้น `pnpm db:generate` สร้างclientเมื่อมีmodelที่อนุมัติแล้ว ดูADRเรื่องoutput path/adapter ไม่ใช้importClientจาก@prisma/clientแบบรุ่นเก่า

ห้ามใช้db pushหรือแก้Dashboardแทนmigration ก่อนruntime queryต้องมีlimited DB role/RLSและtransactioncontextตามQ023 ไม่ใช้postgresหรือbypassrlsเป็นบัญชีแอป CredentialของComposeมีไว้bootstrap/readinessในเครื่อง ไม่มีbusinessqueryในบทนี้
