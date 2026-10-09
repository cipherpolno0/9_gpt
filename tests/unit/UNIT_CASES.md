# หน่วยทดสอบกฎสำคัญ — บท 67

รุ่น0.1 **PLAN_ONLY / ไม่ใช่ executable suite ใหม่** อ่าน [TEST_MATRIX](../../docs/TEST_MATRIX.md), [TEST_RESULTS](../../docs/TEST_RESULTS.md) ไม่ย้าย tests/*.test.ts จน runnerที่อนุมัติรองรับ ชุดวันที่เดิมมีmeaningfulboundaryที่รันแล้ว ไม่เพิ่มtestคัดสูตรหรือfixtureไปเทียบตัวเอง

| case_id | กฎและindependent oracleเสนอ                                                                         | ผลเมื่อทำimplementation                                                                           | execution                                |
| ------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| U67-01  | scopeclosure/หลายสาย/หลายgrant/expiry เทียบ truth tableของowner ไม่ใช้permissionhelperสร้างexpected | allowเฉพาะaction+lineage+timeจริง noadminwildcard; DB/APIพิสูจน์แยก                               | NOT_RUN                                  |
| U67-02  | transition/makerchecker/version เทียบ approvedtransitiontable ไม่sameaccountname                    | creatoridentityไม่approveตน, staleversionconflict returnedแก้แล้วต้องreviewใหม่                   | NOT_RUN                                  |
| U67-03  | exactmoney/quantity/conversion เทียบค่าทศนิยมที่คำนวณอิสระและunitsที่pin                            | binaryfloatreject/currency-unitmismatchreject rounding policyversionชัด                           | NOT_RUN                                  |
| U67-04  | businesskey/verifiedidentityเทียบlogical05 keysหลายปี/ช่องทาง                                       | web+importsameopportunitykey ไม่name merge ไม่สร้างcandidateทะเบียนใหม่                           | NOT_RUN                                  |
| U67-05  | Thai day start/end/date-only/กำกวม                                                                  | reuse dates.test.ts 3casesที่รันแล้ว ส่วนclockadapterกับauthorizationบริการยังต้องเพิ่มnativecase | EXISTING_DATE_TESTS_PASS_SERVICE_NOT_RUN |
| U67-06  | versioned eligibility/grading/privacy/fieldpolicy เทียบapprovedconfigvectors                        | TO_VERIFYofficialdisabled, rubricไม่autoMCQ, noanswerkey/forbiddenfields                          | NOT_RUN                                  |

U67-05ไม่ถือว่าสเปกauthorizationclockผ่านเพราะdatehelperผ่าน Unitไม่พิสูจน์row locks/atomic import ให้ใช้ [SERVICE_CASES](../integration/SERVICE_CASES.md) ไม่มีการติดตั้งframeworkหรือเพิ่มbusinesshelperเพื่อให้testsที่ไม่มีบริการผ่าน
