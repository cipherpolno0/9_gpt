# ADR 001 — เครื่องมือพัฒนาบท05

สถานะ: Accepted สำหรับโครงพัฒนาในเครื่องตามแผนที่ผู้ใช้อนุมัติ | รุ่นเอกสาร1.5 | 3 ตุลาคม2569 (2026-10-03)

## เหตุผลและขอบเขต

โครงการเดิมมีเอกสารบท01–04ที่commit95f8032 ยังไม่มีแอป/lockfile/schemaจริง ผู้ใช้สั่งเพิ่มPrisma PostgreSQL Redis pnpmและworkerในบท05 จึงต่อยอดrepositoryเดิม ไม่แยกโครงการ9ชุด คงSupabase Auth/Storage/RLSและVercelตามDEC-003 แต่ยังไม่เชื่อมบัญชี/deployหรือสร้างlogin/businessservices

เลือกstableจากmetadata npm registryทางการ ณวันที่ตรวจ ตรวจengines/peerDependenciesแล้วระบุเลขเต็ม ไม่ส่งคำสั่งติดตั้งlatest ในวันตรวจ prisma dist-tag latestชี้8.0.0-rc.19 จึงไม่ใช้ เลือก7.10.0ตรงCLI/client/adapter React/ReactDOMเลือก19.3.0เท่ากัน Next16.3.8ตรง@next/eslint-plugin-next16.3.8 ไม่มีcanary/beta/rcในdirectdependencies

## รุ่นที่ล็อก

Node24.19.0 LTSที่มีจริงในเครื่อง และ.nvmrc/enginesกำหนดNode24; pnpm11.28.2stableที่ตรวจregistry ใช้packageManager+enginesและCorepackเรียกตรงรุ่น เครื่องเดิมมีpnpm11.25.0ซึ่งไม่ตรงpinจึงไม่ใช้รันผลตรวจ ตัวติดตั้งแบบสะอาดต้องใช้11.28.2

TypeScript5.9.3เป็นstableที่เลือกให้ตรงecosystem Next/Prisma และtypescript-eslint8.71.0ที่peerกำหนดTypeScript>=4.8.4<6.1 ไม่ใช้APIของTS7ปน ส่วนESLintเริ่มทดลอง9.39.5จากmaintenance tagแต่registryเตือนdeprecated จึงเปลี่ยนเป็น10.12.0stableและทดสอบflatconfig/peerDependenciesจริงก่อนส่งมอบ ห้ามยกระดับmajorโดยไม่ADRและทดสอบใหม่

| แพ็กเกจ                   | รุ่น    | หน้าที่                                      |
| ------------------------- | ------- | -------------------------------------------- |
| next                      | 16.3.8  | App Router                                   |
| react                     | 19.3.0  | UI runtime                                   |
| react-dom                 | 19.3.0  | UI renderer                                  |
| @prisma/client            | 7.10.0  | Prisma runtime                               |
| @prisma/adapter-pg        | 7.10.0  | PostgreSQL adapter                           |
| pg                        | 8.23.1  | PostgreSQL driver/readiness                  |
| dotenv                    | 18.0.5  | dependency/type/supportที่ล็อกในpackage.json |
| ioredis                   | 6.0.0   | Redis readiness                              |
| clsx                      | 2.1.1   | dependency/type/supportที่ล็อกในpackage.json |
| tailwind-merge            | 3.7.0   | dependency/type/supportที่ล็อกในpackage.json |
| class-variance-authority  | 0.7.1   | dependency/type/supportที่ล็อกในpackage.json |
| @radix-ui/react-slot      | 1.3.3   | dependency/type/supportที่ล็อกในpackage.json |
| @fontsource/sarabun       | 5.3.0   | ฟอนต์บรรจุในแอป ไม่fetchGoogleตอนbuild       |
| server-only               | 0.0.1   | เครื่องมือboundaryสำหรับบทบริการจริง         |
| tw-animate-css            | 1.4.0   | dependency/type/supportที่ล็อกในpackage.json |
| typescript                | 5.9.3   | dependency/type/supportที่ล็อกในpackage.json |
| tailwindcss               | 4.3.3   | CSSรุ่น4                                     |
| @tailwindcss/postcss      | 4.3.3   | PostCSS pluginรุ่น4                          |
| prisma                    | 7.10.0  | CLI/schema/migration tools                   |
| @types/pg                 | 8.23.1  | dependency/type/supportที่ล็อกในpackage.json |
| eslint                    | 10.12.0 | ตรวจโค้ดด้วยCLI                              |
| @next/eslint-plugin-next  | 16.3.8  | กฎNextตรงรุ่น                                |
| typescript-eslint         | 8.71.0  | TypeScript lint รองรับESLint10และTS5.9       |
| @eslint/js                | 10.0.1  | JavaScript lintสำหรับESLint10                |
| eslint-plugin-react-hooks | 7.1.1   | ReactHooks rules รองรับESLint10              |
| prettier                  | 3.9.9   | จัดรูปแบบ                                    |
| eslint-config-prettier    | 10.1.8  | dependency/type/supportที่ล็อกในpackage.json |
| tsx                       | 4.23.15 | รันTypeScriptสำหรับtests/worker              |
| @types/node               | 24.19.1 | dependency/type/supportที่ล็อกในpackage.json |
| @types/react              | 19.3.0  | dependency/type/supportที่ล็อกในpackage.json |
| @types/react-dom          | 19.3.0  | dependency/type/supportที่ล็อกในpackage.json |

PostgreSQL local `postgres:18.6-bookworm` และRedis local `redis:8.10.2-alpine` เป็นofficial stable tagsที่ตรวจจากofficial-images ไม่ใช้latestหรือPostgreSQL19beta รุ่นนี้เลือกสำหรับComposeเท่านั้น ไม่ยืนยันรุ่นSupabaseprojectจริง Q023ยังเปิด ก่อนย้ายschemaต้องทดสอบรุ่น/extensionsจริง อาจต้องADRปรับlocalmajorให้ตรงproduction

## สัญญาAPIและpathที่ใช้ต่อ

| เครื่องมือ         | สัญญาของบทนี้และบทถัดไป                                                                                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next16             | หน้า/layoutในsrc/app ใช้AppRouter ไม่pagesrouter `lint`เป็นeslintCLIแยกจากbuild เมื่อทำAuthในอนาคตใช้proxy.tsตามรุ่น16 ไม่คัดmiddleware APIต่างรุ่น; request APIs cookies/headersใช้asyncตามเอกสาร16       |
| Tailwind4          | @import tailwindcss + @tailwindcss/postcss ไม่ใช้plugin tailwindcssแบบ3; themeในCSS components.jsonconfigว่างตาม4                                                                                          |
| Prisma7            | packageเป็นESM datasource URLในprisma.config.ts generator prisma-clientและoutputsrc/generated/prisma เมื่อมีmodelsแล้วimportจากgenerated/prisma/client ใช้PrismaPg ไม่ใช้Clientconstructorไม่มีadapterแบบ6 |
| pnpm11             | allowBuildsในpnpm-workspace.yaml ไม่ใช้onlyBuiltDependenciesรุ่น10; allowเฉพาะแพ็กเกจจำเป็นตามlockfile ติดตั้งfrozen-lockfileโดยไม่แก้รุ่น                                                                 |
| PostgreSQL18 image | volumeฐาน/var/lib/postgresql ไม่ใช้path17 mountเดิม ห้ามupgradevolumemajorโดยเปลี่ยนtagเฉย ๆ ต้องmigration/backup/restoreที่ตรวจจริง                                                                       |

Prisma/schemaยังไม่มีmodelsและmigrations0 การใช้db:generateยังรอmodelsที่ได้รับอนุมัติ ไม่สร้างตารางทดลองแล้วปล่อยRLSว่างเพื่อทำให้generatorผ่าน Nextstarterไม่มีDBquery และworkerอ่านเฉพาะSELECT1/PINGในlocal ไม่มีbusinesshandler/schemauser/RLS/auditที่อ้างว่าทำงานจริง

## โครงและการตรวจสิทธิ์

src/appเป็นหน้า/route src/modules9โฟลเดอร์เป็นเจ้าของbusinessservice src/serverเป็นconfig/connection/authorizationกลาง src/sharedเป็นUIใช้ร่วม workerใช้dependencyเดียวแต่processแยก ไม่deployworkerยาวในrequestVercelโดยเดาความสามารถ ไม่มีqueue/scannerproviderที่เลือกก่อนQ011

พื้นที่/appทุกmethodใช้catchallserver403 no-storeระหว่างยังไม่มีAuth/grants เป็นการปิดbootstrap ไม่ใช่Auth/RBACสำเร็จ เพิ่มrouteในบทถัดไปต้องใช้serverguard/fieldvisibility/role+scope+time/RLSจริงและmaker-checker ทุกmutationauditร่วมtransaction แต่บท05ไม่มีbusinessmutation

Supabaseตัวอย่างPrismaมีprivileged/bypassrls สำหรับการตั้งค่าบางแบบ ซึ่งไม่เป็นruntimepermissionของโครงการนี้ ต้องแยกmigrationroleจากruntime limitedrole+transactioncontextและทดสอบRLSในบทที่เกี่ยวข้อง JWTจากSupabaseไม่ได้ถูกส่งเข้าSQL/RLSอัตโนมัติเพราะใช้Prisma ไม่มีcredentialสำหรับSupabaseในบท05

shadcn/uiเป็นsourcecomponentที่แก้ได้ ใช้Buttonจากregistry new-york-v4 แล้วปรับcnเป็นshared/lib/utilsและSlotเป็น@radix-ui/react-slotต้นทางเดียว ไม่ติดตั้งCLIlatest ทุกdependenciesที่ใช้ถูกpin Originalsource SHA256: 79dd6f75f8136394442202d6b8b922fb269eaad0a5dba579397c9d5b41f893bb ส่วนCSSthemeเลือกเองตามUIบท03 FontsourceSarabunบรรจุไทย/latin400และ600 ไม่มีการใช้คน/ข้อมูลจริง

## ทางเลือกและความเสี่ยง

- ไม่เลือกPrisma8RCเพราะผู้ใช้กำหนดstable; ไม่ย้อนใช้API6ในตัวอย่าง7
- ไม่เริ่ม128modelsหรือSupabaseAuth/Storage/ธุรกิจจริงในบทเครื่องมือ; Q023/Q024/Q025ยังต้องหลักฐานก่อนschema/runtime
- ไม่เปลี่ยนpackageManagerเป็นpnpm12ตามlatestจากการเดา ต้องทดสอบ/ADRก่อนmajorเปลี่ยน
- Dockerdaemonในruntimeนี้ใช้ไม่ได้ ตรวจComposeconfigด้วยclientที่ดาวน์โหลดแยกได้ แต่ไม่เท่ากับcontainer/start/volume/network/workerreadinessผ่าน ดูSETUP/PROGRESSเรื่องDOCKER-05
- npmmetadata/lockfileระบุที่มาตรวจซ้ำได้ ไม่ถือการไม่มีpeerwarningเป็นการรับรองruntimeทุกโมดูล ผลcleaninstall/build/testsมีเฉพาะstarter

## แหล่งทางการที่อ่าน

รายการต่อไปนี้รองรับหลัก API/compatibility; choices/โครง/ขอบเขตข้างบนเป็นการออกแบบของโครงการ ไม่คัดลอกตัวอย่างข้อมูลบุคคลหรือSQLprivilegedลงระบบ

- [Next.js](https://nextjs.org/docs/app/getting-started/installation)
- [Prisma7](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7)
- [Prisma requirements](https://www.prisma.io/docs/orm/v7/reference/system-requirements)
- [Prisma config](https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference)
- [Supabase+Prisma](https://supabase.com/docs/guides/database/prisma)
- [Tailwind4](https://tailwindcss.com/docs/installation/using-postcss)
- [shadcn/ui](https://ui.shadcn.com/docs/installation/manual)
- [Button source](https://ui.shadcn.com/r/styles/new-york-v4/button.json)
- [pnpm](https://pnpm.io/installation)
- [pnpm11 build settings](https://pnpm.io/settings/build)
- [Node LTS](https://nodejs.org/en/about/previous-releases)
- [TypeScript5.9](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html)
- [PostgreSQL images](https://raw.githubusercontent.com/docker-library/official-images/master/library/postgres)
- [Redis images](https://raw.githubusercontent.com/docker-library/official-images/master/library/redis)
- [PostgreSQL volume](https://github.com/docker-library/docs/blob/master/postgres/README.md)
- [npm registry](https://registry.npmjs.org/) metadataเลขรุ่น/engines/peersอ่านด้วยAPI registryโดยตรง และยืนยันการresolveด้วยpnpm-lock.yaml

## ผลทบทวนชุดlinterระหว่างติดตั้ง

eslint-config-next16.3.8มีpluginsimport/jsx-a11y/reactที่peerยังไม่รองรับESLint10 จึงไม่ใช้bundleนี้หรือoverridepeerให้เงียบ เลือกกฎNextโดยตรงจาก@next/eslint-plugin-next16.3.8ตามทางเลือกconfigทางการ ร่วมtypescript-eslint8.71.0/ReactHooks7.1.1/@eslint/js10.0.1ที่ตรวจpeerรองรับ10และTS5.9จริง ไม่มีการอ้างผ่านaccessibilityจากlinterและไม่ได้ใช้jsx-a11ypluginที่peerไม่ตรง ต้องตรวจWCAG/BROWSERจริงแยกตามบท03

แหล่งเพิ่ม: [Next ESLint custom plugin](https://nextjs.org/docs/app/api-reference/config/eslint), [typescript-eslint](https://typescript-eslint.io/getting-started/), [ESLint flatconfig](https://eslint.org/docs/latest/use/configure/configuration-files) dependencyที่มีpostinstall unrs-resolver1.12.2อนุญาตตรงรุ่นในallowBuilds ไม่เปิดscriptsทุกแพ็กเกจ

รันtests/workerด้วยnode --import tsx แทนtsxCLIเพื่อไม่ต้องสร้างIPC Unixsocketในruntimeนี้ เป็นtsxรุ่นเดียวกัน ไม่เปลี่ยนTypeScript/Next API

check scriptเรียกpnpmผ่านnpm_execpathของตัวเปิดคำสั่งเดิมเพื่อให้Corepackใช้11.28.2ตลอดทั้งpipeline ไม่ตกไปใช้global11.25.0 Nextdevสร้างAGENTS.md/CLAUDE.mdอัตโนมัติ จึงเก็บไว้และอ่านเอกสารในnode_modules/next/dist/docsก่อนแก้NextAPI พร้อมเก็บlicenseของButtonในdocs/licenses/shadcn-ui.txt

## สถานะต่อยอดบท06

ข้อความไม่มีmodel/migrationในADR001เป็นสถานะบท05 ปัจจุบันมีcore19models/schema0.6.0ตาม[ADR002](002-core-database.md) client/adapterยัง7.10.0เดิม เพิ่มdev-onlyPGlite0.5.8และlockfileสำหรับSQLWASMchecksเท่านั้น ไม่เปลี่ยนruntimePostgreSQL/Supabase ไม่มีAuth/publicDTOหรือruntimeallowpolicy และDB-06ยังรอserverจริง
