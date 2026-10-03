# รายการตัดสินใจ — เว็บไซต์กองบริหารทะเบียนและวัดผล

บท 05 | รุ่นเอกสาร 1.5 | 3 ตุลาคม 2569 (2026-10-03)

Confirmed คือข้อกำหนดที่ผู้ใช้ให้ ไม่ใช่คำวินิจฉัยทางการ Proposal คือข้อเสนอที่รอผู้รับผิดชอบพิจารณา TO VERIFY คือยังไม่พอให้ตัดสินหรือใช้งานจริง ผู้ใช้อนุมัติแผนงานบทนี้ด้วย “ตกลง” แต่ไม่ได้ยืนยันกฎทางการหรือแต่งตั้งเจ้าของงานจริงใน Q005

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
