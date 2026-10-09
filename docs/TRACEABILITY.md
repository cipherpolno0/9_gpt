# Requirement Matrix และกรณีทดสอบ — เว็บไซต์กองบริหารทะเบียนและวัดผล

ต้นฉบับบท02รุ่น1.2 | ตรวจสถานะบท72รุ่น1.63 | 9 ตุลาคม 2569 (2026-10-09)

## 1 วิธีอ่านและสถานะ

REQมาจากCharter29รายการและNFRใหม่6รายการใน REQUIREMENTS รวม35รายการ UCคือกรณีใช้งาน TCคือกรณีทดสอบ ตารางนี้เชื่อมข้อกำหนดกับpage/logical table/backend service/บทเรียน/test หนึ่งREQอาจมีหลายUCและหลายtest

ตารางและcatalogหัวข้อ2–5เก็บbaselineบท02: route/table/service/APIเป็นข้อเสนอ ณ วันที่เขียน ไม่ใช่การสร้างschemaหรือผลruntime ในรอบบท12ได้รับพรอมป์ต์ส่วนกลางถึง12แล้วและมีcore schema/starterบางส่วน ดูหัวข้อ6สำหรับimplementation/ผลตรวจล่าสุด ซึ่งใช้แทนข้อความสถานะเดิมเมื่อประเมินความพร้อม ไม่ตีความคอลัมน์Q020รอพรอมป์ต์ในbaselineว่าบท06–12ยังไม่ได้รับคำสั่ง

## 2 Matrix ครบทุกข้อกำหนด

| REQ | หัวข้อ | Use cases | หน้าเว็บเสนอ | ตารางข้อมูลเชิงแบบเสนอ | บริการbackendเสนอ | บทเรียน | กรณีทดสอบ | สถานะหลักฐาน |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| REQ-S01 | 01 บุคลากรคณะสงฆ์และฝ่ายการศึกษา | UC-S01-01, UC-S01-02 | /app/people, /registry; /app/people/requests | person, person_private, person_name_history, position_assignment, user_account; person_change_request, position_assignment, affiliation_history, person_status_event, audit_logs | people_service.read_person; people_service.change_person, workflow_service.decide | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S01-01-H, TC-S01-01-A, TC-S01-01-R, TC-S01-02-H, TC-S01-02-A, TC-S01-02-R | SPECIFIED / runtime NOT RUN |
| REQ-S02 | 02 หน่วยงาน ที่ตั้ง และสนามสอบ | UC-S02-01, UC-S02-02 | /app/organizations, /registry; /app/organizations/exam-centers | organization, organization_relation, address_version, organization_location, audit_logs; exam_center, exam_session, center_session, exam_center_appointment, file_version | organization_service.change_organization; exam_center_service.open_session | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S02-01-H, TC-S02-01-A, TC-S02-01-R, TC-S02-02-H, TC-S02-02-A, TC-S02-02-R | SPECIFIED / runtime NOT RUN |
| REQ-S03 | 03 คลังข้อสอบและการเรียน | UC-S03-01, UC-S03-02 | /learn, /app/learning/progress; /app/learning/content | curriculum, assessment_blueprint, attempt, attempt_item, response, learning_progress, manual_grading; lesson_version, question_version, answer_key, assessment_blueprint, manual_grading, audit_logs | learning_service.start_attempt, learning_service.submit_attempt; learning_content_service.review_publish | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S03-01-H, TC-S03-01-A, TC-S03-01-R, TC-S03-02-H, TC-S03-02-A, TC-S03-02-R | SPECIFIED / runtime NOT RUN |
| REQ-S04 | 04 คำขอและสถานะหน่วยงาน | UC-S04-01, UC-S04-02 | /app/requests; /app/requests/{request_id}, /requests/track | change_request, request_version, impact_assessment, document, audit_logs; decision, status_event, activation_record, impact_assessment, audit_logs | request_service.submit; request_service.decide, request_service.activate, request_tracking_service.read | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S04-01-H, TC-S04-01-A, TC-S04-01-R, TC-S04-02-H, TC-S04-02-A, TC-S04-02-R | SPECIFIED / runtime NOT RUN |
| REQ-S05 | 05 ผู้เรียน สมัครสอบ และผลสอบ | UC-S05-01, UC-S05-02, UC-S05-03 | /app/exams/applications; /app/exams/results; /exams/results, /app/exams/results | person, organization, enrollment, application, application_snapshot, eligibility_rule_version, seat_allocation; subject_score, grading_rule_version, result_draft, result_release, application_snapshot, audit_logs; academic_year, exam_session, result_release, application_snapshot | application_service.create, application_service.approve, seat_service.allocate; score_service.validate, result_service.approve, result_service.publish; public_result_service.search_by_year | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S05-01-H, TC-S05-01-A, TC-S05-01-R, TC-S05-02-H, TC-S05-02-A, TC-S05-02-R, TC-S05-03-H, TC-S05-03-A, TC-S05-03-R, TC-C-PUBLISH | SPECIFIED / runtime NOT RUN |
| REQ-S06 | 06 งบประมาณ | UC-S06-01, UC-S06-02 | /app/budget; /app/budget/reports | fiscal_year, funding_source, budget_line, allocation, budget_event, reservation, obligation; disbursement, obligation, budget_event, period_close, fiscal_year, file_version | budget_service.reserve, budget_service.commit_obligation; budget_service.disburse, budget_report_service.export | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S06-01-H, TC-S06-01-A, TC-S06-01-R, TC-S06-02-H, TC-S06-02-A, TC-S06-02-R | SPECIFIED / runtime NOT RUN |
| REQ-S07 | 07 พัสดุและครุภัณฑ์ | UC-S07-01, UC-S07-02 | /app/inventory/stock; /app/inventory/assets | item, warehouse, procurement_request, order, goods_receipt, stock_movement, audit_logs; asset, asset_assignment, loan, maintenance, stocktake, disposal, person, audit_logs | inventory_service.move_stock, procurement_service.receive; asset_service.change_custody, stocktake_service.adjust | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S07-01-H, TC-S07-01-A, TC-S07-01-R, TC-S07-02-H, TC-S07-02-A, TC-S07-02-R | SPECIFIED / runtime NOT RUN |
| REQ-S08 | 08 สารบรรณออนไลน์ | UC-S08-01, UC-S08-02 | /app/office; /app/office/{record_id}, /app/office/{record_id}/print | correspondence, record_version, register_counter, routing, recipient_snapshot, file_version; receipt, assignment, correspondence, file_version, document_acl, audit_logs | office_service.register, office_service.send; office_service.acknowledge, document_service.download_print | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S08-01-H, TC-S08-01-A, TC-S08-01-R, TC-S08-02-H, TC-S08-02-A, TC-S08-02-R | SPECIFIED / runtime NOT RUN |
| REQ-S09 | 09 สมัครสอบผ่าน Excel | UC-S09-01, UC-S09-02 | /app/exams/imports; /downloads ต้นทางเทมเพลต; /app/exams/imports/{batch_id} | form_template_registry, import_batch, import_row, validation_issue, file_version; import_batch, import_row, commit_receipt, amendment_link, application, application_snapshot, audit_logs | import_service.dry_run, spreadsheet_service.read_template; import_service.commit, application_service.create, amendment_service.request | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S09-01-H, TC-S09-01-A, TC-S09-01-R, TC-S09-02-H, TC-S09-02-A, TC-S09-02-R | SPECIFIED / runtime NOT RUN |
| REQ-C01 | บัญชีและข้อมูลกลาง | UC-C01, UC-S01-01, UC-S02-01, UC-S05-01, UC-S09-02 | /login, /app/admin; /app/people, /registry; /app/organizations, /registry; /app/exams/applications; /app/exams/imports/{batch_id} | user_account, role, scope, role_assignment, person, audit_logs; person, person_private, person_name_history, position_assignment, user_account; organization, organization_relation, address_version, organization_location, audit_logs; person, organization, enrollment, application, application_snapshot, eligibility_rule_version, seat_allocation; import_batch, import_row, commit_receipt, amendment_link, application, application_snapshot, audit_logs | account_service.manage, authorization_service.assign_grant; people_service.read_person; organization_service.change_organization; application_service.create, application_service.approve, seat_service.allocate; import_service.commit, application_service.create, amendment_service.request | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-C01-H, TC-C01-A, TC-C01-R, TC-S01-01-H, TC-S01-01-A, TC-S01-01-R, TC-S02-01-H, TC-S02-01-A, TC-S02-01-R, TC-S05-01-H, TC-S05-01-A, TC-S05-01-R, TC-S09-02-H, TC-S09-02-A, TC-S09-02-R | SPECIFIED / runtime NOT RUN |
| REQ-C02 | เมนูสาธารณะ | UC-C02, UC-S05-03 | /, /news, /downloads, /contact; /exams/results, /app/exams/results | site_content, news_post, download_entry, document, file_version, audit_logs; academic_year, exam_session, result_release, application_snapshot | site_content_service.publish, download_service.get_public; public_result_service.search_by_year | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-C02-H, TC-C02-A, TC-C02-R, TC-S05-03-H, TC-S05-03-A, TC-S05-03-R | SPECIFIED / runtime NOT RUN |
| REQ-C03 | เมนูพื้นที่ทำงาน | UC-C01, UC-C02 | /login, /app/admin; /, /news, /downloads, /contact | user_account, role, scope, role_assignment, person, audit_logs; site_content, news_post, download_entry, document, file_version, audit_logs | account_service.manage, authorization_service.assign_grant; site_content_service.publish, download_service.get_public | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-C01-H, TC-C01-A, TC-C01-R, TC-C02-H, TC-C02-A, TC-C02-R | SPECIFIED / runtime NOT RUN |
| REQ-C04 | บริการและหน้ากลาง | UC-C02, UC-S09-01 | /, /news, /downloads, /contact; /app/exams/imports; /downloads ต้นทางเทมเพลต | site_content, news_post, download_entry, document, file_version, audit_logs; form_template_registry, import_batch, import_row, validation_issue, file_version | site_content_service.publish, download_service.get_public; import_service.dry_run, spreadsheet_service.read_template | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-C02-H, TC-C02-A, TC-C02-R, TC-S09-01-H, TC-S09-01-A, TC-S09-01-R | SPECIFIED / runtime NOT RUN |
| REQ-C05 | สิทธิ์สองชั้น | UC-S01-01, UC-S01-02, UC-S02-01, UC-S02-02, UC-S03-01, UC-S03-02, UC-S04-01, UC-S04-02, UC-S05-01, UC-S05-02, UC-S05-03, UC-S06-01, UC-S06-02, UC-S07-01, UC-S07-02, UC-S08-01, UC-S08-02, UC-S09-01, UC-S09-02, UC-C01, UC-C02, UC-C03 | /app/people, /registry; /app/people/requests; /app/organizations, /registry; /app/organizations/exam-centers; /learn, /app/learning/progress; /app/learning/content; /app/requests; /app/requests/{request_id}, /requests/track; /app/exams/applications; /app/exams/results; /exams/results, /app/exams/results; /app/budget; /app/budget/reports; /app/inventory/stock; /app/inventory/assets; /app/office; /app/office/{record_id}, /app/office/{record_id}/print; /app/exams/imports; /downloads ต้นทางเทมเพลต; /app/exams/imports/{batch_id}; /login, /app/admin; /, /news, /downloads, /contact; /app/admin/backup (เสนอ; privileged operation) | person, person_private, person_name_history, position_assignment, user_account; person_change_request, position_assignment, affiliation_history, person_status_event, audit_logs; organization, organization_relation, address_version, organization_location, audit_logs; exam_center, exam_session, center_session, exam_center_appointment, file_version; curriculum, assessment_blueprint, attempt, attempt_item, response, learning_progress, manual_grading; lesson_version, question_version, answer_key, assessment_blueprint, manual_grading, audit_logs; change_request, request_version, impact_assessment, document, audit_logs; decision, status_event, activation_record, impact_assessment, audit_logs; person, organization, enrollment, application, application_snapshot, eligibility_rule_version, seat_allocation; subject_score, grading_rule_version, result_draft, result_release, application_snapshot, audit_logs; academic_year, exam_session, result_release, application_snapshot; fiscal_year, funding_source, budget_line, allocation, budget_event, reservation, obligation; disbursement, obligation, budget_event, period_close, fiscal_year, file_version; item, warehouse, procurement_request, order, goods_receipt, stock_movement, audit_logs; asset, asset_assignment, loan, maintenance, stocktake, disposal, person, audit_logs; correspondence, record_version, register_counter, routing, recipient_snapshot, file_version; receipt, assignment, correspondence, file_version, document_acl, audit_logs; form_template_registry, import_batch, import_row, validation_issue, file_version; import_batch, import_row, commit_receipt, amendment_link, application, application_snapshot, audit_logs; user_account, role, scope, role_assignment, person, audit_logs; site_content, news_post, download_entry, document, file_version, audit_logs; backup_run, restore_run, document, file_version, audit_logs (ชื่อเสนอ) | people_service.read_person; people_service.change_person, workflow_service.decide; organization_service.change_organization; exam_center_service.open_session; learning_service.start_attempt, learning_service.submit_attempt; learning_content_service.review_publish; request_service.submit; request_service.decide, request_service.activate, request_tracking_service.read; application_service.create, application_service.approve, seat_service.allocate; score_service.validate, result_service.approve, result_service.publish; public_result_service.search_by_year; budget_service.reserve, budget_service.commit_obligation; budget_service.disburse, budget_report_service.export; inventory_service.move_stock, procurement_service.receive; asset_service.change_custody, stocktake_service.adjust; office_service.register, office_service.send; office_service.acknowledge, document_service.download_print; import_service.dry_run, spreadsheet_service.read_template; import_service.commit, application_service.create, amendment_service.request; account_service.manage, authorization_service.assign_grant; site_content_service.publish, download_service.get_public; backup_service.create_manifest, restore_service.verify | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S01-01-H, TC-S01-01-A, TC-S01-01-R, TC-S01-02-H, TC-S01-02-A, TC-S01-02-R, TC-S02-01-H, TC-S02-01-A, TC-S02-01-R, TC-S02-02-H, TC-S02-02-A, TC-S02-02-R, TC-S03-01-H, TC-S03-01-A, TC-S03-01-R, TC-S03-02-H, TC-S03-02-A, TC-S03-02-R, TC-S04-01-H, TC-S04-01-A, TC-S04-01-R, TC-S04-02-H, TC-S04-02-A, TC-S04-02-R, TC-S05-01-H, TC-S05-01-A, TC-S05-01-R, TC-S05-02-H, TC-S05-02-A, TC-S05-02-R, TC-S05-03-H, TC-S05-03-A, TC-S05-03-R, TC-S06-01-H, TC-S06-01-A, TC-S06-01-R, TC-S06-02-H, TC-S06-02-A, TC-S06-02-R, TC-S07-01-H, TC-S07-01-A, TC-S07-01-R, TC-S07-02-H, TC-S07-02-A, TC-S07-02-R, TC-S08-01-H, TC-S08-01-A, TC-S08-01-R, TC-S08-02-H, TC-S08-02-A, TC-S08-02-R, TC-S09-01-H, TC-S09-01-A, TC-S09-01-R, TC-S09-02-H, TC-S09-02-A, TC-S09-02-R, TC-C01-H, TC-C01-A, TC-C01-R, TC-C02-H, TC-C02-A, TC-C02-R, TC-C03-H, TC-C03-A, TC-C03-R, TC-C-AUTH, TC-C-ADMIN | SPECIFIED / runtime NOT RUN |
| REQ-C06 | RLS ทุกตาราง | UC-S01-01, UC-S01-02, UC-S02-01, UC-S02-02, UC-S03-01, UC-S03-02, UC-S04-01, UC-S04-02, UC-S05-01, UC-S05-02, UC-S05-03, UC-S06-01, UC-S06-02, UC-S07-01, UC-S07-02, UC-S08-01, UC-S08-02, UC-S09-01, UC-S09-02, UC-C01, UC-C02, UC-C03 | /app/people, /registry; /app/people/requests; /app/organizations, /registry; /app/organizations/exam-centers; /learn, /app/learning/progress; /app/learning/content; /app/requests; /app/requests/{request_id}, /requests/track; /app/exams/applications; /app/exams/results; /exams/results, /app/exams/results; /app/budget; /app/budget/reports; /app/inventory/stock; /app/inventory/assets; /app/office; /app/office/{record_id}, /app/office/{record_id}/print; /app/exams/imports; /downloads ต้นทางเทมเพลต; /app/exams/imports/{batch_id}; /login, /app/admin; /, /news, /downloads, /contact; /app/admin/backup (เสนอ; privileged operation) | person, person_private, person_name_history, position_assignment, user_account; person_change_request, position_assignment, affiliation_history, person_status_event, audit_logs; organization, organization_relation, address_version, organization_location, audit_logs; exam_center, exam_session, center_session, exam_center_appointment, file_version; curriculum, assessment_blueprint, attempt, attempt_item, response, learning_progress, manual_grading; lesson_version, question_version, answer_key, assessment_blueprint, manual_grading, audit_logs; change_request, request_version, impact_assessment, document, audit_logs; decision, status_event, activation_record, impact_assessment, audit_logs; person, organization, enrollment, application, application_snapshot, eligibility_rule_version, seat_allocation; subject_score, grading_rule_version, result_draft, result_release, application_snapshot, audit_logs; academic_year, exam_session, result_release, application_snapshot; fiscal_year, funding_source, budget_line, allocation, budget_event, reservation, obligation; disbursement, obligation, budget_event, period_close, fiscal_year, file_version; item, warehouse, procurement_request, order, goods_receipt, stock_movement, audit_logs; asset, asset_assignment, loan, maintenance, stocktake, disposal, person, audit_logs; correspondence, record_version, register_counter, routing, recipient_snapshot, file_version; receipt, assignment, correspondence, file_version, document_acl, audit_logs; form_template_registry, import_batch, import_row, validation_issue, file_version; import_batch, import_row, commit_receipt, amendment_link, application, application_snapshot, audit_logs; user_account, role, scope, role_assignment, person, audit_logs; site_content, news_post, download_entry, document, file_version, audit_logs; backup_run, restore_run, document, file_version, audit_logs (ชื่อเสนอ) | people_service.read_person; people_service.change_person, workflow_service.decide; organization_service.change_organization; exam_center_service.open_session; learning_service.start_attempt, learning_service.submit_attempt; learning_content_service.review_publish; request_service.submit; request_service.decide, request_service.activate, request_tracking_service.read; application_service.create, application_service.approve, seat_service.allocate; score_service.validate, result_service.approve, result_service.publish; public_result_service.search_by_year; budget_service.reserve, budget_service.commit_obligation; budget_service.disburse, budget_report_service.export; inventory_service.move_stock, procurement_service.receive; asset_service.change_custody, stocktake_service.adjust; office_service.register, office_service.send; office_service.acknowledge, document_service.download_print; import_service.dry_run, spreadsheet_service.read_template; import_service.commit, application_service.create, amendment_service.request; account_service.manage, authorization_service.assign_grant; site_content_service.publish, download_service.get_public; backup_service.create_manifest, restore_service.verify | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S01-01-H, TC-S01-01-A, TC-S01-01-R, TC-S01-02-H, TC-S01-02-A, TC-S01-02-R, TC-S02-01-H, TC-S02-01-A, TC-S02-01-R, TC-S02-02-H, TC-S02-02-A, TC-S02-02-R, TC-S03-01-H, TC-S03-01-A, TC-S03-01-R, TC-S03-02-H, TC-S03-02-A, TC-S03-02-R, TC-S04-01-H, TC-S04-01-A, TC-S04-01-R, TC-S04-02-H, TC-S04-02-A, TC-S04-02-R, TC-S05-01-H, TC-S05-01-A, TC-S05-01-R, TC-S05-02-H, TC-S05-02-A, TC-S05-02-R, TC-S05-03-H, TC-S05-03-A, TC-S05-03-R, TC-S06-01-H, TC-S06-01-A, TC-S06-01-R, TC-S06-02-H, TC-S06-02-A, TC-S06-02-R, TC-S07-01-H, TC-S07-01-A, TC-S07-01-R, TC-S07-02-H, TC-S07-02-A, TC-S07-02-R, TC-S08-01-H, TC-S08-01-A, TC-S08-01-R, TC-S08-02-H, TC-S08-02-A, TC-S08-02-R, TC-S09-01-H, TC-S09-01-A, TC-S09-01-R, TC-S09-02-H, TC-S09-02-A, TC-S09-02-R, TC-C01-H, TC-C01-A, TC-C01-R, TC-C02-H, TC-C02-A, TC-C02-R, TC-C03-H, TC-C03-A, TC-C03-R, TC-C-ESCALATE | SPECIFIED / runtime NOT RUN |
| REQ-C07 | แยกผู้สร้างกับผู้อนุมัติ | UC-S01-02, UC-S04-02, UC-S05-02, UC-S06-01, UC-C01 | /app/people/requests; /app/requests/{request_id}, /requests/track; /app/exams/results; /app/budget; /login, /app/admin | person_change_request, position_assignment, affiliation_history, person_status_event, audit_logs; decision, status_event, activation_record, impact_assessment, audit_logs; subject_score, grading_rule_version, result_draft, result_release, application_snapshot, audit_logs; fiscal_year, funding_source, budget_line, allocation, budget_event, reservation, obligation; user_account, role, scope, role_assignment, person, audit_logs | people_service.change_person, workflow_service.decide; request_service.decide, request_service.activate, request_tracking_service.read; score_service.validate, result_service.approve, result_service.publish; budget_service.reserve, budget_service.commit_obligation; account_service.manage, authorization_service.assign_grant | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S01-02-H, TC-S01-02-A, TC-S01-02-R, TC-S04-02-H, TC-S04-02-A, TC-S04-02-R, TC-S05-02-H, TC-S05-02-A, TC-S05-02-R, TC-S06-01-H, TC-S06-01-A, TC-S06-01-R, TC-C01-H, TC-C01-A, TC-C01-R, TC-C-SELF, TC-C-ADMIN | SPECIFIED / runtime NOT RUN |
| REQ-C08 | ข้อมูลสาธารณะ | UC-S01-01, UC-S05-03, UC-C02 | /app/people, /registry; /exams/results, /app/exams/results; /, /news, /downloads, /contact | person, person_private, person_name_history, position_assignment, user_account; academic_year, exam_session, result_release, application_snapshot; site_content, news_post, download_entry, document, file_version, audit_logs | people_service.read_person; public_result_service.search_by_year; site_content_service.publish, download_service.get_public | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S01-01-H, TC-S01-01-A, TC-S01-01-R, TC-S05-03-H, TC-S05-03-A, TC-S05-03-R, TC-C02-H, TC-C02-A, TC-C02-R | SPECIFIED / runtime NOT RUN |
| REQ-C09 | ภาษาและชื่อฐานข้อมูล | UC-S05-03, UC-S06-02, UC-S08-02 | /exams/results, /app/exams/results; /app/budget/reports; /app/office/{record_id}, /app/office/{record_id}/print | academic_year, exam_session, result_release, application_snapshot; disbursement, obligation, budget_event, period_close, fiscal_year, file_version; receipt, assignment, correspondence, file_version, document_acl, audit_logs | public_result_service.search_by_year; budget_service.disburse, budget_report_service.export; office_service.acknowledge, document_service.download_print | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S05-03-H, TC-S05-03-A, TC-S05-03-R, TC-S06-02-H, TC-S06-02-A, TC-S06-02-R, TC-S08-02-H, TC-S08-02-A, TC-S08-02-R, TC-C-LANGUAGE | SPECIFIED / runtime NOT RUN |
| REQ-C10 | migration เท่านั้น | UC-C01, UC-C03 | /login, /app/admin; /app/admin/backup (เสนอ; privileged operation) | user_account, role, scope, role_assignment, person, audit_logs; backup_run, restore_run, document, file_version, audit_logs (ชื่อเสนอ) | account_service.manage, authorization_service.assign_grant; backup_service.create_manifest, restore_service.verify | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-C01-H, TC-C01-A, TC-C01-R, TC-C03-H, TC-C03-A, TC-C03-R, TC-C-MIGRATION | SPECIFIED / runtime NOT RUN |
| REQ-C11 | audit | UC-S01-01, UC-S01-02, UC-S02-01, UC-S02-02, UC-S03-01, UC-S03-02, UC-S04-01, UC-S04-02, UC-S05-01, UC-S05-02, UC-S05-03, UC-S06-01, UC-S06-02, UC-S07-01, UC-S07-02, UC-S08-01, UC-S08-02, UC-S09-01, UC-S09-02, UC-C01, UC-C02, UC-C03 | /app/people, /registry; /app/people/requests; /app/organizations, /registry; /app/organizations/exam-centers; /learn, /app/learning/progress; /app/learning/content; /app/requests; /app/requests/{request_id}, /requests/track; /app/exams/applications; /app/exams/results; /exams/results, /app/exams/results; /app/budget; /app/budget/reports; /app/inventory/stock; /app/inventory/assets; /app/office; /app/office/{record_id}, /app/office/{record_id}/print; /app/exams/imports; /downloads ต้นทางเทมเพลต; /app/exams/imports/{batch_id}; /login, /app/admin; /, /news, /downloads, /contact; /app/admin/backup (เสนอ; privileged operation) | person, person_private, person_name_history, position_assignment, user_account; person_change_request, position_assignment, affiliation_history, person_status_event, audit_logs; organization, organization_relation, address_version, organization_location, audit_logs; exam_center, exam_session, center_session, exam_center_appointment, file_version; curriculum, assessment_blueprint, attempt, attempt_item, response, learning_progress, manual_grading; lesson_version, question_version, answer_key, assessment_blueprint, manual_grading, audit_logs; change_request, request_version, impact_assessment, document, audit_logs; decision, status_event, activation_record, impact_assessment, audit_logs; person, organization, enrollment, application, application_snapshot, eligibility_rule_version, seat_allocation; subject_score, grading_rule_version, result_draft, result_release, application_snapshot, audit_logs; academic_year, exam_session, result_release, application_snapshot; fiscal_year, funding_source, budget_line, allocation, budget_event, reservation, obligation; disbursement, obligation, budget_event, period_close, fiscal_year, file_version; item, warehouse, procurement_request, order, goods_receipt, stock_movement, audit_logs; asset, asset_assignment, loan, maintenance, stocktake, disposal, person, audit_logs; correspondence, record_version, register_counter, routing, recipient_snapshot, file_version; receipt, assignment, correspondence, file_version, document_acl, audit_logs; form_template_registry, import_batch, import_row, validation_issue, file_version; import_batch, import_row, commit_receipt, amendment_link, application, application_snapshot, audit_logs; user_account, role, scope, role_assignment, person, audit_logs; site_content, news_post, download_entry, document, file_version, audit_logs; backup_run, restore_run, document, file_version, audit_logs (ชื่อเสนอ) | people_service.read_person; people_service.change_person, workflow_service.decide; organization_service.change_organization; exam_center_service.open_session; learning_service.start_attempt, learning_service.submit_attempt; learning_content_service.review_publish; request_service.submit; request_service.decide, request_service.activate, request_tracking_service.read; application_service.create, application_service.approve, seat_service.allocate; score_service.validate, result_service.approve, result_service.publish; public_result_service.search_by_year; budget_service.reserve, budget_service.commit_obligation; budget_service.disburse, budget_report_service.export; inventory_service.move_stock, procurement_service.receive; asset_service.change_custody, stocktake_service.adjust; office_service.register, office_service.send; office_service.acknowledge, document_service.download_print; import_service.dry_run, spreadsheet_service.read_template; import_service.commit, application_service.create, amendment_service.request; account_service.manage, authorization_service.assign_grant; site_content_service.publish, download_service.get_public; backup_service.create_manifest, restore_service.verify | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S01-01-H, TC-S01-01-A, TC-S01-01-R, TC-S01-02-H, TC-S01-02-A, TC-S01-02-R, TC-S02-01-H, TC-S02-01-A, TC-S02-01-R, TC-S02-02-H, TC-S02-02-A, TC-S02-02-R, TC-S03-01-H, TC-S03-01-A, TC-S03-01-R, TC-S03-02-H, TC-S03-02-A, TC-S03-02-R, TC-S04-01-H, TC-S04-01-A, TC-S04-01-R, TC-S04-02-H, TC-S04-02-A, TC-S04-02-R, TC-S05-01-H, TC-S05-01-A, TC-S05-01-R, TC-S05-02-H, TC-S05-02-A, TC-S05-02-R, TC-S05-03-H, TC-S05-03-A, TC-S05-03-R, TC-S06-01-H, TC-S06-01-A, TC-S06-01-R, TC-S06-02-H, TC-S06-02-A, TC-S06-02-R, TC-S07-01-H, TC-S07-01-A, TC-S07-01-R, TC-S07-02-H, TC-S07-02-A, TC-S07-02-R, TC-S08-01-H, TC-S08-01-A, TC-S08-01-R, TC-S08-02-H, TC-S08-02-A, TC-S08-02-R, TC-S09-01-H, TC-S09-01-A, TC-S09-01-R, TC-S09-02-H, TC-S09-02-A, TC-S09-02-R, TC-C01-H, TC-C01-A, TC-C01-R, TC-C02-H, TC-C02-A, TC-C02-R, TC-C03-H, TC-C03-A, TC-C03-R, TC-C-AUDIT | SPECIFIED / runtime NOT RUN |
| REQ-C12 | ปิดใช้งานและประวัติ | UC-S01-02, UC-S02-01, UC-S05-02, UC-S07-02 | /app/people/requests; /app/organizations, /registry; /app/exams/results; /app/inventory/assets | person_change_request, position_assignment, affiliation_history, person_status_event, audit_logs; organization, organization_relation, address_version, organization_location, audit_logs; subject_score, grading_rule_version, result_draft, result_release, application_snapshot, audit_logs; asset, asset_assignment, loan, maintenance, stocktake, disposal, person, audit_logs | people_service.change_person, workflow_service.decide; organization_service.change_organization; score_service.validate, result_service.approve, result_service.publish; asset_service.change_custody, stocktake_service.adjust | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S01-02-H, TC-S01-02-A, TC-S01-02-R, TC-S02-01-H, TC-S02-01-A, TC-S02-01-R, TC-S05-02-H, TC-S05-02-A, TC-S05-02-R, TC-S07-02-H, TC-S07-02-A, TC-S07-02-R | SPECIFIED / runtime NOT RUN |
| REQ-C13 | ชิ้นส่วนร่วม | UC-S04-01, UC-S06-01, UC-S08-01, UC-C02 | /app/requests; /app/budget; /app/office; /, /news, /downloads, /contact | change_request, request_version, impact_assessment, document, audit_logs; fiscal_year, funding_source, budget_line, allocation, budget_event, reservation, obligation; correspondence, record_version, register_counter, routing, recipient_snapshot, file_version; site_content, news_post, download_entry, document, file_version, audit_logs | request_service.submit; budget_service.reserve, budget_service.commit_obligation; office_service.register, office_service.send; site_content_service.publish, download_service.get_public | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S04-01-H, TC-S04-01-A, TC-S04-01-R, TC-S06-01-H, TC-S06-01-A, TC-S06-01-R, TC-S08-01-H, TC-S08-01-A, TC-S08-01-R, TC-C02-H, TC-C02-A, TC-C02-R, TC-C-REUSE | SPECIFIED / runtime NOT RUN |
| REQ-C14 | กฎไม่ยืนยัน | UC-S01-01, UC-S01-02, UC-S02-01, UC-S02-02, UC-S03-01, UC-S03-02, UC-S04-01, UC-S04-02, UC-S05-01, UC-S05-02, UC-S05-03, UC-S06-01, UC-S06-02, UC-S07-01, UC-S07-02, UC-S08-01, UC-S08-02, UC-S09-01, UC-S09-02, UC-C01, UC-C02, UC-C03 | /app/people, /registry; /app/people/requests; /app/organizations, /registry; /app/organizations/exam-centers; /learn, /app/learning/progress; /app/learning/content; /app/requests; /app/requests/{request_id}, /requests/track; /app/exams/applications; /app/exams/results; /exams/results, /app/exams/results; /app/budget; /app/budget/reports; /app/inventory/stock; /app/inventory/assets; /app/office; /app/office/{record_id}, /app/office/{record_id}/print; /app/exams/imports; /downloads ต้นทางเทมเพลต; /app/exams/imports/{batch_id}; /login, /app/admin; /, /news, /downloads, /contact; /app/admin/backup (เสนอ; privileged operation) | person, person_private, person_name_history, position_assignment, user_account; person_change_request, position_assignment, affiliation_history, person_status_event, audit_logs; organization, organization_relation, address_version, organization_location, audit_logs; exam_center, exam_session, center_session, exam_center_appointment, file_version; curriculum, assessment_blueprint, attempt, attempt_item, response, learning_progress, manual_grading; lesson_version, question_version, answer_key, assessment_blueprint, manual_grading, audit_logs; change_request, request_version, impact_assessment, document, audit_logs; decision, status_event, activation_record, impact_assessment, audit_logs; person, organization, enrollment, application, application_snapshot, eligibility_rule_version, seat_allocation; subject_score, grading_rule_version, result_draft, result_release, application_snapshot, audit_logs; academic_year, exam_session, result_release, application_snapshot; fiscal_year, funding_source, budget_line, allocation, budget_event, reservation, obligation; disbursement, obligation, budget_event, period_close, fiscal_year, file_version; item, warehouse, procurement_request, order, goods_receipt, stock_movement, audit_logs; asset, asset_assignment, loan, maintenance, stocktake, disposal, person, audit_logs; correspondence, record_version, register_counter, routing, recipient_snapshot, file_version; receipt, assignment, correspondence, file_version, document_acl, audit_logs; form_template_registry, import_batch, import_row, validation_issue, file_version; import_batch, import_row, commit_receipt, amendment_link, application, application_snapshot, audit_logs; user_account, role, scope, role_assignment, person, audit_logs; site_content, news_post, download_entry, document, file_version, audit_logs; backup_run, restore_run, document, file_version, audit_logs (ชื่อเสนอ) | people_service.read_person; people_service.change_person, workflow_service.decide; organization_service.change_organization; exam_center_service.open_session; learning_service.start_attempt, learning_service.submit_attempt; learning_content_service.review_publish; request_service.submit; request_service.decide, request_service.activate, request_tracking_service.read; application_service.create, application_service.approve, seat_service.allocate; score_service.validate, result_service.approve, result_service.publish; public_result_service.search_by_year; budget_service.reserve, budget_service.commit_obligation; budget_service.disburse, budget_report_service.export; inventory_service.move_stock, procurement_service.receive; asset_service.change_custody, stocktake_service.adjust; office_service.register, office_service.send; office_service.acknowledge, document_service.download_print; import_service.dry_run, spreadsheet_service.read_template; import_service.commit, application_service.create, amendment_service.request; account_service.manage, authorization_service.assign_grant; site_content_service.publish, download_service.get_public; backup_service.create_manifest, restore_service.verify | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S01-01-H, TC-S01-01-A, TC-S01-01-R, TC-S01-02-H, TC-S01-02-A, TC-S01-02-R, TC-S02-01-H, TC-S02-01-A, TC-S02-01-R, TC-S02-02-H, TC-S02-02-A, TC-S02-02-R, TC-S03-01-H, TC-S03-01-A, TC-S03-01-R, TC-S03-02-H, TC-S03-02-A, TC-S03-02-R, TC-S04-01-H, TC-S04-01-A, TC-S04-01-R, TC-S04-02-H, TC-S04-02-A, TC-S04-02-R, TC-S05-01-H, TC-S05-01-A, TC-S05-01-R, TC-S05-02-H, TC-S05-02-A, TC-S05-02-R, TC-S05-03-H, TC-S05-03-A, TC-S05-03-R, TC-S06-01-H, TC-S06-01-A, TC-S06-01-R, TC-S06-02-H, TC-S06-02-A, TC-S06-02-R, TC-S07-01-H, TC-S07-01-A, TC-S07-01-R, TC-S07-02-H, TC-S07-02-A, TC-S07-02-R, TC-S08-01-H, TC-S08-01-A, TC-S08-01-R, TC-S08-02-H, TC-S08-02-A, TC-S08-02-R, TC-S09-01-H, TC-S09-01-A, TC-S09-01-R, TC-S09-02-H, TC-S09-02-A, TC-S09-02-R, TC-C01-H, TC-C01-A, TC-C01-R, TC-C02-H, TC-C02-A, TC-C02-R, TC-C03-H, TC-C03-A, TC-C03-R, TC-C-RULES | SPECIFIED / runtime NOT RUN |
| REQ-C15 | ไฟล์และเอกสารพิมพ์ | UC-S08-02, UC-S09-01, UC-C02 | /app/office/{record_id}, /app/office/{record_id}/print; /app/exams/imports; /downloads ต้นทางเทมเพลต; /, /news, /downloads, /contact | receipt, assignment, correspondence, file_version, document_acl, audit_logs; form_template_registry, import_batch, import_row, validation_issue, file_version; site_content, news_post, download_entry, document, file_version, audit_logs | office_service.acknowledge, document_service.download_print; import_service.dry_run, spreadsheet_service.read_template; site_content_service.publish, download_service.get_public | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S08-02-H, TC-S08-02-A, TC-S08-02-R, TC-S09-01-H, TC-S09-01-A, TC-S09-01-R, TC-C02-H, TC-C02-A, TC-C02-R, TC-C-DOWNLOAD, TC-C-CACHE | SPECIFIED / runtime NOT RUN |
| REQ-C16 | ธุรกรรมและรายการซ้ำ | UC-S05-01, UC-S06-01, UC-S07-01, UC-S09-02 | /app/exams/applications; /app/budget; /app/inventory/stock; /app/exams/imports/{batch_id} | person, organization, enrollment, application, application_snapshot, eligibility_rule_version, seat_allocation; fiscal_year, funding_source, budget_line, allocation, budget_event, reservation, obligation; item, warehouse, procurement_request, order, goods_receipt, stock_movement, audit_logs; import_batch, import_row, commit_receipt, amendment_link, application, application_snapshot, audit_logs | application_service.create, application_service.approve, seat_service.allocate; budget_service.reserve, budget_service.commit_obligation; inventory_service.move_stock, procurement_service.receive; import_service.commit, application_service.create, amendment_service.request | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S05-01-H, TC-S05-01-A, TC-S05-01-R, TC-S06-01-H, TC-S06-01-A, TC-S06-01-R, TC-S07-01-H, TC-S07-01-A, TC-S07-01-R, TC-S09-02-H, TC-S09-02-A, TC-S09-02-R | SPECIFIED / runtime NOT RUN |
| REQ-C17 | ปีและสถานะแยกกัน | UC-S03-01, UC-S04-02, UC-S05-03, UC-S06-02 | /learn, /app/learning/progress; /app/requests/{request_id}, /requests/track; /exams/results, /app/exams/results; /app/budget/reports | curriculum, assessment_blueprint, attempt, attempt_item, response, learning_progress, manual_grading; decision, status_event, activation_record, impact_assessment, audit_logs; academic_year, exam_session, result_release, application_snapshot; disbursement, obligation, budget_event, period_close, fiscal_year, file_version | learning_service.start_attempt, learning_service.submit_attempt; request_service.decide, request_service.activate, request_tracking_service.read; public_result_service.search_by_year; budget_service.disburse, budget_report_service.export | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S03-01-H, TC-S03-01-A, TC-S03-01-R, TC-S04-02-H, TC-S04-02-A, TC-S04-02-R, TC-S05-03-H, TC-S05-03-A, TC-S05-03-R, TC-S06-02-H, TC-S06-02-A, TC-S06-02-R | SPECIFIED / runtime NOT RUN |
| REQ-C18 | เทคโนโลยี | UC-C01, UC-S09-01, UC-S08-02 | /login, /app/admin; /app/exams/imports; /downloads ต้นทางเทมเพลต; /app/office/{record_id}, /app/office/{record_id}/print | user_account, role, scope, role_assignment, person, audit_logs; form_template_registry, import_batch, import_row, validation_issue, file_version; receipt, assignment, correspondence, file_version, document_acl, audit_logs | account_service.manage, authorization_service.assign_grant; import_service.dry_run, spreadsheet_service.read_template; office_service.acknowledge, document_service.download_print | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-C01-H, TC-C01-A, TC-C01-R, TC-S09-01-H, TC-S09-01-A, TC-S09-01-R, TC-S08-02-H, TC-S08-02-A, TC-S08-02-R, TC-C-VERSIONS | SPECIFIED / runtime NOT RUN |
| REQ-C19 | ส่งมอบทีละบท | UC-C01, UC-C02 | /login, /app/admin; /, /news, /downloads, /contact | user_account, role, scope, role_assignment, person, audit_logs; site_content, news_post, download_entry, document, file_version, audit_logs | account_service.manage, authorization_service.assign_grant; site_content_service.publish, download_service.get_public | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-C01-H, TC-C01-A, TC-C01-R, TC-C02-H, TC-C02-A, TC-C02-R, TC-C-CHAPTER | SPECIFIED / runtime NOT RUN |
| REQ-C20 | การเปิดใช้จริง | UC-C03, UC-S05-02 | /app/admin/backup (เสนอ; privileged operation); /app/exams/results | backup_run, restore_run, document, file_version, audit_logs (ชื่อเสนอ); subject_score, grading_rule_version, result_draft, result_release, application_snapshot, audit_logs | backup_service.create_manifest, restore_service.verify; score_service.validate, result_service.approve, result_service.publish | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-C03-H, TC-C03-A, TC-C03-R, TC-S05-02-H, TC-S05-02-A, TC-S05-02-R, TC-C-RELEASE | SPECIFIED / runtime NOT RUN |
| REQ-N01 | วันเวลาไทยและ พ.ศ. | UC-S04-02, UC-S05-01, UC-S08-02 | /app/requests/{request_id}, /requests/track; /app/exams/applications; /app/office/{record_id}, /app/office/{record_id}/print | decision, status_event, activation_record, impact_assessment, audit_logs; person, organization, enrollment, application, application_snapshot, eligibility_rule_version, seat_allocation; receipt, assignment, correspondence, file_version, document_acl, audit_logs | request_service.decide, request_service.activate, request_tracking_service.read; application_service.create, application_service.approve, seat_service.allocate; office_service.acknowledge, document_service.download_print | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S04-02-H, TC-S04-02-A, TC-S04-02-R, TC-S05-01-H, TC-S05-01-A, TC-S05-01-R, TC-S08-02-H, TC-S08-02-A, TC-S08-02-R, TC-N01-01 | SPECIFIED / runtime NOT RUN |
| REQ-N02 | ปีการศึกษาแยกปีงบ | UC-S05-03, UC-S06-02 | /exams/results, /app/exams/results; /app/budget/reports | academic_year, exam_session, result_release, application_snapshot; disbursement, obligation, budget_event, period_close, fiscal_year, file_version | public_result_service.search_by_year; budget_service.disburse, budget_report_service.export | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S05-03-H, TC-S05-03-A, TC-S05-03-R, TC-S06-02-H, TC-S06-02-A, TC-S06-02-R, TC-N02-01 | SPECIFIED / runtime NOT RUN |
| REQ-N03 | การเข้าถึงสำหรับผู้พิการ | UC-S03-01, UC-C01, UC-C02 | /learn, /app/learning/progress; /login, /app/admin; /, /news, /downloads, /contact | curriculum, assessment_blueprint, attempt, attempt_item, response, learning_progress, manual_grading; user_account, role, scope, role_assignment, person, audit_logs; site_content, news_post, download_entry, document, file_version, audit_logs | learning_service.start_attempt, learning_service.submit_attempt; account_service.manage, authorization_service.assign_grant; site_content_service.publish, download_service.get_public | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S03-01-H, TC-S03-01-A, TC-S03-01-R, TC-C01-H, TC-C01-A, TC-C01-R, TC-C02-H, TC-C02-A, TC-C02-R, TC-N03-01, TC-N03-02, TC-N03-03, TC-N03-04 | SPECIFIED / runtime NOT RUN |
| REQ-N04 | สำรองและกู้คืน | UC-C03 | /app/admin/backup (เสนอ; privileged operation) | backup_run, restore_run, document, file_version, audit_logs (ชื่อเสนอ) | backup_service.create_manifest, restore_service.verify | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-C03-H, TC-C03-A, TC-C03-R, TC-N04-01 | SPECIFIED / runtime NOT RUN |
| REQ-N05 | สิทธิ์ล่าสุดและ old/new scope | UC-S01-02, UC-S09-02, UC-C01 | /app/people/requests; /app/exams/imports/{batch_id}; /login, /app/admin | person_change_request, position_assignment, affiliation_history, person_status_event, audit_logs; import_batch, import_row, commit_receipt, amendment_link, application, application_snapshot, audit_logs; user_account, role, scope, role_assignment, person, audit_logs | people_service.change_person, workflow_service.decide; import_service.commit, application_service.create, amendment_service.request; account_service.manage, authorization_service.assign_grant | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S01-02-H, TC-S01-02-A, TC-S01-02-R, TC-S09-02-H, TC-S09-02-A, TC-S09-02-R, TC-C01-H, TC-C01-A, TC-C01-R, TC-N05-01 | SPECIFIED / runtime NOT RUN |
| REQ-N06 | ข้อผิดพลาด API และ recovery | UC-S01-01, UC-S01-02, UC-S02-01, UC-S02-02, UC-S03-01, UC-S03-02, UC-S04-01, UC-S04-02, UC-S05-01, UC-S05-02, UC-S05-03, UC-S06-01, UC-S06-02, UC-S07-01, UC-S07-02, UC-S08-01, UC-S08-02, UC-S09-01, UC-S09-02, UC-C01, UC-C02, UC-C03 | /app/people, /registry; /app/people/requests; /app/organizations, /registry; /app/organizations/exam-centers; /learn, /app/learning/progress; /app/learning/content; /app/requests; /app/requests/{request_id}, /requests/track; /app/exams/applications; /app/exams/results; /exams/results, /app/exams/results; /app/budget; /app/budget/reports; /app/inventory/stock; /app/inventory/assets; /app/office; /app/office/{record_id}, /app/office/{record_id}/print; /app/exams/imports; /downloads ต้นทางเทมเพลต; /app/exams/imports/{batch_id}; /login, /app/admin; /, /news, /downloads, /contact; /app/admin/backup (เสนอ; privileged operation) | person, person_private, person_name_history, position_assignment, user_account; person_change_request, position_assignment, affiliation_history, person_status_event, audit_logs; organization, organization_relation, address_version, organization_location, audit_logs; exam_center, exam_session, center_session, exam_center_appointment, file_version; curriculum, assessment_blueprint, attempt, attempt_item, response, learning_progress, manual_grading; lesson_version, question_version, answer_key, assessment_blueprint, manual_grading, audit_logs; change_request, request_version, impact_assessment, document, audit_logs; decision, status_event, activation_record, impact_assessment, audit_logs; person, organization, enrollment, application, application_snapshot, eligibility_rule_version, seat_allocation; subject_score, grading_rule_version, result_draft, result_release, application_snapshot, audit_logs; academic_year, exam_session, result_release, application_snapshot; fiscal_year, funding_source, budget_line, allocation, budget_event, reservation, obligation; disbursement, obligation, budget_event, period_close, fiscal_year, file_version; item, warehouse, procurement_request, order, goods_receipt, stock_movement, audit_logs; asset, asset_assignment, loan, maintenance, stocktake, disposal, person, audit_logs; correspondence, record_version, register_counter, routing, recipient_snapshot, file_version; receipt, assignment, correspondence, file_version, document_acl, audit_logs; form_template_registry, import_batch, import_row, validation_issue, file_version; import_batch, import_row, commit_receipt, amendment_link, application, application_snapshot, audit_logs; user_account, role, scope, role_assignment, person, audit_logs; site_content, news_post, download_entry, document, file_version, audit_logs; backup_run, restore_run, document, file_version, audit_logs (ชื่อเสนอ) | people_service.read_person; people_service.change_person, workflow_service.decide; organization_service.change_organization; exam_center_service.open_session; learning_service.start_attempt, learning_service.submit_attempt; learning_content_service.review_publish; request_service.submit; request_service.decide, request_service.activate, request_tracking_service.read; application_service.create, application_service.approve, seat_service.allocate; score_service.validate, result_service.approve, result_service.publish; public_result_service.search_by_year; budget_service.reserve, budget_service.commit_obligation; budget_service.disburse, budget_report_service.export; inventory_service.move_stock, procurement_service.receive; asset_service.change_custody, stocktake_service.adjust; office_service.register, office_service.send; office_service.acknowledge, document_service.download_print; import_service.dry_run, spreadsheet_service.read_template; import_service.commit, application_service.create, amendment_service.request; account_service.manage, authorization_service.assign_grant; site_content_service.publish, download_service.get_public; backup_service.create_manifest, restore_service.verify | 02: specification; ลงมือ: Q020 (รอพรอมป์ต์) | TC-S01-01-H, TC-S01-01-A, TC-S01-01-R, TC-S01-02-H, TC-S01-02-A, TC-S01-02-R, TC-S02-01-H, TC-S02-01-A, TC-S02-01-R, TC-S02-02-H, TC-S02-02-A, TC-S02-02-R, TC-S03-01-H, TC-S03-01-A, TC-S03-01-R, TC-S03-02-H, TC-S03-02-A, TC-S03-02-R, TC-S04-01-H, TC-S04-01-A, TC-S04-01-R, TC-S04-02-H, TC-S04-02-A, TC-S04-02-R, TC-S05-01-H, TC-S05-01-A, TC-S05-01-R, TC-S05-02-H, TC-S05-02-A, TC-S05-02-R, TC-S05-03-H, TC-S05-03-A, TC-S05-03-R, TC-S06-01-H, TC-S06-01-A, TC-S06-01-R, TC-S06-02-H, TC-S06-02-A, TC-S06-02-R, TC-S07-01-H, TC-S07-01-A, TC-S07-01-R, TC-S07-02-H, TC-S07-02-A, TC-S07-02-R, TC-S08-01-H, TC-S08-01-A, TC-S08-01-R, TC-S08-02-H, TC-S08-02-A, TC-S08-02-R, TC-S09-01-H, TC-S09-01-A, TC-S09-01-R, TC-S09-02-H, TC-S09-02-A, TC-S09-02-R, TC-C01-H, TC-C01-A, TC-C01-R, TC-C02-H, TC-C02-A, TC-C02-R, TC-C03-H, TC-C03-A, TC-C03-R, TC-N06-01 | SPECIFIED / runtime NOT RUN |

REQ-C10/REQ-C13/REQ-C18/REQ-C19เป็นข้อกำหนดข้ามระบบ: ในบทimplementationต้องตรวจmigration inventory/component reuse/lockfileและgit/progressเพิ่มเติมจากUC ในบท02ตรวจเอกสารว่าสอดคล้อง ไม่ถือว่าtestsของฟังก์ชันเพียงอย่างเดียวตรวจครบprocessนี้

## 3 Catalog กรณีทดสอบ

ข้อมูลต้องเป็นสมมติ ใช้สายA/ลูกA/สายB คนA/B grantเฉพาะและช่วงเวลา กรณีhappy/pathต้องตรวจAuditตามUC กรณีdenyต้องตรวจไม่มีmutation/ข้อมูลprivate รวมการส่งใหม่/ค่าที่แอบเปลี่ยน; nativeAPIต้องใช้restrictedJWT ไม่ใช้servicecredentialยกระดับจนผลไร้ความหมาย

| Test ID | UC/ขอบเขต | ชนิด | Input/การกระทำ | ผลที่คาดหวัง | ผลที่รัน |
| --- | --- | --- | --- | --- | --- |
| TC-S01-01-H | UC-S01-01 | happy path | เจ้าของข้อมูล; เจ้าหน้าที่ทะเบียนที่ได้รับมอบหมาย; ผู้เยี่ยมชมใช้เฉพาะ public projection พร้อม grantและข้อมูลสมมติถูกต้อง | บัญชีที่ผูก person A อ่านข้อมูลตน A ได้; อ่าน person B โดยแก้ URL ไม่ได้; เจ้าหน้าที่สาย A เห็นหน่วยลูกสาย A แต่ไม่เห็นสาย B; public ไม่มีข้อมูลส่วนตัว 4 กลุ่ม | PLANNED / NOT RUN |
| TC-S01-01-A | UC-S01-01 | direct app API denied | GET /api/people/{person_id} โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-S01-01-R | UC-S01-01 | direct native API/RLS | person, person_private, person_name_history, position_assignment, user_account หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-S01-02-H | UC-S01-02 | happy path | เจ้าของข้อมูลหรือผู้แก้ทะเบียน; ผู้ตรวจ/ผู้อนุมัติที่รับมอบหมายแยกจากผู้สร้าง พร้อม grantและข้อมูลสมมติถูกต้อง | ส่งคำขอย้ายแล้วสังกัดยังเดิม; อนุมัติล่วงหน้าแล้วก่อนวันมีผลยังเดิม; ถึงวันมีผลมีประวัติใหม่ครบและข้อมูลปีเก่าไม่เปลี่ยน; ลาออก ลาสิกขาและเสียชีวิตใช้ผลกระทบแยก | PLANNED / NOT RUN |
| TC-S01-02-A | UC-S01-02 | direct app API denied | POST /api/people/change-requests โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-S01-02-R | UC-S01-02 | direct native API/RLS | person_change_request, position_assignment, affiliation_history, person_status_event, audit_logs หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-S02-01-H | UC-S02-01 | happy path | เจ้าหน้าที่ทะเบียนหน่วยงานตาม scope และผู้ตรวจข้อมูลพื้นที่ พร้อม grantและข้อมูลสมมติถูกต้อง | สร้างหน่วยสมมติหนึ่งรหัสใช้กับสมัครสอบและพัสดุได้; เปลี่ยนที่อยู่ปัจจุบันแล้ว snapshot ปีเก่าเท่าเดิม; cycle และการย้ายข้ามสายโดยไม่มี grant ถูกปฏิเสธ | PLANNED / NOT RUN |
| TC-S02-01-A | UC-S02-01 | direct app API denied | PATCH /api/organizations/{organization_id} โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-S02-01-R | UC-S02-01 | direct native API/RLS | organization, organization_relation, address_version, organization_location, audit_logs หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-S02-02-H | UC-S02-02 | happy path | เจ้าหน้าที่สนาม/ทะเบียนและผู้มีอำนาจตามรอบ พร้อม grantและข้อมูลสมมติถูกต้อง | หนึ่งสนามเปิดได้หลายปีด้วยคนละ center_session; เปลี่ยนผู้รับปีใหม่ไม่เปลี่ยนใบจัดส่งปีเก่า; ผู้รับข้อสอบไม่มีสิทธิ์อ่านเนื้อหาข้อสอบลับเพียงเพราะมีชื่อ | PLANNED / NOT RUN |
| TC-S02-02-A | UC-S02-02 | direct app API denied | POST /api/exam-centers/{exam_center_id}/sessions โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-S02-02-R | UC-S02-02 | direct native API/RLS | exam_center, exam_session, center_session, exam_center_appointment, file_version หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-S03-01-H | UC-S03-01 | happy path | ผู้เรียนที่ผูกบัญชีกับ person และ enrollment ของตน พร้อม grantและข้อมูลสมมติถูกต้อง | ครบ 9 กลุ่มเดินก่อน–เรียน–หลังได้; ก่อนส่งไม่มีเฉลยใน payload; posttest ของตน resume ได้หลังเครือข่ายขาด; คะแนนฝึกไม่ปรากฏเป็นผลทางการ | PLANNED / NOT RUN |
| TC-S03-01-A | UC-S03-01 | direct app API denied | POST /api/learning/attempts/{attempt_id}/submit โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-S03-01-R | UC-S03-01 | direct native API/RLS | curriculum, assessment_blueprint, attempt, attempt_item, response, learning_progress, manual_grading หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-S03-02-H | UC-S03-02 | happy path | ผู้สอน ผู้ตรวจเนื้อหา และผู้เผยแพร่เนื้อหาที่แยก grant พร้อม grantและข้อมูลสมมติถูกต้อง | ร่างไม่ปรากฏ public; ผู้เขียนส่งได้แต่อนุมัติตนไม่ได้; ผู้เผยแพร่เผยแพร่เฉพาะรุ่นรับรอง; แก้คำถามไม่เปลี่ยนคะแนน attempt เก่า | PLANNED / NOT RUN |
| TC-S03-02-A | UC-S03-02 | direct app API denied | POST /api/learning/content/{content_id}/publish โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-S03-02-R | UC-S03-02 | direct native API/RLS | lesson_version, question_version, answer_key, assessment_blueprint, manual_grading, audit_logs หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-S04-01-H | UC-S04-01 | happy path | ผู้เสนอจากหน่วยที่ได้รับมอบหมายและผู้ตรวจคำขอ พร้อม grantและข้อมูลสมมติถูกต้อง | ส่งคำขอสมมติแล้วทะเบียน active ยังเดิม; แสดง impact พร้อมรายการค้างตามสิทธิ์; ผู้เสนอในสาย A สร้างเรื่องของสาย B ผ่าน API ไม่ได้ | PLANNED / NOT RUN |
| TC-S04-01-A | UC-S04-01 | direct app API denied | POST /api/requests โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-S04-01-R | UC-S04-01 | direct native API/RLS | change_request, request_version, impact_assessment, document, audit_logs หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-S04-02-H | UC-S04-02 | happy path | ผู้ตรวจ ผู้อนุมัติ; ผู้ติดตามที่มี tracking capability ตามนโยบาย พร้อม grantและข้อมูลสมมติถูกต้อง | อนุมัติล่วงหน้าไม่เปลี่ยนสนามก่อนวันจริง; retry activation ไม่สร้าง event ซ้ำ; public ไม่เดาคำขออื่นจากเลขต่อเนื่อง; การแก้คำสั่งเก็บประวัติเดิม | PLANNED / NOT RUN |
| TC-S04-02-A | UC-S04-02 | direct app API denied | POST /api/requests/{request_id}/decisions โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-S04-02-R | UC-S04-02 | direct native API/RLS | decision, status_event, activation_record, impact_assessment, audit_logs หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-S05-01-H | UC-S05-01 | happy path | เจ้าหน้าที่สำนัก/สถานศึกษา; เจ้าหน้าที่สนามที่รับมอบหมาย; ผู้อนุมัติสมัคร พร้อม grantและข้อมูลสมมติถูกต้อง | สมัครผ่านเว็บและ Excel ด้วย business key เดียวมี application เดียว; กดซ้ำ receipt เดิม; ไม่มี seat ซ้ำในรอบที่อนุมัติ; แบบไม่ยืนยันใช้เฉพาะ schema ทดลอง | PLANNED / NOT RUN |
| TC-S05-01-A | UC-S05-01 | direct app API denied | POST /api/exams/applications โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-S05-01-R | UC-S05-01 | direct native API/RLS | person, organization, enrollment, application, application_snapshot, eligibility_rule_version, seat_allocation หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-S05-02-H | UC-S05-02 | happy path | เจ้าหน้าที่คะแนน ผู้รับรองผล และผู้เผยแพร่ที่ได้รับ grant แยกกัน พร้อม grantและข้อมูลสมมติถูกต้อง | คะแนนผิดคนไม่เข้าสู่ release; draft ไม่ปรากฏ public; approver ที่ไม่มี P06 เผยแพร่ไม่ได้; release มีคนรับรองคนละคนกับผู้สร้างและเวลาที่ตรวจย้อนกลับได้ | PLANNED / NOT RUN |
| TC-S05-02-A | UC-S05-02 | direct app API denied | POST /api/exams/result-drafts/{draft_id}/publish โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-S05-02-R | UC-S05-02 | direct native API/RLS | subject_score, grading_rule_version, result_draft, result_release, application_snapshot, audit_logs หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-S05-03-H | UC-S05-03 | happy path | ผู้เยี่ยมชมทั่วไป; เจ้าหน้าที่หรือเจ้าของข้อมูลตามสิทธิ์เมื่อดูรายละเอียดภายใน พร้อม grantและข้อมูลสมมติถูกต้อง | คนสมมติชื่อเดียวมีผลสองปี เลือกปีหนึ่งได้เฉพาะ release ปีนั้น; draft ไม่ปรากฏแม้เรียก API ตรง; response และ PDF สาธารณะไม่มี 4 กลุ่มข้อมูลส่วนตัว | PLANNED / NOT RUN |
| TC-S05-03-A | UC-S05-03 | direct app API denied | GET /api/public/results?academic_year_id={year_id} โดยไม่ผ่านUI/ไม่มีgrantหรือscope | publicค้นเฉพาะปี/releaseที่อนุญาต; include_private/include_draftไม่คืนprivate; privateendpointไม่มีsession401 | PLANNED / NOT RUN |
| TC-S05-03-R | UC-S05-03 | direct native API/RLS | academic_year, exam_session, result_release, application_snapshot หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-S06-01-H | UC-S06-01 | happy path | เจ้าหน้าที่การเงิน ผู้ตรวจและผู้อนุมัติตามแหล่งเงิน/วงเงิน พร้อม grantและข้อมูลสมมติถูกต้อง | งบ 100000 จอง 20000 เหลือ 80000 เปลี่ยนผูกพัน 20000 ยังคง 80000; retry key เดิมมี budget_event เดิม; งานพร้อมกันไม่จองเกินงบ | PLANNED / NOT RUN |
| TC-S06-01-A | UC-S06-01 | direct app API denied | POST /api/budget/reservations โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-S06-01-R | UC-S06-01 | direct native API/RLS | fiscal_year, funding_source, budget_line, allocation, budget_event, reservation, obligation หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-S06-02-H | UC-S06-02 | happy path | เจ้าหน้าที่การเงิน ผู้อนุมัติ และผู้ตรวจสอบที่มี read grant พร้อม grantและข้อมูลสมมติถูกต้อง | จากผูกพัน 20000 จ่าย 5000 ภาระค้าง 15000 ค่าใช้จ่าย 5000 คงเหลือ 80000; รายงานปีงบไม่ดึงปีการศึกษามาแทน; reversal เก็บต้นฉบับครบ | PLANNED / NOT RUN |
| TC-S06-02-A | UC-S06-02 | direct app API denied | POST /api/budget/disbursements โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-S06-02-R | UC-S06-02 | direct native API/RLS | disbursement, obligation, budget_event, period_close, fiscal_year, file_version หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-S07-01-H | UC-S07-01 | happy path | เจ้าหน้าที่พัสดุ ผู้ตรวจรับ ผู้อนุมัติเรื่อง และผู้ดูแลงบตาม grant พร้อม grantและข้อมูลสมมติถูกต้อง | รับบางส่วนเพิ่ม stock เท่ารับจริง; รับของไม่โพสต์จ่ายเงิน; เบิกพร้อมกันไม่ทำให้คงเหลือติดลบ; retry ไม่ตัดซ้ำ; โอนสองคลังสำเร็จร่วมกัน | PLANNED / NOT RUN |
| TC-S07-01-A | UC-S07-01 | direct app API denied | POST /api/inventory/stock-movements โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-S07-01-R | UC-S07-01 | direct native API/RLS | item, warehouse, procurement_request, order, goods_receipt, stock_movement, audit_logs หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-S07-02-H | UC-S07-02 | happy path | เจ้าหน้าที่ครุภัณฑ์ ผู้ถือครองที่ดูตนได้ ผู้ตรวจนับ และผู้อนุมัติปรับ/จำหน่าย พร้อม grantและข้อมูลสมมติถูกต้อง | โอนแล้วตรวจผู้ถือครองเก่าได้; scan QR ไม่เปิดข้อมูลลับต่อผู้ไม่มีสิทธิ์; adjustment ยังไม่เปลี่ยน ledger จนรับรอง; จำหน่ายไม่ hard delete | PLANNED / NOT RUN |
| TC-S07-02-A | UC-S07-02 | direct app API denied | POST /api/inventory/assets/{asset_id}/events โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-S07-02-R | UC-S07-02 | direct native API/RLS | asset, asset_assignment, loan, maintenance, stocktake, disposal, person, audit_logs หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-S08-01-H | UC-S08-01 | happy path | เจ้าหน้าที่สารบรรณ ผู้ตรวจและผู้ลงนาม/อนุมัติที่มีสิทธิ์เฉพาะ พร้อม grantและข้อมูลสมมติถูกต้อง | ส่งหนังสือหนึ่งฉบับให้หลายคนได้จาก file_version เดียว; เลขพร้อมกันไม่ซ้ำ; content แก้หลังรับรองส่งรุ่นใหม่ก่อนใช้; ผู้ดูแลเทคนิคเปิดหนังสือลับไม่ได้โดย role เดียว | PLANNED / NOT RUN |
| TC-S08-01-A | UC-S08-01 | direct app API denied | POST /api/office/records/{record_id}/send โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-S08-01-R | UC-S08-01 | direct native API/RLS | correspondence, record_version, register_counter, routing, recipient_snapshot, file_version หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-S08-02-H | UC-S08-02 | happy path | ผู้รับหนังสือ ผู้ได้รับมอบหมาย และผู้มี download grant+ACL พร้อม grantและข้อมูลสมมติถูกต้อง | เปิด notification ไม่สร้าง receipt; รับทราบกดซ้ำไม่ซ้ำ; ผู้ดูได้แต่ไม่มี P07 โหลด/print ไม่ได้; full text และ URL native Storage ไม่คืนหนังสือให้ผู้ไม่มี ACL | PLANNED / NOT RUN |
| TC-S08-02-A | UC-S08-02 | direct app API denied | POST /api/office/records/{record_id}/acknowledge โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-S08-02-R | UC-S08-02 | direct native API/RLS | receipt, assignment, correspondence, file_version, document_acl, audit_logs หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-S09-01-H | UC-S09-01 | happy path | เจ้าหน้าที่นำเข้าของหน่วยที่มอบหมายและผู้ตรวจข้อมูล พร้อม grantและข้อมูลสมมติถูกต้อง | ไฟล์ผิด 1 แถวแสดง error พร้อมเลขแถว/ฟิลด์; ศูนย์นำหน้า/วรรณยุกต์ไทยไม่หาย; dry run ไม่เพิ่ม application; scan ยังไม่ผ่าน commit ไม่ได้; ไม่มี logเนื้อหาไฟล์ทั้งชุด | PLANNED / NOT RUN |
| TC-S09-01-A | UC-S09-01 | direct app API denied | POST /api/exams/imports/dry-run โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-S09-01-R | UC-S09-01 | direct native API/RLS | form_template_registry, import_batch, import_row, validation_issue, file_version หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-S09-02-H | UC-S09-02 | happy path | เจ้าหน้าที่นำเข้าที่มีสิทธิ์ของ batch; ผู้ตรวจ/ผู้อนุมัติใบสมัครแยกกันตามระบบ 5 พร้อม grantและข้อมูลสมมติถูกต้อง | 100 แถวสมมติที่รับได้ commit สำเร็จได้ 100 receipt references; failure ระหว่างชุดไม่เกิดใบสมัครค้างบางส่วน; retryมีapplicationเดิม; มีseatแล้วไม่ลบปลายทางเมื่อขอแก้ชุด | PLANNED / NOT RUN |
| TC-S09-02-A | UC-S09-02 | direct app API denied | POST /api/exams/imports/{batch_id}/commit โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-S09-02-R | UC-S09-02 | direct native API/RLS | import_batch, import_row, commit_receipt, amendment_link, application, application_snapshot, audit_logs หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-C01-H | UC-C01 | happy path | ผู้ใช้เข้าสู่ระบบ; ผู้ดูแลเทคนิคที่รับ P08; ผู้มีอำนาจมอบบทบาทธุรกิจตาม Q006 พร้อม grantและข้อมูลสมมติถูกต้อง | บัญชีเดียวเข้าได้เฉพาะเมนูที่มีสิทธิ์; tech admin ปิดบัญชีตามอำนาจได้แต่ approveงบ/resultหรือมอบ grantนั้นให้ตนไม่ได้; direct API admin ของผู้ใช้ทั่วไปถูกปฏิเสธ | PLANNED / NOT RUN |
| TC-C01-A | UC-C01 | direct app API denied | POST /api/admin/accounts/{account_id}/changes โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-C01-R | UC-C01 | direct native API/RLS | user_account, role, scope, role_assignment, person, audit_logs หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-C02-H | UC-C02 | happy path | ผู้เยี่ยมชมทั่วไป; ผู้จัดทำ/ผู้รับรองเนื้อหากลางที่มี grant พร้อม grantและข้อมูลสมมติถูกต้อง | เมนู 7/9 และ3กลุ่มตาม BLUEPRINT; contact/download/news/login/notificationsมีต้นทางเดียว; ผู้เยี่ยมชม APIตรงไม่เห็นข่าวร่างหรือ private file และ publishไม่ได้ | PLANNED / NOT RUN |
| TC-C02-A | UC-C02 | direct app API denied | POST /api/site-content/{content_id}/publish โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-C02-R | UC-C02 | direct native API/RLS | site_content, news_post, download_entry, document, file_version, audit_logs หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-C03-H | UC-C03 | happy path | ผู้ดูแลสำรองที่รับ grantเฉพาะและเจ้าของงานตรวจยอด พร้อม grantและข้อมูลสมมติถูกต้อง | กู้ข้อมูลสมมติได้ครบตาม manifest: คน/ใบสมัคร/ผล/ledger/stock/file_versions และhashของไฟล์; negative RLSยังปฏิเสธข้ามสาย; วัดเวลาจริงเทียบเป้าหมายที่ Q012รับรอง | PLANNED / NOT RUN |
| TC-C03-A | UC-C03 | direct app API denied | POST /api/admin/restore-drills โดยไม่ผ่านUI/ไม่มีgrantหรือscope | appAPIไม่คืนprivate/no mutation; 403 action denied หรือ404 hidden object; public projectionยังอ่านได้เฉพาะที่อนุญาต | PLANNED / NOT RUN |
| TC-C03-R | UC-C03 | direct native API/RLS | backup_run, restore_run, document, file_version, audit_logs (ชื่อเสนอ) หรือnative Storage/RPC ด้วย restricted JWT | no private rows/no bytes/no unauthorized INSERT/UPDATE/DELETE/RPC; ไม่ทดสอบด้วยservicecredentialของผู้ดูแล | PLANNED / NOT RUN |
| TC-C-AUTH | all private UCs | invalid/expired session | เรียกprivateendpointทุกระบบไม่มีJWT/expiredJWT | 401และไม่มีprivatepayload/mutation | PLANNED / NOT RUN |
| TC-C-SELF | UC-S01-02, UC-S04-02, UC-S05-02, UC-S06-01 | maker-checker | creatorและapproverเป็นคนเดียว | 403/ไม่มีstate/ledger/releaseเปลี่ยน | PLANNED / NOT RUN |
| TC-C-ADMIN | UC-C01, UC-S06-01, UC-S05-02 | admin business boundary | P08เท่านั้นเรียกapproveงบ/ผล/publish | ไม่มีP05/P06จึง403 ไม่มีmutation | PLANNED / NOT RUN |
| TC-C-ESCALATE | UC-C01 | grant escalation | restrictedJWT/adminพยายามมอบbusinessgrantให้ตนผ่านAPI/RPC | grantไม่เพิ่มและscope/authorityไม่เปลี่ยน | PLANNED / NOT RUN |
| TC-C-DOWNLOAD | UC-S08-02 | separate download | มีreadไม่มีP07เรียกprivateprint/download | no bytes/403; nativeStorageยังปฏิเสธ | PLANNED / NOT RUN |
| TC-C-PUBLISH | UC-S05-02 | approve versus publish | มีP05ไม่มีP06เรียกpublishrelease | ไม่มีreleaseใหม่หรือcachepublicจากdraft | PLANNED / NOT RUN |
| TC-C-CACHE | UC-S01-01, UC-S08-02 | cache partition | userBใช้URL/cachequeryของA | ไม่มีpayload/count/filelinkprivateของA | PLANNED / NOT RUN |
| TC-C-AUDIT | all mutating UCs | audit integrity | ทำauditwriteล้มเหลวหรือพยายามแก้log | businessmutationrollback; auditเดิมไม่ถูกแก้/ลบ | PLANNED / NOT RUN |
| TC-N01-01 | UC-S04-02, UC-S05-01 | Thai midnight and BE | สองUTCinstantรอบเที่ยงคืนไทยและdate-onlyภายใต้clientTZต่างกัน | แสดง31ธ.ค.2569→1ม.ค.2570ตรงกัน; date-onlyไม่เลื่อน; calendarกำกวมerror | PLANNED / NOT RUN |
| TC-N02-01 | UC-S05-03, UC-S06-02 | separate years | academic_yearกับfiscal_yearต่างกันและlabelสมมติ | ค้นผลกรองacademicyear รายงานงบกรองfiscalyear ไม่inferกัน | PLANNED / NOT RUN |
| TC-N03-01 | UC-S03-01, UC-C01, UC-C02 | keyboard/screenreader | full flowที่กำหนดในQ018 | no trap/visible unobscuredfocus/labels/statusอ่านได้ | PLANNED / NOT RUN |
| TC-N03-02 | UC-C01, UC-C02 | contrast | สีข้อความและcontrolที่ใช้งานจริงทุกstate | >=4.5:1ข้อความทั่วไป >=3:1ข้อความใหญ่/ส่วนจำเป็นตามเกณฑ์และข้อยกเว้น | PLANNED / NOT RUN |
| TC-N03-03 | UC-C02, UC-S09-01 | zoom/reflow/target | 200%text 320CSSpxreflow และขนาดเป้าหมาย | ข้อมูล/ฟังก์ชันไม่หาย; target24×24หรือข้อยกเว้นที่บันทึก | PLANNED / NOT RUN |
| TC-N03-04 | UC-C01, UC-S03-01 | accessible auth/forms/content | passwordmanager/paste label/error และสื่อที่ใช้ | authมีทางเลือกตามเกณฑ์ ข้อผิดพลาดและสื่อมีalternativeที่เหมาะสม | PLANNED / NOT RUN |
| TC-N04-01 | UC-C03 | restore completeness | DB+Storage manifest/hash configและrestoretargetแยก | counts/ledger/stock/release/hash/ACLตรง; no outbound replay; RPO/RTOวัดจริง | PLANNED / NOT RUN |
| TC-N05-01 | UC-S09-02, UC-C01 | grant freshness/new scope | withdrawgrantระหว่างdryrun→commit/job; tamperneworganization | no mutation/job; old/newscopeถูกตรวจ app/nativeAPI | PLANNED / NOT RUN |
| TC-N06-01 | all UCs | HTTP and recovery | missingJWT/actiondenied/hiddenobject/staleversion/badinput/responseสูญหาย | app401/403/404/409/422ชัด; nativeดูno rows/no write; retryreceiptเดิม | PLANNED / NOT RUN |

| TC-C-MIGRATION | UC-C01, UC-C03 | migration evidence | clean schema จาก migrations และ catalog RLS/constraints/triggers | replay ได้ครบ ทุกตารางโครงการเปิด RLS ไม่มี Dashboard-only schema changes | PLANNED / NOT RUN |
| TC-C-REUSE | UC-C02, UC-S04-01, UC-S08-01 | shared components | inventory ของฟอร์ม ตารางแสดงข้อมูล และ approval service ที่ modules ใช้ | มีชิ้นส่วนกลางชุดเดียว กฎเฉพาะเป็น configuration ไม่คัด engine อนุมัติใหม่ | PLANNED / NOT RUN |
| TC-C-VERSIONS | UC-C01, UC-S09-01, UC-S08-02 | stack versions | package lockfile และ build/deployment config ในบทตั้งโครงการ | เวอร์ชันตรง stack ที่กำหนดและเลือกจากหลักฐาน official docs ไม่อ้างติดตั้งในบท02 | PLANNED / NOT RUN |
| TC-C-CHAPTER | UC-C01, UC-C02 | chapter handover | พรอมป์ต์แผนที่อนุมัติ diff progress decisions questions และ commit | ทำเฉพาะบทที่สั่ง เกณฑ์บทนั้นผ่านด้วยหลักฐานจริง commit ตามรูปแบบและไม่มี secret | PLANNED / NOT RUN |
| TC-C-RULES | UC-S05-01, UC-S05-02, UC-S09-01 | unverified rules gate | config ทดลองและ Q ที่ยังไม่ปิด | ทดลองข้อมูลสมมติได้ แต่ไม่ออกแบบ/ผลทางการส่วนที่กฎยังไม่ยืนยัน ไม่มีการเดากฎใน configจริง | PLANNED / NOT RUN |
| TC-C-RELEASE | UC-C03, UC-S05-02 | production gate | owner/กฎที่เกี่ยวข้อง UAT restore supportและ rollout approval evidence | ครบ gate ของส่วนที่จะปล่อยก่อนใช้ข้อมูลจริง; ขาดข้อใดต้องคงทดลองเฉพาะส่วน ไม่เดาวันขยายประเทศ | PLANNED / NOT RUN |
| TC-C-LANGUAGE | UC-S05-03, UC-S06-02, UC-S08-02 | Thai UI/schema naming | ข้อความหน้าเว็บทุก state print และชื่อ tables/columns | UI เป็นไทย วันที่ พ.ศ. และชื่อตาราง/คอลัมน์อังกฤษ snake_case รวมข้อความผิดพลาด | PLANNED / NOT RUN |

## 4 วิธีเก็บหลักฐานในบทที่มีimplementation

ต่อtestต้องมีtest_id/REQ/commit/environment/toolversion/คำสั่ง/fixture actor+grant+scope/time/expected/actual/ผลPASSหรือFAIL/หลักฐานไฟล์ที่ไม่เผยsecret ผู้ทดสอบและเวลาประเทศไทย บทนี้ทุกTCเป็นPLANNED / NOT RUN ไม่มีผลAPI/RLS/UIจริง

REQ-C10ต้องมีหลักฐานschemaจากmigrationsที่replayได้ REQ-C13ต้องมีinventoryของcomponentsและshared approval engine REQ-C18ต้องมีversions/lockfileจริง REQ-C19ต้องมีแผนที่อนุมัติ/ผลตรวจ/commitตามรูปแบบ อย่าใช้testที่ไม่ได้ตรวจ requirementนั้นเป็นหลักฐานแทน

## 5 เกณฑ์ตรวจเอกสารบท02

- DOC-02-01: UCทุกระบบ01–09มี9หัวข้อครบ พร้อมH/A/Rและexpected denial; Excel/ก่อนหลังเรียน/ค้นผลรายปีเป็นUCชัด
- DOC-02-02: matrixมีREQ-S01–REQ-S09, REQ-C01–REQ-C20, REQ-N01–REQ-N06ครบ ไม่มีREQ/UC/TCที่อ้างแล้วไม่พบ
- DOC-02-03: actions P01–P08แยกตามผู้ใช้กำหนด พร้อมP09public/P10restore/P11auditreadและtechadminไม่มีapprovalงบ/ผลโดยอัตโนมัติ
- DOC-02-04: date/time/year/accessibility/backupมีเกณฑ์วัดและQที่ต้องยืนยัน ผลruntimeไม่ถูกเปลี่ยนเป็นPASSจากการตรวจเอกสาร

อ่านคู่กับ [REQUIREMENTS](REQUIREMENTS.md), [PERMISSIONS](PERMISSIONS.md), [Charter](PROJECT_CHARTER.md), [Decisions](DECISIONS.md), [Open Questions](OPEN_QUESTIONS.md) และ [Progress](PROGRESS.md)

## 6 หลักฐานส่วนกลางล่าสุด — บท12

ตรวจsource9ded24dจากclean copy วันที่3ตุลาคม2569 ผลรวมfoundation BLOCKED รายละเอียดคำสั่งและข้อจำกัดใน [FOUNDATION_ACCEPTANCE](FOUNDATION_ACCEPTANCE.md) ไม่เปลี่ยนTCธุรกิจ90กรณีเดิมเป็นPASSจากstarterหรือSQLWASM

| รหัสหลักฐานใหม่ | ขอบเขตจริง | ผล |
| --- | --- | --- |
| F12-CHECK | install/env:init/check; validate/lint/type/test17/SQLWASM12/format/secret/build | PASS starter/core supplementary เท่านั้น |
| F12-SMOKE | scripts/smoke.mjs หน้าแรก/CSS/ฟอนต์/bootstrap403/no-store/404 | PASS 27รายการ; ไม่ใช่loginหรือworkflow |
| F12-PUBLIC | probeชั่วคราวdev/build75responsechecksต่อโหมด; fetch28staticassets/ตรวจ15prerenderHTML/RSC; markerข้อมูลสมมติ/secretพบ0 | PASSเฉพาะstarter; privateDB/cacheข้ามผู้ใช้ NOT RUN |
| F12-DB | db:testloopback5546ฐานtestใหม่ | BLOCKED exit1ก่อนmigration/13nativecases |
| F12-WORKER | worker:checkกับบริการlocal | BLOCKED exit1; ไม่ใช่outboxconsumertest |
| F12-FLOW-01–08 | login→หน้างาน→คำขอ→ไฟล์→ตรวจ→แจ้งเตือน→audit→revoke/cache | BLOCKED / NOT RUN ทุกขั้น; แผนในFOUNDATION_ACCEPTANCEข้อ7 |

ตารางต่อไปนี้เป็นสถานะimplementationล่าสุดที่ทับเฉพาะคอลัมน์บท/หลักฐานในbaselineเดิม ไม่เปลี่ยนขอบเขตREQ/UC/TCเดิม PASSที่ระบุไม่หมายถึงREQครบ:

| REQ | บท/ไฟล์ที่มีจริงหรือเกี่ยวข้อง | หลักฐานและช่องว่างปัจจุบัน |
| --- | --- | --- |
| REQ-S01–REQ-S09 | src/modules9โฟลเดอร์ README; แบบข้อมูล04/core06รองรับเพียงบางส่วน | businessservices/positiveflowsทุกระบบยังไม่สร้าง; TCธุรกิจ NOT RUN |
| REQ-C01 | core06Person/Organization; account07/08ยังไม่มี | F12-CHECKบางส่วน; บัญชีเดียวและapplicationร่วมยัง NOT RUN |
| REQ-C02 | starter05src/app/page.tsx; public09ยังไม่สร้าง | F12-SMOKEหน้าแรกผ่าน; /news/downloads/contactยัง404 |
| REQ-C03 | bootstrap05; app shell09ยังไม่สร้าง | F12-SMOKEปิด/appจริง แต่ไม่มี9เมนูตามสิทธิ์ |
| REQ-C04 | Documentmetadata06; CMS/contact09และไฟล์10ยังไม่มี | ยังไม่มีบริการกลางครบ; fullflow NOT RUN |
| REQ-C05 | bootstrap05denyทั้งหมด; authz07ยังไม่สร้าง | F12-PUBLICdenyผ่าน ไม่พิสูจน์scopeA/Bของผู้ใช้ที่login |
| REQ-C06 | migration06ENABLE/FORCERLS19ตาราง ไม่มีallowpolicy | F12-CHECKSQLWASMผ่าน; F12-DB BLOCKED; runtimepolicy NOT RUN |
| REQ-C07 | แบบworkflow11; authz07ยังไม่มี | maker checker/conflict NOT RUN |
| REQ-C08 | starterไม่มีDBquery/publicDTOธุรกิจ | F12-PUBLICmarkerprobeผ่านจำกัดstarter; privateDB/cross-usercache NOT RUN |
| REQ-C09 | ThaiHTML05, snake_case06, dateshelper06 | F12-SMOKE/unitผ่านบางส่วน; UIธุรกิจยังไม่มี |
| REQ-C10 | schema/migration06 | checksumตรง/SQLWASMผ่าน; nativePrismadeploy BLOCKED F12-DB |
| REQ-C11 | AuditLog/audittrigger06; auditservice11ยังไม่มี | SQLWASMappend-only/rollbackผ่าน; บัญชีactor/หน้าดูaudit NOT RUN |
| REQ-C12 | core06history/softdelete | SQLWASMผ่านบางส่วน; businesshistoryและcorrections NOT RUN |
| REQ-C13 | Button/layout05; workflow11มีแบบเท่านั้น | ไม่มีform/table/approvalengineที่ร่วมใช้ได้ครบ |
| REQ-C14 | OPEN_QUESTIONS/DECISIONSทุกบท | TO VERIFYคงอยู่; ไม่มีหลักฐานรับรองกฎจริง |
| REQ-C15 | Documentmetadata06; documents10ยังไม่มี | scan/download/preview/HTMLprint NOT RUN |
| REQ-C16 | deterministicseed06; workflow11แบบtransaction | WASMfixture-replayผ่าน; Prisma/concurrency/businessretry NOT RUN |
| REQ-C17 | academic/fiscalyear06; workflow11แบบapproved/effective | unit/helper/schemaบางส่วน; ผลทางการ/ธุรกิจแยกสถานะ NOT RUN |
| REQ-C18 | package/lockfile/ADR001ตั้ง05–06 | F12-CHECKรุ่นเครื่องมือตรง; services/storage/auth/productionยังไม่ตรวจรับ |
| REQ-C19 | MASTER/PROGRESSและcommitตามบท | เอกสาร/ผลตรวจมีจริง; prerequisiteไม่ผ่านจึงไม่เลื่อนระบบเฉพาะ |
| REQ-C20 | แบบCharterและtraceability | UAT/restore/production/stagedrollout NOT RUN; foundation BLOCKED |
| REQ-N01 | src/shared/dates/bangkok.ts/tests/dates.test.ts06 | unitใกล้เที่ยงคืนไทยผ่าน; ปฏิทินทางการQ017ยังเปิด |
| REQ-N02 | AcademicYear/FiscalYear06 | schema/SQLWASMแยกปีผ่าน; รายงานธุรกิจ NOT RUN |
| REQ-N03 | wireframe03/skiplink05; design09ยังไม่สร้าง | browser375/768/1024/1440/keyboard/focus NOT RUN BROWSER-03 |
| REQ-N04 | ข้อกำหนดbackup/restore | NOT RUN ไม่มีบริการ/ไฟล์จริงที่พร้อม; Q012/Q016ยังเปิด |
| REQ-N05 | authz07/account08/files10/worker11ยังไม่มี | revocation/old-newscope/API/job NOT RUN |
| REQ-N06 | bootstrap05/localguard06 | F12-SMOKE403/no-storeผ่าน; positiveAPI/jobs/recoveryธุรกิจ NOT RUN |

ไม่ใช้tests/structureที่ยืนยันREADME-only9โฟลเดอร์เป็นหลักฐานว่า9โมดูลเสร็จ ไม่ใช้db:test:sqlเป็นหลักฐานseedPrismaหรืออนุมัติแข่ง และไม่ใช้worker:checkเป็นหลักฐานoutboxที่ส่งnotificationสำเร็จ

## 7 แบบเตรียมทะเบียนบุคคลบท13

REQ-S01/UC-S01-01–02และREQ-C01/C05/C07/C08/C11/C12/C14/C16เกี่ยวข้องกับPERSON_FIELDS/JSP_MAPPINGรุ่น0.1 ซึ่งเป็นProposal/TO VERIFY ไม่ใช่schemaหรือAPIimplementation core06ใช้Personเดิม ไม่มีPersonรายสังกัดหรือloginใหม่ prerequisite12ยังBLOCKED

| กรณีเตรียม | เชื่อมข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P13-01 | REQ-S01/C01 | คนเดียวหลายสังกัด/หน้าที่แต่Personเดียว | NOT RUN |
| P13-02 | REQ-S01/C12 | ค้นชื่อเดิมพบperson_idเดิมตามhistorygrant | NOT RUN |
| P13-03 | REQ-C05/C08 | directory-only API/search/export/printไม่ส่งprivate/historyที่ไม่มีสิทธิ์ | NOT RUN |
| P13-04–05 | REQ-S01/C16 | manualduplicate review/verifiedreference/unique/idempotencyไม่รวมคนอัตโนมัติ | NOT RUN |
| P13-06–07 | REQ-C05/C07/C11 | cross-scope/revoke/conflict/makerchecker/evidence/audit | NOT RUN |

รายละเอียดinput/expectedอยู่ [PERSON_FIELDS](PERSON_FIELDS.md#7-แผนตรวจรับ--ทุกกรณี-not-run) ส่วนรหัส/ประเภททางการรอQ001ใน [JSP_MAPPING](JSP_MAPPING.md) ไม่เปลี่ยนTC-S01-01-H/A/RหรือTC-S01-02-H/A/Rเป็นPASSจากผลตรวจเอกสาร

## 8 แบบเตรียมตำแหน่งและประวัติบท14

REQ-S01/UC-S01-01–02และREQ-C01/C05/C07/C11/C12/C14/C15/C16/N01เกี่ยวข้องกับ [POSITION_RULES](POSITION_RULES.md) รุ่น0.1 ซึ่งยังเป็นProposal/BLOCKED prerequisite13ไม่ผ่าน ไม่มีPositionAssignment/service/page/seed14 runtime ขอบเขตหน้าที่4ระดับ×3ชนิดและ4แผนกมาจากผู้ใช้ แต่capacity/authority/officialcodesยังTO VERIFY

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P14-01 | REQ-S01/C01/C16 | seed12combination/4แผนกและretryไม่เพิ่มPerson/revision/audit/outbox | NOT RUN |
| P14-02–04 | REQ-S01/C12/N01 | endedแล้วค้นอดีต/known_at/แก้ย้อนหลัง/อนาคต/appointed-actingและไฟล์เดิม | NOT RUN |
| P14-05–06 | REQ-S01/C16 | capacity/overlap/หลายหน้าที่/nativeconcurrencyตามruleที่กำหนด | NOT RUN |
| P14-07–08 | REQ-C05/C07/C11/C15 | currentgrant/authority/evidence/scanACL/makerchecker/conflict/API/page/job | NOT RUN |

ไม่ใช้corePersonNameHistorytestเป็นหลักฐานPositionAssignmenthistory และไม่ใช้12+4แถวในเอกสารแทนseedcoverage ไม่เปลี่ยนTC-S01หรือผลgatefoundationเป็นPASS

## 9 แบบเตรียมหน้าค้นหาและvisibilityบท15

REQ-S01/UC-S01-01–02และREQ-C01/C05/C08/C11/C15/C16/N03/N05เกี่ยวข้องกับ [PERSON_VISIBILITY](PERSON_VISIBILITY.md) รุ่น0.1 ยังเป็นProposal/BLOCKED ไม่มีpages/search/self/binding/DTO/exportimplementation prerequisite14ไม่ผ่าน

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P15-01–04 | REQ-S01/C05/C08 | tamperedPersonID/fields/include/URL/export/publichiddennames/cross-scope/cursor/count/facets | NOT RUN |
| P15-05–07 | REQ-C01/C05/C16/N05 | verifiedbindingก่อนread_self/revoke/currentgrant/proposeedit/conflict/idempotency | NOT RUN |
| P15-08 | REQ-S01/N03 | keyboard/ThaiIME/multifilter/date/pagination/reset/empty/error/focus/labels | NOT RUN |
| P15-09–10 | REQ-C08/C11/C15 | exportallowlist/textencoding/privategatewayและaudit/logminimization | NOT RUN |

ไม่เปลี่ยนTC-S01-01-H/A/RหรือTC-N03/N05เป็นPASSจากเอกสาร/403denyall และไม่อ้างF12-PUBLICstarterว่าเป็นprivateDTO/cross-usercache/exportของpeopleจริง

## 10 แบบเตรียมคำขอเปลี่ยนข้อมูลบุคคลบท16

REQ-S01/UC-S01-02และREQ-C01/C05/C07/C08/C11/C12/C15/C16/C17/N01/N05เกี่ยวข้องกับ [PERSON_CHANGE_WORKFLOWS](PERSON_CHANGE_WORKFLOWS.md) รุ่น0.1 ยังเป็นProposal/BLOCKED prerequisite15/11ไม่ผ่าน ไม่มีrequest/form/activation/trackingserviceจริง

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P16-01–03 | REQ-S01/C12/C17/N01 | pendingtransferไม่เปลี่ยนทะเบียน/scope; approvedอนาคต/effective; ลาออก/ลาสิกขา/เสียชีวิตแยกtarget | NOT RUN |
| P16-04–05 | REQ-C05/C08/C15/N05 | trackingURL/body/query/fields/file/export/revokeไม่เผยreason/type/metadataให้ผู้ไม่มีgrant | NOT RUN |
| P16-06–08 | REQ-C05/C07/C11/C16 | returnedrevision/resubmit/makerchecker/conflict/evidence/authority/currentgrants | NOT RUN |
| P16-09–10 | REQ-C11/C12/C16 | workerretry/receipt/history/audit/outboxไม่ซ้ำและค้นอดีต/known_at/fileเดิม | NOT RUN |
| P16-11 | REQ-S01/C08/N03 | ฟอร์มcurrentvsrequest/keyboard/completeness/scanstatesและlogminimization | NOT RUN |

ไม่เปลี่ยนTC-S01-02-H/A/Rเป็นPASSจากแบบคำขอหรือbootstrap403 และไม่ใช้Person.current_stateplaceholderในcore06รับรองworkflow/domaininvariantsของ16


## 11 แบบเตรียมเชื่อมสถานะและแก้ข้อมูลผิดบท17

REQ-S01/UC-S01-02และREQ-C01/C05/C07/C08/C11/C12/C15/C16/C17/N01/N05เกี่ยวข้องกับ [PERSON_CHANGE_RECOVERY](PERSON_CHANGE_RECOVERY.md) รุ่น0.1 Proposal/BLOCKED prerequisite16ไม่ผ่าน ไม่มีeventhandlers/grantsync/accountlifecycle/correction/impactreportserviceจริง

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P17-01–03 | REQ-C11/C12/C16 | event/businesskeyซ้ำ concurrency crash/lease/out-of-order หลังcorrection | NOT RUN |
| P17-04–06 | REQ-S01/C01/C05/C17/N05 | ย้ายหลายสังกัด/explicitgrant ลาสิกขาคงสิทธิ์คฤหัสถ์ deathDALdenyและproviderpending | NOT RUN |
| P17-07–09 | REQ-C05/C07/C11/C12/C16 | approvedcorrectionคืนgrantเฉพาะรายการ makerchecker/versions/evidence origin/known_at/immutableaudit | NOT RUN |
| P17-10–11 | REQ-C08/C15/C17/N01 | UNKNOWNadapter/requiredgap/impactreportfieldpolicy และวันมีผลAsiaBangkok | NOT RUN |

ไม่เปลี่ยนTC-S01-02-H/A/Rเป็นPASSจากแบบintegration ไม่ใช้corehistory/WASM/denyallstarterแทนeventdedupe/grantrestoration/runtimeaudit และไม่อ้างโมดูลผู้รับเอกสาร/รายการค้างที่ยังไม่สร้างว่ารายงานครบ9ระบบ


## 12 ตรวจรับระบบบุคคลบท18 — BLOCKED

REQ-S01/UC-S01-01–02และREQ-C01/C05/C07/C08/C11/C12/C15/C16/C17/N01/N03/N05ตรวจตาม [UAT_SYSTEM_01](UAT_SYSTEM_01.md) / [ACCEPTANCE_CASES](../tests/system01/ACCEPTANCE_CASES.md) รุ่น0.1 prerequisites13–17ยังไม่ผ่าน CSV14Personrefs/16coveragecasesเป็นข้อมูลเตรียมไม่seed ไม่มีexecutableระบบ1test

| กรณี | ข้อกำหนด | แผนตรวจ/หลักฐาน | ผล |
| --- | --- | --- | --- |
| UAT18-T01/C01–C16/T24 | REQ-S01 | 12คู่ระดับ×หน้าที่ +4แผนก +ประเภทเพิ่มเติมเมื่อรับรอง; JSP_TO_VERIFY | NOT RUN / officialmappingTO VERIFY |
| UAT18-T02–T06/T12 | REQ-S01/C12/C17/N01 | ไทย/ชื่อเดิม/ฉายา/effective_date/known_at/อนาคต/หลายหน้าที่/capacity | NOT RUN |
| UAT18-T07–T14 | REQ-S01/C05/C07/C11/C16/C17 | 4requestflows/returned/approve/effective/rejected/cancelled/correction/retry | NOT RUN |
| UAT18-T15–T21 | REQ-C01/C05/C08/C15/N05 | tamperedID/fieldcanary/export/verifiedbinding/sessionrevoke/scan/ACL/impactadapter | NOT RUN |
| UAT18-T22–T23 | REQ-S01/C08/C11/C12/N03 | keyboard4viewportและmanifestorigin/filehash/historyก่อน/หลัง | NOT RUN |

รอบ18 `corepack pnpm test` ผ่าน17/17เป็นrootstarter/corehelperรวมdatehelpersเท่านั้น ไม่รันUAT18cases ไม่เปลี่ยนTC-S01-01/02-H/A/RหรือTC-N03/N05เป็นPASSจากunit/CSV/spec คู่มือ [MANUAL_PEOPLE](MANUAL_PEOPLE.md) เป็นฉบับเตรียม ไม่อ้างมีscreens/runtime/signoff


## 13 แบบเตรียมทะเบียนหน่วยงานบท19 — BLOCKED

REQ-S02/UC-S02-01และREQ-C01/C05/C06/C07/C08/C11/C12/C16/C17/N01/N03/N05เกี่ยวข้องกับ [ORGANIZATION_TYPES](ORGANIZATION_TYPES.md) รุ่น0.1 prerequisite18ยังไม่ผ่าน coreOrganizationมีจริงแต่ไม่มีRelation/RelationType/services/หน้าลำดับสังกัดหรือmigration19

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P19-01/05/08 | REQ-S02/C01/C17 | 5ประเภท/codes/sharedregistry/addresspurpose/แยกสาย-Geography | NOT RUN / กฎทางการTO VERIFY |
| P19-02/04/07 | REQ-S02/C12/C17/N01 | reparent/effective_date/known_at/อดีตอนาคต/typehistory/temporalintersection | NOT RUN |
| P19-03/06 | REQ-S02/C06/C16 | self/direct/descendantcycle/parallelwrites/cardinality/DBwritepath | NOT RUN |
| P19-09–11 | REQ-C05/C07/C08/C11/C16/N05 | tamperIDs/fields/job/authority/evidence/idempotency/cachegraphversion | NOT RUN |
| P19-12 | REQ-S02/N03 | hierarchy/listUIเลือกสายวัน keyboard4viewport/privateHTML | NOT RUN |

ไม่เปลี่ยนTC-S02-01-H/A/Rเป็นPASSจากcoremergedInto/Geographycycle/denyall403หรือเอกสาร ไม่อ้างOrgtypeDEMOrefsเป็นmasterที่seedจริง และไม่เริ่มทดสอบcenter/sessionของUC-S02-02ก่อนพรอมป์ต์ที่เกี่ยวข้อง


## 14 แบบเตรียมที่ตั้งและติดต่อบท20 — BLOCKED

REQ-S02/UC-S02-01และREQ-C01/C05/C06/C07/C08/C11/C12/C15/C16/C17/N01/N03/N05เกี่ยวข้องกับ [ADDRESS_VALIDATION](ADDRESS_VALIDATION.md) รุ่น0.1 prerequisite19ยังไม่ผ่าน coreAddressVersion/OrganizationContactมีจริงแต่ไม่มีLocation/search/contact/addressservices/publicmap/issuedsnapshotruntime

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P20-01–03/05 | REQ-S02/C01/C17 | postal/Geohierarchy/CRS/source/multicontacts/ชื่อเดิมรหัสพื้นที่และpurpose | NOT RUN / กฎแหล่งข้อมูลTO VERIFY |
| P20-04/06/13/14 | REQ-C05/C06/C08/C15/N05 | publicprivatecanary/mapGeoJSON/viewport/provider/ACL/fields/job/revoke/withdraw/logs | NOT RUN |
| P20-07/11 | REQ-C07/C11/C16 | centralreview/makerchecker/evidence/versions/receipt/concurrentretry/correction | NOT RUN |
| P20-08–10 | REQ-S02/C12/C17/N01 | issuedoldaddress/source/known_at/history/วันไทย/sharedhost/snapshot | NOT RUN |
| P20-12 | REQ-S02/N03 | ไม่มีพิกัด/maptimeout/JSdisabled/textfallback/keyboard4viewport | NOT RUN |

ไม่เปลี่ยนTC-S02-01-H/A/RหรือTC-N03/N05เป็นPASSจากแบบ20/coreAddresshistory/datehelper/403starter และไม่เพิ่มcoordinatesลงorganization_publicallowlistเดิมโดยไม่มีpublicationpolicyที่รับรอง


## 15 แบบเตรียมสนามและรอบสอบบท21 — BLOCKED

REQ-S02/UC-S02-02และREQ-S05/S09/C01/C05/C06/C07/C08/C11/C12/C16/C17/N01/N03/N05เกี่ยวข้องกับ [EXAM_SESSIONS](EXAM_SESSIONS.md) รุ่น0.1 prerequisite20ยังไม่ผ่าน ไม่มีExamCenter/Session/CenterSession/leveloffering/UI/statusadapter/Applicationจริง สัญญาconsumerไม่ใช่implementationโมดูล4/5/9

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P21-01–03 | REQ-S02/C01/C17 | สนามเดียว4รอบ/type-level/sessioncompositeFK/typedplaceidentity | NOT RUN / identityTO VERIFY |
| P21-04–07/13 | REQ-S02/C05/C07/C11/C17/N01/N05 | currentyearcalendar/source/ช่วงชั้น/clock/area/effectivevsrequest/versions | NOT RUN / officialcalendarTO VERIFY |
| P21-08–12 | REQ-S05/S09/C01/C16 | closed/full/quota/sharedpool/concurrentclose-lastseat/retry/applicationserviceร่วมExcel | NOT RUN |
| P21-14 | REQ-S02/C08/N03 | publicfieldprivacy/calendar/capacity/UI4viewport/TO VERIFYlabels | NOT RUN |

ไม่เปลี่ยนTC-S02-02-H/A/Rเป็นPASSจาก4แถวMarkdown/coreExamLevelunique/WASM/403starter ไม่อ้างสถานะระบบ4หรือใบสมัครระบบ5/9ที่ยังไม่ทำว่าทำงานได้ และไม่ยืนยันวันสอบทางการจากDEMOcalendar


## 16 แบบเตรียมผู้รับข้อสอบและรายงานบท22 — BLOCKED

REQ-S02/UC-S02-02และREQ-S01/C01/C05/C06/C07/C08/C11/C12/C15/C16/C17/N01/N05เกี่ยวข้องกับ [EXAM_CONTACT_VISIBILITY](EXAM_CONTACT_VISIBILITY.md) รุ่น0.1 prerequisite21ยังไม่ผ่าน ไม่มีAppointment/dispatchsnapshot/report/currentDAL/fileACLจริง ไม่เปิดเนื้อหาข้อสอบระบบ3หรือสร้างการส่งพัสดุทั้งระบบใน22

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P22-01–05 | REQ-S02/C01/C12/C17/N01 | duties/Personเดียวหลายหน้าที่/ปีรอบ/history/phonesnapshot/source/actualdispatch | NOT RUN / authoritycardinalityTO VERIFY |
| P22-06–09/14 | REQ-C05/C06/C08/C15/N05 | crossscope/fieldprivacy/report/export/print/currentACL/appointmentfileไม่ใช่ข้อสอบ | NOT RUN |
| P22-10–12 | REQ-S01/S02/C07/C11/C16 | Personพ้นหน้าที่/เสียชีวิต/correction/followupไม่autoเลือกแทน/retry/versions | NOT RUN |
| P22-13 | REQ-C11/C12/C16 | immutableconfirmreceipt/fingerprint/amendment/originหลักฐาน | NOT RUN |

ไม่เปลี่ยนTC-S02-02-H/A/Rเป็นPASSจากcorehistory/WASM/403starterหรือDEMOscenario source04ที่ยังไม่มีcontact/dispatchsnapshotไม่ปิดreportphoneimmutable และAppointmentไม่ให้permissionอ่านต้นฉบับข้อสอบหรือRoleAssignmentอัตโนมัติ


## 17 เตรียมตรวจรับระบบ2 บท23 — BLOCKED

REQ-S02/UC-S02-01/02 เชื่อม [UAT_SYSTEM_02](UAT_SYSTEM_02.md), [DATA_QUALITY_RULES](DATA_QUALITY_RULES.md), [MANUAL_ORGANIZATIONS](MANUAL_ORGANIZATIONS.md) และ [test specification](../tests/system02/ACCEPTANCE_CASES.md) รุ่น0.1 Prerequisite19–22ยังไม่ผ่าน ไม่มี executable tests/adapter/evaluator23 ผลตรวจ JSON/เอกสาร/rootunit ไม่ใช่การตรวจรับระบบ2

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| UAT23-T01–06 | REQ-S02/C01/C17/N01 | 5ประเภท staging/retry รหัส ที่อยู่ Geo temporalcycle appointmentและcontactdue; DQ23-01–10/14/15 | NOT RUN |
| UAT23-T07–09 | REQ-C07/C11/C12/C16 | diff/evidence/makerchecker/mergeimpact/versions/transactionreceipt; DQ23-02/12/13/16 | NOT RUN |
| UAT23-T10–11/16 | REQ-S02/C12/C17/N01/N03 | ค้นชื่อเดิม/รหัส/พื้นที่/chain/date pagination/history snapshot/keyboard/mapfallback | NOT RUN |
| UAT23-T12–15 | REQ-C05/C06/C08/C15/N05 | scope/field/public/private/export/currentgrant/jobs/scan/FileVersionACL; DQ23-11/13/14 | NOT RUN |
| UAT23-T17–18 | REQ-S01/S02/C11/C12/C16/N03/N05 | Personimpact/notificationretry/retention/DEMO/coverage unknownไม่เป็นclean | NOT RUN / nationalcoverageและload NOT VERIFIED |

DQ23-01–16 เป็น catalogกฎที่ยังไม่มี runtime ส่วน expected-quality-focus.json เป็น expectedfocusเขียนด้วยมือ ไม่ใช่ evaluatoroutput ไม่เปลี่ยน TC-S02-01/02-H/A/R หรือ TC-N03/N05 เป็น PASS จาก fixtureครบ5labelหรือ rootunit17 และไม่อ้างข้อมูลหน่วยงานจริงครบประเทศ


## 18 แบบเตรียมหลักสูตรบท24 — BLOCKED

REQ-S03/UC-S03-01/02 เชื่อม [CURRICULUM_SCHEMA](CURRICULUM_SCHEMA.md), [CURRICULUM_COVERAGE](CURRICULUM_COVERAGE.md), [LEARNING_CONTENT_POLICY](LEARNING_CONTENT_POLICY.md) รุ่น0.1 prerequisite23ยังไม่ผ่าน ไม่มี models/migration/UI/attempt24 ผลตรวจtable/contractไม่ใช่runtimeผ่าน

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P24-01–03 | REQ-S03/C01/C17 | 9คู่stage/level/type/FK/Topiccycle/manifest/หน้าหลักสูตรทุกกลุ่ม | NOT RUN / officialmappingTO VERIFY |
| P24-04–06 | REQ-S03/C05/C06/C07/C08/C11/C15/C17/N01/N05 | ข้อเขียนmanual/source/rights/scan/makerchecker/publishwindow/workergrant/publicDTO | NOT RUN / Q007ยังเปิด |
| P24-07–08 | REQ-S03/C11/C12/C16 | sealรุ่น/attemptlesson-question-rubricpins/v2ไม่แก้v1/regrade/withdrawal/history/retry | NOT RUN |
| P24-09 | REQ-C05/C06/C08/C15/N05 | group/course/lesson/attemptIDtamper/field/privacy/export/job/currentgrant | NOT RUN |

ไม่เปลี่ยนTC-S03-01/02-H/A/Rเป็นPASSจาก9แถวMarkdown/sourceindexที่เปิดได้หรือunitเดิม ไม่อ้างdownloadเป็นreusepermission ไม่ใช้คะแนนฝึกเป็นofficialresult ไม่สร้างattemptengineล่วงหน้าหรือเลื่อนไป25


## 19 แบบเตรียมคลังข้อสอบบท25 — BLOCKED

REQ-S03/UC-S03-01/02 เชื่อม [QUESTION_BANK_CONTRACT](QUESTION_BANK_CONTRACT.md) และ [QUESTION_REVIEW](QUESTION_REVIEW.md) รุ่น0.1 prerequisite24ยังไม่ผ่าน ไม่มีmodels/CMS/attempt/networktestsจริง

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P25-01–03 | REQ-S03/C01/C17 | typedQuestion/Choice/Key/Rubric/Topic/groupvalidation/Explanation/difficulty/ข้อเขียนmanual | NOT RUN / officialconfigTO VERIFY |
| P25-04–05/09 | REQ-S03/C05/C06/C07/C11/C15/C17/N01/N05 | review makerchecker/evidence/scan/conflict/seal/rights/release-embargowindow | NOT RUN |
| P25-07–08/12 | REQ-C05/C06/C08/C15/N05 | learnernetwork/HTML/RSC/JS/cache/media/anti-oracle/server-submit/currentfieldpolicy/crossscope/directRPC/export | NOT RUN |
| P25-06/10–11 | REQ-S03/C11/C12/C16 | versionใหม่/withdrawcurrentpolicy/attemptpins/immutablehistory/receipt/outbox/lease/revoke/retry | NOT RUN |

ไม่เปลี่ยนTC-S03-01/02-H/A/Rเป็นPASSจากเอกสาร/private-schema/403starterหรือunitเดิม ไม่มี9กลุ่มquestionflow/CMSหรือwithdrawhistoryจริง ข้อOFFICIALที่ยังembargoไม่public คะแนนpracticeไม่officialresult ไม่เลื่อนไป26


## 20 แบบเตรียมpretestบท26 — BLOCKED

REQ-S03/UC-S03-01 เชื่อม [PRETEST_FLOW](PRETEST_FLOW.md) และ [PRETEST_AUTOSAVE](PRETEST_AUTOSAVE.md) รุ่น0.1 prerequisite25ยังไม่ผ่าน ไม่มีroutes/services/attempt/autosave/networktestsจริง

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P26-01–03 | REQ-S03/C01/C11/C16/C17 | 9กลุ่มBlueprintPRE/quota/canonicalpool/serverseed/algorithm/snapshot/opportunity/startretry | NOT RUN / retake-samplingconfigTO VERIFY |
| P26-04–08 | REQ-S03/C11/C12/C16 | responseCAS/receipt/offlinequeue/reload/flush/submitrace/nativeconcurrency/crashrecovery | NOT RUN / localretentionTO VERIFY |
| P26-09–11/13 | REQ-C05/C06/C08/C15/C17/N01/N05 | serverclock/lockcutoff/IDtamper/currentgrant/revoke/feedback/keyseedprivacy/network | NOT RUN |
| P26-12/14 | REQ-S03/C11/C12/C16 | exactpracticegrade/manual/Topicaggregation/planversion/withdrawpolicy/pins/history | NOT RUN |
| P26-15 | REQ-S03/N03 | keyboardlabels/status/aria-live/empty/conflict/4viewport | NOT RUN |

ไม่เปลี่ยนTC-S03-01-H/A/RหรือN03/N05เป็นPASSจากcontract/seedplan/rootunit17เดิม ไม่มีactualautosave/reload/เวลาserver/grading/learningplanหรือofficialresultเปลี่ยน ไม่เลื่อนไป27


## 21 แบบเตรียมบทเรียนหลังpretestบท27 — BLOCKED

REQ-S03/UC-S03-01 เชื่อม [LEARNING_FLOW](LEARNING_FLOW.md) รุ่น0.1 prerequisite26ยังไม่ผ่าน ไม่มีlearningpages/progressservices/POSTguardจริง

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P27-01–05 | REQ-S03/C01/C05/C06/C11/C17 | 9คู่submittedPRE/requirements/activitypolicy/phasePOSTguard/directentry/concurrency/ไม่pageviewcomplete | NOT RUN / completionrulesTO VERIFY |
| P27-06–09 | REQ-S03/C11/C12/C16 | practiceevidence/receipt/CAS/checkpoint/resume/retake/version/withdrawrequiredบท/pins | NOT RUN |
| P27-10–13 | REQ-C05/C06/C08/C15/N05 | feedback/key/publicHTML-RSC-cache/privacy/IDtamper/revoke/currentteacher/filegrant | NOT RUN |
| P27-14 | REQ-S03/N03 | keyboardlabels/status/focus/4viewport/transcript/equivalentpath/slowmedia/no-JS | NOT RUN |

ไม่เปลี่ยนTC-S03-01-H/A/RหรือN03/N05เป็นPASSจาก9คู่Markdown/starter403/unit17เดิม ไม่มีpublicprogressหรือposttestengine/officialresultที่สร้าง ไม่เลื่อนไป28


## 22 แบบเตรียมposttestและรายงานบท28 — BLOCKED

REQ-S03/UC-S03-01 และboundary REQ-S05 เชื่อม [ASSESSMENT_RULES](ASSESSMENT_RULES.md), [LEARNING_REPORTS](LEARNING_REPORTS.md) รุ่น0.1 prerequisite27ยังไม่ผ่าน ไม่มีPOST/scorer/queue/result/reportprivacyจริง

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P28-01–05 | REQ-S03/C01/C05/C06/C07/C11/C12/C16/C17 | POSTguard/pins/objectivereplay/Rubricmanual/review-certifymakerchecker/queuecrashretry | NOT RUN |
| P28-06–08/14 | REQ-S03/C11/C12/C17 | comparisonspec/pairselection/exactdelta/pp/retake/noevidence/descriptive/resultsrevisionhistory | NOT RUN / metric/equivalenceTO VERIFY |
| P28-09–12 | REQ-C05/C06/C08/C15/N05 | self/teacherassigned/currentgrant/aggregate-smallgroup/complementaryquery/export/download/cache/keyfeedback | NOT RUN / aggregateprivacyTO VERIFY |
| P28-13 | REQ-S03/S05/C01/C05/C06/C11 | practicegrade/event/RPC/importconsumerไม่writeofficialSubjectScore/ResultRelease | NOT RUN / boundaryบริการ5ยังไม่สร้าง |

ไม่เปลี่ยนTC-S03-01-H/A/RหรือTC-S05จากสูตรMarkdown/unit17เดิมหรือofficialtablesไม่อยู่ในcore ไม่มีposttest/replay/report9กลุ่ม/consumernegativeจริง ไม่เลื่อนไป29


## 23 ตรวจรับคลังข้อสอบและการเรียนบท29 — BLOCKED

REQ-S03/UC-S03-01 เชื่อม [UAT_SYSTEM_03](UAT_SYSTEM_03.md), [MANUAL_LEARNING](MANUAL_LEARNING.md), [test specifications](../tests/system03/ACCEPTANCE_CASES.md) และ [coverage plan](../tests/fixtures/system03/coverage-plan.csv) ทั้งหมดแบบเตรียม0.1 prerequisite24–28ไม่ผ่าน ไม่มีlearningE2E runtime

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| UAT29-T01–03 | REQ-S03/C01/C05/C06/C11/C17 | 9คู่flow/context/sharedbackendorder/limitedwrite/directentry | NOT RUN |
| UAT29-T04–08 | REQ-S03/C11/C12/C16/C17 | sampling/completeness/serverclock/retake/retry/offlineCAS/receipt | NOT RUN / policiesTO VERIFY |
| UAT29-T09–11/21 | REQ-S03/C07/C11/C12/C16/C17 | immutablecontent-score/rubricqueue/currentauthority/faulttransaction/history/dedup | NOT RUN |
| UAT29-T12–16/19 | REQ-C05/C06/C08/C15/N05 | keyleak/peer/clienttamper/revoke/teacherroster/aggregateprivacy/privatefiles/cache | NOT RUN |
| UAT29-T17 | REQ-S03/N03 | 9คู่keyboard/ThaiIME/focus/status/timing/transcript/4viewport | NOT RUN |
| UAT29-T18/22 | REQ-S03/C04/C07/C17 | CMSmakerchecker/rights/window/DEMOlabels/software-contentreviewแยก | NOT RUN / contentTO VERIFY |
| UAT29-T20/23 | REQ-S03/S05/C01/C05/C06/C11/C12 | officialboundary/comparison/pins/descriptive/exactscore/reporthistory | NOT RUN |

rootunit17ผ่าน4ตุลาคม2569เฉพาะstarter/corehelpers ไม่เปลี่ยนTC-S03-01-H/A/R, TC-S05, N03/N05เป็นPASSจาก9CSVrows/specification/WCAGreference/ไม่มีofficialconsumer ไม่มีevidenceflowครบหรือcontentcertificationจริง ไม่เลื่อนไป30


## 24 แบบคำขอหน่วยงานและสนามสอบบท30 — BLOCKED

REQ-S04/UC-S04-01 และ UC-S04-02 เชื่อม [ORG_CENTER_REQUESTS](ORG_CENTER_REQUESTS.md) และ [schema contract](ORG_CENTER_REQUEST_SCHEMA.md) รุ่น0.1 prerequisite29ไม่ผ่าน ไม่มีOrganizationChangeRequest/ExamCenterChangeRequest/activation runtime

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| C30-01–10/P30-01/04 | REQ-S04/S02/C01/C05/C17 | 4องค์กร+6สนาม/groupExamType/session/targettypedFK/formruleversion | NOT RUN / แบบกฎscopeTO VERIFY |
| P30-02/03/11/13 | REQ-S04/C05/C06/C07/C11/C12/C16 | rejected/cancellednoeffect/stalereplay/approved-effective/atomicreceipt/currentlimitedwrite | NOT RUN |
| P30-05–07 | REQ-S04/C01/C07/C11/C16/C17 | makerchecker/immutableversions/codeidentity/plannedtimelineconflict/nativeconcurrency | NOT RUN |
| P30-08–10/14 | REQ-C05/C06/C08/C15/C17/N05 | evidenceScanACL/impactunknown/currentworkergrant/Bangkokcutoff/privateprooftracking/export/cache | NOT RUN |
| P30-12 | REQ-S04/S02/S05/C01/C12/C17 | ROUNDvenue/type/year/history/address-dispatchsnapshot/application-roleไม่autoเปลี่ยน | NOT RUN / scopepolicyTO VERIFY |

flow8states/transition12/failure12/contract6concepts/8constraintsและ10coverageเป็นแบบเอกสาร ไม่เปลี่ยนTC-S04-01-H/A/Rหรือprivacy/historyกรณีเดิมเป็นPASS ไม่มีผลnativeFK/activation/rejectedcancellednegativeeffect ไม่เลื่อนไป31


## 25 แบบwizard draft returnedและส่งคำขอบท31 — BLOCKED

REQ-S04/UC-S04-01/02 เชื่อม [REQUEST_WIZARD](REQUEST_WIZARD.md) และ [REQUEST_SUBMISSION](REQUEST_SUBMISSION.md) รุ่น0.1 prerequisite30ไม่ผ่าน ไม่มีหน้าคำขอ/serveractions/CAS/trackingruntime

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P31-01/07 | REQ-S04/C01/C11/C17 | wizard6steps/10typefieldrequirements/formrule/effectivedate/servercompleteness | NOT RUN / แบบกฎTO VERIFY |
| P31-02–05/10 | REQ-S04/C11/C12/C16/C17 | draftintent/resume/CAS/receipt/returnednewrevision-cycle/header-instance-trackingไม่ซ้ำ | NOT RUN |
| P31-06/08/09/13/14 | REQ-C05/C06/C08/C15/N05 | targettamper/currentDAL/RLS/actions/CSRF/fileScanACL/DTO/publictracking-cache | NOT RUN |
| P31-11/12 | REQ-S04/C05/C06/C11/C13/C16 | opaqueunique trackingref/currentreadproof/outbox/currentrecipient/notifdedupe/revoke | NOT RUN |
| P31-15 | REQ-S04/N03 | labels/ThaiIME/focus/status/errors/4viewport/keyboardwizard | NOT RUN |
| P31-16 | REQ-S04/S02/S05/C01/C12/C17 | submit/requestonlynoeffect activeOrg/CenterSession/application/role/historyไม่เปลี่ยน | NOT RUN |

ไม่เปลี่ยนTC-S04-01/02-H/A/RหรือN03/N05เป็นPASSจากcontract/Wizardsteps/errorcodes/เลขCSPRNG design/Nextdocument/OWASP reference ไม่มีผลscope/CAS/returned/outbox/trackingจริง ไม่เลื่อนไป32

## 26 แบบคิวตรวจ decision และ impact บท32 — BLOCKED

REQ-S04/UC-S04-01/02 เชื่อม [REQUEST_REVIEW](REQUEST_REVIEW.md) และ [REQUEST_IMPACT_CHECKS](REQUEST_IMPACT_CHECKS.md) รุ่น0.1 prerequisite31ไม่ผ่าน ไม่มีqueue/decision/impactruntime ทุกP32เป็นแผนไม่ใช่testsที่รันแล้ว

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P32-01/12/15 | REQ-S04/C05/C06/C08/C15/N05 | queuecurrentlineage/count/export/diff/evidence4ด้าน/10types/DTOprivate | NOT RUN |
| P32-02–05 | REQ-S04/C05/C06/C07/N05 | maker/ไม่มีapprover/เทคนิค/delegationช่วงเวลา/revokeระหว่างรอlock/directAPI-worker | NOT RUN |
| P32-06/09 | REQ-S04/C07/C11/C12/C17 | returnedheadercycle/sealedrevision/สาระสำคัญ/newreview/historyolddecision | NOT RUN |
| P32-07/08/13 | REQ-S04/C07/C11/C16/C17 | nativeสองconnectionsbarrier/CAS/terminalunique/receipt/rollback/audit-outbox/dedupe | NOT RUN |
| P32-10/11/14 | REQ-S04/S02/S05/C01/C12/C17 | planrequired/adapterunknown/stale/recheckactivation/noharddelete/noauto-transfer/RoleAssignment | NOT RUN / กฎแผนTO VERIFY |
| P32-16 | REQ-S04/N03 | queuekeyboard/ThaiIME/labels/focus/errors/conflict/4viewport | NOT RUN |

เกณฑ์32-01เชื่อมP32-02–05; เกณฑ์32-02เชื่อมP32-07–09/13 ยังBLOCKED ไม่เปลี่ยนTC-S04-01/02-H/A/RหรือN03/N05เป็นPASSจากแบบterminalconstraint/SQLlockdocs/currentdbprobe/7UIstates/16caseIDs ต้องผ่าน31และลงมือจริงก่อน ไม่เลื่อนไป33


## 27 แบบactivation status historyและtrackingบท33 — BLOCKED

REQ-S04/UC-S04-01/02 ต่อ [REQUEST_EFFECTIVE_RULES](REQUEST_EFFECTIVE_RULES.md)0.1 prerequisite32ยังไม่ผ่าน ไม่มีactivationworker/projection/history/trackingจริง ทุกP33เป็นแผนNOT RUN

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P33-01/02/07/08/13 | REQ-S04/S02/C01/C05/C06/C07/C15/C17/N01 | approvedversion/currentauthority/due-Bangkok/evidence/impact/typedcontext/noeffectก่อนguard | NOT RUN |
| P33-03–06/10 | REQ-S04/C11/C12/C16/C17 | duplicate/newkey/ACKlost/nativebarrier/kill-restart/leasefence/CAS/receipt/owneratomicprojection | NOT RUN |
| P33-09/11/12 | REQ-S04/S02/C12/C17/N01 | valid_at/known_at/futureplan/lateactivation/corrections/oldaddress/predecessor/deadletter | NOT RUN / latepolicyTO VERIFY |
| P33-14/15 | REQ-S04/S08/C05/C06/C08/C13/C15/C16/N05 | trackingowner-publicDTO/currentACL/order-fileversion/devoutbox/notificationdelay-dedupe/privatecache | NOT RUN |
| P33-16 | REQ-S04/N03 | historydatefilters/ThaiIME/labels/keyboard/focus/4viewport | NOT RUN |

เกณฑ์33-01ผูกP33-03–06/10; เกณฑ์33-02ผูกP33-02/09/11/12/15 ยังBLOCKED Helperวันไทยเดิม7assertionsPASSไม่เปลี่ยนTC-S04-01/02-H/A/Rหรือhistory/worker/retry/privacy/N03/N05เป็นPASS ต้องnativehistory/concurrency/fault/notification/browserจริง ไม่เลื่อนไป34


## 28 ตรวจรับระบบ4และกู้คืนบท34 — BLOCKED

REQ-S04/UC-S04-01/02 ต่อ [UAT_SYSTEM_04](UAT_SYSTEM_04.md), [MANUAL_REQUESTS](MANUAL_REQUESTS.md), [spec](../tests/system04/ACCEPTANCE_CASES.md), [fixtureplan](../tests/fixtures/system04/coverage-plan.json)0.1 prerequisites30–33ไม่ผ่าน ทุกUAT34เป็นแผนไม่ใช่executabletests

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| UAT34-T01–04 | REQ-S04/C01/C11/C12/C17 | 10type/3branch/draft-returned-review-approve-reject-cancel-effective/receipt/history | NOT RUN / rulesTO VERIFY |
| UAT34-T05–07 | REQ-S04/C05/C06/C07/C11/C17/N05 | maker/currentauthority/scope/delegation/revoke/CAS/terminalnativeconcurrency | NOT RUN |
| UAT34-T08–11/17 | REQ-S04/S02/S05/S01/C01/C12/C17 | applications/positions/dispatchpending/planrequired/nonemptyidentity-FK-snapshot/noharddelete-noauto-transfer | NOT RUN |
| UAT34-T12–16 | REQ-S04/C07/C11/C12/C15/C17 | newcorrection/sourceorder-reason-FK/returnedapproval/reject-cancelnoeffect/revocation/guardnewlegitimatecommands | NOT RUN / authorityTO VERIFY |
| UAT34-T18/19 | REQ-S04/C11/C12/C13/C16/C17 | duplicate/keynew/ACKlost/nativeworkers/killrestart/fence/atomicreceipt-audit-outbox/devsink | NOT RUN |
| UAT34-T20 | REQ-S04/S02/C12/C17/N01 | MOVEสองtype/valid_at-known_at/oldaddress-order/futureplan/dateไทย | NOT RUN |
| UAT34-T21 | REQ-S04/C05/C06/C08/C15/N05 | owner/publictracking/currentDTO/ACL/export/print/RSC/cache/notif/privatecanary | NOT RUN |
| UAT34-T22 | REQ-S04/N03 | keyboardThaiIME/focus/labels/errors/conflict/4viewport | NOT RUN |

เกณฑ์34-01ผูกT12–16/18–19; เกณฑ์34-02ผูกT08–11/17/20 ทั้งสองBLOCKED Rootunit17PASSรอบ34ตรวจstarter/coreเท่านั้น ไม่เปลี่ยนTC-S04-01/02-H/A/Rหรือhistory/privacy/UX/workerเป็นPASSจากspec22/10JSONrows/60ช่อง/คู่มือหรือไม่มีapplicationtables ต้องexecutionnativeและผู้รับรองจริง ไม่เลื่อนไป35

## 29 สัญญาทะเบียนผู้เรียน ผู้สมัคร และแบบบัญชีบท35 — BLOCKED

REQ-S05/UC-S05-01 และ REQ-S09/UC-S09-01 ต่อ [APPLICATION_SCHEMA](APPLICATION_SCHEMA.md), [APPLICATION_STATES](APPLICATION_STATES.md), [FORM_TEMPLATE_REGISTRY](FORM_TEMPLATE_REGISTRY.md)0.1 prerequisite34ยังไม่ผ่าน ทุกP35เป็นแผน ไม่มีPrisma models/migration/services/rendererหรือexecutabletestsเพิ่ม

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P35-01/02/05/12 | REQ-S05 | Person/Candidateเดียวหลายปีและประเภทที่กฎอนุญาต แยกEnrollment/Applicationและsnapshotชื่อสังกัดตามรุ่น ไม่ลบประวัติ | NOT RUN / rulesTO VERIFY |
| P35-03/04/11 | REQ-S05/S09 | sharedbusinesskey/server-slot/compositeFK/context/receipt/currentDAL/nativeconcurrency/atomicrollback | NOT RUN |
| P35-06/07 | REQ-S05/S09 | 6states/11transitions/currentgrant/makerchecker/CAS/workflowcycle/draftresume/returnedresubmit/history | NOT RUN |
| P35-08–10 | REQ-S05/S09 | 5formrefsTO VERIFY/officialfailclosed/ศ.3ไม่มีalias/genericDEMO/pinnedversion/currentwithdrawalpolicy | NOT RUN / officialsourceTO VERIFY |

เกณฑ์35-01ผูกP35-01–05/07/12; เกณฑ์35-02ผูกP35-08–10 ทั้งสองBLOCKED สัญญาข้อมูลและแผนทดสอบไม่พิสูจน์multi-year/unique/API/officialguardหรือDEMOlayoutที่รันได้ ต้องnative/runtime executionก่อนรับรอง ไม่เลื่อนไป36

## 30 แบบบัญชีรายชื่อ คุณสมบัติ และส่งออกบท36 — BLOCKED

REQ-S05/UC-S05-01 และ REQ-S09/UC-S09-01 ต่อ [ELIGIBILITY_RULES](ELIGIBILITY_RULES.md), [ROSTER_WORKSPACE](ROSTER_WORKSPACE.md), [APPLICATION_EXPORT](APPLICATION_EXPORT.md)0.1 prerequisites35และส่วนกลางยังไม่ผ่าน ทุกP36เป็นแผนไม่ใช่executabletests

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P36-01/02 | REQ-S05/S09 | serverBangkokwindow/clocktamper/currentcutoff/close-submitrace/atomicdeny | NOT RUN |
| P36-03–06 | REQ-S05/S09 | type-level-stage/priorofficialresult/requiredscanned-owned-reviewed evidence/identityalternative/oldname | NOT RUN / officialrulesTO VERIFY |
| P36-07/09 | REQ-S05/S09 | identitysimilarityแยกbusinessduplicate/sharedservice/CAS/draft-returned/immutableapproval/maker | NOT RUN |
| P36-08/10/13 | REQ-S05/S09 | query-ID-body/listcount/export/currentgrant/revokedrule-template-evidence/snapshotpins/worker-download | NOT RUN |
| P36-11/12 | REQ-S05/S09 | actualA4PDFThai-font-shaping/multipage/ExceltypedUnicode-leadingzero-longref/noformula/manifestเดียว | NOT RUN / officialformsTO VERIFY |
| P36-14 | REQ-S05 | keyboardThaiIME/filterpagination/labels/errorfocus/status4viewport/privatecache | NOT RUN |

เกณฑ์36-01ผูกP36-01–05/09/10; เกณฑ์36-02ผูกP36-08/10–13 ทั้งสองBLOCKED datehelper3PASSรอบ36ไม่เปลี่ยนeligibility/API/native/roster/PDFExcel/scope/UXเป็นPASS ไม่มีartifactหรือUIให้ตรวจ ต้องexecutionจริงก่อนรับรอง ไม่เลื่อนไป37

## 31 แบบอนุมัติผู้สมัครและออกที่นั่งบท37 — BLOCKED

REQ-S05/UC-S05-01 และ REQ-S09/UC-S09-01 ต่อ [SEAT_ALLOCATION](SEAT_ALLOCATION.md), [APPLICANT_REVIEW_IMPACT](APPLICANT_REVIEW_IMPACT.md), [EXAM_ADMISSION_OUTPUTS](EXAM_ADMISSION_OUTPUTS.md)0.1 prerequisites36/ส่วนกลางยังไม่ผ่าน ทุกP37เป็นแผนไม่ใช่executabletests

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P37-01/02/04 | REQ-S05/S09 | nativebarriers/capacity-sharedpools-quotas/terminaldecisionatomic/currentapproval | NOT RUN |
| P37-03/05–07 | REQ-S05/S09 | samekey-ACK-newkey/durableclaim/namespace-round/0unknowncapacity/retake/reservation-release-netdelta | NOT RUN / rulesTO VERIFY |
| P37-08–10 | REQ-S05/S02/S01 | person-centerended/future/latecorrection/impact-source-epochs/adaptersunknown/close-approve-sharedguard | NOT RUN |
| P37-11 | REQ-S05/S09 | maker/noscope/delegationexpiry/sessionrevoke/actionworkerdownload/fieldpolicy | NOT RUN |
| P37-12/15 | REQ-S05/S09 | wholetransactionfault/rollback/receipt-audit-outbox/PGretry-conflicttypes/noabsencePASS | NOT RUN |
| P37-13/14 | REQ-S05/S02 | approvedamendment/sourcedecision-oldseat/newtargetbinding/fulldestinationrollback/duerevision/usernotice | NOT RUN / authorityTO VERIFY |
| P37-16 | REQ-S05 | roster/card/snapshotallocationpins/ThaiA4/QRreference/privateHTML-RSC-cache/currentvalidity | NOT RUN / officialformsTO VERIFY |

เกณฑ์37-01ผูกP37-01–07/12/15; เกณฑ์37-02ผูกP37-08–10/13/14 ทั้งสองBLOCKED ไม่มีnativeapproval/seatunique/retry/impactreport/cardartifactsจริง ไม่technicaldocหรือabsenceoftableเป็นPASS ต้องexecutionก่อนรับรอง ไม่เลื่อนไป38

## 32 แบบนำเข้าคะแนนและรับรองผลบท38 — BLOCKED

REQ-S05/UC-S05-02 และ REQ-S09/UC-S09-01 ต่อ [GRADING_RULES](GRADING_RULES.md), [SCORE_IMPORT_REVIEW](SCORE_IMPORT_REVIEW.md), [RESULT_CERTIFICATION](RESULT_CERTIFICATION.md)0.1 prerequisites37/ส่วนกลางยังไม่ผ่าน ทุกP38เป็นแผนไม่ใช่executabletests

| กรณีเตรียม | ข้อกำหนด | แผนตรวจ | ผล |
| --- | --- | --- | --- |
| P38-01–05/12 | REQ-S05/S09 | roster-seat-subject-context/missing-extra-duplicate/range-scale/officialwritten evidence/zero-absence-pending | NOT RUN / gradingrulesTO VERIFY |
| P38-06/11 | REQ-S05/S03/S09 | learningprincipal-event-importboundary/exactdecimal/pinnedscore-rule-algorithm/recomputeไม่latest | NOT RUN |
| P38-07/14/18 | REQ-S05/S09 | currentgrant/scope/maker/sourcewithdraw-amend/typedFK/provenance/nonemptymanifests/privateHTML-cache-files | NOT RUN |
| P38-08–10 | REQ-S05/S09 | secondchecker diff/revision-CAS/parallel lock-certify/atomicfault/canonicalchecksum-members-context | NOT RUN |
| P38-13/16 | REQ-S05/S09 | approvedamendment/sourcehash-history/retry-ACK-workerrestart/receipt-outbox ไม่certifyเท่ากับpublish | NOT RUN / authorityTO VERIFY |
| P38-15/17 | REQ-S05/S09 | filequarantine/parserlimits/ThaiIME-mismatchUI/labels/errorfocus/pagination4viewport | NOT RUN |

เกณฑ์38-01ผูกP38-01–05/08/10/12; เกณฑ์38-02ผูกP38-06/11/18 ทั้งสองBLOCKED ไม่มีnativegrading/range/mismatch/learningisolation/recompute/scoreartifactsจริง ไม่documentหรือabsenceoftableเป็นPASS ต้องexecutionก่อนรับรอง ไม่เลื่อนไป39

## 33 Traceability บท39 — ผลสอบสาธารณะและการแก้ประกาศ

Proposal/BLOCKED source `cffcf98`; [RESULT_PUBLICATION_POLICY](RESULT_PUBLICATION_POLICY.md), [RESULT_SEARCH_CONTRACT](RESULT_SEARCH_CONTRACT.md), [RESULT_RELEASE_RECOVERY](RESULT_RELEASE_RECOVERY.md)0.1และ [FORM_TEMPLATE_REGISTRY](FORM_TEMPLATE_REGISTRY.md)0.2 ต่อ UC-S05-02/03, TC-S05-02-H/A/R, TC-S05-03-H/A/R, TC-C-PUBLISH ตามsource ยังไม่มีruntime/testsจริง ไม่อ้างว่าspecificationเดิมหรือdoccheckเป็นเกณฑ์ผ่าน

| Cases | REQ/UC | สิ่งที่ต้องพิสูจน์ | สถานะ |
| --- | --- | --- | --- |
| P39-01/02/03/15 | REQ-S05 / UC-S05-02/03 | certifiedpassmanifest/separatepublishapproval/servertime/no practiceboundary | NOT RUN |
| P39-04/05/10/18 | REQ-S05/C02/C08 / UC-S05-03 | withdrawal/livegate/APIHTMLRSC/cacheindex/export/childfieldprivacy | NOT RUN / policyTO VERIFY |
| P39-06/07/11/17 | REQ-S05/C05/C07/C11 / UC-S05-02/03 | makerchecker/currentgrant/delegation/privateownlink/scope/concurrentCAS/safelogs | NOT RUN |
| P39-08/09 | REQ-S05/C12/C17 / UC-S05-03 | historicalnamesnapshot/newapprovedrelease/sourceamendment/lineage | NOT RUN |
| P39-12/13 | REQ-S05/C16 / UC-S05-03 | boundedsearch/sharedbudget/proxy/outage/transaction/outboxrestartdedupe | NOT RUN / limitsTO VERIFY |
| P39-14/16 | REQ-S05/C08/C13/C15 / UC-S05-03 | ศ.4/8evidencegates/ThaiIME/keyboard/pagination4viewport | NOT RUN / formsTO VERIFY |

เกณฑ์39-01ผูกP39-01/03/04/05/10/13/18 เกณฑ์39-02ผูกP39-08/09/10 ทั้งสองBLOCKED ไม่ใช่PASS ยังไม่ผ่าน38และไม่มีnativeDB/releaseAPI/browser/cache/export/businessworkerจริง ต้องexecutionก่อนรับรอง บท40ยังไม่เริ่ม

## 34 Traceability บท40 — ตรวจรับบัญชีและผลสอบระบบ5

BLOCKED source `37a30c0`; [UAT_SYSTEM_05](UAT_SYSTEM_05.md)/[MANUAL_EXAMS](MANUAL_EXAMS.md)/[ACCEPTANCE_CASES](../tests/system05/ACCEPTANCE_CASES.md)/[coverage-plan](../tests/fixtures/system05/coverage-plan.json)0.1 PLAN ONLY 12groups/48runs/24personrefs/26casesไม่seedหรือexecute ต่อUC-S05-01/02/03และUC-S09-02สำหรับservicecontractchannelเท่านั้น ไม่ทำparser/importer09ล่วงหน้า

| Cases | REQ/UC | สิ่งที่ต้องพิสูจน์จริง | รอบ40 |
| --- | --- | --- | --- |
| P40-01–06 | REQ-S05/S09/C01/C17 / UC-S05-01 | E2E48contexts/enrollment≠exam/sharedPerson/naturalkey/eligibility/year/history/identity | NOT RUN |
| P40-07–11 | REQ-S05/C05/C07/C15/C16 / UC-S05-01 | scan/ACL/makerchecker/scope/revoke/nativecapacity/concurrency/approvedseatamendment | NOT RUN |
| P40-12–16/20 | REQ-S05/C11/C14/C16 / UC-S05-02 | mismatch/4scorelayers/pinnedrules/writtenreview/secondchecker/practiceboundary/lineage | NOT RUN |
| P40-17–19/22 | REQ-S05/C08/C12/C17 / UC-S05-02/03 | livepublicationgate/withdrawcache/annualsnapshot/approvedcorrection/privacy | NOT RUN |
| P40-21/26 | REQ-S05/C14/C15/C20 / UC-S05-01/02/03 | 7formversions/sourcepurpose/officialgates/เจ้าหน้าที่UAT/ผู้เชี่ยวชาญตรวจเกณฑ์ | NOT RUN / TO VERIFY |
| P40-23–25 | REQ-S05/C11/C13/C16/C17 / UC-S05-01/02/03 | outboxretry/dedupe/currentjobACL/Thai midnight/accessibility4viewport | NOT RUN |

เกณฑ์40-01ผูกP40-01/04/12/13/15/18/19/20/23; เกณฑ์40-02ผูกP40-05/06/08/14/16/17/21/22/26 ทั้งสองBLOCKED/NOT RUN prerequisite35–39ไม่ผ่าน ไม่มีE2E/APIธุรกิจ/nativeconcurrency/UATsignoffจริง rootunit17/type/lint/build/starterHTTP27ผ่านเป็นbaselineต่างหากไม่เป็นPASSของREQ-S05 ไม่เริ่ม41

## 35 Traceability บท41 — ปีงบ โครงสร้างและเงิน exact

Proposal/BLOCKED source `061673a`; [BUDGET_SCHEMA](BUDGET_SCHEMA.md)/[BUDGET_DATA_DICTIONARY](BUDGET_DATA_DICTIONARY.md)/[BUDGET_POLICY_CONFIG](BUDGET_POLICY_CONFIG.md)/[budget-41-demo.json](fixtures/budget-41-demo.json)0.1 ต่อREQ-S06/UC-S06-01/02เฉพาะส่วนdata structure/planning/year/money policy ไม่อ้างreservation/obligation/disbursement/ledgerbusinessflowsเสร็จจากcontract41

| Cases | REQ/UC | หลักฐานที่ต้องได้จริง | รอบ41 |
| --- | --- | --- | --- |
| P41-01–05/16/18 | REQ-S06/C09/C16 / UC-S06-01/02 | exactmoney APIstring→arith→PrismaNUMERIC→JSON/UI/export/pinnedcurrency/rounding no versiondoublecount | NOT RUN |
| P41-06–10/14/16 | REQ-S06/C01/C12/C17 / UC-S06-01/02 | sharedFY/AY/org/typedcontext/oneAYmultiFY/window/history/supersession | NOT RUN |
| P41-11–13/17 | REQ-S06/C05/C07/C08/C11/C14/C15 / UC-S06-01/02 | currentgrant/makerchecker/officialunknownpolicydeny/sourceevidenceACL/auditsafe | NOT RUN / rulesTO VERIFY |
| P41-15 | REQ-S06/C10/C16 / UC-S06-01 | migration/CAS/nativeconcurrency/overlap/idempotency/head-receipteventunique | NOT RUN |

เกณฑ์41-01ผูกP41-01–05/16/18 เกณฑ์41-02ผูกP41-06–10/14/16 ทั้งสองBLOCKEDไม่มีnativebudgetPrisma/DAL/UI/export/configloader ส่วนreference30checks/PGliteNUMERIC7checksเป็นทดลองจำกัด ไม่executionP41/ไม่เกณฑ์ผ่าน ต้อง40/ส่วนกลางพร้อมและimplementationจริง ไม่เริ่ม42

## 36 Traceability บท42 — แผน การอนุมัติและจัดสรร

Proposal/BLOCKED source `80e0331`; [BUDGET_PLANNING](BUDGET_PLANNING.md), [ALLOCATION_LEDGER](ALLOCATION_LEDGER.md), [BUDGET_APPROVALS](BUDGET_APPROVALS.md), [budget-42-plan.json](fixtures/budget-42-plan.json)0.1 ต่อREQ-S06/UC-S06-01/02เฉพาะplanning/allocation/adjustmentapproval/report ไม่อ้างว่าจอง/ผูกพัน/เบิก/จ่ายครบจากinterfacecontract

| Cases | REQ/UC | หลักฐานที่ต้องได้จริง | รอบ42 |
| --- | --- | --- | --- |
| P42-01–04/17/18 | REQ-S06/C09/C12/C13/C16/C17 / UC-S06-01/02 | plan drafts/returned revisions/estimated revenue separate/approved-effective allocation/reservationgate/report/Thai UI | NOT RUN |
| P42-05/11–13/15 | REQ-S06/C05/C07/C08/C14/C15 / UC-S06-01/02 | currentaccount/grants/delegation/twoscopes/makerchecker/unknownofficialdeny/fileACL/receiptworkerrevoke | NOT RUN / rulesTO VERIFY |
| P42-06–10/14/16 | REQ-S06/C09/C10/C11/C16 / UC-S06-01/02 | native concurrenttransfer/nooverdraw/legconservation/atomicrollback/receipt/reversal/reconciliation/nohistoryloss | NOT RUN |

เกณฑ์42-01ผูกP42-01/02/03/15 เกณฑ์42-02ผูกP42-06/07/08/09/10/11/14/16 ทั้งสองBLOCKEDไม่มีruntimebudget/nativeDB/UI/reference20checksเป็นการตรวจตัวอย่างเท่านั้น ไม่ใช้แทนacceptance ต้อง41และส่วนกลางพร้อม ไม่เริ่ม43

## 37 Traceability บท43 — จอง ผูกพัน เบิกและหลักฐานจ่าย

Proposal/BLOCKED source `cffecc4`; [BUDGET_BALANCE_FORMULA](BUDGET_BALANCE_FORMULA.md), [BUDGET_LEDGER_SERVICES](BUDGET_LEDGER_SERVICES.md), [budget-43-plan.json](fixtures/budget-43-plan.json)0.1 ต่อREQ-S06/UC-S06-02 เฉพาะspendingledger/recovery ไม่อ้างว่าservice/SQLconstraints/การโอนธนาคารจริงมีแล้ว

| Cases | REQ/UC | หลักฐานที่ต้องได้จริง | รอบ43 |
| --- | --- | --- | --- |
| P43-01–05/15/16 | REQ-S06/C09/C12/C16/C17 / UC-S06-02 | exactformula/example/per-source remaining/certification subset/partialmovement/history/privateexports | NOT RUN |
| P43-06–10/15 | REQ-S06/C06/C10/C11/C16 / UC-S06-02 | nativeoverspendbarrier/lockorder/serialization/boundedretry/receipt/paymentkey/atomicrollback/reconcile | NOT RUN |
| P43-11–14 | REQ-S06/C05/C07/C08/C12/C14/C15 / UC-S06-02 | currentscope/account/delegation/queuedrevoke/makerchecker/evidence/officialdeny/approvedreversal/ต้นทางคงเดิม | NOT RUN / rulesTO VERIFY |

เกณฑ์43-01ผูกP43-01–05/14–16 เกณฑ์43-02ผูกP43-06–10/15 ทั้งสองBLOCKED ไม่มีledger services/nativeDB reference82assertionsและสองserializedordersเป็นตรวจตัวอย่าง ไม่เป็นPASSnativeconcurrencyหรือAPIflow ต้อง42และส่วนกลางพร้อม ไม่เริ่ม44

## 38 Traceability บท44 — คำขอเบิก อำนาจ invoiceและกลับรายการ

Proposal/BLOCKED source `0905a84`; [DISBURSEMENT_WORKFLOW](DISBURSEMENT_WORKFLOW.md), [FINANCE_REVERSALS](FINANCE_REVERSALS.md), [budget-44-plan.json](fixtures/budget-44-plan.json)0.1 ต่อREQ-S06/UC-S06-02 เฉพาะdisbursementworkflow/approval/invoiceclaims/recovery ไม่อ้างว่าUI/ledger/constraints/ธนาคารมีแล้ว

| Cases | REQ/UC | หลักฐานที่ต้องได้จริง | รอบ44 |
| --- | --- | --- | --- |
| P44-01–05/09 | REQ-S06/C06/C09/C10/C11/C16 / UC-S06-02 | submit/certify/paymentretry/verifiedinvoicebusinesskey/partials/claimcapacity/nativeconcurrency/atomicrollback | NOT RUN |
| P44-06–08/10–12 | REQ-S06/C05/C07/C08/C13/C14/C15/C17 / UC-S06-02 | threepersonseparation/currentauthority/cumulativebasis/delegation/techdeny/fieldscope/evidence/officialunknown/UI4viewports | NOT RUN / rulesTO VERIFY |
| P44-13–14 | REQ-S06/C11/C12/C15/C16 / UC-S06-02 | cancellation/correction/actualrefunddistinct/approvedstrategy/nohistoryloss/originalprivatecorrespondencelink/fullreversalonce | NOT RUN |

เกณฑ์44-01ผูกP44-01/02/03/04/05/09 เกณฑ์44-02ผูกP44-06/07/08/10/11/12 ทั้งสองBLOCKED ไม่มีrealUI/approval/DAL/nativeDB reference45assertionsเป็นตรวจตัวอย่าง ไม่เป็นPASSauthหรือduplicationconcurrency ต้อง43และส่วนกลางพร้อม ไม่เริ่ม45

## 39 Traceability บท45 — รายงาน กระทบยอดและปิดงวด

Proposal/BLOCKED source `6d56b87`; [BUDGET_RECONCILIATION](BUDGET_RECONCILIATION.md), [BUDGET_PERIOD_CLOSE](BUDGET_PERIOD_CLOSE.md), [budget-45-plan.json](fixtures/budget-45-plan.json)0.1 ต่อREQ-S06/UC-S06-01/02 เฉพาะreport/export/reconcile/close ไม่อ้างว่างบการเงินทางการหรือexports/nativecloseมีแล้ว

| Cases | REQ/UC | หลักฐานที่ต้องได้จริง | รอบ45 |
| --- | --- | --- | --- |
| P45-01–07 | REQ-S06/C09/C11/C16/C17 / UC-S06-01/02 | exactledger/projection/subresources/FY-AY/reporttotals/screenExcelPDF/snapshotfreshness/systemtrialrollforward | NOT RUN |
| P45-08/09/16 | REQ-S06/C12/C15/C17 / UC-S06-01/02 | immutablemanifest/organizationnameversion/effective-recorded/restatehistory/privateThaioutputs | NOT RUN |
| P45-10–14 | REQ-S06/C05/C06/C07/C10/C11/C14/C15/C16 / UC-S06-02 | nativeclose-vs-posting/closedbackdate/reopenapproved/currentpermission/retry/RLS/audit/outbox/officialunknowndeny | NOT RUN / policyTO VERIFY |
| P45-15 | REQ-S06/S07/S08/C01/C04/C05 / UC-S06-02 | authorizedlinkscentralprocurement/letters อ่านแล้วไม่มีbudget/stock/dispatchtransactionเพิ่ม | NOT RUN / targetmodulesยังไม่พร้อม |

เกณฑ์45-01ผูกP45-01–07/11/15 เกณฑ์45-02ผูกP45-08/09/14/16 ทั้งสองBLOCKED ไม่มีbudgetUI/export/ledger/nativeDB/contracts55referenceassertionsไม่PASSruntime ต้อง44และส่วนกลางพร้อม ไม่เริ่ม46

## 40 Traceability บท46 — ตรวจรับระบบ6

source `eed9af6`; [UAT_SYSTEM_06](UAT_SYSTEM_06.md), [MANUAL_BUDGET](MANUAL_BUDGET.md), [ACCEPTANCE_CASES](../tests/system06/ACCEPTANCE_CASES.md), [coverage-plan](../tests/fixtures/system06/coverage-plan.json)0.1 เป็น PLAN ONLY ทุก P46 ยังNOT RUN ไม่มีnativeflowหรือfinancialowner signoff

| Cases | REQ/UC | หลักฐานที่ต้องได้จริง | รอบ46 |
| --- | --- | --- | --- |
| P46-01–10/23/28 | REQ-S06/C09/C10/C11/C12/C16/C17 / UC-S06-01/02 | แผน/จัดสรร/จอง/ผูกพัน/certify/partialpay/cancel/transfer/reversal/exact/nativeconcurrency/receiptและlineage | NOT RUN |
| P46-11–14/24–26 | REQ-S06/C05/C06/C07/C08/C13/C14/C15/C17 / UC-S06-02 | currentauthority/delegation/makerchecker/scope/RLS/scan/privateHTMLcache/a11y/officialpolicydeny และownerpolicy reviewแยก QA | NOT RUN / policyTO VERIFY |
| P46-15–22 | REQ-S06/C10/C11/C12/C14/C15/C16/C17 / UC-S06-02 | nativeatomicrollback/outboxretry/dedupe/deadletter/manifestreconcile/reporttotals/FYAY/history/closedgate/reopen | NOT RUN |
| P46-27 | REQ-S06/S07/S08/C01/C04/C05 / UC-S06-02 | central authorized links/readไม่มีmoney-stock-dispatchsideeffectsเมื่อโมดูลพร้อม | NOT RUN |

เกณฑ์46-01ผูกP46-02–10/15/16/18–24/28 เกณฑ์46-02ผูกP46-11/26และownerUAT protocol ทั้งสองBLOCKED rootunit17/fixturemathไม่nativeproof ทุกจำนวนเงินต้องFK/hash/decision/evidenceจากระบบจริง ไม่มีbank/NBMS/e-GPclaim ไม่เริ่ม47

## 41 Traceability บท47 — ทะเบียนวัสดุและครุภัณฑ์

source `5db4f45`; [ASSET_CLASSIFICATION](ASSET_CLASSIFICATION.md), [INVENTORY_SCHEMA](INVENTORY_SCHEMA.md), [ASSET_REGISTER_WORKSPACE](ASSET_REGISTER_WORKSPACE.md), [inventory-47-plan](fixtures/inventory-47-plan.json)0.1 เป็นcontracts/PLAN ONLY ไม่ใช่schema/migrations/UI/QRimageที่พร้อมใช้

| Cases | REQ/UC | หลักฐานที่ต้องได้จริง | รอบ47 |
| --- | --- | --- | --- |
| P47-01–08 | REQ-S07/C01/C09/C10/C11/C12/C16/C17 / UC-S07-01/02 | shareditem/multiwarehouse/unitgroups/rationalversion/exact/assetunique/sourceordinal/current-history-future/receipt/CAS/nativeconstraints | NOT RUN |
| P47-09–13 | REQ-S07/C05/C06/C07/C08/C13/C14/C15 / UC-S07-02 | actualQRbarcodeencode-decode/currentAuthDAL/scope/fieldpolicy/privateHTMLcache/print/export/fileworker/CLEAN/makerchecker/revoke | NOT RUN |
| P47-14–16 | REQ-S07/S06/C01/C04/C05/C09/C12/C17 / UC-S07-01/02 | accessibility4viewports/officialclassificationgate/unknowncostและnoimplicitmoney-stock-roletransactions | NOT RUN / policyTO VERIFY |

เกณฑ์47-01ผูกP47-01–08 เกณฑ์47-02ผูกP47-09–13/16 ทั้งสองBLOCKED ต้อง46/ส่วนกลาง/ADR/nativeDB/assetmodels/DAL/UI/filesพร้อม ไม่ใช้referenceconversion/UUIDpointer validationเป็นauth/nativePASS ไม่เริ่ม48

## 42 Traceability บท48 — ขอซื้อขอจ้างและเชื่อมงบ

source `c6697cb`; [PROCUREMENT_BUDGET_FLOW](PROCUREMENT_BUDGET_FLOW.md), [PROCUREMENT_ORDERS](PROCUREMENT_ORDERS.md), [procurement-48-plan](fixtures/procurement-48-plan.json)0.1 เป็นcontracts/PLAN ONLY ทุกP48-01–18NOT RUN ไม่มีruntime/SQL/API/order/budgetpostจริง

| Cases | REQ/UC | หลักฐานที่ต้องได้จริง | รอบ48 |
| --- | --- | --- | --- |
| P48-01–07/18 | REQ-S07/S06/C01/C09/C10/C11/C12/C16/C17 / UC-S07-01/UC-S06-02 | requestpurchase-service/exact/unit/approvalreserve/issuecommit/partialremaining/unique/rootrevisionamendment/ledgerreconcile | NOT RUN |
| P48-08–11/14–15 | REQ-S07/S06/C10/C11/C12/C16 / UC-S07-01/UC-S06-02 | cancelstate/releaseR/cancelableU/acceptedliability/C/P/history/concurrency/rollback/receipt/outboxretry | NOT RUN |
| P48-12–13/16–17 | REQ-S07/S06/S08/C04/C05/C06/C07/C08/C13/C14/C15/C17 / UC-S07-01/UC-S06-02 | authority/delegation/scope/files/CLEAN/privateSupplier/evidence/snapshot/closedgate/unknowntax/e-GP/ThaiUI/readonlylinks | NOT RUN / policyTO VERIFY |

เกณฑ์48-01ผูกP48-01–06/12/13/16 เกณฑ์48-02ผูกP48-03–11/14/15/18 ทั้งสองBLOCKED ต้อง47/43/ส่วนกลาง/ADR/nativeDB/servicesพร้อม ไม่ใช้reference8stepsเป็นretry/atomic/nativePASS ไม่มีe-GPintegration/อำนาจรับรอง ไม่เริ่ม49


## 43 Traceability บท49 — รับ ตรวจ เบิกและโอนวัสดุ

source `2a5b70f`; [STOCK_LEDGER](STOCK_LEDGER.md), [GOODS_RECEIPT_INSPECTION](GOODS_RECEIPT_INSPECTION.md), [STOCK_MOVEMENT_WORKSPACE](STOCK_MOVEMENT_WORKSPACE.md), [stock-49-plan](fixtures/stock-49-plan.json)0.1 เป็นcontracts/PLAN ONLY ทุกP49-01–20NOT RUN ไม่มีruntime/SQL/API/receipt/stock/financialpostจริง

| Cases | REQ/UC | หลักฐานที่ต้องได้จริง | รอบ49 |
| --- | --- | --- | --- |
| P49-01–02/09–10/17/20 | REQ-S07/S06/C01/C09/C10/C11/C12/C16/C17 / UC-S07-02/UC-S06-02 | partialinspection/CLEAN/acceptednet/rejectedreturn/replacementcapacity/asset-serviceadapter/remaining/acceptedliability ไม่closeOrderหรือจ่ายเอง | NOT RUN |
| P49-03–08/11–12/19 | REQ-S07/S06/C10/C11/C12/C16 / UC-S07-02/UC-S06-02 | nativeconcurrentlaststock/nonnegative/missingidentity/nullablelot/transferpair/globalorderedlocks/exact/CAS/idempotency/faultrollback/outboxretry/dependencyreversal | NOT RUN |
| P49-13–16/18 | REQ-S07/S06/C04/C05/C06/C07/C08/C13/C14/C15/C17 / UC-S07-02/UC-S06-02 | currentauthority/two-scopes/DAL/RLS/privateHTMLcache/export/fileworker/keyboard4viewports/asof/reconcile/history/closedperiod/policygate | NOT RUN / policyTO VERIFY |

เกณฑ์49-01ผูกP49-03–08/11–14/19 เกณฑ์49-02ผูกP49-01–02/09–10/16–18/20 ทั้งสองBLOCKED ต้อง48/43/ส่วนกลาง/ADR/nativeDB/models/servicesจริงก่อนexecute reference8steps/7movementdescriptors/8legsไม่พิสูจน์transactionlocking ไม่เริ่ม50


## 44 Traceability บท50 — ยืม คืน ซ่อมและประวัติผู้รับผิดชอบ

source `3441054`; [ASSET_LIFECYCLE](ASSET_LIFECYCLE.md), [ASSET_CUSTODY_HISTORY](ASSET_CUSTODY_HISTORY.md), [ASSET_LIFECYCLE_WORKSPACE](ASSET_LIFECYCLE_WORKSPACE.md), [asset-lifecycle-50-plan](fixtures/asset-lifecycle-50-plan.json)0.1 เป็นcontracts/PLAN ONLY ทุกP50-01–18NOT RUN ไม่มีservices/UI/schema/migrations/loan/repair/financialpostจริง

| Cases | REQ/UC | หลักฐานที่ต้องได้จริง | รอบ50 |
| --- | --- | --- | --- |
| P50-01–07/13–15 | REQ-S07/S06/C09/C10/C11/C12/C16 / UC-S07-02/UC-S06-02 | approvalclaim/handover/overdue/return-inspection/damage/repairhold/release/exactcost/uniquenativeassetlock/CAS/idempotency/transactionrollback-outboxretry | NOT RUN |
| P50-08–10/17 | REQ-S07/S01/C01/C09/C10/C11/C12/C17 / UC-S07-02 | primarycustody/location/asof/known-at/oldlabelsource/replaces/future/same-day/granularity/overlapข้ามPerson/immutablehistory/impactdedupe | NOT RUN |
| P50-11–12/16/18 | REQ-S07/S06/C04/C05/C06/C07/C08/C13/C14/C15/C17 / UC-S07-02/UC-S06-02 | currenttwo-scopes/grants/makerchecker/files/CLEAN/DAL/RLS/privacy/export/QR/read-only/keyboard4sizes/officialpolicygate | NOT RUN / policyTO VERIFY |

เกณฑ์50-01ผูกP50-01–07/10–15/18 เกณฑ์50-02ผูกP50-08–12/16–18 ทั้งสองBLOCKED ต้อง49/47/ส่วนกลาง/ADR/nativeDB/models/servicesจริงก่อนexecute reference9steps/5assignmentversions/9locationevents/9asofqueriesไม่พิสูจน์nativeunique/currentauth ไม่มีownerรับรองpolicies ไม่เริ่ม51


## 45 Traceability บท51 — ตรวจนับ จำหน่ายและรายงาน

source `8a70eda`; [STOCKTAKE_DISPOSAL_POLICY](STOCKTAKE_DISPOSAL_POLICY.md), [INVENTORY_REPORTS](INVENTORY_REPORTS.md), [stocktake-disposal-51-plan](fixtures/stocktake-disposal-51-plan.json)0.1 เป็นcontracts/PLAN ONLY ทุกP51-01–18NOT RUN ไม่มีstocktake/disposal/exportsหรือการปรับledgerจริง

| Cases | REQ/UC | หลักฐานที่ต้องได้จริง | รอบ51 |
| --- | --- | --- | --- |
| P51-01–06/15 | REQ-S07/C01/C09/C10/C11/C12/C16 / UC-S07-02 | samecutoff countgate/allwriters/CAS/lease-recovery/stale/recount/approvaladjustment/nonnegative/assetpresence/uniqueoperation/transactionfault-dedupe | NOT RUN |
| P51-07–10/12/17–18 | REQ-S07/S06/C09/C10/C11/C12/C16/C17 / UC-S07-02/UC-S06-02 | approval≠execution≠effective/disposal-vs-loan/repair dependencies/historycost-funding/source/correction/future/unknowndepreciation-ownerpolicygate | NOT RUN / policyTO VERIFY |
| P51-11/13–14/16 | REQ-S07/S06/C04/C05/C06/C07/C08/C13/C14/C15/C17 / UC-S07-02/UC-S06-02 | manifest/currentfieldscope/CLEAN/fileACL/privateAPI-HTMLcache/screenExcelPDFexact/Thai-precision/4sizes/readonlysource-reconcile | NOT RUN |

เกณฑ์51-01ผูกP51-01–06/11/14–16/18 เกณฑ์51-02ผูกP51-07–14/17–18 ทั้งสองBLOCKED ต้อง50/49/47/ส่วนกลาง/ADR/nativeDB/services/schemaจริงก่อนexecute reference6movements/7legs/2counts/5disposalevents/4asofqueriesไม่nativeuniqueหรือexportPASS ค่าเสื่อมทางการปิด ไม่มีพัสดุ/บัญชีownerUAT ไม่เริ่ม52


## 46 บท52 — ตรวจรับพัสดุร่วมกับงบประมาณ

source `5c52d0d`; [UAT_SYSTEM_07](UAT_SYSTEM_07.md), [MANUAL_INVENTORY](MANUAL_INVENTORY.md), [ACCEPTANCE_CASES](../tests/system07/ACCEPTANCE_CASES.md), [coverage-plan](../tests/fixtures/system07/coverage-plan.json)0.1 เป็นspecification/PLAN ONLY ทุกP52-01–30NOT RUN ไม่executabletests/runtime/exports

| Cases | REQ/UC | หลักฐานที่ต้องได้จริง | รอบ52 |
| --- | --- | --- | --- |
| P52-01–13/26/30 | REQ-S07/S06/C01/C09/C10/C11/C12/C15/C16 / UC-S07-01/UC-S06-02 | sharedprocurement-financeworkflow/partialsourceguard/receipt/acceptedliability/payment/cancellation/typedreversal/exactconversion/period/makerchecker/nativeatomicfaultproof | NOT RUN / policyTO VERIFY |
| P52-14–22/26–28 | REQ-S07/S06/C01/C09/C10/C11/C12/C16/C17 / UC-S07-01/UC-S07-02/UC-S06-02 | nativebudget-stock-asset/countlocks/sourceversions/operationunique/loan-return-inspection/repair/disposal/history/currentprojection/reconcile/sourceevidence | NOT RUN |
| P52-18/23–26/28–30 | REQ-S07/S06/C04/C05/C06/C07/C08/C13/C14/C15/C17 / UC-S07-01/UC-S07-02 | currentorg+warehouse+fieldgrants/DAL/RLS/API/worker/revoke/privatefiles/custody/QR/export/HTMLcache/ThaiUI4sizes/snapshotpolicy | NOT RUN |

เกณฑ์52-01ผูกP52-02–17/19/21/26–28/30 เกณฑ์52-02ผูกP52-18/23–26/28–29 ทั้งสองBLOCKED prerequisite47–51/43–46/ส่วนกลาง/DB-06/DOCKER-05ยังไม่ผ่าน ต้องactualnativeobserver/executionmanifest/currentauth/UI/exportsและownerUATก่อนaccept ไม่ใช้unit17หรือreference939assertionsเป็นE2E/nativeconcurrency/privacyPASS ไม่เริ่ม53

## 47 บท53 — ทะเบียนหนังสือและเลขสารบรรณ

source `243c234`; [RECORDS_REGISTER_POLICY](RECORDS_REGISTER_POLICY.md), [E_OFFICE_SCHEMA](E_OFFICE_SCHEMA.md), [RECORD_DOCUMENT_ACCESS](RECORD_DOCUMENT_ACCESS.md), [records-register-53-plan](fixtures/records-register-53-plan.json)0.1 เป็นschema/servicecontracts/PLAN ONLY ทุกP53-01–20NOT RUN ไม่Prisma schema/SQLmigration/servicesหรือเลข/ไฟล์แชร์จริง

| Cases | REQ/UC | หลักฐานที่ต้องได้จริง | รอบ53 |
| --- | --- | --- | --- |
| P53-01–11/19–20 | REQ-S08/C01/C09/C10/C11/C12/C16/C17 / UC-S08-01 | 4registertypes/namespaceperiod/type/firstcounter/native2connectionrowlock/unique/contextFK/operationreceipt/CAS/VOIDhistory/rollback/worker-revoke/BigIntDTO | NOT RUN / format-authorityTO VERIFY |
| P53-12–18/20 | REQ-S08/S01/S04/S05/S06/S07/C04/C05/C06/C07/C08/C12/C15/C17 / UC-S08-01/UC-S08-02 | Document/FileVersionbinding/shared5sources/currentrecord-file-sourceACL/action/recipientidentity/securityfloor/priority-due/privacy/fulltext/exports/nativeStorage/no copy | NOT RUN |

เกณฑ์53-01ผูกP53-02–11/19–20 เกณฑ์53-02ผูกP53-12–18/20 ทั้งสองBLOCKED52/ส่วนกลาง/DB-06/DOCKER-05ก่อนnativeexecution actualmanifest/ownerUATยังไม่มี Reference9numbers/10events/6namespaces/2fileversions/5links/14accessscenariosเป็นสมมติไม่race/CLEAN/ACL/PASS ไม่เริ่ม54

## 48 Traceability บท54 — ร่างหนังสือ ตรวจ และอนุมัติส่ง

[CORRESPONDENCE_FLOW](CORRESPONDENCE_FLOW.md), [CORRESPONDENCE_WORKSPACE](CORRESPONDENCE_WORKSPACE.md), [RECORD_PREVIEW_SECURITY](RECORD_PREVIEW_SECURITY.md) และ [fixture54](fixtures/correspondence-54-plan.json) รุ่น0.1 เป็น Proposal/PLAN_ONLY prerequisite53/ส่วนกลาง/DBไม่ผ่าน ไม่มี pages/services/preview/PDF/approved snapshot ที่รันได้

| กรณี | Requirement / Use case | หลักฐานที่ต้องตรวจจริง | สถานะ |
| --- | --- | --- | --- |
| P54-01–03 | REQ-S08/C01/C04/C12/C15 / UC-S08-01 | draft/resume/requirementsserver/CAS/submit/sharedworkflow/returnedใหม่ rootเดิม | NOT RUN |
| P54-04–09/18 | REQ-S08/C05/C06/C07/C08/C12/C15/C17 / UC-S08-01 | maker checker/currentdelegation/approvalrace/immutable candidate/hold/newcycle/file integrity/CLEAN/retry/outbox | NOT RUN |
| P54-10/17/19 | REQ-S08/S01/S02/C01/C05/C06/C08/N01/N03/N05 / UC-S08-01/02 | ID+org/contextผู้รับชื่อซ้ำ/current record-source-file scope/privacy/keyboard/4sizes | NOT RUN |
| P54-11–14/17 | REQ-S08/C05/C07/C08/C15/N03/N05 / UC-S08-01/02 | closedAST/servervalidation/safe sinks/HTMLpaste/prototype/activeattachments/privatecache/DOM instrumentation | NOT RUN |
| P54-15–16/20 | REQ-S08/C03/C04/C08/C12/C15/C17/N01/N03 / UC-S08-01 | template/font/layout manifestตรง screen-print/officialunknown deny/PDFartifact/previewไม่send-ack-sign/register | NOT RUN |

เกณฑ์54-01ไฟล์หรือเนื้อหาหลังอนุมัติไม่ส่งเป็นapprovedรุ่นเดิม map P54-03–09/14/16–18/20 เกณฑ์54-02scriptไม่executeและผู้รับชื่อซ้ำชัดเจน map P54-10–14/17/19 ทั้งคู่ BLOCKED/NOT RUN `actual_execution_manifest=NULL` ไม่มีผู้ตรวจ/คำอนุมัติ/file/CLEANจริง Python447reference assertions ไม่ใช่ acceptance proof; db:test exit1 ไม่มีnativeDBruntime ไม่ยืม17unitบท52/479referenceบท53เป็นผ่าน54 ไม่เริ่ม55

## 49 Traceability บท55 — ส่งหนังสือ รับทราบ และมอบหมายงาน

[DOCUMENT_DELIVERY](DOCUMENT_DELIVERY.md), [DELIVERY_ROUTING_CONTRACT](DELIVERY_ROUTING_CONTRACT.md), [DELIVERY_WORKSPACE](DELIVERY_WORKSPACE.md) และ [fixture55](fixtures/document-delivery-55-plan.json) รุ่น0.1เป็นProposal/PLAN_ONLY prerequisite54/ส่วนกลาง/DBไม่ผ่าน ไม่มี runtime inbox/outbox/routing/receipt/assignment/reminder

| กรณี | Requirement / Use case | หลักฐานที่ต้องตรวจจริง | สถานะ |
| --- | --- | --- | --- |
| P55-01–04/07 | REQ-S08/C01/C05/C06/C07/C11/C12/C13/C15 / UC-S08-01/02 | approvedversion/sender-currentguard/send-timegroupconfirm/snapshotlatebackdated/newkey dedupe/partial perendpoint | NOT RUN |
| P55-05–06/16/19 | REQ-S08/C05/C06/C11/C12/C13/C15 / UC-S08-01/02 | nativeworkerlease-fence/transactionalportal sink/commitloss/replay/reminder/currentdue/providerchanneldefaultdeny | NOT RUN |
| P55-08–11 | REQ-S08/C05/C06/C11/C12/C13/C15 / UC-S08-02 | notificationseenไม่ack/explicitPOST/currentactor/context/serverclock/receiptunique/Orgdelegatepolicy/evidence | NOT RUN |
| P55-12–15 | REQ-S08/S01/C01/C05/C06/C07/C11/C12/C13/C15 / UC-S08-02 | pendingaccess/approvedsupplementalbinding/currentrecord-source-file ACL/CLEAN/clearance/handover/taskhistory/childcompletion | NOT RUN |
| P55-17–18/20 | REQ-S08/C05/C06/C08/C11/C15/N01/N03/N05 / UC-S08-01/02 | privateinbox/outbox/searchcount/page/export/tracking/notification/cache/privacy/keyboard/375-768-1024-1440 | NOT RUN |

เกณฑ์55-01 retryไม่สร้างหนังสือหรือreceiptซ้ำติดตามรายคน mapP55-01–11/15–16/19 เกณฑ์55-02ผู้ถูกมอบหมายต่อไม่อ่านไฟล์ลับจนpolicyครบ mapP55-01/04/10–14/17–18 ทั้งสอง BLOCKED/NOT RUN actual executionmanifest/owner signoff=NULL Python328reference assertionsไม่native/service/worker/API/securityproof db:testexit1 ไม่มีจริง ไม่ยืม447referenceบท54/17unitบท52และไม่เริ่ม56

## 50 Traceability บท56 — กำหนดสิทธิ์เอกสารและเก็บรักษา

[RECORDS_RETENTION](RECORDS_RETENTION.md), [RECORD_ACCESS_CONTROL](RECORD_ACCESS_CONTROL.md), [CONTROLLED_DISCLOSURE](CONTROLLED_DISCLOSURE.md) และ [fixture56](fixtures/records-retention-56-plan.json) รุ่น0.1เป็นProposal/PLAN_ONLY prerequisite55/ส่วนกลาง/nativeDBและStoragehold-purge protocolไม่ผ่าน ไม่มีACL/retention/legalhold/preview/search/thumbnail/destructionruntime

| กรณี | Requirement / Use case | หลักฐานที่ต้องตรวจจริง | สถานะ |
| --- | --- | --- | --- |
| P56-01–08/24 | REQ-S08/S01/S04/S06/S07/C05/C06/C08/C11/C13/C15/N01/N03/N05 / UC-S08-01/02 | currentallchannelACL/techonlydeny/search-beforecount/snippet/thumbnailmetadata/headers/cache/exportworker/source4moduleslinknogrant | NOT RUN |
| P56-09–10 | REQ-S08/C05/C06/C07/C08/C11/C13/C15 / UC-S08-01/02 | source-approvedallowlist/currentpurpose/independentdisclosure review/derivativehash-CLEAN/hiddenbytes/originalpreserved | NOT RUN |
| P56-11–15/22 | REQ-S08/C05/C06/C07/C11/C12/C13/C14/C15 / UC-S08-01/02 | verifiedretentionanchor/typedholdscope/futureversions/history/authorizedrelease/manifest/source-sharedobligations/unknownpolicyblock | NOT RUN |
| P56-16–23 | REQ-S08/C05/C06/C11/C12/C13/C14/C15 / UC-S08-01/02 | nativehold-purgerace/providerprotection/faultreconcile/audit+outbox/tombstone/partialcopies/backups/restoretombstones/PIIfile vs history | NOT RUN |

เกณฑ์56-01fulltext/thumbnailไม่รั่วข้อความจากหนังสือไม่มีสิทธิ์ mapP56-01–10/24 เกณฑ์56-02legalholdป้องกันลบและapproveddestructionไม่ลบaudit mapP56-11–23 ทั้งสองBLOCKED/NOT RUN actualexecutionmanifest/owner signoff=NULL db:testexit1 ไม่มีnative/provider/browserproof Python384reference assertionsไม่runtimeหรือคำรับรองpolicy ไม่ยืม328referenceบท55/17unitบท52 ไม่เริ่ม57

## 51 Traceability บท57 — จัดหลักฐานอนุมัติและลายมือชื่ออิเล็กทรอนิกส์

[E_SIGNATURE_REQUIREMENTS](E_SIGNATURE_REQUIREMENTS.md), [APPROVAL_EVIDENCE_CONTRACT](APPROVAL_EVIDENCE_CONTRACT.md), [SIGNING_ADAPTER_CONTRACT](SIGNING_ADAPTER_CONTRACT.md) และ [fixture57](fixtures/approval-signing-57-plan.json)0.1 เป็นProposal/PLAN_ONLY prerequisite56/sharedservices/nativeDBไม่ผ่าน ไม่มีapproval evidence/signing adapter/certificateverification runtime

| กรณี | Requirement / Use case | หลักฐานที่ต้องตรวจจริง | สถานะ |
| --- | --- | --- | --- |
| P57-01–05 | REQ-S08/C07/C11/C12/C13/C15 / UC-S08-01 | serveridentity/time/currentauthority/exactreadmanifest+filehash/versionchange/history/clienttampering | NOT RUN |
| P57-06–12 | REQ-S08/C05/C06/C07/C08/C11/C13/C15/N01/N03/N05 / UC-S08-01/02 | makerchecker/techonlydeny/currentdelegation/nativeCAS-revoke/concurrency/idempotency/transactionrollback/allchannelACL | NOT RUN |
| P57-13–15/23 | REQ-S08/C07/C11/C13/C15 / UC-S08-01 | SIGNING_NOT_CONFIGURED/noexternalcall/noofficialsuccessfrominternalimagehash/receipt/sandbox/TO_VERIFY | NOT RUN |
| P57-16–22/24 | REQ-S08/C05/C06/C07/C08/C11/C12/C13/C14/C15 / UC-S08-01/02 | actualsignedartifact/contentbinding/scope/input-outputhash/PKIX/timestamp/revocation/callbackbinding/unknownreconcile/hold/append-onlyreport | NOT RUN |

เกณฑ์57-01 mapP57-01–04/16–17/24 เกณฑ์57-02 mapP57-13–15/18–19/23 ทั้งคู่BLOCKED/NOT RUN actualevidence/signature/certificate/timestamp/report0 db:testexit1 ข้อมูลสมมติและreferencechecksumไม่software/crypto/legalpolicyproof ต้องsourcebytes/sharedAuth/ACL/workflow/providerpolicyจริงก่อนผ่าน ไม่เลื่อนไป58

## 52 Traceability บท58 — ตรวจรับสารบรรณและเอกสารข้ามระบบ

[UAT_SYSTEM_08](UAT_SYSTEM_08.md), [MANUAL_EOFFICE](MANUAL_EOFFICE.md), [test specifications](../tests/system08/ACCEPTANCE_CASES.md) และ [fixture58](../tests/fixtures/system08/coverage-plan.json)0.1 เป็นPLAN_ONLY prerequisite53–57/sharedservices/source1-4-6-7/nativeDBไม่ผ่าน ไม่มีexecutableE2E FileVersion/source decisionsจริง

| กรณี | Requirement / Use case | หลักฐานที่ต้องตรวจจริง | สถานะ |
| --- | --- | --- | --- |
| P58-01–05 | REQ-S08/C05/C06/C07/C11/C12/C13/C15/N01/N03 / UC-S08-01 | draft/returned/revision/makerchecker/actualapprovedmanifest/SQLcounterrace/VOID/org-period-type/confirmedpolicy | NOT RUN |
| P58-06–16/19 | REQ-S08/C05/C06/C07/C08/C11/C13/C15/N01/N03/N05 / UC-S08-01/02 | dedupcontext/groupsnapshot/explicitack/taskpendingaccess/closeconditions/currentmulti-duty/expired/historygrant/allscope-search-export/worker/revoke | NOT RUN |
| P58-17–22 | REQ-S08/C05/C06/C07/C08/C11/C12/C13/C14/C15 / UC-S08-01/02 | nativeaudit-outboxfaults/fence/reconcile/editedapprovedbytes/secretmetadata/retention/holdclosure/destructiondisabled/disclosure | NOT RUN |
| P58-23–29 | REQ-S01/S04/S06/S07/S08/C05/C06/C07/C08/C11/C12/C13/C15/C17 / UC-S08-01/02 | actualcentralFileVersion/FK/bytes/decision/evidence/asof/correctionchainทั้ง4/zeroimplicit sourceposting/SIGNING_NOT_CONFIGURED/noofficialbadge | NOT RUN |
| P58-30 | REQ-S08/C05/C06/C07/C08/C15/N02/N05 / UC-S08-01/02 | UIThai/keyboard4sizes/XSS/no bypassscan/exactcentralIDs/errorconflict-resume/ownerpolicyUATseparate | NOT RUN |

เกณฑ์58-01 mapP58-06/08/09/12–16/19 เกณฑ์58-02 mapP58-18/21/23–29 ทั้งคู่BLOCKED/NOT RUN actualE2E/sourceFK-files-decisions/storage/delivery/receipt0 rootunit17PASSเฉพาะส่วนกลาง db:testexit1 ตัวอย่างmock/descriptors/referencechecksไม่E2E/ACL/cryptoหรือownerรับรองนโยบาย ไม่เลื่อนไป59

## 53 Traceability บท59 — เทมเพลต Excel สมัครสอบ

| รหัส / Requirement | สิ่งส่งมอบ | ผลจริง | ข้อจำกัด |
| --- | --- | --- | --- |
| P59-01 / REQ-S09 | 3XLSXเปล่า/ถูก/ผิด machineschema0.1.0 | file/import/blankfillsave-reopen/ไทย/leading0/XML PASS | authenticated download/upload/ExcelJS NOT RUN |
| P59-02 / REQ-S05, REQ-S09 | FormTemplateRegistry0.3 DEMO_EXAM_UPLOAD0.1.0 | 12กลุ่ม3NK9DSแยกtype/level/stage officialrefNULL/labelDEMO | officialsource/schemafields/ศ.3TO VERIFY ไม่มีregistryDB |
| P59-03 / REQ-S09, REQ-C07 | DEMO_REMARKS0.1.0 invalid10จุด | offlinecheckerพบ10ตรงคาด valid0issues row000002หลายremark | ไม่มีservervalidator/evidenceACL/makercheckerจริง |
| P59-04 / REQ-C09, REQ-C13, REQ-C18 | contractshared05/centraldocs/version/scan/currentACL | ตรวจschema/migration db:testexit1 | Auth/FileVersion/download/worker/commitยังไม่มี |

59-01ผ่านlocalfilesแต่ระบบdownload/staging/ACLยังBLOCKED;59-02label/sourcegateเสนอผ่านแต่serverofficialguardNOT RUN รวมบท59BLOCKEDบางส่วน [verification](fixtures/excel-template-59-verification.json) เก็บhash/types/rowcounts [คู่มือ](EXCEL_IMPORT_GUIDE.md) และ [contract](EXCEL_TEMPLATE_CONTRACT.md) ไม่ใช่officialform/eligibilitycertification ไม่มีmigrationหรือเริ่ม60

## 54 Traceability บท60 — อัปโหลดและอ่านไฟล์อย่างจำกัด

| รหัส / Requirement                                      | สิ่งส่งมอบ                                                                      | ผลจริง                                                            | ข้อจำกัด                                                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| P60-01,21–25,27–30 / REQ-S09, REQ-S05, REQ-C13, REQ-C18 | upload/currentcontext/sharedfiles/job/staging/erroraccess/idempotency contracts | อ่านพบDocumentmetadata/403workspace/readinessworker; db:testexit1 | page/service/Auth/scan/queue/FileVersionจริงไม่มี ทุกruntimecaseNOT RUN                    |
| P60-02–15,26 / REQ-S09, REQ-C09                         | actualZIPexpand/cell/row/XML/time/memory/isolationlimits0.1                     | baseline3trustedXLSXhash/CRC/countsตรง READ_ONLY_ONLY             | ZIPbomb/formula/fakeextension/resource/security/loadtestsNOT RUN Proposallimitsไม่enforced |
| P60-16–20 / REQ-S09, REQ-C07                            | normalization0.1 14vectors raw/NFC/leading0/Thai/BE/era/dateversion             | configuration/schema59bindingตรวจเอกสาร                           | ไม่มีnormalizationruntime;ไม่เปิดBE/Thaiบนschema59เดิม                                     |
| AC60-01 / REQ-S09                                       | P60-02–15/22/26 web-parentrecovery หลังbadjob                                   | BLOCKED / NOT RUN                                                 | ไม่มีboundedworker centralfiles/Auth/isolationจริง                                         |
| AC60-02 / REQ-S09                                       | P60-16/17/20 year-dateissues no guessing                                        | BLOCKED / NOT RUN                                                 | expectedissuesไม่ใช่serverexecution ไม่มีprofileผู้รับรอง                                  |

ดู [XLSX_PARSING_LIMITS](XLSX_PARSING_LIMITS.md), [specifications](../tests/system09/PARSING_CASES.md), [plan](../tests/fixtures/system09/parsing-plan.json), [baseline](fixtures/excel-parsing-60-baseline.json) รุ่น0.1 ไม่มีexecutabletests/actualjobs/Applicationใหม่ ไม่มีschema/migrationหรือเริ่ม61 ไม่ใช้format/JSON/baselineแทนการตรวจรับ60

## 55 Traceability บท61 — ตรวจนำเข้าแบบ dry run

| รหัส / Requirement                                   | สิ่งส่งมอบ                                                                   | ผลจริง                                                     | ข้อจำกัด                                                                       |
| ---------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| P61-01/02/23–25 / REQ-S09, REQ-S05, REQ-C13, REQ-C18 | logicaldelta staging/run/shared36+05/read-onlyregistry/CAS/recovery contract | อ่านพบ60/36runtimeไม่มี db:testexit1                       | models/services/DBrole/currentACL/26casesNOT_RUN ไม่มีregistry-writeproof      |
| P61-03–15/26 / REQ-S09, REQ-C07                      | 35codes locators/policies12contexts/duplicate3layers/noNamemerge             | fixtureexpectedissues8/codecatalog/specifications0.1       | ไม่มีrowerrorsจริง eligibility/identity/sourceTO_VERIFY ไม่acceptedfromfixture |
| P61-16–18 / REQ-S09, REQ-C09, REQ-C13                | maskedserverDTO/preview/currentexporttypedstrings/16textvectors              | contractsPLAN_ONLY ไม่มีexportXLSXหรือauthrouteจริง        | formula-injection/nativeopen-reopen/scan/ACL/HTML-cache/browserNOT_RUN         |
| P61-19–22 / REQ-S09, REQ-C18                         | file-normalized-rules-fact pins/currentrecheck/expiry/versionhistory         | 5referenceSHA256+8changed-digestvectorsตรวจfixtureเท่านั้น | actualfilehash/reportNULL ไม่productioncanonicalization/STALEserverproof       |
| AC61-01 / REQ-S09, REQ-S05                           | noPerson/Enrollment/Applicationwritesทุกsuccess-error-retry-export           | BLOCKED / NOT RUN                                          | ไม่มีnativebefore-aftercounts/versions/leastDBprivilegeจริง                    |
| AC61-02 / REQ-S09                                    | ผิดสำนัก/scope/สนามปิด/คนซ้ำ/รุ่นผิดและrowcolumnhints                        | BLOCKED / NOT RUN                                          | expectedlocatorsไม่ใช่API/UIที่ทำงานแล้ว                                       |

ดู [IMPORT_STAGING_DRY_RUN](IMPORT_STAGING_DRY_RUN.md), [IMPORT_VALIDATION_CODES](IMPORT_VALIDATION_CODES.md), [VALIDATION_CASES](../tests/system09/VALIDATION_CASES.md), [fixture](../tests/fixtures/system09/validation-plan.json)0.1 PLAN_ONLY ไม่มีmigration/actualstaging/preview/errorsreportหรือเริ่ม62 ไม่อ้างJSON/checksum/docsผ่านแทนruntime61

## 56 Traceability บท62 — ยืนยันนำเข้าไม่ซ้ำ

| Requirement / cases                               | สิ่งส่งมอบ                                                               | ผลจริง                               | ข้อจำกัด                                                |
| ------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------ | ------------------------------------------------------- |
| REQ-S09 / P62-01/14–17/23/24                      | confirm errors0/ack/fresh/currentACL/profile, workerlatestfacts          | contracts0.1 PLAN_ONLY               | ไม่มีปุ่ม/endpoint/workerbusiness/actualApplicationrefs |
| REQ-S09, REQ-S05, REQ-C18 / P62-02–06/11/12/18–21 | sharedidentity/Applicationkey/immutableintent/summary/rowreceipt/fencing | 24case specifications / fixture only | ไม่มีnativeconcurrencyหรือuniqueconstraintsจริง         |
| REQ-S09, REQ-C18 / P62-07–10/13/21/22             | atomicregistry/audit/successoutbox rollback/revalidate/replay            | transaction/failpointcontracts       | ไม่มีnativefault-injection/reconciliationจริง           |
| AC62-01                                           | repeatedconfirm/twobrowser/workerretryไม่Person/Applicationซ้ำ           | BLOCKED / NOT_RUN                    | prereq61/37/Auth/Document/DBยังขาด                      |
| AC62-02                                           | midtransactionrollbackไม่มีpartialrows retrylatestfacts                  | BLOCKED / NOT_RUN                    | db:testexit1 ไม่เริ่มbusinesscases                      |

ดู [IMPORT_IDEMPOTENCY](IMPORT_IDEMPOTENCY.md), [transaction](IMPORT_COMMIT_TRANSACTION.md), [COMMIT_CASES](../tests/system09/COMMIT_CASES.md), [fixture](../tests/fixtures/system09/commit-plan.json) ไม่ใช้docchecksแทนruntimepass schema0.6.0/migration1ไม่เปลี่ยน tested_commit_profileNULL และ63ยังไม่เริ่ม

## 57 Traceability บท63 — ติดตามและแก้ชุดนำเข้า

| Requirement / cases                   | สิ่งส่งมอบ                                                                  | ผลจริง                         | ข้อจำกัด                                        |
| ------------------------------------- | --------------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------- |
| REQ-S09, REQ-C13 / P63-01–06/18/22    | scopedhistory/search/progress/receipt/retry/export/noPIIjob-log             | contracts0.1+fixture PLAN_ONLY | ไม่มีmonitorUI/actions/DAL/exportworkerจริง     |
| REQ-S09, REQ-S05, REQ-C18 / P63-07–10 | immutablechildlineage5diff kinds sharedidentity/key noapprovedoverwrite     | specifications noactualrefs    | ไม่มีdiff/Application05amendmenttoolsจริง       |
| REQ-S09, REQ-S05, REQ-C18 / P63-11–17 | reviewedcompensation currentimpact/makerchecker/37–39routes/partialreceipts | 22caseplansALL_NOT_RUN         | ไม่มีnativePG/workflow/downstreamretentionproof |
| REQ-S09, REQ-C17 / P63-19–22          | policyNULL source-staging-report/hold/sharedreference/audit                 | contractsdestructiondisabled   | ไม่มีpurge/storage/holdserviceจริง              |
| AC63-01                               | batchตามscope exportเหมือนต้นทาง                                            | BLOCKED / NOT_RUN              | prereq62/Auth/FileVersion/DBขาด                 |
| AC63-02                               | ถอนbatchมีผลสอบไม่ลบseat-score-release                                      | BLOCKED / NOT_RUN              | db:testexit1 ไม่มีcompensationที่รันได้         |

ดู [IMPORT_RECOVERY](IMPORT_RECOVERY.md), [monitoring/retention](IMPORT_MONITORING_RETENTION.md), [RECOVERY_CASES](../tests/system09/RECOVERY_CASES.md), [fixture](../tests/fixtures/system09/recovery-plan.json) ไม่ใช้docchecksแทนruntimeacceptance schema0.6.0/migration1เดิม ไม่มีการทำลายข้อมูลจริง ไม่เริ่ม64

## 58 Traceability บท64 — สมัครผ่าน Excel ร่วมระบบ 5

| Requirement / cases                                        | สิ่งส่งมอบ                                                                                 | ผลจริง                                                 | ข้อจำกัด                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------ | -------------------------------------------------------- |
| REQ-S09, REQ-S05 / P64-01/02/03/13/14/20/24                | shared05PersonCandidateApplication/registry/opportunity/approval-seatlineage 24runs12pairs | UAT09/manual/26cases/coverage0.1 +UAT05crosscheck0.2   | actualrefsว่าง ไม่มีrealE2E/download/export/writers      |
| REQ-S09 / P64-06/09–12                                     | multiple sheets/Thai/NFC/leading0/identity/formername/explicitera/evidence                 | trustedXLSXofflineaudit3ไฟล์ PASSเฉพาะstructure/values | ไม่runtimeparser/eligibility/scan/templateofficialproof  |
| REQ-S09, REQ-C13, REQ-C18 / P64-04/05/07/08/15–19/21–23/25 | security/scope/retry/fault/snapshots/compensation/hold/privacy/a11y                        | PLAN_ONLY ทุกruntimecaseNOT_RUN                        | db:testexit1 ไม่มีbackend/FileVersion/currentAuth/worker |
| REQ-S09 / P64-26                                           | measuredlimit/deploymenthardware/boundaries/failure/availability                           | provenfilelimitsNULL/loadNOT_RUN                       | 20/2000/10MiBค่าข้อเสนอยังไม่ผ่านbench                   |
| AC64-01                                                    | บัญชีweb/import05+formregistryเดียว                                                        | BLOCKED / NOT_RUN                                      | noApplication05/FormTemplateRegistryruntime              |
| AC64-02                                                    | formula/invalidbatchไม่commit errorreportไม่PIIleak                                        | BLOCKED / NOT_RUN                                      | offlinearchivecheckไม่pipelineacceptance                 |

ดู [UAT_SYSTEM_09](UAT_SYSTEM_09.md), [MANUAL_IMPORT](MANUAL_IMPORT.md), [ACCEPTANCE_CASES09](../tests/system09/ACCEPTANCE_CASES.md), [coverage09](../tests/fixtures/system09/coverage-plan.json), [actualofflineverification](fixtures/excel-import-64-verification.json) และ [UAT_SYSTEM_05](UAT_SYSTEM_05.md) Sharedsystem05P40duplicate/seat/provenance/privacyต้องร่วมP64ในrealrunner ไม่เปลี่ยนstatusP40หรือ35–39เป็นPASSจากไฟล์09 schema0.6.0/migration1เดิม 65ยังไม่เริ่ม

## 59 Traceability บท65 — เชื่อมทั้งเก้าระบบ

| Requirement / cases             | สิ่งส่งมอบ                                                                                            | ผลจริง                                  | ข้อจำกัด                                              |
| ------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------- |
| REQ-S01–S09 / P65-01–05/21–24   | map9owners/7events/3scenarios centralreferences/currentACL/evidence                                   | 3contracts0.1 +15handlerplans/fixture   | actualIDs/FileVersion/decisionว่าง ไม่realhandlers    |
| REQ-C18 / P65-06–18/23          | source-outbox/consumerreceipt-effectatomic stablefamilydedupe/typeversion/CAS/fencing/order-reconcile | 24case specificationsALL_NOT_RUN        | outbox04uniqueต้องADR ไม่มีnativePG/queue/effectproof |
| REQ-C13, REQ-C18 / P65-19–22/24 | scopedcorrelation/report-notifyrecovery noPII/sourceauthority                                         | minimalenvelope/trace/artifactcontracts | noFileVersion/currentAuth/report/notificationruntime  |
| AC65-01                         | sharedcentralIDs/docversions ไม่มีregistriesซ้ำ                                                       | BLOCKED_NOT_RUN                         | prereq64/ownerdomain/Auth/filesขาด                    |
| AC65-02                         | duplicate/outoforder/crashrecover noeffectsซ้ำ correlationtrace                                       | BLOCKED_NOT_RUN                         | db:testexit1 ไม่มีconsumer/nativeevidence             |

ดู [INTEGRATION_MAP](INTEGRATION_MAP.md), [EVENT_CONTRACTS](EVENT_CONTRACTS.md), [INTEGRATION_HANDLERS](INTEGRATION_HANDLERS.md), [INTEGRATION_CASES](../tests/integration/INTEGRATION_CASES.md), [fixture](../tests/fixtures/integration/integration-plan.json), [entryREADME](../src/server/integration/README.md)0.1 documents/fixtureconsistencyไม่เป็นruntimeacceptance Schema0.6.0/migration1เดิม 66ยังไม่เริ่ม

## 60 Traceability บท66 — dashboard/report/search

| ข้อกำหนด / เกณฑ์                                     | เจ้าของ / สัญญา                 | กรณีทดสอบเสนอ         | หลักฐานจริง                                                                         |
| ---------------------------------------------------- | ------------------------------- | --------------------- | ----------------------------------------------------------------------------------- |
| ภาพรวมทุกหน้าที่และทั้ง9systems ตามscope             | C02+owners REPORT_CENTER/METRIC | P66-01–06/09/17/20/22 | 21metric/9roleviewcontracts ไม่UI/runtime                                           |
| search resources/fields/count/facet/snippetตามสิทธิ์ | C02/C03/owners GLOBAL_SEARCH    | P66-06–12/18–20       | body/thumbnaildisabled policythresholdNULL ไม่actualA/B/indexproof                  |
| metric grain/ปี/ledgerและscreen-exportmanifest       | owners METRIC/REPORT_CENTER     | P66-01–05/13–17/21–22 | sealedsource/filter/version/currentACL/reconcilecontracts ไม่report/FileVersionจริง |
| AC66-01 คนหลายตำแหน่งไม่countคนซ้ำ                   | O01/O05/C02                     | P66-01–05             | BLOCKED_NOT_RUN referenceexpected2people/3assignmentsไม่servercount                 |
| AC66-02 dashboard/searchAไม่Bผ่านcount/snippet       | C02/C03/owners                  | P66-06–12/18–20       | BLOCKED_NOT_RUN ไม่มีpositiveA/B/HTML/network/exportcanary                          |

[METRIC_DICTIONARY](METRIC_DICTIONARY.md), [REPORT_CENTER_CONTRACT](REPORT_CENTER_CONTRACT.md), [GLOBAL_SEARCH_CONTRACT](GLOBAL_SEARCH_CONTRACT.md), [REPORTING_CASES](../tests/reporting/REPORTING_CASES.md), [fixture](../tests/fixtures/reporting/reporting-plan.json), [entryREADME](../src/server/reporting/README.md)0.1 บท65ยังBLOCKED schema0.6.0/migration1เดิม ไม่newregistry/provider/runtime และไม่เริ่ม67

## 61 Traceability บท67 — unit/native service tests

| ข้อกำหนด / เกณฑ์                                                            | สัญญา / inventory                                              | หลักฐานจริง                                                   | สถานะ                                 |
| --------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------- |
| unitเฉพาะกฎสำคัญ/anti-tautology                                             | UNIT_CASES6specs dates/databaseguard/bootstrap/structureเดิม   | pnpmtest17PASS dates3 meaningfulboundary ไม่ใหม่businesssuite | PASS_EXISTING_ONLY                    |
| native scope/history/seats/ledger/stock/importatomicity                     | SERVICE_CASES D67-01–12 core.integrationเดิม                   | db:testexit1 beforecases ไม่nativebackend/receipts            | BLOCKED_NOT_RUN                       |
| 9systems read/mutate/export/files/workflow/worker 401/403/IDOR/maker/expiry | TEST_MATRIX54casefamilies V01–07 +positivepairedchecks         | actualgrants/resourcesไม่มี 403bootstrapไม่proof              | PLAN_ONLY_NOT_RUN                     |
| isolatedfixtures/testclock/DBlocking                                        | test-plan profiledisabled centralTESTrefs/connections/barriers | PGportsrefused noDocker/server; WASM12supplementaryPASS       | BLOCKED_NATIVE                        |
| AC67-01 negative9 + meaningfulseats/budget/stockconcurrency                 | N67/D67-03/04/06 และsourceoracles                              | ไม่มีบริการ/PGจริง                                            | BLOCKED_NOT_RUN                       |
| AC67-02 ไม่มีmirrorimplementation/fakePASS                                  | TEST_RESULTS+actualJSON ไม่เพิ่มexecutable/tautology           | existingchecksรันจริง failuresetupแยก casesไม่claimpassed     | REPORTING_ONLY_BUSINESS_SUITE_MISSING |

[TEST_MATRIX](TEST_MATRIX.md), [TEST_RESULTS](TEST_RESULTS.md), [unit specs](../tests/unit/UNIT_CASES.md), [native specs](../tests/integration/SERVICE_CASES.md), [fixture](../tests/fixtures/test67/test-plan.json), [actual results](../tests/results/lesson67-results.json)0.1 Core0.6.0/migration1เดิม ไม่rename testsเดิม/expandrunner/mockruntime ไม่68 ผลซอฟต์แวร์ไม่รับรองofficialrules

## 62 Traceability บท68 — cross-system E2E และ UAT

| ข้อกำหนด / เกณฑ์                                       | cases/ผู้รับผิดชอบเสนอ                       | หลักฐานจริง                                                              | สถานะ                           |
| ------------------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------- |
| คนแก้สถานะ/approve/effective/rights/notice             | E68-01/R68-01–02 O01/O08/C02                 | core/starterไม่มีdomain ไม่มีcentralrefs/capture                         | BLOCKED_NOT_RUN                 |
| center/appointment/Excel/App/seat/score/release/search | E68-02/R68-03–04 O02/O04/O05/O09             | 12examplan ไม่มีnativeflow/receipts                                      | BLOCKED_NOT_RUN                 |
| budget/procurement/stock/pay/loan/count/record         | E68-03/R68-05–06 O06/O07/O08                 | exactoracles/partial/retryplans ไม่มีledgeractualevidence                | BLOCKED_NOT_RUN                 |
| prelessonpostแยก03                                     | L68-01–03 O03/learner                        | 9groupplans ไม่practiceofficial/answerkey leak แต่ยังไม่มีUI/serverflow  | BLOCKED_NOT_RUN                 |
| UAT9ฝ่าย+learner+public+negative/a11y/privacy          | U68-01–11/N68-01–03/A68-01–03 C01/owners/C03 | 11PENDINGsignoff/33checkpointlabels ไม่screenshotsหรือtesterจริง         | PENDING_UNSIGNED                |
| AC68-01 3crossflows+recoverednetwork/worker            | E68/R68+source/consumer/FileVersionproof     | buildexit0 HTTP27ผ่านเท่านั้น dbtest/workerexit1 browser/harnessไม่พร้อม | BLOCKED_NOT_RUN                 |
| AC68-02 รายการไม่รับรองค้างไม่เซ็นแทน                  | UAT_MASTER/SIGNOFFtemplate/uat-plan          | actualsignature/date/authority/testersว่าง acceptedcases0                | PENDING_UNSIGNED_NO_UAT_SESSION |

[UAT_MASTER](UAT_MASTER.md), [UAT_SIGNOFF_TEMPLATE](UAT_SIGNOFF_TEMPLATE.md), [E2E_CASES](../tests/e2e/E2E_CASES.md), [fixture](../tests/fixtures/e2e/uat-plan.json), [actualresults](../tests/results/lesson68-results.json)0.1 Schema0.6.0/migration1เดิม ไม่Playwrightnewtests/install/config/screenshots/actualsignoff sourcefileเปลี่ยน บท69NOT_STARTED

## 63 Traceability บท69 — Performance/accessibility/capacity

| ข้อกำหนด                                                   | กรณี / สิ่งส่งมอบ              | หลักฐานจริง                                                                       | สถานะ                                  |
| ---------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------- | -------------------------------------- |
| งาน69ข้อ1–2 workloadและเป้าหมาย                            | P69-01–04/4profiles/BASELINE   | starter120requests concurrency4 p95 27.182204ms rawsamples; 4profilesยังไม่รัน    | PARTIAL_DIAGNOSTIC / business NOT_RUN  |
| งาน69ข้อ3 query/pagination/index/N+1/pool/cache            | P69-05/06/09/10                | core19modelsไม่มีownerqueries 21denialsไม่A/Bpositive                             | BLOCKED_NOT_RUN                        |
| งาน69ข้อ4 keyboard/reader/axe/contrast/mobile/export/media | A69-01–09/ACCESSIBILITY_REVIEW | actualHTML+5declaredcolorpairs thresholdผ่านเฉพาะsource; browser0                 | PARTIAL_SOURCE_REVIEW ไม่WCAGcertified |
| AC69-01 actualnumbers+limits                               | results/config/BASELINE        | workload0.579sเครื่องเดียว ไม่มีDB/TLS/CDN/browser; target2sไม่actualsearchresult | PARTIAL ยังไม่ครบbusiness              |
| AC69-02 privateisolation+XLSX/worker memory                | P69-05/07/08                   | A/B/limits/workerNOT_RUN RSSsample0NULL                                           | BLOCKED_NOT_RUN                        |

ไฟล์69รุ่น0.1: [PERFORMANCE_BASELINE](PERFORMANCE_BASELINE.md), [ACCESSIBILITY_REVIEW](ACCESSIBILITY_REVIEW.md), [LOAD_CASES](../tests/performance/LOAD_CASES.md), [workload-plan](../tests/fixtures/performance/workload-plan.json), [actualresults](../tests/results/lesson69-results.json). แยกsource review/HTTPstarter/plannedbusiness/currentAuth/native/browser/signoff core/package/schema/lock/migrationเดิม ไม่มีexecloadscripts/screenshots/certificationใหม่ ไม่เริ่ม70

## 64 Traceability บท70 — Security/governance release gates

| ข้อกำหนด                                                    | กรณี / สิ่งส่งมอบ                                 | หลักฐานจริง                                                              | สถานะ                                        |
| ----------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------- |
| งาน70ข้อ1 threatmodel/riskowners                            | T70-01–10/THREAT_MODEL                            | centralboundaries/sourceinventory/roleownersเสนอ ไม่actualappointment    | REVIEWED_SOURCE / Proposal                   |
| งาน70ข้อ2 implementationsecurity                            | C70-01–15/SECURITY_REVIEW                         | unit17 HTTP27 sourceRLS19/noallowpolicy localguards; businesscases0      | PARTIAL source/bootstrap ไม่businessPASS     |
| งาน70ข้อ3 inventory/basis/visibility/retention/rights/hold  | D70-01–18/19actualmodels213fields/9plannedrows    | fieldnamesจากschemaจริง basis/retention/evidenceNULL                     | NEEDS_LEGAL_REVIEW                           |
| งาน70ข้อ4 confirmed/proposal/legal / feature-specific gates | G70-01–12/DATA_GOVERNANCE_SIGNOFF                 | actualworkspaceclosed ไม่มีper-featuregateengine;mockunitต่อได้          | PENDING_UNSIGNED / relatedrealofficialclosed |
| งาน70ข้อ5 severity/evidence/remediation/residual            | S70-01–08                                         | High5/Medium3 proposedlevels actualgaps/unverified audittimeout          | OPEN ไม่CVSS/confirmedexploit                |
| AC70-01 critical/secret/logrelease                          | actualresults/historyscan/advisory/logcoverage    | 608text8patterns0match binary3skipped countsCVE NULL externallogsNOT_RUN | PARTIAL/BLOCKED ไม่nocriticalcertification   |
| AC70-02 TO VERIFY decision/evidenceก่อนunlock               | 12gates/authority/fileversion/actualsecurityproof | appointeddecider/signature/approvedgatesว่างทั้งหมด                      | BLOCKED ไม่officialunlock                    |

ไฟล์70รุ่น0.1: [THREAT_MODEL](THREAT_MODEL.md), [SECURITY_REVIEW](SECURITY_REVIEW.md), [DATA_GOVERNANCE_SIGNOFF](DATA_GOVERNANCE_SIGNOFF.md), [review-plan](../tests/fixtures/security/review-plan.json), [actualresults](../tests/results/lesson70-results.json). Core/schema/package/lock/migration/runtime/testsเดิมไม่เปลี่ยน ไม่มีnewauth/file/job/gateimplementation/approval ไม่เริ่ม71

## 65 Traceability บท71 — CI deployment และ restore

| ข้อกำหนด                                                           | สิ่งส่งมอบ / กรณี                                  | หลักฐานจริง                                                   | สถานะ                        |
| ------------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------- | ---------------------------- |
| งาน71ข้อ1 frozen/lint/type/tests/build/migration/secrets/artifacts | CI candidate foundation/native jobs                | YAMLparse/guardsผ่าน; workspacechecks exit0; ActionsNOT_RUN   | CONFIG_PROPOSAL ไม่ activeCI |
| งาน71ข้อ2 portal/บริการ/environments/leastprivilege                | environments.plan/DEPLOYMENT                       | existinglocalcomposeและlocalworker source; remote refsnull    | NOT_PROVISIONED              |
| งาน71ข้อ3 staging9smokes/compatiblemigration                       | DEPLOYMENT/ROLLBACK_RUNBOOK                        | starterHTTP27จริง ไม่9flows; schema/migrationเดิม             | BUSINESS_STAGING_NOT_RUN     |
| งาน71ข้อ4 DB/files/identity/keys/isolatedrestore                   | BACKUP_RESTORE/manifestrequirements/reconciliation | toolsabsent ไม่มีarchive/target/cutoff/restoredcounts         | RESTORE_NOT_RUN              |
| งาน71ข้อ5 RPO/RTO ownerproposal/measurement                        | environments.plan/actualresults                    | proposed86400/14400s ownernull actualnull                     | PENDING_OWNER_AND_DRILL      |
| AC71-01 clean staging และ workerเชื่อมบริการ                       | cleanlocalclone + native/readinessprobes           | offlineFAIL/onlineTIMEOUT55s; db:testและworker:checkexit1     | BLOCKED                      |
| AC71-02 restoreผ่านพร้อมเวลา/evidence                              | restorechecks/actualresults                        | started/verified_at/RPO/RTO/countsnull ไม่อ้างWASMเป็นrestore | NOT_RUN_BLOCKED              |

ดู [CI config](../deploy/ci.foundation.proposed.yml), [environment plan](../deploy/environments.plan.json), [DEPLOYMENT](DEPLOYMENT.md), [BACKUP_RESTORE](BACKUP_RESTORE.md), [ROLLBACK_RUNBOOK](ROLLBACK_RUNBOOK.md), [ผลจริง](../tests/results/lesson71-results.json) รุ่น0.1 App/schema0.6.0 migrationเดิม ไม่deployment/pushหรือactualowneracceptance ไม่เริ่ม72

## 66 Traceability บท72 — เปิดใช้และรับมอบครบเก้าระบบ

| ข้อกำหนด                                                                                 | สิ่งส่งมอบ / การเชื่อมหลักฐาน                               | หลักฐานจริง                                                           | สถานะ                                 |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------- |
| งาน72ข้อ1 checklist9/forms/สิทธิ์/owners/UAT/training/monitoring/backup/rollback/contact | GO_LIVE9rows+G72-01–10 / HANDOVER / runbooks71              | core19modelsและUAT01–09BLOCKED; checklistไม่implementation            | PLAN_ONLY / NO_GO                     |
| งาน72ข้อ2 approvedpilot/data/freeze                                                      | release-plan authorization/pilot / F72-01–07                | actualauthority/pilotrefsnull ไม่มีruntimefreezeengine                | NOT_AUTHORIZED / NOT_STARTED          |
| งาน72ข้อ3 manualsทุกaudience/incident/placeholders                                       | HANDOVER9audiences + existing9manuals / SUPPORT_RUNBOOK     | linksมีจริง คู่มือflowเสนอ training/competency/signaturesไม่มี        | HANDOVER_PENDING                      |
| งาน72ข้อ4 expand/daily/7/30/deploymentauthority                                          | GO_LIVEphases / POST_RELEASE_REVIEW                         | T0/actualappointments/metricsnull ไม่สร้างnัด/ข้อความ                 | PLAN_ONLY / NOT_STARTED               |
| งาน72ข้อ5 readiness/backlogowner/deadline                                                | B72-01–10 / lesson72-results                                | ownerroles/datesเสนอไม่accepted; unit17 HTTP27จริง starter/core       | OPEN_BLOCKERS / NO_GO                 |
| AC72-01 REQ→implementation→tests→UAT→manual9                                             | release-plan35chains / HANDOVER9rows / TRACEABILITYbaseline | 35REQและUC/TC/specpathsครบแต่implementation/execution/UATsignatureขาด | PARTIAL_DOCUMENT_TRACEABILITY_BLOCKED |
| AC72-02 actualsharedaccount/menu/data/contact/handover                                   | G72-09–10 / prior71 + actual72                              | /app403ไม่workingportal; contact/login/9businessruntimeไม่มี          | BLOCKED_NOT_PROVEN                    |

[GO_LIVE](GO_LIVE.md), [HANDOVER](HANDOVER.md), [SUPPORT_RUNBOOK](SUPPORT_RUNBOOK.md), [POST_RELEASE_REVIEW](POST_RELEASE_REVIEW.md), [release-plan](../tests/fixtures/release/release-plan.json), [ผลจริง](../tests/results/lesson72-results.json) รุ่น0.1 mapREQ-S01–09/C01–20/N01–06ครบ35จากข้อกำหนดเดิม READMEเป็นspecไม่implementation Core/schema/migration/runtimeไม่เปลี่ยน ไม่รับมอบ/เปิดจริงหรือปิดโครงการว่าเสร็จ ไม่มีบทถัดไปเดาเอง ให้แก้blockersแล้วตรวจรับใหม่
