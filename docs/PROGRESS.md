# ความก้าวหน้าโครงการ — เว็บไซต์กองบริหารทะเบียนและวัดผล

อัปเดตบท 04 | รุ่นเอกสารล่าสุด 1.4 | 3 ตุลาคม 2569 (2026-10-03)

## บันทึกบท 01 ที่เก็บไว้เป็นประวัติ

## สถานะที่ตรวจพบก่อนเริ่ม

- มี BLUEPRINT.md รุ่นเอกสารเดิม และไฟล์แนบ BLUEPRINT(1).md/Pasted markdown(1).md
- ไม่พบ 00_MASTER_PROMPT.md, docs/PROGRESS.md, docs/DECISIONS.md, docs/OPEN_QUESTIONS.md, README.md หรือ AGENTS.md ในโฟลเดอร์โครงการ
- `git status --short --branch` ก่อนเริ่มคืน exit 128: โฟลเดอร์ยังไม่เป็น repository
- ผู้ใช้อนุมัติแผนบท 01 ด้วย “ตกลง”; ไม่ใช่การอนุมัติบทถัดไปหรือรับรองกฎทางการ

## ขอบเขตงานบท 01

ปรับเอกสารกลาง สร้าง Project Charter ครบ 9 ระบบพร้อม REQ-S01–REQ-S09, REQ-C01–REQ-C20 และเจ้าของงานตามหน้าที่ O01–O09/C01–C04 สร้าง DEC-001–DEC-014 และ Q001–Q016 พร้อมเกณฑ์ส่งมอบทดลอง/จริง ความเสี่ยงและ gate

## Schema, migrations, versions และ policies

| รายการ | สถานะจริงในบทนี้ |
|---|---|
| รุ่นเอกสาร | 1.1 |
| package.json / lockfile / เวอร์ชัน Next.js/Supabase/ExcelJS | ยังไม่มี/ยังไม่เลือก |
| schema ฐานข้อมูล | ยังไม่มี; ชื่อ snake_case ในเอกสารเป็นแบบออกแบบ |
| migrations | 0 ไฟล์; ไม่รันหรือแก้ฐานข้อมูล |
| RLS / Storage policies / audit triggers | ข้อกำหนดในเอกสาร; ยังไม่สร้างหรือทดสอบจริง |
| Supabase project / Auth / Storage | ยังไม่สร้างหรือเชื่อมบัญชี |
| หน้าเว็บ / HTML print / Excel importer | ยังไม่มี implementation |
| Vercel deployment / worker / scan provider | ยังไม่สร้างหรือ deploy; Q011/Q012 เปิดอยู่ |
| ข้อมูล | เอกสารข้อกำหนด; ไม่มีข้อมูลบุคคลจริง |

## ไฟล์ที่สร้างหรือแก้

| ไฟล์ | การเปลี่ยน |
| --- | --- |
| BLUEPRINT.md | ปรับจากรุ่นเดิมให้ตรงข้อกำหนดล่าสุด |
| 00_MASTER_PROMPT.md | สร้างข้อกำหนดกลางจากพรอมป์ต์แนบ |
| docs/PROJECT_CHARTER.md | สร้าง Charter, owners, REQ, risks และ acceptance |
| docs/DECISIONS.md | สร้างบันทึกการตัดสินใจและสถานะ |
| docs/OPEN_QUESTIONS.md | สร้างรายการต้องยืนยันพร้อมหลักฐานและ gate |
| docs/PROGRESS.md | สร้างบันทึกสถานะและผลตรวจจริง |
| .gitignore | สร้างกติกาไม่ commit ไฟล์อัปโหลด เครื่องมือชั่วคราวและ secret |

## ผลตรวจจริง

**สถานะบท 01: ผ่านการตรวจเอกสารและ Git ตาม AC-01 ถึง AC-04** ไม่หมายถึงระบบงานหรือฐานข้อมูลจริงผ่านทดสอบแล้ว

| คำสั่ง/การตรวจที่รันจริง | ผล |
|---|---|
| อ่านเอกสารที่มีจริงและตรวจไฟล์ส่วนกลางก่อนเริ่ม | BLUEPRINT มีอยู่; MASTER/PROGRESS/DECISIONS/OPEN_QUESTIONS ไม่มี จึงสร้างตามขอบเขตบท |
| `python /tmp/verify_chapter01.py` (เครื่องมือตรวจเอกสารชั่วคราว) | ผ่าน 22/22: owners, REQ, Q, decisions, เมนู 7/9/3 กลุ่ม, หน้ากลาง, เทคโนโลยี, กติกา, links และรูปแบบ Markdown |
| ตรวจความสอดคล้องจากการอ่านเนื้อหา | ครบ 9 ระบบ; ผู้รับผิดชอบจริงและกฎทางการยังเปิดใน Q001–Q016; ไม่มีวันเสร็จทั้งประเทศที่เดาขึ้น |
| `git init -b main` | สำเร็จ: สร้าง repository ในโครงการนี้ ไม่มี remote |
| `git diff --cached --check` | ผ่าน: ไม่มีข้อผิดพลาด whitespace ในไฟล์ที่จะ commit |

AC-04 รัน `git show --stat --oneline HEAD` แล้วพบ commit ข้อความ “บทที่ 1: กำหนดโครงการและขอบเขตเว็บไซต์กลาง” ครบ 7 ไฟล์ และ `git status --short` ไม่แสดงรายการค้าง จากนั้นบันทึกผลนี้รวมใน commit ของบท รายละเอียดอยู่ในประวัติของ repository เครื่องมือตรวจเอกสารชั่วคราวไม่ได้เป็นโค้ดระบบหรือสิ่งส่งมอบบทเรียน

การตรวจครั้งแรกพบลิงก์ชื่อไฟล์พิมพ์เล็กไม่ตรงชื่อจริงและตัวตรวจ owner ไปนับส่วนท้ายรหัส REQ เป็น owner ได้แก้ลิงก์และตัวตรวจแล้วรันใหม่จนผ่านครบ 22 รายการ ไม่มีการอ้างผล typecheck/lint/test/build หรือ runtime smoke test เพราะบทนี้ไม่มี package หรือ implementation

## วิธีตรวจรับด้วยตนเองทีละขั้น

1. เปิด PROJECT_CHARTER หัวข้อ 3 และ 5 ตรวจว่ามี O01–O09 และ REQ-S01–REQ-S09 ครบ 9 ระบบ พร้อมขอบเขตและเกณฑ์วัดได้
2. เปิด BLUEPRINT หัวข้อ 2 ตรวจเมนูสาธารณะ 7 เมนู พื้นที่ทำงาน 9 เมนู 3 กลุ่ม และหน้ากลางชุดเดียว ตรวจว่า Excel ใช้บริการสมัครสอบเดิม
3. เปิด OPEN_QUESTIONS ตรวจ Q001–Q016 ทุกแถวมีผู้รับผิดชอบ หลักฐาน ผลกระทบ แนวทางทดลอง และ gate; ไม่ได้แต่งความหมาย ศ.3/จศป. หรือกฎทางการ
4. เปิด DECISIONS เทียบเทคโนโลยี/ชื่อเว็บกับ MASTER และ BLUEPRINT ตรวจว่า RLS/audit/soft delete อยู่ครบและยังไม่อ้างว่าติดตั้งแล้ว
5. ใน terminal ที่รากโครงการ ใช้ `git show --stat HEAD` ดูไฟล์ของ commit บท 01 และ `git status --short` ตรวจว่าไม่มีไฟล์งานค้าง รายการที่ ignore ไม่เป็นส่วนของ commit

## ข้อจำกัดและบทถัดไป

Q001–Q016 ยังเปิด เจ้าของงานจริง/อำนาจ/แบบทางการ/กฎสอบ/นโยบายเผยแพร่ยังไม่ได้ยืนยัน เอกสารกำหนดหน้าที่ตามข้อเสนอเท่านั้น ไม่มีผลทดสอบ UI/Auth/RLS/DB/import/เงิน/stock/backup เพราะยังไม่มี implementation ไม่มีการเชื่อม GitHub หรือ push remote

บท 02: รอผู้ใช้ส่งพรอมป์ต์ ยังไม่เริ่มและไม่กำหนดเนื้อหาจากการเดา

## บท02 — ข้อกำหนดและสิทธิ์ที่ตรวจรับได้

อัปเดต 3 ตุลาคม 2569 (2026-10-03) | เอกสารบท02รุ่น1.2 | ผ่านก่อนหน้า: commit f3bbce8 ของบท01

### งานและไฟล์บท02

| ไฟล์ | สิ่งที่ทำ |
| --- | --- |
| docs/REQUIREMENTS.md | สร้าง22usecases ครบ9ระบบ+บริการกลาง ActorถึงAuditและhappy/directAPI/nativeAPIdenial; เพิ่มREQ-N01–N06 |
| docs/TRACEABILITY.md | สร้างmatrix35REQและcatalog90TC ทุกกรณีruntimePLANNED/NOT RUN; เลขบทลงมือรอQ020 |
| docs/PERMISSIONS.md | สร้างactionsP01–P11 rolematrixและscope/เวลา/ACL/maker-checker/techadminboundaries |
| docs/DECISIONS.md | เพิ่มDEC-015–DEC-022โดยรักษาบันทึกบท01 |
| docs/OPEN_QUESTIONS.md | เพิ่มQ017–Q020; Q001–Q016ยังเปิด |
| docs/PROGRESS.md | บันทึกงานบท02พร้อมสถานะจริงและGitHubconnection |

### Schema/migrations/versions/policies

เอกสารใหม่รุ่น1.2; BLUEPRINT/MASTER/CHARTERจากบท01ยังเป็นฐาน1.1 ไม่มีpackage.json/lockfileหรือเวอร์ชันdependencyที่เลือก ไม่มีschema/migrationsจริง (0ไฟล์) ไม่มีRLS/Storagepolicies/audittriggers/worker/UI/HTMLprint/importที่สร้าง ไม่มีSupabaseprojectหรือVerceldeploy และไม่ใช้ผลตรวจเอกสารแทนruntime

### ผลตรวจจริงบท02

**บท02ผ่านการตรวจเอกสาร DOC-02-01 ถึง DOC-02-04** ผลนี้ไม่ใช่ผลAPI/RLS/UIหรือrestoreจริง ทุกTC90กรณีในTRACEABILITYยังเป็นPLANNED / NOT RUN

| คำสั่ง/การตรวจที่รันจริง | ผล |
|---|---|
| `git status --short --branch` และ `git log -1` ก่อนเริ่ม | mainสะอาด; บท01ที่f3bbce8เป็นฐาน |
| `python /tmp/verify_chapter02.py` (เครื่องมือตรวจเอกสารชั่วคราว) | ผ่าน32/32: UC9ระบบ/9หัวข้อ, happy+directapp/nativeAPI, REQ35, TC90, mapping, permissions, owner/Q/DEC, เวลา/ปี/a11y/backup, Markdownและlinks |
| `git diff --check` | ผ่าน ไม่มีwhitespace errorsในไฟล์trackedที่แก้ |
| GitHubplugin: metadataของ9_gptและbranches | ยืนยันrepo publicและสิทธิ์เข้าถึง; branches=[] ไม่มีงานเดิมบนremoteขณะตรวจ |
| `git remote -v` | origin(fetch/push)ตรงhttps://github.com/cipherpolno0/9_gpt.git |

ตรวจครั้งแรกพบการเขียนรหัสREQแบบย่อทำให้สับสนกับรหัสowner ได้แก้ให้ใช้REQเต็มแล้วรันใหม่ผ่านทุกข้อ เพิ่มกรณีหลักฐานข้ามระบบ7กรณีสำหรับmigration/reuse/versions/chapter/rules/release/language รวมcatalog90กรณี

ตรวจstagedไฟล์ด้วย `git diff --cached --check` ก่อนcommitตามรูปแบบบท02 ตรวจไฟล์และความสะอาดหลังcommitด้วย `git show --stat HEAD` และ `git status --short` เลขcommitอยู่ในGitและคำตอบส่งมอบ ไม่ใส่เลขcommitตัวเองลงไฟล์ซึ่งจะทำให้เลขเปลี่ยน

### GitHubที่เชื่อม

- repository: [cipherpolno0/9_gpt](https://github.com/cipherpolno0/9_gpt)
- origin(fetch/push): https://github.com/cipherpolno0/9_gpt.git
- GitHubpluginยืนยันowner/repo บัญชีเชื่อมcipherpolno0และpermissionspull/push; branchesคืน[] repositoryเป็นpublicและว่างขณะตรวจ
- การผูกoriginและอ่านrepositoryสำเร็จ localcommitsของบท01/02อยู่โครงการนี้ ยังไม่มีการอัปโหลดcommitขึ้นGitHubในขอบเขตการเชื่อมครั้งนี้

### วิธีตรวจรับทีละขั้น

1. เปิดREQUIREMENTS หัวข้อ3 เลือกแต่ละระบบ01–09 ดู9หัวข้อและhappy/directAPI/nativeAPIกรณีdeny; ตรวจExcel ก่อน–หลังเรียนและค้นผลรายปีโดยเฉพาะ
2. เปิดTRACEABILITY เลือกREQจากCharterแล้วตามUC/page/table/service/บท/TC ตรวจว่าfutureimplementationติดQ020และTCทุกข้อยังNOT RUN
3. เปิดPERMISSIONS ดูP01–P08แยกกันและtechadminP08ไม่ได้P05/P06; ตรวจscope/เวลามอบหมาย/ACL/maker-checkerพร้อมtestdeny
4. ตรวจREQ-N01–N06ในREQUIREMENTS โดยเฉพาะเวลาไทย พ.ศ. ปีแยก accessibility และbackupทั้งฐาน/ไฟล์; ชื่อกฎทางการไม่ถูกเดา
5. ที่รากโครงการรัน `git show --stat HEAD`, `git status --short` และ `git remote -v` เพื่อตรวจcommit ไฟล์งานค้างและorigin; การเชื่อมไม่ได้ยืนยันว่ามีไฟล์บนremoteแล้ว

### ข้อจำกัดและบทถัดไป

Q001–Q020ยังเปิด เจ้าของ/อำนาจ/แบบ/เกณฑ์สอบ/นโยบายจริงยังไม่ได้รับรอง ไม่ได้รันAPI/RLS/UI/a11y/restoreหรือtypecheck/lint/test/buildเพราะไม่มีimplementation ขอบเขตเวลาปีและมาตรฐานa11yย่อยเป็นconfig/ข้อเสนอที่ระบุสถานะแล้ว

บท03: รอผู้ใช้ส่งพรอมป์ต์และอนุมัติแผน ยังไม่เริ่มและไม่เดาเนื้อหา

## บท03 — ออกแบบเมนูและหน้าจอร่วม

วันที่3 ตุลาคม2569 (2026-10-03) | รุ่นเอกสาร1.3 | ฐานบท02 commit134cf16 | ผู้ใช้อนุมัติแผนบท03แล้ว

### งานและไฟล์ที่เปลี่ยน

| ไฟล์ | สิ่งที่ทำ/เหตุผล |
| --- | --- |
| docs/SITEMAP.md | ผังpublic7/app9/admin/3กลุ่ม บัญชี41หน้าและcanonicalบริการกลาง พร้อมprojection/สิทธิ์; ครบ9ระบบโดยExcelอยู่ใต้สอบ |
| docs/UX_FLOWS.md | FLOW-01–04สำหรับบุคคลทั่วไป สำนักเรียน ผู้อนุมัติ ผู้เรียน และFLOW-05–12ครอบคลุมงานอื่น; back/recovery/mobile/table/focus/ข้อความไทย |
| docs/WIREFRAMES.md | 13แบบร่างแก้ไขได้ มีlayout/focus/action/back/permission และ65สถานะloading/empty/error/403/404เฉพาะหน้า |
| docs/wireframes/chapter03.html | ต้นแบบออฟไลน์13หน้า6สถานะ ใช้rendererกลาง มี4เส้นทางสมมติและเมนูตามprofileทดลอง ไม่สร้างappหรือAuthจริง |
| docs/DECISIONS.md | เพิ่มDEC-023–DEC-028 รักษาประวัติและแยกConfirmed/Proposal |
| docs/OPEN_QUESTIONS.md | เพิ่มQ021/Q022เรื่องUXผู้ใช้/เนื้อหาฟิลด์จริง; Q001–Q020ยังเปิด ไม่แต่งกฎทางการ |
| docs/PROGRESS.md | ผลตรวจจริง แยกdocument/modelจากbrowser/runtimeและระบุบทถัดไป |

### Schema, migrations, versions และ policies

เอกสารบท03รุ่น1.3 ฐานBLUEPRINT/MASTER/Charter1.1 และrequirements/traceability/permissions1.2คงเดิม ไม่มีschemaฐานข้อมูลหรือmigration (0ไฟล์) ไม่มีpackage.json/lockfileหรือเวอร์ชันNext.js/Supabase/ExcelJSที่เลือก ไม่มีRLS/Storagepolicies/Auth/audittrigger/worker/scan/productionUIหรือVerceldeploy ต้นแบบHTMLแยกจากเป้าหมายNext.js ไม่ใช่การเปลี่ยนเทคโนโลยีDEC-003

PlaywrightและNodeที่ใช้ตรวจเป็นเครื่องมือที่มีในruntime ไม่ติดตั้งdependencyลงโครงการหรือcommitเครื่องมือชั่วคราว การพยายามติดตั้งbrowserสำหรับตรวจในruntimeไม่สำเร็จ ไม่มีผลbrowserให้รับรอง ไม่เปลี่ยนTC90กรณีบท02เป็นผ่าน

### เกณฑ์ตรวจรับและผลจริง

| เกณฑ์ | ผลตรวจระดับที่ทำได้จริง |
| --- | --- |
| DOC-03-01 เมนู/9ระบบครบ | ตรวจเอกสารเทียบBLUEPRINTครบ; Excelเป็นช่องทางระบบ05และdashboard/adminไม่เพิ่มระบบธุรกิจ |
| DOC-03-02 ไม่มีบริการ/ทะเบียนซ้ำ | มีcanonicalcontact/login/download/news/help/FAQ/policies/notifications; public/privateอ้างข้อมูลกลางเดียว |
| DOC-03-03 เส้นทาง4กลุ่ม | walkthroughเอกสารและNodeVMจำลองลำดับ/ผล4เส้นทางผ่าน; ไม่ใช่browserE2EหรือAPIจริง |
| DOC-03-04 แบบร่างครบ | มี10หน้าที่สั่ง+dashboard/login/tracking รวม13หน้าและ65สถานะผิด/รอ; การสร้างmarkup13×6=78รูปแบบผ่าน |
| DOC-03-05 mobile/form/table/keyboard | ข้อกำหนดและmarkupมีครบ ฟอร์มย้อนกลับรักษาข้อมูลถูกในmodel; ผลlayout/focusจริงในbrowserยังBLOCKED BROWSER-03 |

ผลตรวจเอกสารอัตโนมัติผ่าน43/43รายการ ไม่อ้างว่าUATผู้ใช้จริงหรือWCAGผ่านจากmodel simulation

| คำสั่ง/การตรวจที่รันจริง | ผล |
| --- | --- |
| `git status --short --branch`, `git log -2 --oneline`, `git remote -v` ก่อนทำ | mainสะอาด บท01/02อยู่ในGit originยังตรง9_gpt |
| อ่านBLUEPRINT/MASTER/Charter/Progress/Decisions/OpenQuestions/Permissions/Traceability | ใช้ข้อกำหนดเดิมและประวัติร่วม ไม่มีAGENTS.mdที่ตรวจพบ |
| `node /tmp/verify_chapter03_logic.cjs` | ผ่าน144 assertions: 78render combinations, 4journeys, draftback/errors, menu/receipt/officiallearning separation; เป็นNodeVMกับDOMstub ไม่ใช่browser/keyboard/layout |
| `node --check /tmp/chapter03_inline.js` | ผ่าน syntaxJavaScriptที่สกัดจากต้นแบบจริง |
| `python3 /tmp/verify_chapter03_docs.py` พร้อมlocalserverในprocessตรวจเดียวกัน | ผ่าน43/43: เมนู/41PG/13WF/65states/4flows, REQ/TCอ้างอิง, links/tablewidth/HTMLIDs/history, noapp/migration และHTTP200ได้HTMLbytesตรงไฟล์ |
| `git diff --check` และ `git diff --cached --check` | ตรวจก่อนcommit ไม่มีwhitespace errors |
| `python3 -m http.server 8000 --bind 127.0.0.1` | เปิดserverเฉพาะเครื่องเพื่อเตรียมตรวจต้นแบบ ไม่deploy |
| `node /tmp/verify_chapter03_ui.cjs` | เริ่มไม่ได้: Playwrightไม่พบchromium_headless_shell-1234/chrome-headless-shell; ไม่มีUItestcaseใดรัน ไม่ได้สร้างภาพหน้าจอ |
| `node …/playwright/cli.js install chromium --only-shell` | exit1: ชุดดาวน์โหลดแตกไม่ได้ “End of central directory record signature not found”; ไม่พบbrowserที่ใช้งานได้ จึงไม่อ้างvisual/mobile/focusผ่าน |

การตรวจเอกสารครั้งแรกพบรหัสTC-C-MAKERที่ไม่อยู่ในcatalogบท02 แก้เป็นTC-C-SELFและรันใหม่ การตรวจHTTPครั้งแรกconnection refused จึงเริ่มและหยุดserverภายในprocessตรวจเดียวกันแล้วได้รับHTTP200และbytesตรงไฟล์ ไม่มีการใช้ผลครั้งที่ล้มเหลวอ้างว่าผ่าน

### Blocker ที่พิสูจน์ได้และวิธีตรวจต่อ

BROWSER-03: สภาพแวดล้อมไม่มีตัวbrowserและติดตั้งbrowserชั่วคราวไม่สำเร็จตามคำสั่งข้างต้น ขัดขวางการตรวจrender/keyboard/focusจริง ไม่ขัดขวางเอกสารหรือการจำลองลำดับงานด้วยfixture หลักฐานชั่วคราวมีผลfailureของPlaywrightและผลNodeVM แยกจากระบบจริง วิธีปลดคือเปิดHTMLที่ส่งมอบด้วยbrowserที่ใช้ได้ แล้วตรวจSIM-03-01–04, viewport320/375/768/1280px, Tab/Shift+Tab/Escapeในmobilemodal, focusreturnและลิงก์แก้field พร้อมบันทึกผล ไม่จำเป็นต้องติดตั้งแพ็กเกจโครงการเพื่อตรวจไฟล์นี้

### วิธีตรวจด้วยตนเองทีละขั้น

1. เปิดSITEMAPดูpublic7/app9และสามกลุ่ม; ตรวจ41pageIDsและcontact/login/download/news/help/FAQ/policies/notificationsต้นทางเดียว
2. เปิดUX_FLOWSเดินFLOW-01–04โดยใช้fixtureสมมติ ดูจบงาน/recovery/back; เปิดWIREFRAMESตามWFที่อ้าง
3. เปิดdocs/wireframes/chapter03.html หรือรันserverเฉพาะเครื่องตามคำสั่งในWIREFRAMES เลือก13หน้าและ6สถานะ ไม่มีการส่งบัญชี/ไฟล์/เงินจริง
4. เดิน4SIMตามตารางในWIREFRAMES; ถ้าExcelผิดกลับเปลี่ยนไฟล์แล้วตรวจใหม่; ถ้าคำขอขาดเหตุผลใช้ลิงก์ไปfield; ก่อน/หลังเรียนแยกผลทางการ
5. ลดหน้าจอ320/375/768/1280px ตรวจไม่เลื่อนทั้งหน้าแนวนอนนอกกรอบตาราง ใช้keyboardในdialogและformตามUX_FLOWS บันทึกผลเพื่อปิดBROWSER-03 ซึ่งบทนี้ยังไม่ได้ตรวจจริง
6. ตรวจGitด้วย `git show --stat HEAD`, `git status --short`, `git remote -v`; commitบท03เก็บในโครงการนี้ ไม่มีการpushขึ้นGitHubในบทนี้

### ข้อจำกัดและบทถัดไป

Q001–Q022ยังเปิด เจ้าของ/แบบ/อำนาจ/ปี/ผลสอบ/นโยบาย/คำเรียกจริงยังไม่ได้รับรอง การแสดงเมนูตามprofileในต้นแบบไม่ใช่serverauthorization การพิสูจน์API/RLS/Storage/worker/scan/restore/transactionและTC90กรณีบท02ยังPLANNED / NOT RUN ไม่ได้รันtypecheck/lint/test/buildของNext.jsเพราะไม่มีapp/แพ็กเกจ ไม่มีผลUATหรือscreenreaderจริง

สถานะบท03: ออกแบบและตรวจเอกสาร/ลำดับจำลองครบ พร้อมส่งมอบ มีBROWSER-03ค้างสำหรับตรวจภาพมือถือและkeyboardจริง ยังไม่ใช้ผลจำลองรับรองDOC-03-05ด้านbrowser การปิดgateตรวจจริงต้องมีหลักฐานจากbrowserที่ใช้งานได้ก่อนรับรองส่วนนี้

บท04: รอผู้ใช้ส่งพรอมป์ต์และอนุมัติแผน ไม่เริ่มหรือเดาเนื้อหา และต้องแจ้งBROWSER-03ที่ยังค้างก่อนเลื่อนไปงานที่พึ่งผลตรวจหน้าจอ

## บท04 — ออกแบบฐานข้อมูลรวมและขอบเขตข้อมูล

3 ตุลาคม2569 (2026-10-03) | รุ่นเอกสาร1.4 | ฐานบท02 134cf16 และบท03 10adf9a | ผู้ใช้อนุมัติแผนด้วยตกลง

อ่านBLUEPRINT/00_MASTER_PROMPT/PROGRESS/DECISIONSและเอกสารบท02/03ก่อนแก้ mainสะอาดที่10adf9a BROWSER-03ยังเปิด ไม่ใช่dependencyของการออกแบบข้อมูล จึงทำบท04ตามที่ผู้ใช้สั่งโดยไม่รับรองภาพ/focusแทนผลbrowser

### ไฟล์ที่สร้างหรือแก้และเหตุผล

| ไฟล์ | สิ่งที่ทำ |
| --- | --- |
| docs/ERD.md | 15ภาพความสัมพันธ์แยกมุม + บัญชีFKครบ128ตาราง ประวัติสองเวลา ขอบเขตแยก snapshot และledger |
| docs/DATA_DICTIONARY.md | ทุก1551ฟิลด์ของ128ตาราง พร้อมชนิดNULL/default/class PK/FK/unique/index/owner/scope/retentionครบcore+9ระบบ |
| docs/DATA_CLASSIFICATION.md | บัญชีชั้นทุกฟิลด์ P10/I684/R833/H24 รวมmetadata PublicDTOdenylist/allowlist/ไฟล์/JSON/retention gates |
| docs/data_model.json | บัญชีเชิงโครงสร้างสนับสนุนการตรวจเอกสาร ไม่ใช่SQL/ORM/migration |
| docs/DECISIONS.md | เพิ่มDEC-029–DEC-036และรักษาประวัติเดิม; โครงตาราง/precision/naturalkeysเป็นProposal |
| docs/OPEN_QUESTIONS.md | เพิ่มQ023–Q025พร้อมowner/evidence/impact/mock/gate ทุกQ001–Q025ยังเปิด |
| docs/PROGRESS.md | บันทึกหลักฐานบท04และข้อจำกัด โดยรักษาประวัติบท01–03 |

### Schema migrations versions

แบบlogicalรุ่น1.4 มี128ตาราง private schemaเสนอ ครบ9โมดูล+core; ยังไม่มีschemaจริง migrations0ไฟล์ ไม่รันDDL/DB/Auth/RLS/Storage/audittrigger/worker/scan/backup/restore/transaction APIหรือNext.js ไม่มีpackage/lockfile/เวอร์ชันdependencyที่เลือก ไม่มีSupabaseprojectหรือdeploy ไม่มีข้อมูลคนจริง

BLUEPRINT/MASTER/Charter1.1 requirements/traceability/permissions1.2 sitemap/flows/wireframes1.3คงเดิม เอกสารอ้างPostgreSQLcurrentเพื่อหลักการ ไม่ถือเลขเวอร์ชันเว็บอ้างอิงเป็นเวอร์ชันDBที่เลือก Q023รอข้อมูลจริง

### ผลตรวจจริงและเกณฑ์

**บท04ผ่านการตรวจแบบข้อมูล DOC-04-01–DOC-04-06 และ fixture DATA-04-01–DATA-04-06 ในระดับที่ระบุเท่านั้น**

| คำสั่ง/หลักฐานที่ตรวจจริง | ผล |
| --- | --- |
| `python3 /tmp/verify_chapter04.py` เครื่องมือตรวจเอกสารและfixtureชั่วคราว | ผ่าน318/318 แยกเอกสาร280/280และfixture38/38; ไม่ใช่เครื่องมือของappหรือSQLtest |
| DOC-04-01–DOC-04-04 | core+9โมดูล 128ตาราง/1551ฟิลด์; private/RLS/scope/owner/retentionทุกตาราง PK/FK/type/RESTRICT/compoundparentunique/FKindexครบ ประวัติ12ตาราง exactnumericไม่มีfloat |
| DOC-04-05 | 256รายการ เทียบdictionaryกับJSONทีละ128ตาราง และclassificationกับJSONอีก128ตาราง ฟิลด์ไม่ตกหล่นหรือเปลี่ยนชั้น |
| DOC-04-06 | 15Mermaidblocksชื่อ/ความสัมพันธ์ตรงFKจริง บัญชีFK128ตาราง ลิงก์/รูปตารางครบ ประวัติDEC/Qเดิมคงเดิม ไม่มีmigration/packageใหม่; ไม่ได้renderภาพMermaid |
| DATA-04-01 (8รายการ) | Personเดิมเชื่อมผู้สอน/เจ้าหน้าที่/candidate/สมัครสองปี; partialfixturefields/UUIDตรงแบบ compositeFKจำลองปฏิเสธคนผิด การตรวจปีผ่านบริการจำลองปฏิเสธenrollmentผิดปีและพบduplicateตามkeyเสนอ |
| DATA-04-02 (3รายการ) | สนามถาวรหนึ่งแห่ง center_session2/levelofferings3 ประธาน+ผู้รับ4รายการแยกรอบ snapshotเก่าคงเดิม ผูกระดับข้ามรอบถูกปฏิเสธในโมเดลcompoundFK |
| DATA-04-03/DATA-04-04 (อย่างละ3รายการ) | หน่วยจังหวัดเดียวต่างสายไม่อยู่scopeเดียว แยกปีศึกษา/งบ และประวัติสองแกนเวลา/asof[)ยังอ่านรุ่นเดิมในsnapshotได้ |
| DATA-04-05 (11รายการ) | Decimal100000→จอง20000→ผูกพัน20000→จ่าย5000 คง80000 ไม่มีหักซ้ำ retryเดิมไม่เพิ่มjournal payloadเปลี่ยนปฏิเสธ ทศนิยมเกินscale/NaN/Infinity/overflowปฏิเสธ |
| DATA-04-06 (10รายการ) | whitelistส่งเฉพาะpublic_refที่รับรอง ข้อมูลจริงTO VERIFYปิด rawID/aliasเบอร์/วันเกิด/ที่อยู่/ตัวระบุ/filekey/เฉลยปฏิเสธ และprivatefieldsชั้นHครบ |
| `git diff --check` และ `git diff --cached --check` | ผ่าน ไม่มีwhitespace errors; stagedเฉพาะ7ไฟล์บท04ก่อนcommit |

ระหว่างตรวจพบnumericพิกัดยังขาดข้อกำหนดfinite/scale จึงเพิ่มvalidationโดยไม่แทนพิกัดไม่มีหลักฐานด้วย0 ตัวตรวจclassificationครั้งแรกไปอ่านแถวaudit_logsในตารางคำอธิบายก่อนบัญชีฟิลด์ จึงแก้ให้ตรวจเฉพาะบัญชีหัวข้อ7 ตรวจทานเพิ่มความสัมพันธ์ปี/สนาม/หลักสูตรและคะแนน0 รวมเลิกindexซ้ำกับunique25รายการก่อนรันผลสุดท้าย ไม่มีการอ้างว่าข้อกำหนดเหล่านี้ทำงานบนฐานจริงแล้ว

เครื่องมือและfixtureชั่วคราวอยู่/tmp ไม่เป็นseedหรือimplementationในcommit วิธีตรวจรับด้วยการเปิดเอกสารทีละขั้นอยู่ด้านล่าง ตรวจcommitจริงด้วย `git show --stat HEAD` และความสะอาดด้วย `git status --short` หลังcommit เลขcommitอยู่ในประวัติGitและคำตอบส่งมอบ ไม่ฝังเลขcommitตัวเองในเอกสาร

แบบข้อมูลครบและผ่านการตรวจระดับเอกสาร/fixtureตามเกณฑ์บท04 ไม่ใช่การรับรองconstraints/RLS/scan/ACL/การเงินที่ทำงานบนPostgreSQLจริง ไม่แสดงMermaidผ่านbrowserและไม่อ้างว่าแผนqueryมีประสิทธิภาพโดยไม่มีEXPLAIN RuntimeTC90ของบท02ยังPLANNED / NOT RUN BROWSER-03ยังเปิด

### วิธีตรวจรับทีละขั้น

1. เปิดERDหัวข้อ2–4 ตรวจPerson/Accountแยก ภูมิศาสตร์/สาย/สังกัด/scopeแยก และปฏิทินศึกษา/งบแยก
2. ดูภาพ05–06และdictionaryของexam_center/center_session/center_session_level/exam_center_appointment ตรวจสนามเดิมใช้ต่างปี/ระดับและผู้รับ/ประธานผูกแต่ละรอบ
3. ดูperson/position_assignment/candidate/application ตรวจบุคคลสมมติเดียวใช้หลายหน้าที่/หลายปีด้วยPersonเดิม และsnapshotจากปีเก่าไม่joinชื่อใหม่ทับ
4. ดูDATA_CLASSIFICATIONหัวข้อ4/7 เทียบทุกฟิลด์กับdictionary ตรวจpublicไม่มีเลขประชาชน วันเกิด ที่อยู่/เบอร์ส่วนตัว และpolicyTO VERIFYยังปิดข้อมูลจริง
5. ดูERDledgerและbudget_posting ตรวจ100000จอง20000→ผูกพัน20000→จ่าย5000 ยอดพร้อมใช้คง80000 ดูrefsแยกรับของ/จ่าย/ทะเบียนasset
6. ดูQ023–Q025และDEC-029–036 แล้วรัน `git show --stat HEAD`, `git status --short` ที่รากโครงการ ตรวจcommitบท04และไฟล์ค้าง ไม่ถือoriginเป็นหลักฐานpush

### ข้อจำกัด ปัญหาค้าง และบทถัดไป

Q001–Q025ยังเปิด ชื่อตำแหน่ง/จศป./ศ.3/ปี/คะแนน/อำนาจ/วงเงิน/นโยบายเผยแพร่และretentionจริงยังไม่รับรอง โมเดลเป็นProposalไม่บล็อกfixture แต่gateข้อมูลจริงของเรื่องนั้นยังปิด ต้องพิสูจน์DBconcurrency/unique/exclusion/RLS/API/StorageACL/scan/restoreเมื่อมีimplementation ไม่อ้างผลPythonfixtureเป็นผลtransactionจริง

เกณฑ์บท04ผ่านระดับแบบข้อมูล BROWSER-03ยังค้างตรวจภาพมือถือ/keyboardจริงจากบท03 ไม่เลื่อนผลจำลองไปปิดgateนั้น Commitบท04อยู่ในโครงการนี้ originเดิม9_gpt ไม่มีpushบทนี้

บท05: รอพรอมป์ต์และอนุมัติแผน ไม่เดางานหรือสร้างdependencyบทถัดไป
