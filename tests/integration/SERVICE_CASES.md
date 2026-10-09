# Integration บริการกับ PostgreSQL จริง — บท 67

รุ่น0.1 **PLAN_ONLY / ALL_NOT_RUN** อ่าน [TEST_MATRIX](../../docs/TEST_MATRIX.md), [TEST_RESULTS](../../docs/TEST_RESULTS.md), [fixture](../fixtures/test67/test-plan.json) core06 suiteที่มีจริงอ้าง [core.integration.ts](../database/core.integration.ts) ผ่าน pnpm db:test ไม่ยิงfileโดยตรงข้ามguard/migration ขณะนี้nativeentrypoint exit1 และบริการด้านล่างยังไม่มี

| case_id | schedule/faultและข้อมูลสมมติ                                                    | independent persisted assertions                                                                                            | execution |
| ------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------- |
| D67-01  | scope A/B+self/ancestorต่างสายกับlimitedDBroles                                 | positiveA/Bพร้อมnegative54families currentRLS/contextไม่มีcount/export/file/workerB                                         | NOT_RUN   |
| D67-02  | history effective/recorded overlap/supersede/rollback/future                    | oldname/assignment snapshotsอยู่ครบ UTC/Bangkokcutถูก futurependingไม่effective auditrollbackไม่orphan                      | NOT_RUN   |
| D67-03  | สองconnectionsอนุมัติ+allocateสนามเปิดcapacity1 สองeligibleApps                 | หนึ่งsuccess/หนึ่งcapacityconflict approved-seatatomicตาม37 unique(session,center,seat) nooversubscribe retrykeyไม่seatใหม่ | NOT_RUN   |
| D67-04  | budget100000 reserve70000กับ50000พร้อมกัน                                       | สำเร็จรายการที่รองรับหนึ่งรายการ อีกinsufficient ไม่มีnegative balance exactsourceledger/outboxหนึ่งeffect retrykeyเดิมnoop | NOT_RUN   |
| D67-05  | budget100000 reserve20000→commit20000→pay5000 และreversal/periodclosed          | available80000ทุกขั้น outstandingcommit15000หลังจ่าย หมวดไม่ทับกัน reversalsource/evidenceครบ closedperioddeny              | NOT_RUN   |
| D67-06  | stock5 issue4กับ3แข่ง รับเกินorder/partialreceiptและconversionwrongunit         | issueสำเร็จหนึ่ง ยอดเหลือ1หรือ2ตรงwinner no negative/no duplicate movement partialorderไม่ปิดงบ/payเอง                      | NOT_RUN   |
| D67-07  | transfer3 source5 destination2 และfailหลังdebitก่อนcredit                       | successsource2dest5 sum7หน่วยเดียว; failureทั้งสองยอด/movement/outboxไม่เปลี่ยน retryไม่creditซ้ำ                           | NOT_RUN   |
| D67-08  | webกับExcelcommit businesskeyเดียวกัน concurrent/สองbrowser/samekeychangedbody  | onecentralPerson/Candidate/Applicationตามverifiedidentity originalreceiptหรือduplicateconflict ไม่มีทะเบียนimporter         | NOT_RUN   |
| D67-09  | batchหลายแถว failกลางsharedtransaction แล้วปิดสมัคร/สนาม/ถอนscopeก่อนretry      | ทุกPerson/App/snapshot/receipt/audit/outboxrollback countsเดิม ไม่partialcommit retryrevalidatelatestdeny                   | NOT_RUN   |
| D67-10  | workflowapproval/filerubric/scanfailed/byteschanged/ACLrevoked                  | sourceapprovedversion/hashตรง makerdeny newversionต้องreview CLEANไม่grantโดยลิงก์ nosecretpayload                          | NOT_RUN   |
| D67-11  | T0และexpirybounds queuedjobก่อนหมด ทำหลังหมด sessionrevoked                     | currenttestserverclocknotclient noexpiredworker/export/download recorded_atแยกeffective noasynccacheallow                   | NOT_RUN   |
| D67-12  | eventduplicate/newid-samefact/outoforder consumerCOMMITก่อนACK/reportstoragel้ม | consumerreceipts/stableeffectfamilyหนึ่งผล sourceledger/App/stockคงเดิม scopedcorrelation noforcedcursor/no source replay   | NOT_RUN   |

D67-03/04/06ต้องพิสูจน์มีหลายdatabase sessionsจริง บันทึกbarrierสั้นที่redact PIDs/sourceversion/keyและoutcomes ไม่เชื่อHTTP200โดยไม่ตรวจcommit DB Queryexpectedใช้sourceaggregate/receipt/ledgerที่อ่านในisolatedcase ไม่เรียกproductionbalance/authorizationhelperตัวเดียวเพื่อสร้างexpectedทั้งสองฝั่ง

Faulthookต้องtest-onlyไม่รับparameterจากpublicproduction RunfreshDB+deterministicfixtures ทุกcaseห้ามprod/networkexternal delivery บันทึกexplicitfailedsetupเป็นBLOCKEDไม่testskipPASS หากsuiteยังไม่มีcode/command/model ให้NOT_IMPLEMENTED/NOT_RUN ไม่สร้างin-memoryseat/ledger/stockengineแทนของจริง
