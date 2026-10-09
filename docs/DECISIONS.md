# รายการตัดสินใจ — เว็บไซต์กองบริหารทะเบียนและวัดผล

ต่อยอด portal | รุ่นเอกสาร 1.50 | 9 ตุลาคม 2569 (2026-10-09)

Confirmed คือข้อกำหนดที่ผู้ใช้ให้ ไม่ใช่คำวินิจฉัยทางการ Proposal คือข้อเสนอที่รอผู้รับผิดชอบพิจารณา TO VERIFY คือยังไม่พอให้ตัดสินหรือใช้งานจริง ผู้ใช้อนุมัติแผนบท07แล้ว แต่ไม่ได้ยืนยันกฎทางการหรือแต่งตั้งเจ้าของงานจริงใน Q005

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-001 | Confirmed | ชื่อโครงการใช้ “เว็บไซต์กองบริหารทะเบียนและวัดผล” | ชื่อที่ผู้ใช้ระบุโดยตรงก่อนบท 01; คำว่าศูนย์ข้อมูลคณะสงฆ์และการศึกษาเป็นคำอธิบายงาน | C01 | การเปลี่ยนชื่อภายหลังต้องบันทึกใหม่ |
| DEC-002 | Confirmed | เว็บไซต์ บัญชี repository และฐานข้อมูลกลางชุดเดียวครบ 9 ระบบ | ข้อกำหนดผู้ใช้และ BLUEPRINT | C01 + C02 | ไม่แยก login person organization หรือ application ต่อระบบ |
| DEC-003 | Confirmed | ใช้ Next.js App Router + TypeScript + Tailwind + shadcn/ui + Sarabun + Supabase + ExcelJS + Vercel | รายการเทคโนโลยีที่ผู้ใช้กำหนดล่าสุดแทนข้อเสนอเดิม | C02 | บทนี้ไม่ติดตั้งหรือยืนยันเวอร์ชัน; เลือกเวอร์ชันในบทตั้งโครงการ |
| DEC-004 | Confirmed | public 7 เมนู; workspace 9 เมนูรวมแดชบอร์ดและ sidebar 3 กลุ่ม; admin แยก | โครงสร้างที่ผู้ใช้ระบุ; ตาราง route ใน BLUEPRINT เป็นข้อเสนอ ยกเว้น /app/... และ /app/admin | C02 + C04 | Excel import เป็นช่องทางย่อยของสมัครสอบ; แดชบอร์ดไม่ใช่ระบบธุรกิจเพิ่ม |
| DEC-005 | Confirmed | หน้าติดต่อ ดาวน์โหลด ข่าว login แจ้งเตือนและข้อมูลหน่วยงานกลางมีชุดเดียว | กติกากลางของผู้ใช้; REQ-C04 | C04 | ทางลัดเชื่อมหน้าหลัก ไม่ทำหน้า contact/login ต่อโมดูล |
| DEC-006 | Confirmed | server authorization + RLS ตามบทบาท สายหน่วยงานและเวลามอบหมาย; deny by default | ข้อกำหนดผู้ใช้; REQ-C05–REQ-C07 | C02 | ตรวจทุกช่องทางรวม job/print; admin และ service credential ไม่ให้สิทธิ์ธุรกิจอัตโนมัติ |
| DEC-007 | Confirmed | ภาษาไทย วันที่แสดง พ.ศ. ตาราง/คอลัมน์อังกฤษ snake_case และ migrations เท่านั้น | กติกาข้อ 4 และ 7; REQ-C09–REQ-C10 | C02 | ชื่อใน BLUEPRINT เป็นชื่อเชิงออกแบบ ยังไม่มี schema/migration จริง |
| DEC-008 | Confirmed | ทุกการเปลี่ยนข้อมูลธุรกิจบันทึก audit_logs และใช้ soft delete | กติกาข้อ 9 และ 10; REQ-C11–REQ-C12 | C02 + C03 | ประวัติไม่ใช่อนุญาตเก็บข้อมูลอ่อนไหวตลอดไป; retention ต้องผ่าน Q016 |
| DEC-009 | Confirmed | เอกสารเป็น HTML print และผู้ใช้บันทึก PDF จากเบราว์เซอร์ | รายการเทคโนโลยีล่าสุด; REQ-C15 | O08 + C02 | ไม่มีข้อกำหนดให้ติดตั้งตัวสร้าง PDF; ตรวจสิทธิ์หน้า print เท่าต้นทาง |
| DEC-010 | Confirmed | ทดลองด้วยข้อมูลสมมติ แยกกฎไม่ยืนยันและห้ามใช้เป็นระเบียบทางการ | กติกาบทเรียน; REQ-C14 | C01 + เจ้าของเรื่อง | TO VERIFY ไม่ขวางส่วนทดลอง แต่ gate ข้อมูลจริง/ผลทางการเฉพาะส่วนที่เกี่ยวข้อง |
| DEC-011 | Proposal | เจ้าของงาน O01–O09 และบทบาทส่วนกลาง C01–C04 ตาม Charter | ครอบคลุม 9 หน้าที่โดยยังไม่มีรายชื่อหรือผังฝ่ายทางการ | C01 | Q005 ต้องยืนยันผู้รับหน้าที่จริงก่อน UAT/เปิดจริง; ไม่สร้างหน่วยงานทางการจากการเดา |
| DEC-012 | Proposal | ปล่อยส่วนย่อย ทดลอง–นำร่องจริง–ขยายตาม gate ใน Charter | ลดความเสี่ยงข้ามระบบและไม่เดาวันเสร็จทั้งประเทศ | C01 | ไม่ใช้ตารางลำดับพัฒนาเป็นคำสั่งทำบทล่วงหน้า; Q013/Q014 ก่อนกำหนดแผนเวลา |
| DEC-013 | TO VERIFY | ยังไม่เลือกเวอร์ชันแพ็กเกจ บริการ scan หรือ runtime งานยาว | ยังไม่มี package.json/lockfile/ข้อมูลโหลด; Q011/Q012/Q014 | C02 | Redis/BullMQ/Keycloak/Auth.js/Prisma ไม่เป็น dependency ของข้อกำหนดล่าสุด; งานยาวต้องออกแบบในบทที่เกี่ยวข้อง |
| DEC-014 | Confirmed | บท 01 ทำเอกสารและ Git เท่านั้น ไม่ทำ UI, DB, migration, policy หรือ deploy | ขอบเขตบท 01 และแผนที่ผู้ใช้ตอบ “ตกลง” วันที่ 3 ตุลาคม 2569 (2026-10-03) | C01 + C02 | สร้างเอกสารกลางที่จำเป็นได้; บทถัดไปรอพรอมป์ต์และการอนุมัติแผน |

## วิธีอัปเดต

เมื่อมีหลักฐานใหม่ ให้บันทึกวันที่ แหล่งหลักฐาน ผู้มีอำนาจรับรอง ผลต่อ REQ และ Q ที่ปิด และบันทึกรายการเปลี่ยนที่แทนรายการเดิมโดยรักษาประวัติ ไม่เปลี่ยน Proposal เป็น Confirmed เพียงเพราะสร้างโค้ดแล้ว หลักฐานต้องไม่เผยแพร่ secret หรือข้อมูลบุคคลเกินจำเป็น

## ประวัติเอกสาร

- บท 01: อ่าน BLUEPRINT เดิมและเอกสารพรอมป์ต์แนบ พบชื่อ/เทคโนโลยีเดิมกับเอกสารกลางที่ยังไม่มี จึงปรับตามข้อกำหนดผู้ใช้ล่าสุดและสร้างเอกสารบทนี้
- ใช้ Supabase แทนข้อเสนอ Auth.js/Keycloak/Prisma เดิม และคงรายละเอียดธุรกิจ 9 ระบบ ไม่ติดตั้งแพ็กเกจหรือสร้าง migration ในบทนี้

ประเด็นที่ยังไม่มีคำตัดสินติดตาม Q001–Q016 ใน OPEN_QUESTIONS และผู้รับหน้าที่จริงของ O01–O09/C01–C04 อยู่ Q005

## รายการเพิ่มจากบท02

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-015 | Confirmed | บท02ทำspecification/usecases/matrix/permissionsและอัปเดตสถานะ ไม่ทำimplementation | พรอมป์ต์บท02และผู้ใช้ตอบตกลงวันที่3 ตุลาคม 2569 (2026-10-03) | C01 + C02 | TCทุกกรณีplanned/notrun; บทถัดไปรอพรอมป์ต์ |
| DEC-016 | Proposal | contractpermission P01–P11และserver+RLSdeny by default | ขยายREQ-C05/REQ-C06/REQ-C07จากCharterเป็นสิทธิ์รายaction | C02 + เจ้าของเรื่อง | roleตามหน้าที่ไม่ใช่การแต่งตั้ง; ตรวจQ002/Q005/Q006/Q019ก่อนเปิดจริง |
| DEC-017 | Confirmed + Proposal | เวลาไทย Asia/Bangkok แสดงพ.ศ.และแยกปีการศึกษา/ปีงบ; ช่วงเวลาปิดปลายเสนอ | ข้อกำหนดบท02; PostgreSQL date/time docsประกอบการออกแบบ | C02 + O05 + O06 | Q017รับรองขอบเขตปี หน้าต่างเวลาและcalendar ก่อนใช้จริง; ไม่เดาวันเริ่มปีงบ |
| DEC-018 | Proposal | เป้าหมายaccessibility WCAG2.2 AAพร้อมmanual/fullflowและautomated review | ข้อกำหนดaccessibilityในบท02และW3C WCAG2.2ที่อ่าน | C02 + O03 + C01 | Q018ต้องยืนยันscope/browser/assistivetech; ไม่รับรองผ่านจากคะแนนtool |
| DEC-019 | Confirmed + Proposal | backupต้องรวมDBและเนื้อไฟล์จริง มีmanifest/hashและrestoreแยกพื้นที่ | REQ-C20/Q012และเอกสารSupabaseระบุDBbackupไม่รวมStoragebytes | C02 + C01 | RPO24h/RTO4hยังproposal; ต้องวัดจริงและตรวจACL/outboxหลังrestore |
| DEC-020 | Proposal | appAPIใช้401/403/404/409/422ตามcontract; nativeAPIพิสูจน์norows/nowrite | ข้อกำหนดตรวจสิทธิ์และไม่ให้ข้อมูลรั่ว; RLSreturnไม่เหมือนappAPIเสมอ | C02 | Q019รับรองerror/privacy/tracking/URLexpiry; ความหมาย403ไม่ใช้แทนRLSทุกกรณี |
| DEC-021 | TO VERIFY | บทimplementationของแต่ละREQยังไม่ระบุเลขจากการเดา | มีพรอมป์ต์เพียง01และ02 ไม่มีชุดบทลงมือครบ | C01 + C02 | Q020เติมเมื่อได้รับพรอมป์ต์; matrixระบุ02spec+futureTO VERIFY |
| DEC-022 | Confirmed | เชื่อมoriginกับhttps://github.com/cipherpolno0/9_gpt.gitและยืนยันrepoผ่านGitHubplugin | ผู้ใช้สั่งเชื่อม; pluginget_repoพบpublicและpermissionspull/push; branchesคืน[] | C02 | repositoryว่างณการตรวจ ยังไม่มีcommitบนGitHub; localcommitsคงประวัติบท01/02 |

ใช้การอนุมัติแผนบท02เฉพาะขอบเขตที่ผู้ใช้สั่ง ข้อกำหนดของบท01คงเดิมและไม่ถูกเขียนทับ

## รายการเพิ่มจากบท03

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-023 | Confirmed | บท03ออกแบบผังเมนู เส้นทางใช้และแบบร่างร่วม ไม่สร้างระบบจริงหรือเริ่มบท04 | พรอมป์ต์บท03และผู้ใช้ตอบตกลงวันที่3 ตุลาคม2569 | C01 + C02 + C04 | ส่งมอบSITEMAP/UX_FLOWS/WIREFRAMESและHTMLต้นแบบแก้ไขได้ ไม่มีmigration/deploy |
| DEC-024 | Confirmed + Proposal | เมนูpublic7/app9สามกลุ่มตามBLUEPRINT; 9ระบบธุรกิจและExcelย่อยของสอบ | จำนวน/ชื่อเป็นConfirmed; pageinventoryPG-01–PG-41และrouteย่อยเป็นProposal | C02 + O01–O09 | adminแยกตามgrant แดชบอร์ดนับเฉพาะงานที่มีสิทธิ์ backend/RLSตรวจเองไม่พึ่งเมนู |
| DEC-025 | Confirmed + Proposal | header/menu/content servicesและcontact/login/download/news/help/FAQ/policies/notificationsใช้ต้นทางเดียว | ผู้ใช้สั่งบริการร่วม; route/help/FAQ/policiesและcomponentเป็นข้อเสนอ | C04 + C02 + C03 | public/privateเป็นprojectionจากทะเบียนเดิม ไม่สร้างPerson/Organization/Application/เอกสารอีกชุด |
| DEC-026 | Proposal | 13wireframesแก้ไขได้พร้อม65สถานะผิด/รอ; ต้นแบบHTMLออฟไลน์แยกจากappจริง | 10หน้าที่สั่ง+dashboard/login/trackingเพื่อเดิน4กลุ่มครบ | C02 + C04 + เจ้าของเรื่อง | ใช้rendererกลางสำหรับtable/form/state/navigation; ไม่เก็บcredentialหรือส่งข้อมูลจริง ทุกruntimeTCยังNOT RUN |
| DEC-027 | Proposal | mobile<48remใช้modalnav; tabledatasetเดียวเป็นบัตรหรือกรอบเลื่อน; stepformรักษาร่างและfocuserror | ข้อกำหนดบท03และแนวทางW3C dialog/formnotificationsที่อ่าน | C02 + C04 + O03 | Q018/Q021ตรวจผู้ใช้/อุปกรณ์จริง; ตรวจprototypeไม่เท่ากับผ่านWCAGหรือUAT |
| DEC-028 | Confirmed + Proposal | แยกส่งตรวจ/อนุมัติ/วันมีผล importreceipt/approval learning/officialresult และread/receiptหนังสือในUX | กติกากลางConfirmed; labelsและตำแหน่งเป็นProposalจากUCบท02 | O03 + O04 + O05 + O06 + O08 + O09 | กฎTO VERIFYยังเป็นconfigurationทดลองและปิดgateทางการ ไม่มีวงเงิน/คะแนน/ชื่อแบบที่แต่งขึ้น |

การอนุมัติแผนบท03อนุญาตสร้างเอกสารและต้นแบบในขอบเขตนี้ ไม่ปิดQทางการหรืออนุญาตเผยแพร่ขึ้นGitHub/เปิดproduction ไม่มีการเปลี่ยนการตัดสินใจบท01/02ย้อนหลัง

## รายการเพิ่มจากบท04

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-029 | Confirmed | บท04ทำแบบข้อมูล ERD/dictionary/classification ครบ9ระบบและตรวจข้อมูลสมมติ ไม่สร้างmigration | พรอมป์ต์บท04และผู้ใช้อนุมัติด้วยตกลง; ฐานบท02 134cf16/บท03 10adf9a | C01 + C02 | รุ่นเอกสาร1.4 schemaจริงยังไม่มี migration0 ไม่เริ่มบท05 |
| DEC-030 | Confirmed + Proposal | Person/Organization/AcademicYear/ExamSessionร่วม UserAccountแยก; private schema RLSทุกตารางและpublicผ่านDTO | หลักแชร์/สิทธิ์เป็นConfirmed; 128ตารางและแยกฟิลด์Hเป็นProposalในdata_model.json | C02 + C03 + O01–O09 | ไม่มีlogin/Person/application/import registryซ้ำ ชื่อ/โครงphysicalรอQ023/Q024 |
| DEC-031 | Confirmed + Proposal | แยกภูมิศาสตร์ สายปกครอง สังกัดศึกษา scope; ใช้ประวัติสองเวลาและsnapshotรายปี | กติกาประวัติ/ขอบเขตConfirmed; interval/exclusion/recorded-superseded/sourceFKเป็นProposal | O01 + O02 + O05 + C02 | ไม่ใช้จังหวัดให้สิทธิ์ ไม่เอาชื่อปัจจุบันทับผลเก่า; อำนาจ/จำนวนหน้าที่จริงQ002/Q024 |
| DEC-032 | Confirmed + Proposal | ทุกฟิลด์มีชั้น P/I/R/H และpublic DTOallowlistตามsource/รุ่นpolicy | ห้ามข้อมูลส่วนตัวบนpublicเป็นConfirmed; fieldclasses/whitelistเสนอC03ตรวจQ025 | C03 + C04 + เจ้าของเรื่อง | Pไม่เปิดdraft private tablesไม่เผยแพร่ ข้อมูลจริงเผยแพร่ปิดระหว่างQ008เปิด |
| DEC-033 | Confirmed + Proposal | งบใช้budget_event/posting ledger exactdecimal แยกreserve/obligate/spent; พัสดุและassetแยกแต่เชื่อมref | exactdecimal/แยกงบพัสดุครุภัณฑ์Confirmed; bucketledgerและprecisionเป็นProposal | O06 + O07 + C02 | ไม่หักยอดซ้ำ reserve→obligate; chart/วงเงิน/หน่วย/precisionจริงQ006/Q024 |
| DEC-034 | Proposal | PK/FKRESTRICT typedtargets compositeFK unique/contextindexesและcurrenthistoryexclusion | dictionaryระบุครบ; การป้องกันปลอมคน/รอบ/รุ่นต้องconstraints+transaction+RLSจริง | C02 + เจ้าของข้อมูล | naturalkeys/cardinality/extension/versionรอQ023/Q024 ไม่อ้างconstraintทำงานจากเอกสาร |
| DEC-035 | Proposal | ชื่อconceptเดิมปรับorder→purchase_order learning_attempt→attempt; person_change_requestเป็นextensionของchange_request | BLUEPRINT/บท02เป็นlogicalconcept ไม่ใช่ตารางจริง; aliasmappingท้ายdictionary | O01 + O04 + C02 | ไม่มีengineคำขอ/ใบสมัครซ้ำ ต้องรับรองชนิดเรื่องQ024ก่อนmigration |
| DEC-036 | Confirmed + TO VERIFY | BROWSER-03คงเปิด แยกจากการตรวจแบบข้อมูลบท04 | บท03มีหลักฐานbrowserติดตั้งไม่สำเร็จ; บท04ไม่พึ่งผลภาพ/focusเพื่อออกแบบPK/FK | C02 + C04 | ไม่ใช้fixtureบท04ปิดgatebrowser/API/RLSหรือTC90; งานที่พึ่งUXต้องตรวจจริงภายหลัง |

เอกสาร/ข้อมูลสมมติไม่ได้ปิดประเด็นทางการ บท04ไม่เปลี่ยนฐานข้อมูลจริง ไม่อัปโหลดcommitไปGitHub และไม่เลือกเวอร์ชันPostgreSQLจากเลขเวอร์ชันหน้าอ้างอิง

## รายการเพิ่มจากบท05

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-037 | Confirmed | บท05ตั้งเครื่องมือในrepositoryเดิม เพิ่มPrisma pnpm ComposeRedisและworkerตามพรอมป์ต์ | ผู้ใช้ส่งบท05และอนุมัติแผนด้วยตกลง; ฐานบท04 95f8032 | C01 + C02 | ไม่ทำ128models/Auth/import/ธุรกิจหรือบท06 ไม่เปลี่ยนSupabaseAuth/Storage/Vercel |
| DEC-038 | Accepted สำหรับlocal | Node24.19.0 pnpm11.28.2 Next16.3.8 React19.3.0 TS5.9.3 Tailwind4.3.3 Prisma7.10.0 CLI/client/adapterและlockfileชุดเดียว | เอกสารทางการ+registryengines/peers+ผลcleaninstall/build ดูADR001; Prisma latestเป็น8RCจึงไม่เลือก | C02 | packageManager/engines/.nvmrcตรงกัน ไม่ใช้latestหรือAPIPrisma6ปน7 ตัวอย่างบทถัดไปตามADR |
| DEC-039 | Confirmed + Proposal | โมดูล9โฟลเดอร์เป็นเจ้าของบริการ core/server/sharedร่วม Excelใช้examsเดิม workerprocessแยก | กติกาผู้ใช้+โครงsrc/modulesในบท05 | C02 + O01–O09 | มีREADMEขอบเขตแต่ยังไม่มีbusinesshandlers ไม่สร้างlogin/application/Personซ้ำ |
| DEC-040 | Accepted สำหรับlocal / TO VERIFY runtime | ComposeofficialPostgreSQL18.6/Redis8.10.2 bindlocalhost volume18pathใหม่ healthchecks envlocalสุ่ม | ตรวจofficialimages+configด้วยDockerCLI29.8.2/Compose5.6.0; daemonและnamespaceใช้ไม่ได้ | C02 | DOCKER-05ค้างpull/up/healthy/volume/workerpositive; Q026ต้องหลักฐานก่อนบทพึ่งบริการ ไม่ยืนยันรุ่นSupabaseจริงQ023 |
| DEC-041 | Accepted bootstrap | /app catchallทุกHTTPmethodคืนserver403/no-storeระหว่างไม่มีAuth/grants | unitและHTTP27กรณีผ่านรวม/app/admin/imports ไม่มีข้อมูลจริง | C02 | ปิดพื้นที่ทำงาน ไม่ถือAuth/RBAC/RLSสำเร็จ เพิ่มrouteภายหลังต้องserverguardและnegative testsจริง |
| DEC-042 | Accepted | ESLint10.12.0ใช้@next/eslint-plugin-next16.3.8โดยตรง+typescript-eslint8.71.0/ReactHooks7.1.1/@eslint/js10.0.1 | ESLint9deprecated และbundleeslint-config-nextยังมี3pluginที่peerไม่รับ10; เปลี่ยนตามทางเลือกทางการ ผลpeerscheckไม่มีissue | C02 | ไม่overridepeersให้เงียบ ไม่มีjsx-a11ypluginที่peerไม่ตรง; a11y/BROWSERจริงยังค้างแยก |
| DEC-043 | Confirmed + Proposal | env:initสร้าง.envlocalสุ่มไม่แสดง/ไม่ทับเดิม Gitignore/secretcheckแพตเทิร์นก่อนcommit ติดตั้งscriptsแบบallowBuilds | ข้อกำหนดsecretConfirmed กลไกเสนอมีผลตรวจlocal/clean/staged | C02 | ZIP/Gitไม่รวม.env/node_modules/.next; ไม่อ้างตรวจsecretทุกชนิดหรือปลอดภัย100% |
| DEC-044 | Accepted ตามหลักฐานเฉพาะstarter | cleanfolderไม่มี.env/node_modules/.next frozeninstallแล้วvalidate/lint/type/test12/format/secret/build/HTTP27ผ่าน และdevHTTP200ไทยผ่าน | คำสั่งจริงในPROGRESS; ใช้cacheแพ็กเกจกลางตามปกติ ไม่มีDBในstarter | C02 + C01 | ผ่านเกณฑ์เว็บ/เครื่องมือ ไม่ใช้ผลแทนcontainer/Auth/RLS/audit/import/ธุรกิจ/TC90หรือBROWSER-03 ไม่มีpush/deploy |

การอนุมัติบท05ไม่ปิดกฎทางการและไม่อนุญาตบทถัดไป เปลี่ยนเทคโนโลยีเฉพาะเครื่องมือที่พรอมป์ต์บท05เพิ่ม ไม่ย้ายaccount/StorageออกจากSupabase

## การตัดสินใจบท06 — core0.6.0

| รหัส | สถานะ | การตัดสินใจและเหตุผล | หลักฐาน/ผลตรวจ | ผู้รับผิดชอบเสนอ | ขอบเขต/ความเสี่ยง |
| --- | --- | --- | --- | --- | --- |
| DEC-045 | Accepted สำหรับทดลอง | สร้าง19models/213fieldscoreเท่านั้นตามADR002 Person/Organizationร่วม UUID/FKRESTRICT snake_case ไม่มีlogin/applicationอีกชุด | Prisma7validate/generate/typecheck; migration20261003130000_core_foundation | C02 + O01 + O02 | แบบ128ตารางยังdesign ไม่สร้างExamSession/ธุรกิจล่วงหน้า |
| DEC-046 | Accepted สำหรับlocalbootstrap | ServiceActorเป็นprovenanceไม่มีloginสิทธิ์ แยกจากPerson/UserAccount; DocumentmetadataและPolicyVersionเป็นdependencyหลักฐาน/ปี | seedสมมติ41rows + audit41; RLSปิดทุกตารางและไม่เชื่อGUCเป็นauthorization | C02 + C03 | ไม่มีAuth/storagefiles/scan/ACLdownloadจริง accountprovenanceเพิ่มในบทบัญชีด้วยmigrationรักษาหลักฐาน |
| DEC-047 | Accepted สำหรับทดลอง | ใช้dateGregorian+timestamptz, CElabelแปลงBEตอนแสดง; ranges[จาก,ถึง)ตัดวันAsia/Bangkok ปีงบแยกปีศึกษา | unit testsก่อน/หลัง17:00UTC+ปีใหม่+leapdate; SQLWASMเทียบวันไทย | O05 + O06 + C02 | Q017ยังรอปฏิทินทางการ ไม่deriveFYจากAY/วันที่เริ่ม |
| DEC-048 | Accepted สำหรับทดลอง | ประวัติimmutableพร้อมeffective/recorded/evidence/supersession exclusioncurrentknowledge; auditร่วมtransactionเก็บชื่อฟิลด์ไม่มีค่าข้อมูลส่วนตัว | SQLWASM FK/unique/exclusion/history/softdelete/auditrollbackผ่าน | C02 + C03 | btree_gistต้องพร้อมบนเป้าหมาย; concurrency/nativePrismaยังNOT RUN |
| DEC-049 | Accepted สำหรับlocal | migrate/create/seed/testguardบังคับAPP_ENVlocal/test+loopback+ชื่อฐานเฉพาะ ไม่มีDROP/RESET; ใช้ฐานใหม่suffixเพื่อเริ่มซ้ำ | guardunitผ่าน ปฏิเสธremote/production/query/ชื่อฐานอื่น ไม่logURL/password | C02 | loopbackต้องเป็นบริการทดลองจริง ไม่มีการแตะproduction |
| DEC-050 | Accepted แบบผลตรวจแยก | เพิ่มdev-onlyPGlite0.5.8pinlockfileตรวจSQLด้วยPostgreSQL18.3WASM; ไม่เปลี่ยนCompose18.6หรือAPIPrisma7 | db:test:sql12testsผ่าน; fixtureSQLreplayคง41rows/audit41; engineversionบันทึกจริง | C02 | ไม่ถือแทนmigrate deploy/PrismaPg seed/concurrency/networkserver; DB-06ยังเปิด ห้ามอ้างผ่านAC06 |

ข้อกำหนดทางการQ001–Q026ยังเปิด และประเด็นใหม่Q027ติดตามผลPostgreSQLserver ไม่push/deployหรือเริ่มบท07จากการอนุมัติบท06

## ตรวจ dependency ก่อนบท07

| รหัส | สถานะ | การตัดสินใจและเหตุผล | หลักฐาน | ผู้รับผิดชอบเสนอ | ขอบเขต |
| --- | --- | --- | --- | --- | --- |
| DEC-051 | BLOCKED / ตามแผนบท07ที่อนุมัติ | ตรวจทางปิดDB-06ก่อนสร้างauthz ถ้าไม่มีPGserverให้หยุดที่dependency ไม่ถือพรอมป์ต์/การอนุมัติเป็นผลผ่านบท06 | 3ต.ค.2569ตรวจซ้ำinitdbroot/runuserปฏิเสธ; pg127.0.0.1:5432ECONNREFUSED; pnpmdb:testฐานtestใหม่loopback5546exit1 | C02 + C01 | ไม่สร้างschema/migration/UserAccount/Role/Permission/Scope/DALของบท07 ผลserverยังNOT RUN; วิธีปิดในDATABASEข้อ10 ไม่push/deploy |

## ตรวจ dependency ของบท10

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-052 | BLOCKED / prerequisite ตามพรอมป์ต์ | บท10ต้องผ่านบท08ก่อน Document metadata และ worker readiness ไม่เพียงพอสำหรับบริการไฟล์ที่ตรวจบัญชีและ ACL | ตรวจ repository 3ต.ค.2569 ไม่พบ authz/auth หรือ FileVersion/FileAccessPolicy; local PG5432/5546ยังเชื่อมต่อไม่ได้และไม่มี Docker | C02 + C01 | บันทึกสถานะเท่านั้น ไม่เปิด upload/download/preview ไม่สร้างบัญชีหรือ ACL ชั่วคราวอีกชุด; ปิดDB-06แล้วทำ07และ08ก่อน10 ผลตรวจรับบท10 NOT RUN |

## แบบเตรียมบท11 — ยังไม่ใช่ implementation

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-053 | BLOCKED / prerequisite ตามพรอมป์ต์ | บท11ต้องผ่าน07/10ก่อน เตรียม WORKFLOW_ENGINE รุ่น0.1ได้เฉพาะเอกสาร | repositoryมี audit_logs/row_version core แต่ไม่มี authz/files/outbox และ localPGยังไม่พร้อม | C02 + C01 | ไม่เขียน engine/migration/consumer ไม่เปิดสิทธิ์ทดลองลัดขั้น แผนตรวจรับทั้งหมด NOT RUN |
| DEC-054 | Proposal | AuditEvent เป็นสัญญาบริการที่ต่อ audit_logs เดิม ส่วน workflow pinรุ่นกฎ/resource/evidence และใช้ transaction รวมผลหลัก/decision/audit/outbox | กติกาผู้ใช้ทะเบียนและauditกลางเดียว; metadata Document เดิมไม่พิสูจน์scan; รายละเอียดใน WORKFLOW_ENGINE | C02 + O01–O09 | ต้องเพิ่มผ่านmigrationหลังdependencyผ่าน ไม่สร้างauditทะเบียนอีกชุดและไม่ให้engineข้ามbusiness invariants |
| DEC-055 | Proposal / TO VERIFY implementation | durable outbox และ notification/dev sink receipt ใช้unique dedupe keyกับtransactionเดียว; workerlease/retry/dead letterต้องทดสอบnativePG | เกณฑ์หยุดworker/กลับมาทำต่อของบท11; workerปัจจุบันยังreadinessเท่านั้น | C02 + C01 | devไม่ส่งข้อความออกจริง ไม่อ้างexactly-onceexecutionหรือproviderภายนอกไม่ซ้ำจนมีสัญญาและผลทดสอบ |

## ตรวจรับบท12 — ไม่ผ่าน foundation gate

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-056 | Accepted ผลตรวจเฉพาะstarter / foundation BLOCKED | clean source9ded24dผ่านcheck/build/17unit/12SQLWASM/27HTTPsmoke ไม่ใช้แทนprerequisite06–11หรือfullbusinessflow | คำสั่งชุดสุดท้ายและข้อจำกัดในFOUNDATION_ACCEPTANCE1.0; db:test/worker:checkexit1 | C02 + C01 | ไม่เริ่มระบบเฉพาะ ไม่สร้างlogin/สิทธิ์/scanปลอมให้smokeผ่าน ไม่push/deploy |
| DEC-057 | Accepted หลักฐานจำกัด / TO VERIFY runtimeเต็ม | markerprobeของdev/buildพบ0hitsในresponse/static/prerender และ/app8paths7methods403/no-store แต่ยังไม่มีprivateDB/session/cross-usercache | supplementaryprobe75responsesต่อโหมด/28assets/15prerenderfiles ไม่ใช่publicDTOจากข้อมูลจริง | C02 + C03 | เกณฑ์12-02 PARTIAL ไม่รับรองCDN/cacheisolation/authzข้ามพื้นที่จากstarter |
| DEC-058 | Accepted การบันทึกหลักฐาน | อัปเดตTRACEABILITYด้วยF12evidenceและสถานะล่าสุด แยกbaselineบท02ออกจากimplementationปัจจุบัน | พรอมป์ต์บท12ให้รายงานสิ่งมีเพียงหน้าจอ/ยังไม่ทำ/TO VERIFY | C02 + C01 | ไม่เปลี่ยนTCธุรกิจเดิมเป็นPASSจากWASMหรือbootstrapdeny; ขั้นถัดไปปิดDB-06และตรวจครบก่อนเริ่มบท13 |

## แบบเตรียมบท13 — prerequisite12ยังไม่ผ่าน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-059 | BLOCKED / prerequisiteตามพรอมป์ต์ | เตรียมPERSON_FIELDS/JSP_MAPPINGได้เฉพาะเอกสาร ไม่เพิ่มทะเบียนบุคคล13จนfoundation12ผ่าน | FOUNDATION_ACCEPTANCEจาก5f41a1fยังBLOCKED; ไม่มีauthz/files/workflowจริง | C02 + C01 | ไม่มีschema/migration/service/seed13 ผลทั้งสองเกณฑ์NOT RUN ไม่เริ่ม14 |
| DEC-060 | Confirmedหลักการ / Proposalข้อมูลเพิ่ม | ใช้Personกลางเดิม ตารางสังกัด/หน้าที่อ้างperson_idหลายรายการ ชื่อเดิมรักษาtimelineและperson_idเดียว; directoryเป็นprojectionที่serverอนุญาต | พรอมป์ต์13กับPerson/PersonPrivate/PersonNameHistory/PersonContactcoreที่มีจริง | O01 + C02 + C03 | ไม่สร้างPersonตามแต่ละสังกัด ไม่ให้fieldgrantจากroleทำเนียบเอง รักษาชั้นHก่อนรับรองpolicy |
| DEC-061 | TO VERIFY / Proposalmapping | มี4จุดติดตามธรรม/บาลี/สามัญ/ปริยัตินิเทศก์ตามผู้ใช้ แต่ไม่รู้ประเภทครบ/รหัส/ความหมายจศป.ทุกแท่ง | Q001/Q002/Q005/Q006ยังขาดหลักฐาน; JSP_MAPPINGเก็บofficialcodeเป็นNULL | O01 + C01 + O02 + C02 | ไม่ขยายคำย่อ ไม่เดาตำแหน่งหรือgrant ไม่ถือ4แถวว่าครอบคลุมประเภทจริงทั้งหมด |
| DEC-062 | Confirmedห้ามauto-merge / Proposalreview | รหัสตัวตนต้องมีissuer/namespace/หลักฐานยืนยัน; ชื่อและวันเกิดเป็นเพียงคู่คล้ายให้ผู้มีสิทธิ์ตรวจ | ข้อ4ของพรอมป์ต์13; coreperson_codeเป็นรหัสระบบไม่ใช่ตัวตนทางการ | O01 + C02 + C03 | ไม่uniqueชื่อ+วันเกิด ไม่บังคับวันเกิด ไม่เปิดduplicateoracle/privatefieldsต่อdirectory-only; mergeต้องรักษาFK/historyตามworkflowที่ยังไม่สร้าง |

## แบบเตรียมบท14 — prerequisite13ยังไม่ผ่าน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-063 | BLOCKED / prerequisiteตามพรอมป์ต์ | เตรียมPOSITION_RULESเท่านั้น ไม่สร้างservice/หน้า/seed14ก่อน13ผ่าน | source012d349ยังเป็นเอกสาร13และfoundation12BLOCKED ไม่มีPositionAssignmentจริง | C02 + C01 + O01 | ทุกruntime/seed/historyเกณฑ์14NOT RUN ไม่เริ่ม15 |
| DEC-064 | Confirmedหลักการ / Proposalสัญญา | ใช้effective_date/known_atแยกวันมีผลจากวันบันทึก และrevision/evidenceที่ตรึงไว้ แยกappointmentkindจากendedที่คำนวณตามวันอ้างอิง | พรอมป์ต์14และcore06historycontract; POSITION_RULESตัวอย่างยุติวันนี้แล้วอ่านปีก่อน | O01 + C02 + C03 | ไม่ทับไฟล์แต่งตั้งด้วยคำสั่งยุติ ไม่ใช้grantของวันอดีตอนุญาตผู้ใช้วันนี้ |
| DEC-065 | TO VERIFY / Proposalcapacity | กฎช่วงทับและจำนวนseatแยกตามประเภท/group/ruleversion รวมfuture reservation ไม่uniquePersonทั้งระบบ | ผู้ใช้ห้ามหนึ่งคนหนึ่งตำแหน่งทุกกรณี; จำนวน/อำนาจยังQ006/Q024 | O01 + C02 + C01 | ไม่ตั้งdefault1ทางการหรือNULLเป็นไม่จำกัด ไม่ถือcount-then-insertหรือlogicalexclusionเดิมพิสูจน์concurrencyแล้ว |
| DEC-066 | Confirmedขอบเขต / Proposalseed | coverage12combination4ระดับ×3หน้าที่และ4แผนกเป็นแผนDEMOตามผู้ใช้ ไม่ใช่รหัส/ประเภทจริงทั้งหมด | ตารางในPOSITION_RULES; JSP_MAPPINGยังTO VERIFY | O01 + C02 | ไม่seedจริงก่อนdependency ไม่มอบwebsiteRoleจากตำแหน่งหรือแผนกเอง |

## แบบเตรียมบท15 — prerequisite14ยังไม่ผ่าน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-067 | BLOCKED / prerequisiteตามพรอมป์ต์ | สร้างPERSON_VISIBILITYเป็นเอกสารเท่านั้น ไม่สร้างpages/DTO/export15ก่อน14ผ่าน | sourceaa94891ยังREADME-only/แบบ14 ไม่มีPositionAssignment/authz/account/bindingจริง | C02 + C01 + O01 | ทุกURL/export/keyboard/runtimeเกณฑ์15NOT RUN ไม่เริ่ม16 |
| DEC-068 | Confirmedหลักการ / Proposalquery | filterrow/relationship/fieldgrantก่อนค้น/count/pagination; publicต่อ4fieldallowlistเดิม ส่วนinternal/self/exportผ่านDALเดียว | พรอมป์ต์15และDATA_CLASSIFICATIONcoreH/สัญญาpublicDTO | C02 + C03 + O01 | ไม่ส่งPrismaobject/privateทั้งชุด ไม่เปิดhiddenoldnameoracle/cross-scopefacetหรือexportกว้างกว่าหน้าจอ |
| DEC-069 | Confirmedตรวจตัวตนก่อนbinding / Proposalflow | loginไม่ใช่Personproof ใช้verifiedactivebindingในserver; คนยังไม่มีบัญชียื่นตรวจหลักฐานก่อนread_self | พรอมป์ต์15/ข้อเสนอuser_account04/Q023; ไม่มี08/11implementation | C02 + C03 + O01 | ไม่สร้างlogin/Personซ้ำ ไม่auto-matchชื่อ/email/DOB ผู้ร้องไม่อนุมัติbindingหรือแก้ทะเบียนตนเอง |
| DEC-070 | Confirmedpolicyร่วม / Proposalexport/audit | exportมีactionแยก ใช้row/fieldpolicyร่วมและตรวจjob/download/revoke; logเฉพาะขั้นต่ำไม่rawชื่อ/ค้น/body/secret | พรอมป์ต์15กับdocuments10/workflow11ที่ยังBLOCKED | C02 + C03 + O01 | privateexportไม่อยู่publicfolder/staticassets ไม่อ้างsignedURLออกแล้วrevokeทันทีหรือcacheปลอดภัยจนมีผลทดสอบ |

## แบบเตรียมบท16 — prerequisite15/11ยังไม่ผ่าน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-071 | BLOCKED / prerequisiteตามพรอมป์ต์ | จัดทำPERSON_CHANGE_WORKFLOWSเท่านั้น ไม่สร้างrequest/ฟอร์ม/engine16ก่อน15/11ผ่าน | 4ต.ค.2569sourcef9b59d5ยังREADME-only/schemaไม่มีrequests/workflow; PGlocalยังConnectionRefusedError | C02 + C01 + O01 | ทุกpendingtransfer/trackingscope/runtimeเกณฑ์16NOT RUN ไม่เริ่ม17 |
| DEC-072 | Confirmedหลักการ / Proposaldomain | แยกrequesttype/workflowstate/affiliation/position/religious/lifestatus ลาออกระบุPOSITIONหรือEMPLOYMENT ไม่ใช้enumเดียวให้ทุกเรื่อง | ข้อ2/3ของพรอมป์ต์16และคำขอกลางlogicaldictionary04 | O01 + C02 + C03 | submitไม่เปลี่ยนทะเบียน pendingtransferไม่เปลี่ยนscope; effectiveเฉพาะผลที่รับรอง/invariantsผ่าน |
| DEC-073 | Confirmedใช้ส่วนกลาง / Proposalactivation | PersonChangeRequestเป็นส่วนขยายคำขอกลางหนึ่งworkflow มีrevision/evidence/expectedversions/receipt/audit/outboxร่วมtransaction | WORKFLOW_ENGINE/POSITION_RULES/PERSON_VISIBILITYยังแบบเตรียม; userกำหนดmakerchecker/history/idempotency | C02 + O01 + C01 | ไม่เพิ่มworkflowengineหรือlogin/Personซ้ำ ไม่ยืมdecisionเก่าให้revisionใหม่ ไม่ให้webgrantจากตำแหน่งหรือย้ายเอง |
| DEC-074 | Confirmedprivacy / Proposaltracking | ผู้ไม่มีresourcegrantไม่เห็นreason/type/status/subject/filemetadataของเรื่องprivate requestID/URLไม่ให้สิทธิ์ | เกณฑ์16-02กับpolicy15/เอกสาร10ที่ยังไม่สร้าง | C02 + C03 + O01 | tracking/API/export/file/jobตรวจสิทธิ์ปัจจุบัน no-store ไม่copyrawเหตุผลในnotification/audit/log ไม่เปิดanonymoustrackingจนpolicyรับรอง |

แผนบท07ได้รับคำว่า “ตกลง” แล้ว การอนุมัติคงอยู่สำหรับขอบเขตแผนเดิมเมื่อdependencyผ่าน ไม่ร้องขออนุมัติแผนเดิมซ้ำ ไม่ใช้ServiceActorแทนloginหรือสร้างบัญชีซ้ำเพื่อลัดขั้นตอน


## แบบเตรียมบท17 — prerequisite16ยังไม่ผ่าน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-075 | BLOCKED / prerequisiteตามพรอมป์ต์ | จัดทำPERSON_CHANGE_RECOVERY0.1เท่านั้น ไม่สร้างhandlers/scope/recoveryก่อน16ผ่าน | source518c2daยังREADME-only ไม่มีrequest/grant/account/outboxจริง foundation12ยังBLOCKED | C02 + C01 + O01 | P17-01–11และเกณฑ์17NOT RUN ไม่เลื่อนไป18จากเอกสาร |
| DEC-076 | Confirmedidempotency / Proposalreceipt | ใช้activationเจ้าของเดียว ผลหลัก/history/receipt/audit/outboxในtransaction uniquebusinesskeyและtargeteffectsกันeventซ้ำ | พรอมป์ต์17เกณฑ์1กับWORKFLOW_ENGINE/PERSON_CHANGE_WORKFLOWS | C02 + O01 | ต้องnativeconcurrency/crash/lease/out-of-order tests ไม่อ้างexactlyonceworkerหรือprovider |
| DEC-077 | Confirmedpolicy / Proposalintegration | ย้ายถอนเฉพาะgrantที่สิ้นฐานตามคำอนุมัติ ไม่มีscopeใหม่จากที่อยู่ ลาสิกขาไม่suspendทั้งหมด เสียชีวิตใช้บัญชีlifecycleเมื่อมีผล | ข้อ2/3ของพรอมป์ต์17 บัญชี08/Auth.jsOIDCและscope07ยังไม่สร้าง | C02 + C03 + O01 | DALdenyจากสถานะฐานปัจจุบันไม่รอOIDCsync ซึ่งเป็นoutboxนอกDBtransaction; กฎฐานอำนาจTO VERIFY |
| DEC-078 | Confirmedhistory / Proposalcorrection | แก้ผิดเป็นคำขอใหม่อ้างต้นทาง คืนgrantตามรายการที่อนุมัติ/currentconditions ไม่มีsnapshotrollbackหรือsessionrestore | ข้อ4/เกณฑ์2ของพรอมป์ต์17และaudit_logsกลางimmutable | O01 + C02 + C03 | ไม่แก้auditเก่า รายงานadapterที่ไม่สร้างเป็นUNKNOWN requiredgapบล็อก ไม่ลบผลสอบ/ผู้รับเอกสารsnapshot |


## ตรวจรับบท18 — ระบบบุคคลยังไม่ผ่านgate

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-079 | BLOCKED / prerequisiteตามพรอมป์ต์ | ตรวจรับ18ยังไม่ผ่าน13–17 สร้างUAT/คู่มือ/fixture/testspecเท่านั้น ไม่มีexecutablepeopletests | sourcef4f0e8a peopleREADME-only ไม่มีdomain/authz/session/workflow; localPGทั้งสองพอร์ตrefused | C02 + C01 + O01 | ทุกUAT18-T01–24NOT RUN ไม่ใช้unit17/CSVแทนruntime ไม่เลื่อนไป19 |
| DEC-080 | Confirmedขอบเขต / Proposalfixture | CSVDEMO14คน/16casesครอบคลุม12คู่ระดับหน้าที่และ4branchtracking Personเดียวหลายหน้าที่ | พรอมป์ต์18ข้อ1/แบบ14/JSP_MAPPING ไม่มีรายการประเภทเพิ่มเติมที่รับรอง | O01 + C02 | ยังไม่seed ไม่มีofficialcodes อำนาจ/capacity/mappingTO VERIFY ไม่ขยายคำย่อหรืออ้างครบโครงสร้างทางการ |
| DEC-081 | Proposaltestprotocol | UATแยกknown_at/วันมีผล/หลายหน้าที่/4requestflows/correction/grant/privacy/export/session/retry พร้อมmanifestต้นทาง | กติกาประวัติ/audit/ACLและเกณฑ์18 ไม่พบruntimeให้assert | C02 + C03 + O01 | ต้องnativeDB/service/API/job/browserจริง metadataDocument/403denyall/datehelperไม่ปิดcase |
| DEC-082 | Proposalคู่มือและsignoff | MANUAL_PEOPLEเป็นฉบับเตรียม ไม่อ้างหน้าจอ/ปุ่ม/URLจริงหรือผู้รับรองที่แต่งขึ้น | prerequisiteยังBLOCKED Q005/Q001/Q006ยังไม่มีเจ้าของ/หลักฐานทางการ | O01 + C01 + C03 | อัปเดตขั้นจริงจากUATเมื่อมีระบบ ไม่ให้สิทธิ์เว็บจากตำแหน่ง ไม่ใช้DEMOปฏิบัติงานจริง |


## แบบเตรียมบท19 — prerequisite18ยังไม่ผ่าน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-083 | BLOCKED / prerequisiteตามพรอมป์ต์ | จัดทำORGANIZATION_TYPES0.1เท่านั้น ไม่มีmodel/service/หน้า19เพิ่มก่อน18ผ่าน | sourcefc6afbe/UAT_SYSTEM_01ยังBLOCKED organizationsREADME-only coreไม่มีRelation/RelationType | C02 + C01 + O02 | P19-01–12NOT RUN ไม่อ้างcoreOrganizationหรือunit17แทนreparent/cycle ไม่เลื่อนไป20 |
| DEC-084 | Confirmedhistory / Proposalrelation | Organizationกลางเดียว relationมีชนิด/สาย/ช่วง/revision/evidenceและคำขอกลาง ไม่แก้parentช่องเดียวทับ | ข้อ1/2/3บท19กับlogicaldictionary04 Organizationcoreไม่มีparentorganizationcolumn | O02 + C02 | queryeffective_date/known_atคงปีเก่า type/parent/cardinality/อำนาจTO VERIFY geographyไม่ให้scopeเอง |
| DEC-085 | Proposalconstraint/transaction | temporalcycleตรวจpathintersectionในcycle_group/chain พร้อมlockกลุ่มและrestrictedwritepathสำหรับgraphwritersทั้งหมด | parent!=childและrowversionไม่กันconcurrentA→B/B→A; nativePGยังไม่ผ่าน | C02 + O02 | ไม่รวมสาย/ช่วงdisjointเป็นcycle ไม่หยุดdepthแล้วอ้างปลอดวงจร ต้องพิสูจน์concurrencyหลังdependencyผ่าน |
| DEC-086 | Confirmedreuse / Proposalresolver | หน่วยเรียนอ้างวัด/สถานศึกษาและAddressVersionกลางผ่านconfirmedhost/purpose/ACL; ไม่copyหรือmergeจากชื่อ/ที่อยู่ | ข้อ4บท19 AddressVersioncoreมีownerOrganizationFKเฉพาะ | O02 + O01 + C03 | HOSTED_ATไม่ให้webgrant/กรรมสิทธิ์ ที่อยู่จัดส่งต่างเก็บแยกอย่างมีเหตุผล หลักฐานFileVersionยังต้อง10จริง |


## แบบเตรียมบท20 — prerequisite19ยังไม่ผ่าน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-087 | BLOCKED / prerequisiteตามพรอมป์ต์ | จัดทำADDRESS_VALIDATION0.1เท่านั้น ไม่สร้างservices/หน้า/Locationmigrationก่อน19ผ่าน | sourceef0e27d organizationsREADME-only coreมีAddress/Contactแต่ไม่มีLocation/authz/files/workflow | C02 + C01 + O02 | P20-01–14NOT RUN ไม่ใช้corehistory/403starterแทนpublicprivacy/search/issuedsnapshot ไม่เลื่อนไป21 |
| DEC-088 | Confirmedหลักฐาน / Proposalvalidation | แยกphysical/mailing/Geography/CRS/สายสังกัด พิกัดมีหลักฐานคู่NULLเมื่อไม่มี ไม่เดาจากชื่อ | พรอมป์ต์20ข้อ1กับlogicaldictionary04 numeric(10,7)/coreGeography | O02 + C02 | source/country-postal/hierarchy/CRSต้องรับรอง ขอบเขตตัวเลขไม่พิสูจน์ตำแหน่งจริง ไม่เพิ่มgrantจากที่อยู่ |
| DEC-089 | Confirmedprivacy / Proposalmap | WORK/PERSONAL/verificationแยกกัน isPublicEligibleไม่ให้สิทธิ์ publicDTO6ช่องเดิมไม่มีcoordinates | DATA_CLASSIFICATION04 organization_public/name-address-contactR และเกณฑ์20-01 | C03 + C02 + O02 | publicmapต้องallowlist/publicationใหม่ ไม่มีprivateในGeoJSON/viewport/providerrequests textfallbackยังใช้ได้เมื่อmapล่ม |
| DEC-090 | Confirmedhistory / Proposalreview/snapshot | ใช้คำขอ/review/revision/history/audit/outboxกลาง และpinaddress/name/Geo/source/issuedFileVersionในเอกสารที่ออก | ข้อ4/เกณฑ์20-02 Documentcoremetadata-onlyไม่ใช่issuedartifact | O02 + C02 + C03 | ไม่แก้ไฟล์เอกสารเก่าหรือaudit sourceverificationแยกworkflow/updated_at และไม่เปิดprivateevidenceสาธารณะ |


## แบบเตรียมบท21 — prerequisite20ยังไม่ผ่าน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-091 | BLOCKED / prerequisiteตามพรอมป์ต์ | จัดทำEXAM_SESSIONS0.1เท่านั้น ไม่มีสนาม/รอบschemaหรือUI21ก่อน20ผ่าน | sourcef389af4 coreมีYear/Type/Levelเท่านั้น organizations/exams/importsREADME-only | C02 + C01 + O02 + O05 | P21-01–14NOT RUN ไม่อ้างcoreuniqueหรือDEMOmatrixแทนDB/admissionผ่าน ไม่เลื่อนไป22 |
| DEC-092 | Confirmedแยกตัวตน / Proposalschema | Centerแม่บทแยกExamSession/SessionLevel/CenterSession/CenterSessionLevelต่อแบบ04 มีcompositeFKtype/sessionและuniqueperround | พรอมป์ต์21ข้อ1/2; ช่วงชั้นและtypedplaceยังไม่มีlogical/runtimeครบ | O02 + O05 + C02 | identityหนึ่งหรือหลายสนามต่อหน่วยต้องรับรอง ไม่copyOrganization ช่วงชั้น/calendarentriesเสนอเพิ่มไม่ปนExamLevel |
| DEC-093 | Confirmedcalendar / Proposalstatus | pinรุ่นปฏิทิน/หลักฐานปีรอบไม่ใช้เว็บเก่า สถานะมีผลจากระบบ4แยกคำขอ adapterunresolveddeny | ข้อ3/4บท21 Q004/Q017/engine11ยังTO VERIFY/BLOCKED | O04 + O05 + O02 | ไม่มีdefaultวันสอบ/currentACTIVEปลอม windowserverclock/AsiaBangkokและAcademicYearแยกFiscalYear |
| DEC-094 | Confirmedtransaction / Proposalcapacitycontract | capacity/quotas/sharedpoolและcloseตรวจพร้อมapplication/reservation/receipt/audit/outboxโดยserviceระบบ5ร่วมExcel9 | เกณฑ์21-02กับข้อห้ามทะเบียนใบสมัครซ้ำ/transactionidempotency | O05 + O02 + C02 | 0ไม่unlimited unknownNOT_READY dryrunไม่lockseat ต้องnativeconcurrency/retry/cutoff/statusrace ไม่อ้างApplicationserviceมีจริง |


## แบบเตรียมบท22 — prerequisite21ยังไม่ผ่าน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-095 | BLOCKED / prerequisiteตามพรอมป์ต์ | จัดทำEXAM_CONTACT_VISIBILITY0.1เท่านั้น ไม่มีappointments/report22ก่อน21ผ่าน | source30db964 organizationsREADME-only ไม่มีCenterSession/Appointment/dispatchsnapshot/ACL | C02 + C01 + O02 | P22-01–14NOT RUN ไม่อ้างcorehistoryหรือDEMOscenarioแทนปีเก่าphone/crossscopeผ่าน ไม่เลื่อนไป23 |
| DEC-096 | Confirmedreuse/history / Proposalappointment | Appointmentอ้างPersonกลาง/CenterSession/3dutiesและtimeline แยกdispatchsnapshotจากappointment snapshotตาม04 | ข้อ1/2บท22 logical04มีname-addresssnapshotแต่ไม่มีphone/dispatchbinding | O02 + C02 | ไม่สร้างPerson/login/RoleAssignmentอัตโนมัติ จำนวนที่นั่ง/หลายหน้าที่/authorityTO VERIFY |
| DEC-097 | Confirmedprivacy / ProposalreportACL | รายงานprivate scopeสนาม-ปี-รอบ/fieldgrant/publicไม่ให้เบอร์ส่วนตัว แยกเอกสารแต่งตั้งกับเนื้อหาข้อสอบ | เกณฑ์22-02/ข้อ2/4และclassification04/ไฟล์10ยังBLOCKED | C03 + C02 + O02 | export/print/job/downloadcurrentACL ไม่มีquestionbytes/IDs/keys/previewในreport ให้artifactชั้นสูงสุดเมื่อรวมprivatecontact |
| DEC-098 | Confirmednoauto / Proposalpersonintegration | Personstatusมีผลแจ้งสนามแต่งตั้งใหม่ ไม่เลือกผู้รับแทน คืนหน้าที่ผิดเฉพาะcorrectionapproved | ข้อ4บท22กับPERSON_CHANGE_RECOVERY17ที่ยังแบบเตรียม | O02 + O01 + C02 | followup/effects/outboxreceiptต้องretry-safe รายงานdispatchเก่าimmutable ไม่มีexternalmessage/carrierAPIจริงในdev |


## ตรวจรับบท23 — คุณภาพทะเบียนหน่วยงานยังติด dependency

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-099 | BLOCKED / prerequisiteตามพรอมป์ต์ | ทำ UAT/กฎ/คู่มือ/fixture/test specification เท่านั้น ไม่สร้าง adapter ก่อน19–22ผ่าน | source2b38596 ไม่มี domain services/UI/appointments/import runtime; PGสองพอร์ต refused | C02 + C01 + O02 | UAT23-T01–18 NOT RUN ไม่มี executable system2 tests ไม่เลื่อนไป24 |
| DEC-100 | Proposal rules / Confirmedความซื่อตรงผล | DQ16กฎแยก FAIL/REVIEW/INFO/INDETERMINATE/NOT_EVALUATED ตาม operation และรุ่น | พรอมป์ต์23และแบบ19–22; ไม่มีพิกัดไม่ใช่ error, adapterขาดไม่เท่ากับไม่มีปัญหา | O02 + C02 | contact due ไม่ suspendเอง chair/recipientต้องตามปีรอบและหลักฐาน ไม่ประกาศ clean จาก expectedfocus |
| DEC-101 | Proposal typed import / Confirmed human review | staging private ใช้ shared typed primitives; diff/version/evidence/current scopeก่อนเลือก link/create/history/merge | logical04 import ผูก exam_session/matched_person_id ไม่ใช่ org adapter; ชื่อคล้ายไม่พิสูจน์หน่วยเดียว | O02 + C02 + C03 | ห้ามใส่ orgIDใน personFK; mergeเป็นคำขอ maker checker และ impact adapters required; domain/receipt/audit/outbox atomic |
| DEC-102 | Confirmedขอบเขต / Proposal coverage | 10แถว5ประเภทและ6Geographyrefsเป็น DEMO offline ไม่ใช่ข้อมูลจริงครบประเทศ | fixture/source labels และ expectedfocusเขียนด้วยมือ; rootunit17 ไม่ทดสอบ domain | O02 + C01 + C02 | ทุกประเภทต้องมี schema/UI/flowจริง; nationalcoverage/load NOT VERIFIED ไม่มี CSV/JSON import หรือ seed23จริง |


## แบบเตรียมบท24 — prerequisite23ยังไม่ผ่าน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-103 | BLOCKED / prerequisiteตามพรอมป์ต์ | สร้าง contract/coverage/contentpolicy0.1 ไม่สร้าง curriculumruntimeก่อน23ผ่าน | source22a62d2 UAT23BLOCKED learningREADME-only ไม่มีmodelsหรือattemptจริง | O03 + C02 + C01 | P24-01–09 NOT RUN ไม่ใช้9แถวเอกสารแทนschema/UIหรือเลื่อนไป25 |
| DEC-104 | Confirmedสองแกน / Proposalcontract | LearningGroupเก็บstageและธรรมศึกษาlevelแยก; 9คู่ ต่อCourseเดิมเพิ่มSubject/Topic/binding | พรอมป์ต์24/BLUEPRINT/แบบ04ยังไม่มีSubjectTopicและstagefields | O03 + C02 | FK/typeguardต้องแยกนักธรรม actualcodes/mapping TO VERIFY ไม่สร้างCourseหรือผลสอบอีกชุด |
| DEC-105 | Confirmedrights/review / Proposalpublish | source register pinรุ่น/ไฟล์/สิทธิ์/ผู้ตรวจ/window ใช้workflow/filesกลางและpublicallowlistเดิม | เปิดต้นทาง3แหล่ง4ตุลาคม ไม่รับรองcurrenteditionหรือreusepermission; Q007ยังเปิด | O03 + C03 + C02 | ไม่copytext/questionsจากdownloadlink ตัวอย่างDEMOแต่งใหม่ ข้อเขียนmanualrubricไม่objective |
| DEC-106 | Confirmedhistory / Proposalmanifest | sealcurriculum/lessonbindingsและpinattempt/rubric/scorepolicy แก้รุ่นหรือgradingrevisionใหม่ | เกณฑ์24-02และแบบ04ยังขาดcomplete lessonmanifest/explicitgradingbinding | O03 + C02 | ไม่joinlatest/rescoreอัตโนมัติ ไม่แก้audit/officialresults Withdrawalตามสิทธิ์ปัจจุบัน historyไม่เท่ากับpublicaccessตลอดไป |


## แบบเตรียมบท25 — prerequisite24ยังไม่ผ่าน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-107 | BLOCKED / prerequisiteตามพรอมป์ต์ | เตรียม QUESTION_BANK_CONTRACT/QUESTION_REVIEW0.1 ไม่สร้างquestionbank/CMSก่อน24ผ่าน | source2dfbe0d learningREADME-only coreไม่มีquestion/curriculum/attempt models | O03 + C02 + C01 | P25-01–12 NOT RUN ไม่ใช้privateDBแบบเสนอหรือ12casesแทนnetwork/historyจริง ไม่เลื่อนไป26 |
| DEC-108 | Confirmedชนิด / Proposaltypedcontract | แยกpractice-official/releaseclassificationจากquestionkind ใช้Choice/AnswerKeyChoiceและRubricVersionข้อเขียน | พรอมป์ต์25และ04ยังoptions/correct_answer/rubricJSON/manualgradingFKเดิม | O03 + C02 | ต้องปรับdictionary/ADR/migrationก่อนใช้ ไม่สองcanonicalchoices WRITINGไม่objective ไม่มีrights/embargoapprovalให้denypublic |
| DEC-109 | Confirmedserverprivacy / Proposalprojections | learnerได้stem/choicesเท่านั้นก่อนsubmit Key/Rubric/Explanationprivate; feedbackหลังservercommitต้องownercurrentpolicy | เกณฑ์25-01/classification24 ไม่ซ่อนkeyที่ส่งไปbrowser | O03 + C02 + C03 | network/HTML/RSC/cache/media/JS/error/export/anti-oracleต้องตรวจจริง ไม่ถือsubmittedจากclientเปิดkeyทั้งแถว |
| DEC-110 | Confirmedimmutable/makerchecker / Proposalwithdrawal | sealทุกchildversion ผู้ตรวจคนละcreator เปลี่ยนpublishedเป็นรุ่นใหม่ withdrawเป็นeventไม่ลบต้นทาง | เกณฑ์25-02/24manifesthistory/workflow11 | O03 + C02 + C03 | attemptเดิมpinquestion/choiceorder/key-rubric/Explanation/sourcepolicy ไม่joinlatest; continuationpolicyขาดไม่autoresume/grade; receipt/audit/outboxatomic |


## แบบเตรียมบท26 — prerequisite25ยังไม่ผ่าน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-111 | BLOCKED / prerequisiteตามพรอมป์ต์ | เตรียมPRETEST_FLOW/PRETEST_AUTOSAVE0.1 ไม่สร้างroutes/engineก่อน25ผ่าน | sourcedb10826 learningREADME-only coreไม่มีcurriculum/question/attempt/authzจริง | O03 + C02 + C01 | P26-01–15NOT RUN ไม่อ้าง15cases/Markdownแทนreload/clock/securityผ่าน ไม่เลื่อนไป27 |
| DEC-112 | Confirmedshared/pins / Proposalopportunity | PretestAttemptต่อAttemptกลาง PRE ใช้server-issuedopportunityและunique slot พร้อมsealed pool/seed/algorithm/items/policy | แบบ04attempt/enrollment/blueprintและงาน26ข้อ1/2 | O03 + C02 | ไม่สร้างlogin/learner/attemptซ้ำ สุ่ม/retryไม่เปลี่ยนชุด seed/keyprivate Poolไม่พอNOT_READYไม่ดึงofficial |
| DEC-113 | Confirmedrevision / Proposalqueue | autosaveCAS privateledger/receipt/Attemptlockร่วมsubmit Offlinepersistentdraftภายใต้นโยบายและstorageack | ข้อ3/เกณฑ์26-01และhistory/secret rules | O03 + C02 + C03 | stale409ไม่autooverwrite Keyเดิมpayloadต่างconflict savedเฉพาะserverack ไม่อ้างunsentdraftปลอดภัย/ไม่สูญหายทุกกรณี |
| DEC-114 | Confirmedserverclock/practice / Proposalgradingplan | submitpinrevisionmanifest/เวลาserverหลังlock receiptและgrading/planตามpinnedpolicy | เกณฑ์26-02และงานข้อ4; แบบ25withdrawpolicy | O03 + C02 | clientscore/timeไม่เปลี่ยนผล คนอื่นdeny manualรอตรวจไม่0 ไม่มีdoublecount/noevidenceข้อแนะนำ Planไม่เพิ่มgrant/officialresult |


## แบบเตรียมบท27 — prerequisite26ยังไม่ผ่าน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-115 | BLOCKED / prerequisiteตามพรอมป์ต์ | จัดLEARNING_FLOW0.1 ไม่สร้างpages/progressก่อน26ผ่าน | source997445a learningREADME-only ไม่มีpretest/lesson/progress/DALจริง | O03 + C02 + C01 | P27-01–14NOT RUN 9แถวcoverageไม่ใช่9flow ไม่เลื่อนไป28 |
| DEC-116 | Confirmedbackendorder / Proposalrequirements | submittedPRE→requiredactivities→sharedstartPOSTguard แยกrecommendationจากnonemptyrequiredsetมีรุ่น | งาน27ข้อ1/เกณฑ์1 และ26LearningPlanไม่ให้grant | O03 + C02 | clientready/phase/completed/RPC/jobข้ามguardไม่ได้ readystateไม่grantถาวร ไม่มีposttestengineใน27 |
| DEC-117 | Confirmedactivitycompletion / Proposalevidence | completionตามกิจกรรม/ทางเลือกที่รับรอง serverevidence/rulepins/CAS/checkpointจากprogressกลาง | งาน27ข้อ2/3/4 และlogical04ยังstatusอย่างเดียว | O03 + C02 | openpage/dwell/heartbeatไม่learningproof writingpendingไม่0 resumeต้องack ไม่ลดprogressหรือเพิ่มretakeจากทบทวน |
| DEC-118 | Confirmedprivate/accessibility / Proposaljourney | publiccontentแยกprivateprogress/feedback currentrights/withdrawal ทบทวน/transcript/slowmediaด้วยequivalentpath | งาน27ข้อ4/classification24/25feedbackpolicy | O03 + C03 + C02 | ไม่ใส่personalExplanationในsharedbody/cache ถอนrequiredบทpauseแทนskip/auto-complete ไม่มีclaimskeyboard/4viewportจนตรวจจริง |


## แบบเตรียมบท28 — prerequisite27ยังไม่ผ่าน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-119 | BLOCKED / prerequisiteตามพรอมป์ต์ | จัดASSESSMENT_RULES/LEARNING_REPORTS0.1 ไม่สร้างPOST/reportก่อน27ผ่าน | source474c03d learningREADME-only coreไม่มีattempt/grading/progressจริง | O03 + C02 + C01 | P28-01–14NOT RUN ไม่ใช้สูตร/ตารางว่าง/ไม่มีconsumerแทนreplayหรือofficialnegative ไม่เลื่อนไป29 |
| DEC-120 | Confirmedpins/ชนิด / Proposalcertification | POSTต่อAttemptกลาง guard27 ObjectivepinKey/policy/algorithm; WRITINGpinRubric/assignedgrader และRAW/CERTIFIEDภายในแยก | งาน28ข้อ1/2/เกณฑ์1 และ25typedrubric04ยังขาด | O03 + C02 | Score/reviewrevisionimmutable currentmakerchecker ไม่มีdefaultauto-certify/grade-ownresponse ไม่สร้างคะแนนกลางอีกชุด |
| DEC-121 | Confirmeddescriptive / Proposalcomparison | SAME_ITEMS/COMPARABLEมีversion/evidence PairRecordเลือกคู่ตามpolicy ไม่bestscoreเอง rawdelta/ppตามeligibility | งาน28ข้อ1/3กับ26samplingmanifest/27progress | O03 + C02 | noequivalenceจากmaxscoreเท่ากัน missing/pendingไม่0 retakecountไม่retry สองคะแนนไม่causalclaim |
| DEC-122 | Confirmedscope/officialboundary / Proposalaggregateprivacy | self/assignedteacherเท่านั้น Aggregateขาดpolicydeny ปิดsmallcellและderive-query officialwrite/eventcapabilitydeny | งาน28ข้อ4/เกณฑ์2/privacyclassification | O03 + C03 + C02 + O05 | ไม่มีkthresholdเดา/exportprivatecounts/key คะแนนฝึกและcertifiedภายในไม่SubjectScore/ResultReleaseระบบ5 ต้องnegativeproofจริง |


## ตรวจรับระบบ3บท29 — ยังไม่ผ่าน24–28

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-123 | BLOCKED / prerequisiteตามพรอมป์ต์ | จัดUAT_SYSTEM_03/MANUAL_LEARNING/specification23cases/9fixtureplan ไม่สร้างE2Eจำลองหรือข้าม24–28 | source30b92a5 learningREADME-only ไม่มีAuth/DAL/Attempt/Progress/report; DB/Dockerprobeยังblocked | O03 + C02 + C01 | ทุกUAT29NOT RUN rootunit17ไม่รับรองlearningflow ไม่เลื่อนไป30 |
| DEC-124 | Confirmed9coverage / Proposaltestfixture | แต่ละ9คู่ต้องflow+serverguard+privacy/keyboardจริง ActorDEMOrefsไม่grant ไม่สร้างlearner/loginซ้ำ | งาน29ข้อ1–3 เกณฑ์1 และ24สองแกน/27sharedguard | O03 + C02 | T01/02/03/12/13/14/17ทุกคู่ กรณีอื่นparameterizeชนิด/configที่มี ขาดให้BLOCKEDไม่skipPASS |
| DEC-125 | Confirmedcontentreviewแยกsoftware | SoftwareQA/contentexpertreview/releasedecisionเป็นtrackต่างกัน หลักฐานcontentpinmanifest/source/rights/version/scope/issuer | งาน29ข้อ4 เกณฑ์2; ตัวอย่าง24เป็นทักษะใช้เว็บDEMO ยังไม่มีคำรับรอง | O03 + C03 + C02 | E2EหรือCMSmakercheckerไม่รับรองธรรม รุ่น/กลุ่มใหม่ไม่inheritคำรับรองเก่า ยังTO VERIFY |
| DEC-126 | Confirmedprivateevidence / Proposalaccessibilitysuite | network/HTML/RSC/media/keycanary/nativecapability/fault assertionsหลักฐานprivate พร้อมkeyboard/focus/status/4viewport/timingตามpolicy | งาน29ข้อ2/3 และข้อกำหนดกลาง; WCAG2.2primaryตรวจอ่าน4ตุลาคม2569 | C02 + C03 + O03 | ไม่committrace/Key/token/คำตอบเต็ม ไม่อ้างWCAGหรือofficialnegativeผ่านจากCSV/absenceoftables |


## แบบคำขอระบบ4บท30 — prerequisite29ยังไม่ผ่าน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-127 | BLOCKED / prerequisiteตามพรอมป์ต์ | จัดORG_CENTER_REQUESTS/SCHEMA0.1 ไม่เพิ่มPrisma/migration/servicesก่อน29ผ่าน | source7c13070 requestsREADME-only ไม่มีcentralworkflow/Auth/DAL/FileVersion/ExamCenterจริง | O04 + C02 + C01 | 10coverage/14plansNOT RUN ไม่ใช้diagram/contractแทนFK/noeffectผ่าน ไม่เลื่อนไป31 |
| DEC-128 | Confirmedcoverage / Proposalfamilybinding | 4องค์กร+6สนามแยกtype typedextensions1:1ChangeRequest/RequestVersionกลาง; OPENtargetรองรับCenterSessionยังไม่มี | งาน30ข้อ1/3 และlogical04target-center_sessionเดิมยังขาดcreationbinding | O04 + O02 + C02 | ต้องADR/dictionary/ERD/migrationtypedtargets/canonical11states/evidenceFileVersion ไม่มีทะเบียน/login/approvalengineซ้ำ |
| DEC-129 | Confirmedrequest-vs-effect / Proposalactivationguard | requestก่อนeffectiveเขียนrequest/decision/receipt/audit/outboxเท่านั้น rejected/cancelledไม่มีactiveeffect; approvalversion/currentauthority/วัน/target/impactก่อนatomicowneractivation | งาน30ข้อ4/เกณฑ์2 กับworkflow11และhistory19–22 | O04 + O02 + C02 | ไม่autoเปิด/ยุบ/ย้ายจากsubmit/approval/notif ไม่แก้audit/snapshotหรือRoleAssignmentอัตโนมัติ staleeventต้องdeny |
| DEC-130 | ProposalROUND/identity/conflict / officialTO VERIFY | ทดลองสนามต่อROUND21 ไม่MASTERทุกปี; proposedOrgเก็บtypedrevisionก่อนeffective; conflictcanonicaldimension/time/timelineไม่blanketทุกtype | งาน30ข้อ2/3 และไม่มีทางการscope/form/authority/incompatibilityแนบ | O04 + O02 + O05 + C03 + C02 | source/form/rulesยังTO VERIFY missingadapterNOT_READY เปิดวันนี้ปิดวันหน้าตรวจตามกฎ ไม่ปิดอีกtype/yearหรือสร้างactiveOrgตั้งแต่ร่าง |


## แบบwizardและส่งคำขอบท31 — prerequisite30ยังไม่ผ่าน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-131 | BLOCKED / prerequisiteตามพรอมป์ต์ | จัดREQUEST_WIZARD/SUBMISSION0.1 ไม่สร้างหน้า/actionsจำลองก่อน30ผ่าน | source532aa8c requestsREADME-only ไม่มีsharedUI/Auth/DAL/documents/workflowจริง | O04 + C02 + C01 | 6steps/8actions/16casesแบบเตรียม ทุกP31NOT RUN ไม่เลื่อนไป32 |
| DEC-132 | Confirmedresume/returned / ProposalCASintent | headerเดิม/serverfirstdraft/CAS+receipt typedpatch Returnedเพิ่มrevision/cycleโดยไม่duplicateinstance | งาน31ข้อ2/เกณฑ์1 และ30sealedrevision/11review_cycle | O04 + C02 | needuniqueintent/binding/receipt nativeconstraints; offlineunsentไม่saved ไม่autooverwriteหรือcreateonGET |
| DEC-133 | Confirmedservervalidation/scope / ProposalDTO | configrequirements10typeและSafeIssueDTO ตรวจcurrenttarget/context/ACLทุกsave/submit มีreviewprecheckไม่grantถาวร | งาน31ข้อ1/3/เกณฑ์2; Next16.3.8localactionsecurityอ่านจริง | O04 + C02 + C03 | ไม่clientvalidationหรือhiddentargetเป็นauthority actionsเรียกตรงต้องDAL/RLS/CSRF/sessionจริง |
| DEC-134 | Confirmedtracking/notif / Proposalbinding | firstsubmitatomicseal+canonicalinstance+opaqueunique trackingref+receipt/audit/outbox; resubmitเลขเดิม Defaultsignedintracking | งาน31ข้อ4, OWASPIDORprimaryและ11outbox | O04 + C02 + C03 | trackingrefไม่capability publicproofขาดdeny notifcurrentrecipient/devsink/dedupe ไม่เผยfullreasonหรือเปลี่ยนactiveทะเบียนจากsubmit |


## ตรวจ blocker implementation31 ซ้ำ

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-135 | BLOCKED / ตรวจซ้ำจริง | คงgate30/DB-06ก่อน31; ใช้contracts31เดิมไม่สร้างหน้าหรือactionsที่ใช้mockALLOWแทนต้นทางจริง | source6574877 requiredmodels/servicesไม่มี Dockerไม่มี TCP5432/5546refused `corepack pnpm db:test` exit1 | C02 + O04 + C01 | ไม่มีnativeDBPASS/P31runtime; ตรวจenvironmentไม่ใช่CAS/scopecase; ไม่มีschema/seedหรือระบบบัญชีซ้ำ ไม่เลื่อนไป32 |


## แบบคิวตรวจและผลกระทบบท32 — prerequisite31ยังไม่ผ่าน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-136 | BLOCKED / ตรวจdependencyจริง | จัดREQUEST_REVIEW/REQUEST_IMPACT_CHECKS0.1 ไม่สร้างqueue/decisionจำลองก่อน31ผ่าน | source985c180 requestsREADME-only requiredmodels/servicesไม่มี; db:testexit1 Dockerไม่มี TCP5432/5546refused | O04 + C02 + C01 | P32-01–16ทุกcaseNOT RUN ไม่เลื่อนไป33 ไม่ใช้starter403แทนAPI32 |
| DEC-137 | Confirmedcurrentauthority/maker-checker / Proposaldelegationguard | คิวทุกread/count/export/action/jobใช้currentDAL สาย/พื้นที่/ขั้น/ประเภท/เวลา; delegationมีหลักฐานและไม่เกินอำนาจผู้มอบ | งาน32ข้อ1/2 เกณฑ์1; PERMISSIONS/WORKFLOW_ENGINE/OWASPprimaryอ่าน4ตุลาคม2569 | O04 + C02 + C03 | makerรวมcreator/requestversionและprincipalการมอบ ตรวจเวลาserverหลังlock/ประสานrevocation ไม่ใช้ชื่อระดับ/หลายrole/เทคนิคให้approveเอง |
| DEC-138 | Confirmedversionlock/concurrency / Proposalterminalconstraint | ต่อStepDecision/workflow11ด้วยCAS+receipt+atomicdecision/audit/outbox; ขั้นสุดท้ายDEMOหนึ่งชุดมีuniqueinstance/cycle/stepแยกopinions | เกณฑ์32-02; uniqueperreviewer11อย่างเดียวไม่กันสองapprovers; PostgreSQL18lockdocsอ่านจริง | O04 + C02 | ต้องADR/migration/nativebarriertestsก่อนใช้ ACKretryคืนreceiptภายใต้currentgrant แก้สาระสำคัญตรวจรุ่นใหม่ คำตัดสินเก่ายังอยู่ ไม่auto retryรุ่นใหม่ |
| DEC-139 | Confirmedno-silent-transfer / Proposalimpactmanifest | ตรวจ4ด้าน sourceversionครบ unknownไม่0 ยุบ/ปิดมีผู้สมัครต้องsealedplan/ผู้รับรอง recheckก่อนdecision/activation | งาน32ข้อ1/3/4; BLUEPRINTระบบ4/แบบ30และไม่มีapplicationadapter5จริง | O04 + O02 + O05 + O01 + O08 + C02 | missingadapterNOT_READY countthenCASอย่างเดียวไม่กันผู้สมัครใหม่ ต้องownerguard ไม่มีharddelete/autoย้ายคน/แก้snapshotหรือgrantจากที่อยู่ อำนาจ/แผนทางการยังTO VERIFY |


## แบบactivationและวันมีผลบท33 — prerequisite32ยังไม่ผ่าน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-140 | BLOCKED / ตรวจจริง | จัดREQUEST_EFFECTIVE_RULES0.1 ไม่สร้างactivation/worker/projectionจำลองก่อน32ผ่าน | sourceb69dcfb coreไม่มีdecision/effect/outbox/typedtarget; db:testและworker:checkexit1 TCPrefused | O04 + C02 + C01 | P33-01–16NOT RUN helper7PASSไม่ใช่สองเกณฑ์runtime ไม่มีmigration/seed/productionเปลี่ยน ไม่เลื่อนไป34 |
| DEC-141 | Confirmedday/approval/effect / Proposallatepolicy | แยกrequestedday/effective_at/recorded-at/activated-at/delivered-at ใช้วันไทยตามconfigและclockserverหลังlock | งาน33ข้อ1/2 เกณฑ์2 datehelpersเดิมตรวจ7ข้อ PostgreSQL18datetimeอ่าน4ตุลาคม2569 | O04 + O02 + C02 | approved/futureplanไม่actualeffect dueแล้วguardขาดไม่apply lateactivation/retroactivepolicyTO VERIFY ไม่backdateเงียบ ๆ |
| DEC-142 | Confirmedatomic/idempotency / Proposalbusinesskeys | ต่อActivationRecord/StatusEvent/receipt/outbox11/30 ownertransactionเดียว uniqueapprovedversion-effect+CAS/currentgrant/leasefence | งาน33ข้อ1/3 เกณฑ์1; workerเดิมไม่มีconsumer PostgreSQL18SELECTlockdocsอ่านจริง | O04 + O02 + C02 | duplicate/ACKหายคืนreceiptตามgrant ไม่เปลี่ยนทะเบียน/audit/outboxซ้ำ SKIPLOCKEDเฉพาะclaim ไม่history/impact ต้องADR/migration/nativefaulttests |
| DEC-143 | Confirmedhistory/privacy / ProposalasofDTO | committedownerhistory/checkpoint/fallback แยกvalid_at/known_at/futureplan notificationไม่authority เอกสารFileVersionกลาง owner/publictrackingallowlist | งาน33ข้อ2–4 เกณฑ์2 BLUEPRINTprivacy/history/แบบ31–32 | O04 + O02 + O08 + C03 + C02 | คงที่อยู่/คำสั่งเก่า correctionอ้างต้นทาง publicpolicyขาดdeny ไม่เลขtrackingเป็นgrant ไม่autoโยกใบสมัคร/เพิ่มสิทธิ์จากที่อยู่ |


## ตรวจรับระบบ4บท34 — prerequisites30–33ยังไม่ผ่าน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-144 | BLOCKED / ตรวจจริง | จัดUAT_SYSTEM_04/MANUAL_REQUESTS/spec22cases/fixtureplan10types ไม่สร้างfakeexecutableUATก่อน30–33ผ่าน | source9a13448 requestsREADME-only model/servicesขาด db:test/workercheckexit1 rootunit17เฉพาะstarter | O04 + C02 + C01 | ทุกUAT34NOT RUN ไม่มีtests:system04/seed/migrationใหม่ ไม่เลื่อนไป35 |
| DEC-145 | Confirmedcoverage / Proposalparameterization | lifecycle6statesต่อ10type/3branchแยก happy-returned/rejected/cancelled | งาน34ข้อ1และ30C30coverage ไม่ให้approved→reject/cancelนอกengine11 | O04 + O02 + C02 | 60ช่องNOT RUNไม่ใช่60executions ทุกtypeต้องfixture/config/typedcontextและexecutionจริง |
| DEC-146 | Confirmedappendcorrection / Proposalintents | แก้/เพิกถอนด้วยnewrequestผ่านworkflowและmaker-checker อ้างต้นเรื่อง/decision/activation/status/order/reason | งาน34ข้อ3 เกณฑ์1 กฎอำนาจยังQ005/Q006/Q024 | O04 + O02 + C02 + C03 | ไม่ลบevent/แก้audit/statusตรง correctionที่reject/cancelไม่มีeffectต้นเรื่อง ไม่rewindคำสั่งใหม่ที่ถูกต้อง AMEND/REVOKEเป็นintentProposalไม่รหัสทางการ |
| DEC-147 | Confirmedno-loss / Proposalmanifestoracle | before-afternonemptyidentity/FK/version/hash/snapshot assertpreservationและapproveddeltaกับretry/fault | งาน34ข้อ2 เกณฑ์2 ไม่มีApplication/PositionAssignmentจริง | O04 + O05 + O01 + O02 + O08 + C02 | count0/absenceoftableไม่PASS unknownadapterไม่0 มีผู้สมัคร/หน้าที่ค้างต้องแผนรับรอง ไม่autoโยก/เลือกคนแทน/ลบทะเบียน |


## แบบทะเบียนสมัครเรียนและสมัครสอบบท35 — prerequisite34ยังไม่ผ่าน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-148 | BLOCKED / ตรวจจริง | จัดAPPLICATION_SCHEMA/FORM_TEMPLATE_REGISTRY/APPLICATION_STATES0.1 ไม่เพิ่มPrisma/schemaบริการก่อน34และต้นทางผ่าน | sourcefb346a0 requiredmodels/servicesไม่มี DBtestexit1 loopbackrefused | O05 + O09 + C02 + C01 | P35-01–12NOT RUN ไม่มีseed/formrenderer/migrationใหม่ ไม่เลื่อนไป36 |
| DEC-149 | Confirmedsharedidentity/history / Proposalsnapshotfields | Candidateหนึ่งต่อPersonตามlogical04 EnrollmentสมัครเรียนแยกApplicationสมัครสอบ ตรึงname-affiliation-status/type-year-form-rule-source snapshot | งาน35ข้อ1/2 เกณฑ์1; logical04CandidateuniquePersonแต่snapshot/status/stageยังต้องขยาย | O05 + O01 + O02 + C03 + C02 | ไม่Candidateต่อปี/channel ไม่autoenrollจากแถวExcel ไม่latestjoinทับปีเก่า ไม่เปลี่ยนPerson/rolesจากสมัคร |
| DEC-150 | Confirmedsharedkey/status / Proposaloffering-slot | เว็บ/Excelใช้uniqueCandidate+offering+serverregistration_slotและcrossofferingrule CAS/receipt/transition6statesร่วมworkflow11 | งาน35ข้อ5 แบบ04uniquePerson-SessionLevelยังProposal offeringstage21ยังไม่มี withdrawnmappingต้องalign | O05 + O09 + O02 + C02 | ต้องADR/typedFK/uniques/nativeconcurrencyก่อนใช้ org/center/channel/policyversionไม่dupkey ไม่มีapprove/withdrawจากclientหรือseat/resultengineใหม่ |
| DEC-151 | ConfirmedTO_VERIFY/formgate / Proposaljointregistry | Registryกลาง05/09รองรับศ.1/2/3/5/6 meaning/mapping/source scopeก่อนOFFICIAL genericDEMOแยกnamespace | งาน35ข้อ3/4 เกณฑ์2 ตัวอย่างจากข้อความผู้ใช้ไม่มีไฟล์ทางการ ศ.3ไม่ให้meaning | O05 + O09 + C03 + C02 | ทุก5codeofficialBLOCKED ต้องserverAPI/job/print/exportguardเมื่อimplement ไม่เดาaliasศ.3/ศ.5–6ระดับ ทุกP35 NOT RUN layoutcontractไม่rendererผ่าน |

## แบบบัญชีรายชื่อ คุณสมบัติ และส่งออกบท36 — prerequisite35ยังไม่ผ่าน

5ตุลาคม2569 source47632bf สถานะ Confirmedด้านล่างคือข้อกำหนดผู้ใช้ ไม่ใช่ผลsoftwareหรือกฎทางการที่รับรอง

| Ref | สถานะ | การตัดสินใจ | เหตุผล/ต้นทาง | ผู้รับรองเสนอ | ผลและข้อจำกัด |
| --- | --- | --- | --- | --- | --- |
| DEC-152 | BLOCKED / ตรวจจริง | จัดELIGIBILITY_RULES/ROSTER_WORKSPACE/APPLICATION_EXPORT0.1 ยังไม่เพิ่มruntime | 35ไม่ผ่าน models/services11รายการขาด DBtestexit1 Docker/TCPไม่พร้อม | O05 + O09 + C02 + C01 | P36-01–14NOT RUN; helperวันไทย3PASSไม่รับรองเกณฑ์36 ไม่เลื่อนไป37 |
| DEC-153 | Confirmedcurrentrules/identity / Proposalrulecontract | กฎมีรุ่นและsource/context/window/evidence pins ตรวจsubmit/approveใหม่ ไม่บังคับบัตรไทยทุกคน | งาน36ข้อ2/3 เกณฑ์1; logical04EligibilityRuleVersionต้องalignoffering21/35; Q004/Q006/Q025 | O05 + O01 + C03 + C02 | unknownNOT_READY DEMOแยกOFFICIAL ไม่เดาประโยค/คะแนน/เลื่อนชั้น Scanไม่รับรองเนื้อหาเอง |
| DEC-154 | Confirmedsharedroster/privacy / ProposalUI-services | PG-25 ใช้บัญชีสมัคร05และserviceเดียวกับ09 scopeก่อนlist/count/duplicate/export CASแก้draft/returned | งาน36ข้อ1 เกณฑ์2; SITEMAP/35 currentDALและmaker-checker | O05 + O09 + C03 + C02 | ไม่มีPerson/Candidate/loginใหม่ ชื่อคล้ายไม่merge snapshotsไม่ตามlatest UI/keyboardยังNOT RUN |
| DEC-155 | Confirmedregistry/snapshot / Proposalexportmanifest | PDF/Excelใช้manifest/pinsเดียว currentACLquery-worker-download typedstrings A4ตามแบบที่รับรอง | งาน36ข้อ4 เกณฑ์2; MASTERHTMLprint/ExcelJS และ35registry | O05 + O09 + C02 + C03 | ทุกศ.1/2/3/5/6TO VERIFY; ไม่มีPDFExcelartifact/adapter ExcelJSยังไม่ติดตั้ง ไม่อ้างrevoke signedlinkทันที |

## แบบอนุมัติผู้สมัครและออกที่นั่งบท37 — prerequisite36ยังไม่ผ่าน

5ตุลาคม2569 sourcedb51163 Confirmedคือข้อกำหนดผู้ใช้ ไม่ใช่กฎทางการ/บริการหรือผลทดสอบที่รับรอง

| Ref | สถานะ | การตัดสินใจ | เหตุผล/ต้นทาง | ผู้รับรองเสนอ | ข้อจำกัด |
| --- | --- | --- | --- | --- | --- |
| DEC-156 | BLOCKED / ตรวจจริง | จัดSEAT_ALLOCATION/APPLICANT_REVIEW_IMPACT/EXAM_ADMISSION_OUTPUTS0.1 ไม่มีruntime | 36ไม่ผ่าน requiredmodels14ขาด db:testexit1 Docker/TCPไม่พร้อม | O05 + O02 + C02 + C01 | P37ทุกcaseNOT RUN ไม่มีเลข/บัตร/impactจริง ไม่เลื่อนไป38 |
| DEC-157 | Confirmedtransaction/currentauthority / Proposalprotocol | DEMOcompoundapproveAndAllocateร่วมworkflow/eligibility/impact/capacity/receipt/audit/outbox ใช้sharedguard/locksทุกwriter | งาน37ข้อ1/2 เกณฑ์1; 21/35/36; officialPG18locking/retry | O05 + O02 + O09 + C02 | ไม่MAX+1/countthenwrite keyใหม่ไม่duplicate reservationnetdelta wholetransactionretryไม่23505blindretry ไม่มีnativePASS |
| DEC-158 | Confirmedscopedseatkey / Proposalnamespace-revisions | stablecanonicalnamespaceตามรอบจริง+dimensionรับรอง durableclaim/revision/history | งาน37ข้อ3/4; แบบ04key/FKเดิมต้องADR/typedamendmentbinding | O05 + O02 + C02 | ไม่globalunique/channel-ruleversionหนีkey ไม่rewriteoriginalsnapshot/dropFK ไม่reuseเลขDEMO policyจริงTO VERIFY |
| DEC-159 | Confirmedimpact/amendment/privacy / Proposalservicesoutputs | statusperson-center/valid_at-known_at/adapterepochsก่อนapprove amendmentguardทั้งปลาย outputpins/currentvalidity | งาน37ข้อ4 เกณฑ์2; 17/32/36contracts | O05 + O01 + O02 + O04 + C03 + C02 | unknownNOT_READY ไม่autoถอนทุกสถานะ/ย้ายคน/deletehistory ผู้ใช้เห็นเลขเดิมใหม่ บัตรแม่แบบTO VERIFY ยังไม่มีPDF/services |

## แบบนำเข้าคะแนนและรับรองผลบท38 — prerequisite37ยังไม่ผ่าน

5ตุลาคม2569 source4e91fad Confirmedคือข้อกำหนดผู้ใช้ ไม่ใช่กฎทางการ/บริการหรือผลทดสอบที่รับรอง

| Ref | สถานะ | การตัดสินใจ | เหตุผล/ต้นทาง | ผู้รับรองเสนอ | ข้อจำกัด |
| --- | --- | --- | --- | --- | --- |
| DEC-160 | BLOCKED / ตรวจจริง | จัดGRADING_RULES/SCORE_IMPORT_REVIEW/RESULT_CERTIFICATION0.1 ไม่มีruntime | 37ไม่ผ่าน requiredmodels16ขาด db:testexit1 Docker/TCPไม่พร้อม | O05 + O02 + O09 + C02 + C01 | P38ทุกcaseNOT RUN ไม่มีscorefile/accepted/certified/UIจริง ไม่เลื่อนไป39 |
| DEC-161 | Confirmed4layers/pinnedrules / Proposaldelta04 | raw/accepted/calculated/certifiedแยก SubjectScore/ResultDraft/GradingRuleVersion+ScoreLinksกับExamSubject/SessionSubject typedbindings | งาน38ข้อ1 เกณฑ์2; logical04 numeric(10,4)ไม่เกณฑ์ทางการ ต้องalignoffering/seat37 | O05 + O02 + C02 | source/algorithm/range/rounding version TO VERIFY ไม่100/defaultpass/latestjoin Exactdecimalก่อนcast ไม่rewriteเดิม |
| DEC-162 | Confirmedstaging/evidence/boundary / Proposalpipeline | expectedroster-context-coverage/missing-extra-duplicate/subject-range/officialwritten grading ใช้service05 | งาน38ข้อ2/3 เกณฑ์1/2; learning28ไม่มีwritecapabilityofficial | O05 + O09 + O03 + O02 + C02 | ไม่zeroเติมmissing/AIหรือปรนัยแทนข้อเขียน/source_kindเป็นgrant ไม่upsertacceptedหรือimporterregistryใหม่ |
| DEC-163 | Confirmedsecondchecker/amendment / Proposalcertificationprotocol | humanคนละmaker reviewตรงrevision/checksumก่อนlock pins+receipt/audit/outbox atomic แก้หลังล็อกผ่านamendment | งาน38ข้อ4; currentDAL/CAS/workflowกลาง | O05 + C02 + C03 + O04 | checksumไม่sum/hashไม่พิสูจน์คะแนนจริง ทุกresultrevision/sourcehistoryคงไว้ lockedไม่certified/publishedเอง ไม่มีnativeproof |

## การตัดสินใจบท39 — เผยแพร่และสืบค้นผลสอบ

| ID | สถานะ | การตัดสินใจ | เหตุผล/หลักฐาน | ผู้รับผิดชอบเสนอ | เงื่อนไข/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- |
| DEC-164 | BLOCKED / ตรวจจริง | สัญญา39สามฉบับ0.1และregistry0.2 ไม่มีruntime | prerequisite38ยังBLOCKED; sourcecffcf98ไม่มีResultRelease/Publication/DALจริง db:testexit1 Docker/TCPทดลองไม่พร้อม | O05 + C02 + C01 | เกณฑ์39/P39ทุกกรณีNOT RUN ไม่เลื่อนไป40 |
| DEC-165 | Confirmed separation/snapshot/maker checker / Proposal schema delta | ต่อresult_release/item/publication/policylogical04; certifiedpassmanifest/sourcepins/approvedrevision/head-CAS/separatepublishinggrant | งาน39ข้อ1/5และเกณฑ์2; ผลรับรองไม่เท่ากับอำนาจเปิดเผย ไม่สร้างPerson/Candidate/loginอีกชุด | O05 + C02 + C03 | serieskey/authority/outcome/childpolicy TO VERIFY ไม่มีmigration/DBconstraintsจริง |
| DEC-166 | Confirmed field policy/boundedsearch / Proposal guards | allowlistทั้งDTO/filter/facet/export; privateDAL/ownlink; sharedratebudget; no-store/livevisibilityepochgate + outboxinvalidation | งาน39ข้อ2/4/5และเกณฑ์1; localNext16.3.8docs profilemaxเป็นstale-while-revalidate | C02 + C03 + O05 | cachedpurgeไม่แทนauthorization; bytesส่งแล้วเรียกคืนไม่ได้ ratepolicy Q014 ยังไม่รับรอง ไม่claimantiscrapeสมบูรณ์ |
| DEC-167 | Confirmed approvedcorrection/official evidence / TO VERIFY | releaseใหม่อ้างoldและapprovedamendmentไม่แก้audit/snapshotเดิม; เพิ่มศ.4/8F39ในregistryเดียวแบบTO VERIFY | งาน39ข้อ3/5 ไม่มีไฟล์ทางการหรือapprovedpublicationpolicy | O05 + O09 + C03 + C02 | ไม่เดาmeaning/type/layout ไม่officialissuance; supersededpublicปิดเว้นpolicyรับรอง ข้อมูลเด็กunknowndeny |

## การตัดสินใจบท40 — ตรวจรับระบบ5

| ID | สถานะ | การตัดสินใจ | เหตุผล/หลักฐาน | ผู้รับผิดชอบเสนอ | เงื่อนไข/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- |
| DEC-168 | BLOCKED / ตรวจจริง | เพิ่มUAT/manual/testspec/fixtureplan0.1 ไม่runtime/executabletests | 35–39BLOCKED/services/E2Erunnerไม่มี; db:testexit1/DockerและTCPทดลองไม่พร้อม | O05 + C02 + C01 | rootunit17/type/lint/build/starterHTTP27ผ่านไม่ใช่E2Eระบบ5 26cases/48runsNOT RUN ไม่เริ่ม41 |
| DEC-169 | Confirmedcoverage/sharedidentity / Proposalfixtures | นักธรรม3+ธรรมศึกษา9 × 2ปี × 2เงื่อนไขตัวตน ใช้24person/candidaterefsใน48runs | งาน40ข้อ1/2 Person/Candidateเดียวข้ามปี สมัครเรียนกับสมัครสอบแยก | O05 + O09 + C02 | PLAN ONLY ไม่seed/verify ไม่เลขบัตรจริง/เลขสมจริง safeidentityadapter/codebindings/statusคุณสมบัติยังTO VERIFY |
| DEC-170 | Confirmedlineage/gates/history / Proposalnativecases | 26casesตรวจFK/pins/batch/rule/checker/publisher/receipts/old-new amendment; capacity2กับ3approval/concurrentretry/withdrawlivegate/currentDAL | งาน40ข้อ3และเกณฑ์1/2 ต้องPostgreSQLจริง ไม่mockหรือWASMแทนconcurrency | O05 + C02 + C03 | source/rule/template/authority/policyขาดOFFICIALdeny ความครบจากdocไม่ได้ยืนยันenforcement |
| DEC-171 | ConfirmedUATevidence/expertseparation / TO VERIFY | registry7codesยังTO VERIFY; UATprotocolต้องเจ้าหน้าที่/ผู้เชี่ยวชาญจริง ไม่รับรองจากsoftwaretests | metadataPDFชื่อที่เคยแนบพบแต่contentHTTP502สองครั้ง ไม่มีlayout/hash/edition/mapping/signoffที่ตรวจได้ | O05 + O09 + C03 + C01 | ไม่เดาศ.3/ศ.4/ศ.8จากชื่อ ไม่copyprivatefileเข้าrepo/ไม่fakeverified ไม่อ้างUATหรือเกณฑ์สอบผ่าน |

## การตัดสินใจบท41 — โครงสร้างงบประมาณ

| ID | สถานะ | การตัดสินใจ | เหตุผล/หลักฐาน | ผู้รับผิดชอบเสนอ | เงื่อนไข/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- |
| DEC-172 | BLOCKED / ตรวจจริง | เพิ่ม3schema/policy/dictionarycontractsและDEMOdata0.1 ไม่มีruntime/DDL | 40และส่วนกลางไม่ผ่าน db:testexit1/Docker/TCPไม่พร้อม; FiscalYearกลางมีแต่budget7modelsไม่มี | O06 + C02 + C01 | reference30/PGliteNUMERIC7ผ่านเฉพาะสภาพชั่วคราว P41ทุก18casesและnativeappNOT RUN ไม่ไป42 |
| DEC-173 | Confirmedsharedyears/org / Proposaldelta04 | ใช้FiscalYearCE/date/PolicyVersioncore แยกProjectAcademicYearmanylinksและBudgetPlanต่อFY/BudgetLineหลายปี ใช้UUID/snake/compositeFK | งาน41ข้อ1/2 เกณฑ์2 logical04ยังไม่มีPlan/CostCenter/AllocationVersion/ProjectAcademicYear ต้องreconcileactor/year/keysก่อนDDL | O06 + O05 + C02 | ไม่สร้างFY/login/orgcopy ไม่joinปีด้วยlabelไม่เดาปฏิทินจริง provenanceServiceActorไม่grant snapshot/supersessionคงhistory |
| DEC-174 | Confirmedexactcurrency / ProposalNUMERICpolicy | NUMERIC(20,2)/canonicalstrings/BigIntsatangหรือreviewedDecimalprecision ปฏิเสธscaleก่อนcast ไม่sumcurrency/versionsผสม | งาน41ข้อ4 เกณฑ์1 PostgreSQL18officialdocsและWASMprobeเห็นscale-round; generatedPrisma7.10.0Decimalมีจริง | O06 + C02 | DEMOTHB2/HALF_EVENยังTO VERIFY เป็นข้อเสนอไม่วงเงิน/roundingจริง maxชนิดไม่authority moneyparser/DAL/adapterยังไม่มี |
| DEC-175 | Confirmedpolicy/history/authority / TO VERIFY | versionedfunding/category/currency/calendar/evidence/authority/officialgate makerchecker/currentreadmutateexportjob denyunknown | งาน41ข้อ3 กติกากลาง Q005/Q006/Q010/Q017/Q019/Q025 ยังไม่มีเจ้าของรับรอง | O06 + C03 + C02 + C01 | ไม่อ้างNBMS/bank/accountingintegration ไม่ทำledger/reserve/paymentservicesล่วงหน้า approvedversionใหม่+reason/evidence ไม่overwriteต้นเรื่อง |

## การตัดสินใจบท42 — สัญญาแผนและจัดสรรที่ยังติด prerequisite

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-176 | Confirmed blocker / Proposal contract | บท42จัดเฉพาะplanning/ledger/approval contractsและfixtureplan ไม่สร้างUI/API/DBหลอกว่าผ่าน | 41BLOCKED; db:testexit1 Dockerไม่มี TCPทดลองrefused และPrismaไม่มีbudgetmodels | O06 + C02 | ทั้งสองเกณฑ์BLOCKED P42-01–18NOT RUN ไม่เริ่ม43 |
| DEC-177 | Proposal | รายได้คาดการณ์แยกจากรายจ่ายที่เสนอและallocatedavailable; submitted/approvedplanไม่โพสต์เงินเอง | งาน42ข้อ1 เกณฑ์42-01 BLUEPRINTสูตรเงิน และสัญญา41 | O06 + C03 | เพิ่มestimateitems/reviewpinsผ่านADRเมื่อพร้อม ไม่ถือรายได้คาดการณ์เป็นเงินรับรอง |
| DEC-178 | Proposal transaction/constraints | append delta ledgerคู่กับversion targets; atomic transferสองlegs lockทุกlineตามorder; projectionCHECKและcross-row DBguard restricted writer/RLS | งาน42ข้อ2–3 เกณฑ์42-02 เอกสารPostgreSQL18locking/constraints; ไม่มีnativeproof | O06 + C02 + C03 | ไม่มีoverwritepostedhistory; unknownusage/overdraw/contextearlydeny; nativeconcurrency/directSQLtestsก่อนเปิด |
| DEC-179 | Confirmed maker checker / Proposal approvals | sealpayload/hash/revision useworkflow11; source restrictions/currentdelegation/currentACLทั้งสองฝั่ง; correction/reversalใหม่ audit/outboxatomic | งาน42ข้อ3–4 กติกากลาง Q005/Q006/Q010/Q019ยังTO VERIFY | O06 + C03 + C02 + C01 | technicaladminไม่businessgrant unknownofficialdeny futureallocationยังไม่พร้อมใช้ รายงานhistoryคงหลักฐาน |

## การตัดสินใจบท43 — สูตรจอง ผูกพันและหลักฐานจ่าย

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-180 | Confirmed blocker / Proposal contracts | ทำformula/servicecontractsและfixtureplan43 ไม่สร้างruntimebudgetservicesหรือmockgrant | 42BLOCKED coreไม่มีbudgetmodels db:testexit1 Dockerไม่มี TCPทดลองrefused | O06 + C02 | ทั้งสองเกณฑ์BLOCKED P43-01–16NOT RUN ไม่เริ่ม44 |
| DEC-181 | Confirmed formula / Proposal eventmodel | available=A-R-U-P; COMMITย้ายR→UและPAYMENTย้ายU→P atomic; certifiedCsubsetUไม่หักซ้ำ | งาน43ข้อ1–2 BLUEPRINTตัวอย่าง100000/20000/5000; reference82assertionsไม่เป็นnativeproof | O06 + C03 | exactstrings/NUMERIC20,2 per-source/voucherremaining ไม่ใช้ยอดเรื่องอื่นค้ำ; requestไม่เป็นpostedmoney |
| DEC-182 | Proposal transaction/DBguards | rowlockทุกwriterตามglobalorderหรือSERIALIZABLE/full boundedretry samekey/hash พร้อมcurrentACL; constraints/RPC/RLS/unique receipts/businesskey | งาน43ข้อ3 เกณฑ์43-02 PostgreSQL18isolation/locking ยังไม่มีSQL/APIimplementation | O06 + C02 + C03 | ต้องnativebarrierหลายconnection/rollback/directwriter/revokeproof; maxattempts3DEMOไม่officialstandard |
| DEC-183 | Confirmed no bank transfer / Proposal recovery | paymentrecordเป็นหลักฐานในเว็บ postedhistoryimmutable reversalอ้างต้นทางพร้อมapproval/evidence/dependencycheck | งาน43ข้อ4 กติกากลาง Q006/Q010/Q019ยังTO VERIFY | O06 + C03 + C01 | ไม่โอนเงินจริง ไม่inverseอัตโนมัติเมื่อมีdownstream ไม่refund/reopenvoucherสิทธิ์โดยไม่มีคำอนุมัติ |

## การตัดสินใจบท44 — คำขอเบิก อำนาจและกลับรายการ

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-184 | Confirmed blocker / Proposal contracts | 44ทำworkflow/UI/reversal contractsและfixtureplan ไม่มีdisbursement UI/approval runtime | 43BLOCKED db:testexit1 Dockerไม่มี TCPrefused coreไม่มีbudgetmodels/authenticatedDAL/files/workflow | O06 + C02 | ทั้งสองเกณฑ์BLOCKED P44-01–14NOT RUN ไม่เริ่ม45 |
| DEC-185 | Confirmed separation / Proposal authority config | ผู้สร้าง/ผู้แก้สาระสำคัญ ผู้ตรวจ ผู้อนุมัติแยกคนกันใน44 currentauthority/delegation/time/amountbasisและcumulativelimits | งาน44ข้อ2/เกณฑ์44-02 ไม่ให้ชื่อฝ่ายหรือtechadminเพิ่มgrant Q005/Q006/Q019TO VERIFY | O06 + C03 + C01 | officialunknown deny; DEMOวงเงิน5000/3000เป็นreferenceไม่ระเบียบ/บัญชี/สิทธิ์จริง ไม่splitงวดหลบวงเงิน |
| DEC-186 | Proposal invoice/claims/transaction | verifiedissuer/reference identitynonnulluniqueตามkeypolicy claims/paidnet/per-obligation capacityและownvoucherguard lock/receipt/event/businessreferenceatomic | งาน44ข้อ1/3/เกณฑ์44-01 ข้อจำกัดNULLunique/cross-rowCHECK PostgreSQL18 และreference45assertions | O06 + C02 + C03 | คืนผลsamekeyhashต่อเมื่อcurrentreadได้ differentkeysamepaymentธุรกิจdeny ไม่มีnativeconcurrencyproof |
| DEC-187 | Confirmed history / Proposal refunds/correction | ยกเลิกclaim/certification/paymentcorrection/actualrefundแยกเหตุผลและผลกระทบ; approvednewreversal original/evidence/privatecorrespondencelinksคงเดิม | งาน44ข้อ4 Q010/period/refund/voucherreopen/partialreversalยังTO VERIFY | O06 + C03 + C01 | ไม่restoreU/C/สิทธิ์จากคำว่าคืนเงินเอง ไม่มีbank/refundtransfer/directexpensehandlerจริง |

## การตัดสินใจบท45 — รายงาน กระทบยอดและปิดงวด

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-188 | Confirmed blocker / Proposal contracts | 45ทำreconciliation/report/export/periodclose contractsและfixtureplan ไม่มีruntime/UI/migrationใหม่ | 44BLOCKED core19modelsไม่มีbudget reports/ledger/nativeDB Dockerไม่มี TCPrefused db:testและdirectentrypointexit1 | O06 + C02 | ทั้งสองเกณฑ์BLOCKED P45-01–16NOT RUN ไม่เริ่ม46 |
| DEC-189 | Proposal report version/snapshot | ledger source replay R/U/P/C/V; committedmanifest/perlinewatermarks/consistentread/namepolicyversions และรายงานsealedต่างrestated | งาน45ข้อ1–2 เกณฑ์45-01/02 PG18isolation/sequence; reference55assertionsไม่nativeproof | O06 + C02 + C03 | ไม่นับCซ้ำ ไม่joinFY/AYจากlabel ไม่sumone-to-manyซ้ำ Currentrenameไม่ทับreportเก่า missing/lag/mismatchไม่รับรอง |
| DEC-190 | Confirmed scope/links / Proposal export | screen/ExcelJS/privateHTMLprintPDFใช้reportmanifest/filter/versionเดียว; currentread/export/job/downloadACLและfieldpurpose; procurement/letterlinksread-only | งาน45ข้อ3–4 MASTERprintPDF/บริการกลาง ไม่มีadapters/ไฟล์exportจริง | O06 + C02 + C04 | ไม่publicfinanceassets/cache ไม่มีbusinesspostingจากเปิดreport งบทดลองระบบเป็นbucketrollforwardไม่officialdoubleentry/NBMS |
| DEC-191 | Proposal close/reopen/adjustment / TO VERIFY policy | ทุกwriterใช้periodgate/globalorder/receipt/currentauthority; closemanifestsealed/versioned/reconcile; reopen/adjustmentapprovedใหม่คงevent/reportเดิม | งาน45ข้อ3 Q006/Q010/Q017/Q019/retention/ค้าง/carrypolicyยังไม่verified | O06 + C03 + C01 | closeddenyรวมbackdate/reversal/import/worker ไม่carryหรือzeroค้างเอง nativeclose-vs-posting/revokeproofก่อนเปิด |

## การตัดสินใจบท46 — ตรวจรับงบประมาณ

Confirmed ในตารางคือข้อกำหนดหรือสภาพ repository ที่ตรวจพบ ไม่ใช่การรับรองกฎการเงินหรือผล native tests

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-192 | Confirmed blocker / Proposal acceptance plan | จัด UAT_SYSTEM_06/MANUAL_BUDGET/test specification/fixture0.1 ไม่สร้าง runtime หรือ mock grant ทดแทน41–45 | source eed9af6; core19models ไม่มี budget services; db:test exit1 nativePG/Docker CLI/socket/TCPไม่พร้อม | O06 + C02 + C01 | P46-01–28ทั้งหมดNOT RUN ไม่มี executable finance tests/signoff ไม่เริ่ม47 |
| DEC-193 | Confirmed exact/lineage / Proposal oracle | ทุกยอดย้อน manifest→event→ต้นเรื่อง→decision→evidence/receipt; V=A-R-U-P CsubsetU; paired transfer/correctionคงประวัติ | งาน46ข้อ1/3 เกณฑ์46-01 สัญญา41–45 และ fixtureสมมติ21events | O06 + C02 + C03 | reference integer-satang ไม่แทน native NUMERIC/rowlocks/constraints หรือรับรองrefundstrategy |
| DEC-194 | Confirmed native QA / Proposal failure protocol | nativeหลายconnection+barrier, closedgateทุกwriter, samekey/hash/businesskey, failpointsทั้งtxn/outbox/ACKและcurrentgrant | งาน46ข้อ1–3 ต้อง ledger/ต้นเรื่อง/projection/receipt/audit/outbox atomicและretry-safe | O06 + C02 | db:testเดิมcore06ไม่runnerbudget ต้อง ADR/harness/migrationsจริง ไม่อ้าง externally exactly-once เมื่อsinkไม่มีidempotency |
| DEC-195 | Confirmed separate policy acceptance / TO VERIFY | financialownerตรวจsource/authority/period/refund/carry/formsแยก softwareQA; ไม่มีbank/NBMS/e-GP integrationหรือUATapproval | งาน46ข้อ4 เกณฑ์46-02 Q005/Q006/Q010/Q017/Q019ยังเปิด | O06 + C03 + C01 | ยังไม่มีผู้ตรวจหรือลงนามจริง officialunknowndeny; testผ่านไม่รับรองระเบียบ ไม่contactคนอื่นหรือเดาAPI/ผู้มีอำนาจ |

## การตัดสินใจบท47 — วัสดุ ครุภัณฑ์และที่เก็บ

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-196 | Confirmed blocker / Proposal contracts | ทำ ASSET_CLASSIFICATION/INVENTORY_SCHEMA/ASSET_REGISTER_WORKSPACE/fixture0.1 ไม่เพิ่มruntime/schema/migrations | source5db4f45 บท46BLOCKED db:testexit1 ไม่มีnativePG/Docker/assetmodels/AuthDAL/files | O07 + O06 + C02 | P47-01–16NOT RUN ทั้งสองเกณฑ์BLOCKED ไม่มีหน้าจอ/QR/barcodeจริง ไม่เริ่ม48 |
| DEC-197 | Confirmed shared registry / Proposal model delta | ItemCatalog→item AssetRegister→asset Warehouse/UnitOfMeasureเดิม; เพิ่มStockLocation/AssetCategory/unitและregisterversion contractsผ่านADR | งาน47ข้อ1–2 logical04มี18inventorytablesแล้ว ไม่สร้างทะเบียนซ้ำ | O07 + C02 + C03 | UUID/assetcodeglobaluniqueรวมinactive/sourceordinal/custody/owner/locationhistory/currentprojection ไม่autoRoleAssignment/payment/stock; category/costthresholdยังTO VERIFY |
| DEC-198 | Confirmed exact quantities / Proposal conversion | NUMERIC20,6/scale0–6ตาม04 rationalpositivebounded ratioมีitem/package/unitversion/date/evidence; moneyexactตาม41 unknown!=0 | งาน47ข้อ3 เกณฑ์47-01 Q010/Q024 ยังProposal; history pins/versionedmeaningสำคัญ | O07 + O06 + C02 | ไม่sumต่างunit/dimensionหรือlatestconversionทับsnapshot ไม่มีroundingruledeny; quantitydescriptorไม่stockที่โพสต์แล้ว |
| DEC-199 | Confirmed QR no secrets / Proposal route policy | QRcanonical same-origin resourceUUID pointer ไม่grantสิทธิ์; servercurrentAuth/DAL/scope/fields/filesทุกread/print/export/job/download | งาน47ข้อ4 เกณฑ์47-02 ใช้07/08/09/10กลาง | O07 + C02 + C03 | ไม่ใส่คน/ราคา/token/objectkeyในภาพ ไม่publicassetdetails/cache ไม่openredirect; URIvalidationไม่authPASS ยังไม่มีgenerator/decoder |

## การตัดสินใจบท48 — ขอซื้อขอจ้าง คำสั่งซื้อและงบ

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-200 | Confirmed blocker / Proposal contracts | 48ทำ PROCUREMENT_BUDGET_FLOW/PROCUREMENT_ORDERS/fixture0.1 ไม่มีruntime/migration/order/reservationจริง | sourcec6697cb prerequisite47/43BLOCKED core19modelsไม่มีbudget/procurement/currentDAL db:testexit1 nativeDBไม่พร้อม | O07 + O06 + C02 | P48-01–18NOT RUN เกณฑ์ทั้งสองBLOCKED ไม่เริ่ม49 |
| DEC-201 | Proposal atomic service integration | approveAndReserve/issueOrderAndCommit ใช้txกลางเดียวและservice43 period/globallocks/receipt/businesskey/rootrevisionbinding/remaining | งาน48ข้อ2 เกณฑ์1/2 PostgreSQLเดียวตามBLUEPRINT ไม่commitHTTP/nestedแยก ไม่markapprovedก่อนreserveconfirmed | O07 + O06 + C02 | R→Uไม่doublecount outboxเพื่อแจ้งผล ถ้าเลือกasyncต้องADR/gate/compensationใหม่; revisionใหม่amendmentไม่fullreserveซ้ำ |
| DEC-202 | Proposal model/privacy/exact delta | Order→purchase_orderเดิม requestline ITEM/SERVICE typedXORและspecification; Supplierขั้นต่ำ/version/scope/sourceevidence; qty-unit-money-policy pins | งาน48ข้อ1/3 logical04itemnonnullต้องADR Supplierยังไม่มี ตาราง04ใช้ซ้ำ | O07 + O06 + C03 | ไม่ใช้fakeitem/loginใหม่ ไม่มีPII/bankaccountจริงในDEMO ภาษี/fees/method/วงเงินTO VERIFY officialunknowndeny |
| DEC-203 | Confirmed history / Proposal cancellation guards | releaseเฉพาะRunused/Ucancelableหลังคำอนุมัติ คงacceptedliability/C/claims/P/history; document/correspondencelinksกลางcurrentACL | งาน48ข้อ3/4 เกณฑ์2; 43/44/45/47; รับบางส่วนไม่จ่ายหรือpoststockเอง | O07 + O06 + C03 + C02 | ไม่genericinverse/คืนP/เปิดสิทธิ์เอง งวดปิดต้องreopen/adjust ไม่อ้างworkflowทดลองแทนe-GP ไม่มีAPI/signoffทางการ |


## การตัดสินใจบท49 — รับ ตรวจ เบิกและโอนวัสดุ

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-204 | Confirmed blocker / Proposal contracts | ทำ STOCK_LEDGER/GOODS_RECEIPT_INSPECTION/STOCK_MOVEMENT_WORKSPACE/fixture0.1 ไม่มีruntime/migration/stockโพสต์จริง | source2a5b70f บท48/43/ส่วนกลางBLOCKED core19models db:testexit1 nativePG/Dockerไม่พร้อม | O07 + O06 + C02 | P49-01–20NOT RUN ทั้งสองเกณฑ์BLOCKED ไม่เริ่ม50 |
| DEC-205 | Proposal ledger and atomic movement | posted StockMovementเป็นแหล่งจริง StockBalanceเป็นprojection/lockpoint canonicalwarehouse/location/item/unitversion/nullablelotidentity ต้องuniquenullsafe; transferสองlegs confirmedhandover net0 | งาน49ข้อ1/3 ห้ามclientbalance/sourceoverissue; selectingmissingrowไม่ล็อกidentity ต้องcreate-safeและglobalorderedlocksทุกwriter | O07 + C02 | exactquantity/sourceprovenance/currenttwo-scopes/remaining/nativeconstraints; transitต้องADRแยกก่อนใช้ ไม่มีstockregistryซ้ำ |
| DEC-206 | Proposal acceptance/financial separation | approvedInspection+CLEANหลักฐานก่อนstockIN; netaccepted=grossaccepted-approvedreturnที่นโยบายคืนcapacity; rejectedreturnไม่stockOUT | งาน49ข้อ2/4 รับreplacementอาจทำphysicalreceivedเกินordered จึงไม่ใช้grossphysicalเป็นcompletion; makercheckerและapprovedversion | O07 + O06 + C03 | รับบางส่วนไม่closeOrder/obligation/payment ไม่มีfinancialpostจากรับของ AcceptedLiabilityRefใช้ระบบ6กลาง; policyคืน/ล่วงหน้าTO VERIFY |
| DEC-207 | Proposal native safety and immutable history | sharedtxsource/stock/projection/order/liabilityref/receipt/audit/outbox; currentAuth/DAL/grants/period/sourceorderedlocks/CAS/businesskey/hashทุกAPI/worker | เกณฑ์49-01/02 พร้อม43/44/45/48 cancel/paymentต้องlockprotocolเดียว; failpointsก่อนcommitและหลังcommit/ACKต้องnativeproof | O07 + O06 + C02 | no genericinverse/negativebalance/duplicateoperation; rebuildprojectionไม่แก้ledgerเงียบ history/effective-recordedคงเดิม reference8stepsไม่concurrencyPASS |


## การตัดสินใจบท50 — ยืม คืน ซ่อมและผู้รับผิดชอบครุภัณฑ์

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-208 | Confirmed blocker / Proposal contracts | ทำ ASSET_LIFECYCLE/ASSET_CUSTODY_HISTORY/ASSET_LIFECYCLE_WORKSPACE/fixture0.1 ไม่มี services/UI/migrationจริง | source3441054 prerequisite49BLOCKED db:testexit1 ไม่มีnativePG/Docker core19modelsไม่asset/loan/return/maintenance/currentDAL | O07 + O06 + C02 | P50-01–18NOT RUN ทั้งสองเกณฑ์BLOCKED ไม่เริ่ม51 |
| DEC-209 | Proposal exclusive asset claim | approvedLoanกันชิ้นก่อนhandover; Loan claim statesใช้uniqueasset และทุกloan/maintenance/return/custody writer lockassetเดียวกัน | งาน50ข้อ2/3 เกณฑ์1 logical04 loan returned_at/is_active ไม่รู้reservation/returnpending; cross-tableCHECKไม่พิสูจน์invariant | O07 + C02 | maintenance/repairhold/disposed/inactive/unknown/returnpending/damaged/openblockingclaim deny; overdueไม่autoคืน; nativeproofยังไม่มี |
| DEC-210 | Proposal separated responsibility/history | ownerOrg/primarycustodian/temporaryborrower/physicalplaceแยก; ส่งมอบสร้างช่วงใหม่/source/evidence/valid-knownhistory ไม่แก้ชื่อเก่าหรือautoRoleAssignment | งาน50ข้อ1/4 เกณฑ์2 primaryexclusionต้องasset+kindข้ามPerson; same-dayeventsใช้timestampไม่บีบวัน | O07 + O01 + C03 + C02 | personchange17สร้างimpactไม่เลือกแทน/ปิดLoanเอง; future/correctionเป็นversion/eventใหม่ รูปแบบcustodyร่วมTO VERIFY |
| DEC-211 | Proposal repair acceptance and atomic recovery | physicalreturn/inspection/serviceable/claimresolutionและrepairreleaseแยก; costsestimated/accepted/paid exactแยก งบผ่าน43/44/45/48 | งาน50ข้อ3 makerchecker/currentauthority/CLEAN/ACL/receipt/businessbinding/globalorderedlocks/transactionauditoutbox | O07 + O06 + C02 + C03 | ไม่จ่ายหรือเปิดavailableเพราะถึงวันซ่อมจบ ไม่ลบpayload/audit; beforecommitrollback/aftercommitretry/workerdevsinkdedupeต้องnativeproof; liability/authorityTO VERIFY |


## การตัดสินใจบท51 — ตรวจนับ จำหน่ายและรายงาน

| รหัส | สถานะ | การตัดสินใจ/ข้อเสนอ | หลักฐานและเหตุผล | ผู้รับผิดชอบเสนอ | ผลต่อการทำงาน |
| --- | --- | --- | --- | --- | --- |
| DEC-212 | Confirmed blocker / Proposal contracts | ทำ STOCKTAKE_DISPOSAL_POLICY/INVENTORY_REPORTS/fixture0.1 ไม่มีstocktake/disposal/reports/UI/exportsจริง | source8a70eda prerequisite50BLOCKED db:testexit1 ไม่มีnativePG/Docker core19models inventoryมีREADME packageไม่มีExcelJS | O07 + O06 + C02 | P51-01–18NOT RUN ทั้งสองเกณฑ์BLOCKED ไม่เริ่ม52 |
| DEC-213 | Proposal count window and ledger adjustment | StocktakeSession→stocktakeเดิม bucket/location/unit/lot snapshot/nullsafeunique ไม่(session,item); durablecountgate→count/review→CASหรือrecount→approvednewmovement | งาน51ข้อ1/เกณฑ์1 controlledwindowไม่ถือDBtransactionยาว allwriters49ใช้gate/orderedlocks receipt/CAS/sourcewatermark; leaseผิดต้องSTALE/recovery | O07 + C02 | variance=count-expectedจากcutoffเดียวกัน ไม่count-currentหรือoverwritebalance assetpresenceแยกไม่autodispose/register/charge; movementbridgeTO VERIFYไม่มีadapter |
| DEC-214 | Proposal disposal execution/effective/history | DisposalRequest→disposalเดิม approvalhold→executionverified→วันมีผล/source/dependenciesครบจึงAssetLifecycleEvent50; correctionคำขอใหม่ | งาน51ข้อ2/เกณฑ์2 assetlock50ร่วมloan/repair/currentauthority/CLEAN/ACL makerchecker transactionreceipt/audit/outbox | O07 + O06 + C03 + C02 | คงcode/cost/funding/source/loan/repair/custody/evidence ไม่cascade delete/reuse/autoเงิน ยืมค้าง/ซ่อม/claimขัดกันต้องแก้ที่รับรองก่อน |
| DEC-215 | Proposal report integrity / Confirmed official calculation gate | ledger/source/projection manifestเดียว screen/page/export; pinnedvalid-knownnames/place/cost/currentfieldpolicy Exceltext/HTMLprintSarabun; depreciationunknown=NULL/disabled | งาน51ข้อ3/4 45/47–50 และPostgreSQL18snapshot/sequence docs ไม่ใช้MAXglobalnextvalเป็นcommittedproof ไม่มีapprovedmethod/life/residual | O07 + O06 + C02 + C03 | ไม่มีExcel/PDFจริง ไม่placeholderNBV/acquisitioncost/0เป็นofficialamount ไม่financialpostจากreport/calc policy/ownerUATยังTO VERIFY |
## บท52 — ตรวจรับพัสดุร่วมกับงบประมาณ (8 ตุลาคม2569)

| รหัส | สถานะ | การตัดสินใจ | เหตุผล/ขอบเขต | ผู้รับผิดชอบเสนอ | ผลกระทบ |
| --- | --- | --- | --- | --- | --- |
| DEC-216 | Confirmed blocker / Proposal test specification | สร้างUAT_SYSTEM_07/MANUAL_INVENTORY/ACCEPTANCE_CASESและfixturePLAN ONLY0.1 ทั้ง30casesNOT RUN | prerequisite47–51/43–46/ส่วนกลางไม่มีruntime db:testexit1 ไม่มีnativeDB ไม่สร้างengineหรือALLOW mockทดแทน | O07 + O06 + C02 | ไม่claimE2Eหรือเกณฑ์ผ่าน ไม่มีschema/migration/dependencyใหม่ ไม่เริ่ม53 |
| DEC-217 | Proposal integrated provenance / Confirmed exact arithmetic | ชุดสมมติ27stepsแยก stockqty/asset/source/acceptedliabilityกับ A/R/U/P/C/V; รับไม่หักเงิน จ่ายไม่เพิ่มstock | งาน52ข้อ1–3 partialorder12000/accepted5000 cancellationส่วนไม่รับ7000 ใช้NUMERIC strings/exact conversion | O07 + O06 | R→U/C⊂U/U→Pไม่doublecount mainA29/B8/asset2/P5000 ความเท่าราคาacceptedกับpaidเป็นเฉพาะตัวอย่าง ไม่สูตรstock=money |
| DEC-218 | Proposal native acceptance protocol | nativeconnections/barrier/observer/lockorder/source-businessunique/currentgrant/faultreceipt-auditoutbox proofsทุกcase | งาน52ข้อ2/เกณฑ์1–2 ทั้งคลังต่างกันsameorgและหน่วยงานนอกscope allwriters/revoke/period/count/loan/disposal/reversalต้องร่วมprotocol | C02 + C03 + O07 + O06 | unit17/referencechecksไม่race/RLS/E2E ถ้าไม่มีactualmanifestคงNOT RUN ไม่ใช้PGlite/skipเป็นPASS |
| DEC-219 | Confirmed official gate / Proposal ownerUATmanual | เตรียมคู่มือคลัง/ผู้ถือครอง/การเงินกับpolicy/sourceversion/signoffที่ยังว่าง | งาน52ข้อ4 อำนาจหน่วยแปลงภาษีclaims/คืนงบ/count/disposal/retention/depreciationยังTO VERIFY | O07 + O06 + C03 | ไม่กรอกคำอนุมัติหรือชื่อเจ้าหน้าที่แทน ไม่เชื่อมe-GP/NBMS/bank ไม่ถือQAรับรองระเบียบ |

## บท53 — ทะเบียนหนังสือและเลขสารบรรณ (8 ตุลาคม2569)

| รหัส | สถานะ | การตัดสินใจ | เหตุผล/ขอบเขต | ผู้รับผิดชอบเสนอ | ผลกระทบ |
| --- | --- | --- | --- | --- | --- |
| DEC-220 | Confirmed blocker / Proposal contracts | สร้างRECORDS_REGISTER_POLICY/E_OFFICE_SCHEMA/RECORD_DOCUMENT_ACCESS/fixture53 PLAN ONLY0.1 P53-01–20NOT RUN | prerequisite52/ส่วนกลาง/DB-06ยังไม่ผ่าน core19ไม่มีสารบรรณ FileVersionหรือACL db:testexit1 | O08 + C02 + C03 | ไม่สร้างlogin/เอกสาร/counterทดลองแทนของกลาง ไม่มีPrisma/SQLmigration/runtimeหรือเลขที่ออกจริง ไม่เริ่ม54 |
| DEC-221 | Proposal transactional numbering / Confirmed no hidden reuse | counter04namespace org-type-period immutable identity rowlock/upsert/unique/CAS/operationreceipt/audit/outboxatomic; policy/formatterversionไม่reset | งาน53ข้อ3/เกณฑ์1 ปีทะเบียนไม่FY/AY rollbackuncommittedไม่เป็นVOID issuedcancelเก็บevent/หลักฐาน ไม่decrementหรือpartialuniqueหลบ | O08 + C02 | รูปแบบTESTไม่เลขราชการ unknownofficialdisabled nativefirstrow/race/retry/revoke/period/overflowยังNOT RUN BIGINTDTOstring |
| DEC-222 | Proposal schema reconciliation | Correspondence/RecordVersion/RegisterType/Number/Priority/Confidentiality/Recipient/DueDate map04/centralreferencecodes พร้อมdraft nullable numbering/number-events/typedperiod/hash/primaryattachments | งาน53ข้อ1และ04 จุดต่างจากnonnullnumber/oneprimaryfile/recipientcontext/ACL/duemodeต้องADRก่อนmigration | O08 + C02 + C03 | เลข/registeredไม่เป็นsend/ack/signature ไม่สร้างrouting/retentionschedulerล่วงหน้า snapshotอดีตและfutureแยกrecorded/effective |
| DEC-223 | Confirmed shared document boundary / Proposal intersection ACL | ใช้Document/FileVersionserveridเดิม compositebinding/hash/no copy; record-version-file-source action/currentACL intersectionทุกช่องทาง | งาน53ข้อ2/4/เกณฑ์2 priorityไม่confidentiality recipient/source linkไม่grant actualDocumentยังMETADATA_ONLY | C03 + C02 + O08 | ไม่uniongrant/roletech/oldACLเปิดความลับเพิ่ม ไม่autochangeV1→V2 ทั้ง5ระบบ scope/revoke/nativeStorage/search/export/workerยังNOT RUN |

## บท54 — ร่างหนังสือ ตรวจ และอนุมัติส่ง (8 ตุลาคม 2569)

| รหัส | สถานะ | การตัดสินใจ | เหตุผล/ขอบเขต | ผู้รับผิดชอบเสนอ | ผลกระทบ |
| --- | --- | --- | --- | --- | --- |
| DEC-224 | Confirmed blocker / Proposal contracts | เตรียม CORRESPONDENCE_FLOW/WORKSPACE/RECORD_PREVIEW_SECURITY/fixture54 0.1 โดยไม่มี runtime pages | prerequisite53/ส่วนกลางและ DB-06ไม่ผ่าน db:test exit1 core19ยังไม่มี FileVersion/ACL/สารบรรณ/shared workflow | O08 + C02 + C03 | P54-01–20 NOT RUN ไม่สร้าง engine/login/เอกสารอีกชุด ไม่มี migration และไม่เริ่ม55 |
| DEC-225 | Proposal review version protocol / Confirmed maker checker | pin candidate/version/digest/recipient/files/template; ใช้ workflow11; approve snapshot immutable; แก้สาระสำคัญหลังอนุมัติ hold active permit ใน transaction ก่อนเปิด next cycle | งาน54ข้อ3/เกณฑ์1 คำตัดสินเก่าคงหลักฐาน การแก้ returnedไม่สร้าง rootซ้ำ; ผู้สร้าง/ผู้แก้สาระ/verifiedPersonเดียวกันห้าม approve | O08 + C02 + C03 | ต้อง ADR next-cycle/CAS/unique decision/receipt/hold/audit-outbox/current ACL/CLEAN และ native races ก่อน implementation ไม่มี dispatch/signature จริง |
| DEC-226 | Proposal content boundary / Confirmed unverified official gate | DEMO closed AST/escaped text/rawHTMLไม่รองรับ; unknown nodes/attrs/URLs reject; template/font/layout/content versions ตรึง; HTML printตาม MASTER | งาน54ข้อ2และเกณฑ์2 ไม่มี sanitizer/editor/PDF adapter/browserproof; preview hash ไม่ใช่ PDF bytehash | C02 + C03 + O08 | สร้างรุ่นตรวจใหม่เมื่อ rendererเปลี่ยนสาระ; client PDF ไม่รับอนุมัติเดิมอัตโนมัติ; watermark TEST, official template/signing disabled จนมีหลักฐาน |
| DEC-227 | Confirmed explicit recipient identity / Proposal context binding | pickerใช้ Person/Organizationกลาง เลือก person ID + organization/context แสดงรหัส/สังกัดก่อนส่ง ไม่ใช้ชื่อเพียงอย่างเดียว; signerไม่เท่ากับ approver | งาน54ข้อ1/4 มีชื่อสมมติเดียวกันสองคนและ Personเดียวหลายบริบท; link/recipientไม่ grant และไม่เปิด private fields | O08 + C02 + C03 | server re-resolve current authority/scope/ACL ไม่มี auto account/contact replacement/message/permission; เจ้าของงานและ signing policy ยัง TO VERIFY |

## บท55 — ส่งหนังสือ รับทราบ และมอบหมายงาน (8 ตุลาคม 2569)

| รหัส | สถานะ | การตัดสินใจ | เหตุผล/ขอบเขต | ผู้รับผิดชอบเสนอ | ผลกระทบ |
| --- | --- | --- | --- | --- | --- |
| DEC-228 | Confirmed blocker / Proposal contracts | DOCUMENT_DELIVERY/DELIVERY_ROUTING_CONTRACT/DELIVERY_WORKSPACE/fixture55 0.1 เป็นPLAN_ONLY ไม่มีruntime inbox/routing/receipt | prerequisite54และ07/08/10/11/DBไม่ผ่าน db:test exit1 core19ยังไม่มีธุรกิจส่งหนังสือ | O08 + C02 + C03 | P55-01–20/55-01/02 NOT RUN ไม่สร้าง login/file/workflow/outbox อีกชุด ไม่มีmigrationและไม่เริ่ม56 |
| DEC-229 | Confirmed separate meanings / Proposal send snapshot | queued/delivered, human receipt และtask statusแยก; ตรึง resolvedaccount/context/groupmembership ณ sendตามapproved plan | งาน55ข้อ1/2/4 deliveryไม่ack/complete กลุ่มไม่ให้late/new/backdatedmemberอ่านเก่าอัตโนมัติ direct/groupdedupe endpointแต่contextแยก | O08 + C02 + C03 | groupintentใหม่ต้องreview54 ไม่reuseV2approval snapshotไม่สิทธิ์ถาวร current grants/record-source-file ACLยังบังคับ ไม่มีactualdelivery |
| DEC-230 | Proposal transactional portal delivery / Confirmed retry invariant | businessunique intent/endpoint/inbox/receipt/reminder+operation receipt11+lease fencing+atomic sink/audit/outbox | งาน55ข้อ3/เกณฑ์1 newkeyไม่สร้างinitialdispatchซ้ำ partialfanoutคงผู้รับ frozen ไม่resolveใหม่ ต้องADRreconcile04uniques | C02 + C03 + O08 | nativebarrier/revoke/rollback/aftercommit-response-lossยังNOT RUN ไม่อ้างexternalexactlyonceหรือส่งemail/providerที่ไม่ตั้งค่า |
| DEC-231 | Confirmed explicit receipt and file access / Proposal policy gate | รับทราบPOST+serverclock+actor/evidenceตามpolicy มอบหมาย pending_accessจน approvedbinding/current task-record-source-file/clearance/CLEANครบ | งาน55ข้อ2/3/เกณฑ์2 task/link/notification/sameorgไม่grant makercheckerสำหรับเพิ่มสิทธิ์/รับรองงานสำคัญ | O08 + C03 + C02 | representative/offlineack/email/officialchannelยังTO VERIFYและปิดDEMO แก้receipt/taskด้วยhistoryevent ไม่ลบ/เปลี่ยนคนเดิมหรือautoackคนอื่น |

## บท56 — กำหนดสิทธิ์เอกสารและเก็บรักษา (8 ตุลาคม 2569)

| รหัส | สถานะ | การตัดสินใจ | เหตุผล/ขอบเขต | ผู้รับผิดชอบเสนอ | ผลกระทบ |
| --- | --- | --- | --- | --- | --- |
| DEC-232 | Confirmed blocker / Proposal contracts | RECORDS_RETENTION/RECORD_ACCESS_CONTROL/CONTROLLED_DISCLOSURE/fixture56 0.1 เป็นPLAN_ONLY ไม่มีACL/retentionruntime | prerequisite55/ส่วนกลาง/nativeDBไม่ผ่าน db:testexit1 FileVersion/ACL/hold/search/Storageconsumerไม่มีจริง | O08 + C03 + C02 | P56-01–24/56-01/02NOT RUN ไม่สร้างaccount/file/workflow/indexอีกชุด ไม่มีmigration/purgeหรือเริ่ม57 |
| DEC-233 | Confirmed allchannel ACL / Proposal disclosurebinding | record/version/recipient-context/classfloor/source/representation/fileaction/CLEAN/currentauthorityครบก่อนread/search/snippet/count/thumbnail/headers/export/worker; link1/4/6/7ไม่grant | งาน56ข้อ1/3/4/เกณฑ์1 adminเทคนิคไม่readerทุกเรื่อง limiteddisclosureต้องsourceapprovedallowlist/reviewedderivative/makerchecker | C03 + C02 + O08 + sourceowners | private/no-storeเป็นข้อเสนอไม่ACLproof no rawindex/publicthumbnail/metadataunfurl/hiddenPII/cache fallback หรือoverwriteoriginalheld |
| DEC-234 | Proposal retention/hold config / Confirmed official gate | PolicyVersionRECORD_RETENTIONกับtypedHoldCase/events/targets/closure/effective-recorded/provisional/releaseผ่านworkflow11 | งาน56ข้อ2 officialduration/authority/backup policyยังTO VERIFY การครบอายุไม่purgeและholdไม่readgrant documentwideคุ้มครองnewregisteredversionsตามscope | O08 + C03 + C02 | ไม่มีจำนวนปีตามกฎหมายหรือfakeapprover autoexpiry releaseปิด ไม่แก้retention_hold04เฉพาะstatus ต้องADRก่อนmigration |
| DEC-235 | Confirmed preserve destruction audit / Proposal external-effect guard | destruction requestตรึงinventory/currentpolicy/hold/sharedrefs/authority manifest มีtombstone/minimumaudit/provideroutcomes/idempotency แยกtransactionhistoryจากPIIfile | งาน56ข้อ2/เกณฑ์2 externalobjectdeleteไม่อยู่DBtransaction recheckครั้งเดียวไม่raceproof ต้องverifiedallwriter/provider protection protocol | C02 + C03 + O08 + sourceowners | destructiveexecutionปิดจนพิสูจน์holdก่อนpurgeได้ UnknownStorage/backups→partial/reconcile ไม่ลบaudit/sourceledger/ผลสอบ ไม่claimallcopiesgoneหรือfakeexternalrollback |

## บท57 — จัดหลักฐานอนุมัติและลายมือชื่ออิเล็กทรอนิกส์ (8 ตุลาคม 2569)

| รหัส | สถานะ | การตัดสินใจ | เหตุผล/ขอบเขต | ผู้รับผิดชอบเสนอ | ผลกระทบ |
| --- | --- | --- | --- | --- | --- |
| DEC-236 | Confirmed blocker / Proposal contracts | 3contracts+fixture57รุ่น0.1 PLAN_ONLY ไม่มีapproval evidence/signing adapter runtime | prerequisite56และsharedAuth/FileVersion/workflow/ACLไม่มีจริง db:testexit1 | O08 + C02 + C03 | P57-01–24/57-01/02NOT RUN ไม่สร้างบัญชี/engine/filesอีกชุด ไม่migrationหรือเริ่ม58 |
| DEC-237 | Confirmed version binding / Proposal transaction | evidenceผูกserveraccount/time/authority/exactreadmanifest/filebytes/CAS/operationkey/shareddecision+audit+outbox | งาน57ข้อ1/เกณฑ์1 logical04 singlefilehashยังไม่พอหลายแนบ การแก้และrevokeแข่งต้องallwriterguard | O08 + C02 + C03 | materialeditระงับpermit/รุ่นใหม่/ตรวจใหม่ ไม่rewriteoldhash/evidence ภาพหรือdigestไม่signature |
| DEC-238 | Confirmed unconfigured and official gate | SIGNING_NOT_CONFIGURED ไม่มีprovidercall/job/artifact/certificate/trustedtimestamp/officialsuccessจากfallback | งาน57ข้อ2/4 ไม่มีproviderที่ownerยืนยัน ภาพปุ่มhash/internal evidenceแยกจากdigital signature | O08 + C03 | statusแยกapproval/config/job/technicalvalidation/officialacceptance Q009ยังNeeds Legal Review privatekeyนอกแอป |
| DEC-239 | Proposal provider sandbox interface / Confirmed no fabricated validation | typedDTO/operations/input-outputhash/signature_scope/append-onlyvalidation/PKIX-time-revocation binding/reconcile | งาน57ข้อ3 providerต้องยืนยันก่อนimplementation receiptไม่crypto outputcontainerอาจต่างinput | C02 + O08 + C03 + providerที่ยืนยันภายหลัง | unknown/blockไม่fakePASS callbackไม่เลือกtrustanchorsหรือgrantACL ไม่อ้างexactly-onceexternalcall/ย้อนหลังlegalvalidityจากcurrentrevocation |

## บท58 — ตรวจรับสารบรรณและเอกสารข้ามระบบ (8 ตุลาคม 2569)

| รหัส | สถานะ | การตัดสินใจ | เหตุผล/ขอบเขต | ผู้รับผิดชอบเสนอ | ผลกระทบ |
| --- | --- | --- | --- | --- | --- |
| DEC-240 | Confirmed blocker / Proposal QA specifications | UAT_SYSTEM_08/MANUAL_EOFFICE/tests-system08 specifications/fixture0.1 PLAN_ONLY ไม่มีexecutableE2E | prerequisites53–57/sharedAuth/FileVersion/workflow/ACL/source servicesไม่มีจริง db:testexit1 | O08 + C02 + C03 + O01/O04/O06/O07 | rootunit17ผ่านเฉพาะส่วนกลาง P58-01–30/58-01/02NOT RUN actualfiles/decisions/delivery0 ไม่สร้างengine/loginอีกชุดหรือเริ่ม59 |
| DEC-241 | Confirmed current duty and recipient context | คนเดียวหลายcontextแยกdelivery/receipt direct-groupซ้ำcontextเดียวdedup currentAไม่grantexpiredB | งาน58ข้อ1/2/เกณฑ์1 ต้องcurrentaction/scope/time/source-fileclass/CLEANทุกchannel/workers | C02 + C03 + O08 | ลิงก์/receipt/oldrecipientไม่readgrant explicitnewhistoricalpermissionเฉพาะactionไม่restoreroleB กลุ่มเพิ่มสมาชิกไม่oldbookaccess |
| DEC-242 | Confirmed version trace / Proposal cross-system fixtures | 4sourceexamples1ย้าย/4เปิดสนาม/6อนุมัติงบ/7รับพัสดุ pincentralfile V1+source decision/e-officereview decisionแยก และV2correction | งาน58ข้อ3/เกณฑ์2 Documentmetadataไม่actualFileVersion/storage/FK sourceconfigยังProposal | O01 + O04 + O06 + O07 + O08 + C02 | TEST_8descriptors/actualrefsNULL ไม่claimกลางจริง เปิด/ส่ง/ack/closeไม่activate Person/Centerหรือpost budget-stockใหม่ |
| DEC-243 | Confirmed independent states / Proposal close-recovery gates | queued/delivered/ack/taskcompleted/explicitcasecloseแยกกัน retryoldintent/effect/lease/reconcile ข้อล้มเหลวคงaudit | งาน58ข้อ1/2/4 ต้องclosurepolicy/ผู้มีอำนาจ/งานค้าง/evidenceและsoftware-ownerUATแยก | O08 + C03 + C02 | closeไม่VOID/purge/releasehold/public งานเดียวเสร็จไม่close siblings Unknownexternaloutcomeไม่blindresend ภาพ/hash/internalapprovalไม่officialsigned |

## บท59 — เทมเพลต Excel สมัครสอบ (9 ตุลาคม 2569)

| รหัส | สถานะ | การตัดสินใจ | เหตุผล/ขอบเขต | ผู้รับผิดชอบเสนอ | ผลกระทบ |
| --- | --- | --- | --- | --- | --- |
| DEC-244 | Confirmed partial blocker / Proposal runtime | 3XLSXofflineและcontracts/config ไม่productiongenerator | prerequisites35/58/registry05/Auth/files/nativeDBไม่พร้อม db:testexit1 | O05 + O09 + C02 | filechecksผ่าน downloadACL/officialguard/staging/commitNOT RUN ไม่มีmigrationหรือเริ่ม60 |
| DEC-245 | Confirmed shared registry and official gate | DEMO_EXAM_UPLOAD0.1.0 bindingเสนอในFormTemplateRegistryเดิม sourceNULL/OFFICIALdisabled | งาน59ข้อ1/2เกณฑ์2 ไม่มีแบบยืนยัน ศ.3ไม่guess machineschemaแยกdisplay/sourceedition | O05 + O09 + C03 | registrydoc0.3 configไม่DBrows ทุกศ.1/2/3/5/6TO VERIFY labelไม่แทนguard |
| DEC-246 | Proposal protocol / Confirmed preservation | TEXTทุกfield ISO Gregoriantext empty/null optional row_idunique ไทย/leading0exact | งาน59ข้อ2/3เกณฑ์1 วันที่กำกวมreject ไม่เติมศูนย์/แปลงBEเดา | O09 + O05 + C02 | 12mockgroups3NK9DS ไม่บังคับThaiID แยกacademic/fiscal XML/import/nativeยืนยัน ไม่DesktopUAT |
| DEC-247 | Proposal mapping / Confirmed no approval effect | DEMO_REMARKS0.1.0 typedallowlistหลายแถว/evidenceref free-textไม่มีผลapprove | งาน59ข้อ4 mappingทางการTO VERIFY APPROVE_NOWไม่grant | O05 + O09 + C03 | service05เดียว เอกสารกลางscanACLทุกuse ไม่Person/Candidateซ้ำ ไม่seat/certifiedresultจากExcel |

## บท60 — อัปโหลดและ bounded parsing (9 ตุลาคม 2569)

| รหัส    | สถานะ                                                               | การตัดสินใจ                                                                                           | เหตุผล/ขอบเขต                                                      | ผู้รับผิดชอบเสนอ      | ผลกระทบ                                                                                                               |
| ------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| DEC-248 | Confirmed blocker / Proposal service contract                       | uploadintent/filejob/protectedstagingต่อบริการกลาง เมื่อ10/59/Auth/nativeDBพร้อม                      | DocumentยังMETADATA_ONLY workerhealthเท่านั้น db:testexit1         | O09 + O05 + C02 + C03 | runtime60NOT_IMPLEMENTED 30casesNOT RUN ไม่สร้างApplication/Login/FileVersionสำรอง ไม่เริ่ม61                         |
| DEC-249 | Proposal limits / Confirmed actual expansion guard                  | 10MiB/2000dataรวมremarks/50000cells/40MiBactualexpanded/isolatedchildmemory+deadline pinรุ่น          | งาน60ข้อ2/3ต้องทดสอบก่อนจริง MIME/PK/advertisedsize/heapflagsไม่พอ | O09 + C02 + C03       | DEMO_XLSX_PARSING_LIMITS0.1 NOT_ENFORCED schema59demo20ยังเข้มกว่า nodeworkerresourceLimitsไม่hardRSSproof            |
| DEC-250 | Confirmed versioned interpretation / Proposal normalization profile | raw+NFCprotected; TEXTIDsรักษาศูนย์; Thai/BEเฉพาะfield/schemaที่pin eraชัด                            | งาน60ข้อ4/เกณฑ์2ห้ามinferyear/dateหรือstripmarks                   | O09 + O05 + C02       | DEMO_IMPORT_NORMALIZATION0.1 14vectorsPLANONLY machine59เดิมCEASCIIไม่แก้ BEต้องnewversion กฎทางการTO_VERIFY          |
| DEC-251 | Confirmed active content rejection / Proposal pipeline              | preflightZIP/XMLทุกpartก่อนExcelJS+scan/currentACL/exacthash ไม่formula/macro/encryption/externallink | งาน60ข้อ3/เกณฑ์1 ไม่มีparser/scannerจริงในรอบนี้                   | O09 + C02 + C03       | literalregistrydropdownไม่execute rawformulaไม่public baseline3trustedXLSXไม่security/loadtest ทุกP60actualreportNULL |

## บท61 — staging และ dry run (9 ตุลาคม 2569)

| รหัส    | สถานะ                                                    | การตัดสินใจ                                                                                  | เหตุผล/ขอบเขต                                                                  | ผู้รับผิดชอบเสนอ      | ผลกระทบ                                                                                                             |
| ------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| DEC-252 | Confirmed blocker / Proposal staging contract            | ImportBatch/Row/Issue+immutablerunต่อlogical04/บริการกลาง ไม่runtimeเมื่อ60/36ยังขาด         | db:test61exit1 ไม่มีAuth/FileVersion/Application/eligibility/parserจริง        | O09 + O05 + C02 + C03 | 26casesNOT_RUN actualrefsNULL ไม่มีmigration/Person-Enrollment-Applicationwrites ไม่เริ่ม62                         |
| DEC-253 | Confirmed shared identity/business key                   | จับซ้ำในfile/pendingbatch/centralApplicationผ่านidentity05+opportunity;ไม่ชื่อคล้าย          | งาน61ข้อ2 ต้องsameCandidateและallowedmulti-year/slotpolicyไม่มีThaiIDทุกคน     | O09 + O05 + C02       | rawduplicatesprotected ชื่อเหมือนไม่merge unknownidentityERRORไม่warningack ไม่reservekey/seat                      |
| DEC-254 | Confirmed freshness / Proposal TTL-canonicalization      | file+normalized+rules/factmanifest pinned runimmutable currentrecheckทุกview/export/action   | งาน61ข้อ4 reportstaleทันทีที่revisionเปลี่ยน eventล่าช้าไม่grant               | O09 + C02 + C03       | TTL15minProposal boundedbywindow/assignment;reference8mutationsไม่serverproof ProductioncanonicalizationADRrequired |
| DEC-255 | Confirmed protected errors / Proposal export/UI contract | 35codes withsheet/row/field/cell/hints maskedserverDTO XLSXtypedstrings nohiddenraw/formulas | งาน61ข้อ3/เกณฑ์2 currentACL/worker/downloadไม่clienthide publicmetadataไม่leak | O09 + C02 + C03       | CSVdisabled warningackไม่waiveerrors/sourceTO_VERIFY ยังไม่มีpreview/errorXLSX/nativeformula-injectiontest          |

## บท62 — ยืนยันนำเข้าและ Application กลาง (9 ตุลาคม 2569)

| รหัส    | สถานะ                                                   | การตัดสินใจ                                                                                                    | เหตุผล / ขอบเขต                                                  | ผู้รับผิดชอบเสนอ      | ผลกระทบ                                                                                       |
| ------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------- |
| DEC-256 | Confirmed blocker / Proposal contracts                  | ไม่เปิดcommitเมื่อ61/37/shared05/Auth/Document/nativeDBยังขาด                                                  | ไม่มีmodels/services db:test62exit1                              | O09 + O05 + C02       | 24casesNOT_RUN noDDL/runtime บท63ยังไม่เริ่ม                                                  |
| DEC-257 | Confirmed all-or-nothing / Proposal tested profile      | Person/Candidate/Application/snapshot/receipts/audit/successoutboxอยู่sharedtxเดียว measuredprofileก่อนenabled | งาน62ข้อ2–3 ไม่Applicationimporter/partialrowcommit              | O09 + O05 + C02       | testedprofileNULL commitdisabled ไม่มีchunkmode ตัวเลข2000/20ไม่ใช่ผลวัด                      |
| DEC-258 | Confirmed replay/conflict / Proposal summary-intent     | immutablepins+payloadfingerprint oneactiveintent/onesuccesssummaryperbatch แยกrowreceiptslogical04             | สองbrowserคนละkey/workerretryต้องไม่สองชุด keyเดิมpayloadต่าง409 | O09 + C02             | unknownoutcomeอ่านdurableresultก่อนretry currentACLแม้replay ไม่failedทับcommitted            |
| DEC-259 | Confirmed current revalidation / Proposal default draft | workerตรวจclock/scope/year/window/center/identity/rulesก่อนwrites retryใหม่ทุกtx; importไม่approve             | กฎ62และsharedkey05 makercheckerยังแยกขั้น                        | O05 + O09 + C02 + C03 | verifiedidentityกลางไม่name merge draftdefaultรอowner05 หลักฐานfile/receipt/versionไม่mockIDs |

## บท63 — การติดตามและแก้ชุดนำเข้า (9 ตุลาคม 2569)

| รหัส    | สถานะ                                                      | การตัดสินใจ                                                                                   | เหตุผล / ขอบเขต                                                      | ผู้รับผิดชอบเสนอ      | ผลกระทบ                                                                                    |
| ------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------ |
| DEC-260 | Confirmed blocker / Proposal contracts                     | เตรียมmonitoring/recovery22casesเมื่อ62ไม่มีruntime                                           | schema19models db:test63exit1 ไม่มี05/files/Auth/workflow            | O09 + O05 + C02       | ไม่มีtools/migration actualreferencesว่าง 64ยังไม่เริ่ม                                    |
| DEC-261 | Confirmed immutable correction / Proposal lineage-diff     | newFileVersion/newbatch parent-root-branch diff5ชนิด identity/keyไม่ชื่อ approvedไม่overwrite | งาน63ข้อ2 sharedApplication05+receiptเดิมไม่registryซ้ำ              | O09 + O05 + C02       | removedrowไม่autowithdraw overlapใช้amend mixedexecutiondisabledจนcontractพร้อม            |
| DEC-262 | Confirmed reviewed compensation / Proposal recovery states | workflow/currentimpact/makercheckerก่อนapply seat-score-releaseใช้37–39amendment ไม่DELETE    | งาน63ข้อ3/เกณฑ์2 ต้องhistory/unknownfailclosed                       | O05 + O09 + C02       | originalbatchcommitted/receiptimmutable partialcommandsแสดงจริง ไม่wholebatchrollbackclaim |
| DEC-263 | Confirmed scoped monitoring / Proposal retention           | currentDALทุกhistory/export/retry/worker noPIIlogs policyNULL/hold56                          | งาน63ข้อ1/4/เกณฑ์1 creatorพ้นหน้าที่ไม่grant technicaladminไม่reader | O09 + O05 + C02 + C03 | source/sharedfile/derivativesต้องตรวจhold obligations noautoTTLpurge/destructiondisabled   |

## บท64 — ตรวจรับ Excel ร่วมบัญชีระบบ 5 (9 ตุลาคม 2569)

| รหัส    | สถานะ                                                   | การตัดสินใจ                                                                                                 | เหตุผล / ขอบเขต                                                 | ผู้รับผิดชอบเสนอ | ผลกระทบ                                                                                          |
| ------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------ |
| DEC-264 | Confirmed blocker / Proposal UAT                        | 26cases/24runs12pairs PLAN_ONLY เมื่อ59–63/shared05ไม่มีruntime                                             | db:test64exit1 ไม่มีApplication/registry/scan/Auth/worker       | O09 + O05 + C02  | ไม่มีexecutableE2E/modelใหม่ AC64ทั้งสองNOT_RUN ไม่เริ่ม65                                       |
| DEC-265 | Confirmed shared data / Proposal checkpoint evidence    | web/Excelใช้CandidatePerson/opportunity/registry05เดียว ทุกrunactualsnapshots/receipts/decision-seatlineage | งาน64ข้อ1/เกณฑ์1 machineuploadไม่displayform importไม่approval  | O05 + O09 + C02  | เพิ่มcross05/09traceability UAT05เป็น0.2 officialformsTO_VERIFYยังblocked                        |
| DEC-266 | Confirmed limited offline evidence                      | ตรวจ3trustedXLSXเดิมread-only CRC/headers/text/groups/formula tags ผลแยกruntime                             | ไม่ใช้archiveinspectionแทนuploadrejection/scan/securitytest     | O09 + C02 + C03  | actualreport0.1 sourceunchanged correctedstrtypeassumption ไม่fakebatch/ApplicationIDs           |
| DEC-267 | Confirmed measured limits requirement / Proposal manual | provenfilelimitsNULL/commitdisabled ไม่มีloadtest ไม่ยก20เป็น2000อัตโนมัติ                                  | งาน64ข้อ4/เกณฑ์2 ต้องrealresources/privacy/invalidpipelineproof | O09 + C02 + C03  | manualมีlocators/errorแก้/newbatch/amendment/retentionpolicyTO_VERIFY ไม่claimproductioncapacity |

## บท65 — integration ownership และ retry-safe contracts (9 ตุลาคม 2569)

| รหัส    | สถานะ                                                    | การตัดสินใจ                                                                                          | เหตุผล / ขอบเขต                                                                      | ผู้รับผิดชอบเสนอ    | ผลกระทบ                                                                                     |
| ------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------- | ------------------------------------------------------------------------------------------- |
| DEC-268 | Confirmed blocker / Proposal contracts                   | เตรียมmap9owners/7events/15handlers/3scenarios/24casesเมื่อ64และownersขาด                            | db:test65exit1 ไม่มีoutbox/consumer/FileVersion/Authจริง                             | C02 + C03 + O01–O09 | ไม่มีruntime/migration actualrefsว่าง ไม่เริ่ม66                                            |
| DEC-269 | Confirmed canonical ownership / Proposal links           | 04commandผ่าน02; 09ผ่าน05; budget06/stock07/records08เจ้าของเดียว Document/FileVersionกลาง           | งาน65ข้อ1/3และเกณฑ์1 ห้ามregistries/ไฟล์ที่หลบACLอีกชุด                              | C02 + owners        | Person/learningprivate boundary ไม่autoสิทธิ์/appointment/approve/payจากevent               |
| DEC-270 | Confirmed retry protection / Proposal typedoutbox-dedupe | source-outboxatomic consumerreceipt-effectatomic stablefamily/domainreceipt dedupeข้ามeventID/deploy | งาน65ข้อ2/4และเกณฑ์2 outbox04keyเดิมไม่พอหลายApp                                     | C02 + C03           | ADRuniqueaggregate/typedFK/CAS/fencing beforemigration noexternalexactly-onceclaim          |
| DEC-271 | Confirmed minimal data / Proposal ordering-recovery      | allowlistrefs5mandatoryfields+version-provenance currentACLทุกhandler/trace                          | ไม่PII/oldgrant queue versiongapไม่necessarilymissing notificationไม่sourceauthority | C02 + C03 + owners  | stale/reportretryไม่domainrecommit immutablefactsไม่dropจากcursor correlationไม่bearergrant |

## บท66 — ตัวเลข หน้ารายงาน และค้นกลาง (9 ตุลาคม 2569)

| รหัส    | สถานะ                                               | การตัดสินใจ                                                                                                | เหตุผล / ขอบเขต                                                           | ผู้รับผิดชอบเสนอ      | ผลกระทบ                                                                                             |
| ------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------- |
| DEC-272 | Confirmed blocker / Proposal contracts              | เตรียม21metrics/9roleviews/22casesเมื่อ65และreport dependenciesขาด                                         | db:test66exit1 core19models ไม่มีcurrentAuth/domain/report/search runtime | C02 + C03 + O01–O09   | ทั้งACNOT_RUN actualrefsว่าง ไม่มีUI/API/migration ไม่เริ่ม67                                       |
| DEC-273 | Confirmed grain separation / Proposal metriccatalog | distinct person/assignment/enrollment/Application/center/session แยกacademic/FYและexactmoney/quantity      | งาน66ข้อ3/เกณฑ์1 คนหลายหน้าที่ไม่joinfanoutหรือsumย่อยแทนunion            | owners + C02          | M66-01–21เป็นรุ่น0.1 thresholdและofficialpolicyยังTO_VERIFY                                         |
| DEC-274 | Confirmed scope protection / Proposal searchguard   | currentscope/time/action/fieldก่อนmatch/count/facet/snippetทุกchannel adminไม่businesswildcard             | งาน66ข้อ1–2/เกณฑ์2 ไม่matchfieldลับแม้ซ่อนDTO ไม่มีtruehidden_count       | C02 + C03 + O03 + O08 | body/thumbnaildisabled aggregatepolicyNULLให้suppressไม่0 ไม่claim403bootstrapพิสูจน์A/B            |
| DEC-275 | Confirmed report consistency / Proposal manifests   | committed source membership/filter/policy/version/watermarksจอกับexportเดียว historicalsnapshot/currentACL | งาน66ข้อ4 source ledger/snapshotจริง projectionsreconcile/buildretry65    | owners + C02 + C03    | revoke deny/newmanifest ไม่silentfilter Sourceไม่recommitเมื่อreportล้ม exactcounts/decimalsstrings |

## บท67 — tests และ native acceptance (9 ตุลาคม 2569)

| รหัส    | สถานะ                                                 | การตัดสินใจ                                                                              | เหตุผล / ขอบเขต                                                          | ผู้รับผิดชอบเสนอ            | ผลกระทบ                                                                                 |
| ------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------- | --------------------------------------------------------------------------------------- |
| DEC-276 | Confirmed actual results / Confirmed blocker          | รันexisting17unit/12WASMและlint/schema/type/build/format; native/workerexit1             | งาน67ข้อ4 setupไม่เริ่มnativecases localserverและservicesขาด             | C02 + owners                | ไม่รวม29เป็นbusinessintegration ไม่68 ไม่testskipPASS                                   |
| DEC-277 | Confirmed negative coverage / Proposal matrix         | 9×6actions=54casefamilies/7variantsพร้อมpositiveA/B                                      | งาน67ข้อ2/เกณฑ์1 401HTTPเท่านั้น workerinternaldeny makerเฉพาะapproval   | C02 + C03 + O01–O09         | ไม่denyallbootstrapแทนsession/scope/idOR/expiredactualproof                             |
| DEC-278 | Confirmed meaningful concurrency / Proposal schedules | 12nativecases sourceoracle/barriers/multiplebackendPID seat/budget/stock/importtx        | งาน67ข้อ1/3 ต้องPGจริง ไม่SQLite/WASM/oneconnectionPromiseall/sleepproof | O05 + O06 + O07 + O09 + C02 | persistedstate+receipts rollback/retry invariant ไม่productionhelperสร้างexpectedตัวเอง |
| DEC-279 | Confirmed isolated safety / Proposal profile          | runnerguardใหม่เฉพาะch67เมื่อreview; centralTESTfixtures/testonlyclock actualrecordedแยก | guardเดิมch06/schemacoreเท่านั้น ห้ามbypassหรือprod/drop realdata        | C02 + C03 + owners          | profileยังdisabled actualDBrefsว่าง noexecutableใหม่67; กฎทางการTO_VERIFYยังแยกsoftware |

## บท68 — E2E/UAT และการรับรองที่ไม่ปลอม (9 ตุลาคม 2569)

| รหัส    | สถานะ                                               | การตัดสินใจ                                                                                    | เหตุผล / ขอบเขต                                                            | ผู้รับผิดชอบเสนอ   | ผลกระทบ                                                                                        |
| ------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------- |
| DEC-280 | Confirmed actual checks / Confirmed blocker         | build+HTTPsmoke27ผ่าน dbtest/workerexit1 ออก18plansไม่มีbusinessE2E                            | งาน68และprerequisite67 domain/Auth/nativeDBขาด defaultbrowserไม่มี         | C02 + owners       | ไม่403starterแทน3flows ไม่มีruntimee2eใหม่ ไม่69                                               |
| DEC-281 | Confirmed separate learning / Proposal flowcoverage | 3businessflows+network/workerpairแต่ละflow learning9groupsแยก12examcombinations                | งาน68ข้อ1–3 canonicalPersonOrgApp/FileVersion decisions exactfinance/stock | O01–O09 + C02      | DEMOไม่official practiceไม่scores05 retryeffects/sourceintactต้องactualreceipts                |
| DEC-282 | Confirmed no forged signoff / Proposal UATscripts   | 11scripts9owners+learner/public33checkpointplans signoffทุกกลุ่มPENDING                        | งาน68ข้อ4/AC2 ไม่มีเจ้าหน้าที่จริง/อำนาจ/evidence ไม่เติมลายเซ็นแทน        | C01 + owners + C03 | UNSIGNEDtemplate actualtesters/date/authority/signatureNULL ไม่softwarePASSปิดTO_VERIFY        |
| DEC-283 | Confirmed protected evidence / Proposal captureplan | เฉพาะactualTESTscreens/context/version/refs currentACL; rawauthtrace/HAR/storageStateไม่commit | trace/screensมีsecretได้แม้ข้อมูลสมมติ maskภาพไม่network                   | C02 + C03 + O08    | zeroactualscreenshots ไม่ภาพmockupแทนproof protectedscan/redactionก่อนshare noexternaldelivery |

## บท69 — Performance/accessibility ที่แยกเป้าหมายจากผลจริง

| รหัส    | สถานะ                                             | การตัดสินใจ                                                                               | เหตุผล / หลักฐาน                                                     | ผู้รับผิดชอบเสนอ         | ผลกระทบ                                                                                            |
| ------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------- |
| DEC-284 | Confirmed actual diagnostic / blocker             | เก็บ120loopbackGET concurrency4และ21denials p95starter27.182204ms ไม่businessacceptance   | probeจริง14:23UTC window0.579sเครื่องเดียว current68BLOCKED          | C02                      | ไม่เทียบเป้าsearch2s ไม่รับรองnationwide ไม่มีnewexecutables/migration                             |
| DEC-285 | Proposal workload/targets                         | 4profiles TEST counts/machine/ramp/steady/metricsแยก cold/warm/workers; XLSXreuse60limits | งาน69ข้อ1–3 Q014ยังTO_VERIFY parser/queue/sourceขาด                  | C02 + O03/O05/O08/O09    | plannednumbersไม่actual ต้องqueryplans/pool/currentACL/recoveryจริง ไม่ลดauth/scanเพื่อperformance |
| DEC-286 | Confirmed limited review / Proposal accessibility | HTMLstructureและ5declaredcolorpairs≥4.5แยกbrowser/manual/axe/export/media                 | actualHTML/source calculation; no@playwright/test/axe/defaultbrowser | C02 + O03 + ผู้แทนผู้ใช้ | ไม่claimWCAG2.2AAครบ ไม่แก้UIจากการเดา ไม่มีcapturedscreens/signoff                                |
| DEC-287 | Confirmed unproven isolation/memory               | 403no-storeไม่A/Bcacheproof; RSSsample0=NULLไม่0; XLSXchildcapยังproposal                 | authenticatedservices/parser/workerไม่มี อ่านVmRSSไม่ได้             | C03 + C02 + O09          | AC2BLOCKED ต้องpositiveA/B/revoke/releaseinvalidateและprocess-tree/cgroup peakก่อนรับรอง ไม่70     |

## บท70 — Security/data governance ที่ไม่รับรองเกินหลักฐาน

| รหัส    | สถานะ                                                  | การตัดสินใจ                                                                                 | เหตุผล / หลักฐาน                                                        | ผู้รับผิดชอบเสนอ   | ผลกระทบ                                                                                                           |
| ------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| DEC-288 | Confirmed scoped review / blocker                      | ใช้actualsource/unit17/HTTP27+historyscan75commitsไม่แทนbusinesssecurity                    | งาน70ข้อ2/AC1 69BLOCKED core19models auth/files/jobsไม่มี               | C02                | sourceRLS19/defaultdenyไม่nativepositivepolicy ไม่มีCriticalexploitยืนยันแต่coverageยังunknown ไม่71              |
| DEC-289 | Confirmed scan limitations / open issue                | history608text8patterns0match,3binaryข้าม;advisoryauditTIMEOUT20s countsNULL                | scannerไม่ทุกsecret/CVE externallogsไม่มีaccess childDBtoolstdioinherit | C02+C03            | S70-05/06/07openไม่claimnoallsecret/dependenciescertified ต้องredaction/advisory/binaryproofก่อนrealrelease       |
| DEC-290 | Proposal threat/issue/feature gates                    | 10threats8issues15cases ownerroleเสนอ ไม่CVSS/actualexploit;realreleasecriteriaเฉพาะfeature | งาน70ข้อ1/4/5 noauth/upload/businessroutesเป็นactualcontainment         | C01/C02/C03+owners | mocktestingไม่หยุด ไม่configurationdocument=runtimegate ไม่acceptcriticalหรือclosedriskแทนowner                   |
| DEC-291 | Confirmed no forged basis/signoff / Proposal inventory | 19models213fields+9plannedrows12gates basis/retention/decider/evidence/signatureNULL        | งาน70ข้อ3/AC2 C03ต้องappointed/ยืนยันแต่ละpurpose ไม่consentdefault     | C03+O01–O09        | official/publicrealยังปิด enumVERIFIED/isPublicEligibleไม่legaldecision ต้องprotecteddecisionversion+runtimeproof |

## บท71 — Configuration และหลักฐาน release/recovery

| รหัส    | สถานะ                                          | การตัดสินใจ                                                                                       | เหตุผลและผลกระทบ                                                                                              | ผู้รับผิดชอบเสนอ                |
| ------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| DEC-292 | Confirmed blocker / Proposal CI                | ส่ง CI YAMLนอก workflows พร้อม manual/enable gates ไม่มี deployjob                                | บท70ยังค้าง; config parseไม่เท่ากับ Actionsผ่าน ไม่เปิด pipelineหรือ realfeature                              | C02+C03                         |
| DEC-293 | Confirmed actual results                       | แยก clean install FAIL/TIMEOUTจาก workspacechecks exit0; native/worker exit1                      | ไม่copy depsเก่าไปอ้าง clean staging ไม่ bypass supply-chain check; AC1BLOCKED                                | C02                             |
| DEC-294 | Confirmed central stack / Proposal environment | portalเดียว Vercel+Supabase แยก dev/staging/prod และ web/worker/migrator/backuproles              | workerปัจจุบันlocal-only/readiness ไม่ stagedbusinessconsumer; host/OIDC/grantsต้องยืนยัน ไม่มี migrationใหม่ | C02+C03+owners                  |
| DEC-295 | Proposal coherent recovery / No acceptance     | DB+fileversions+ACL/scan+identity/keyrefs ต้อง isolatedrestore; หลัง schemaเปลี่ยน rollforwardfix | RPO24h/RTO4hไม่actual/nullและไม่owner-approved ไม่มี backup/drill/rollbackจริง; AC2BLOCKED ไม่72              | C01+C02+C03+O05/O06/O07/O08/O09 |

## บท72 — NO_GO และส่งมอบตามหลักฐานจริง

| รหัส    | สถานะ                                                 | การตัดสินใจ                                                                   | เหตุผล / ผลกระทบ                                                                                         | Ownerเสนอ              |
| ------- | ----------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------- |
| DEC-296 | Confirmed prerequisite blocker / Proposal releaseplan | ส่ง4runbooks+releaseplan/result แต่คงNO_GO ไม่เปิดpilot                       | งาน72และ71ยังBLOCKED; ไม่มีauthorization/environment/UAT/restore ไม่ข้าม70/71                            | C01+C02+C03+owners     |
| DEC-297 | Confirmed document traceability / Runtime gap         | map35REQเดิมและ9spec/UAT/manual; implementationgap/execution/signatureแยกว่าง | businessmodulecode0/core19models unit17 HTTP27ไม่centralportalproof; AC1partial/AC2blocked               | C02+O01–O09            |
| DEC-298 | Proposal checklist/freeze/backlog                     | 10gates/7freeze/10backlogs ownerroleและdatesเสนอ12–30ต.ค.ตามdeliverableplan   | ไม่มีactualappointedowner/accepteddeadline/runtimefreeze; ไม่รับประกันimplementationครบ/ไม่เริ่มrealdata | C01+C02+C03+C04+owners |
| DEC-299 | Proposal training/support/PIR / No forged handover    | รวม9audiences/contactกลาง dailyT0ถึง+14 review+7/+30calendar Bangkok          | T0/appointments/metrics/approval/signaturenull ไม่มีtraining/messages/PIRจริง ไม่มีบทถัดไปเดาเอง         | C04+C01+C02+owners     |


## Runtime portal ตามคำขอผู้ใช้

| รหัส | สถานะ | การตัดสินใจ | เหตุผล/ขอบเขต |
| --- | --- | --- | --- |
| DEC-300 | Confirmed user instruction / implemented partial | เริ่ม runtimeจริงใน Next/Prisma/Supabase/Vercel repository เดิม | คำขอให้เว็บไซต์ใช้งานจริงอนุญาต implementation ไม่จำกัดเป็นเอกสารอีก; ผู้ใช้ตอบยังไม่มีบริการ |
| DEC-301 | Implemented / provider verification pending | Authกลาง password/TOTPverified + network user validation, timed grants, RLS/no-store/TLS, read-only central registry | ไม่เก็บpassword ไม่ให้adminเทคนิคเห็นทะเบียนทั้งหมด ไม่ให้fake/demo loginเข้าสู่ข้อมูลจริง; MFAenrollและproviderยังค้าง |
| DEC-302 | Implemented source / deployment pending | migrationเพิ่ม6models บัญชี/session/assignment/affiliation/rate/access event coreรวม25 FORCE RLS | ไม่แก้coremigrationเดิม ไม่ทำmutationธุรกิจที่ยังไม่มีapproval/files/outbox |
| DEC-303 | Release NO_GO / gap explicitly retained | public7เมนู workspaceกลาง และ CI/config/setup ส่งได้ แต่ไม่อ้าง9ระบบพร้อมจริง | unit23 SQL-WASM23 HTTP25 buildผ่าน ไม่แทนnative/provider/UAT/restore; readinessรายระบบแสดงgap |
| DEC-304 | Observed security follow-up | ถอด .env จากสาขาส่งมอบ GitHub และไม่อ่านค่า/ไม่ลบhistoryเอง | พบชื่อไฟล์ในremote main เจ้าของต้องประเมินcredentialและrotation/historyตามอำนาจ; ไม่รับรองว่าไม่มีsecretในhistory |


DEC-305 — automatic approval review ปฏิเสธ bulk public egress ของเอกสารภายใน หยุด publication/ref update ไม่ bypassด้วยCLIหรือblobช่องทางอื่น จัดทำ manifest และ patch สำหรับผู้ใช้ตรวจขอบเขตก่อนอนุมัติ Source localยังอยู่ในGit commitและmainปลายทางไม่ถูกแก้ RemoteCIยังNOT_RUN ไม่ใช้ชื่อbranchที่สร้างแล้วเป็นหลักฐานว่าsourceส่งเสร็จ


## อนุมัติขอบเขตเผยแพร่ source

2026-10-09 ผู้ใช้อนุมัติ public egress ของโค้ดและเอกสารภายในตาม PUBLICATION_REVIEW.md ไป cipherpolno0/9_gpt ชัดเจนแล้ว จึงปิด blocker ขอบเขตการเผยแพร่เดิม เตรียมส่งสาขา codex/portal-foundation-20261009 โดยรักษาไฟล์เพิ่มเติมบน main ยังไม่ merge/deploy และไม่ปลด NO_GO ระบบธุรกิจ 9 ระบบ บันทึกผล CI เมื่อรันจริงเท่านั้น App/schema 0.7.0; migration 20261003130000_core_foundation และ 20261009170000_portal_access ไม่เปลี่ยน ขั้นถัดไปตรวจ native CI แล้วปิด provider/staging/business/UAT gaps ตาม PORTAL_READINESS.md

DEC-306 Confirmed: public egress ตาม manifest ได้รับอนุมัติจากผู้ใช้ ไม่เท่ากับ deployment authorization หรือรับรองกฎทางการ


## ผลเผยแพร่ source ตามคำอนุมัติ

ส่ง snapshot ขึ้นสาขา codex/portal-foundation-20261009 และเปิด Draft PR https://github.com/cipherpolno0/9_gpt/pull/1 แล้ว ตรวจ Git blob SHA ของต้นทาง 334 ไฟล์ตรงทั้งหมด เก็บ remote-only 87 ไฟล์ไม่เปลี่ยน ถอด .env, route handler เก่าที่ทับหน้า workspace และ tsconfig.tsbuildinfo จาก snapshot เท่านั้น main ยังคง 9bad69ba271555abf9cdf47748062a1e4602c0a9 ไม่ merge/deploy หรือแก้ประวัติ

CI รอบแรก 37972574364 พบ root seed.ts เก่าที่ผู้ใช้อัปโหลดมี path ไม่ตรง แก้ tsconfig.include ให้ตรวจ src/prisma/scripts/tests/worker/configs จริงทั้งหมดและคงไฟล์ legacy ไว้ ไม่ใช้ ignoreBuildErrors รอบ 37972831965 ผ่าน compile/unit/scan แต่ native core snapshot ORDER BY id ใช้กับ portal_auth_limit ไม่ได้ แก้เรียง JSONB ทั้งแถวเพื่อเทียบทุกคอลัมน์ ไม่ข้ามตารางหรือ constraint Native portal subtests ผ่านในรอบนั้น แต่ทั้ง suite ยัง failed จึงไม่อ้าง PASS ผลรอบใหม่ให้ตรวจ tests/results/portal-foundation-results.json และ Actions URL ที่บันทึกจริง

หลังแก้รัน local lint/typecheck/unit 23/build/HTTP smoke 25/supported-pattern secrets scan ผ่าน รุ่นแอป/schema 0.7.0; 25 models; migration 2 ชุดและ SHA256 เดิมไม่เปลี่ยน Source publication สำเร็จไม่เท่ากับ full-project release: NO_GO ยังอยู่ ขั้นต่อไปปิด provider/Auth/MFA/documents/workflow/business/native/UAT/staging/restore gaps ตาม PORTAL_READINESS.md และทบทวนบท70–72 ไม่เลื่อนไปบท73

DEC-307 Confirmed software change: แก้ clean-checkout typecheck และ test snapshot ตาม failure จริงใน CI คง scope checks/RLS และไม่ยืนยันกฎทางการจากการผ่าน test

ผล native CI ที่รันจริง: commit ada2595c82dbd631bc5d915cc3de13f6a6f08fa3 · push run 37973088946 และ PR run 37973093420 success ทั้งคู่ เมื่อ 2026-10-09 ใช้ Ubuntu24.04 Node24.19.0 pnpm11.28.2 PostgreSQL18-bookworm ฐานสมมติแยกใหม่ migration2ผ่าน; unit23/23; native PostgreSQL18/18 (นับ parent tests2ด้วย); buildและHTTP25ผ่าน พร้อมlint/typecheck/schema/supported-patternscan ผลนี้ปิด blocker native foundation ในCI ไม่เปลี่ยนผล native localที่BLOCKED ไม่ใช่ all9 concurrency/UAT/provider/signoff

## Shared services และ staging 0.8.0

| รหัส | สถานะ | การตัดสินใจ | เหตุผล / ผลกระทบ | Ownerเสนอ |
| --- | --- | --- | --- | --- |
| DEC-308 | Confirmed user preference | สร้าง Supabase staging ใหม่ในcipherpolno0 | ฐานเดิมมีข้อมูล/schemaของผู้ใช้ ไม่เพิ่มทะเบียนกลางซ้ำ; creationติดget_cost UNAVAILABLE | C02 |
| DEC-309 | Confirmed implementation / TO VERIFY authority | เปิดเฉพาะ synthetic generic workflow, explicitscope/maker-checker/currentdelegation/revision/hash | ยังไม่เป็นคำสั่งทะเบียนจริง; policyworkflow.synthetic1TO_VERIFYและdata_modeCHECK | C02/O04 |
| DEC-310 | Confirmed software change | FileVersionimmutable, objectno-upsert, privatebucket/ACL+scan+SHA ก่อนอ่าน; upload4MiB | ครอบคลุมwebceiling; daemon/retention/activecontentpolicyจริงยังค้าง | C02/O08 |
| DEC-311 | Confirmed transaction design | source/decision/audit/outbox/idempotency atomic; notificationreceiptunique+SESSION_USERscope | consumerล้มไม่ย้อนลบsource; noPIIpayload; nativeconcurrencyแยกจากWASM | C02 |
| DEC-312 | Confirmed staging configuration / No release acceptance | Vercel project9-gpt-stagingและpreviewsyntheticenv ใช้personalcontextเดิม | การสร้างprojectไม่เท่ากับdeployพร้อมDB; ไม่production/merge; UATownerPENDING | C01/C02 |
