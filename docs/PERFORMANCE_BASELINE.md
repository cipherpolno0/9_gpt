# Performance baseline — บท 69

รุ่น 0.1 | 9 ตุลาคม 2569 | source baseline `fc22ce8` | **BLOCKED / PARTIAL_DIAGNOSTIC**

บท 68 ยังไม่ผ่าน มีเพียงหน้า starter และ workspace ที่ปิดทุก method ด้วย 403 ยังไม่มีบริการค้นผลสอบ, importer, แบบทดสอบ, คิวเอกสาร หรือ authenticated response สำหรับพื้นที่ A/B จึงยังไม่มี executable load-test scripts ของสี่ workload ธุรกิจ ไม่ใช้ mock response หรือผล 403 แทนการทดสอบบริการจริง

## อ่านผลทีละขั้น

1. เป้าหมายคือค่าที่เสนอให้เจ้าของงานพิจารณา ส่วนผลวัดต้องมาจากคำสั่งที่รันและมี sample จริง
2. p95 ใช้วิธี nearest rank: เรียงเวลาจากน้อยไปมาก เลือกตำแหน่ง `ceil(0.95 × N)` รวมเวลาอ่าน response body และเก็บ request ที่ผิดพลาดด้วย ไม่ตัด timeout ออกเพื่อทำให้ค่าดูดี
3. workload ต้องระบุข้อมูล, concurrency หรืออัตราส่ง, ระยะเวลา, warmup, เครื่อง server/DB/worker/load generator, เครือข่าย, cache และ connection pool จึงเปรียบเทียบแต่ละรุ่นได้
4. วัดแยก cold/warm cache, งานที่สำเร็จ/ถูกปฏิเสธ, foreground/background และเวลารอคิว ห้ามรวม latency ของ error ที่ตอบเร็วเป็นความเร็วของงานที่สำเร็จ
5. วัดความถูกต้องพร้อมความเร็ว เช่นใบสมัคร/receipt ไม่ซ้ำ, คะแนนยังไม่เผยแพร่ไม่ออก public, ledger ไม่ถูกหักซ้ำ และ private response ไม่ปน cache
6. เมื่อสิทธิ์, rule หรือ release เปลี่ยน ให้ revalidate ตามต้นทาง ห้ามเพิ่มสิทธิ์หรือลดการตรวจเพียงเพื่อให้ตัวเลขเร็วขึ้น

## ผลที่รันจริงครั้งนี้

คำสั่งตรวจ `node --input-type=module` เป็น probe ชั่วคราวแบบอ่านอย่างเดียว ไม่ใช่ load harness ที่เพิ่มใน repository เปิด built Next server ที่ `127.0.0.1:3119` ด้วย `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3119` และหยุด process หลังจบ ปิดการแสดง stdout/stderr ของ server ไม่บันทึก credential/header/body ส่วนตัว ใช้ Node fetch ไม่มี browser

Protocol: readiness retry ไม่เกิน 60 ครั้งและไม่รวมใน sample; warmup GET `/` 10 ครั้ง; closed loop 4 concurrent request loops ไม่มี think time รวม GET 120 ครั้ง timeout 3000 ms อ่าน body จบก่อนจับเวลา; จากนั้นตรวจ 3 workspace paths × 7 methods รวม 21 ครั้ง ไม่วัดธุรกรรมหรือแก้ข้อมูล อ่าน metrics จาก process เฉพาะ PID server แต่ไม่มี RSS sample ที่อ่านได้ ไม่มีการสร้างฐานข้อมูลหรือเริ่ม business worker

| รายการ                         | ค่าจริง                              | ขอบเขต                                                                                                |
| ------------------------------ | ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| เวลาเริ่ม–สิ้นสุด UTC          | 2026-10-09 14:23:04.324–14:23:06.858 | เวลาไทย 21:23:04.324–21:23:06.858 รวม startup/diagnostics                                             |
| จำนวน sample / concurrency     | 120 / 4                              | HTTP clients จำลอง ไม่ใช่ผู้ใช้งานจริง                                                                |
| ช่วงวัดโหลด                    | 579.385002 ms                        | ไม่รวม startup, readiness และ warmup; สั้นเกินใช้รับรอง capacity                                      |
| p50 / p95 / max                | 19.133044 / 27.182204 / 34.835860 ms | nearest rank; HTTP loopback รวมอ่าน HTML                                                              |
| HTTP status/transport ผิดคาด   | 0/120 (0%)                           | เฉพาะ GET หน้า starter ซึ่งคาดหวัง 200                                                                |
| Public cache header            | `s-maxage=31536000`                  | หน้า starter มีแต่ข้อความประกาศเตรียมบริการ ไม่ใช่ผลสอบหรือ private data                              |
| Workspace denied/no-store      | 21/21                                | `/app`, `/app/admin`, `/app/exams/imports`; GET POST PUT PATCH DELETE OPTIONS HEAD ได้ 403 + no-store |
| RSS / XLSX worker peak / queue | NOT_MEASURED / NOT_RUN / NOT_RUN     | RSS sample 0; ค่า memory ว่าง ไม่รายงานเป็นศูนย์                                                      |

เครื่องจริง: Linux kernel 6.18.44 x86_64, Node v24.19.0, logical CPU ที่เห็น 9, cgroup `cpu.max=800000 100000` (quota 8 CPU), memory limit 8589934592 bytes (8 GiB); load generator กับ server อยู่ container เดียว ไม่มี TLS/CDN, WAN, browser JS, PostgreSQL query, upload, parser หรือ queue ในชุดวัดนี้ ไม่ extrapolate จำนวน request เป็นการรองรับทั้งประเทศ และไม่เทียบกับเป้าหมาย p95 ค้นผลสอบ 2 วินาที

raw timing samples/config และการตรวจสี/HTML อยู่ใน [lesson69-results.json](../tests/results/lesson69-results.json) ไม่มีชื่อบุคคลหรือข้อมูลจริง build ที่ใช้มาจากบท 68 ไม่ได้ build หรืออ้างว่า rerun suite เดิมในบท 69 runtime/schema/package/lock ไม่เปลี่ยนจาก baseline

## Workload ธุรกิจที่เสนอ — ทั้งหมด NOT_RUN

รายละเอียดเครื่องและข้อมูลต่อไปนี้เป็น **Proposal** ไม่ใช่สิ่งที่ provision หรือสร้างแล้ว เป้าหมาย Q014 ยัง TO VERIFY ต้องทดสอบ smoke ขนาดเล็กก่อนเพิ่ม ไม่ทดสอบ production

| รหัส             | ข้อมูล TEST ที่วางแผน                                                                              | โหลด / ระยะเวลาเสนอ                                                                              | เป้าหมายเสนอที่ต้องพิสูจน์                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| P69-01 ค้นผลสอบ  | 200000 release rows, 5 ปีการศึกษา, 12 กลุ่มสอบ; snapshot สมมติ; เผยแพร่เฉพาะ DEMO ตาม policy       | 50 VU, ramp 60 s, warmup 120 s, steady 600 s, 1 query/VU/2 s; แยก cold/warm cache และ no-match   | successful search p95 ≤ 2000 ms, unexpected error < 1%; draft/withdrawn รั่ว 0                              |
| P69-02 Excel     | 10 หน่วยงาน TEST, 1 ไฟล์/หน่วยงาน, รวมไม่เกิน 20000 data rows; ทุกฟิลด์ตัวตนเป็น text              | upload 10 พร้อมกัน; parser 1 child/runner ตามแผนบท 60; ทดสอบ boundary และ invalid file แยก valid | upload acknowledgement p95 ≤ 2000 ms; job ≤ 15000 ms ตามแผนเดิม; invalid commit 0; memory ต้องมีหลักฐานจริง |
| P69-03 แบบทดสอบ  | 100 TEST learners, 9 กลุ่มเรียน, 20 ข้อ/attempt; ชุดสุ่มมี seed และรุ่น                            | 100 VU, ramp 60 s, steady 600 s; save 1 คำตอบ/30 s, submit แยกช่วงท้าย                           | save p95 ≤ 2000 ms, unexpected error < 1%; lost/repeated answer 0; answer key/คะแนนเพื่อนรั่ว 0             |
| P69-04 คิวเอกสาร | 20 TEST senders × 20 recipient snapshots = 400 expected receipts, FileVersion กลางที่ผ่าน scan/ACL | ส่ง 20 เรื่องใน 60 s, observe ≥ 600 s, consumer crash/ACK retry แยกรอบ                           | enqueue p95 ≤ 2000 ms, oldest pending age ≤ 60 s ใน steady; drain ≤ 300 s หลังฟื้น; duplicate receipt 0     |

เครื่อง staging เสนอสำหรับการเปรียบเทียบ: app 2 vCPU/2 GiB หนึ่ง instance, DB PostgreSQL 2 vCPU/4 GiB หนึ่ง instance, worker runner 2 vCPU/1 GiB หนึ่ง instance, load generator 2 vCPU/2 GiB แยกเครื่อง เครือข่าย region เดียว ต้องบันทึก instance/DB version, storage, pool size, จำนวน replica, network shaping และ software commit จริงก่อนรัน ยังไม่ตั้ง connection limit/queue quota จากการเดา หากเปลี่ยนขนาดให้สร้าง run ใหม่ไม่รวมเป็น baseline เดียว

เพดาน XLSX อ้าง [parsing-plan.json](../tests/fixtures/system09/parsing-plan.json): 10 MiB upload, 2000 แถวรวม, 50000 cell nodes, ZIP expanded total 40 MiB/per-entry 8 MiB, 256 entries, hard child memory 256 MiB, V8 old heap 128 MiB, 1 child/runner ยังเป็น **PROPOSAL_NOT_ENFORCED** ไม่ใช่เพดานที่พิสูจน์แล้ว วัด heap/RSS/process tree/exit reason, cgroup peak/OOM, scratch/IPC และ web latency ระหว่างไฟล์ขอบเขตกับ ZIP bomb; RSS snapshot หรือ heap limit อย่างเดียวไม่รับรอง memory isolation

## Query, pool และ cache ที่ต้องตรวจเมื่อ owner services พร้อม

- `EXPLAIN (ANALYZE, BUFFERS)` เฉพาะ read queries บนฐาน isolated: dataset/cardinality จริงของ fixtures, time rows buffers spill, query fingerprints ไม่ใส่ค่าตัวตนใน log ไม่วัด query plan ที่ไม่มี business table
- ตรวจ stable pagination และ tie-breaker, ขอบเขตช่วงปี/พื้นที่ก่อน count/page, deep pages และ concurrent change; index ตาม plan หลักฐานจริง ไม่เพิ่ม index แบบเดา ตรวจ query count ต่อ request เพื่อหา N+1 ก่อนและหลังแก้
- วัด active/idle/waiting connections, pool acquisition wait และ exhaustion ระหว่าง web/worker; RLS/request context ต้อง reset ถูกต้องเมื่อคืน connection; รวม pool ของทุก instance ไม่ถือว่า cache/pool ให้สิทธิ์ใหม่
- Cache สาธารณะใช้ approved field policy + released snapshot เท่านั้น key รวม release/policy/filter/page version; ถอน/แทน release invalidates HTML/API/export/CDN พร้อมกัน Private response ต้องมี no-store หรือ private policy ที่ยืนยัน และไม่ถูก shared cache; tests ต้องมี authorized positive ของผู้ใช้ A/B ไม่ใช้ 403 ทุกคนแทน isolation
- งานอ่านรายงานไม่สร้าง transaction ใหม่และ reconcile source ได้ consumer/report failure ไม่ทำ source ซ้ำ ตรวจคิว waiting/active/retry/dead-letter จำนวนจริงพร้อมเวลาสดของ metric

ดู [LOAD_CASES](../tests/performance/LOAD_CASES.md) และ [workload-plan](../tests/fixtures/performance/workload-plan.json) สำหรับ oracle และ recovery ไม่มีผล query plan, N+1, pooling, authenticated cache isolation, parser peak หรือ queue recovery ในรอบนี้

## Gate และข้อจำกัด

AC69-01: **PARTIAL** มีตัวเลขจริงของ starter และข้อจำกัดครบ แต่ไม่มีผลสี่ workload ธุรกิจ AC69-02: **BLOCKED_NOT_RUN** private A/B cache isolation และเพดาน XLSX/worker memory ยังไม่มีหลักฐาน ต้องผ่านบท 68 และ dependencies ก่อนติดตั้ง/เขียน load harness ตามแผนใหม่ที่ได้รับอนุมัติ ตาม [00_MASTER_PROMPT](../00_MASTER_PROMPT.md) ข้อ 2 ไม่มีการเปลี่ยน runtime เพื่อทำให้ mock ผ่าน ไม่เริ่มบท 70
