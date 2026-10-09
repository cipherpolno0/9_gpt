# Controlled disclosure และ private preview — บท 56

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | source `c82341c` | **Proposal / BLOCKED — ไม่มีการเปิดเผย/preview/cache headers ที่ตรวจจริง**

เชื่อม [RECORD_ACCESS_CONTROL](RECORD_ACCESS_CONTROL.md), [RECORDS_RETENTION](RECORDS_RETENTION.md), [preview54](RECORD_PREVIEW_SECURITY.md) และ [เอกสารกลาง53](RECORD_DOCUMENT_ACCESS.md) ใช้Document/FileVersion/sharedworkflowเดิม ไม่ลดclassหรือเปิดไฟล์เพราะมีlink/task/admin

## 1 Disclosure ที่มีอำนาจและรุ่น

เสนอ requestที่pinrecord/source/file versions + purpose + exactrecipient/targetcontext + fieldallowlist + desiredrepresentation + redactionrules/templatepolicy + effectivewindow + authority/evidence ผ่านworkflow11/approval54 เมื่อเพิ่มผู้รับ/ลดชั้น/เปลี่ยนเนื้อหาต้องreviewใหม่ maker/ผู้สร้างredactedartifactไม่approveเอง technicalroleไม่override

Unknownfield/unknownpurpose/unknownofficialauthorityให้denyค่าเริ่มต้น ไม่ส่งDTOเต็มแล้วให้browserซ่อน ControlledDisclosureBindingต้องได้รับsourceowner permissionสำหรับfield/representationนั้นอย่างชัดเจน ถ้าผู้รับไม่ได้originalreadแต่มีapprovedlimiteddisclosureอาจอ่านเฉพาะrepresentationนั้นตามpolicyครบ ไม่เป็นORfallbackเมื่อ sourceห้ามdisclosureและไม่เพิ่มoriginalfile/record grants Floorของrepresentationที่อนุมัติต้องกำหนดโดยsourcepolicyอย่างชัดเจนแยกจากoriginal; ถ้าต้นทางยังห้ามเปิดตามชั้นปัจจุบันให้deny ไม่ใช้disclosurebindingลดชั้นเอง

หากต้องredactไฟล์ ให้centralservice10สร้าง FileVersion/derivativeใหม่ที่มีparent provenance/reviewedoutputhash/fieldpolicyและCLEANตามpolicy ไม่overwriteoriginal/approvedfileเดิม การปิดข้อความด้วยCSS/สี่เหลี่ยมทับPDF/ซ่อนlayerไม่พิสูจน์ลบข้อมูล ต้องตรวจ hiddentext/metadata/EXIF/embeddedfiles/annotations/OCR/alt/accessibility treeและbytesจริงก่อนapprovedpurpose ตรวจไม่มีcontentหลงเหลือตามpolicy

Holdรักษาoriginalevidenceไว้private และต้องpolicyอนุญาตderivative/การใช้งาน ไม่ลบหรือrewriteoriginalที่heldเพื่อทำpublic เมื่อderivedrepresentationเปลี่ยนต้องapprovedsnapshot/recipient/manifestใหม่ตาม54/55 ไม่ฝังoriginal URLs/objectkeys/filenames/contactส่วนตัวในเผยแพร่ limiteddisclosureไม่สร้างpublicreleaseเอง

## 2 Preview metadata และทุกช่องทาง

Currentrecord/version/recipient/classification/source/file/fieldpurpose ตรวจทั้งscreen/HTML/RSC/API/JS/bootstrap/print/PDFsave/export/search/snippet/thumbnail/HEAD/Range/304/download/notificationและworker Notauthorizedคืนgenericdenyโดยไม่metadataเช่นsubject/filename/bytecount/sourceorder/effectivehold reason Explicit redacteddisclosureแสดงallowlistedfieldsเท่านั้น original hiddenกับderivative permittedเป็นคนละrepresentation ไม่ให้downloadoriginalจากปุ่มexport

ปิดunfurl/openGraph/publicrobots/staticassets/thirdparty preview fetchของหนังสือprivate ไม่ใช้secret URLเป็นACL Cache entryถ้าจำเป็นตามpolicyต้องpartitionจากcurrentauthorized representation/policy/actor context/revocation epoch แต่ unknownความสามารถinvalidateให้no-storeและปิดsharedcache ไม่มีsignedURL/privateURLในpublicDTO ต้องcentralgatewaycurrentrights อายุURLหมดไม่ยืนยันrevokeทันทีและเรียกคืนcopyที่ผู้ดาวน์โหลดไปแล้วไม่ได้

## 3 Cache boundary ที่เสนอ

อ้างมาตรฐาน [RFC9111 §5.2.2.5](https://www.rfc-editor.org/rfc/rfc9111.html#section-5.2.2.5) และ [§5.2.2.7](https://www.rfc-editor.org/rfc/rfc9111.html#section-5.2.2.7): `private` ควบคุมsharedcache แต่ไม่ได้ห้ามprivatecacheเก็บ ส่วน `no-store` ห้ามcacheจัดเก็บresponseตามมาตรฐาน ทั้งคู่ไม่แทนauthorizationหรือรับประกันความเป็นส่วนตัวจากclientที่ไม่ทำตาม ไม่มีการอ้างheaderเท่านั้นปลอดภัย

เสนอbaseline `Cache-Control: private, no-store` สำหรับprivateletter/search/preview/export/errorที่มีprivatecontext และ route dynamic/privateตามNextรุ่นในrepository ต้องตรวจlocalframeworkdocsก่อนเขียนcode Headersของauth/session/RSC/stream/download/thumbnail/CDN/304/HEAD/Rangeต้องตรวจจริง ไม่static/ISR/RSCprefetchหรือapp serviceworker/offlinecacheหนังสือprivateที่policyไม่อนุญาต `Vary`/URLUUIDอย่างเดียวไม่เพิ่มสิทธิ์

Browserback/forward/restore/logout/expiredsession/openmultipleaccounts/ไฟล์saveแล้วเป็นขอบเขตที่ต้องทดสอบ เอกสารไม่อ้างว่าno-storeทำให้copyเก่าหายหรือbrowserbfcacheทุกตัวปิด การinvalidateknownservercache/index/derivativeต้องoutboxที่retry-safeและcurrentgrantcheckก่อนคืนเสมอ

## 4 สัญญา action/worker และหลักฐาน

เสนอ `authorizeRecordRepresentation`, `readAuthorizedSearch`, `resolveAuthorizedSourceLink`, `requestDisclosure`, `reviewDisclosure`, `generateApprovedDerivative`, `previewApprovedRepresentation` ทั้งหมดเรียกDAL/currentfilesและworkflowกลาง มีtypedrefs/expectedrevision/operationreceipt/currentpolicy/evidence/leasefenceตาม07/10/11/54 Inputsไม่มีroles/orgscope/SQL/rawHTML/objectkeyจากclientที่ใช้เป็นgrant

Holdและdestruction UIต้องแสดงpolicyversion/วันที่server/เหตุผลขั้นต่ำ/รอบตรวจ/targetcountที่actorอ่านได้ พร้อม Thai labels/keyboard/conflict/empty/loading/375-768-1024-1440 ผู้ไม่มีสิทธิ์case metadataไม่เห็นhold existence/reasonหรือรายการไฟล์ ไม่publictrackingapprovalstateที่นำไปเดาหนังสือส่วนตัว

P56-03–10/24 **NOT RUN** ไม่มีheaders/derivative/rendering/fulltext/nativeACL/API/browserproof ผู้รับผิดชอบC03/O08/sourceownersยังต้องยืนยันfieldpolicies/license/purpose/source/retention/authorities หลักฐานทางซอฟต์แวร์ไม่แทนคำวินิจฉัยกฎหมาย ไม่มีactualpublicdisclosureหรือการทำลายจริง ไม่เริ่ม57
