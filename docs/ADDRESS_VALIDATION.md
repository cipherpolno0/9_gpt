# ที่ตั้ง ช่องทางติดต่อ และการตรวจแหล่งข้อมูล — แบบเตรียมบท20

รุ่นเอกสาร0.1 | 4ตุลาคม2569 | sourceก่อนแก้ `ef0e27d` | **Proposal / BLOCKED — ยังไม่มี address/contact services, OrganizationLocation หรือหน้าค้นหาที่ตั้ง**

บท20ต้องผ่าน19ก่อน [ORGANIZATION_TYPES](ORGANIZATION_TYPES.md) ยังเป็นแบบเตรียม และfoundation12/ระบบบุคคล18ยังBLOCKED เอกสารนี้เป็นสัญญาพัฒนาต่อ ไม่ใช่schema/migration/API/หน้าเว็บหรือผลตรวจรับ กฎที่อยู่/รหัสไปรษณีย์/แหล่งภูมิศาสตร์/การเผยแพร่ที่ยังไม่มีหลักฐานรับรองใช้ **TO VERIFY**

## 1 แนวคิดทีละขั้น

1. ที่ตั้งจริง ที่อยู่จัดส่ง พิกัด และสายสังกัดเป็นคนละข้อมูล หน่วยงานอาจใช้ที่ตั้งร่วมแต่มีที่อยู่จัดส่งต่างกัน ไม่ใช้ที่อยู่กำหนดRoleAssignment
2. ที่อยู่และช่องทางติดต่อมีช่วงมีผลและวันบันทึก เมื่อย้ายหรือแก้ผิดให้เพิ่มrevisionพร้อมหลักฐาน ไม่เขียนทับที่อยู่บนหนังสือที่ออกแล้ว
3. มีเบอร์หรืออีเมลในทะเบียนไม่ได้แปลว่าเผยแพร่ได้ ต้องแยกช่องทางงาน/ส่วนตัวและตรวจpublication/fieldpolicyที่serverก่อนส่งDTO
4. พิกัดต้องมีหลักฐาน แหล่งอ้างอิงและระบบพิกัด ไม่เดาจากชื่อวัด/สถานศึกษา หากไม่มีตำแหน่งที่อนุญาตให้แสดง ใช้รายการข้อความแทนแผนที่
5. วันที่ตรวจสอบล่าสุดบอกเวลาตรวจและสิ่งที่ตรวจ ไม่รับรองความถูกต้องทั้งหมด ไม่ใช้วันที่เปิดดูรายการแทนverified_at

ใช้ Organization/Person/Geography/คำขอ/บัญชี/เอกสาร/auditกลางร่วม9ระบบ ตาม [BLUEPRINT](../BLUEPRINT.md), [DATA_DICTIONARY](DATA_DICTIONARY.md), [DATA_CLASSIFICATION](DATA_CLASSIFICATION.md) และ [WORKFLOW_ENGINE](WORKFLOW_ENGINE.md) หน้าติดต่อเรายังคงต้นทางกลางเดียว ไม่ทำแยกต่อโมดูล

## 2 สิ่งที่มีจริงและช่องว่าง

| ส่วน                    | core06ที่มีจริง                                                                                                                      | สิ่งที่ต้องเพิ่มภายหลัง                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| AddressVersion          | UUID/OrganizationFK, addressKindFK, addressText, GeographyFK, postalCode nullable, ช่วงวัน/recorded_at/การแทนรุ่น/DocumentmetadataFK | บริการvalidation/ค้น/fieldpolicy/sharedhostresolver/หลักฐานFileVersionและreview      |
| OrganizationContact     | หลายhistoryrowsอ้างOrganization, contactCode, channelKindFK, contactValue, isPublicEligibleค่าเริ่มfalse, timeline/evidence          | purpose WORK/PERSONAL, verification/evidence/policy, liaisonbindingและservices       |
| OrganizationLocation    | ยังไม่มีในPrisma; มีเพียงlogicalcontract04                                                                                           | historyของตำแหน่ง/พิกัด/CRS/แหล่งหลักฐานที่typedFKตรวจได้                            |
| Geography               | code/kind/label/parentGeographyFKกลาง                                                                                                | แหล่งและรุ่นที่รับรอง hierarchyจังหวัด/อำเภอ/ตำบล/รหัสไปรษณีย์และการอ้างในเอกสารเก่า |
| OrganizationNameHistory | ชื่อที่มีtimelineและหลักฐานกลาง                                                                                                      | searchชื่อเดิม/รหัส/พื้นที่ที่ตรวจscope/fieldgrantก่อนquery                          |
| review / files / UI     | แบบเอกสารบท10/11/19                                                                                                                  | ไม่มีscan/ACL/workflow/publication/บริการค้นหรือหน้าจอจริง                           |

ไม่เพิ่มAddressVersionอีกตารางหนึ่งเพื่อแทนcoreเดิม การเพิ่มfield/constraints/OrganizationLocationต้องเป็นmigrationตามADRหลังdependencyผ่าน มีUUID/FKRestrict/snake_case/RLSdeny by default ไม่ใช้ServiceActorbootstrapเป็นผู้ตรวจบัญชีหรืออนุมัติธุรกิจ

## 3 AddressVersionและภูมิศาสตร์

| ข้อมูล/กฎเสนอ                     | การตรวจที่serverเมื่อimplement                                                                                                                                 |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| organization_id / address_kind_id | resolveOrganizationจากทรัพยากรกลางและaction/scopeปัจจุบัน; type/purposeที่มีรุ่น ไม่เชื่อorg_idclientเป็นสิทธิ์                                                |
| ที่ตั้ง/จัดส่ง                    | address_kindแยกregistered/physical/mailingตามบัญชีที่เจ้าของรับรอง ไม่เอาที่ตั้งไปแทนmailingเมื่อไม่มีข้อมูล                                                   |
| address_text                      | ความยาว/อักขระ/emptyตามconfiguration แสดงแบบescapedtext ไม่รับHTML/สคริปต์; เก็บข้อความต้นทางและเหตุผลแก้ตามpurpose ไม่lograwaddress                           |
| province/district/subdistrict     | อ้างGeographycodes/IDsจากแหล่งและรุ่นที่รับรอง ตรวจkindและparentchainว่าอยู่ร่วมกัน ไม่จับคู่จากชื่อเหมือนกันหรือโยงจากสายคณะสงฆ์                              |
| geography_id                      | coreเป็นFKNOT NULL; หากระบุพื้นที่ที่รับรองไม่ได้ให้คงdraft/needsreview ไม่สร้างรหัสปลอมเพื่อให้บันทึกมีผลผ่าน                                                 |
| postal_code                       | เป็นstringเพื่อรักษาศูนย์นำหน้า nullableเมื่อยังไม่ยืนยัน ตรวจcountry/source/versionที่รับรอง ไม่เดารหัสจากตำบลหรือบังคับทุกพื้นที่/ต่างประเทศด้วยpatternเดียว |
| ช่วงเวลา                          | dateมาตรฐาน`[effective_from,effective_to)` / recorded_atเป็นinstant การแสดงพ.ศ./AsiaBangkokอยู่ชั้นUI ไม่ใช้เวลาUTCตัดวันไทย                                   |
| evidence                          | FileVersion/owner/hash/sourceชนิดที่รับรองผ่านscan/ACL ไม่ใช้Documentmetadata06แทนผลตรวจไฟล์                                                                   |

จังหวัด/อำเภอ/ตำบลอาจderiveจากGeographyที่เป็นจุดอ้างที่รับรองได้ จึงไม่สร้างข้อความพื้นที่คนละสำเนาในทุกAddressVersionโดยไม่มีเหตุผล หากมีหลายGeographyระดับที่จำเป็นให้typedFKและตรวจความสัมพันธ์ ไม่ใช้3ช่องfree textที่ขัดกันโดยไม่แสดงneedsreview

หนึ่งรหัสไปรษณีย์อาจต้องตรวจตามแหล่งข้อมูลและpurpose ไม่อ้างเท่ากับหนึ่งตำบลจากschema รหัสที่ไม่ผ่านformatหรือไม่ตรงmappingที่รับรองต้องแยก invalid / unverified / mappingconflict ไม่แก้เป็นรหัสที่ระบบเดาเอง

Geographycoreยังไม่มีtemporalhistoryของชื่อ/เขต หากชื่อ/ขอบเขตพื้นที่เปลี่ยน ไม่อ้างว่าการjoinlabelปัจจุบันให้ที่อยู่ปีเก่าที่รับรองแล้วได้ เอกสารที่ออกต้องpinrevision/แหล่งภูมิศาสตร์หรือtypedsnapshotที่จำเป็นตามpurposeและpolicy แผนเพิ่มGeographyhistoryต้องกำหนดเมื่อมีหลักฐานและmigration ไม่แก้labelทับแล้วอ้างประวัติครบ

## 4 OrganizationLocationและพิกัด

เสนอOrganizationLocationมีOrganizationFK, locationkind/purpose, GeographyFK, effectiveinterval/recorded_at/supersession, addressversion/hostrelationreferenceที่จำเป็น, latitude/longitude, coordinate_reference_system, source/evidenceFileVersion, observed_at และverificationreferences

พิกัดไม่มีหลักฐานให้ทั้งlatitude/longitudeเป็นNULL ไม่แทนด้วย0/0 การกรอกโดยผู้ร้องหรือวางpinเป็นข้อเสนอที่ยังต้องตรวจ ไม่auto-geocodeจากชื่อ/ที่อยู่เพื่อรับรองผล และไม่เรียกproviderเพื่อเติมค่าที่หายโดยปริยาย

| การตรวจเสนอ | ผลที่ต้องได้                                                                                                                       |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| คู่พิกัด    | มีทั้งคู่หรือNULLทั้งคู่ ห้ามมีเพียงlatitudeหรือlongitude                                                                          |
| CRS         | ระบุระบบพิกัด/หลักฐาน ถ้าใช้contractWGS84/EPSG:4326ต้องยืนยันแหล่งและการแปลงโดยผู้ตรวจ ไม่รับค่าระบบอื่นมาปักทันที                 |
| ค่าตัวเลข   | ตามlogical04 numeric(10,7) ปฏิเสธNaN/Infinity/สตริงผิดรูป/scaleเกิน7ก่อนcast ไม่roundเงียบๆ; latitude[-90,90], longitude[-180,180] |
| ความถูกต้อง | ผ่านboundsไม่ได้พิสูจน์ว่าตรงหน่วยงาน ต้องตรวจsource/สถานที่/วันและความแม่นยำตามpolicy ไม่เพิ่มprecisionที่แหล่งไม่ได้ให้          |
| ศูนย์       | 0เป็นค่าพิกัดได้เมื่อมีหลักฐาน ไม่ใช้falsycheckแปลว่าหาย แต่ห้ามใส่0เป็นค่าเริ่มเพื่อหลอกว่ามีตำแหน่ง                              |
| การย้าย/แก้ | เพิ่มLocationrevisionใหม่อ้างต้นทางพร้อมเหตุผล ไม่ย้ายmarkerเก่าทับหรือทำให้เอกสารเก่าอ้างตำแหน่งปัจจุบัน                          |

หลักฐานพิกัดอาจมีข้อมูลส่วนตัวหรือEXIFที่ไม่ควรเผยแพร่ ต้องตรวจไฟล์/ACL/metadataตามบท10 ไม่publishภาพหลักฐาน/ชื่อผู้ส่ง/พิกัดบ้านส่วนตัวเพราะใช้เป็นsource

## 5 ช่องทางงาน ส่วนตัว และผู้ประสานงาน

OrganizationContactต้องรองรับหลายรายการด้วยcontactCodeของช่องประวัติที่คงตัวและtimeline เช่นช่องทางสำนักงานหลายหมายเลข/อีเมล ไม่ใช้contactValueเป็นPersonIDหรือกำหนดว่าเบอร์หนึ่งมีเจ้าของได้คนเดียวทั่วระบบ Retryใช้commandreceipt/unique constraintsไม่ใช้การลบcontactซ้ำจากค่าข้อความเอง

| ส่วนเสนอ          | กฎ                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| channel_kind      | PHONE/EMAIL/ชนิดที่configurationรับรอง อ้างReferenceCodeเดิม ไม่เดาชื่อช่องทางทางการ                                                                                |
| purpose           | WORK หรือ PERSONALแยกจากchannel_kind; พนักงานรับสายไม่ได้ทำให้เบอร์ส่วนตัวกลายเป็นช่องทางองค์กรเอง                                                                  |
| contact_value     | normalizeตามcountry/ชนิด/รุ่นที่เลือกและตรวจรูปแบบ เก็บtextสำหรับแสดง escaped ห้ามข้อมูลหลายหมายเลขปนช่องเดียวจนตรวจไม่ได้                                          |
| verification      | last_verified_at, verified_by, verificationmethod/status, source/evidence, next_review_dueเมื่อpolicyกำหนด; ไม่ใช้updated_atหรือการส่งอีเมลสำเร็จเป็นหลักฐานเจ้าของ |
| public visibility | is_public_eligibleเป็นcandidateเท่านั้น ต้องWORK+หลักฐาน+publicationdecision/policy+ช่วงที่อนุญาต; PERSONALไม่ออกpublic/mapDTO                                      |
| ผู้ประสานงาน      | typedbindingไปPersonกลาง/หน้าที่และOrganizationพร้อมช่วง/หลักฐาน ตรวจPersonfieldgrant ไม่สร้างรายชื่อบุคคลอีกทะเบียนหรือcopyPersonPrivateลงcontact                  |

ถ้าPerson/liaisonbindingยังไม่ยืนยัน ให้เป็นข้อมูลเสนอที่จำกัดสิทธิ์ ไม่auto-linkด้วยชื่อ/email/เบอร์ และไม่บังคับสร้างบัญชีloginให้ผู้ประสานงานทุกคน Publicอาจใช้labelช่องทางงานที่รับรองแล้ว ไม่joinชื่อตัว/เบอร์ส่วนตัว/บัญชี/เหตุผลเปลี่ยนหน้าที่ออกไปด้วย

WORKไม่ได้อนุญาตเผยแพร่โดยตัวมันเอง และช่องทางPERSONALไม่ผ่านpublicเพียงเปลี่ยนflag หากต้องเปลี่ยนpurposeต้องตรวจหลักฐานของช่องทางสำนักงานจริงเป็นrevisionใหม่ตามpolicy ไม่ใช้คำยินยอมที่ระบบเดาแทนเกณฑ์ข้อมูลส่วนตัวไม่ออกpublic

Devใช้ชื่อDEMO/email@example.invalid ไม่สร้างเบอร์/ที่อยู่/พิกัดจริงเพื่อให้การฝึกดูสมจริง ไม่ส่งโทรศัพท์/อีเมลทดสอบออกจริง ใช้sinkตาม11

## 6 ข้อมูลสาธารณะและแผนที่

ตาม [DATA_CLASSIFICATION](DATA_CLASSIFICATION.md) name/address/contact historyของOrganizationเป็นRก่อนรับรอง ส่วนorganization_publicที่เสนอมี6ช่องเท่านั้น:

| ช่องDTOเดิม                | เงื่อนไข                                                                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| public_ref                 | publicationref ไม่ใช่rawOrganization/Person/Address/DocumentID                                                                |
| display_name_th            | namehistoryรุ่นที่รับรอง ไม่copyชื่อเดิมprivateลงsearchindexสาธารณะ                                                           |
| organization_type_label_th | labelที่รับรอง ไม่ทำให้รหัสDEMOกลายเป็นรหัสทางการ                                                                             |
| geography_label_th         | labelsจากแหล่ง/ช่วงที่รับรอง ไม่ให้สิทธิ์พื้นที่ด้วยค่านี้                                                                    |
| office_address_th          | addressสำนักงานที่ผ่านpublicationเท่านั้น ไม่มีที่อยู่ส่วนตัวของผู้ประสานงาน                                                  |
| office_channels            | เฉพาะช่องทางWORKที่รับรองและอนุญาตในช่วงนั้น nestedallowlistจำกัดkind/label/value ไม่มีPersonprivate/internalIDs/evidencekeys |

พิกัดไม่อยู่ในDTOนี้ **ยังไม่อนุญาตpubliccoordinates** หากจะมีpublicmapภายหลังต้องปรับfieldallowlist/publicationpolicyที่เจ้าของรับรองและtraceabilityก่อน อาจเสนอDTOแยกpublic_ref+คู่พิกัดที่รับรองตามpurpose ไม่ส่งOrganizationLocationทั้งmodel แล้วซ่อนprivatefieldsด้วยCSS

การอนุญาตอ่านinternalmapใช้currentaccount/action/scope/fieldgrantเช่นเดียวกับบริการที่ตั้ง Browserไม่รับhiddenlocationsในJSON/HTML/RSC/clientstate/GeoJSONเพียงเพราะไม่แสดงmarker ห้ามรั่วผ่านviewportcenter/bounds/clusters/counts/tooltips/sharelinksหรือคำขอtile/geocoderที่มีprivatecoordinates

providerภายนอกต้องมีpolicyเรื่องข้อมูลที่ส่ง/การโหลด/URL/referrer/logging/retentionที่รับรอง ไม่ส่งชื่อบุคคล/ที่อยู่/พิกัดprivateไปproviderโดยปริยาย Mapscriptต้องไม่โหลดข้อมูล private ไว้ก่อนตรวจสิทธิ์ และAPIkeysecretไม่ส่งผ่านbundle ถ้ายังไม่เลือกproviderให้ถือmapไม่พร้อมและใช้รายการข้อความ ไม่เลือกvendorหรือใส่ค่าenvจริงในบทนี้

### Fallbackและaccessibility

หน้ารายการ/รายละเอียดต้องทำงานได้โดยไม่โหลดmap แสดงชื่อหน่วยงาน/ที่อยู่/ช่องทางเฉพาะที่มีสิทธิ์และkeyboardsearch เมื่อไม่มีพิกัดที่อนุญาตให้แสดง ให้ข้อความกลางว่า“ไม่มีตำแหน่งที่อนุญาตให้แสดงบนแผนที่” ไม่แยกว่าhiddenprivateมีอยู่หรือไม่มีจริงสำหรับผู้ไม่มีfieldgrant

เมื่อproviderล่ม/timeout/JavaScriptถูกปิด ให้ยังอ่านรายการ/รายละเอียดได้ มีstatusข้อความ/ปุ่มลองใหม่เมื่อเหมาะสม ไม่หมุนloadingไม่สิ้นสุด ไม่auto-fetchพิกัดหรือส่งprivateaddressไปproviderอื่น องค์ประกอบmapเป็นตัวเลือกไม่trapkeyboard มีlabels/focusและทางเลือกข้อความที่ทำงานได้ที่375/768/1024/1440

## 7 ค้นหาและบริการที่เสนอ — ยังไม่สร้าง

| บริการ                    | สัญญา                                                                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| ค้นหน่วยงาน/ที่ตั้ง       | ชื่อปัจจุบัน/ชื่อเดิม/รหัส/พื้นที่/addresskind/dateตามgrant; หลายfilter/pagination; ตรวจscopeและfieldsก่อนquery/count/facet                     |
| รายละเอียด                | เลือกAddressVersion/Location/Contactตามeffective_dateและknown_at ไม่ใช้currentaddressกับรายการอดีต; contactหลายช่องมีpurpose/สถานะตรวจตามสิทธิ์ |
| sharedaddressresolver     | ใช้host/Organization/addresskindตาม19พร้อมevidence/ช่วงและACL ไม่copyที่อยู่วัดต่อแผนก หากmailingต่างเก็บของหน่วยนั้นอย่างมีเหตุผล              |
| publicread                | อ่านpublicationและDTOallowlistเท่านั้น ไม่อ่านprivateทั้งหมดแล้วstripภายหลัง ไม่count/searchprivateชื่อเดิมหรือcontact                          |
| export/print/download/job | actionแยก ใช้scope/fieldpolicyเดียวกับหน้าจอและตรวจปัจจุบันที่job/download Auditขั้นต่ำไม่rawชื่อค้น/address/contact/secret                     |

Geographyและที่อยู่ไม่สร้างgrantปกครอง/การศึกษาจาก19 Querydateย้อนหลังไม่ยืมสิทธิ์บัญชีในอดีต No-storeสำหรับprivateและinvalidatepublicationเมื่อwithdrawnตามนโยบายที่เลือก ไม่อ้างrevokeลิงก์signedที่ออกแล้วทันที

## 8 เสนอแก้ ตรวจสอบ และความน่าเชื่อถือ

ใช้คำขอ/workflowกลาง11 ไม่มีformengine/ทะเบียนคำขอชุดใหม่ คำขอตรึงtypedtarget, expectedrevision, current/เสนอใหม่, address/location/contactที่ระบุ, effective_date, reason, evidenceFileVersion/hash, source และruleversion ส่วนcurrentกับdraftแสดงแยกกัน

| ขั้น               | การตรวจ                                                                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| draft/submit       | actor/action/scope/bindingตามบทที่เกี่ยวข้อง validation/geography/พิกัดpurpose/completeness/scanACLผ่าน ไม่เปลี่ยนทะเบียนหรือpublicpin             |
| reviewing/returned | ผู้ตรวจที่มีอำนาจตรวจแหล่ง/ข้อขัดแย้ง ไม่ให้ผู้สร้างอนุมัติตนเอง returnedแก้เป็นrevisionใหม่ไม่ยืมapprovalเก่า                                     |
| approved           | pinpayload/evidence/ruleและdecision รอวันมีผลถ้าอนาคต ไม่เปลี่ยนsourcecredibilityจากการอนุมัติโดยไม่มีผลตรวจ                                       |
| effective          | transactionตรวจversions/currentauthority/historyoverlap/evidenceอีกครั้ง supersede/เพิ่มrevision +receipt/audit/outboxพร้อมกัน ไม่publishอัตโนมัติ |
| แก้ผิดหลังมีผล     | คำขอใหม่อ้างorigin/evidence/reason ไม่แก้auditเดิม ไม่เปลี่ยนหนังสือที่ออกแล้วหรือgrantจากการแก้ที่อยู่                                            |

เสนอsourceสถานะเช่น reported / reviewed / evidence_verified / disputed / review_due เป็นข้อมูลตรวจต่างจากworkflow_status ไม่ให้confidenceเปอร์เซ็นต์ที่เดา “ตรวจแล้ว”ต้องระบุสิ่งที่ตรวจ วิธี วันที่ และผู้ตรวจที่มีสิทธิ์ Sourceเก่าหรือproviderล่มไม่ทำให้ที่อยู่เดิมผิดหรือถูกย้ายอัตโนมัติ

แสดงreliabilityสำหรับเจ้าหน้าที่ด้วยfieldpolicy: ชนิดแหล่ง/วิธี/วันตรวจ/ข้อขัดแย้ง/วันครบตรวจ ไม่เปิดชื่อผู้ร้อง/ไฟล์/เหตุผลprivateสาธารณะ หากpublicต้องมีsummaryที่ผ่านpublicationallowlist/CMSกลางแยกจากmetadataprivate ไม่เพิ่มverified_by/evidenceURL/last_verified_atลงDTO6ช่องเดิมเอง ค่ารอบตรวจ/retention/sourcehierarchyยังTO VERIFY

## 9 ย้ายที่ตั้งและรักษาเอกสารเก่า

เมื่อย้ายมีผลวันที่D ให้สร้างrevisionที่ปิดช่วงที่อยู่เดิมแบบปลายไม่รวมและรุ่นใหม่เริ่มD พร้อมLocation/Contactที่เปลี่ยนจริงเท่านั้น ไม่เปลี่ยนสังกัดหรือช่องทางอื่นจากการย้ายโดยปริยาย เก็บฉบับความรู้เก่าตามrecorded_at/superseded_atสำหรับknown_atqueries

เอกสาร/ใบสมัคร/การจัดส่งที่ออกแล้วต้องpinname/address/Geographyหรือsource snapshotตามpurpose, hostrelationrevision, source_effective_date/recorded_at, issuedFileVersion/hashในทรัพยากรเจ้าของ ไม่renderไฟล์เก่าด้วยcurrentOrganization/address ใหม่ทุกครั้ง หากต้องแก้เอกสารให้เป็นฉบับใหม่/เหตุการณ์แก้ตามเจ้าของโมดูล ไม่เขียนทับต้นฉบับ

snapshotเพื่อพิสูจน์เอกสารเก่าเป็นสำเนาตามpurposeที่มีหลักฐาน ไม่ใช่ทะเบียนหน่วยงานอีกชุด Documentcoreที่metadata-onlyยังไม่มีissuedFileVersion/ownerbindingเหล่านี้ จึงไม่อ้างเกณฑ์เอกสารเก่าผ่านจากAddressVersionมีhistoryอย่างเดียว

การถอนสิทธิ์หรือpublicationอาจทำให้ผู้ใช้ไม่ได้รับไฟล์เก่าอีก แต่ไม่ลบหรือแก้ไฟล์/auditเพื่อซ่อนต้นทาง ต้องตรวจACLปัจจุบันทุกdownloadและเก็บตามretentionที่รับรอง

## 10 แผนตรวจรับ — ทุกกรณี NOT RUN

ใช้DEMOorganization/person/officeemailและFileVersionสมมติ ไม่มีข้อมูลคนจริง ไม่พิกัดจริงเพื่ออ้างว่าเป็นวัดจริง ต้องมีnativePG/authz/files/workflow/services19/20ก่อนเริ่ม ไม่มีtestentrypoint20ในrepositoryปัจจุบัน

| รหัส   | กรณี                                                                                 | ผลที่ต้องพิสูจน์                                                                                      |
| ------ | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| P20-01 | country/postal/Geographykind-parent mismatch/unknownsource                           | rejectหรือneedsreviewตามrule ไม่มีเดารหัส/สร้างGeoปลอมเพื่อบันทึกeffective                            |
| P20-02 | ค้นชื่อเดิม/รหัส/จังหวัดอำเภอตำบล/หลายfilters/date/pagination                        | พบOrganizationเดิมในscope; publichiddenname/contactไม่รั่วผ่านcount/facets                            |
| P20-03 | พิกัดNULL/ครึ่งคู่/NaN/Infinity/bounds/scale/CRS/sourceไม่ผ่าน                       | validationfailหรือdraft คู่NULLใช้ได้ ไม่มีdefault0หรือnamegeocoding                                  |
| P20-04 | publicDTO/map/GeoJSON/cluster/viewport/HTML/RSC/static/cache/providerrequests        | ไม่มีPersonprivate/เบอร์ส่วนตัว/addressprivate/evidence/พิกัดที่ไม่มีpublication ไม่ถือflagเป็นสิทธิ์ |
| P20-05 | Contactหลายช่องWORK/PERSONAL/liaisonrole/verify_due                                  | purpose/fieldACLตรง latestcheckไม่เท่ากับupdated_at ไม่copyPersonPrivateไปpublic                      |
| P20-06 | ข้ามorg/hostด้วยURL ID body query include cursor export/job/filekey                  | denycurrentscope/fieldgrant ไม่มีข้อมูลจากsharedaddresshostที่ไม่มีสิทธิ์                             |
| P20-07 | draft/returned/resubmit/approve/effective/makerchecker/staleversions/evidencepending | ก่อนeffectiveทะเบียน/publicไม่เปลี่ยน หลักฐานไม่ผ่าน/รุ่นเก่า/ผู้สร้างapproveตนdeny/conflict          |
| P20-08 | ย้ายที่ตั้ง/เปลี่ยนGeoชื่อ แล้วอ่านissueddocumentปีเก่า                              | pinnedaddress/name/source/FileVersionhashเดิมยังตรง ไม่renderเก่าด้วยaddressปัจจุบัน                  |
| P20-09 | queryknown_atก่อน/หลังแก้ย้อนหลัง/อนาคตและวันไทยใกล้เที่ยงคืน                        | revision/หลักฐานตามเวลารับรู้ plannedไม่current UIพ.ศ./storedCE                                       |
| P20-10 | sharedhostหลายหน่วยเรียน/mailaddressต่าง/contactไม่เปลี่ยน                           | ต้นทางเดียวไม่copy เปลี่ยนเฉพาะpurposeที่อนุมัติ ไม่ย้ายสังกัดหรือเพิ่มgrantจากaddress                |
| P20-11 | retry/concurrenteffective/correction/crashก่อนหลังcommit                             | receipts/revisions/audit/outboxผลไม่ซ้ำ rollbackครบ originยังตรวจได้                                  |
| P20-12 | ไม่มีพิกัด/providertimeout/JSdisabled/keyboard4viewport/empty                        | textlist/detailยังใช้งานได้ statusไม่เปิดhiddenlocation ไม่มีkeyboardtrap                             |
| P20-13 | withdrawpublication/revokeบัญชี/grantก่อนexportjob/download                          | publicdelivery/cacheตามwithdrawpolicy private/jobdenycurrent ไม่มีsignedlinkinstantrevokeclaim        |
| P20-14 | sourcecredibility/logs/minimization/EXIFหลักฐาน                                      | ไม่เก็บrawsearch/contact/address/tokenในauditlog ไม่ส่งprivatefile/sourceไปpublic/provider            |

unitdatehelpers/WASM/403starterจากบทก่อนหรือเอกสารนี้ไม่พิสูจน์publicmap/privacy/issuedsnapshot/SearchAPIจริง ไม่ระบุPASSของP20ใด

## 11 Gate/versions/คำถามค้าง

app/schema0.6.0 Prisma7.10.0 core19models/213scalarfields/migration1 SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่เปลี่ยน ไม่มีOrganizationLocationหรือservices/migration/seed20 Sourceef0e27dยังมีorganizationsREADME-only บท19และDB-06/Q027ยังBLOCKEDตามเอกสารก่อนหน้า

Q002/Q024ต้องGeographysource/version/hierarchy/country-postal/ที่อยู่ร่วม/CRSและsourcevalidation; Q005/Q006ต้องผู้ตรวจ/อำนาจ/historycorrection; Q008/Q025ต้องofficecontactpurpose/publicmapallowlist/providerdata/sourcebadge/retention; Q016ต้องเอกสารเก่าและsnapshotretention; Q023/Q011ต้องscope/session/RLS/transaction/worker/cacheจริง Q018/Q019/Q021ยังต้องlist/mapfallback/keyboard4viewportบนเว็บจริง ไม่เดากฎทางการ/ข้อมูลบุคคล/พิกัด

ขั้นต่อไปปิดDB-06→foundation06–12→13–17→ตรวจรับ18→implementation/ตรวจรับ19ก่อนservices/UI20 มีแผนและการอนุมัติตาม [00_MASTER_PROMPT](../00_MASTER_PROMPT.md) ข้อ2เมื่อเริ่มโค้ดจริง ไม่เลื่อนไป21จากผลเอกสาร ไม่ขออนุมัติแผน07เดิมซ้ำ
