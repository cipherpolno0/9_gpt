# เอกสารร่วม ผู้เกี่ยวข้องและสิทธิ์หนังสือ — บท 53

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | source `243c234` | **Proposal / BLOCKED — ไม่มีบริการFileVersion/ACL/record resolverจริง**

ใช้ [RECORDS_REGISTER_POLICY](RECORDS_REGISTER_POLICY.md), [E_OFFICE_SCHEMA](E_OFFICE_SCHEMA.md), [PERMISSIONS](PERMISSIONS.md) และDocumentกลางเดิม ไม่สร้างbucket/upload/loginแยกในสารบรรณ หนังสือ/เลขลงทะเบียนไม่เพิ่มอำนาจบุคคล/เงิน/พัสดุ/ผลสอบเมื่ออ้างsource และไม่อ้างว่าพร้อมใช้Documentที่ยังMETADATA_ONLY

## 1 Link ไม่ใช่ grant

RecordFileReferenceเก็บDocument IDกับFileVersion ID/hash/version/purposeที่ตรงกัน ผ่านcompositeFKกับเอกสารกลาง ตรวจชนิดไฟล์/scan/currentCLEAN/currentACL/size/hashจากบริการ10 ไม่เชื่อbucket/objectkey/hashที่clientส่งเอง unknown/pending/rejected/revoked → deny

ไฟล์V1ที่ตรึงไว้ในRecordVersion1และsourceรุ่นเดิมยังเป็นV1 เมื่อDocumentมีV2ไม่ไล่เปลี่ยนทุกlinkเอง RecordVersion2จึงอ้างV2ได้หลังreview ใหม่ ไม่copybinaryหรือสร้างDocumentใหม่เพียงเพราะระบบ6/7/5เพิ่มreference Dedupeไฟล์ตามhashอย่างเดียวข้ามtenantไม่เป็นgrant/identitymerge ต้องsharedDocumentจริงพร้อมexplicitsharingpolicy ไม่revealfilesของอีกหน่วย

| ช่องทาง/ทรัพยากร                                           | เงื่อนไขอ่านหรือทำรายการ                                                                                                                   |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| หนังสือ/รุ่น/เลข/หัวเรื่อง/ผู้เกี่ยวข้อง                   | currentaccount + action grant + assignedorg/recordscope + time/delegation + record/version ACL + fieldpolicy + currentconfidentialityfloor |
| primary/attachment preview/download/print                  | เงื่อนไขrecordทั้งหมด AND Document/FileVersion action ACL AND currentCLEAN/hash/sourcebinding; view permissionไม่เป็นdownload/print        |
| businessreferenceจากคน/คำขอ/งบ/พัสดุ/สอบ                   | record access AND source module action/scope/fieldpolicy; resolverคืนเฉพาะauthorized summary ไม่เปิดsourceผ่านชื่อหรือเลข                  |
| เปิดrecordจากหน้าsource                                    | source page access AND destinationrecord/currentFileACL; รู้source IDหรือfileIDไม่เป็นสิทธิ์record                                         |
| search/fulltext/list/total/snippet/export/job/notification | apply resource predicatesเดียวกันก่อนcount/limit/return; workerตรวจcurrentauthorityทุกขั้น ไม่index/ส่งtitleหรือrosterโดยไม่มีACL          |

DocumentACLไม่ใช่unionกับrecordACL ผู้มีสิทธิ์filesแต่ไม่มีrecordอาจเข้าถึงไฟล์ผ่านsourceอื่นที่ได้รับสิทธิ์ได้ตามpolicyของsourceนั้น แต่ไม่เห็นเลข/หัวเรื่อง/ผู้รับของrecord ช่องทางrecordต้องทั้งสองACL ไม่อ้างว่าจะเรียกคืนสำเนาที่ดาวน์โหลดแล้วได้

## 2 Recipients และความลับ

ผู้รับใช้Person/Organizationกลางกับverifiedaccount-person binding ไม่ใช้ชื่อเหมือนเพื่อเลือกคนหรือautocreateผู้ใช้ RecipientSnapshotตรึงชื่อ/บทบาท/หน่วย/ที่อยู่เฉพาะที่มีสิทธิ์และหลักฐาน ณ รุ่นที่ลงทะเบียน แต่recipientidentityไม่อนุมัติgrantเอง ต้องexplicitRecordAccessPolicyที่ได้รับอำนาจ แยกpersonrecipientกับorgrecipientและผู้ที่รับแทนorgภายหลังตามpolicy ยังไม่สร้างdispatch/ackใน53

ผู้รับต่างหน่วยงานเปิดได้เฉพาะexplicitrecord scopeที่อนุมัติพร้อมfileactionACLและclearance/purpose ไม่ให้ทั้งorgต้นทางหรือfilesรุ่นอื่น ไม่เลือกผู้รับแทนจากชื่อฝ่ายหรือการย้ายตำแหน่งเอง บุคลากรย้าย/หมดมอบหมายต้องrevokeตามprotocolปัจจุบัน oldsnapshotไม่คืนสิทธิ์ก่อนหน้า

Priorityconfigมีเพียงลำดับเร่งด่วน Confidentialityconfigกำหนดclassificationที่O08/C03ยืนยัน การปรับPriorityหรือDueDateไม่เปลี่ยนclassification/ACL การลดชั้นความลับ/เพิ่มผู้รับ/เปิดpublicเป็นสาระสำคัญต้องreviewและคำอนุมัติใหม่ เก็บversionก่อนหน้า การเพิ่มชั้นต้องcurrentsecurityfloorปิดช่องอ่านรุ่นเก่าด้วยgrantที่ไม่พอ ไม่ใช้immutableoldACLเปิดหลบชั้นปัจจุบัน

## 3 DueDate และประวัติ

เลือกDATEสำหรับเสร็จภายในวันหรือTIMESTAMPเมื่อมีเวลาที่นโยบายกำหนด ตรึงcalendar/timezone/ที่มาวันนัด/target/purposeในRecordVersion เปลี่ยนวันสร้างrevision/เหตุผล ไม่เปลี่ยนdueเพราะแก้ชื่อpriority ไม่ผูกdeadlineกับFiscalYearหรือAcademicYear เลขวันที่จากbrowserไม่ปลดscope/registration/closedperiod

Historicalviewแสดงsubject/recipients/files/formattednumberที่ตรึงตามvalid-knownและcurrentfieldpolicy RegisterednumberVOIDไม่ลบhistory/title/evidenceหรือsourceอื่นที่ใช้อยู่ หากlegalretention/redactionกำหนดต้องauthorizedcentralprocess/evidence ไม่ใช้VOIDหรือsoftinactiveเป็นการล้างaudit/คืนเลข

## 4 Failure และหลักฐานตรวจรับ

Confused-deputyกรณีเปลี่ยนDocumentID/FileVersionID/RecordID/recipient/source_id/owner/counterจากURL/bodyต้องserver/nativeFK/currentACLdeny ไม่ตรวจแค่หน้าจอ roletechnicalไม่secretreader/approver automatic makerchecker/delegationตามworkflow11 ผู้สร้างห้ามอนุมัติการเผยแพร่หรือgrantสำคัญเอง

Error403สำหรับactionไม่มีสิทธิ์/404เมื่อresourceถูกซ่อนตามPERMISSIONS ไม่เปิดsubject/recipient/เลขcounterหรือขนาดไฟล์จากข้อความerror/total/result timingที่เกิดการค้นไม่ตรวจscope Auditเก็บactor/action/opaqueIDs/changedfields/policy/decision/เวลา/reason-code/evidenceref/correlation ไม่rawsecret/fulltext/recipientcontacts/reasonส่วนตัวเต็มชุด ถ้าbusinessreasonละเอียดให้อยู่privatefieldที่policyควบคุม

API/HTML/JavaScript/cache/staticassets/exports/fulltextต้องไม่เผยtitle/PII/secret/ACL/objectkeyที่deny Privatefilesผ่านcentralgatewayตรวจcurrentgrantก่อนpreview/generate/download worker/outbox devsinkไม่มีข้อมูลลับเต็มชุด expire URLไม่ได้พิสูจน์revokeทันที ต้องprotocol10และtestsจริง

P53-12–18/20ใน [policy](RECORDS_REGISTER_POLICY.md) ทั้งหมดNOT RUN [fixture53](fixtures/records-register-53-plan.json)มีaccessmatrixสมมติ ไม่มีACL/grants/scan/signature/file-sharingจริง ยังไม่มีschema/Documentbinarycopyหรือsendpipelineใหม่ ไม่เริ่ม54และไม่รับรองระเบียบสารบรรณที่ยังTO VERIFY
