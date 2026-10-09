# Inbox outbox และงานที่ได้รับมอบหมาย — บท 55

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | source `968bb59` | **Proposal / BLOCKED — ยังไม่มี pages/server actions จริง**

อ้าง [DOCUMENT_DELIVERY](DOCUMENT_DELIVERY.md), [routing contracts](DELIVERY_ROUTING_CONTRACT.md), [workspace54](CORRESPONDENCE_WORKSPACE.md) และ [file access53](RECORD_DOCUMENT_ACCESS.md) ใช้ app shell/ตารางค้นหา/ฟอร์ม/notification/sharedAuthของส่วนกลาง ไม่สร้าง loginหรือคลังไฟล์ใหม่

## 1 เส้นทางเสนอ

| หน้าเสนอ                                     | สิ่งที่แสดงเมื่อ current policyอนุญาต                                                                       | Actionสำคัญ                                                            |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| /app/correspondence/inbox                    | หนังสือที่ endpoint snapshot/approved accessและcurrentscopeอนุญาต แสดงรุ่น/ผู้ส่ง/เวลาส่งถึง/รับทราบ/งานแยก | เปิดเรื่องและกดรับทราบแบบ explicit                                     |
| /app/correspondence/outbox                   | เรื่องที่ตนมี actionติดตามผู้ส่ง พร้อม queued/delivered/blocked/ack countsรายendpoint                       | ตรวจปัญหา/retryเดิมตามอำนาจ ไม่ส่ง intentใหม่เงียบ ๆ                   |
| /app/correspondence/dispatch/{intent_id}     | approved content/file version+recipient-plan+resolvedmembers beforeconfirm/record-history                   | ยืนยันผู้รับด้วย digest/revision server เมื่อสมาชิกเปลี่ยนต้องตรวจใหม่ |
| /app/correspondence/deliveries/{delivery_id} | private subject/body/filesเมื่อrecord/source/filecurrentrightsครบ                                           | รับทราบรุ่นนี้/เสนอ task ตามอำนาจ ไม่autoackจากGET                     |
| /app/correspondence/tasks                    | งานของตน/ผู้ใต้สายที่ได้รับมอบหมายพร้อมdue/statusและaccessavailabilityแยก                                   | มอบหมาย/ส่งมอบ/ส่งหลักฐานเสร็จ/ติดตามค้าง                              |

Routesทั้งหมด Proposal ไม่มีหน้า public trackingของข้อมูลภายใน รูปแบบUUIDที่คาดเดายากไม่เป็น authorization การเปลี่ยน delivery/task_id/recipient/org/file_version_id ต้องตรวจ DALฝั่งserverและไม่เปิด subject/bodyหรือบอกการมีเรื่องนอกสิทธิ์

## 2 ค้นหาและรายการงาน

เสนอ searchด้วยเลขทะเบียน/subjectเมื่อfieldpolicyอนุญาต/type/ปีทะเบียน/ผู้ส่งในscope/statusแต่ละมิติ/due range/record reference พร้อม boundedpagination stablecursor+sort ตามserver scope ต้องกรองสิทธิ์ก่อนcount/pagination ไม่ดึงรวมแล้วกรองในbrowser ปีทะเบียนไม่ปีงบหรือปีการศึกษา

Empty stateภาษาไทยเสนอ “ยังไม่มีหนังสือที่คุณมีสิทธิ์ดู ลองล้างตัวกรองหรือเปลี่ยนช่วงวันที่” และ “รายการนี้อยู่ระหว่างตรวจสิทธิ์ กรุณาติดตามสถานะกับผู้รับผิดชอบ” เฉพาะผู้มีสิทธิ์เห็นpending status ไม่เปิดชื่อผู้รับ/ไฟล์/เหตุผลลับให้ผู้ถูกเสนอ assignmentที่ยังไม่ได้สิทธิ์ ใช้ generic forbidden/ไม่พบตาม policy สำหรับผู้ไม่มีสิทธิ์

หน้าผู้ส่งแสดงผู้รับจริง personcode/organization/contextจากsend snapshotและผลรายendpoint เฉพาะfieldpolicyของผู้ส่ง ไม่มีเลขบัตร/เบอร์ส่วนตัว/ที่อยู่/สมาชิกทั้งองค์กรที่ไม่เกี่ยวกับเรื่อง ชื่อเหมือนให้รหัส+สังกัดต่างกัน ไม่ใช้dropdownชื่ออย่างเดียว เมื่อdirectกับgroupซ้ำendpointเดียว UIอธิบายรวมdeliveryหนึ่งรายการแต่เก็บoriginทั้งคู่ Accountเดียวหลายcontextแสดงแยกและไม่ackแทนกัน

## 3 การรับทราบและงาน

ปุ่มเสนอ “ยืนยันรับทราบหนังสือรุ่นนี้” แสดงเลขทะเบียน/รุ่น/ผู้รับcontextตามสิทธิ์และยืนยันแบบPOST บันทึกserverclock+actor; notificationใช้คำว่า “มีรายการที่ต้องตรวจสอบ”และpointerขั้นต่ำ การเปิดแจ้งเตือนแสดงเฉพาะ seenไม่เปลี่ยน badgeรับทราบ แม้กดรับทราบแล้วcurrent ACLถูกถอน การเปิดไฟล์ต้องdenyแต่historyreceiptคงอยู่ให้ผู้มีอำนาจตรวจ

หน้ามอบหมายแสดง assignee ID/Organization/context/actionที่ตรวจได้ ก่อนส่งให้ผู้มีสิทธิ์งาน ถ้าต้องreviewaccessเพิ่มให้pending_accessและไม่เปิดเนื้อหา/ไฟล์ ผู้เสนอหรือtechnicaladminอนุมัติเพิ่มสิทธิ์ตนเองไม่ได้ เมื่องาน activeแล้วก็ไม่มีลิงก์ที่ bypassfile/sourceACL ผู้รับมอบหมายสืบประวัติparent task/due/handoverตามfieldpolicyได้

งานครบกำหนดใช้servercalendar/due revisionแสดง พ.ศ. บอกdue timezoneชัด ปุ่มส่งผลงานตรวจevidencecentralFileVersion+CLEANและcompletionpolicy ไม่ใช้เวลาที่browserหรือcheckboxครบเป็นการรับรองงานสำคัญ Childtaskที่ค้างแสดงต่างจากงานparentเสร็จตามpolicy ไม่ทำให้ทุกreceiptackอัตโนมัติ

## 4 Keyboard privacy และ error

ต้องตรวจที่375/768/1024/1440 labelsภาษาไทย/semantic headings/ตารางและpagination keyboard/focusหลังconflict/live statusตามเหมาะสม ไม่ใช้สีอย่างเดียว ความหมาย queued/delivered/acknowledged/assigned/completedมีข้อความอธิบาย โหลดช้า/workerค้างแสดงการบันทึกคำสั่งสำเร็จแยกส่งถึงจริง

Form submit/ack/taskมีidempotencyและoptimistic revisionฝั่งserver ปุ่มdisabledหรือstatebrowserไม่แทนserverguard reloadกลับมาอ่านฐานไม่จำลองack localStorageไม่เก็บbody/files/recipientlistส่วนตัว ไม่มีpublic static/ISR cacheหรือnotification emailที่ส่งข้อมูลลับ นักพัฒนาต้องตรวจCSRF/current auth/GET side effect/cache/revocationบนruntimeจริง

ทุกหน้าข้างต้น/P55-01–20ยังNOT RUN ไม่มี browser/E2Eหรือactual routing/receipt/assignment/reminder ไม่ส่งข้อความหรือemailจริง และไม่เริ่ม56
