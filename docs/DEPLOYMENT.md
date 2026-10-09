# การเตรียม CI และ deployment

รุ่น 0.1 | บท71 | 9 ตุลาคม 2569 | CONFIGURATION_PROPOSAL / STAGING_NOT_RUN

บท70ยัง BLOCKED_FOR_REAL_DATA_RELEASE ระบบปัจจุบันเป็น starter/core0.6.0 ไม่ใช่ portal ธุรกิจครบเก้าระบบ เอกสารนี้และ config เป็นงานเตรียมที่ตรวจทานได้ ไม่ได้เปิดบริการหรือปลดล็อกข้อมูลจริง ดู [ผลจริง](../tests/results/lesson71-results.json), [security](SECURITY_REVIEW.md) และ [แผน environment](../deploy/environments.plan.json)

## 1 แนวคิดและสิ่งที่มีจริง

1. CI ตรวจว่า source รุ่นหนึ่งติดตั้งและตรวจพื้นฐานได้ ส่วน staging ตรวจการทำงานร่วมกับบริการจริง สองอย่างนี้มีหลักฐานคนละชุด
2. การแยก environment แยกข้อมูล สิทธิ์และกุญแจ แต่ในแต่ละ environment ใช้ Person Organization Document และทะเบียนใบสมัครกลางชุดเดียว ไม่สร้าง login หรือทะเบียนอีกเก้าชุด
3. Backup ต้องกู้คืนไฟล์ ตัวตนและความสัมพันธ์ได้ด้วย ไม่ใช่เพียง SQL สำเร็จ ดู [BACKUP_RESTORE](BACKUP_RESTORE.md)

Confirmed stack จาก BLUEPRINT/MASTER/ADR001: Next.js16.3.8, Prisma7.10.0, Node24.19.0, pnpm11.28.2, PostgreSQL, Redis, Vercel, Supabase PostgreSQL/Auth/Storage/RLS ใช้ portal และ repository เดียว ไม่ตีความ hosting เดียวเป็น process ทุกตัวอยู่ใน Vercel request เดียว วิธี hosting งานยาวยังต้องยืนยัน Q011; ไม่เสนอให้ timer worker ปัจจุบันรันเป็น serverless request ถาวร

compose.yaml มีเฉพาะ PostgreSQL18.6/Redis8.10.2ใน loopback สำหรับทดลอง ไม่มี HTTPS/OIDC/private storage หรือ production topology `localServices()` อนุญาต APP_ENV=local และ loopback เท่านั้น ห้ามนำ guard นี้ออกเพื่ออ้างว่า worker รองรับ stagingแล้ว `worker:check` ตรวจ SELECT1/PING ไม่ได้ประมวล outbox งานธุรกิจ

## 2 CI config ที่ส่งมอบ

[ci.foundation.proposed.yml](../deploy/ci.foundation.proposed.yml) เป็น YAML ครบชุดอยู่นอก `.github/workflows` จึง **ไม่ถูก GitHub เรียกใช้** มี manual trigger และ enable variables ปิดโดยปริยาย ไม่มี deploy job ไม่มี production secret หรือ id-token write permissions ก่อน promote ต้องตรวจ source/action provenance/advisories และ policy CI โดย C02/C03 ที่ได้รับแต่งตั้งจริง

Foundation job: frozen install → lint → typecheck → unit → schema validation → SQL/WASM supplemental migration checks → supported-pattern secret scan → build → starter HTTP smoke → artifact metadata เฉพาะชื่อ checks/outcomes/commit/run ไม่อัปโหลด .env, dump, logs, auth state, screenshots, source files หรือ private evidence Full historical format check ยังมีคำเตือนเดิม จึงไม่เพิ่มเป็น gate ที่อ้างว่าผ่าน

Native job แยก protected environment `synthetic-ci`, ephemeral PostgreSQL/Redis ต่อหนึ่ง runner รอ health checks ใช้ secrets `CI_PG_PASSWORD` และ `CI_TEST_DATABASE_URL` ที่เจ้าของ environment ตั้งจากค่าเดียวกัน URL ต้องชี้ localhost:5432, user ci_migrator, database `sangha_ch06_test_ci` ตาม guard ไม่แสดง URL ใช้ APP_ENV=local เพื่อทดสอบบริการใน runnerเท่านั้น ไม่ใช่ staging ค่า Redis ไม่มี auth ใช้เฉพาะ runner แยกที่ไม่มีข้อมูลจริง ห้ามใช้ config นี้เป็น Redis production

`db:test` สร้างฐานทดลองใหม่/ตรวจรุ่นและ migrate deploy ก่อน native core tests จากนั้น worker readiness; ทั้งสองต้องสำเร็จ jobจึงผ่าน Raw child output ถูกตัดออกจาก CI ไม่เผยแพร่เพื่อเลี่ยงปัญหา masking S70-07; การวิเคราะห์ failure ใช้ diagnostics ที่ตรวจ redaction ใน environment จำกัดสิทธิ์ภายหลัง ไม่อ้างว่ามีระบบ diagnostics แล้ว ไม่ใช้ SQLite/PGlite เป็นหลักฐาน locks หรือ business invariants

Actions pinเต็ม40hex ไม่ใช้ mutable tags; checkout/setup-node pins ต้องยืนยัน upstream provenance และ vulnerability ใหม่ก่อน enable รอบนี้หน้า release/commitสองตัวเรียกไม่ได้ upload-artifact commit ตรวจจาก upstreamได้ Container tagsล็อกรุ่นแต่ยังไม่ได้ pin registrydigest จึงเป็น gate ค้าง ไม่ถือว่าการ pin เท่ากับรับรองว่าไม่มีช่องโหว่ Artifactเก็บ7วันเป็นข้อเสนอสำหรับ metadataทดลอง ไม่ใช่นโยบายไฟล์บุคคล

## 3 Environment และ least privilege

| Process / บริการ | สิทธิ์เสนอ                                                                                                | หลักฐานก่อนเปิด staging                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Web              | scoped application role, current actor/action/scope/time; ไม่ใช้ migrator/service bypass เป็นผู้ใช้ทั่วไป | positive/negative DAL, CSRF/session revoke, private no-store     |
| Worker           | role ตาม handler, revalidate current assignment/delegation, ไม่ impersonate admin ทุกระบบ                 | duplicate/order/crash recovery และ denial ของ worker             |
| Migrator         | DDL เฉพาะ protected deployment job ไม่มีใน web/worker                                                     | migration compatibility และ RLS review                           |
| Backup/restore   | scoped backup account ที่เก็บครบโดยไม่ตกหล่นจาก RLS; restoreเฉพาะ target แยก                              | owner ยืนยัน grants และ completeness; ไม่เพิ่ม superuser ให้ web |
| Redis / storage  | TLS authenticated endpoint, private network/bucket, scoped prefixes/version actions                       | canary พร้อม ACL/scan; public object listing ปิด                 |
| Identity         | Supabase Auth และ OIDC provider/client/claims/session policyที่ยืนยัน                                     | ไม่สร้าง login อีกชุด; isolated test accounts/login/revoke       |

แยก dev/staging/production provider projects DB Redis namespaces buckets keys OIDC redirect/audience/clients รวม logs และ backup destinations ใช้ environment secret references ไม่ commit .env ไม่ dump process environment ผู้มีสิทธิ์เทคนิคไม่มีสิทธิ์อ่านทุกหนังสือหรืออนุมัติตนเอง การเชื่อม deployment OIDC ใช้ subject/audience ผูก repo/ref/protected environment เป็นข้อเสนออีกส่วน แยกจาก end-user OIDC

HTTPS hostname/certificate, region, data residency, connection pool, worker provider/concurrency และ alert recipients ยัง TO VERIFY ไม่มี endpoint ที่ provisionแล้ว Livenessตอบข้อมูลขั้นต่ำ Readinessตรวจ DB/Redis/storage/auth แบบ protected ไม่ส่ง URL/usercounts/secretออก public Monitor latency/error/queue age/retries/DLQ/pool saturation/backup freshness/failedrestore/unauthorizedattempt โดยไม่ log payloadตัวตน/token

## 4 Clean checkout และ smoke gate

คำสั่งตรวจพื้นฐานที่ใช้หลัง clean checkout (ไม่คัดลอก .env/node_modules/.next):

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm db:validate
corepack pnpm db:test:sql
corepack pnpm secrets:check
corepack pnpm build
corepack pnpm smoke
```

หยุดเมื่อ install/checkใดล้มเหลว ไม่ติดตั้งด้วย --no-frozen-lockfile ไม่ปิด supply-chain policy สำหรับภาพที่ buildแล้ว บันทึก commit/lock checksum/migration checksum/image digest/Node/pnpm/policy/rule versions ก่อน deploy ใช้ immutable artifactเดียวที่ตรวจแล้ว ไม่ rebuild จาก floating dependencies

| Staging smoke      | เกณฑ์                                                                        | ผลรอบ71 |
| ------------------ | ---------------------------------------------------------------------------- | ------- |
| Public / HTTPS     | หน้า/asset ไทย, TLS, no private data/cache leak                              | NOT_RUN |
| Login / admin      | test accounts จริง 401/403/current scope/revoke/adminไม่มี business wildcard | NOT_RUN |
| DB                 | scoped role, native RLS/constraints/migration status/pool                    | NOT_RUN |
| File               | upload type/scan/version/read/download/ACLและไฟล์ผิดสิทธิ์ถูกปฏิเสธ          | NOT_RUN |
| Worker             | scoped consume retry/crash/DLQ ไม่มีผลข้างเคียงซ้ำ                           | NOT_RUN |
| ระบบ1 บุคคล        | เสนอ→checker→มีผล→สิทธิ์ปัจจุบัน/history                                     | NOT_RUN |
| ระบบ2 หน่วยงานสนาม | scope/วันมีผล/แม่บทกับรายรอบ                                                 | NOT_RUN |
| ระบบ3 เรียน        | pre/lesson/post แยกผลทางการ                                                  | NOT_RUN |
| ระบบ4 คำขอ         | draft/revision/maker-checker/activation/tracking                             | NOT_RUN |
| ระบบ5 สอบ          | eligibility/seat/score/release/ถอนเผยแพร่                                    | NOT_RUN |
| ระบบ6 งบ           | exact ledger/concurrency/periodclose/reconcile                               | NOT_RUN |
| ระบบ7 พัสดุ        | partialreceipt/stock lock/custody/reversal                                   | NOT_RUN |
| ระบบ8 หนังสือ      | version/hash/ACL/recipient snapshot/receipt/hold                             | NOT_RUN |
| ระบบ9 Excel        | bounded parse/dryrun/atomiccommit/retry                                      | NOT_RUN |

ใช้กรณี [UAT_MASTER](UAT_MASTER.md) และ [TEST_MATRIX](TEST_MATRIX.md) พร้อม synthetic accounts/หลักฐาน privateที่ตรวจแล้ว public/login/admin blanket403 ไม่ถือว่า positive flowผ่าน ห้ามส่งอีเมลจริง ธนาคาร NBMS e-GP หรือ signingproviderจาก smoke

## 5 Migration และ release

Schema0.6.0 migrationเดียว `20261003130000_core_foundation` SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่เพิ่มหรือแก้ SQL ที่ applyแล้ว บท71ไม่เปลี่ยน schema/package/lock/runtime

แนวทางเสนอ: expand nullable/additive schema → deploy reader/writer ที่เข้ากันได้ N/N-1 → bounded resumable backfill → reconcile/constraints → switch → contract ใน releaseถัดไปเมื่อ old web/workers drainแล้ว ตรวจ event/rule/template compatibilityด้วย protected migratorรัน `migrate deploy`ครั้งเดียวต่อ environment ไม่ใช้ `db push`, reset, seedข้อมูลจริงหรือ down migrationอัตโนมัติ Existing db:migrate:local guardไม่ใช่เครื่องมือ staging migration ดู [ROLLBACK_RUNBOOK](ROLLBACK_RUNBOOK.md)

Releaseต้องผ่าน70ของ featureนั้น, native/business smoke, redaction/advisories, clean stagingและ restore drill พร้อม appointed owner ไม่สร้างแผนใช้งานจริงจาก green foundationเพียงอย่างเดียว บท72ยังไม่เริ่ม

## แหล่งอ้างอิงทางเทคนิค

- [GitHub secure use](https://docs.github.com/en/actions/reference/security/secure-use): least privilege, immutable action SHA และข้อจำกัด masking
- [Vercel function limits](https://vercel.com/docs/functions/limitations): ต้องเลือก runtimeงานยาวจากข้อจำกัด providerที่ยืนยัน ไม่ถือ request เป็น daemon
- [ADR001](ADR/001-stack.md), [ADR002](ADR/002-core-database.md) และ BLUEPRINT เป็น stackbaseline
