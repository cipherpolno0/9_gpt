# ตรวจขอบเขตการเผยแพร่ก่อนส่ง GitHub

รุ่น 0.3 · 2026-10-09 · ผู้ใช้อนุมัติ public egress ตามรายการนี้แล้ว

ปลายทาง https://github.com/cipherpolno0/9_gpt เป็น public repository สาขาเสนอ codex/portal-foundation-20261009 ไม่ merge main และไม่ deploy จากการอนุมัติส่ง source เพียงอย่างเดียว

automatic approval review ปฏิเสธการสร้าง tree ที่ส่งชุด source พร้อมเอกสารภายในจำนวนมาก เพราะคำสั่งเดิมยังไม่ระบุขอบเขตเปิดเผยเอกสารความปลอดภัยและสถาปัตยกรรม ไม่ใช้ช่องทางอื่นข้ามการปฏิเสธ

รายการนี้เทียบกับ remote main 9bad69ba271555abf9cdf47748062a1e4602c0a9 เป็น payload ที่เสนอให้ผู้ใช้ตรวจ ผู้ใช้สามารถอนุมัติทั้งรายการหรือระบุขอบเขตที่อนุมัติชัดเจน รวมการเปิดเผยรายละเอียดนโยบาย/ความเสี่ยง/การตรวจสิทธิ์ที่อยู่ในเอกสารภายใน ต้องตรวจนโยบายของหน่วยงานก่อนเผยแพร่

ไฟล์ต้นทางมีโค้ด portal รุ่น0.7.0 และเอกสาร specification/history ที่สะสมจากบทก่อน ตัวอย่างใช้ข้อมูลสมมติ ไม่อ่าน .env และไม่เสนอส่ง credentials แต่ pattern scan ไม่รับรองว่าเอกสารทั้งหมดไม่มีข้อมูลที่หน่วยงานต้องการเก็บภายใน

ไฟล์ที่จะลบจาก snapshot สาขาใหม่: .env, src/app/app/[[...path]]/route.ts, tsconfig.tsbuildinfo ประวัติเดิมยังอยู่ ไม่ลบหรือเขียนทับไฟล์เพิ่มเติมที่ผู้ใช้อัปโหลดใน main

เอกสารสำคัญที่ต้องตรวจเปิดเผย: THREAT_MODEL, SECURITY_REVIEW, DATA_GOVERNANCE_SIGNOFF, PERMISSIONS, deployment/backup/rollback runbooks และ PROGRESS/DECISIONS/OPEN_QUESTIONS ที่รวมประวัติการออกแบบและผลตรวจ

จำนวนไฟล์เนื้อหาที่เสนอเปลี่ยน/เพิ่ม 277 ไฟล์ รวม 5,070,750 bytes ก่อนเพิ่มเอกสาร manifest นี้เอง

| path | Git blob SHA1 | bytes | ขอบเขต |
| --- | --- | --- | --- |
| `.env.example` | `147d4821285e1b0db766e81dea6e3999d64fd4d7` | 1192 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `.github/workflows/portal-ci.yml` | `95cd775c6cc39dc773b298ffd41604e593a5a693` | 1593 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `00_MASTER_PROMPT.md` | `dd44d47fc8adcc8fce5a90e1913f4f17a8e3a59f` | 14980 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `README.md` | `8d0774be13243735a0142b3ee5b254de80581eca` | 2479 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `deploy/ci.foundation.proposed.yml` | `f76ca798c2ed6da94a80e93404f4d2f23ccbe45a` | 5264 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `deploy/environments.plan.json` | `20b91c0ce9073f96d1c779577abe3bc6fe2119b3` | 3460 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `docs/ACCESSIBILITY_REVIEW.md` | `7d67acf37b11bed0a840f6c346339d6e6cdf8653` | 9942 | เอกสารภายใน |
| `docs/ADDRESS_VALIDATION.md` | `eabcd3f77b09eb7f177ab3c4234985255aa4797b` | 39971 | เอกสารภายใน |
| `docs/ALLOCATION_LEDGER.md` | `1cbdde1f0327a4dd913677c34400f855bf6a1637` | 15046 | เอกสารภายใน |
| `docs/APPLICANT_REVIEW_IMPACT.md` | `72726e95e75f573dd65b46fbc875c422a4cf8c90` | 11594 | เอกสารภายใน |
| `docs/APPLICATION_EXPORT.md` | `d886378f57d40c13ca4ba3a456601161790f749b` | 12111 | เอกสารภายใน |
| `docs/APPLICATION_SCHEMA.md` | `08509f38bcc75141cc42c017901d5f7fda0fc9ef` | 27181 | เอกสารภายใน |
| `docs/APPLICATION_STATES.md` | `1589fcdd2d02fc73ba5036f092d0b6c88ad0a1d2` | 13838 | เอกสารภายใน |
| `docs/APPROVAL_EVIDENCE_CONTRACT.md` | `e5f992a5c736658c5303d1752c37c610d3658b39` | 12911 | เอกสารภายใน |
| `docs/ASSESSMENT_RULES.md` | `4fde62a50930960b90dadbe16f2d73ef8287eab4` | 18784 | เอกสารภายใน |
| `docs/ASSET_CLASSIFICATION.md` | `272be240c90e19ee54638b33f1295e5c1b42bbed` | 11633 | เอกสารภายใน |
| `docs/ASSET_CUSTODY_HISTORY.md` | `5e36efc1c6809e94b53a5ccc4413e0ae59bc6126` | 8329 | เอกสารภายใน |
| `docs/ASSET_LIFECYCLE.md` | `10b43e15a1c39e5886ba6b320a2cbe3392256d7b` | 18345 | เอกสารภายใน |
| `docs/ASSET_LIFECYCLE_WORKSPACE.md` | `1592ee3ca2fa3e11801727735ff146eb685492bb` | 8622 | เอกสารภายใน |
| `docs/ASSET_REGISTER_WORKSPACE.md` | `a9c17e63fa14e8fa3ed4f1c567737e42c3fcbcdd` | 11361 | เอกสารภายใน |
| `docs/BACKUP_RESTORE.md` | `3b23fcf82da55a004236ae3a410f14b41e7c621e` | 14354 | เอกสารภายใน |
| `docs/BUDGET_APPROVALS.md` | `b2f867e64676b13002f5ba0c32b5db7e8083e353` | 10166 | เอกสารภายใน |
| `docs/BUDGET_BALANCE_FORMULA.md` | `f3c537fecb50429eefe7867ab6b8f3e4aa5b4752` | 12400 | เอกสารภายใน |
| `docs/BUDGET_DATA_DICTIONARY.md` | `98bc62de449576df2b3222a4f754e92bffa8e51a` | 15763 | เอกสารภายใน |
| `docs/BUDGET_LEDGER_SERVICES.md` | `23d9878cd80d7c12d18b6982ca1c0bc6f2e17f79` | 16292 | เอกสารภายใน |
| `docs/BUDGET_PERIOD_CLOSE.md` | `a17e70a3b171f90f56288da1f9fec2aef73ff683` | 10611 | เอกสารภายใน |
| `docs/BUDGET_PLANNING.md` | `f11932b01197219151554ba1bb8571dba9577e48` | 14566 | เอกสารภายใน |
| `docs/BUDGET_POLICY_CONFIG.md` | `49f6a919146d755601ec61f0ffe3d118614f320e` | 15857 | เอกสารภายใน |
| `docs/BUDGET_RECONCILIATION.md` | `1285eaa20f54b63ad6697ff82baa50d26d763630` | 15833 | เอกสารภายใน |
| `docs/BUDGET_SCHEMA.md` | `25a4b41591cd31ae23bd1284d2faa6c60dd22938` | 12826 | เอกสารภายใน |
| `docs/CONTROLLED_DISCLOSURE.md` | `a0a800bbc6193d36f6dc3fab6f23432430161315` | 8164 | เอกสารภายใน |
| `docs/CORRESPONDENCE_FLOW.md` | `131d6386a897129cd88d6359bfd608a8dd4835c7` | 17511 | เอกสารภายใน |
| `docs/CORRESPONDENCE_WORKSPACE.md` | `9eb70d23141c6faff46315370a4c27efb2bb6b90` | 12257 | เอกสารภายใน |
| `docs/CURRICULUM_COVERAGE.md` | `5b10d57f61578cef83e097e45d2ac02376e4e0bb` | 10494 | เอกสารภายใน |
| `docs/CURRICULUM_SCHEMA.md` | `44d96fad74ef9759ac9978bd15b219c8b6454778` | 19475 | เอกสารภายใน |
| `docs/DATA_GOVERNANCE_SIGNOFF.md` | `aff478c612c2560c303d22a50f6b324509118a31` | 23469 | เอกสารภายใน |
| `docs/DATA_QUALITY_RULES.md` | `8dd93cedc2ead9ae6074affa8a857274ea97bf24` | 17770 | เอกสารภายใน |
| `docs/DECISIONS.md` | `0af5e8de91f397b7e5bcc9ab8fdd1ff19bb2d7e0` | 197552 | เอกสารภายใน |
| `docs/DELIVERY_ROUTING_CONTRACT.md` | `f302e51bcf3107ea4174764842b5a1bc30ad8470` | 14359 | เอกสารภายใน |
| `docs/DELIVERY_WORKSPACE.md` | `a7d81fbacec1b98b05c065ec3574cca958d7992d` | 9313 | เอกสารภายใน |
| `docs/DEPLOYMENT.md` | `588e6d7805248b7598cff4f5df6352ab1aa9c1c0` | 15028 | เอกสารภายใน |
| `docs/DISBURSEMENT_WORKFLOW.md` | `78f253374477a7cea11dc5aaef2659866ecad861` | 18871 | เอกสารภายใน |
| `docs/DOCUMENT_DELIVERY.md` | `72da61e5df0f6b1f6b2383dd96de735f6fad1150` | 23875 | เอกสารภายใน |
| `docs/ELIGIBILITY_RULES.md` | `518073338c12b7ce33052fb53b396251cf41d2b4` | 22794 | เอกสารภายใน |
| `docs/EVENT_CONTRACTS.md` | `4825d539db2525074602d61c47716883a9ae7f55` | 13279 | เอกสารภายใน |
| `docs/EXAM_ADMISSION_OUTPUTS.md` | `695a297c058929aff206fd73bb433d1486ab2281` | 7851 | เอกสารภายใน |
| `docs/EXAM_CONTACT_VISIBILITY.md` | `a0f9fdcaedbb1d0c9c10e8db5c15761f93d6ec3d` | 37151 | เอกสารภายใน |
| `docs/EXAM_SESSIONS.md` | `1f4867b14b677e68c4ed76d4c93de2cbb02dac95` | 36114 | เอกสารภายใน |
| `docs/EXCEL_IMPORT_GUIDE.md` | `0cd3688dbd69738a180a15367d223c2d754e46ec` | 16801 | เอกสารภายใน |
| `docs/EXCEL_TEMPLATE_CONTRACT.md` | `f6fd6e07f3b30fd2537e28cab69c052de5dcc57f` | 9895 | เอกสารภายใน |
| `docs/E_OFFICE_SCHEMA.md` | `103ef8a2a51602622d17e0c1e35a12afdde3fa39` | 15742 | เอกสารภายใน |
| `docs/E_SIGNATURE_REQUIREMENTS.md` | `d60e4862580036aa97c1f855eaf94489491ffa9c` | 20465 | เอกสารภายใน |
| `docs/FINANCE_REVERSALS.md` | `84dc404f32e317ddd08b1fa42dd5d7be9e329d70` | 11449 | เอกสารภายใน |
| `docs/FORM_TEMPLATE_REGISTRY.md` | `602f94ee1bc69224ae75fca15f1a7a94151faf35` | 16861 | เอกสารภายใน |
| `docs/FOUNDATION_ACCEPTANCE.md` | `b6b025d6e62fc0903bc0c5faa82fcfa2cadc6b6f` | 22175 | เอกสารภายใน |
| `docs/GLOBAL_SEARCH_CONTRACT.md` | `07edb2a8e5091fb3d1c5d695462298debc1b2dc8` | 9064 | เอกสารภายใน |
| `docs/GOODS_RECEIPT_INSPECTION.md` | `1d094a59d56190dde9d3f75740a4384ba1250ce9` | 11778 | เอกสารภายใน |
| `docs/GO_LIVE.md` | `16d7eb2f74a79f255c803fdc271b7922c4c85133` | 17754 | เอกสารภายใน |
| `docs/GRADING_RULES.md` | `54fa41424b33662771ab3ebd6feb3a684201d607` | 21932 | เอกสารภายใน |
| `docs/HANDOVER.md` | `f49874935e265c553b14227cbff0d228cb9ea556` | 20609 | เอกสารภายใน |
| `docs/IMPORT_COMMIT_TRANSACTION.md` | `7014cd2417cd53004267e6d8fdfc8dc5fd767849` | 12550 | เอกสารภายใน |
| `docs/IMPORT_IDEMPOTENCY.md` | `20bc679d8aec5d5733c2ccd9c870a2348c7a65c9` | 17275 | เอกสารภายใน |
| `docs/IMPORT_MONITORING_RETENTION.md` | `0a697eaacda843184d016a9d707383fa3f665148` | 11278 | เอกสารภายใน |
| `docs/IMPORT_RECOVERY.md` | `83d7f8d027bdb541e54936611673380f7a8e2871` | 16163 | เอกสารภายใน |
| `docs/IMPORT_STAGING_DRY_RUN.md` | `7d64cd8ffe58c55bc0390da846557fd3bd889204` | 29890 | เอกสารภายใน |
| `docs/IMPORT_VALIDATION_CODES.md` | `a1889cd1a19be47201bfd3fa99ddc829f9e58626` | 16544 | เอกสารภายใน |
| `docs/INTEGRATION_HANDLERS.md` | `d779d566b324f5491578470ae716654b8bc799f4` | 12098 | เอกสารภายใน |
| `docs/INTEGRATION_MAP.md` | `edae84b3b6eb80612ae0f1033d16a08c5cbfdf63` | 18285 | เอกสารภายใน |
| `docs/INVENTORY_REPORTS.md` | `9fe6eb0ef340e71432f075225d0e2641d8566859` | 13583 | เอกสารภายใน |
| `docs/INVENTORY_SCHEMA.md` | `4f231c212b052d984759df7fde303d669c29755c` | 17956 | เอกสารภายใน |
| `docs/JSP_MAPPING.md` | `36e350d3f104a19a23633eda39dd344655866f21` | 12093 | เอกสารภายใน |
| `docs/LEARNING_CONTENT_POLICY.md` | `8fb5a79fcdd739bd2131c1400f265d9d5e78cc93` | 18698 | เอกสารภายใน |
| `docs/LEARNING_FLOW.md` | `5d928810e9db7b7e3196836e14720f03201780db` | 34192 | เอกสารภายใน |
| `docs/LEARNING_REPORTS.md` | `4431c5386fab713039f9fd026fa6a03b44b27abf` | 23728 | เอกสารภายใน |
| `docs/MANUAL_BUDGET.md` | `966cb9dbacb1632d8cf2e8014a6cbb7dd4d3852d` | 13281 | เอกสารภายใน |
| `docs/MANUAL_EOFFICE.md` | `b761ef3dc0f0610b2312bc64552044d14fa25f48` | 18379 | เอกสารภายใน |
| `docs/MANUAL_EXAMS.md` | `4b0fe7cab0c205212a8285945459ff9912c52c0a` | 14052 | เอกสารภายใน |
| `docs/MANUAL_IMPORT.md` | `8e0feeada7dab29d1d6454f7d0ef901dd772b790` | 12836 | เอกสารภายใน |
| `docs/MANUAL_INVENTORY.md` | `68f3607ccc66eef20c0c8cb1b3d09cf95f4bb34f` | 15065 | เอกสารภายใน |
| `docs/MANUAL_LEARNING.md` | `e19eb99a1d3d9a9f27ea65701e4063bff27752c4` | 18234 | เอกสารภายใน |
| `docs/MANUAL_ORGANIZATIONS.md` | `068129ebbe212b0ccfdce7a82309fc98f52ff189` | 8724 | เอกสารภายใน |
| `docs/MANUAL_PEOPLE.md` | `46358d3f36ac33495ba4c837c4c5cab3bd297ca8` | 14854 | เอกสารภายใน |
| `docs/MANUAL_REQUESTS.md` | `c13814162e9d004b1464671bee1aeb07abbab40a` | 15509 | เอกสารภายใน |
| `docs/METRIC_DICTIONARY.md` | `117ca0300b539159dc882375d7fb46700d5a1af2` | 18935 | เอกสารภายใน |
| `docs/OPEN_QUESTIONS.md` | `ba684df2801957672cf5d878b71656878de7830c` | 208761 | เอกสารภายใน |
| `docs/ORGANIZATION_TYPES.md` | `cb90e7d0544a20b78b02c4bf11d9c90cbe6ac53e` | 36526 | เอกสารภายใน |
| `docs/ORG_CENTER_REQUESTS.md` | `a7bd358e8203fcd7df941bdc41c6df023eb4b5bd` | 40281 | เอกสารภายใน |
| `docs/ORG_CENTER_REQUEST_SCHEMA.md` | `d202338f1ded533e39db563a727fab74707e7512` | 18129 | เอกสารภายใน |
| `docs/PERFORMANCE_BASELINE.md` | `864a1cf10c43b0f077b53afeb0c6b2d6f2172957` | 15110 | เอกสารภายใน |
| `docs/PERSON_CHANGE_RECOVERY.md` | `9d1eac72dc27b283695fb4ce9bd6a38719dd9159` | 37365 | เอกสารภายใน |
| `docs/PERSON_CHANGE_WORKFLOWS.md` | `220049f579dc19970c92d4fb18225ee3de3d3e5d` | 31078 | เอกสารภายใน |
| `docs/PERSON_FIELDS.md` | `3023111121eef9e4535d98609d6688e56d3d8a71` | 24842 | เอกสารภายใน |
| `docs/PERSON_VISIBILITY.md` | `e80b1e7650af9ed26b22bd1ef761286a11e86be9` | 28717 | เอกสารภายใน |
| `docs/PORTAL_READINESS.md` | `ceb51adc9bed9a123f4f9927c92e402563436281` | 5425 | เอกสารภายใน |
| `docs/PORTAL_SETUP.md` | `e5b2a9c23d63464e43aa87337891383f6c1442a3` | 12332 | เอกสารภายใน |
| `docs/POSITION_RULES.md` | `cddfd9870e447af26bc354d8c5231ee6eb2d9c2b` | 29084 | เอกสารภายใน |
| `docs/POST_RELEASE_REVIEW.md` | `0da8955f102d27a1984a964aafd4b236f7c61772` | 9905 | เอกสารภายใน |
| `docs/PRETEST_AUTOSAVE.md` | `7d69d7c89f5a679355176b529a06079912eb2222` | 20443 | เอกสารภายใน |
| `docs/PRETEST_FLOW.md` | `05487ae3c333281f764b939e580f583b926fdd1e` | 19652 | เอกสารภายใน |
| `docs/PROCUREMENT_BUDGET_FLOW.md` | `ae1ad4e500b016d6a3cc89cfc8fe623b177106a5` | 16862 | เอกสารภายใน |
| `docs/PROCUREMENT_ORDERS.md` | `3fa0d770fe597300f2543c7efcb993ef5f6f9c78` | 15338 | เอกสารภายใน |
| `docs/PROGRESS.md` | `6f075fa64c9027cca2ea229621d6af1c447439a6` | 484635 | เอกสารภายใน |
| `docs/QUESTION_BANK_CONTRACT.md` | `aa700417d7353d8bd4766477ea5a27cd3531bc56` | 20125 | เอกสารภายใน |
| `docs/QUESTION_REVIEW.md` | `eb71c2162299263cc4dabaa28253878fd0aae64c` | 19422 | เอกสารภายใน |
| `docs/RECORDS_REGISTER_POLICY.md` | `3d54726db3c684d66b70328c7db0efaa19b890d7` | 18678 | เอกสารภายใน |
| `docs/RECORDS_RETENTION.md` | `d985a6f79ea8614817174a0f8da9c1f78dbc6dbc` | 22291 | เอกสารภายใน |
| `docs/RECORD_ACCESS_CONTROL.md` | `62329b79af801e3cb1d6291d07fc0e1bacd5573e` | 9632 | เอกสารภายใน |
| `docs/RECORD_DOCUMENT_ACCESS.md` | `48caa12cce244709a5173182f6038a5606249076` | 9850 | เอกสารภายใน |
| `docs/RECORD_PREVIEW_SECURITY.md` | `a5f94a4148c8d838e7c1898a3d48ce129bd48c93` | 9144 | เอกสารภายใน |
| `docs/REPORT_CENTER_CONTRACT.md` | `4a76119ac12b07c0a30ced0640ffba68b6a77060` | 14504 | เอกสารภายใน |
| `docs/REQUEST_EFFECTIVE_RULES.md` | `5c45eb99137f78a1361ea67f7e017377b107682f` | 36014 | เอกสารภายใน |
| `docs/REQUEST_IMPACT_CHECKS.md` | `84a681d4cb15699a117737efa3d57f542e1c95db` | 20448 | เอกสารภายใน |
| `docs/REQUEST_REVIEW.md` | `407bf22744da4d1a70814da168d4606241656f90` | 29055 | เอกสารภายใน |
| `docs/REQUEST_SUBMISSION.md` | `9337de41b38248e029116de02f0405e4e878ad75` | 35303 | เอกสารภายใน |
| `docs/REQUEST_WIZARD.md` | `5847072e4fefb3e064c12d49921b0b9a34aca59f` | 20457 | เอกสารภายใน |
| `docs/RESULT_CERTIFICATION.md` | `2f31b827cc925faec598ffdc1802eab18f65c085` | 10682 | เอกสารภายใน |
| `docs/RESULT_PUBLICATION_POLICY.md` | `3e74945d7a66ac1237a0b2d6fc5e19aa9834a023` | 15762 | เอกสารภายใน |
| `docs/RESULT_RELEASE_RECOVERY.md` | `93fff702b0b685cfbb635196b9ba39493fdb0a1c` | 12729 | เอกสารภายใน |
| `docs/RESULT_SEARCH_CONTRACT.md` | `c70870c49e15999ba19ee66dddcb2b858286a298` | 12425 | เอกสารภายใน |
| `docs/ROLLBACK_RUNBOOK.md` | `32857e0b2b1cbee81603e055a398438f6105a0f0` | 8007 | เอกสารภายใน |
| `docs/ROSTER_WORKSPACE.md` | `1d68112e20c58899a9b08e3781eb6029b80490c9` | 11520 | เอกสารภายใน |
| `docs/SCORE_IMPORT_REVIEW.md` | `07c2d35f3227e75f71188379955124aafa7430b5` | 11403 | เอกสารภายใน |
| `docs/SEAT_ALLOCATION.md` | `9732ac68f343443c26eb060068d53f278f960c9b` | 31174 | เอกสารภายใน |
| `docs/SECURITY_REVIEW.md` | `ed81774aee21acc6b033a7829bd60311f28969ea` | 14972 | เอกสารภายใน |
| `docs/SIGNING_ADAPTER_CONTRACT.md` | `05df10718457b402b53e730c127e8be2ed768396` | 15832 | เอกสารภายใน |
| `docs/STOCKTAKE_DISPOSAL_POLICY.md` | `b3c5f0c7292b00927b3599e30d10fd8a56e87da1` | 16732 | เอกสารภายใน |
| `docs/STOCK_LEDGER.md` | `2256178502bed00c1b9703266dda799d59ce38b3` | 11262 | เอกสารภายใน |
| `docs/STOCK_MOVEMENT_WORKSPACE.md` | `9a04bb333dca26b851e1a6f897879cd5874c3e37` | 8422 | เอกสารภายใน |
| `docs/SUPPORT_RUNBOOK.md` | `076f6334a6704d8fd0ffe7c335940f67817399d0` | 13819 | เอกสารภายใน |
| `docs/TEST_MATRIX.md` | `e468f8d4a2942c80613c394d93ddec4ff898f08b` | 15104 | เอกสารภายใน |
| `docs/TEST_RESULTS.md` | `2198bf675549528151166aa99e82470636347180` | 8762 | เอกสารภายใน |
| `docs/THREAT_MODEL.md` | `f0f5de082d8bd8627e6dfc919001a5d2f63bf96d` | 14619 | เอกสารภายใน |
| `docs/TRACEABILITY.md` | `e30baac8c014d22524745b9d1a2fc0ea72675df7` | 216679 | เอกสารภายใน |
| `docs/UAT_MASTER.md` | `5691e12cb4410c8814e5b2f2efc149cb8f0aaff2` | 20214 | เอกสารภายใน |
| `docs/UAT_SIGNOFF_TEMPLATE.md` | `a159830bd2b0760aecf908bcd77c7a51990cdc05` | 6931 | เอกสารภายใน |
| `docs/UAT_SYSTEM_01.md` | `830ed73a0a4d7e0d62c52005cf5cd7d9ac241a22` | 19217 | เอกสารภายใน |
| `docs/UAT_SYSTEM_02.md` | `e0a99a3e4a2865382c9b921099fffd3e0c93bae9` | 15778 | เอกสารภายใน |
| `docs/UAT_SYSTEM_03.md` | `6ebeb3614ff3e49efd0209bb4547eb332a192e65` | 21159 | เอกสารภายใน |
| `docs/UAT_SYSTEM_04.md` | `20236c06b2a5e31b8cb2abcc5c69841910ca5197` | 22483 | เอกสารภายใน |
| `docs/UAT_SYSTEM_05.md` | `a9a01eca848f2b17761eed22504283ace9e5e058` | 15653 | เอกสารภายใน |
| `docs/UAT_SYSTEM_06.md` | `35a233f184c56fce814fbfb7b2f6905fa2c72330` | 13102 | เอกสารภายใน |
| `docs/UAT_SYSTEM_07.md` | `cb948b8a222ad0903e1b1839a2772d01e8c12038` | 10903 | เอกสารภายใน |
| `docs/UAT_SYSTEM_08.md` | `691b5f73defb6f37213571368b9f03642d489e59` | 19715 | เอกสารภายใน |
| `docs/UAT_SYSTEM_09.md` | `f4fdffe7953b8864fcdea33d9af4914bb7b081b0` | 12174 | เอกสารภายใน |
| `docs/WORKFLOW_ENGINE.md` | `a75ef572c9735a681cb826b1cdd9e603670c20fb` | 20978 | เอกสารภายใน |
| `docs/XLSX_PARSING_LIMITS.md` | `d974ec627a905216305d2c5c58349dc7705dd94b` | 32314 | เอกสารภายใน |
| `docs/fixtures/approval-signing-57-plan.json` | `b2d1f4ab15f3bd5bd6367047cfc88b5199513d1b` | 35130 | เอกสารภายใน |
| `docs/fixtures/asset-lifecycle-50-plan.json` | `52f9fcb9d4628514278359d97cb785591b7223ef` | 29296 | เอกสารภายใน |
| `docs/fixtures/budget-41-demo.json` | `ccf4d4754a246ae477c8f818321c7efe813127da` | 7899 | เอกสารภายใน |
| `docs/fixtures/budget-42-plan.json` | `9f51ebe7bf11d1007f7a86f50d86e9c6348222f8` | 6174 | เอกสารภายใน |
| `docs/fixtures/budget-43-plan.json` | `6d3039d4add64dfef372d400f2bd6a0eeadf35dc` | 8720 | เอกสารภายใน |
| `docs/fixtures/budget-44-plan.json` | `203aed2ff8c528918f109e44e40c71a8d7a3f3b6` | 7148 | เอกสารภายใน |
| `docs/fixtures/budget-45-plan.json` | `b35fb44dee4f8a90155aefe6ba6c32fb1cecbaed` | 10071 | เอกสารภายใน |
| `docs/fixtures/correspondence-54-plan.json` | `81038a95854344b7ea0cee867ed7f6b92a70651e` | 63774 | เอกสารภายใน |
| `docs/fixtures/document-delivery-55-plan.json` | `7fb992714f499bdab3323c9aad56c66c581b9664` | 58669 | เอกสารภายใน |
| `docs/fixtures/excel-import-64-verification.json` | `dae8a289764977444b8db9d3963e899a99cf9d2c` | 2982 | เอกสารภายใน |
| `docs/fixtures/excel-parsing-60-baseline.json` | `a1f8a43b871c585d4dce0ba9bdaa3148480813ab` | 4507 | เอกสารภายใน |
| `docs/fixtures/excel-template-59-plan.json` | `7f70b06f0a71ac59e1dfd994328f073a5672464b` | 7624 | เอกสารภายใน |
| `docs/fixtures/excel-template-59-verification.json` | `e89102fcc434eaef0d810039a6608235638e7526` | 4532 | เอกสารภายใน |
| `docs/fixtures/inventory-47-plan.json` | `bbdc2bd131aa9cb1d563b62387f9d60ed16cfc3a` | 21779 | เอกสารภายใน |
| `docs/fixtures/procurement-48-plan.json` | `621e1cdba90b6b3a4b96392c6b58bed9f4b813fc` | 20436 | เอกสารภายใน |
| `docs/fixtures/records-register-53-plan.json` | `5826c91210a8bac244f12c27e5dddec0e5049478` | 49457 | เอกสารภายใน |
| `docs/fixtures/records-retention-56-plan.json` | `5bd0383040ef0c1cdb712523df1469fd62b6d0fc` | 73201 | เอกสารภายใน |
| `docs/fixtures/stock-49-plan.json` | `2dfce3503de88333ad3f4e6db5f687e68c1a9e9f` | 26989 | เอกสารภายใน |
| `docs/fixtures/stocktake-disposal-51-plan.json` | `a0b8f4f38bd8d010b63f13e2a64ea8113502068a` | 19127 | เอกสารภายใน |
| `next-env.d.ts` | `ce4e94a6b10f160ee021fe18939af160d2927dcf` | 288 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `next.config.ts` | `7f5e1bff9226df2a20e0b655a7f8af6091bd1294` | 817 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `outputs/lesson59/TEST_exam_upload_blank.xlsx` | `5b660a1aeb5160ae54fbcd47346d4d6672917f40` | 10469 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `outputs/lesson59/TEST_exam_upload_invalid.xlsx` | `4331a2f7143c4541b754dca6678a5316ced5fc64` | 11826 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `outputs/lesson59/TEST_exam_upload_valid.xlsx` | `53d4e66642968c0e81afd4ed86b1a0890728aaf9` | 11645 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `package.json` | `e95665cecb63f8a77e2b3c00ae19d768af3c1c43` | 2583 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `pnpm-lock.yaml` | `427bcc20c1c8c95dac211723c575aa57cb5f7ff7` | 133295 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `prisma.config.ts` | `b7ebe1284b6a34f18f69ed712f839d401643beed` | 549 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `prisma/migrations/20261009170000_portal_access/migration.sql` | `d99913ea30dcb8049201c9018ec31d83feebc2d1` | 7787 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `prisma/schema.prisma` | `1f437954c1ddb87b32511b64fcc2cfb68de6ec1d` | 39456 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `public/guides/getting-started.txt` | `bbc75ce410e0ba5dad1428773d828cfb68f25201` | 1952 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `scripts/database.mts` | `d28003114a122ff8f8df6684f657e94986d4142e` | 4237 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `scripts/provision-account.mts` | `96813a4635c8ba445881e737f964c3252f0de769` | 3361 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `scripts/smoke.mjs` | `eba8ea38e530de683dd0eed203d436ad75524e24` | 4483 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/(public)/contact/page.tsx` | `7e802973c194801d74579e9a88ebf928cd49ea7a` | 800 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/(public)/downloads/page.tsx` | `a47dc135a838beedbfb22e44b8a57b5cce3e7e3d` | 1089 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/(public)/exams/page.tsx` | `bb2dc5dde52eaf40945209feb750ddcfc2bce525` | 856 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/(public)/layout.tsx` | `605af0bcc6a59b74bdfba5c9505623a19dd00b1a` | 196 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/(public)/learn/page.tsx` | `96a9800e203a9804608ae6ed25848832d2159b25` | 786 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/(public)/login/page.tsx` | `a7e982fb0cfeddb1e77f01fb849e12fcef228dba` | 3346 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/(public)/registry/page.tsx` | `cf5fa15d7df94437171bcb6f6db5e8669d2366fd` | 893 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/(public)/requests/track/page.tsx` | `9a3bb976091669789f6c5ad73ca715ec36aef2fa` | 845 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/api/[...path]/route.ts` | `040459f92ee34a4301b687f097dc16f30890d401` | 1038 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/api/auth/login/route.ts` | `e7a2f7be76ed1ab5f8fdf8c86bb23c3eb858a4be` | 1752 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/api/auth/logout/route.ts` | `1d25df161a7d41e4dcf254f5c8b929f0898e0903` | 862 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/api/health/route.ts` | `5a63bdc17eccf0e1ca7ca0edcaa0cc39cc722a55` | 143 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/api/organizations/route.ts` | `bbe7f3b377848069662e327e5dacaee2770dc0d4` | 663 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/api/people/route.ts` | `e0b2460794adb5cda5520524b48a5378769041a1` | 656 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/app/[...path]/page.tsx` | `f8173b61f3b49a86fb65ea628bdbc5404db6f7ea` | 1389 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/app/admin/page.tsx` | `a1ac46e08979717f980098450b7ac2427513ad88` | 1216 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/app/error.tsx` | `e96ea09d58a321275990bd25b2f6a88d9b245adc` | 602 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/app/layout.tsx` | `6fcd68736a8394b2fc69ee2f20aea7fbb8d28aba` | 2127 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/app/organizations/page.tsx` | `9a2997cab5a22d6de6d3c6efbc83fbe398abc4fd` | 262 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/app/page.tsx` | `229cdb28923a132b2ed0b8147af3af06865fde16` | 1863 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/app/people/page.tsx` | `a5fc98edf907926e24359223b60b2a7ce1506640` | 255 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/app/page.tsx` | `0ca472394420a4a270c4330c0ae27813d3b4ec29` | 1967 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/modules/budget/README.md` | `c615864ecddbddb4028fe442c33ee49ebf0e955a` | 5416 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/modules/correspondence/README.md` | `802deecd22b4f6bd2256c1e9c01fe8f9faae9e81` | 6581 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/modules/exam-imports/README.md` | `054dce30dd947760821f5601df39db76e014e54a` | 10816 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/modules/exams/README.md` | `e41e251db6e6ce8347be1b3a86776d3a745572a8` | 6301 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/modules/inventory/README.md` | `9e1e40416f7a4663479a882bb788e2cc149a904c` | 5398 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/modules/learning/README.md` | `2454e5039e909ba343e61a4bb35f36a1fd425a09` | 4947 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/modules/organizations/README.md` | `4c1d33eb193b572f55933ba5184198e74450504a` | 3996 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/modules/people/README.md` | `926034bf78470ca0ad077a7fb2ee3201f9ce5bc2` | 3620 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/modules/requests/README.md` | `238d2381cc1eef78ac497e7218e1bed2ea1aa5e7` | 4653 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/server/integration/README.md` | `570eda61520875122b84bfb19144f18f7655622d` | 1806 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/server/portal/auth.ts` | `f1075062c8ed190e6851389711704d0fb5c5d256` | 7376 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/server/portal/claims.ts` | `7f14c18839ed2406a43d1db987a1917fb0c89d62` | 1034 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/server/portal/config.ts` | `76164b0bdb36bca354783dc90f8f9fcf779d5a68` | 3978 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/server/portal/database.ts` | `c2a55b04865c433ecbb5fd617ba6e271590ec4fe` | 1979 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/server/portal/filters.ts` | `0ea5d19b13993d7eba58701bf6ea9038274cd9d9` | 568 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/server/portal/queries.ts` | `2ef380198be8be88e255fc1a7f53c236b66741ba` | 1389 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/server/portal/registry.ts` | `d366fb6d18cb9398f56d35165eb685aa65a06afa` | 2576 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/server/reporting/README.md` | `4ad396fa6fe4cb03fa5c3b701d775f8832496f0d` | 1130 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/shared/components/registry-page.tsx` | `c7167d9bd3180cceb6771bb4334475536996da79` | 4082 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/shared/components/site-shell.tsx` | `4d9f9fb1d2e8580088f3eee5c30184601749f667` | 2609 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `src/shared/navigation.ts` | `bd908facae40c2f8a663cae3c4dba1e3a75787ce` | 1027 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/database/core.integration.ts` | `aa97e610c06d385723e5de98dbedf75698b61f01` | 12544 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/database/fixture-replay.ts` | `8541377a326a9edc806c2360f962ff2a3a647a23` | 2363 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/database/portal-sql.test.ts` | `ef99739985017192b638e49d3a691661fe239d5a` | 10006 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/database/portal.integration.ts` | `03b4b18bdbeebfc6603ad2d3c02fd42dd5b9e9a0` | 4757 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/database/sql-wasm.test.ts` | `e460637c3b90d9edc2b6b422c42add6216e6fee6` | 11139 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/e2e/E2E_CASES.md` | `44db8226a7d40579f3195d6eca7aae2d81bb153b` | 8754 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/e2e/uat-plan.json` | `f902f843fabb500734c79fb037c5ef0313950818` | 10897 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/integration/integration-plan.json` | `32a8ceae40659723330f8adb49a2ee564d23b0f3` | 7514 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/performance/workload-plan.json` | `9a0203c92d84d6d011cd70dc914af0bf2d763a00` | 7708 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/release/release-plan.json` | `ace36bcaa95061968f9833ec9c8e83c893f88e53` | 54645 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/reporting/reporting-plan.json` | `8463b265c7f73742f621ed0b2e9d64c75835b862` | 7610 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/security/review-plan.json` | `2b916fce03aed41f17372cd926465ae0416d40d6` | 127862 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/system01/coverage-plan.csv` | `b1455df746addd7cde1ccca9d16b272dad7a8e91` | 2463 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/system01/people-plan.csv` | `eae3dbb4dc936b3fa62407086e5e70b1b2e800de` | 1295 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/system02/expected-quality-focus.json` | `c6f51ecba914862712aae318f30583a595287071` | 1538 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/system02/legacy-organizations-plan.json` | `f4a2fd20448415f0091cd51ebe8f738d45d8ae1a` | 13484 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/system03/coverage-plan.csv` | `4e3f023246221ea4186fb23cada570a1eaa0222b` | 3035 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/system04/coverage-plan.json` | `26f8079a6748b420781bc97265235681db3b80f9` | 7014 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/system05/coverage-plan.json` | `0e6e0bd148012d37e69607e2dcb2d5fe37df9da0` | 29659 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/system06/coverage-plan.json` | `00d2cfb63e5527fbc5d3f766dc6a00244726cc35` | 36830 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/system07/coverage-plan.json` | `5db1703611c1cf0f4f5ef359de8d50b11a16a132` | 53595 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/system08/coverage-plan.json` | `679cfbb60b6fc6523fc27c80f0af19bc059a52dc` | 47519 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/system09/commit-plan.json` | `2e1057aa200e911135b3cb84bf5d97c7d0165ace` | 3942 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/system09/coverage-plan.json` | `a5364472bb7e3658cd97e51b95d6a0a8db9e9eed` | 12770 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/system09/parsing-plan.json` | `d58a33dee9216f652bb7efb54925cf3106b71ca5` | 9155 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/system09/recovery-plan.json` | `5d9c70c52fada25b74b73b32d0b981a1115ee602` | 4391 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/system09/validation-plan.json` | `47ba5cfca6dbe565e917ff30f2793fb052062950` | 16865 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/fixtures/test67/test-plan.json` | `cf848f088b0efa10797aaa50b3d1ff05c21bf6bc` | 6304 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/integration/INTEGRATION_CASES.md` | `bf12badd125277ccd6a310f79fb0d4d8569622c4` | 8982 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/integration/SERVICE_CASES.md` | `e4f244d35f626237a3d32ce4c005fdce8f3bcb1c` | 5618 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/performance/LOAD_CASES.md` | `1ff299015d1d19f63310fdd1ea92194e0fecdf8c` | 7557 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/portal.test.ts` | `182d86e804ca59e812706ea4ca6ce073d6f553e1` | 5162 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/reporting/REPORTING_CASES.md` | `737a76e950ad258a9b82d8ae74f32ded61c33f87` | 8234 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/results/lesson67-results.json` | `c56b11bbbb412213c5d9e2d4860c60492cdad625` | 4371 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/results/lesson68-results.json` | `eea50688aa05744f2ce0e20987e2446ff7b5556a` | 3054 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/results/lesson69-results.json` | `cfcaa8ca19a4aa444855c71d141efd9134ddcffc` | 26319 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/results/lesson70-results.json` | `dff6e984dff0740d326c43893b093c26daf96dc4` | 4096 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/results/lesson71-results.json` | `9116844e231f5524efe0513ce64bc0078e4ca171` | 5869 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/results/lesson72-results.json` | `e7604c55e2bf62865b154158d2b6f0437987ce09` | 4708 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/results/portal-foundation-results.json` | `d1f51b7399c273b28a15c704d3b7a1a7834c65cb` | 1865 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/system01/ACCEPTANCE_CASES.md` | `c6c952d6e9ba36f815eac63b91bc087f820e27d6` | 16232 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/system02/ACCEPTANCE_CASES.md` | `b9f7ba190ba523b7dcc7561aee7c49a489ebdac2` | 8499 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/system03/ACCEPTANCE_CASES.md` | `de7cf06eeb596c0afc09a42373d3369a52ff9dd8` | 24223 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/system04/ACCEPTANCE_CASES.md` | `6bb0048e334835a43863408c09ef8d5a0e1091a7` | 12815 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/system05/ACCEPTANCE_CASES.md` | `66c2f89ccf1d6ea850427260bc0e8ce9a40f0f61` | 18023 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/system06/ACCEPTANCE_CASES.md` | `d37e2bae03dca646cb097eaee240dc2b7220c808` | 14632 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/system07/ACCEPTANCE_CASES.md` | `7699cbde742a7eeb83bad34af5391375227a0ee7` | 17219 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/system08/ACCEPTANCE_CASES.md` | `7c716dc533fdbf40de538ecd7d5a177ff01f4c9c` | 16786 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/system09/ACCEPTANCE_CASES.md` | `e04edbacb0a5001cbd07a155222091185d2a7b09` | 9751 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/system09/COMMIT_CASES.md` | `2253757a6973345086255fe2df3bd07274ece613` | 8542 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/system09/PARSING_CASES.md` | `22f0ca5028b29a7e7521c5dd207f4d2166eba4ec` | 12621 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/system09/RECOVERY_CASES.md` | `d35f795753e22be6060937865a5d1cc318da6fab` | 7084 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/system09/VALIDATION_CASES.md` | `62d5bb7b580f5185ac66cf1f260abdf5be39f4de` | 12791 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `tests/unit/UNIT_CASES.md` | `63fb24d86777a1bddc98ef1a8dd1520394949807` | 3464 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |
| `vercel.json` | `a131720bd9a5d7e1386dac556a5e57ac1cb0a8e9` | 132 | โค้ด/การทดสอบ/ตัวอย่างสมมติ |

ผลตรวจจริงล่าสุด: unit23/SQL-WASM23/HTTP25/buildผ่าน native/provider/UAT/restore/remoteCIยังไม่ผ่าน การอนุมัติส่ง source ไม่เท่ากับอนุมัติข้อมูลจริงหรือเปิดใช้งานทางการครบ9ระบบ

## หลักฐานอนุมัติการเผยแพร่

ผู้ใช้ยืนยันในบทสนทนาว่า “อนุมัติให้ส่งโค้ดและเอกสารภายในตาม PUBLICATION_REVIEW.md ขึ้น GitHub https://github.com/cipherpolno0/9_gpt สาธารณะได้” อนุมัติรายการต้นทาง 277 ไฟล์และ manifest รวมเอกสารภายในที่ระบุ ไม่รวม secrets ข้อมูลจริง การ merge main หรือ production deployment

ตาราง SHA ด้านบนเก็บ snapshot ที่ได้รับอนุมัติ การบันทึกคำอนุมัติและผลส่ง/CI ต่อจากนี้ปรับเฉพาะเอกสารสถานะกับผลตรวจที่เกี่ยวข้อง รุ่นแอป/schema 0.7.0 และ migration 2 ชุดไม่เปลี่ยน ต้องตรวจ tree SHA กับ source จริงก่อนอัปเดตสาขา

## ผลการส่งและการแก้ CI

Draft PR: https://github.com/cipherpolno0/9_gpt/pull/1 · source snapshot commit 7b780327538854d4440e8f662c1e107d291ff1eb · verified tree d24620a95dfccca9f669772d8e398d557f30fffd

ตรวจ SHA 334 ไฟล์และ remote-only 87 ไฟล์ตรงทั้งหมดก่อนเปลี่ยน ref พร้อม expected head lease ไม่ force ไม่ merge main การแก้ CI ต่อจาก snapshot: tsconfig.json จำกัด include เฉพาะ executable source/test/config; tests/database/core.integration.ts เปลี่ยน ORDER BY id เป็นข้อมูล JSONB ครบทั้งแถวเพื่อรองรับ hash key โดยไม่ลด assertions เอกสารสถานะและ JSON ผลตรวจบันทึกคำอนุมัติ/ผลส่ง/ผล CI เพิ่มจากตาราง SHA ของ snapshot เดิม

ผล CI จริงและข้อจำกัด: tests/results/portal-foundation-results.json ไม่รับรอง provider/staging/9-system UAT หรือ deployment authority

CI ที่ตรวจ source หลังแก้: https://github.com/cipherpolno0/9_gpt/actions/runs/37973088946 และ https://github.com/cipherpolno0/9_gpt/actions/runs/37973093420 สำเร็จทั้งคู่ commit ada2595c82dbd631bc5d915cc3de13f6a6f08fa3; unit23 native18 HTTP25 รวม migration2 บันทึก native18 นับ parent testsด้วย ไม่อ้างเป็น business9 acceptance

## ต่อจากคำขอเชื่อม staging และพัฒนาธุรกรรม

ผู้ใช้สั่งเชื่อมSupabase/Vercelstagingและพัฒนางานค้างต่อจากการอนุมัติส่งsource เอกสารส่งมอบบริการกลาง0.8.0กับโค้ดและtestsสมมติจะส่งต่อในDraftPRเดิม ไม่ส่งsecret/credential/ข้อมูลฐานเดิม/newrealdata สถานะผู้ให้บริการบันทึกเฉพาะprojectreferenceและผลสำเร็จ/ผิดพลาดที่ไม่มีsecret ไม่mergeproduction การส่งและdeploypreviewต้องตรวจchecks/tree/commit/environmentจริง ผลUATไม่ลงนามแทนเจ้าหน้าที่ ตาราง277ไฟล์ด้านบนเป็นประวัติsnapshotเดิม ไม่ใช่hashของsourceรุ่นใหม่
