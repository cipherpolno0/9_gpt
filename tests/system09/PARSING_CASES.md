# กรณีตรวจรับ upload และ bounded parsing — บท60

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | **PLAN_ONLY / ทุกกรณี NOT_RUN**

อ่าน [limitsและservice contract](../../docs/XLSX_PARSING_LIMITS.md) และ [configuration/test vectors](../fixtures/system09/parsing-plan.json) ไม่มีexecutable runner/worker/APIในชุดนี้ รายการexpectedไม่ใช่ผลที่เกิดแล้ว prerequisites10/59/Auth/nativeDBยังBLOCKED

## เงื่อนไขและหลักฐานร่วม

บัญชีTEST A/Bคนละหน่วยงาน และworkerTESTมี action/scope/ช่วงมอบหมายจากAuthกลาง ไม่ใช้ServiceActorเป็นบัญชี loginไฟล์อยู่FileVersionกลาง private quarantine เก็บ exacthash/schema/mapping/profile/limitsกับbatch scanต้องCLEAN; OFFICIALsourceที่ยังTO_VERIFYต้องถูกปฏิเสธ ใช้mockเท่านั้น ไม่มีคนจริงหรือสูตรที่เรียกexternalURLจริง

Negative fixturesสร้างแบบจำกัดในisolatedsandbox เริ่มจากสำเนาfixture59และเปลี่ยนเพียงกรณีที่ระบุ ไม่เปิดด้วยExcelDesktop ไม่ใช้in-memorymockPASSแทนlimitsจริง ต้องเก็บactualfixture SHA256, currentactor/policy refs, HTTPผล, child/containerexit/peakmemory/walltime, event/batch/row counts และassertweb-parentยังมีชีวิต goodjobถัดไปสำเร็จ ทุกcaseต้องassertPerson/Candidate/Application/seat/score unchanged

| รหัส   | Fixture / action                                                                             | ผลที่ต้องตรวจจริง                                                                                                         |
| ------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| P60-01 | เลือกปี/นักธรรมและธรรมศึกษา12กลุ่ม/หน่วยงานในscope อัปโหลดvalid59                            | job+exactcontext/schema/fileversion; READY_FOR_VALIDATION; stagingมี12ผู้สมัคร4remarks ไม่มีApplication; ปีงบใช้แทนไม่ได้ |
| P60-02 | extension .xls/.xlsm/.xlsxที่เป็นtext/OLE/ZIPไม่ใช่OPC; MIMEปลอม;ชื่อNUL/path                | rejecttype/extensionก่อนExcelJS;web-parentอยู่;ข้อความไม่echoเนื้อหา                                                      |
| P60-03 | uploadจริงbytes10485759/10485760/10485761 ไม่มีหรือปลอมContent-Length                        | ฝั่งกลางวัดstreambytes rejectที่เกิน413; ไม่allocateทั้งbody; อื่นยังต้องผ่านvalidation                                   |
| P60-04 | ZIP advertised expandedเล็กแต่streamขยายเกิน8MiBหรือรวม40MiB; ratio101                       | ตัดstreamตามactualcountsก่อนparser; ZIP_EXPANSION_LIMIT; cleanup/recovery                                                 |
| P60-05 | entries255/256/257, ZIP64/multidisk/unsupportedmethod, truncated/CRC/offset/descriptorผิด    | countขอบเขตถูก;unsupported/invalid reject ไม่OOM/hang; validdescriptorไม่false reject                                     |
| P60-06 | pathtraversal/absolute/backslash/symlink/nestedzip/duplicates/URIcollision                   | ZIP_PART_NAME_INVALID; ไม่เขียนไฟล์นอกscratch;childไม่มีnetwork                                                           |
| P60-07 | ZIPencrypted/centralencrypted หรือOLEencryptedOOXML                                          | ENCRYPTED_FILE ไม่ถามรหัสผ่าน/พยายามdecrypt; no parse                                                                     |
| P60-08 | vba/XLM/macro-enabled content type/ActiveX/OLEembedded โดยrename.xlsx                        | reject macro/activecontent ไม่run; filename/MIMEไม่ทำให้ผ่าน                                                              |
| P60-09 | cell `<f>` ordinary/shared/array/empty และ cached `<v>` ในhidden/unusedsheet                 | FORMULA_NOT_ALLOWEDก่อนExcelJS; ไม่มีเฉลยหรือcachedvalueแทนสูตร                                                           |
| P60-10 | externalrelationship/ExternalLink/connections/DDE/namedexpression/query                      | EXTERNAL_LINK_NOT_ALLOWED/active/formulaerror;networkattempts0                                                            |
| P60-11 | valid59literal dropdownเทียบvalidationformulaเป็นcellref/function/externallink; textเริ่ม=   | allowเฉพาะregistryliteral;สูตรจริงreject; TEXTไม่execute/เปลี่ยนraw;error exportไม่สร้างformula                           |
| P60-12 | DTD/entities/XMLdepth33/string4097/sharedstrings50001/styles1025 รวมunusedparts              | XML_UNSAFE/XML_LIMIT; ไม่มีentityresolve/network; memoryอยู่ในhardcap                                                     |
| P60-13 | actualcellnodes49999/50000/50001; rowindex4097/col65; forgeddimension/XFD1048576             | countทุกcellรวมstyleblank/header/guide;ไม่สร้างsparsehugearray;rejectเกิน                                                 |
| P60-14 | schemaใหม่dataรวม1999/2000/2001พร้อมremarks; schema59ผู้สมัคร21แถว                           | globalrowlimit+schemaที่เข้มกว่าบังคับ;2000รับเฉพาะregistryใหม่;ไม่truncateแล้วบอกsuccess                                 |
| P60-15 | childCPUloop/decompressionช้า/largeBuffer; isolationconfigหาย                                | parentkillตามdeadline/memoryhardlimit; NOT_READYถ้าisolationหาย;parent/webgoodjobถัดไปรอด                                 |
| P60-16 | filenameheader/year2569 without era,วันที่02/01/2569/ปีสองหลัก                               | AMBIGUOUS_YEAR/DATEหรือCONTEXT_YEAR_MISMATCHที่fieldเดิม; noautoBE/currentyear                                            |
| P60-17 | pinnednewBEThai profile๒๕๖๓-๐๒-๒๙/๒๕๖๒-๐๒-๒๙; ThaiCEprofile๒๐๒๐-๐๒-๒๙                        | CE2020-02-29/INVALID_DATE/CE2020-02-29;rawเก็บเดิม;template59ไม่เปิดBE/Thaiโดยเงียบ                                       |
| P60-18 | ชื่อทดสอบก้องและNFCdecomposedLatin; ID000001/numeric1; mixeddigits                           | NFCเก็บวรรณยุกต์/ชื่อ;leading0TEXTคงเดิม;numeric/mixedpolicyผิดแสดงissue ไม่รวมคน                                         |
| P60-19 | sheet/headerduplicate/missing/unexpected/hidden/mergedheader; sparseemptyrow/multiplecellref | ตรวจชื่อ/type/physicalrowไม่เลื่อน;errorfieldตรง;guide/bannerที่registryอนุญาตผ่าน                                        |
| P60-20 | schema59 typeddate/Excelserial1900หรือ1904/boolean/error numeric                             | DATE_PROTOCOL_MISMATCH/CELL_MUST_BE_TEXT ไม่guessepoch ไม่สร้างวันที่1900-02-29                                           |
| P60-21 | targetOrganization/fileversion/batchidคนBผ่านupload/finalize/poll/raw/error export           | denydefault403/404ตามpolicyทุกaction ไม่มีbytes/metadataPIIรั่ว                                                           |
| P60-22 | scanPENDING/INFECTED/unavailable/CLEANhashV1แต่storageคืนV2                                  | ไม่parseก่อนCLEAN;failhash/blockedscan;scannererrorไม่CLEAN                                                               |
| P60-23 | revokeowner/workeraction/scope/delegationexpireขณะqueuedและระหว่างparse                      | cancel/denyอ่านและเผยผล;historicalpermissionต้องexplicit ไม่ใช้oldgrant                                                   |
| P60-24 | finalize2ครั้งพร้อมกัน/duplicatequeueevent/timeoutretry keyเดียวต่างpayload                  | batch/effectเดียวpayloadเดิม;409สำหรับpayloadต่าง;generationไม่ซ้ำ                                                        |
| P60-25 | killchildหลังstagingบางแถวหรือDBล้มก่อนผลactivate/outboxcommit                               | transactionrollbackหรือinactivegeneration;retrykeyเดิมไม่ซ้ำ;ไม่มีpartialREADY                                            |
| P60-26 | manyuploads/queuefull/IPCเกิน8MiB/scratchเกิน64MiB                                           | quota/ratebackpressure/currentACL;boundedfailureไม่กระทบweb-parent; noPIIlogs                                             |
| P60-27 | เปิดหน้า/errornotification/search/preview/download/HTML/cacheจากต่างscope                    | private/no-store;ไม่มีrawnormalizedชื่อ/ตัวตนหรือformulaนอกscope                                                          |
| P60-28 | OFFICIALregistryTO_VERIFY/sourceNULL/clientverified=true                                     | FORM_NOT_VERIFIED/NOT_READYก่อนuploadjobofficial; DEMOติดป้ายตลอด ไม่มีแบบศ.ปลอม                                          |
| P60-29 | ค่าสมมติ59invalid10จุด/notes APPROVE_NOW/remarksหลายรายการ                                   | protectedissuesทุกแถว; notesไม่approvalcommand;ไม่commitApplication                                                       |
| P60-30 | reload/networkdisconnect/statusretry/ยกเลิกupload แล้วgoodfileใหม่                           | resumejobเดิมตามkey/context;UIkeyboard/statusอ่านได้;cleanupตามpolicyไม่ลบsharedholdfile                                  |

## การรันและเกณฑ์ผ่าน

ยังไม่มีคำสั่ง `test:system09` หรือsecurityrunner ไม่เสนอคำสั่งที่รันไม่ได้ `corepack pnpm db:test` เป็นตรวจprerequisiteฐานจริงและรอบ60ได้exit1 ไม่มีnativeintegrationเริ่มรัน ตัวตรวจเอกสาร/JSONกับbaselinearchiveไม่รันP60แทน

เมื่อprerequisitesพร้อมเพิ่มexecutable integration/HTTP/isolatedworker/browser testsตามแผนที่อนุมัติแล้วรันทุก30กรณี ทำboundarysweepซ้ำภายใต้limitsจริง บันทึกversion/peakmemory/เวลา/abortreasonและchildexit พร้อมnegativefileต่อgoodfile recovery ตรวจwrongscopeทุกactionไม่ใช้menuซ่อนเป็นหลักฐาน ข้อ60-01ผ่านเมื่อmalformed/bomb/formula/overlimitsไม่ล่มparent/web ข้อ60-02ผ่านเมื่อyear/dateambiguityออกissueไม่มีguess ทั้งสองยังBLOCKED/NOT_RUN ไม่เริ่ม61 ไม่รับรองproductionlimitsหรือแบบทางการจากtestซอฟต์แวร์
