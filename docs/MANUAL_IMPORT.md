# คู่มือเจ้าหน้าที่นำเข้าสมัครสอบ — บท 64

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | **คู่มือ flow ที่เสนอ / BLOCKED — หน้าบริการยังไม่มีให้ใช้งานจริง**

ใช้กับระบบ9และApplicationกลาง05 อ่าน [UAT_SYSTEM_09](UAT_SYSTEM_09.md), [EXCEL_IMPORT_GUIDE](EXCEL_IMPORT_GUIDE.md), [IMPORT_VALIDATION_CODES](IMPORT_VALIDATION_CODES.md) และ [IMPORT_RECOVERY](IMPORT_RECOVERY.md) ไม่เป็นคู่มือรับรองนโยบายสมัครทางการ ตัวอย่างทั้งหมดสมมติ TEST_ ใช้เฉพาะdev/test ห้ามอ้างว่าเอกสารหรือคุณสมบัติได้รับยืนยันแล้ว

## 1 เตรียมไฟล์

เลือกปีการศึกษา ประเภท ระดับ ช่วงชั้น และหน่วยงาน/สนามจากทะเบียนกลางที่ได้รับสิทธิ์ นักธรรมใช้NONE ธรรมศึกษาใช้PRIMARY/SECONDARY/HIGHER ไม่ใช้ปีงบแทนปีการศึกษา Templateยังไม่ยืนยันแบบจริงจะติดป้ายทดลองและไม่ออกแบบทางการ ศ.3ไม่เดาความหมายจากชื่อเมนู

ใช้machine templateรุ่นที่ระบบระบุ ไม่เปลี่ยนชื่อsheet/headersและไม่เพิ่มคอลัมน์เอง ไฟล์มีผู้สมัครและหมายเหตุแยกsheet ผูกด้วยrow_idที่ไม่ซ้ำ รหัส/identity/เลขอ้างอิงต้องเป็นข้อความเพื่อรักษา0นำหน้า ใส่ชื่อไทยตามหลักฐานไม่ลบวรรณยุกต์ ไม่mergeคนชื่อเหมือนและไม่บังคับทุกคนมีเลขบัตรไทย

Template59รุ่น0.1.0ใช้birth_date TEXTค.ศ. YYYY-MM-DD และรหัสASCIIตามschemaเดิม **อย่ากรอกพ.ศ./เลขไทยลงช่องนี้แล้วคาดว่าแปลงเอง** รองรับเลขไทยหรือพ.ศ.ได้เฉพาะfield/profile/templateรุ่นที่ระบุeraและได้รับอนุญาต60 ไม่ใช้การบวก/ลบ543กับทุกfield เช่นacademic_year_codeเป็นรหัสกลาง ไม่ใช่วันเกิด

หมายเหตุหลายรายการใช้sheetหมายเหตุตามmappingรุ่นที่pin ชื่อเดิม/นามสกุลเดิม/ประโยคเดิม/ต่างชาติ/ไม่มีเลขไทยแนบDocumentreferencesตามpolicyที่ยืนยัน ไม่แนบprivateURLs/path/tokenในcell ไม่ใช้ข้อความ“ผ่าน/อนุมัติ”เป็นคำสั่ง Free textไม่grantคุณสมบัติหรือสิทธิ์ ตรวจว่าsave/reopenชื่อและรหัสยังครบก่อนส่ง

## 2 อัปโหลดและแก้ dry run เมื่อบริการพร้อม

1. เลือกcontextตรงไฟล์ อัปโหลด.xlsx ผ่านบริการกลาง ต้องquarantine/scan/parserก่อนdryrun ยังไม่สร้างPersonหรือApplication
2. อ่านerrorตามsheet/physicalrow/column/code วิธีแก้ ไม่เผยไฟล์ที่มีข้อมูลส่วนตัวในช่องทางสาธารณะ ถ้าไม่มีสิทธิ์เห็นค่าให้ประสานผู้มีอำนาจผ่านreferenceแทนส่งตัวตนเต็ม
3. แก้sourcefileเป็นbatchรุ่นใหม่เชื่อมต้นทาง ตรวจdiffก่อนส่ง ไม่เขียนApplicationที่อนุมัติแล้วทับ
4. Dryrunต้องตรวจครบทุกแถว error0 พร้อมwarningackของreportรุ่นนั้น ผลINCOMPLETE/STALE/EXPIREDไม่ใช่ผ่าน แม้หน้าบางส่วนไม่มีerror
5. ยืนยันkeyเดิมเพื่อretryงานเดิม workerตรวจscope/year/window/center/rules/evidenceอีกครั้ง สิทธิ์หมด สนามปิด หรือหมดเวลาระหว่างรออาจทำให้ส่งไม่สำเร็จ
6. เมื่อcommittedตรวจactualApplicationเลขอ้างอิงและจำนวนจากreceipt05 ไม่ใช่เลขแถวExcel นำเข้าสำเร็จไม่approved/ได้seat/ผ่านสอบ ต้องเข้าสู่คิวตรวจระบบ05ต่อ

## 3 วิธีแก้ error ที่พบบ่อย

| code / อาการ                                                        | วิธีแก้ที่เสนอ                                                               | สิ่งที่ห้ามข้าม                                      |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------- |
| CELL_MUST_BE_TEXT / 0นำหน้าหาย                                      | ตั้งTEXTแล้วกรอกใหม่จากหลักฐาน เก็บไฟล์ใหม่                                  | การตั้งformatอย่างเดียวไม่คืน0ที่หายแล้ว ไม่เดารหัส  |
| AMBIGUOUS_DATE / AMBIGUOUS_YEAR                                     | ใช้รูปแบบ/eraที่templateระบุ ขอschemaใหม่ถ้าต้องรองรับพ.ศ.                   | ไม่เดาวันเดือน/ปีจากตัวเลขสั้น                       |
| SCHEMA_VERSION_MISMATCH / INVALID_GROUP                             | ใช้รุ่นที่ตรงcontext นักธรรมNONE/ธรรมศึกษาช่วงชั้นถูกต้อง                    | ไม่renameheaderเพื่อให้validatorมองข้าม              |
| UNKNOWN_ORGANIZATION / ORG_CONTEXT_MISMATCH / SCOPE_DENIED          | ตรวจรหัสและหน่วยที่ได้รับมอบหมาย หรือให้ผู้มีสิทธิ์ดำเนินการ                 | ไม่เปลี่ยนtarget_id/clientscopeหรือใช้บัญชีผู้อื่น   |
| CENTER_CLOSED / CLOSED / NOT_OPEN                                   | ตรวจรอบ/วันเปิด-ปิดจริง ถ้าต้องเปลี่ยนสนามใช้คำขอตามขั้นตอน                  | ไม่แก้เวลาเครื่องหรือforceeligible                   |
| EVIDENCE_REQUIRED / EVIDENCE_NOT_CLEAN / EVIDENCE_NOT_VERIFIED      | แนบเอกสารกลางถูกคน ถูกpurpose ให้ผ่านscanและผู้ตรวจตามpolicy                 | scanCLEANไม่แปลว่าหลักฐานรับรองตัวตน/คุณสมบัติ       |
| DUPLICATE_IN_FILE / DUPLICATE_APPLICATION / DUPLICATE_PENDING_BATCH | ตรวจexistingrow/Applicationreferenceในscope ขอแก้รุ่นเดิมเมื่อเป็นเรื่องเดิม | เปลี่ยนorg/center/key/channelไม่สร้างopportunityใหม่ |
| IDENTITY_REVIEW_REQUIRED / NAME_SIMILAR_NOT_MERGED                  | ตรวจตัวตนด้วยหลักฐานตามประเภท ไม่ใช้ชื่ออย่างเดียว                           | warningackไม่ทำให้unknownidentityผ่าน                |
| UNMAPPED_REMARK / ORPHAN_REMARK                                     | ใช้mappingcodeรุ่นที่pin row_idตรงผู้สมัครพร้อมreferenceหลักฐาน              | ไม่แปลงข้อความอิสระเป็นapprove                       |
| REPORT_STALE / REPORT_EXPIRED / VALIDATION_INCOMPLETE               | ตรวจใหม่ทั้งชุดตามcurrentfacts แก้failureก่อนยืนยัน                          | ไม่reusecachedPASS/บังคับปุ่มclient                  |

Codeจริงอ่าน [catalog35codes](IMPORT_VALIDATION_CODES.md) กลุ่มตารางนี้ไม่สร้างvalidator/codeใหม่ IDempotencyconflictเป็นcommand conflictตาม62 ไม่เอาไปอ้างว่าเป็นValidationIssueที่ติดตั้งแล้ว

## 4 Retry และถอนชุดผิด

ถ้าเครือข่ายขาดขณะcommitให้เปิดสถานะเดิมและค้นreceiptก่อนกดนำเข้าใหม่ Unknownoutcomeไม่หมายถึงfailed Committedให้ดูผลเดิมหรือเสนอamendment ไม่retrycreate คนละkeyก็ไม่ควรเกิดApplicationใหม่ หากkeyเดิมกับpayloadใหม่จะconflict ต้องnewbatch/dryrunตามขั้นตอน

ถอนชุดผิดต้องระบุApplication/receiptที่แน่นอน เหตุผลและหลักฐานผ่านworkflow/maker-checker ตรวจseat/score/certification/releasesทั้งhistory ถ้ามีปลายทางใช้amendment37–39 ไม่DELETE ไม่ลบPerson/Enrollment/เอกสาร/receiptของbatch การแก้บางรายการสำเร็จแล้วต้องดูper-targetoutcomes retryเฉพาะงานค้าง ไม่ถือว่าทั้งชุดย้อนกลับโดยอัตโนมัติ

Exportรายงาน/ไฟล์ต้นฉบับ/errorreportsต้องมีcurrentrightsเช่นเดียวกับต้นทาง ห้ามแชร์URLแล้วคาดว่าACLคงอยู่ ห้ามส่งrawrows/เลขบัตร/วันเกิดในlog/jobpayload อายุเก็บและholdตามนโยบายที่ยืนยันเท่านั้น ปัจจุบันระยะจริงTO_VERIFYและการทำลายปิด ไม่ลบหลักฐานเองเพราะreportหมดอายุ

## 5 การขอความช่วยเหลือและสถานะปัจจุบัน

ส่งbatch/command/correlationreference, safeerrorcode, sheet/row/column, เวลาและอาการ ให้ผู้รับผิดชอบที่มีสิทธิ์ ไม่ส่งpassword/token/sourcefileที่มีตัวตนเต็มลงissuepublic ตอนนี้ไม่มีbatchจริงหรือsupportteamแต่งตั้งแล้ว ห้ามแต่งเลขติดตามหรือช่องทางผู้รับผิดชอบขึ้นเอง

คู่มือนี้ยังเป็นProposal ทุกflowruntimeและ22/24/26/30casesบทก่อนยังต้องตรวจตามเอกสารแต่ละบท ไม่ใช้offlineXLSXchecksเป็นหลักฐานว่าสมัครจริงได้ ดูผลจริงและblockersใน [UAT_SYSTEM_09](UAT_SYSTEM_09.md) บท65ยังไม่เริ่ม
