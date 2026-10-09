# ตรวจรายวันและทบทวนหลังเปิดใช้ 7 / 30 วัน

รุ่น 0.1 | บท72 | 9 ตุลาคม 2569 | **PLAN_ONLY / T0_NOT_SET / ไม่มีผลหลังเปิดจริง**

อ่าน [GO_LIVE](GO_LIVE.md), [HANDOVER](HANDOVER.md), [SUPPORT_RUNBOOK](SUPPORT_RUNBOOK.md), [METRIC_DICTIONARY](METRIC_DICTIONARY.md), [PERFORMANCE_BASELINE](PERFORMANCE_BASELINE.md) ค่าที่ว่างไม่ใช่ศูนย์ และจำนวนแผน/ลิงก์เอกสารไม่ใช่จำนวนระบบที่ตรวจรับแล้ว

## 1 ตารางที่ผูกกับวันเปิดจริง

T0คือเวลาเปิดหน่วยนำร่องตามdeploymentauthorizationหลังG72ครบ บันทึกUTCพร้อมแสดง Asia/Bangkok/พ.ศ. รอบนี้T0และactualappointmentsว่าง ไม่เริ่มนับจากวันเขียนเอกสารหรือcommit ไม่มีนัดประชุม/reminder/การติดต่อจริงที่ถูกสร้าง

| รอบเสนอ | เวลาและขอบเขต                                                                                  | ผู้เข้าร่วมเสนอ                 | ผลจริง      |
| ------- | ---------------------------------------------------------------------------------------------- | ------------------------------- | ----------- |
| Daily   | T0ถึงT0+14วันปฏิทิน 09:00 Bangkok; ทบทวนincident/transaction/queue/backup/permissions/training | C02+C03+C04+ownersหน่วยนำร่อง   | NOT_STARTED |
| Day7    | T0+7วันปฏิทิน; ตรวจคุณภาพข้อมูล/เวลางาน/การฟื้นและownerรับงาน                                  | C01+C02+C03+C04+O01–O09ตามscope | NOT_STARTED |
| Day30   | T0+30วันปฏิทิน; ตรวจแนวโน้ม/backlog/risk/การขยายพื้นที่                                        | กลุ่มเดิมและหน่วยที่จะเพิ่ม     | NOT_STARTED |

C01/ownersยืนยันวันเวลาจริง เวรช่วงสอบและความถี่เพิ่มเติมเมื่อทราบ workload ไม่เปลี่ยนไปนับเฉพาะวันทำการเอง รอบ30วันไม่ปิดประเด็นที่เลยกำหนดโดยอัตโนมัติ

## 2 Metric dictionary สำหรับ review

ทุกmetricระบุหน่วย/scopedpopulation/filter/ปีหรือwindow/sourceversion/asof/refreshedat/samplecount/denominator/evidence/queryและowner ฟิลด์แสดงเคารพpolicy count/snippet/exportไม่รั่วพื้นที่B ข้อมูลไม่พอหรือdenominator0แสดง NOT_MEASURED/N/A ไม่สร้างเปอร์เซ็นต์0%หรือ100% หลักฐานธุรกิจยังไม่มีในรอบ72

| Metric                   | นิยาม/แหล่งจริงที่ต้องใช้                                                                 | วิธีป้องกันตีความผิด                                                           | Ownerเสนอ / actual |
| ------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------ |
| M72-01 คุณภาพคน/หน่วย    | duplicateตามbusinesskeyที่review, completenessตามfieldrequirements, rejectedmappings      | คน=distinctPerson ไม่positions/userroles; ไม่mergeชื่อคล้ายเอง                 | O01/O02 / null     |
| M72-02 ใบสมัครและseat    | duplicateธุรกรรม, missingevidence, seatcollision/capacityกับรอบจริงจาก Application05      | 09เป็นช่องทาง ไม่เพิ่มจำนวนApplicationอีก; Enrollmentแยก                       | O05/O09 / null     |
| M72-03 ผลและประวัติ      | ผลที่ตามถึงApplication/scorebatch/rule/approval/releaseครบ และcorrectionที่review         | practice03ไม่เป็นofficial05 ชื่อปีเก่าคงsnapshot                               | O05/O03 / null     |
| M72-04 งบ/stockreconcile | eventกับprojection/report/export ณcutเดียวกันและversionเดียวกัน                           | เงินexactdecimalแยกFY; stockexactquantityแยกunit/location ไม่ถือสองยอดเดียวกัน | O06/O07 / null     |
| M72-05 เวลางาน           | elapsed/active processing timeของworkflowstepsและendtoend, samplecounts median/p95        | แยกqueuewait/มนุษย์review/ระบบ/timeouts/failed; baselineกับpilotscopeเท่ากัน   | owners+C02 / null  |
| M72-06 ปัญหา             | incidentแยกseverity/rootcause/feature, reopen/overdue/scope/ผลกระทบ                       | distinctincident ไม่จำนวนnotificationซ้ำ; severityเสนอแยกยืนยัน                | C02+C03 / null     |
| M72-07 recovery          | declaration→verifiedtime และ recoverablecutoff/RPO ของเหตุ/drillจริง                      | แยกdetection/containment/restore/verification ไม่ใช้target24h/4hเป็นactual     | C02 / null         |
| M72-08 files/records     | missing/hash/version/ACL/scan/hold mismatches และ retry/delivery/ack backlog              | notificationopenไม่ack; Documentกลางไม่copyนับใหม่ตามโมดูล                     | O08+C02 / null     |
| M72-09 support/training  | competencycasesผ่าน, unresolveduserneeds, accessibilityissues/เวลาตอบจากticketที่มีสิทธิ์ | attendanceไม่competencyหรือowneracceptance; ไม่นำชื่อจริงลงpublicsummary       | C04+owners / null  |
| M72-10 servicecapacity   | searchp95/errorrate/workerlag/retry/DLQ/memory/pool ภายใต้profileที่ระบุ                  | ทดสอบเครื่องเดียวไม่เท่าทั้งประเทศ จำกัดcacheเฉพาะpublisheddataที่policyอนุญาต | C02 / null         |

Targets/SLA/samplesizeอื่นยัง TO VERIFYโดยownerตาม [OPEN_QUESTIONS](OPEN_QUESTIONS.md) เหตุถูกต้อง/privacyที่F72กำหนดให้หยุดทันทีแม้sampleน้อย ไม่เฉลี่ยกลบเหตุผิด แนวโน้มเวลาลดลงต้องใช้ baseline/pilotที่เทียบได้ ไม่สรุปความพึงพอใจหรือประหยัดเงินจากคำพูดไม่มีข้อมูล

## 3 วาระตรวจและผลตัดสิน

Dailyตรวจ incidentใหม่และreopened, exactbudget/stockdiff, duplicates/seat/scorepublication, currentrights/cache/secret-log issues, filequarantine/hash/hold, workerlag/dedup, backupความสดและcoherentverifiedcutoff, trainingpendingและownerกำหนดแก้; ใช้filteredreportmanifestเดียวกับexportและบันทึกrefreshwatermarks

Day7ตรวจ REQ/UC/test/UAT/manualรุ่นเดียวกับrelease, pilotdataqualityและเวลางาน, freeze/recoveryเหตุจริง, supportและผู้รับงาน พร้อม decisions KEEP_PILOT / FREEZE / FIX_AND_REVIEW / PROPOSE_EXPANSION ไม่มีdecisionที่ได้รับอนุมัติในรอบนี้

Day30ตรวจresidualrisks/overdue/actions/restoreผลล่าสุด/peakexamworkload/rulesและfieldpolicy/training/ownerความพร้อมหน่วยใหม่ อนุมัติแต่ละwaveต้องมีscope/authorityและG72ที่ตรวจใหม่ ไม่ถือผ่าน30วันแล้วทุกหน่วยเห็นข้อมูลย้อนหลังอัตโนมัติ

## 4 แบบบันทึก review และ action register

review_id/type/planned_at/actual_at/releaseid/T0/commit/scope/filter/yearkind/window/asof/refreshedat, metricdefinitions/sourceversions/rawsampleprivateevidenceref/aggregates, issueids/severity/ownerจริง/action/due_at/acknowledged_at/closureevidence, decision/authority/signature/residualrisk/nextreview ระบุ proposed_dueกับagreed_dueแยกกัน

รอบนี้baselineธุรกิจ/pilot/actualmetrics/attendance/decision/signatureทั้งหมด null/PENDING นัดและbacklogใน HANDOVERเป็นข้อเสนอ ยังไม่มีการรับรอง7หรือ30วัน ผลunit/HTTPstarterบท72ถูกบันทึกแยกใน [lesson72-results](../tests/results/lesson72-results.json) ไม่ถือเป็นPIRของหน่วยนำร่อง
