# คู่มือบำรุงรักษาทะเบียนหน่วยงาน — ฉบับเตรียมบท23

รุ่น0.1 | 4ตุลาคม2569 | **Proposal / ระบบ2ยังBLOCKED — ยังไม่มีหน้าจอและflowที่ใช้งานจริง**

คู่มือนี้เตรียมใช้เมื่อ19–22ผ่าน ไม่ระบุชื่อปุ่ม/URLที่เดาว่ามีจริง สถานะและcaseอยู่ใน [UAT_SYSTEM_02](UAT_SYSTEM_02.md) กฎอยู่ใน [DATA_QUALITY_RULES](DATA_QUALITY_RULES.md)

## 1 ตรวจข้อมูลก่อนเริ่มงาน

ใช้บัญชีกลางที่มีaction/สาย/พื้นที่/ช่วงมอบหมายปัจจุบัน ทดลองเฉพาะข้อมูลDEMOไม่ใช่รหัส/ที่อยู่/Personจริง “ทั่วประเทศ”เป็นขอบเขตที่ระบบต้องรองรับ ไม่ใช่หลักฐานว่าทะเบียนจริงครบ ห้ามเปลี่ยนlabelDEMOหรือใช้รหัสทดลองออกเอกสารทางการ

ค้นหน่วยเดิมด้วยรหัส/ชื่อปัจจุบัน/ชื่อเดิม/พื้นที่ตามสิทธิ์ก่อนเสนอสร้างใหม่ ชื่อคล้าย/อยู่ที่เดียวกันเป็นเหตุให้ตรวจหลักฐาน ไม่mergeเอง วัดหรือสถานศึกษาเดิมที่มีหลายหน่วยเรียนใช้อ้างต้นทางกลางตาม19 ไม่copyชื่อ/ที่อยู่ต่อแผนก

## 2 งานบำรุงรักษาตามรอบที่policyรับรอง

ตรวจรหัส/sourceissuer, parent/type/ช่วงสัมพันธ์, mailingaddress/Geo/postal, contactpurpose/verification_due, สนามตามปีรอบ/หน้าที่requiredและsnapshotที่ต้องใช้ อ่านsafe findingsตามสิทธิ์ อย่าตีความUNKNOWNหรือNOT_EVALUATEDว่าไม่มีปัญหา

| Finding                                   | ขั้นเจ้าหน้าที่เสนอ                                                                      |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| รหัสซ้ำ/identityขัด/ชื่อคล้าย             | ตรวจnamespace/evidence เสนอlink/create/update/mergeผ่านworkflow ไม่แก้รหัสสุ่มให้ผ่าน    |
| ที่อยู่requiredขาด/Geoผิด/Postalไม่ยืนยัน | ขอsourceที่มีหลักฐาน คงdraft/needsreview ไม่เติมบ้านส่วนตัวหรือเดาจากชื่อ                |
| parentcycle/allowedtypeไม่รู้             | ให้เจ้าของสายรับรองแผน revision วันที่และsource ไม่สลับparentทับหรือยกสิทธิ์จากGeography |
| ขาดchair/recipient                        | แจ้งสนามแต่งตั้งใหม่ตามอำนาจ ไม่เลือกcoordinatorหรือคนสำรองเอง                           |
| contactครบกำหนดตรวจ                       | ตรวจpurpose/แหล่ง/วิธีและวันจริง ไม่แตะupdated_atเพื่อทำให้ดูใหม่ และไม่suspendบัญชีเอง  |
| ไม่มีแผนที่                               | ใช้textlist/detail ไม่ถือข้อมูลเสียหรือสร้างพิกัดจากชื่อ                                 |

รอบเวลาตรวจ/retention/sourcehierarchyยังTO VERIFY ไม่มีการตั้งรอบเดือนหรือกฎทางการที่เดาในคู่มือนี้ การแก้ข้อมูลเป็นคำขอใหม่มีเหตุผล/หลักฐาน/ผู้ตรวจ ช่วงมีผลและวันบันทึกแยกกัน ไม่แก้audit/เอกสารที่ออกแล้ว

## 3 นำเข้าแหล่งเดิมและตรวจความต่าง

1. ตรวจว่าsource/template/namespaceได้รับอนุญาต เก็บไฟล์privateผ่านquarantine/scanACLก่อนparse
2. ให้adapterที่มีรุ่นสร้างstagingและdiff/DQตามscopeเท่านั้น ตรวจrow/version/target/evidence ไม่มีข้อมูลในทะเบียนจริงเปลี่ยนจากการอ่านไฟล์
3. ผู้ตรวจเลือกรายการเมื่อมีหลักฐาน: linkเดิม, เสนอสร้าง, เสนอhistoryupdate, ขอmerge หรือdefer/reject ไม่autoapproveหลายแถวจากชื่อคล้าย
4. งานสำคัญมีmakerchecker ผู้สร้างไม่อนุมัติตนเอง ก่อนapplyตรวจsource/target/currentgrant/versionsใหม่ ถ้าconflictทำdiff/reviewrevisionใหม่
5. หลังapplyที่ได้รับอนุมัติ ตรวจreceipt/history/auditและfollowup ไม่ส่งข้อมูลส่วนตัวเต็มในlog/supportmessage ไม่harddeleteหน่วยหรือsourceเพื่อซ่อนข้อผิดพลาด

ตอนนี้ยังไม่มีadapter/staging/applyจริง JSONในtestsเป็นofflineplan Expectedfocusเขียนเองไม่ใช่ผลรายงานนำเข้า ห้ามสรุปว่านำเข้าสำเร็จจากเปิดไฟล์ได้

## 4 ค้น/ส่งออก/ดูปีเก่า

ระบุchain/วันที่/known_atตามpurpose ใช้currentgrantอ่านhistory ไม่ยืมสิทธิ์ปีเก่าจากการเปลี่ยนวันที่ รายงานจัดส่งเก่าอ่านsnapshotของปีรอบนั้น ไม่joinเบอร์/addressใหม่ตาม22

export/print/downloadเป็นactionแยกและใช้fieldscopeเดิม เบอร์ส่วนตัว/ที่อยู่private/เอกสารแต่งตั้งไม่เปิดผ่านpublic/default flags และรายงานไม่ให้ดูข้อสอบ official เมื่อสิทธิ์ถอนแล้วต้องdenyjob/downloadตามserver ไม่เปลี่ยนID/URL/chainเพื่อข้าม

เก็บmanifestrevision/FileVersion/hashที่จำเป็นตามACL/retention หากพบประวัติผิดใช้correction/amendmentอ้างต้นทาง ไม่ลบหรือoverwriteissuefile ข้อมูลDEMOกับข้อมูลจริงเมื่อมีต้องมีlabel/namespace/สภาพแวดล้อมแยกชัดและมีpolicyapprovedก่อนนำจริงเข้า

## 5 ก่อนรับรองใช้งาน

ตรวจUAT23ทุกcaseกับschema/UI/flowจริงตาม5ประเภทที่ผู้ใช้กำหนด พร้อมผลscope/fieldprivacy/pagination/history/snapshot/retry ไม่มีการลงนามหรืออบรมผ่านในรุ่นนี้ ผู้รับรองO02/C02/C03/C01ยังเป็นหน้าที่เสนอให้ยืนยันในQ005 ต้องแก้คู่มือจากหน้าจอจริงเมื่อimplementationพร้อมก่อนปฏิบัติงาน
