# สัญญาค้นผลสอบสาธารณะและ private view — บท 39

รุ่น 0.1 | 5 ตุลาคม 2569 (2026-10-05) | source `cffcf98` | **Proposal / BLOCKED — ไม่มีหน้า/route/DAL/search/export จริง**

## 1 เส้นทางและ query

ต่อ UC-S05-03 / REQ-S05 ใน [REQUIREMENTS](REQUIREMENTS.md) และ [RESULT_PUBLICATION_POLICY](RESULT_PUBLICATION_POLICY.md) เสนอหน้า `/exams/results` กับบริการ `public_result_service.search_by_year` ในโมดูลexamsเดิม เส้นทาง private `/app/exams/results` ต้อง Auth08/DAL07จริง bootstrap403ปัจจุบันยังไม่ใช่ private view ใช้ Person/Organization/AcademicYear/ExamSession/FormTemplateRegistry ร่วม05/09 ไม่มีpublicฐานข้อมูลหรือloginใหม่

| Input | Validation ฝั่ง server และแหล่งค้น |
| --- | --- |
| academic_year_id / ปี พ.ศ.บนUI | ต้องเลือกปีเดียวชัดเจน mapกับ AcademicYearกลาง ไม่เชื่อyear labelที่clientส่งหรือใช้ fiscal year |
| exam_type / exam_level / stage | ตรวจ typed context/filter ที่ policy อนุญาต ไม่สับสนช่วงชั้นกับระดับ และไม่ผสมปี/ประเภทที่ห้าม |
| name | ค้นเฉพาะ display_name_snapshotที่อนุญาตของปีนั้น normalize/จำกัดความยาว ไม่joinชื่อปัจจุบันหรือชื่อเดิมภายในเพื่อเปิดประวัติที่ยังไม่เผยแพร่ |
| organization / สำนัก/สถานศึกษา | ค้นรหัสอ้างอิงหรือชื่อsnapshotที่อนุญาต ไม่คืน private organization/contact graph และไม่ใช้ org_id เป็นgrant |
| cursor / page_size | server cap/opaque signed cursor ผูก normalizedquery/year/policy/series epoch/order/expiry ปฏิเสธ cursorข้ามบริบท/หมดอายุ |
| fields / private / arbitrarysort / wildcard | ปฏิเสธการขยายฟิลด์/SQL/เส้นทางยกสิทธิ์ ไม่allow unbounded offset/dump/เลือกsource tableเอง |

pipeline **Q39-01–06**: validate → shared rate budget → live public eligibility (เวลาของserver/current policy/epoch) → filter approved snapshots → stable bounded pagination → serialize allowlistเท่านั้น กรองก่อนcount/page ไม่คืนจำนวนหรือfacetของ draft/withdrawn/พื้นที่ที่ไม่ได้เผยแพร่ ต้องทำ eligibilityกับทุกผลที่อ่านจาก search indexด้วย ห้ามคืน raw index hitก่อนตรวจ

ผลเสนอ: 200 `{items, next_cursor, publication_context}` เฉพาะข้อมูลที่ผ่านpolicy; ปีไม่มีreleaseคืนitemsว่าง ไม่บอกว่ามีdraftกี่คน; 422safe field errors; 429พร้อมRetry-Afterเมื่อbudgetหมด; 503เมื่อguard/rate store/current policyอ่านไม่ได้ ข้อความและlogไม่สะท้อนrawชื่อ/privatepayload ทั้ง name, autocomplete, facet, metadata, embedded JSON และช่อง downloadต้องใช้กฎเดียวกัน

## 2 จำกัดปริมาณและการไล่ดึง

ค่าทดลองเสนอ **ไม่ใช่กฎทางการ/ยังไม่รัน**: page_size default10/max20, queryยาวไม่เกิน100 Unicode codepoints, ไม่รับ wildcard/ไม่มีปี, cursor TTL5นาที, session search budget60ผลต่อชุดqueryและ10คำขอต่อนาที/100ต่อวัน ใช้ aggregate budgetข้ามqueryเพื่อไม่ให้เปลี่ยนชื่อหรือcursorแล้วรีเซ็ตจำนวนทั้งหมด Q014ให้เจ้าของยืนยันตัวเลข/การค้นชื่อสั้น/ค้นไม่ระบุชื่อ/การเปิดรายชื่อก่อนใช้จริง หากไม่อนุมัติ browseรายชื่อให้บังคับตัวกรองที่เจาะจง ห้ามนำตัวเลขตัวอย่างไปอ้างว่าป้องกัน scrapingได้ทั้งหมด

rate limiterต้องshared store across replicas ไม่ใช้Mapในprocessอย่างเดียว ตรวจ trusted proxy chainก่อนรับIP/header; client X-Forwarded-Forไม่ใช่trustedidentity รวมระดับanonymous session/network/query window และ systemwidebudget เครือข่ายร่วม/IPv6/ผู้พิการต้องประเมินก่อนรับรอง outageต้องfail closedพร้อมข้อความลองใหม่ ไม่fallbackเป็นunlimited ใช้ข้อมูลลดรูป/อายุเก็บที่รับรอง ไม่logชื่อผู้ค้นเต็มชุดหรือเก็บraw IPเกินpurpose คำขอpublicแบบอ่านไม่สร้าง business mutation แต่metricsควรมี safe outcome/category/latency/correlationที่ไม่ผูกPIIเต็มชุด

ไม่เปิด bulk public export เป็นค่าเริ่มต้น แม้ approved publicationก็ไม่ให้ P07 exportอัตโนมัติ หากเจ้าของอนุมัติpublic exportภายหลัง ต้องใช้ approved fields/ชุด/limit/purposeเดียวกัน ตรวจ live releaseและpolicy ณ สร้างและดาวน์โหลด ไม่ส่ง full roster/private scoresผ่านโหมด“print”แทนbulk API รูปแบบ ศ.4/ศ.8ทางการยังBLOCKEDตาม registry

## 3 HTML, cache, index และไฟล์

baseline implementationเสนอเป็น dynamic/no-store สำหรับผลรายคนทุก public/private success/error/API/HTML/RSC/metadata/download: ห้าม build/static generationเก็บผล, CDN body caching, service worker offline cache, public folder artifacts หรือ unguarded persisted search cache สินทรัพย์ UI/ฟอนต์แยกcacheได้ตามปกติ ไม่ใช้แค่headerเพื่ออ้างว่าprivate dataปลอดภัย ต้องตรวจ Next data/full route/router/prefetch/CDN/index/exportsทุกชั้นจริง

หากภายหลังจำเป็นต้องcache approvedprojection ให้keyมี year/context/release version/policy version/visibility epoch และแยกpublicจากprivateuser/scope ตรวจlive eligibilityทุก requestก่อนส่งcached body; stale index/artifact/cursorให้denyเมื่อepochเปลี่ยน ลบหรือinvalidatetag/path/index/CDN/artifactผ่านoutbox retry/dedupe การล้างล้มเหลวไม่ให้ข้ามgate ใช้รายละเอียด [RESULT_RELEASE_RECOVERY](RESULT_RELEASE_RECOVERY.md)

อ่านเอกสารที่ติดตั้ง Next16.3.8 จริง: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidateTag.md` ระบุ profile `max` ใช้ stale-while-revalidate จึงไม่ใช้เป็นข้อพิสูจน์การปิดผลทันที API invalidationไม่แทนlive authorization และยังไม่มีคำสั่งใดถูกติดตั้ง/ทดสอบในบทนี้ ADR implementationต้องตรวจdocsของรุ่นที่ใช้ก่อนเลือกconfigurationจริง

public result PDF/Excelหรือ signed URLที่เคยส่งแล้วเรียกคืนbytesจากผู้รับไม่ได้ หากต้องเพิกถอนการอ่านครั้งถัดไปทันที ต้องprivate storage + gatewayตรวจ current visibility/ACLทุกครั้งแทนpublic objectURL ลิงก์signedที่ออกแล้วมีความเสี่ยงจนหมดTTLตามระบบ10 ไม่กล่าวว่าถอนได้ทันที ห้ามผู้ใช้ส่งobjectkeyแล้วอ่านstorageโดยตรง

หลังcommitถอนเผยแพร่ requestใหม่จากorigin/gatewayต้องไม่คืนรุ่นนั้น แม้outbox/jobแจ้งเตือนล่าช้า การเชื่อมต่อ/responseที่อนุญาตก่อนcommitหรือข้อมูลที่โหลดไปแล้วต้องกำหนดขอบเขตให้ชัด ไม่อ้างว่าลบจากbrowser/CDNภายนอก/สำเนาดาวน์โหลดทั่วโลกได้ ต้องปิดprefetchเก็บผลและให้หน้าrefreshสถานะเมื่อกลับเข้าหน้าเพื่อจำกัดการแสดงรุ่นเก่าตามความสามารถที่ทดสอบได้

## 4 ข้อมูลภายในและหน้าค้นหา

owner viewตรวจUser–Person linkที่ยืนยัน08 ไม่รับperson_idจากclientเพื่อบอกว่าตนเอง เจ้าหน้าที่ต้องcurrentaccount/read action/resource/scope/assignment window/fieldpurpose07 ทุก Route Handler, Server Action, data service, export/downloadและworker ตรวจใหม่ไม่trust UI role ข้ามscopeคืนsafe404 ไม่เผยว่าคน/ผลมีอยู่ ใช้DTOภายในแยกและno-store; private viewอาจอ่านdraftได้เฉพาะgrantที่ระบุ ไม่fallbackpublic endpointให้privatefieldsโดยอัตโนมัติ

ตัวอย่าง DTO publicเป็น allowlist ที่เสนอเท่านั้น ไม่ใช่ของที่เปิดใช้งานแล้ว: year/type/level/stage + display_name_snapshot/organization_name_snapshot/outcome_snapshotที่policyอนุมัติ + public releaseversion/source notice ห้ามเพิ่มgrade/DOB/privatefile/link/raw source IDs รายงานเด็กหรือกลุ่มเล็กและสถิติรวมต้องpolicyแยก ไม่ใช้ countแสดงประวัติที่policyไม่ยอมเผยแพร่

UIที่จะทำเมื่อprerequisiteผ่าน: labelภาษาไทยทุกinput, แยกเลือกปี/ประเภท/ระดับ/ช่วงชั้น, native keyboard form, live statusผลค้นไม่ใช้สีอย่างเดียว, loading/error/emptyที่บอกให้ตรวจปี/สะกดชื่อ/ลดตัวกรอง ไม่ส่งรหัสผลที่ซ่อนในHTML/prefetch จัดpaginationfocusไม่กระโดดทับผู้พิมพ์ไทย ทดสอบ375/768/1024/1440จริงตามP39-16 ขณะนี้ไม่มีหน้าเว็บหรือbrowser evidence
