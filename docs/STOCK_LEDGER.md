# Ledger วัสดุ รับเข้า เบิกและโอน — บท 49

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | source `2a5b70f` | **Proposal / BLOCKED — ไม่มี stock services/Prisma/migrations จริง**

บท48ยังBLOCKED core19modelsไม่มีorder/receipt/inspection/stock/currentAuthDAL/files/workflow/outboxธุรกิจ db:testรอบ49exit1 nativePostgreSQL/Dockerไม่พร้อม ทำสัญญาและ [stock-49-plan](fixtures/stock-49-plan.json) เท่านั้น ไม่seed/สร้างstock/สิทธิ์/engineทดแทน ขอบเขตบริการรับตรวจอ่าน [GOODS_RECEIPT_INSPECTION](GOODS_RECEIPT_INSPECTION.md) และหน้า/แผนตรวจอ่าน [STOCK_MOVEMENT_WORKSPACE](STOCK_MOVEMENT_WORKSPACE.md)

## 1 Ledger เป็นแหล่งจริง

StockMovement/StockMovementLineที่โพสต์แล้วเป็นimmutable events ตรึงitem/unit definition/conversion/warehouse/location/lot/source/evidence/decision/effective_on/recorded_at/actor/correlation/receipt ยอดวัสดุ = sum signed quantity_deltaในcontextเดียวกัน ไม่มีเริ่มยอดจากclientหรือmanual overwrite projection ไม่มีค่าคงเหลือจากฟอร์มเป็นแหล่งจริง

StockBalanceเป็นprojectionและจุดlockที่ต้องreconcileกับledger/ต้นเรื่อง มีidentity tuple `(warehouse, location, item, unit_definition_version, lot)`/row_version/watermark หากไม่มีrowต้องสร้างprojection identityอย่างปลอดภัยโดย unique+upsert/identitylock แล้วlockแถวก่อนใช้; การ SELECT FOR UPDATE ที่ไม่พบแถวไม่เป็นการlockยอด0เพื่อกันinsertแข่ง ไม่สร้างreceiptหรือstockopeningeventจากการสร้างprojection row

lot=NULLหมายถึงpolicyไม่ติดตามlot ไม่เป็นlotปลอมหรือทำให้keyซ้ำได้ ADRต้องเลือกNULLS NOT DISTINCTหรือcanonicalnonnullableidentityที่เหมาะกับPostgreSQLจริง ต้องไม่ให้nullablekeyสร้างหลายbalance rowsของbucketเดียวกัน การรวมต่างwarehouse/location/unit/lotต้องแสดงdimensionและconversionversion ไม่sumชิ้นกับกิโลกรัม

projectionต้องfinite/nonnegativeและตรงledger ณ committedmanifest/watermarkเดียวกัน ถ้าmissing/mismatchหยุดposting/แจ้งตรวจ ไม่แก้ledgerตามprojectionหรือใส่0เพื่อซ่อนความต่าง Controlled rebuildต้องพื้นที่แยก/sourcehash/auditและapprovedrecovery ไม่ลบpostedhistory

## 2 Movement types และ source invariants

| Typeเสนอ                       | Quantity legs                  | ต้นทางและเงื่อนไข                                                                                    |
| ------------------------------ | ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| ACCEPT_RECEIPT                 | +accepted ไปปลายทางที่ตรวจแล้ว | Inspectionapproved/linebound/orderremaining/CLEANevidence; pending/rejectedไม่เป็นavailable          |
| ISSUE                          | -issued จากsourcebucket        | approvedIssueRequest/currentscope/remaining/physicalhandover/available; approvalอย่างเดียวไม่ลดstock |
| TRANSFER                       | -from และ +toในmovementเดียว   | สองคลัง/locationมีสิทธิ์, item/unit/lotเดียว, acceptedhandoverทั้งสองฝั่ง, net0; ห้ามhalftransfer    |
| RETURN_ACCEPTED_TO_SUPPLIER    | -returned จากbucketที่ยังมีของ | approvedreturnอ้างacceptedreceipt/remaining/lot/lineage/dependencies; ไม่คืนของที่เบิกไปแล้วโดยเดา   |
| APPROVED_CORRECTION / REVERSAL | typedlegsที่policyรับรอง       | คำขอใหม่/reason/evidence/original refs; dependencyและnonnegativeguards ไม่ให้clientส่งinverseอิสระ   |

การคืนของที่ยังไม่ผ่านตรวจ/rejectedก่อนรับ ไม่เคยเพิ่มavailable จึงไม่มีstockOUTจากavailable การแก้quantityหลังpostedเพิ่มversion/eventใหม่ เก็บoriginalไม่deleteหรือrewrite source ส่วนstocktake/loan/asset-disposalไม่ทำล่วงหน้าใน49

Transfersบท49เสนอmodedirectconfirmedhandover: ร่าง/อนุมัติยังไม่ย้ายstock ต้องมีphysicalhandover/ปลายทางตรวจแล้วจึงpostคู่ atomic หากนโยบายต้องส่งก่อนถึง ต้องADR transitbucket/two-stageevents/dedupe/รับไม่ครบก่อนเปิดmodeนั้น ไม่เพิ่มavailableปลายทางตั้งแต่dispatchหรือใช้คลังปลอมเป็นtransit

## 3 Locking, retry และ current authority

ทุกwriterต้องsharedprotocolเดียว: applicableperiod/context gates → financebalance/reservation/obligationเมื่อเกี่ยวข้อง → order/source lines → stock balance identitiesตามcanonicalorder → operationreceipt/workflow recordsตามADR รวม48cancellation/44payment/return/worker/import ห้ามอีกwriterล็อกstockแล้วค่อยorderกลับลำดับ

หลังlockต้องreloadsource/orderrevision/approvedhash/inspection/evidence/account/grants/assignmentและremainingจริง คำนวณqtyจากserver exactstrings/NUMERIC20,6/unitprecision47 ตรวจrange/scale/finiteก่อนcast Nonnegative defaultdeny; policyอนุญาตพิเศษต้องversion/authority/evidenceที่ยืนยันและไม่เปิดจากclient ในDEMOนี้ไม่มีnegative-stockmode

เลือกrowlockingหรือSERIALIZABLEพร้อมfull transaction boundedretry/recordSQLSTATEตามADR ไม่countthenwrite/sleepเพื่อกันrace Uniqueactor-action-key/hash receiptกับ businessoperation binding เช่น inspectionacceptanceversion/issuefulfilmentslot/transferapprovedversion ป้องกันnewkey/newrevisionหลบduplicate Source remainingต้องรวมทุกoperationที่มีผล

samekey/hashคืนreceiptเดิมเมื่อcurrentreadยังอนุญาต newhashconflict/newkeysamebusinessoperationdeny Workerอ่านcurrentgrantsที่เริ่มและก่อนapply ไม่ถือServiceActorหรือservicecredentialเป็นอำนาจธุรกิจ เทคนิค/makerห้ามapproveงานสำคัญของตน สองคลังต้องตรวจscopeทั้งsourceและdestinationจากserver ไม่มีgrantจากwarehouse_idที่clientส่ง

Txnเดียวรักษาsourceversions/inspectiondecision/stockmovement/projection/orderfulfilment/financialacceptanceref/receipt/audit/outbox หากfailก่อนcommit rollbackทุกส่วน ถ้าcommitแล้วresponseหาย retryอ่านผลเดิมไม่postซ้ำ outboxแจ้งผลใช้durableinbox/devsinkdedupe/boundedretry/deadletterของ11 ไม่exactly-onceclaimปลายทางที่ไม่มีprotocolรองรับ

## 4 ตัวอย่างสมมติและงานแข่ง

Orderวัสดุ6ชิ้น ผูกพัน6000.00ก่อนรับ: ส่ง4 ตรวจผ่าน3 ปฏิเสธ1 → stockA3/netaccepted3/orderremaining3; U6000/P0 ไม่เปลี่ยน รับผ่านเพิ่ม3 → stockA6/netaccepted6; คืนของที่ผ่านแล้ว1ตามapprovedreplacementpolicy → A5/netaccepted5/remaining1; รับทดแทน1 → A6/netaccepted6 เบิก2→A4 โอน3→A1/B3 เบิกB1→A1/B2 คงเหลือรวม3ชิ้นและเงินยังU6000/P0 ทั้งหมดreferenceไม่executeหรือpolicyจริง

เมื่อAเหลือ1และสองconnectionเบิก1พร้อมกัน ต้องหนึ่งสำเร็จอีกหนึ่งinsufficient/conflict มีmovement/receiptชุดเดียวและA0 ใช้nativePostgreSQL+barrierและตรวจฐานจากอีกconnectionหลังcommit ไม่ใช้การloopเลขfixtureพิสูจน์concurrency

Projection/historyรายงานใช้effective DATEกับrecorded TIMESTAMPTZ แสดงพ.ศ./Asia/Bangkok pinmanifest/units/sourceversions ไม่แสดงfuturepostingเป็นcurrentก่อนวันจริง Backdate/correctionต้องverifiedpolicyและreconcileผลกระทบ ไม่ใช้รายงานย้อนหลังอนุมัติavailableปัจจุบัน

## 5 หลักฐาน schema และข้อจำกัด

logical04มีgoods_receipt/lines/stock_movement/linesอยู่แล้ว ต้องreconcileadditionalInspection/IssueRequest/Transfer/StockBalance/optionalLotกับtypedguardsของ47/48ผ่านADR ไม่สร้างstock engineหรือฐานแยก ไม่มีnativeFK/unique/RLS/lockingproofใน49 ยังpackage/schema0.6.0 core19models/213scalarfields migrationเดียว20261003130000_core_foundation SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756`

แหล่งเทคนิคใช้ออกแบบเท่านั้น: [PostgreSQL18 row locks](https://www.postgresql.org/docs/18/explicit-locking.html) ระบุlockแถวที่SELECTพบ; [constraints](https://www.postgresql.org/docs/18/ddl-constraints.html) สำหรับunique/NULL/compositeFK ไม่เป็นผลทดสอบledgerของแอป

ทุกP49-01–20 **NOT RUN** ทั้งสองเกณฑ์BLOCKED ต้อง48/ส่วนกลาง/ADR/models/migration/nativeDB/currentDAL/files/workers/UIจริงก่อนexecute ไม่เริ่ม50
