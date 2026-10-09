# ฟิลด์ทะเบียนบุคคล — แบบเตรียมบท 13

รุ่นเอกสาร 0.1 | 3 ตุลาคม 2569 | **Proposal / BLOCKED — ไม่ใช่ schema หรือบริการที่ใช้งานได้**

บท13ต้องผ่านบท12ก่อน แต่ [FOUNDATION_ACCEPTANCE](FOUNDATION_ACCEPTANCE.md) ยัง BLOCKED เอกสารนี้เทียบข้อมูลจริงใน core0.6.0 กับแบบที่ต้องเพิ่มเติมเท่านั้น ไม่มี migration/seed/API ทะเบียนบุคคลบท13 และเกณฑ์ทั้งสองข้อยัง NOT RUN

## 1 หลักการทีละขั้น

1. Person เป็นตัวบุคคลกลางหนึ่งรายการ ไม่สร้างใหม่เมื่อเพิ่มสังกัดหรือหน้าที่ ใช้ตารางเชื่อมหลายรายการที่อ้าง person_id เดิม
2. ชื่อเดิมคือประวัติของคนเดิม ไม่ใช่บุคคลอีกคน วันมีผลบอกว่าชื่อนั้นใช้ช่วงใด ส่วนวันบันทึกบอกว่าระบบรับรู้เมื่อใด
3. ทำเนียบเป็นข้อมูลที่ server เลือกให้เห็นตามนโยบาย ไม่ใช่การส่ง Person พร้อมข้อมูลสัมพันธ์ทั้งหมดแล้วซ่อนช่องส่วนตัวในหน้าเว็บ
4. รหัสที่มีแหล่งอ้างอิงยืนยันใช้ช่วยตรวจคนซ้ำได้ ชื่อคล้ายหรือวันเกิดเหมือนกันเป็นเพียงคู่ให้เจ้าหน้าที่พิจารณา ไม่รวมคนอัตโนมัติ

## 2 ฟิลด์ที่มีจริงใน Prisma core06

ชื่อในตารางเป็นคอลัมน์ snake_case จริง ยังคง classification ตาม DATA_CLASSIFICATION ส่วนเพิ่มบท13ด้านล่างเป็น Proposal เท่านั้น

| Model / คอลัมน์                                                    | ความหมายและการใช้                                                  | ชั้น/ข้อจำกัดปัจจุบัน                                      |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| Person.id / person_code                                            | UUIDกลางและรหัสระบบที่unique; ไม่ใช่เลขบัตรหรือรหัสทางการที่รับรอง | R; ไม่เปิดออกทำเนียบโดยอัตโนมัติ                           |
| Person.identity_review_status_id                                   | สถานะตรวจตัวตนจากReferenceCode                                     | R; DEMO_UNVERIFIED ไม่รับรองตัวตน                          |
| Person.current_state_id                                            | สถานะbootstrapจากReferenceCode                                     | R; ยังไม่ใช่ timeline สถานะบรรพชิต/คฤหัสถ์ที่มีผลจริง      |
| Person.merged_into_person_id                                       | FKอ้างPersonเดิมเมื่อต้องแก้คนซ้ำ                                  | R; มีคอลัมน์ไม่ได้แปลว่ามีmerge serviceหรือให้รวมอัตโนมัติ |
| PersonPrivate.person_id                                            | uniqueFKไปPerson รองรับข้อมูลส่วนตัวต่อคน                          | H; PersonPrivateเป็นข้อมูลประกอบ ไม่ใช่ทะเบียนบุคคลอีกชุด  |
| PersonPrivate.birth_date                                           | วันเกิดชนิดdate nullable                                           | H; devseedไม่ใส่วันเกิด; ไม่อยู่ทำเนียบ                    |
| PersonPrivate.private_address_text / private_phone / private_notes | ข้อมูลส่วนตัวและหมายเหตุ                                           | Hทุกช่อง รวมPK/FK/time; ไม่มีpublicDTO                     |
| PersonNameHistory.person_id / name_kind_id                         | ชื่อผูกPersonและชนิดชื่อจากReferenceCode                           | H; name_kindในseedยังเป็นDEMO_DISPLAYเท่านั้น              |
| PersonNameHistory.prefix_text / given_name / family_name           | คำนำหน้า ชื่อ นามสกุลตามหลักฐาน                                    | H; ไม่ใช้คำนำหน้าอนุมานตำแหน่งหรือสถานะ                    |
| PersonNameHistory.effective_from / effective_to                    | ช่วงใช้ชื่อแบบdate; [เริ่ม,สิ้นสุด)                                | H; ชื่อเก่าไม่ถูกลบทิ้ง                                    |
| PersonNameHistory.recorded_at / superseded_at / replaces_id        | ประวัติความรู้และการแก้หลักฐาน                                     | H; แก้ด้วยsupersede/replacement ไม่ทับเนื้อหาเดิม          |
| PersonNameHistory.evidence_document_id / recorded_by_actor_id      | หลักฐานmetadataและServiceActorผู้บันทึก                            | H; ยังไม่ใช่FileVersionที่ผ่านscanหรือผู้ใช้login          |
| PersonContact.contact_code / channel_kind_id / contact_value       | ช่องทางติดต่อหลายรายการและช่วงมีผล                                 | H; เบอร์/อีเมลของบุคคลไม่เปิดโดยอัตโนมัติ                  |
| PersonContact.is_public_eligible                                   | ค่าเริ่มfalse; เป็นเพียงเงื่อนไขประกอบ                             | H; trueไม่ให้สิทธิ์เผยแพร่หรือแทนallowlist/ACL             |

Personใช้UUIDเดียวกันกับทุกโมดูล Organization, เอกสาร, บัญชี และประวัติใช้ต้นทางส่วนกลางเดียว ไม่มีperson.org_idบังคับให้คนมีสังกัดเดียว และไม่เปลี่ยนServiceActorเป็นบัญชีเข้าสู่ระบบ

## 3 ข้อมูลที่เสนอเพิ่มหลังผ่าน foundation

ใช้ FKไปPerson/Organization/mastersเดิม ประวัติมี effective_from/to, recorded_at, actor, evidence, superseded_at/replaces_id และ correlation ผ่านaudit ไม่ใช้ตารางใหม่เป็นทะเบียนหลักอีกชุด

| Model/ส่วนที่เสนอ           | ฟิลด์แกนและความสัมพันธ์                                                                                      | ข้อกำหนด/สถานะ                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| EducationBranch             | branch_codeภายใน, label_th, verification_status, policy_version_id, evidence, is_active                      | ธรรม/บาลี/สามัญ/ปริยัตินิเทศก์ตามผู้ใช้; รหัสทางการยังTO VERIFY; ดูJSP_MAPPING                                |
| PositionType                | position_codeภายใน, labelที่ยืนยัน, education_branch_idnullable, policy_version_id, verification_status      | ไม่มีรายชื่อตำแหน่งสมมติที่อ้างเป็นทางการ; แยกประเภทหน้าที่จากroleสิทธิ์                                      |
| PositionAssignment          | person_id, organization_id, position_type_id, ช่วงมอบหมายและหลักฐาน                                          | หลายหน้าที่/หลายหน่วยได้; ไม่unique(person_id); กฎทับช่วงพิจารณาตามชนิดหน้าที่ที่ยืนยัน                       |
| AffiliationHistory          | person_id, organization_id, relation_type_id, ช่วงสังกัดและหลักฐาน                                           | หลายสังกัดได้; businesskeyเสนอ(person,org,relation_type) ไม่ล็อกคนทั้งระบบให้มีสังกัดเดียว                    |
| ประวัติฉายา                 | person_id, ฉายาตามหลักฐาน, ชนิด/ช่วงใช้, evidence                                                            | แยกจากชื่อทางทะเบียนและคำนำหน้า ไม่เดาฉายา/การถอดอักษร; ต้องเลือกmodelชื่อ/ฟิลด์ด้วยADRเมื่อimplement         |
| ประวัติสถานะบรรพชิต/คฤหัสถ์ | person_id, status_codeจากconfiguration, ช่วงมีผล, source_request/evidence                                    | ไม่เขียนcurrent_stateเป็นผลมีจริงก่อนworkflowอนุมัติและถึงวันมีผล; ประเภทอื่นรอเจ้าของยืนยัน                  |
| ประวัติการศึกษา             | person_id, education_branch_id, qualification_codeที่ยืนยัน, institution organization_id, วัน/ปีที่มีหลักฐาน | บันทึกคุณวุฒิ/การศึกษาที่รับรอง; ไม่สร้างทะเบียนผู้เรียน/ใบสมัครซ้ำกับระบบ05; ข้อมูลคะแนนทางการไม่ใช่คะแนนฝึก |
| รหัสอ้างอิงตัวตนที่ตรวจแล้ว | person_id, namespace/issuer, opaque reference key, verification_status, evidence, วันมีผล/วันบันทึก          | แยกไว้ในprivate identity extension; ห้ามใส่เลขระบุตัวตนจริงในseed/log/public; storage/encryptionรอQ025        |
| DuplicateReview             | คู่Personที่canonicalลำดับID, เหตุผลเปรียบเทียบแบบจำกัด, สถานะ/ผู้ตรวจ/หลักฐาน                               | ไม่รวมอัตโนมัติ; คู่เดิมretryไม่เพิ่มcaseซ้ำ; สิทธิ์ผู้ตรวจต้องครอบคลุมคู่ทั้งสอง                             |

ชนิดข้อมูล/classificationใหม่เป็นข้อเสนอและปิดตามdefaultก่อน Q025รับรองฟิลด์ ทำเนียบต้องเป็นprojectionที่ยืนยันต่างหาก ไม่ลดข้อมูลชื่อ/ประวัติเดิมจากHเพียงเพราะเพิ่มหน้าเว็บไซต์

ดัชนีให้เลือกจากqueryจริง: owner+ช่วงเวลาในประวัติ, FKที่ใช้ค้น, verified-referenceตามnamespace/issuer และค้นชื่อที่รับรองตามสิทธิ์ ไม่copyดัชนีทุกคอลัมน์จากlogicaldictionary04โดยไม่ดูquery/EXPLAIN ตัวindexค้นชื่อในcore06ยังไม่มี จึงไม่อ้างว่าค้นชื่อเร็วหรือมีsearchAPIแล้ว

## 4 สิทธิ์และ projection ของทำเนียบ

| กลุ่มการเข้าถึงที่เสนอ       | อ่านได้หลังpolicyยืนยัน                                                   | ปฏิเสธโดยdefault                                                                            |
| ---------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| directory-only               | display_name/currentpublicrole/affiliationเฉพาะที่อยู่ในallowlistและscope | PersonPrivateทั้งหมด, hiddenhistory/ชื่อเดิม/ฉายา/การศึกษา/contact/reference/evidence/audit |
| เจ้าของข้อมูล                | ฟิลด์ของตนตามpurposeและactiongrantที่ตรวจผ่านsession/DAL                  | ไม่มีสิทธิ์ของคนอื่นจากการแก้person_idในclient                                              |
| เจ้าหน้าที่ทะเบียนตามพื้นที่ | ข้อมูลที่grantอนุญาตและความสัมพันธ์องค์กรในscope/ช่วงมอบหมาย              | ไม่ได้อ่านข้อมูลส่วนตัวเพียงเพราะมีroleดูทำเนียบหรือมีสังกัดร่วมหนึ่งแห่ง                   |
| ผู้ตรวจข้อมูลอ่อนไหว/คนซ้ำ   | fieldgrantและpurposeเฉพาะรวมscopeของทุกคนในคู่                            | ไม่ส่งคู่ที่อยู่นอกสิทธิ์หรือข้อมูลตัวระบุเต็มชุดในผลค้น                                    |
| public                       | projectionขั้นต่ำที่เจ้าของรับรองQ008เท่านั้น                             | ทุกฟิลด์นอกallowlist รวมเลขระบุตัวตน วันเกิด ที่อยู่/เบอร์ส่วนตัว                           |

serverต้องเลือกคอลัมน์อย่างชัดเจนและกรองrelationshipก่อนserialize ห้ามincludePersonPrivateหรือทุกaffiliationsแล้วค่อยลบในbrowser ผู้มีscopeAดูPersonที่มีทั้งสังกัดA/Bต้องเห็นเพียงrelationshipที่ได้รับสิทธิ์ การเป็นเจ้าหน้าที่Aไม่ทำให้แก้profileรวม/ข้อมูลprivateหรือหน้าที่Bได้โดยอัตโนมัติ

read/search/mutate/export/print/jobและAPIตรงใช้DALเดียวกัน Cacheprivateต้องตรวจสิทธิ์ปัจจุบันและออกแบบแยกผู้ใช้ก่อนใช้งาน ไม่เก็บในstaticHTML/assets/publicfolder Publicและdirectory-onlyไม่ค้นhiddenoldnameเพื่อคืนผลที่เปิดเผยว่าคนนี้เคยใช้ชื่อใด เว้นแต่policyรับรองให้เผยแพร่ชื่อประวัตินั้น

## 5 ชื่อปัจจุบันและการค้นชื่อเดิม

ข้อเสนอบริการทะเบียนสำหรับเจ้าหน้าที่ที่มีgrantอ่านประวัติชื่อ: normalizeคำค้นโดยไม่ทำลายข้อความต้นฉบับ กรองPerson/ชื่อที่มีสิทธิ์ก่อนค้นประวัติ ใช้ผลperson_idเดิมdedupeแล้วแสดงชื่อปัจจุบันตามวันอ้างอิง คืนชื่อที่matchเฉพาะผู้มีfieldgrant ห้ามreturnrawhistory/privatecontactพร้อมกัน

แยกสองการค้น: ประวัติธุรกิจตามวันมีผล และการตรวจหลักฐานย้อนหลังตามวันบันทึก ชื่อที่ถูกsupersedeยังเก็บไว้เพื่อตรวจauditแต่ไม่เป็นชื่อที่มีผลปัจจุบันโดยอัตโนมัติ ต้องระบุโหมดและactiongrant การแก้ชื่อโดยอ้างคนเดิมไม่สร้างPersonใหม่

ไม่กำหนดuniqueชื่อ/นามสกุล/วันเกิดหรือบังคับวันเกิดให้ค้นได้ และไม่ใช้คำนำหน้าเป็นรหัสตำแหน่ง ข้อกำหนดการค้นและดัชนีต้องทดสอบnativeDBเมื่อschema/searchserviceพร้อม

## 6 ตรวจคนซ้ำและการแก้ไข

1. serverตรวจที่มา/namespace/issuerและหลักฐานของรหัสอ้างอิงก่อนถือว่าVERIFIED; person_codeภายในกับDEMOcodeไม่ใช่หลักฐานตัวตนทางการ
2. รหัสอ้างอิงเดียวกันที่ยืนยันแล้วต้องมีconstraintป้องกันผูกกับคนอื่น โดยกำหนดขอบเขตความไม่ซ้ำและการถอน/แก้รหัสจากเจ้าของแหล่งจริงก่อนmigration; ไม่ใช้nullable/unverifiedcodeทำให้คนหลายคนรวมกัน
3. ชื่อ วันเกิด และข้อมูลประกอบเป็นสัญญาณส่งให้ผู้ตรวจ ไม่เป็นmerge key คนชื่อเหมือนกันหรือไม่มีวันเกิดต้องอยู่เป็นคนแยกกันได้ ห้ามส่งวันเกิดให้roleทำเนียบเพื่อช่วยตรวจซ้ำ
4. การแจ้งซ้ำต่อผู้ไม่มีสิทธิ์อ่านคู่ต้องใช้ข้อความทั่วไปและช่องทางตรวจที่มีอำนาจ ไม่เปิดID/ชื่อ/รายละเอียดของคนที่ซ่อนอยู่เป็นoracle
5. การรวมรายการผิดต้องมีคำขอ/หลักฐาน/ผู้อนุมัติที่ไม่ใช่ผู้สร้าง ตรวจoptimisticversionและอำนาจปัจจุบัน ใช้transactionรักษาFK/ประวัติ/snapshot ไม่ลบPersonต้นฉบับหรือแก้เอกสารปีเก่าทับ ไม่implementmergeก่อนworkflowและกฎเจ้าของยืนยัน

## 7 แผนตรวจรับ — ทุกกรณี NOT RUN

| รหัส   | กรณี                                                       | ผลที่ต้องได้                                                                                                         |
| ------ | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| P13-01 | Personเดียวเชื่อมสังกัดA/Bและหน้าที่สองชนิด                | personcount1; หลายFKassignment/affiliation ไม่ติดunique(person_id)                                                   |
| P13-02 | เปลี่ยนชื่อด้วยhistory/evidenceแล้วค้นชื่อเดิม             | actorที่มีhistorygrantพบperson_idเดิม ชื่อปัจจุบันถูกวัน ไม่สร้างคนใหม่                                              |
| P13-03 | directory-onlyเรียกAPI/search/export/printรวมprivatefields | ไม่ได้birth_date/privateAddress/privatePhone/notes/hiddenname/contact/reference/evidence แม้ส่งinclude/body/queryเอง |
| P13-04 | คนชื่อและวันเกิดเหมือนกัน กับคนที่ไม่มีวันเกิด             | ไม่mergeอัตโนมัติ; reviewcaseให้เฉพาะผู้มีสิทธิ์                                                                     |
| P13-05 | retryเพิ่มรหัสที่VERIFIEDแล้ว/รหัสเดียวไปคนอื่น            | constraintและreceiptป้องกันซ้ำ; payloadต่างconflict; ไม่เปิดข้อมูลคนที่ไม่มีสิทธิ์                                   |
| P13-06 | scopeAอ่านคนที่มีสังกัดA/B และถูกถอนgrant                  | ไม่รั่วrelationshipB/privatefields; หลังถอนAPI/export/jobถูกปฏิเสธ                                                   |
| P13-07 | แก้ชื่อ/สังกัดแข่ง อนุมัติเอง หรือevidenceยังไม่scan       | conflict/deny ไม่มีทะเบียนมีผลหรือauditสำเร็จจากงานที่แพ้                                                            |

## 8 ขั้นตอนดำเนินต่อ

ปิดDB-06และตรวจfoundation12ตาม [DATABASE](DATABASE.md) / [FOUNDATION_ACCEPTANCE](FOUNDATION_ACCEPTANCE.md) ก่อนเพิ่มschemaบท13 เมื่อgateผ่านจึงสรุปแผนโค้ดและรับการอนุมัติตามMASTERข้อ2 ใช้migrationใหม่/seedสมมติและtestsnativeDB/DALจริง ไม่แก้migrationcoreเดิม ไม่เลื่อนไปบท14เพราะเอกสารผ่าน
