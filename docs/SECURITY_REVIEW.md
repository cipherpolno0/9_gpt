# Security review — บท 70

รุ่น 0.1 | 9 ตุลาคม 2569 | baseline `dcf9447` | **BLOCKED_FOR_REAL_DATA_RELEASE**

บท 69 ยัง BLOCKED การตรวจนี้อ่าน implementation ที่มีและรัน existing checks ที่เกี่ยวข้อง ไม่มี production penetration test, authenticated business DAST, scanner certification หรือการยืนยันกฎหมาย ไม่พบและยืนยัน Critical exploit ในขอบเขต starter ที่ตรวจ แต่ coverage ที่ขาดทำให้ **ยังรับรองว่าไม่มี Critical ในทั้งระบบไม่ได้**

## หลักฐานและคำสั่งที่รันจริง

| ตรวจ                                | ผลจริง                                                                                                 | ข้อจำกัด                                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `corepack pnpm test`                | exit 0; 17 ผ่าน, 0 fail/skip                                                                           | bootstrapdeny/localURL/databaseguard/time/structure;ไม่currentAuth/IDOR/maker-checker                           |
| `corepack pnpm smoke`               | exit 0; HTTP27ผ่าน                                                                                     | homepage/CSS/font/21workspace403+no-store/404;reusebuild68 ไม่browser/cross-module                              |
| `corepack pnpm audit --json`        | TIMEOUT หลัง20s;ไม่มีvulnerability counts                                                              | ไม่รายงาน0CVE ไม่ใช้pinversionsแทนadvisoryreview ไม่มีแพ็กเกจอัปเกรดจากการเดา                                   |
| Git history probe แบบอ่านอย่างเดียว | 75 reachable commits;611blob,608textตรวจ8patternclasses;matched0;trackednonexampleenv0                 | 3binaryข้าม;ไม่unpackarchive ไม่remote fetch/reflog/unreachable/ignoredprivateenv;ไม่รับรองไม่มีsecretทุกรูปแบบ |
| Source/schema/migration review      | core19models/213scalarfields;19RLS ENABLE+FORCE,0allowpolicy,0SECURITY DEFINER,PUBLIC functions revoke | PostgreSQLloopback5432/5546connect_ex111;ไม่deploy/query native runtime ใหม่                                    |
| Application source inventory        | ตรวจ10sourcefiles ไม่พบapplication `fetch()`/rawHTML sink                                              | ไม่พิสูจน์SSRFinframework/dependencies/futureadapters และไม่browser XSS test                                    |

รองรับ secret patterns: PEM private key, GitHub tokenสองรูปแบบ, Supabase secret, AWS access-key id, Google API-key pattern, Slack token, Stripe live-key pattern ไม่เก็บ matched values หรือ credential ในรายงาน Git scan ของ local refs ณ baselineเท่านั้น ผลจาก [lesson70-results.json](../tests/results/lesson70-results.json) ส่วน external/APM/DB/CI logs ไม่ได้เข้าถึงหรือสแกน

## Coverage จาก implementation

| เรื่อง                    | ข้อพบ source จริง                                                                          | ผลการตรวจ / งานค้าง                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Server authorization/IDOR | workspaceทั้งหมดdeny403/no-store;ไม่มีUser/Session/RoleAssignment/DAL                      | PARTIAL_DENY_ONLY;ต้องA/B positive,หมดอายุ,maker-checkerทุกaction/workerตามบท67                                           |
| CSRF                      | ไม่มีauthenticated state-changing action; methods workspaceปิด                             | NOT_APPLICABLE_CURRENT_SURFACE;ไม่CSRF_PASS ต้องorigin/token/sessiondesignเมื่อmutationเปิด                               |
| XSS                       | starterเป็นTSXข้อความคงที่;ไม่มีCMS/richtextหรือrawHTMLsinkในappsource                     | SOURCE_REVIEW_ONLY;ต้องpayload/storage/sanitizer/preview/PDF/browserจริงเมื่อCMSพร้อม                                     |
| SSRF                      | localServices/localDB guardจำกัดprotocol/loopback/query options;ไม่userURLfetchในappsource | unitguardผ่านเฉพาะlocaltools ไม่SSRFguardของweb;remoteURLadaptersยังNOT_RUN                                               |
| Upload/isolation          | Documentมีmetadata ไม่มีFileVersion/scan/storage/parser                                    | BLOCKED_NOT_IMPLEMENTED;ไม่ใช้extensioncheckหรือแผนlimitsเป็นisolationproof                                               |
| Secret/dependency         | checkerแบบpatterns, versionspin;historyscanมีขอบเขต;advisoryaudittimeout                   | PARTIAL_SCAN;ต้องbinary/artifact reviewและauditสำเร็จก่อนrelease                                                          |
| Logs/audit                | worker/seed/localguardsใช้genericcatch;SQLauditเก็บfieldnames+ids ไม่rawold/new            | SOURCE_REVIEW_ONLY;canaryruntime/collectorsยังไม่รัน;`scripts/database.mts` child stdout/stderr inherit ต้องทบทวนก่อนจริง |
| Session revocation        | ไม่มีAuth/session backend                                                                  | NOT_IMPLEMENTED;ไม่มีtestrevokedcookie/JWT/MFA/rolechange                                                                 |
| Job privileges            | workerSELECT1/RedisPING, local-onlyconnection                                              | ไม่มีbusinessworkercontext/revalidate/receipt;servicecredentialไม่อำนาจธุรกิจ                                             |
| DB controls               | RLSforced/defaultdeny, FKRESTRICT/historyimmutable/auditappend-onlyในmigration             | sourceเท่านั้น;superuser/DDLสามารถข้ามหรือแก้โครงสร้างได้ ต้องแยกruntime/DDL rolesและnativeproof                          |
| Public/private cache      | starterpubliccache;workspace no-store                                                      | ไม่positiveprivateA/B isolation, releasewithdraw/search/export/cdn test                                                   |

## Issue list

Severityต่อไปนี้เป็นระดับเสนอเพื่อจัดงาน ไม่ใช่CVSS และไม่เพิ่มความรุนแรงจากการขาดimplementationเป็นexploitที่ยืนยัน ทุกissueมีownerหน้าที่เสนอ; assignee/ผู้รับความเสี่ยงจริงยังว่าง ไม่มีการตั้ง deadline หรือเซ็นรับความเสี่ยงแทนหน่วยงาน

| รหัส   | severity / ประเภท                     | evidence                                                                | remediation และเกณฑ์ปิด                                                                                                      | owner / status                        | residual risk                                                     |
| ------ | ------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------- |
| S70-01 | High / real-data gate gap             | ไม่มีAuth/DAL/grants/session;bootstrap403                               | centralAuth+verifiedaccount/currentDAL/RLSlimitedrole/sessionrevoke;native9systems positive/negativeครบ                      | C02; CONTAINED_OPEN                   | starterdenyลดsurface แต่ยังเปิดbusinessจริงไม่ได้                 |
| S70-02 | High / file/import/worker gap         | ไม่มีFileVersion/scan/parser/outboxbusiness                             | implementตามdependency, verifyquarantine/scan/ACL/zip/memory/retry/jobcurrentprivilege                                       | C02 + O08/O09; CONTAINED_OPEN         | ไม่มีช่องทางuploadขณะนี้;metadataไม่evidenceofscan                |
| S70-03 | High / approval/transaction gap       | ไม่มีbudget/seat/stock/decisionservices                                 | maker-checker/authoritydelegationexactversion+DBlocksuniqueidempotency และnativeconcurrency                                  | O04/O05/O06/O07 + C02; CONTAINED_OPEN | ไม่มีbanktransfer;การเปิดโดยไม่มีcontrolsเสี่ยงเงิน/คะแนน/ประวัติ |
| S70-04 | High / governance gate gap            | Q005/Q008/Q009/Q016/Q025ยังเปิด;signoffไม่มี                            | appointeddecider+purposebasis/fieldpolicy/minors/retentionhold/evidence+runtimegate+positive/negativeproof                   | C03 + owners; NEEDS_LEGAL_REVIEW      | enumVERIFIED/isPublicEligibleไม่คำอนุมัติหรือlegalbasis           |
| S70-05 | High / supply-chain unknown           | pnpmadvisoryauditTIMEOUT20s                                             | auditisolated environmentที่เข้าถึงadvisoriesได้, triagereachability/CVE/patch+retest+lockreview                             | C02; UNVERIFIED_OPEN                  | vulnerabilitycountsNULL ไม่0;ยังไม่รู้criticaldependency          |
| S70-06 | Medium / log redaction coverage       | childtoolstdioinherit;ไม่มีruntimecanary/collectors access              | safe structuredallowlist/redactionก่อนemit, fakecanariesในprotectedtestcollector ไม่มีrealcredential;testdriver/APM/CI/trace | C02 + C03; UNVERIFIED_OPEN            | ไม่ได้พบpasswordleakจริง แต่ยังพิสูจน์ว่าlogsทุกช่องไม่รั่วไม่ได้ |
| S70-07 | Medium / secret scan coverage         | supportedpattern0แต่3binary/localrefsonly                               | boundedbinary/archive/artifact/history/CIreviewไม่ส่งrepo/secretไปthird-party;เมื่อพบrevoke/rotate+incidentproof             | C02; UNVERIFIED_OPEN                  | genericsecret/remote/unreachable/logsไม่ได้ตรวจ                   |
| S70-08 | Medium / browser/deployment hardening | NextconfigpoweredByHeaderfalse;ไม่มีexplicitCSP/securityheadersในconfig | กำหนดheadersที่เหมาะกับNext/scripts/fonts, verifyactualTLS/cookies/framepolicy/browser ไม่ใส่CSPที่ทำUIพังแบบเดา             | C02; PROPOSAL_OPEN                    | ไม่ยืนยันXSSexploit;deployment/TLS/browserไม่มีproof              |

## Release criteria ที่เสนอและการควบคุมปัจจุบัน

Confirmed: deny-by-defaultทุกช่องทาง, maker-checker, mock-onlydev, nosecretlogs, privatefilescanACL, unconfirmedpolicyไม่ผลิตผลทางการ Proposal: release gate ของฟีเจอร์ต้องไม่มีconfirmedCriticalที่เปิดอยู่ ไม่มีHighที่ยังไม่ปิดสำหรับข้อมูลจริง และไม่มีUnknown coverage ที่จำเป็นต่อความเสี่ยงนั้น ไม่ใช้ blanketacceptanceปิดCritical;ถ้าฟีเจอร์ถูกตัดออกต้องมีหลักฐานว่าroute/job/export/cacheทุกทางปิดจริง พร้อมเจ้าของขอบเขต ไม่ใช้เพียงเอกสารว่าdisabled

ตอนนี้containmentที่มีจริงคือworkspace403และไม่มีbusinessroutes/uploads/worker ข้อกฎหมายยังค้างให้ปิดเฉพาะ real-data/official/public feature ที่เกี่ยวข้อง **ไม่หยุด unit/source/isolated TEST work** เมื่อruntimeพร้อม การเปิดฟีเจอร์ต้องผ่าน [DATA_GOVERNANCE_SIGNOFF](DATA_GOVERNANCE_SIGNOFF.md) และหลักฐานsecurityของversionเดียวกัน รายการopenทั้งหมดไม่ถือว่าปิดจากการรันscanner

AC70-01 **PARTIAL/BLOCKED**: supportedpatternscan/unit/smokeผ่าน แต่dependency/secret-log coverageและbusinesssecurityขาด AC70-02 **BLOCKED**: ไม่มีappointeddecider/evidence/runtimegateเพื่อปลดofficialfeatures ไม่มีrelease/signoffและไม่เริ่มบท71

อ้าง [OWASP ASVS](https://owasp.org/projects/asvs) และ [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) เป็นกรอบทบทวน ไม่เป็นการรับรองจากOWASP ไม่อัปโหลดsourceหรือข้อมูลบุคคลจริงไปบริการscannerภายนอก
