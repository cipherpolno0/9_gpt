# อัปโหลดและอ่าน XLSX อย่างจำกัด — บท 60

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | **Proposal / runtime BLOCKED / security acceptance NOT RUN**

เอกสารนี้เป็นสัญญาที่เตรียมไว้สำหรับ upload และ bounded parsing worker ไม่ใช่บริการที่เปิดใช้งานแล้ว อ่าน [BLUEPRINT](../BLUEPRINT.md), [MASTER](../00_MASTER_PROMPT.md), [สถานะ](PROGRESS.md), [contract บท59](EXCEL_TEMPLATE_CONTRACT.md) และ [registry กลางระบบ05](FORM_TEMPLATE_REGISTRY.md) ร่วมกัน บท10ยังมี Document แบบ METADATA_ONLY ไม่มี FileVersion/quarantine/scan/ACL จริง บท59ยังไม่มี generator/download service ส่วน worker ปัจจุบันตรวจ PostgreSQL/Redis เท่านั้น `corepack pnpm db:test` รอบ60ออก exit1 จึงยังตรวจรับ upload/worker ตามเกณฑ์60ไม่ได้

## 1 แนวคิดและขอบเขต

1. รับไฟล์เข้าเขตกักกันของบริการเอกสารกลางก่อน การอัปโหลดสำเร็จยังไม่แปลว่าข้อมูลผ่านตรวจ
2. XLSX มีหลายส่วนอยู่ใน ZIP ขนาดไฟล์ที่รับกับขนาดที่คลายออกต้องจำกัดแยกกัน ตรวจโครงสร้างและเนื้อหาที่เสี่ยงก่อนส่งเข้า ExcelJS
3. อ่านข้อมูลเป็น staging ที่มีเจ้าของและสิทธิ์ เก็บค่าเดิมพร้อมค่าที่ปรับรูปแบบและรุ่นกฎ เพื่อให้เจ้าหน้าที่แก้ความกำกวมได้
4. บท60จบที่ READY_FOR_VALIDATION หรือรายการข้อผิดพลาด ไม่เขียน Person/Candidate/Application ไม่อนุมัติ ไม่ออกที่นั่ง ไม่สร้างผลสอบ ระบบ09ใช้ application service ระบบ05เมื่อถึงบท commit เท่านั้น

ไม่มีการเปลี่ยน schema/package/lockfile/migration ในรอบนี้ ไม่มีหน้า upload/server action/job consumer ใหม่ และยังไม่เริ่มบท61 [กรณีทดสอบ](../tests/system09/PARSING_CASES.md) กับ [configuration เสนอ](../tests/fixtures/system09/parsing-plan.json) เป็น PLAN_ONLY ไม่ใช่ executable tests

## 2 หน้าอัปโหลดและสัญญาบริการที่เสนอ

หน้า `/app/exams/imports/new` เสนอให้เลือก AcademicYear, ประเภทนักธรรม/ธรรมศึกษา, ระดับ, ช่วงชั้น, Organization และ ExamSession/สนามจากทะเบียนกลางที่บัญชีมีสิทธิ์ ไม่รับปีงบแทนปีการศึกษา ตัวเลือกขึ้นกับสิทธิ์ปัจจุบันและช่วงมอบหมาย แสดงรุ่น template และข้อความ “แบบทดลอง — ข้อมูลสมมติ ไม่ใช่แบบทางการ” เมื่อใช้ DEMO

| ขั้น / action เสนอ | ฝั่ง server ต้องทำ                                                                                                          | ผลต่อข้อมูล                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| ขอ upload intent   | ตรวจ account/action/scope/assignment time/CSRF; resolve context และ registry version จริง; ปฏิเสธ OFFICIAL ที่ยัง TO VERIFY | intent มีวันหมดอายุ owner binding และขนาดสูงสุด ไม่มีใบสมัคร                               |
| ส่ง bytes          | บริการไฟล์กลางรับแบบ stream จำกัด bytes จริง แม้ไม่มีหรือปลอม Content-Length; ชื่อไฟล์เป็น metadata ไม่ใช้เป็น object path  | central Document/FileVersion ใน private quarantine; hash/object version ตรึงหลัง upload จบ |
| finalize upload    | ตรวจ intent/owner/file/context/pinned schema; ตรวจ bytes/type/scan state; บันทึก import_batch และ outbox ใน transaction     | batch เดิมสำหรับ idempotency key เดิมและ payload เดิม; key เดิมต่าง payload คืน409         |
| worker รับงาน      | ตรวจ service identity/action/scope/เวลามอบหมายปัจจุบัน รวมเจ้าของ batch และสิทธิ์ใช้ไฟล์; อ่าน exact version/hash           | ถ้าไม่ CLEAN หรือสิทธิ์ถูกถอน ไม่อ่าน workbook; scanner unavailable คง WAITING_SCAN        |
| ดูสถานะ/ข้อผิดพลาด | ตรวจสิทธิ์อีกครั้งทั้ง poll/search/error download/raw/normalized; private no-store                                          | คืนเฉพาะ metadata/แถว/คอลัมน์/เหตุผลที่ได้รับอนุญาต ไม่มี public raw cells                 |

ไม่ให้ browser อ้าง `verified`, `scope`, `CLEAN`, file URL หรือ worker privilege เอง Worker ที่มีสิทธิ์อ่านไฟล์ไม่ได้สิทธิ์ approve application เพิ่มโดยปริยาย การเป็น admin เทคนิคไม่ได้เปิดข้อมูลทุกหน่วยงาน ลิงก์ file/job ไม่เพิ่ม ACL ไม่มี public preview/thumbnail/full text ของ upload นี้

upload intent, ImportBatch, ImportRow และ ValidationIssue ต้องต่อกับ shared Auth/Document/FileVersion/queue ของโครงการ ไม่สร้างบัญชีหรือ file registry สำรอง ถ้าเก็บ object สำเร็จแต่ transaction ล้มเหลวให้ reconciliation ตรวจ intent/object ownership และ retention ก่อนจัดการ orphan ห้ามลบไฟล์ที่ shared reference/legal hold ใช้อยู่

## 3 เพดานทดลอง DEMO_XLSX_PARSING_LIMITS_0.1

ทุกค่าเป็น **Proposal ต้อง load test และทบทวนโดย O09/C02/C03 ก่อนเปิดใช้จริง** ค่าบน server ตรึงรุ่นกับ batch ผู้ใช้เพิ่มเพดานผ่าน request ไม่ได้ ข้อจำกัด registry ที่เข้มกว่าจะมีผลด้วย เช่น template บท59ยังจำกัดผู้สมัคร20แถวและช่องกรอก20แถวต่อ input sheet ไม่ถูกยกเป็น2000แถวอัตโนมัติ

| เพดาน                            | ค่าเสนอ                                        | วิธีนับ/บังคับ                                                                               |
| -------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Upload file bytes                | 10 MiB = 10485760 bytes                        | นับ bytes จริงระหว่างรับ ไม่โหลด request body ทั้งก้อนในเว็บ                                 |
| ZIP entries                      | 256                                            | รวม directory/parts ทุกชื่อ ตรวจชื่อซ้ำและโครงสร้างก่อนเปิด entry                            |
| Expanded bytes รวม               | 40 MiB = 41943040 bytes                        | นับ bytes ที่คลายจริงของทุก entry รวม parts ที่ parser ไม่ใช้                                |
| Expanded bytes ต่อ entry         | 8 MiB = 8388608 bytes                          | หยุด stream ทันทีเมื่อเกิน ไม่เชื่อค่าขนาดใน ZIP header                                      |
| Expansion ratio ต่อ entry        | 100:1                                          | actual expanded / max(1, compressed bytes ของ entry); เป็น guard เพิ่ม ไม่แทน byte cap       |
| Input data rows รวม              | 2000                                           | รวมแถวมีข้อมูลในผู้สมัครและหมายเหตุ ไม่รวม banner/header/guide; ไม่ใช่2000ต่อ sheet          |
| Physical row index               | 4096                                           | ทุก sheet รวมแถวว่างที่มี style; ไม่สร้าง array ตาม dimension/เลขแถวที่อ้าง                  |
| Column index                     | 64                                             | ทุก sheet; machine headers ต้องตรง schema21/5 columns ด้วย                                   |
| Cell nodes รวม                   | 50000                                          | นับทุก `<c>` รวมว่าง/style/header/guide/hidden sheet ก่อนเก็บ object                         |
| String ต่อ cell/shared string    | 4096 Unicode code points                       | รวม rich-text runs เป็นข้อความ; จำกัด bytes ด้วย expanded cap                                |
| Shared strings / styles          | 50000 / 1024                                   | นับรายการจริงก่อนสร้าง dictionary/reference lookup                                           |
| XML depth                        | 32                                             | parser ปิด DTD/entities/external resolution; จำกัดทุก XML part                               |
| Preflight / parse / job deadline | 5000 / 10000 / 15000 ms                        | parent watchdog ภายนอก child; job deadlineรวมทั้งสองช่วง ไม่รวมเวลารอscan/queue              |
| Child memory / V8 old heap       | 256 MiB / 128 MiB                              | memory hard limit ของ process/container รวม Buffer/native; heap limit เป็น guardเสริม        |
| Output IPC / scratch             | 8 MiB / 64 MiB                                 | จำกัด bytes ผลส่งกลับและ scratch รวม ไม่ส่ง workbook object/raw fileผ่าน IPC                 |
| Concurrent parsing / retry       | 1 ต่อ isolated runner / ไม่เกิน2 infra retries | rate/queue/quota ต่อ account/org ต้องยืนยันและ load test; malformed/limit files ไม่ retryเอง |

เว็บและ parent/queue อยู่คนละ resource boundary กับ child parser ต้องมี hard memory/CPU isolation, read-only object version, scratch quota และปิด network ใน child ปิด child process group/streams/temporary filesเมื่อ abort ไม่พึ่ง `Promise.race` อย่างเดียวเพราะงานที่หมดเวลาอาจยังทำต่อ ถ้าพิสูจน์ isolation ไม่ได้ คืน WORKER_ISOLATION_NOT_READY และไม่เริ่ม parse

Node `worker_threads.resourceLimits` จำกัด JS engine แต่ไม่ครอบคลุม external data/ArrayBuffer และ process ยังอาจเกิด global OOM จึงไม่ใช้ worker thread/heap flag เป็นหลักฐานว่า memory ทุกชนิดถูกจำกัด ดู [Node24 Worker threads](https://nodejs.org/docs/latest-v24.x/api/worker_threads.html#new-workerfilename-options) ค่าบนตารางยังไม่ถูกติดตั้งหรือพิสูจน์บน runtimeนี้

## 4 Preflight ก่อน ExcelJS

| ชั้นตรวจ                | ต้องปฏิเสธ/ตรวจ                                                                                                                                                                                        | error code เสนอ                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| ชื่อ/นามสกุล/bytes      | allowlist `.xlsx` แบบไม่สนตัวพิมพ์; ไม่รับ `.xls/.xlsm`, NUL/path/colon หรือชื่อซ้อนเพื่อหลบกฎ; MIME/headerอย่างเดียวไม่พอ                                                                             | FILE_EXTENSION_NOT_ALLOWED / FILE_TYPE_MISMATCH                            |
| ZIP container           | signature/EOCD/offset/length/count ต้องอยู่ใน bytesจริง; truncated/overlap/CRC mismatchไม่รับ; ตรวจ local/central records และ data descriptorตาม flags ไม่บังคับขนาดlocalที่ยังไม่เขียนให้เท่าก่อนอ่าน | ZIP_INVALID                                                                |
| ฟีเจอร์ ZIP             | encrypted flags/central directory encryption/CFB container ไม่ถอดรหัส; ZIP64/multi-disk/unsupported compressionไม่อยู่ใน allowlist รุ่นทดลอง                                                           | ENCRYPTED_FILE / ZIP_FEATURE_UNSUPPORTED                                   |
| ชื่อ parts              | ปฏิเสธ traversal, absolute/backslash/NUL/duplicate/canonical URI collision/symlink/nested archive; ไม่ extract ไป pathจากชื่อ entry                                                                    | ZIP_PART_NAME_INVALID                                                      |
| คลายไฟล์                | bounded stream นับ bytesจริง/ratio/timeทุก entry หยุดก่อน allocationเกินเพดาน ไม่ใช้ขนาดที่ประกาศเป็นหลักฐานเดียว                                                                                      | ZIP_EXPANSION_LIMIT / DEADLINE_EXCEEDED                                    |
| OPC/XLSX                | `[Content_Types].xml`, package relationships/workbook/worksheet targetsต้องเป็น XLSX แบบปกติ; requiredpartsหาย/targetนอกpackage/unknown binaryไม่รับ                                                   | WORKBOOK_FORMAT_UNSUPPORTED                                                |
| Active/external content | macro-enabled content type, vba/XLM/macro sheets/ActiveX/OLE/embedded objects, externalLinks/connections/query/DDE, TargetMode=External ทุกrelationships; ไม่มี fetchตาม URL                           | MACRO_NOT_ALLOWED / EXTERNAL_LINK_NOT_ALLOWED / ACTIVE_CONTENT_NOT_ALLOWED |
| XML                     | ตรวจ namespace-aware ทุก XML, DTD/entities/depth/text/shared strings/styles/row/cell bounds รวมunused parts; อย่าใช้ regexอย่างเดียวตรวจสูตร                                                           | XML_UNSAFE / XML_LIMIT                                                     |
| สูตร                    | `<f>` ใน worksheet cellsทุกส่วน รวม shared/array/empty formulas และสูตรที่มี cached value; unknown formula constructs/named expression/calcChainไม่อยู่ในallowlist                                     | FORMULA_NOT_ALLOWED                                                        |

`PK` อย่างเดียวไม่พิสูจน์ว่าเป็น XLSX และ MIME/scanสะอาดไม่พิสูจน์ว่าไม่มี ZIP bomb กฎ ZIP อ้าง [PKWARE APPNOTE](https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT) และวิธีป้องกันหลายชั้นอ้าง [OWASP File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) เพดานที่เลือกเป็นการออกแบบโครงการ ไม่ใช่ตัวเลขที่แหล่งเหล่านี้รับรอง

สูตรใน cell กับ data validation dropdown แยกกัน: template59มี `<formula1>` เป็นรายการค่าคงที่ของ dropdown อนุญาตเฉพาะ literal list ตรง immutable registry allowlist และไม่ evaluate ไม่อนุญาต cell references/functions/external names ใน validation สูตร cell `<f>` ปฏิเสธแม้มีค่า cached `<v>` ตามโครงสร้าง [Microsoft SpreadsheetML formulas](https://learn.microsoft.com/en-us/office/open-xml/spreadsheet/working-with-formulas) ส่วนข้อความ TEXT ที่ขึ้นต้น `=` ยังเป็นข้อความเดิม ไม่ execute และถ้ามี error exportภายหลังต้องป้องกัน formula injection

ส่วน ExcelJS เมื่อเลือกและตรวจรุ่นแล้วให้อ่านเฉพาะ archive ที่ผ่าน preflightและscan สองขั้นต้อง pin hash/bytes/objectversion เดียวกัน ห้ามตรวจ V1 แล้ว parserอ่าน latest V2 และไม่เลือก optionที่คำนวณสูตร/เปิดลิงก์เครือข่าย ต้อง catch errorและยุติ childโดยไม่ทำให้เว็บ/parentล่ม

## 5 การอ่านและค่า normalized ที่ป้องกันไว้

pin template code/version, machine schema, normalization profile, limits, mapping และ selected contextฝั่งserver เก็บ sheet name/index, XML cell type, cell reference, physical row number, header, original text/decoded value, normalized value, issue code และ file version/hash เก็บเป็น private staging ตาม scopeเดียวกับไฟล์ ตัว raw/normalized ไม่ออกpublic ไม่เขียนในlog/error stack/notification ไม่เปลี่ยนชื่อ Personกลางจากการnormalize

sheet namesและheadersต้องตรงรุ่น; reject duplicate/missing/unexpected/hidden input sheet และ mergedmachineheaders ไม่เดาจากลำดับsheetหรือชื่อคล้ายกัน guide/mergedbannerอนุญาตตาม registryเท่านั้น cell type TEXTรับ `s`, `inlineStr`, `str` ที่ไม่มีสูตรและdecodeถูกต้อง ไม่เปลี่ยน numeric IDเป็นtext/เติมศูนย์ให้เอง ตรวจ cell/row referencesซ้ำ, unordered/out-of-rangeอย่างจำกัด แถวว่างกลางข้อมูลไม่ทำให้ physicalrowเลื่อน

| ค่า/กรณี                    | กฎที่เสนอ                                                                                                | ตัวอย่าง/ผล                                                                                        |
| --------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| ชื่อไทย/ชื่อเดิม            | NFC canonical normalization; เก็บ raw ไม่ลบวรรณยุกต์/สระ ไม่ใช้ NFKC ไม่ trimชื่อหรือรวมคนจากชื่อเหมือน  | `ทดสอบก้อง` ยังคงไม้โท; null/blankตาม optionalfield                                                |
| เลขรหัส/ตัวตน               | ต้องTEXTและopaque identifier; รักษาศูนย์นำหน้า ไม่แปลงตัวเลขทั้งworkbook                                 | `000001` คงเดิม; numeric1คืน CELL_MUST_BE_TEXT                                                     |
| เลขไทย                      | แปลง ๐–๙ เฉพาะ field/profileที่ระบุ; reject mixeddigitถ้าprofileไม่อนุญาต; rawคงเดิม                     | dateprofileTHAIที่pin: `๒๕๖๓-๐๒-๒๙` → ASCIIก่อนparse                                               |
| พ.ศ.                        | profileมี era=BE จากรุ่นschemaที่ตรวจ ไม่ใช่client/ชื่อsheet; year−543 แล้วตรวจปฏิทิน Gregorianแบบstrict | BE2563-02-29 → CE2020-02-29; BE2562-02-29คืน INVALID_DATE                                          |
| ระบบปีไม่ระบุ               | ไม่ใช้เกณฑ์ตัวเลขมากกว่า2400หรือปีปัจจุบันตัดสิน                                                         | `2569` ในfieldที่eraไม่ระบุคืน AMBIGUOUS_YEAR                                                      |
| รูปแบบวันที่ไม่ระบุ/สองหลัก | ไม่ใช้ Date.parseแบบเดา; ไม่รับ dd/mm/yy ที่ไม่มีprofileแน่ชัด                                           | `02/01/2569` คืน AMBIGUOUS_DATE พร้อมให้แก้เป็นรูปแบบที่รุ่นกำหนด                                  |
| Template59 machine0.1.0     | วันเกิดยังเป็น ASCII ISO Gregorian TEXTเท่านั้น; ไม่เพิ่มBE/เลขไทยเข้ารุ่นเก่าโดยเงียบ                   | Excel serial/typed date/BEhintคืน DATE_PROTOCOL_MISMATCH; profileใหม่ต้องมี machine schemaรุ่นใหม่ |
| AcademicYear                | resolveรหัสopaqueตรง AcademicYear/context ไม่แปลงFiscalYearหรืออ่านตัวเลขในcodeเป็นระบบปี                | TEST_AY_2569 ไม่เท่ากับปีงบและไม่แปลงเป็นCEเอง                                                     |
| ชนิดข้อมูลผิด               | reject boolean/error/formula/numeric/dateเมื่อschemaต้องTEXT ไม่ลบค่าเดิมหรือautoformat                  | ออกissueที่ row/columnเดิม ไม่สร้างใบสมัคร                                                         |

NFCตาม [Unicode UAX15](https://www.unicode.org/reports/tr15/) ใช้กับข้อความตามกฎที่pin โดยไม่มีขั้นลบเครื่องหมาย ตัวอย่างBE/เลขไทยใน [test vectors](../tests/fixtures/system09/parsing-plan.json) เป็น profileเสนอสำหรับ schemaรุ่นใหม่ **ยังไม่รองรับจริงใน parser** ไม่มีการแก้XLSX/schema59เดิม หาก OFFICIAL ยังไม่มีแหล่งยืนยันระบบปีหรือfields ปิด officialimport จนตรวจหลักฐานครบ

## 6 State, retry และผลผิดพลาด

| สถานะเสนอ                | ความหมาย/การกู้คืน                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| UPLOADING / WAITING_SCAN | ยังไม่อ่านworkbook; timeoutscanไม่ถือว่าCLEAN                                                 |
| QUEUED / PARSING         | lease/fencing/attempt counterของqueueกลาง; currentworker ACLและexactfileversionผ่านก่อนอ่าน   |
| REJECTED_FILE            | type/ZIP/activecontent/limitผิด ไม่วน retryไฟล์เดิมเอง; ให้แก้แล้ว uploadเป็นfileversionใหม่  |
| FAILED_RESOURCE_LIMIT    | watchdog/OOM kill มีstructurederror ให้parentมีชีวิตและรับงานดีถัดไป; stagingบางส่วนไม่active |
| FAILED_RETRYABLE_INFRA   | storage/DB/queueขัดข้อง retryมีเพดานและkeyเดิม; เกินเพดานเข้าคิวเจ้าหน้าที่                   |
| PARSED_WITH_ISSUES       | row/header/type/date/yearต้องแก้; ห้ามทำเป็นREADYหรือApplicationอัตโนมัติ                     |
| READY_FOR_VALIDATION     | ผ่านการอ่านเท่านั้น ยังไม่eligibility/approval/commit                                         |
| CANCELLED_ACCESS         | สิทธิ์owner/workerถูกถอน ยุติงานและห้ามเผยผลที่สร้างไว้ตามpolicy                              |

ImportBatchเสนอมี unique(owner context, idempotency key) + request fingerprint และ ImportRow unique(batch, sheet, physical row, parsing generation) queue event/attempt/ผลเขียนด้วย CAS/leaseและtransaction ป้องกันworkerเก่ามาทับรุ่นใหม่ crashหลังstagingก่อนpublishต้อง rollbackหรือเก็บgenerationที่ยังไม่active retryคืนbatchเดิม ไม่มีcommit_receipt/applicationในบท60 ต้องพิสูจน์constraintsบนPostgreSQLจริงก่อนใช้

Errorresponseเสนอมีcode/jobid/requestid/sheet-row-columnที่สิทธิ์อนุญาต/messageไทย เช่น “วันที่กำกวม กรุณาแก้เป็น YYYY-MM-DD ตามรุ่นที่เลือก” ไม่echoค่าชื่อ/ตัวตน/rawformula/pathลับ public responseไม่บอกjobของคนอื่น existsหรือไม่; limitresponse413, conflict409, malformed422และdeny403ต้องทดสอบจริงในroutesกลาง

## 7 หลักฐานที่ทำได้และแผนตรวจรับ

[baseline read-only](fixtures/excel-parsing-60-baseline.json) ตรวจ bytesที่hashตรงXLSXสมมติบท59 ไม่สร้างหรือแก้workbook: 3ไฟล์10entries/900cell nodes; source10469–11826bytes, expandedจริง51128–62053bytes มีCRCตรง ไม่พบcellformula/macroชื่อpart/externalrelationshipsที่ตรวจ เป็นเพียงbaselineไฟล์เล็ก ไม่ใช่scanner, maliciouspreflight, load test, hardmemoryหรือworkeracceptance

เกณฑ์60-01และ60-02 **BLOCKED / NOT RUN** ต้องรัน P60-01–30บนupload/isolatedworker/sharedAuth/FileVersion/scan/PostgreSQLจริง เก็บ checksumfixture/limits/schema/parser+runtimeversion/peakcontainer memory+CPU/walltime/workerexit/recovery/HTTPและDBcountsก่อนหลัง โดย fixturesอันตรายสร้างในsandboxที่มีเพดานเท่านั้น ไม่โหลดไปproductionหรือเปิดด้วยExcelDesktop ไม่สร้างZIPbombขนาดไม่จำกัดในrepository

Load-test sweepต้องมี bytes/entries/rows/cells/expanded/string/depthที่ limit−1/limit/limit+1; ใกล้2000rowsต้องใช้schemaรุ่นที่อนุญาต2000 ไม่ใช้template59demo20แล้วclaimรองรับ2000 ทดสอบหลายrequestsต่อquota parent/webยังตอบhealthหลังbadjobและgoodjobถัดไปสำเร็จ ทั้ง positive/negative outputsไม่มีApplicationใหม่ นโยบายscan/retention/dataera/productionlimits/queueและเจ้าของผู้ยืนยันติดตาม [OPEN_QUESTIONS](OPEN_QUESTIONS.md)

คำสั่งรอบนี้: `corepack pnpm db:test` exit1; ตรวจเอกสาร/JSON/format/secrets/diffตาม [PROGRESS](PROGRESS.md) ไม่ใช้คำสั่งเหล่านี้แทนP60 เพราะยังไม่มีrunner ไม่รันunit/lint/typecheck/build/browserหรือsecurity/load testsเมื่อไม่มีruntimeเปลี่ยน

แผนimplementationเมื่อdependencyพร้อม: ปิดDB-06และAuthบท07/08 → บริการไฟล์บท10และregistry59 → uploadintent/page/joboutbox → isolatedpreflight/ExcelJS → protectedstaging/normalization → P60และcurrentACL/UAT ทั้งหมดต้องใช้ส่วนกลางเดิม MASTERข้อ2กำหนด “ก่อนเริ่มเขียนโค้ด สรุปแผนเป็นไทยไม่เกิน 10 บรรทัดแล้วรอคำว่า ‘ตกลง’” รอบนี้เตรียมcontracts/specificationsก่อน ไม่มีruntimeที่ข้ามprerequisite และไม่เลื่อนไปบท61
