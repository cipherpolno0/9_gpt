# การค้นหาและการมองเห็นข้อมูลบุคคล — แบบเตรียมบท 15

รุ่นเอกสาร 0.1 | 3 ตุลาคม 2569 | **Proposal / BLOCKED — ไม่มีหน้าค้นหา, DTO, export หรือพื้นที่ของฉันที่ใช้งานได้**

บท15ต้องผ่านบท14ก่อน แต่14ยังเป็น [POSITION_RULES](POSITION_RULES.md) แบบเตรียมและติด13/foundation12 เอกสารนี้กำหนดสัญญาสำหรับ implementation หลังgateผ่าน ไม่ใช่โค้ดหรือผลตรวจรับ API/UI ทุกกรณีทดสอบท้ายเอกสารยัง NOT RUN

## 1 หลักการทีละขั้น

1. สิทธิ์มีทั้งระดับรายการและระดับช่องข้อมูล รู้PersonIDหรือมีสิทธิ์ดูทำเนียบไม่ได้แปลว่าอ่านเบอร์ส่วนตัว/ที่อยู่/เอกสารประจำตัวได้
2. serverเลือกข้อมูลที่ได้รับอนุญาตก่อนส่งให้browser ห้ามส่งPersonพร้อมprivate/relationshipทั้งหมดแล้วซ่อนด้วยCSSหรือJavaScript
3. หน้ารายการ รายละเอียด export และjobใช้policyต้นทางเดียวกัน exportมีactiongrantแยกและห้ามมีช่องกว้างกว่าที่ผู้ใช้ได้รับอนุญาต
4. เข้าสู่ระบบพิสูจน์บัญชี แต่ยังไม่พิสูจน์ว่าบัญชีนั้นเป็นPersonใด ต้องตรวจbindingอีกขั้น ไม่จับคู่ชื่อ/อีเมล/วันเกิดอัตโนมัติ

## 2 Field-level policy ที่เสนอ

ชั้นR/Hใน DATA_CLASSIFICATION core06ยังคงเดิม: PersonPrivate, PersonNameHistory, PersonContactและDocumentเป็นข้อมูลปิด ค่าระบุpubliceligibleหรือมีชื่อในทำเนียบไม่ลดclassification ต้องมีpolicy/allowlistและpurposeที่ยืนยันก่อนprojection

| กลุ่มฟิลด์                                                        | public / directory-only                                     | เจ้าของที่bindingผ่าน                                | เจ้าหน้าที่ภายใน                                                  |
| ----------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| ชื่อแสดงปัจจุบัน / labelหน้าที่ / labelสังกัด                     | เฉพาะprojectionที่รับรอง; directoryภายในต้องอยู่scopeด้วย   | read_selfตามfieldgrant                               | read_scopeตามscope/time/fieldgrant                                |
| ชื่อเดิม / ฉายา / ประวัติการศึกษา / ทุกสังกัดและหน้าที่           | ปิดdefault; ไม่ใช้hiddennameเป็นตัวค้นให้roleที่ไม่มีสิทธิ์ | เฉพาะข้อมูลตนที่purpose/grantอนุญาต                  | ต้องhistory/name/educationgrantและกรองrelationshipที่ได้รับอนุญาต |
| birth_date / private_phone / private_address_text / private_notes | ไม่ส่ง แม้clientขอinclude/fields/export                     | เฉพาะselfpurposeและfieldgrant ไม่ใช่ทุกช่องอัตโนมัติ | grantจำเพาะHตามหน้าที่/purpose ไม่ได้จากroleดูทำเนียบ             |
| รหัสอ้างอิงตัวตน / เอกสารประจำตัว                                 | ไม่ส่งid/objectkey/เลขเอกสารหรือURLที่เข้าถึงไฟล์ได้        | เฉพาะที่policyให้เจ้าของเข้าถึงและscan/ACLผ่าน       | verificationpurpose+field/filegrantที่รับรอง                      |
| เหตุผลเปลี่ยนสถานะ / หลักฐาน / audit                              | ไม่ส่งเหตุผลเต็มหรือraworder/audit                          | ข้อมูลคำขอตนตามgrantและปกปิดข้อมูลบุคคลที่สาม        | actionและpurposeเฉพาะ; evidenceตรวจACLปัจจุบัน                    |
| account binding / issuer-sub / session / secret                   | ไม่ส่ง                                                      | เฉพาะสถานะบัญชีขั้นต่ำที่จำเป็น ไม่มีtoken/secret    | ไม่ส่งsecretหรือชุดข้อมูลบัญชีเต็มผ่านpeopleAPI                   |

ไม่มีการกำหนดสิทธิ์Hให้roleใดจริงในรอบนี้ กฎทางการ/fieldallowlistอยู่Q008/Q025 และscope/หน้าที่อยู่Q002/Q006 ตำแหน่งPositionAssignmentไม่ให้websiteRoleAssignmentเอง

## 3 DTOและเส้นทางที่เสนอ — ยังไม่ได้สร้าง

PublicDirectoryDtoต่อสัญญาเดิมในDATA_CLASSIFICATION มีได้เฉพาะ:

| ช่อง                 | แหล่ง/เงื่อนไข                                                               |
| -------------------- | ---------------------------------------------------------------------------- |
| public_ref           | รหัสpublicationที่อนุญาต ไม่ใช่PersonID/DocumentIDดิบ และไม่ใช่หลักฐานสิทธิ์ |
| display_name_th      | ชื่อที่เจ้าของรับรองให้แสดงในpublicationรุ่นนั้น                             |
| public_role_label_th | labelหน้าที่ที่policyอนุญาตให้เผยแพร่                                        |
| affiliation_label_th | labelสังกัดที่รับรองการเปิดเผย                                               |

ห้ามcopyrawPerson/PersonPrivate/Contact/NameHistoryเข้าDTO public หากช่องยังไม่มีpolicyไม่สร้างpublicprojection ค่ารหัสทางการที่ยังTO_VERIFYไม่ถูกแสดงเป็นข้อมูลรับรอง ห้ามเติมฟิลด์privateด้วยnullเพื่อเผยโครงสร้างที่ไม่จำเป็น

InternalDirectoryDtoให้เฉพาะperson referenceที่จำเป็นสำหรับหน้ารายละเอียดกับdisplayfields/relationshipที่มีgrant InternalPersonDetailsเป็นprojectionของฟิลด์ที่มีaction+fieldgrantจริง ไม่ใช่Prismaobjectทั้งหมด แม้PersonเดียวมีสังกัดA/B เจ้าหน้าที่Aก็ไม่ได้relationshipB/privateทั้งชุด

| เส้นทางเสนอ               | สัญญา                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------ |
| /registry/people          | publicpublicationที่อนุมัติและมีผลเท่านั้น ไม่รับPersonIDดิบเป็นlookupสาธารณะ        |
| /app/people               | ค้นตามscopeและfieldgrantผ่านDAL                                                      |
| /app/people/[personId]    | ตรวจread_scope/read_selfใหม่ก่อนอ่านข้อมูล ไม่ใช้สิทธิ์จากการเข้าหน้ารายการครั้งก่อน |
| /app/me                   | หาPersonจากverifiedactivebindingของบัญชีในsessionฝั่งserver                          |
| people export service/job | ตรวจexportactionและใช้row/fieldpolicyต้นทางเดียวกับหน้าจอ                            |

เส้นทางทั้งหมดเป็นProposal ปัจจุบัน/appเป็นcatchall403 และไม่มีpeople/public/self/exportAPI บริการใหม่ต้องตรวจสิทธิ์ในRoute Handler/Server Action/serviceด้วย ไม่อาศัยcatchallหรือการซ่อนเมนูเพื่อให้APIใหม่ปลอดภัย

HTML/APIภายในใช้no-storeเป็นdefault และไม่ทำstaticgenerationหรือcacheร่วมผู้ใช้สำหรับข้อมูลprivate หากต้องcacheภายหลังต้องมีสัญญาแยกscope/ผู้ใช้/policyversionกับผลrevokeที่ทดสอบจริง ไม่ใช้public_refหรือURLยากเดาเป็นcacheACL

## 4 ตัวกรองและ pagination

| ตัวกรอง                       | แหล่งและเงื่อนไข                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| ชื่อ / ชื่อเดิม / ฉายา        | แยกชนิดการค้นและgrant; publicค้นเฉพาะpublishedname ไม่ค้นhiddenhistoryแล้วคืนPersonให้เดาความสัมพันธ์ชื่อเดิม |
| ตำแหน่ง / ระดับพื้นที่ / แผนก | PositionType/PositionAssignment/masterที่รับรองจาก14; unknowncodeปฏิเสธ ไม่ตีความlabelเป็นgrant               |
| สังกัด                        | Organization/AffiliationHistoryที่ได้รับสิทธิ์ในวันอ้างอิง; org_idจากclientเป็นตัวกรอง ไม่ใช่ขอบเขตที่อนุญาต  |
| สถานะ                         | personstate/สถานะบรรพชิตหรือคฤหัสถ์และassignmentstatusแยกชนิดชัดเจน ไม่เอาสถานะคำขอเป็นสถานะทะเบียน           |
| วันที่อ้างอิง                 | effective_dateตามวันไทยและknown_atตามpolicyประวัติ14; storeddateค.ศ. UIแสดงพ.ศ.; inputกำกวมต้องแจ้งerror      |

servervalidateชนิด/ความยาว/code/sort/pageก่อนquery ใช้parameterizedqueryผ่านDAL จำกัดfilter/sortจากregistry ห้ามรับชื่อcolumn/model/SQL/includeจากclient ข้อเสนอDEMOคือpagesize25/max100แบบconfiguration ไม่ใช่ข้อรับรองประสิทธิภาพหรือค่าทางการ

ลำดับ query ที่ต้องรักษา: currentaccount/action/scope/time → กรองrowและrelationshipที่อนุญาต → เงื่อนไขค้นที่fieldgrantให้ใช้ → dedupePerson → stableorder/tiebreak → pagination/countเฉพาะผลที่ได้รับอนุญาต → projection ของช่องที่อนุญาต count/facets/autocompleteต้องไม่บอกจำนวนหรือชื่อของคนที่ซ่อนอยู่

ตัวกรองตำแหน่ง/ระดับ/แผนก/หน่วยปฏิบัติต้องmatchassignmentเดียวกัน ไม่ให้ตำแหน่งจากassignmentAกับแผนกจากassignmentBทำให้ผ่านโดยไม่ตั้งใจ ส่วนตัวกรองสังกัดจากAffiliationHistoryต้องระบุsemanticsในUIว่าค้นความสัมพันธ์สังกัดหรือหน่วยของตำแหน่ง ไม่รวมข้อมูลจากคนละสายโดยไม่ชัดเจน

คนหนึ่งมีหลายassignmentให้แสดงPersonครั้งเดียวและเฉพาะrelationshipที่ผ่านscope/filters paginationไม่ทำหลังincludeข้อมูลprivate/หน่วยทั้งหมด Cursorหรือลิงก์หน้าถัดไปต้องvalidateและผูกกับquery/scope/policy/sessionปัจจุบัน ห้ามแก้cursorแล้วข้ามrowpolicy เปลี่ยนfilterให้กลับหน้าแรก

query/ประวัติคนที่ไม่อยู่scopeต้องไม่หลุดจากURL/body/query/fields/cursor/export สำหรับresourceที่ไม่มีสิทธิ์ให้ใช้responseที่ไม่เผยรายละเอียดหรือการมีอยู่ของคนที่ซ่อนตามerrorpolicyกลาง ไม่แสดงชื่อ/พื้นที่ของเป้าหมายในข้อความปฏิเสธ

## 5 พื้นที่ของฉันและการยืนยันตัวตน

1. ใช้บัญชีAuth/OIDCกลางจาก08 ไม่สร้างloginระบบpeopleหรือเก็บpasswordเอง การมีprovideremailที่verifiedไม่เพียงพอให้ผูกPersonอัตโนมัติ
2. บัญชียังไม่bindingแสดงข้อความ “ยังไม่เชื่อมทะเบียนบุคคล” และขั้นตอนยื่นตรวจตัวตน ไม่เปิดread_selfผ่านPersonIDที่clientเลือกเอง และไม่สร้างPersonใหม่เพียงเพราะสมัครบัญชี
3. ตรวจหลักฐานตามpolicyเจ้าของที่ยืนยัน โดยเฉพาะผู้เรียนหรือคนที่ไม่มีบัญชีมาก่อน หลักฐานอยู่private/quarantine/scan/ACLของ10 การจับคู่ใช้รหัสอ้างอิงที่ตรวจแล้วตาม13 ชื่อ/อีเมล/วันเกิดเป็นเพียงข้อมูลให้ผู้มีอำนาจตรวจ ไม่เป็นidentityproofหรือmergekey
4. บันทึกbindingrequest/ผู้ตรวจ/เหตุผล/หลักฐาน/version/correlationผ่านworkflow/auditกลาง ผู้ร้องไม่อนุมัติbindingตนเอง ไม่ใช้กลไกpasswordresetหรือclientJWTclaimsเป็นใบอนุญาตเชื่อมPerson
5. สัญญาonePersonต่อaccountและoneactiveaccountต่อPersonเป็นProposalตามlogicaldictionary04/Q023 ต้องบังคับconstraint/transactionเมื่อรับรองและมีschemaจริง รองรับแก้binding/recoveryที่ตรวจหลักฐาน ไม่เปลี่ยนOIDCissuer-subเพื่อย้ายสิทธิ์หรือสร้างบัญชีซ้ำหลบconstraint
6. read_selfอ่านactiveverifiedbindingจากserverทุกครั้ง หากระงับ/revoke/bindingถูกยุติ denyAPI/export/jobซ้ำตามสิทธิ์ปัจจุบัน ไม่ถือsessionเก่าหรือPersonIDในformเป็นbindingที่ใช้ได้
7. การเสนอแก้ข้อมูลเป็นคำขอ draft/submittedผ่านworkflowกับโมดูลpeople ไม่เขียนทะเบียนมีผลทันที แสดงข้อมูลปัจจุบันแยกคำขอที่รอตรวจ มีexpectedversion/idempotency ผู้สร้างห้ามอนุมัติคำขอตนเอง

บัญชีผู้เรียนกับทะเบียนPerson/Enrollment/Applicationยังใช้ต้นทางเดียว ไม่เริ่มทะเบียนผู้เรียนหรือใบสมัครใหม่ในบท15 กระบวนการตรวจตัวตนจริงยังQ023/Q025 ข้อมูลDEMOเท่านั้นเมื่อทดลอง

## 6 Export, audit และการเก็บ log

exportต้องมีexportactionเพิ่มจากread ใช้policyลดช่องให้น้อยเท่าที่จำเป็น ไม่เพิ่มเอกสารประจำตัว/contact/historyเพียงเพราะformatเป็นExcel ผู้ใช้ส่งfields/include/org_id/date/cursorเพื่อข้ามgrantไม่ได้

สำหรับjobตรวจผู้ริเริ่มบัญชี/action/scope/time/fieldpolicyปัจจุบันก่อนเริ่มและแต่ละชุดงาน ก่อนส่งมอบตรวจสิทธิ์ใหม่อีกครั้ง หากข้อมูลในไฟล์กว้างกว่าสิทธิ์ล่าสุดให้denyและสร้างใหม่ตามpolicy ไม่ส่งไฟล์เก่าที่รั่วส่วนถอนสิทธิ์แล้ว ไฟล์exportอยู่documentstorageprivateกลางและผ่านgateway/ACLปัจจุบัน ไม่อยู่publicfolder/staticbuild

เอกสารที่ต้องrevokeทันทีใช้gatewayที่ตรวจทุกrequest ไม่อ้างว่าลิงก์signedที่ออกแล้วเพิกถอนได้ทันที และไม่อ้างว่าถอนข้อมูลที่ผู้ใช้ดาวน์โหลดสำเร็จไปแล้วได้ ไฟล์หรือartifactแต่ละรุ่นต้องผูกผู้ร้อง/querysnapshot/policyversion/hashและretentionที่รับรอง ไม่สร้างตารางเอกสารอีกชุด

ข้อมูลข้อความในspreadsheetต้องเป็นtextตามpolicy ไม่ให้ทำงานเป็นformulaจากinputผู้ใช้ ต้องทดสอบค่าทดลองที่ดูเหมือนformula/markup ไม่อ้างว่ามีexportencoderหรือExcelJSversionที่ใช้งานแล้วในบทนี้

การอ่านH/ดูเอกสาร/ส่งออกและการอ่านที่policyกำหนดต้องauditขั้นต่ำตามconfigurationที่รับรอง ใช้audit_logs/serviceกลาง พร้อมactor reference, action/resource reference, purpose, policyversion, เวลา, correlation, จำนวนที่ได้รับอนุญาต และoutcome ไม่copyผลค้นทั้งหมดลงlog

ห้ามlograwชื่อผู้ค้นหรือชื่อที่ใช้ค้น วันเกิด อีเมล/เบอร์/ที่อยู่ privatepayload เอกสารเต็ม URLquerystring/POSTbody token/cursor/signedURLหรือsecret บันทึกเพียงชื่อชนิดfilter/สถานะคำสั่ง ไม่บันทึกค่าคำค้น แม้เป็นDEMOก็ใช้logpolicyเดียวกัน ต้องตรวจapplication/proxy/workerlogsที่ควบคุมได้ก่อนเปิดจริง ไม่รับรองlogproviderที่ยังไม่ตั้งค่า

## 7 Keyboard, labels และข้อความสถานะ

หน้าค้นหาที่เสนอใช้form/input/select/buttonจริง มีlabelภาษาไทยแยกชื่อ/ชื่อเดิม/ฉายาและวันที่อ้างอิง Tab/Shift+Tab/Enterใช้งานได้ ไม่มีkeyboardtrap ไม่submitระหว่างพิมพ์ภาษาไทยด้วยIMEโดยไม่ตั้งใจ focusเห็นชัดและไม่ถูกย้ายทุกkeystroke

เมื่อsubmitหรือเปลี่ยนpageให้จัดfocusและประกาศสถานะผลด้วยข้อความที่มีชื่อบริบท/จำนวนที่อนุญาต เมื่อloadingใช้ข้อความกำลังค้นหา/aria-busy ผลจากrequestเก่าต้องไม่ทับfilterล่าสุด ตารางมีcaption/header รายละเอียดคนเป็นlinkหรือbuttonที่มีชื่อชัดเจน paginationระบุหน้าปัจจุบัน/ก่อนหน้า/ถัดไป

Empty stateเสนอ: “ไม่พบข้อมูลในขอบเขตที่คุณมีสิทธิ์ ลองตรวจการสะกด เปลี่ยนวันที่อ้างอิง หรือล้างตัวกรอง” พร้อมปุ่มล้างตัวกรอง ไม่บอกว่าพบคนซ่อนอยู่นอกพื้นที่ Invalidfilter/dateมีข้อความแก้ไขผูกกับinput ไม่ใช้สีอย่างเดียว และไม่แสดงemptyแทนerror403หรือบริการล้มเหลวโดยไม่อธิบาย

สถานะmyareaแยกยังไม่binding/กำลังตรวจbinding/เชื่อมแล้ว/คำขอแก้ไขรอตรวจ ไม่แสดงprivateข้อมูลก่อนbindingผ่าน ข้อความและa11yทั้งหมดเป็นแบบเตรียม ยังไม่มีHTML/browsertest15

## 8 แผนตรวจรับ — ทุกกรณี NOT RUN

| รหัส   | การทดสอบ                                                                         | ผลที่ต้องได้เมื่อimplementแล้ว                                                         |
| ------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| P15-01 | ผู้ใช้Aเปลี่ยนPersonIDในURL/body/query/detail/exportเป็นคนB                      | denyโดยDALทุกช่อง ไม่ส่งprivate/relationship/count/facetของB                           |
| P15-02 | directory-onlyขอfields/includeเอกสารประจำตัว/โทร/ที่อยู่/เหตุผลในpage/API/export | responsekeysetอยู่ในallowlist ไม่มีhiddenvalues/keys/fileobjectkeys                    |
| P15-03 | publicค้นhiddenoldname/ฉายาและrawPersonID; ตรวจHTML/RSC/cache/assets             | ไม่มีexistenceoracleหรือprivatecanary; public_refอ้างเฉพาะpublicationที่รับรอง         |
| P15-04 | บุคคลสังกัดA/Bและfilterหลายassignment รวมpagination/tamperedcursor               | Personไม่ซ้ำ; ไม่รั่วB; matchtupleถูกassignment; count/pageเฉพาะauthorizedrows         |
| P15-05 | ผู้เรียนยังไม่bindingแก้person_idในselfAPI แล้วอ้างชื่อ/อีเมลตรงคนอื่น           | read_selfdeny ไม่bind/สร้างPersonอัตโนมัติ; bindingreviewมีmakerchecker                |
| P15-06 | verifiedbindingถูกยุติ/sessionrevoke/ระงับaccountก่อนAPI/job/download            | denyตามสิทธิ์ปัจจุบัน; artifactกว้างกว่าสิทธิ์ล่าสุดส่งไม่ได้                          |
| P15-07 | เจ้าของเสนอแก้ซ้ำ/ข้อมูลเปลี่ยนระหว่างตรวจ                                       | คำขอเดียว/receiptเดิม หรือconflict; ทะเบียนยังไม่เปลี่ยนก่อนapproved/effective         |
| P15-08 | keyboardค้นชื่อไทย/IME/หลายfilters/date/page/reset/empty/error                   | label/focus/Tab/Enter/statusใช้งานได้จริง; ข้อความชี้วิธีแก้; ไม่มีtrapหรือstaleresult |
| P15-09 | exportfieldpolicyเทียบหน้าจอ/ข้อความเหมือนformula/markup                         | fieldsไม่กว้างกว่าที่อนุญาต ข้อความไม่ถูกรันเป็นformula/markup                         |
| P15-10 | ใช้คำค้นDEMOและprivatecanary ตรวจapplication/proxy/worker/auditlogs              | มีread/exporteventที่policyกำหนด แต่ไม่มีrawชื่อ/ค้น/body/secret/cursor/filecontent    |

## 9 Gateและขั้นตอนต่อไป

sourceที่ตรวจครั้งนี้คือaa94891 coreยัง0.6.0/Prisma7.10.0/migration1 ไม่มีPositionAssignment/authz/account/verifiedbinding/peoplequery/exportservices บท14และfoundation12ยังBLOCKED `/app`denyallไม่พิสูจน์scopeA/Bหลังlogin

ปิดDB-06ตาม [DATABASE](DATABASE.md), ตรวจครบfoundation12และimplementation13/14ก่อนเพิ่ม15 ก่อนเขียนโค้ดต้องมีแผนและการอนุมัติตามMASTERข้อ2 Q002/Q006/Q008/Q023/Q025ต้องหลักฐานscope/fieldpolicy/identitybinding/publicationและretention ไม่มีการใช้ผลตรวจเอกสารแทนเกณฑ์URL/export/keyboard และไม่เลื่อนไปบท16
