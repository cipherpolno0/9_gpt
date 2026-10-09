# คู่มือเตรียมงานคลังและผู้ถือครอง — บท 52

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | **Proposal / BLOCKED — ยังไม่มีหน้าจอหรือบริการใช้งานจริง**

คู่มือนี้เตรียมตรวจความต้องการ/UAT ตาม [UAT_SYSTEM_07](UAT_SYSTEM_07.md) และ [ACCEPTANCE_CASES](../tests/system07/ACCEPTANCE_CASES.md) ใช้ข้อมูล TEST/DEMOใน [coverage-plan](../tests/fixtures/system07/coverage-plan.json) ไม่เป็น stock/ทะเบียน/คำอนุมัติจริง บัญชี Person Organization เอกสารและงบใช้ระบบกลางเดียว

## 1 เลือกหน้าที่และบริบท

เข้าบัญชีเดียว ตรวจหน้าที่ ช่วงมอบหมาย หน่วยงาน คลังและสถานที่เก็บที่ได้รับสิทธิ์ การดูหน่วยงานหนึ่งไม่ให้สิทธิ์ทุกคลัง การเป็นผู้ถือครองไม่ให้สิทธิ์อ่านราคา/งบ/คนอื่นอัตโนมัติ ถ้าไม่มีสิทธิ์ให้หยุดและแจ้งตามช่องทางกลางที่เจ้าของยืนยัน ไม่แก้URL/body warehouse_id/person_id/asset_idเพื่อเปิดของนอกขอบเขต

ตรวจ ItemCatalog ประเภท MATERIAL/ASSET หน่วย/base-unit/conversionversion/scale/lotpolicy ครุภัณฑ์เป็นรายชิ้นมีcode/sourceordinalไม่เป็น stockวัสดุ ตั้ง FiscalYear/แหล่งเงิน/โครงการก่อนรายการเงิน ไม่ใช้AcademicYearแทนปีงบ ไม่เดาอัตราแปลงจากชื่อกล่อง ขนาดบรรจุเปลี่ยนต้องรุ่นใหม่ ค่าunknownให้แจ้งผู้ตรวจและคง official gateปิด วันที่แสดง พ.ศ. timezoneAsia/Bangkok แยกวันมีผลกับวันบันทึก

## 2 ขอซื้อและออก order

ร่างรายการ จำนวน หน่วย ราคาโดยประมาณ เหตุผล budgetlineและหลักฐาน ตรวจยอด/requirementsฝั่งserverก่อนส่ง ผู้ตรวจส่งกลับให้แก้เรื่องเดิมตามrevision เมื่อconflictโหลดรุ่นใหม่และตรวจความต่าง ผู้สร้างและผู้แก้สาระสำคัญไม่อนุมัติเอง ผู้ดูแลเทคนิคไม่เป็นผู้อนุมัติธุรกิจจากชื่อฝ่าย

อนุมัติแล้วจองงบผ่านระบบ6 ออกorderจึงเปลี่ยนRเป็นU transactionเดียว ไม่เหลือRส่วนเดิมพร้อมเพิ่มUซ้ำ orderยังไม่อนุมัติ/งบไม่พอ/แหล่งเงินไม่อนุญาตออกไม่ได้ เอกสารผ่านบริการกลาง private/quarantine/CLEAN/currentACLและตรวจเนื้อหาโดยผู้มีอำนาจ CLEANไม่รับรองใบซื้อหรือระเบียบ

## 3 รับของและตรวจรับบางส่วน

1. เลือกorder/line/revisionที่มีสิทธิ์ บันทึกของที่มาถึงจริง/หน่วย/lot/เลขอ้างอิงใบส่งของและหลักฐาน ไม่บันทึกacceptedมากกว่าphysicalหรือremainingตามpolicy ค่าจำนวนมาจากข้อมูลตรวจไม่ยอดclientที่ใช้เพิ่มstockทันที
2. แยก pending/accepted/rejected/returnตามผลตรวจ ของpendingหรือrejectไม่เป็นavailable รับบางส่วนคงremaining ไม่ปิดorderหรือภาระทั้งก้อน หากคืนก่อนacceptedไม่ลดavailableที่ไม่เคยเพิ่ม Replacementต้องอ้างต้นทาง/คำอนุมัติ ไม่รับเกินด้วยเปลี่ยนkeyใหม่
3. acceptedmaterialเพิ่มledgerในbucketที่ยืนยัน acceptedassetลงทะเบียนแต่ละordinalด้วยcodeunique ราคา source funding owner location custodyและหลักฐานเดิม การretryไม่ลงชิ้นใหม่ ไม่มีreceipt/orderสมมติจากชื่อผู้ขาย
4. การตรวจรับเพิ่มหลักฐานacceptedliability การเงินรับรอง/จ่ายภายหลังตามคำขอ44 ไม่ลดUหรือเพิ่มPจากกดรับของ ถ้ารับ5000แต่จ่าย2400 จำนวนคงเหลือของกับเงินค้างเป็นคนละข้อมูล

## 4 เบิกและโอนวัสดุ

เลือกbucket/หน่วย/lotที่มีสิทธิ์ ระบุผู้รับ/เหตุผล/คำอนุมัติและหลักฐานส่งมอบ เบิกโพสต์เมื่อขั้นส่งมอบครบ serverตรวจยอดที่lockไม่ยอดรายงานเก่า โอนdirectconfirmedตาม49ต้องสิทธิ์ทั้งสองคลังและปลายทางรับแล้วก่อนโพสต์คู่ต้น−/ปลาย+ ไม่เพิ่มปลายจากแค่ส่ง ถ้าต้อง in-transitยังรอpolicy/ADR

เครือข่ายขาดหลังส่งให้ตรวจผลเดิมและretrykey/payloadเดิม อย่าเปลี่ยนkeyเพื่อกดซ้ำ เมื่อยอดไม่พอหรือconflictให้ตรวจรุ่น/ยอดใหม่ ไม่แก้balanceหรือข้ามnegativeguard ประวัติผิดแก้ด้วยคำขอ/eventใหม่มีเหตุผลและหลักฐาน

## 5 ผู้ถือครอง ยืม คืนและซ่อม

ผู้ถือครองตรวจรายการที่ได้รับมอบหมาย/ชื่อและที่ตั้ง ณ วันที่ ไม่อ่านcustodyชิ้นอื่นด้วยID เจ้าของหน่วยงาน ผู้รับผิดชอบหลัก ผู้ยืม และตำแหน่งของเป็นคนละข้อมูล ยืมต้องตรวจavailability/requestreviewก่อนอนุมัติกันชิ้นและหลักฐานส่งมอบหนึ่งชิ้นไม่สองactiveclaims

คืนแล้วบันทึกของกลับและตรวจสภาพ pendinginspection/repair/damage/claimยังไม่พร้อมให้ยืม การซ่อมต้องกำหนดผู้รับผิดชอบ ช่วงเวลา ราคา/ประมาณการแยกจากจ่าย และผลตรวจปลดhold ค่าซ่อมไม่เป็นรายจ่ายงบเอง ต้องเชื่อมคำขอ44/48ที่อนุมัติเมื่อมีค่าใช้จ่ายจริง

ย้ายหรือลาออกแจ้งคำขอส่งมอบใหม่ตามimpact17/50 มีผู้รับใหม่และหลักฐาน ไม่ลบผู้ครอบครองเก่า ไม่เลือกคนรับแทน/คืนของ/ให้สิทธิ์ใหม่อัตโนมัติ ทรัพย์สินยืมค้างมีdue serverdateและประวัติให้ติดตามตามscope

## 6 ตรวจนับและจำหน่าย

เปิดcountwindowตามสิทธิ์/cutoffแล้วเก็บexpected snapshot นับจริงแยกและบันทึกเหตุผลความต่าง ผู้ตรวจ/ผู้อนุมัติคนละคน sourceเปลี่ยนหรือleaseหมดให้recount/reviewใหม่ ไม่ใช้actualcount−ยอดล่าสุดจากนับเก่า ไม่ถือว่าค้างหน้าเว็บเป็นlock ห้ามเขียนbalanceทับ

ตัวอย่างทะเบียน30นับ29 → variance−1 ต้องapprovedadjustmentหนึ่งรายการอ้างcountและหลักฐาน การตรวจassetที่อยู่ผู้ยืมให้ระบุExpectedAwayตามหลักฐาน ไม่missingโดยปริยาย ไม่หักวัสดุ/คิดเงิน/จำหน่ายเอง

ขอจำหน่ายระบุเหตุผล วิธีดำเนินการที่ยืนยันและหลักฐาน draft/ส่ง/ส่งกลับ/อนุมัติยังไม่DISPOSED ต้องตรวจdependencyยืม/ซ่อม/custody/claims ผลดำเนินการverifiedกับวันมีผลและrevisionครบก่อนสถานะมีผล อนาคตไม่แสดงว่าจำหน่ายแล้ววันนี้ รหัส ราคา แหล่งงบ ใบรับและประวัติยังอยู่ แก้คำสั่งผิดใช้คำขอใหม่ไม่delete/reusecode/คืนสิทธิ์เอง

## 7 ยกเลิก กลับรายการและงบ

ยกเลิกเฉพาะส่วนที่ยังไม่รับ/ภาระที่policyอนุญาต ผ่านผู้ตรวจและคำอนุมัติ ปลดRเฉพาะส่วนไม่ใช้ ปลดUต้องคงacceptedliability/C/claims/Pที่มีเหตุ การคืนวัสดุออกคลังต้องapprovedsourceและของยังมีจริง ไม่เป็นการคืนเงินจริงหรือกลับPอัตโนมัติ

จ่ายแล้วหรือinvoice/claimsขัดกันเปิดcorrection/refundระบบ6ตาม [FINANCE_REVERSALS](FINANCE_REVERSALS.md) source/เหตุผล/หลักฐาน/ผลกระทบครบ งวดปิดต้องขั้นเปิดงวดหรือปรับปรุงที่อนุมัติ ไม่backdate/import/jobหลบgate ไม่ใช้genericinverseคืนเงินหรือเปิดvoucherโดยไม่มีคำอนุมัติ

## 8 รายงาน กระทบยอดและแจ้งปัญหา

รายงานวัสดุแยกwarehouse/location/item/unitversion/lot ใช้ opening+receipt−issue±transfer±approvedadjustment=closing ไม่รวมหน่วยต่างกัน รายงานassetแยกavailable/loan/repair/disposed/custody-historyและasof ทุกยอดสืบsource/decision/evidenceได้ตามสิทธิ์

การเงินรายงาน A/R/U/P/C/V ตามFY/contextของตน เชื่อมreceipt/acceptance/invoiceแต่ไม่ถือstockqty/assetราคา/เงินจ่ายเป็นยอดเดียวกัน ถ้าprojectionlag/mismatchให้หยุดรับรองและแจ้งตรวจ ไม่แก้ledgerให้ตรงหน้าจอหรือใส่0ซ่อนerror

Excel/HTMLprint→SavePDFใช้manifest/pinnedname/place/unitversionsเดียวกับscreen ตรวจสิทธิ์ตอนขอ/worker/downloadอีกครั้ง Thai/Sarabun/A4/เลขอ้างอิงนำศูนย์/exactdecimalsต้องทดสอบจริง ไฟล์privateไม่public/static/cache ค่าเสื่อมยังTO VERIFY officialปิด depreciation/NBV NULLไม่0 ไม่มีExcel/PDFระบบ7ที่ผลิตแล้วในรอบนี้

แจ้งด้วยcorrelation/รุ่น/ขั้นตอน/issueผ่านช่องทางกลางที่ได้รับยืนยัน ลดข้อมูลในlog ไม่ส่งpassword/token/ข้อมูลส่วนตัว/หลักฐานเงินจริงเต็มชุด ไม่มีชื่อผู้รับหรือช่องทางจริงที่เดาในคู่มือนี้

## 9 Policy ที่ต้องยืนยันก่อนเปิดจริง

O07/O06/C02/C03ต้องยืนยันอำนาจ/วงเงิน/delegation/คลังscope/หน่วยและconversion/ราคา-ภาษี/รับเกิน-ทดแทน/lot-transit/negative policy/liability-claims/ยืม-ตรวจคืน-ซ่อม/ส่งมอบ/countgate-lease-recovery/stockadjust/disposalmethod/period-returns-refund/fieldprivacy-retention/depreciationmethod-life-residual ทุกข้อยัง TO VERIFY ไม่มีการรับรองกฎหมาย/การเงินหรือเชื่อมe-GP NBMS ธนาคาร

ทั้งคู่มือและP52-01–30เป็นขั้นตอนเตรียมตรวจรับ **NOT RUN / BLOCKED** ใช้ทดสอบเมื่อprerequisiteพร้อม ไม่เริ่มบท53จากการอ่านคู่มือนี้
