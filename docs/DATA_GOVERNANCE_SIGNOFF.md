# Data governance และแบบรับรอง — บท 70

รุ่น 0.1 | 9 ตุลาคม 2569 | baseline `dcf9447` | **NEEDS_LEGAL_REVIEW / UNSIGNED**

เอกสารนี้เป็น inventory และแบบเสนอให้ผู้รับผิดชอบตรวจ ไม่มีคำวินิจฉัยฐานการประมวลผล อำนาจอนุมัติ ระยะเก็บ หรือการแต่งตั้งผู้ตัดสินจริง C03 คือหน้าที่ด้านนโยบาย/กฎหมายตาม Project Charter ต้องให้ C01 ยืนยันผู้ได้รับแต่งตั้งก่อนรับรอง ไม่เลือก consent ให้ทุกกิจกรรมและไม่ใช้ผล scanner เป็นการผ่านกฎหมาย

## สถานะข้อกำหนด

| สถานะ                          | สิ่งที่กำหนด                                                                                                                                     | ผลต่อการทดลอง/ใช้จริง                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Confirmed จากผู้ใช้            | เว็บไซต์/บัญชี/ทะเบียน/เอกสารกลางชุดเดียว; serverdenydefault; maker-checker; devสมมติ; แยกeffective/recorded, practice/official, academic/fiscal | ทดสอบได้ด้วยข้อมูลสมมติ เมื่อบริการนั้นมีจริง; ไม่สร้างทะเบียนshadowเพื่อให้ผ่าน                                   |
| Confirmed จากผู้ใช้            | publicไม่ออกเลขประชาชน วันเกิด ที่อยู่ส่วนตัว เบอร์ส่วนตัว; filetype/scan/ACL; nosecretlog                                                       | เป็นข้อห้ามขั้นต่ำ ไม่ทำให้ฟิลด์ที่เหลือเผยแพร่ได้อัตโนมัติ                                                        |
| Proposal                       | purpose/field classification/retention workflow/feature gates/release severity ที่ระบุในบทนี้                                                    | ยังไม่มีruntimefeaturegateimplementationใหม่ ไม่ใช้เป็นนโยบายหน่วยงานที่รับรองแล้ว                                 |
| Needs Legal Review / TO VERIFY | ฐานการประมวลผลแต่ละpurpose/ข้อมูลผู้เยาว์/นัยศาสนา/ผู้รับและprocessor/ข้ามประเทศ/retention/hold/สิทธิ์เจ้าของข้อมูล/ผลสอบสาธารณะ/อำนาจ/แบบทางการ | ปิดการใช้ข้อมูลจริงหรือเผยแพร่เฉพาะส่วนที่เกี่ยวข้องจนมีdecision/evidenceและผ่านruntimeproof; ไม่ปิดงานTESTทั้งหมด |

## Data inventory ของสิ่งที่มีใน schema จริง

รายการนี้ใช้ model/field ของ core0.6.0 ไม่อ้างว่ามีข้อมูลจริงหรือruntimebusinessแล้ว ทุกแถวมี legal basis และ retention duration **ยังไม่กำหนด** (NULL/Needs Legal Review) Current visibility = private schema ที่ไม่มีallowpolicy/public DTO; native deployment/runtimelimitedroleยังไม่ได้พิสูจน์ เก็บ purpose เพื่อส่งให้ผู้ตัดสินตรวจ ไม่ถือว่าการเขียนpurposeเองทำให้ประมวลผลชอบด้วยกฎหมาย

| รหัส   | model / fields ตัวอย่าง                                                                                                                | purpose เสนอ / ผู้เกี่ยวข้อง                            | visibility และ owner เสนอ                                                         | retention/สิทธิ์/hold ที่ต้องตัดสิน                                                                        |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| D70-01 | ServiceActor: actorCode,labelTh,isActive                                                                                               | provenance localtools;ผู้กระทำงานระบบ ไม่ใช่UserAccount | internal; C02/C03;ไม่ใช้settingactorเป็นAuth                                      | อายุidentifier/ผูกaudit/การหยุดactor;ไม่ลบประวัติธุรกรรม                                                   |
| D70-02 | ReferenceCode,OrganizationType,Geography,ExamType,ExamLevel: code,labelTh,verificationStatus,parent/exam refs                          | mastercatalog/การอ้างระดับพื้นที่/ชนิดสอบ               | currentlyprivate; O02/O05;publicเฉพาะรุ่นที่ยืนยันภายหลัง                         | archiveรุ่น/แทนcode/retentionหลักฐาน;TO_VERIFYยังไม่official                                               |
| D70-03 | Organization,OrganizationNameHistory,AddressVersion,OrganizationContact: codes/status/name/address/contact,effective/recorded/evidence | ทะเบียนหน่วยและประวัติการติดต่อ;บางcontactอาจเป็นบุคคล  | scopedstaff; O02+C03;publiceligibleflagไม่permission                              | purposeแต่ละcontact/ที่อยู่, historicalcorrection,แยกorgaddressจากprivateperson                            |
| D70-04 | Person,PersonNameHistory: personCode,state,identityReview,givenName,familyName,formername/evidence/version                             | ทะเบียนคนและชื่อ ณ วันเกิดรายการ;คณะสงฆ์/ฝ่ายการศึกษา   | restricted; O01+C03;ชื่อไม่publicอัตโนมัติ                                        | แก้ด้วยsupersession/amendment คงเหตุผลและรุ่นเดิมตามpolicy ไม่แก้snapshotปีเก่าเงียบ                       |
| D70-05 | PersonPrivate,PersonContact: birthDate,privateAddressText,privatePhone,privateNotes,contactValue,isPublicEligible                      | ติดต่อ/ตรวจข้อมูลจำเป็นของเจ้าของข้อมูล                 | restricted; O01+C03;birth/address/phoneไม่public;free textต้องลดข้อมูลเกินpurpose | อายุข้อมูลส่วนตัวแยกaudit/hold;identityproofของสิทธิ์ไม่บังคับThaiIDทุกคน;ไม่ถือว่าคอลัมน์แยกคือencryption |
| D70-06 | AcademicYear,FiscalYear: yearCode,labelYearCe,startsOn,endsOn,policyVersionId                                                          | ช่วงปีการศึกษาและปีงบคนละความหมาย                       | scopedmaster; O05/O06;notpersonbyitselfแต่joineddataต้องตามpolicy                 | รุ่นปฏิทินและหลักฐานอนุมัติ;ไม่ใช้เลขปีเท่ากันแทนrelation                                                  |
| D70-07 | Document: documentCode,ownerOrganizationId,documentKind,visibilityClass,lifecycleStatus                                                | referenceหลักฐานกลาง                                    | scopedmetadata; C03/O08;title/owner/classificationอาจลับ                          | metadata-onlyไม่FileVersion/scan/ACL/retentionengine;hold/ไฟล์จริงต้องcentralversionภายหลัง                |
| D70-08 | PolicyVersion: namespace,versionNo,verificationStatus,effectiveFrom/To,evidenceDocumentId                                              | อ้างpolicy/ruleversion                                  | internalreview; C03+owner;enumVERIFIEDไม่แทนindependentdecision                   | decisionauthority+evidence+recorded/effectivedateและsupersede;ยังไม่มีsigneddecision                       |
| D70-09 | AuditLog: actor,targetKind/Id,action,changedFields,correlation,recordedAt                                                              | traceการทำรายการและเหตุการณ์ความปลอดภัย                 | restrictedaudit; C02+C03;idsสามารถเชื่อมคนได้                                     | retaintransactionalprovenanceแยกprivatepayload;no rawold/new;superuserDDLไม่tamperproof                    |

ครบ19models/213scalarfields รายชื่อfieldเต็มและ current visibility/retention placeholder ของแต่ละfield โดย owner/purpose สืบจาก modelอยู่ [review-plan.json](../tests/fixtures/security/review-plan.json) ไม่มีค่าตัวตนหรือไฟล์จริง ไม่เก็บpassport/nationalIDใหม่ในบทนี้

## Inventory ที่ยังเป็นแบบออกแบบ

| รหัส   | สิ่งที่ยังไม่มี runtime/schema                               | purpose/ความเสี่ยง/owner           | policy ที่ต้องยืนยัน                                                                             |
| ------ | ------------------------------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| D70-10 | centralUserAccount/session/grants                            | login/linkperson/หน้าที่; C02+C03  | identityverification, session/MFA/revoke, minimumclaims, retentionaccesslogs                     |
| D70-11 | position/status/center-session/change requests               | คน01 สถานที่02 คำขอ04; O01/O02/O04 | assignmentauthority/time/scope/statushistory/evidence;trackingpublicfieldpolicy                  |
| D70-12 | pre/lesson/post/essayreview                                  | learning03; O03+C03                | learnerown/assignedteacher, smallgroups/minors,contentrights;ไม่officialscores05                 |
| D70-13 | Enrollment/Candidate/Application/snapshot/seat/score/release | ผู้สมัคร/ผลสอบ05; O05+C03          | identityalternative/noThaiID, eligibility/grading/form/publishversion;ต้องApplicationกลาง        |
| D70-14 | rawXLSX/staging/rowerrors/batch/commit refs                  | import09→05; O09+C03               | protectedraw/normalized, purpose/retentionแยกartifact, errorDTO/formulainjection, noPIIlogs/jobs |
| D70-15 | budget/ledger/disbursement/invoice                           | finance06; O06+C03                 | approvedauthority/limits/retentionfinancialevidence;no banktransfer/NBMSclaim                    |
| D70-16 | procurement/stock/asset/custody                              | inventory07; O07+C03               | custodianpersonalfields/scope/documentretention/disposal;ไม่ลบประวัติราคา/ผู้ถือครอง             |
| D70-17 | recordversions/recipients/receipts/hold/destruction          | records08; O08+C03                 | secrecyACL/currentduties/snapshot, retention/hold/destructionaudit,signingproviderจริงถ้ามี      |
| D70-18 | FileVersion/ACL/quarantine/scan/export/cache/backup          | centralfiles; C02+C03              | content/metadata/thumbnail/accesslog, signedURLrevocation, retention/holdทั้งหมดในsharedservice  |

## Purpose, legal basis และฟีเจอร์ที่ต้องรับรอง

แต่ละ gate ต้องผูก feature+purpose+data fields+policyversion+environment (DEMO/REAL/OFFICIAL) ไม่ปลดทั้งเก้าระบบจากการรับรองฟีเจอร์เดียว ชื่อผู้ตัดสิน, appointment/delegation evidence, legalbasisdecision, decisiondocument/FileVersion, effective_at, recorded_at และลายมือชื่อ **ว่างทั้งหมด** ผู้มีหน้าที่ต่อไปนี้เป็นผู้ตัดสินเสนอที่ยังไม่แต่งตั้ง ไม่มีgateใดปลดล็อก

| gate   | สิ่งที่ต้องตัดสิน / ผู้ตัดสินตามหน้าที่เสนอ                      | หลักฐานก่อนปลดล็อก                                                                         | ปิดเฉพาะส่วนที่เกี่ยวข้อง / TEST ต่อได้                      |
| ------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| G70-01 | purpose/legalbasis/data minimization; C03+ownerทุกdataset        | appointedauthority, purpose-by-field/basisdecision, policyและnoticeรุ่นตรง                 | realpersonalprocessing;ทดสอบsynthetic schemas/flows          |
| G70-02 | ผู้เยาว์/นัยศาสนา/ข้อมูลกลุ่มเล็ก; C03+O03/O05/O09               | classification/impact/agepolicy/aggregation/ผู้รับที่อนุญาต                                | realminor/learnerpublication;TESTown/assignedviews           |
| G70-03 | publicregistry/results/tracking; C03+O01/O04/O05                 | fieldallowlist, publicationauthority/releaseversion/cachewithdraw/limitedsearch proof      | publicrealresults/registry/tracking;DEMO DTOsเมื่อมีruntime  |
| G70-04 | retention/hold/destruction; C03+O08+owner                        | duration/trigger/objectclasses, holdsource/authority, destroyapproval+audit/recovery       | realdestruction/retentionjobs;synthetichold/destroytests     |
| G70-05 | สิทธิ์ขอเข้าถึง/แก้/ปกปิด/ลบ; C03+owner                          | identityproportionatecheck/decisionroute/exceptions/hold, versionedcorrection/cacherevoke  | realrightsdecisions;TESTrequestsโดยไม่เดาผลทางกฎหมาย         |
| G70-06 | อำนาจ/วงเงิน/delegation; O04/O06/O07+C03                         | officialauthoritymatrix/time/maker-checker/limitversion/evidencescan                       | officialapprovals/payments;DEMO exactledger/concurrency      |
| G70-07 | แบบสมัคร/eligibility/score; O05+C03                              | templates/rulesจากหลักฐานจริง secondcheckerและreleaseproof;ศ.3ไม่เดา                       | officialforms/results;DEMOlayout/rules ไม่ถือผ่านสอบ         |
| G70-08 | records/secrecy/approval/signing; O08+C03                        | registerpolicy/recipientACL/retention;provider/certificateevidenceหากอ้างdigital signature | officialrecords/signatureclaim;internalDEMO approvalevidence |
| G70-09 | identity/import/หลักฐานกรณีไม่มีThaiID; O09/O05+C03              | verifiedmapping/evidencepolicy/rawretention/checksum/atomic/revalidateproof                | realimport/identitymerge;TESTtextids/leadingzeros/NFC        |
| G70-10 | เนื้อหา/สิทธิ์ใช้/rubric; O03+C03                                | expertcertifiedcontentversion/rights/evaluatorroles                                        | realcertifiedcontentclaim;ป้ายตัวอย่างTESTและsoftwaretests   |
| G70-11 | ผู้ควบคุม/processor/hosting/โอนข้อมูล/incidentroute; C03+C01/C02 | authority/processorcontracts/regions/subprocessors/security/notificationdecisionsที่ยืนยัน | realstorage/transfer;isolatedTESTไม่ส่งข้อมูลจริง            |
| G70-12 | technicalrelease/Auth/files/jobs/dependency/logs; C02+C03+owner  | securityissuesปิด+native/browser/cache/memory/advisory/logproof ตามversionที่รับรอง        | เปิดfeatureที่ผ่านจริง;unit/source/HTTPTESTยังทำได้          |

ทะเบียน gate นี้เป็น **Proposal configuration** ไม่มีruntimeunlockserviceใหม่ Current containmentจริงคือworkspace403และbusinessroutesไม่มี ไม่อ้างว่ามีper-featuregateengineแล้ว เอกสารหรือค่า `VERIFIED`, `isPublicEligible`, roleชื่อฝ่าย, scanlabel หรือreceiptเพียงอย่างเดียวไม่ใช่หลักฐานปลดล็อก ต้องตรวจสิทธิ์ผู้ตัดสิน/วันมอบหมาย/decisionversionและทดสอบallowed/deniedจริง

## ขั้นตอนสิทธิ์เจ้าของข้อมูลและการเก็บรักษาที่เสนอ

รับคำขอผ่านช่องทางกลางที่เจ้าของงานยืนยันและออกtrackingส่วนตัว ตรวจตัวตนเท่าที่จำเป็นโดยไม่บังคับเลขบัตรไทย บันทึกpurpose/ขอบเขต/ข้อมูลที่เกี่ยวข้อง แล้วส่งผู้มีอำนาจตัดสินพร้อมhold/ข้อยกเว้นที่C03วินิจฉัย ไม่สัญญาระยะตอบหรือผลอนุมัติที่ยังไม่ยืนยัน

การแก้ใช้versionใหม่พร้อมreason/evidence/effective/recorded timestamps และคงประวัติที่policyกำหนด ผลปีเก่าคงsnapshot หรือแก้ด้วยamendment/releaseใหม่ตามdecision ไม่เขียนทับแล้วลบหลักฐาน การลบ/ปกปิดต้องแยกไฟล์/thumbnail/cache/errorreport/staging/backup/logจากaudit/ledger/score/status events และตรวจlegalholdก่อน การทำลายที่อนุมัติต้องรักษาauditและevidenceofdestructionตามpolicy ไม่เก็บส่วนตัวตลอดไปเพียงเพราะมีaudit

## แบบรับรองที่ยังว่าง

| ช่อง                                                      | ค่าปัจจุบัน           |
| --------------------------------------------------------- | --------------------- |
| gate/feature/purpose/field scope ที่ตัดสินจริง            | ว่าง                  |
| environment และ policy/content/code/file versions         | ว่าง                  |
| ชื่อผู้ตัดสิน/centralperson/account/assignment            | ว่าง                  |
| appointment/delegation/authority evidence                 | ว่าง                  |
| legal basis decision และแหล่งกฎปัจจุบัน                   | ว่าง                  |
| data recipients/processors/retention/hold/rights decision | ว่าง                  |
| protecteddecision Document/FileVersion และ hash           | ว่าง                  |
| actualsecuritytests/allowed-denied/issue closure refs     | ว่าง                  |
| residualrisk/ผู้รับความเสี่ยงที่มีอำนาจ                   | ว่าง                  |
| decision / effective_at / recorded_at                     | PENDING / ว่าง / ว่าง |
| ลายมือชื่อหรือหลักฐานอนุมัติที่ตรวจได้                    | ว่าง                  |

การลงรับรองต้องเป็นผู้มีอำนาจจริงตามรุ่น/ขอบเขตนั้นและแยกผู้สร้างกับผู้อนุมัติสำคัญ ไม่เติมsignoffแทนผู้ใช้ เมื่อpolicyหรือเนื้อหาเปลี่ยนต้องreviewรุ่นใหม่และเก็บdecisionเดิม ไม่ถือภาพลายเซ็น/hashเท่ากับcertificate-backed digital signature

อ้าง [Project Charter](PROJECT_CHARTER.md), [OPEN_QUESTIONS](OPEN_QUESTIONS.md), [RESULT_PUBLICATION_POLICY](RESULT_PUBLICATION_POLICY.md), [RECORDS_RETENTION](RECORDS_RETENTION.md) และช่องทางหน่วยงาน [PDPC](https://www.pdpc.or.th/) สำหรับให้C03ตรวจแหล่งทางการและกฎหมายที่ใช้กับกิจกรรมจริง ไม่คัดนโยบายของหน่วยงานอื่นมาเป็นฐานของโครงการนี้ ยังไม่มีlegal signoff/featureunlock และไม่เริ่มบท71
