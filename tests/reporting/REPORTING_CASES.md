# ตรวจ dashboard รายงาน และค้นกลาง — บท 66

รุ่น 0.1 | 9 ตุลาคม 2569 | **PLAN_ONLY / ALL_NOT_RUN**

อ่าน [METRIC_DICTIONARY](../../docs/METRIC_DICTIONARY.md), [REPORT_CENTER_CONTRACT](../../docs/REPORT_CENTER_CONTRACT.md), [GLOBAL_SEARCH_CONTRACT](../../docs/GLOBAL_SEARCH_CONTRACT.md), [fixture](../fixtures/reporting/reporting-plan.json) ไม่มี executable reporting services/Auth/RLS/FileVersion/nativeDB; expectedvaluesในfixtureไม่เป็น nativeacceptance

Harnessต้องserver/browser/PGจริงหลายconnections/currentauthorization+owner service+scanner/files/outbox65 และprivatecanaryสมมติ ต้องpositiveA/positiveBพร้อมnegativecrossscope ตรวจHTML/network/export/download/worker/searchindex/count/snippet/accessibletree/cacheตามactual IDs/approvedpolicy ไม่ใช้403ทุกคำขอแทนหลักฐาน scopeถูกต้อง

| case_id | ทดสอบเมื่อ runtimeพร้อม                                                                    | ผลที่ต้องพิสูจน์                                                                                                 | execution |
| ------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | --------- |
| P66-01  | Personเดียวหลายตำแหน่ง joinหลายcontact                                                     | A2people/3assignmentsตามfixture ไม่มีjoinfanout peopleเพิ่ม                                                      | NOT_RUN   |
| P66-02  | คนเดียวสองพื้นที่และหลายrole grants                                                        | uniondistinct3people/5positions ไม่บวกย่อย4people ไม่อ่านassignmentBด้วยgrantA                                   | NOT_RUN   |
| P66-03  | Enrollment/Application/web+Excelหลายปี                                                     | M08/09/10/11คนกับรายการแยก central05เดียว ไม่เพิ่มจากreceipt/snapshot                                            | NOT_RUN   |
| P66-04  | แม่บทสนามเดียวสองsession                                                                   | M06=1 M07=2เมื่ออยู่scope ไม่สับ academic/FY                                                                     | NOT_RUN   |
| P66-05  | task/documentหลายหน้าที่หลายrecipient                                                      | task/เรื่องdistinct key deliveriesแยก ไม่ACKจากnotification                                                      | NOT_RUN   |
| P66-06  | dashboardAเทียบก่อนหลังเพิ่มprivateB                                                       | count/value/metadata/HTML/APIไม่มี B และไม่เปลี่ยนเมื่อA sourceคงเดิม                                            | NOT_RUN   |
| P66-07  | searchA termตรงprivateBเท่านั้น                                                            | rows/facets/count/autocomplete/highlight/has_moreไม่มีB ไม่เผย hidden_count                                      | NOT_RUN   |
| P66-08  | สิทธิ์อ่านเรื่องแต่ห้ามtitle/bodyfield                                                     | matchห้ามใช้fieldลับ snippet/thumbnail/accessibletextไม่มีcanary                                                 | NOT_RUN   |
| P66-09  | learnerself/teacherassigned/technicaladmin                                                 | ไม่มีชื่อผู้เรียนอื่น/answerkeyก่อนส่ง/allbusinesscountจากadmin                                                  | NOT_RUN   |
| P66-10  | clientrequested_scopeB/forgedfilters/cursorB                                               | serverdenyก่อนquerycount ไม่มีdynamicSQLหรือfallbackglobalindex                                                  | NOT_RUN   |
| P66-11  | revoke/expireassignmentระหว่างsearch/pages/exportbuild                                     | currentchecks invalidatecursor/artifact oldmanifestไม่grant contextผิด                                           | NOT_RUN   |
| P66-12  | staleindex/cache/signedURL/preview/download                                                | currentACL denyทุกpath no-store/cache-crossuser/noPrivateBcanary                                                 | NOT_RUN   |
| P66-13  | จอหลายหน้า+Excel/PDF filterเดียวกัน                                                        | manifest/rowmembership/count/grain/exacttotals/รุ่นตรงกัน leading0/ไทย/สูตรปลอดภัย                               | NOT_RUN   |
| P66-14  | ชื่อหน่วย/คนเปลี่ยนภายหลัง                                                                 | sealedoldlabels/nameversionคงเดิม restatednewversion currentACL                                                  | NOT_RUN   |
| P66-15  | เงินทศนิยม reserve→commit→partialpay stockหน่วยต่าง                                        | exactledger/reconcile ไม่doublecount/nofloat/noรวมFYหน่วยต่าง                                                    | NOT_RUN   |
| P66-16  | eventซ้ำผิดลำดับ/consumerreportstorageล้ม                                                  | sourcecounts/ledgerคงเดิม stableintent/receipt no downgrade stalewatermarkไม่success                             | NOT_RUN   |
| P66-17  | ไม่มีsource/error/empty/suppressed/denominator0                                            | nullstatusต่างจากsuccessful0 ไม่มีNaN/0%หรือmissingเงินเป็น0                                                     | NOT_RUN   |
| P66-18  | กลุ่มเล็ก/filterdifference/complementarytotals                                             | approvedcohort/privacyversion ตรวจdistinctcontributors ไม่leakcount/tooltips/export                              | NOT_RUN   |
| P66-19  | secretterm/privatefilename/rawerror/joblog                                                 | allowlistไม่มีrawterm/privatebody/identity/token/URLทุกช่องทาง                                                   | NOT_RUN   |
| P66-20  | keyboard/screenreader/เครื่องช้า/filterเปลี่ยนเร็ว                                         | label/focus/live/noสีอย่างเดียว nooldresponseoverwrite/nohiddenPIIในa11ytree                                     | NOT_RUN   |
| P66-21  | unpublished/withdrawnresultและpractice03                                                   | ไม่publicAPI/HTML/exportผลถอนหรือคะแนนฝึก official05 TO_VERIFYdisabled                                           | NOT_RUN   |
| P66-22  | crossownerprojectionwatermarks/sourcecut mismatch หรือsourceเปลี่ยนโดยไม่มีeventในcatalog7 | showstale/partial/MISMATCH ไม่claimoneconsistentcut ไม่sourcewriteจากread ไม่ถือeventล่าสุดเป็นcoverageทุกmetric | NOT_RUN   |

AC66-01→P66-01–05, AC66-02→P66-06–12/18–20; ทั้งสอง **BLOCKED_NOT_RUN** ไม่มี actual report/source/FileVersion/policy/grant IDs หรือ native evidence ต้องผ่าน65ก่อนตรวจ66จริง บท67ยังไม่เริ่ม
