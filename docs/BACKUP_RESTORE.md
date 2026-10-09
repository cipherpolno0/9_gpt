# สำรองและซ้อมกู้คืนข้อมูลกลาง

รุ่น 0.1 | บท71 | 9 ตุลาคม 2569 | RESTORE_DRILL_NOT_RUN

ยังไม่มี backup ที่สร้างหรือ restore ในรอบนี้ ไม่มี PostgreSQL/pg_dump/pg_restore/object storage/identity providerสำหรับ drill ข้อมูลและเวลาจริงว่างทั้งหมด ดู [ผลจริง](../tests/results/lesson71-results.json) และ [environment plan](../deploy/environments.plan.json) ไม่ใช้ SQL/WASM tests เป็นหลักฐานกู้คืนฐานจริง

## 1 เป้าหมายที่เสนอและผู้ตัดสิน

| ตัวชี้วัด           | เป้าหมายเสนอ                               | ค่าที่พิสูจน์จริง | ผู้รับผิดชอบเสนอ         |
| ------------------- | ------------------------------------------ | ----------------- | ------------------------ |
| RPO                 | 24 ชั่วโมง / 86400 วินาที                  | ยังไม่มี / null   | C01+C02 และ ownersข้อมูล |
| RTO                 | 4 ชั่วโมง / 14400 วินาที                   | ยังไม่มี / null   | C02+C03 และ ownersข้อมูล |
| ช่วงสมัคร/ประกาศสอบ | ทบทวนให้เข้มขึ้นตามความเสียหายที่ยอมรับได้ | ยังไม่ยืนยัน      | O05+O09+C01              |

RPOวัดระหว่างเวลาอ้างอิงเหตุขัดข้องกับ consistent cutoffล่าสุดที่พิสูจน์ว่ากู้คืน DB+file versions+keys+identityได้ ไม่ใช้เวลาจบ backupjobแทน RTOวัดตั้งแต่ประกาศเริ่ม recovery/drillถึงผ่านการตรวจใช้งานและ reconciliation ตาม scopeที่ตกลง ระบุ detection delayแยกด้วย ค่าเป้าหมายเป็นข้อเสนอ เจ้าของงานยังไม่ได้รับรอง ไม่เป็น SLAหรือรับรองกฎระเบียบ

## 2 ชุดสำรองที่สัมพันธ์กัน

1. DB snapshot/dump ต้องมี schema migration checksum, rules/templates/policies, immutable events/ledger, references, ACL/scan metadata, audit, assignments/effective dates, outbox/inbox/dedup watermarks และ backup cutoff
2. สำรอง bytes ของทุก Document/FileVersionที่ต้องเก็บ พร้อม key, object version, size, content hash, scan state, retention/hold references ข้อมูลไฟล์บางส่วนยังไม่มี schemaจริง จึงต้องทำ inventoryเมื่อบริการกลางพร้อม ไม่อ้างว่า19coremodelsครอบทุกอย่าง
3. เก็บ key identifiers/version และสิทธิ์เรียกคืนใน key managerแยก ไม่เก็บ private key/token/plaintext secretในแอป Gitหรือ manifest ความสูญหายของ keyทำให้ encrypted backupใช้ไม่ได้แม้ dumpยังอยู่
4. บัญชีและ identity รวม owner-approved provider backup/export references, test identities, central Person links และ access assignments สำรอง PostgreSQLอย่างเดียวไม่พิสูจน์ login/OIDCหรือกุญแจของ providerกู้คืนได้
5. Manifest privateที่ตรวจสิทธิ์/scan ระบุ backup_id, environment, commit, database checksum, migration checksums, consistent_cutoff_at, file inventory digest, object version mapping, identity backup ref, encryption key refs, outbox watermark, retention/hold และ drill evidence ไม่ใส่ชื่อเต็มหรือ credentialsใน artifact CI

pg_dumpเป็น snapshotของฐานที่ dump แต่ไม่ครอบคลุม rolesระดับ clusterหรือ external objectsทั้งหมด ต้องบันทึก grants/configที่จำเป็นด้วย วิธีเก็บและคืน provider-managed rolesต้องยืนยัน ไม่ใช้ pg_dumpallกับ providerโดยไม่ตรวจ scope เอกสาร Supabase ระบุว่า database backupไม่รวม Storage object bytes จึงต้องจัด backupไฟล์อีกส่วน และทดสอบความสอดคล้องก่อนถือว่าชุดสำรองใช้ได้

## 3 ขั้นตอนสร้าง backup ที่ต้องดำเนินการเมื่อบริการพร้อม

1. C02เลือก synthetic source environmentและที่เก็บแยก ตรวจ owner/retention/hold และ grantของ backup account ว่าอ่านข้อมูลครบโดยไม่ตกหล่นจาก RLS ห้ามให้ roleนี้แก่ web หรือ userทั่วไป
2. ใช้ backup cut ที่ตกลง: quiesce writesช่วงสั้นและ drain/mark transactions หรือใช้ immutable object versionsกับ DB consistent snapshot พร้อม highwatermarkที่พิสูจน์ได้ ถ้ายังไม่มี coordination protocol ห้ามอ้าง atomic DB+files
3. ใช้เครื่องมือ/provider APIที่ยืนยันกับ PostgreSQLmajorเดียวกัน เก็บ encrypted database archiveใน private destinationตรวจ checksum บันทึก start/end/cutoff/commit/schema; credentialsผ่าน protected secret managerหรือไฟล์ pgpassนอก repoที่สิทธิ์0600 ไม่ใส่ URL/passwordใน commandline/log
4. Copy/backup versioned objectsตาม DB manifestพร้อม byteschecksum ไม่ถือการสำรอง metadataอย่างเดียวเป็น file backup ตรวจ source missing/orphansและ holdก่อน lifecycle cleanup
5. บันทึก identity/key-manager backup referencesและทดสอบสิทธิ์ restore ป้องกัน backuproleลบหลักฐานย้อนหลังตามนโยบายที่เจ้าของรับรอง แยกบัญชี restoreจากบัญชีสำรอง
6. ตรวจ integrityใน isolated targetก่อน mark backupว่า VERIFIED_RECOVERABLE งานที่มี dumpแต่ไม่มี verifiedfiles/keys/identityคงสถานะ INCOMPLETE และต้องแจ้งผู้รับผิดชอบที่แต่งตั้งแล้ว ไม่ส่งข้อความจริงอัตโนมัติในบทนี้

ยังไม่มี script/provider adapterหรือ backup scheduleที่ deployแล้ว คำสั่ง local databaseของบท06ไม่มี backup/restore action ห้ามใช้ db:test/db:seed/resetเพื่อแทน drill หรือรันกับ production

## 4 Restore drill ไปพื้นที่แยก

1. เปิด incident/drill recordพร้อมเวลา UTCเริ่ม ผู้ปฏิบัติ scopeและ authorized target DB/bucket/Redisnamespace/identity realmใหม่ ห้าม restoreทับ sourceหรือ reuse productioncredentials ส่งอีเมล/webhooks/signing/การเงินจริงต้องปิดใน target
2. ตรวจ manifestchecksum/migration/keys/ครบทุกobjectversionและ consistent cutoffก่อนเริ่ม Restore DB+roles/grantsตาม providerที่ยืนยัน ต้อง fail เมื่อ ownershipหรือ policiesคืนไม่ครบ ไม่เพียงนับว่าคำสั่ง pg_restore exit0
3. Restore objectbytes พร้อมตรวจ hash/size/MIME และ metadata/version links หาก targetproviderเปลี่ยน objectversion/key ให้เก็บ explicit mapping `source_file_version_id/source_key/source_object_version → restored_key/restored_object_version` คง centralFileVersion identity ไม่สร้าง Documentซ้ำหรือตั้ง publicเพื่อแก้ปัญหาอ่านไม่ได้
4. Restore test identity relationshipsและ grantsตามวันที่ใน isolated realm ตรวจ sessionrevoke/newtestlogin ไม่คัดลอก productiontokensให้ใช้ได้ใน drill Workerใช้ currentauthorityตรวจทุกhandler ไม่ใช้ superuserเพื่อทำให้ testsผ่าน
5. Recovery outbox/inbox dedup checkpointsผูก event/correlationเดิม ทดสอบ duplicate/reorder/restartใน targetโดยปิด externaldelivery ไม่เปิด replayอัตโนมัติไปผู้รับจริง
6. ตรวจรายการด้านล่างจาก sourceที่สำรองและ targetโดย queryเป็นอิสระกับ projectionพร้อม checksum/reference evidence จบ clockเมื่อ validationครบ บันทึก residualfailures หากขาดระบบหนึ่ง drillยัง PARTIAL ไม่ PASS

## 5 Reconciliation หลัง restore

| ขอบเขต                    | การตรวจจากเหตุการณ์และข้อมูลสำรอง                                          | หลักฐานที่ต้องเก็บแบบ private                                          | ผลรอบ71 |
| ------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------- |
| บัญชี/Person/Organization | identities และ centrallinksไม่ซ้ำ current/expired scope denyตามเวลา        | count/digestsและtestlogin/revoke references ไม่password/token          | NOT_RUN |
| งบ06                      | exact allocation-reserve-commit-paid/reversal ไม่ doublecount ไม่ยอดติดลบ  | event/document refs, decimal string totals, independent reconciliation | NOT_RUN |
| Stock07                   | receipts/lot/unit/conversionversion/movementsคืนครบ ไม่รวมคนละหน่วย        | ledgerrefs/source-target totals/projectionchecksum                     | NOT_RUN |
| ผลสอบ05/09                | Application/seat/scorebatch/rule/approval/releases และ historicalsnapshots | centralrefs/checksums/draft-publicdenials ไม่เผยตัวตน                  | NOT_RUN |
| Files/หนังสือ08           | ทุกรุ่น/hash/ACL/scan/hold/legal retention/decisionlinksคืนครบ             | fileversion mappings/hash comparisons/currentACLdenials                | NOT_RUN |
| Workflow/outbox           | approvedrevision/effectivehistory/transaction dedup preserved              | duplicate/crash replay + correlationไม่มี sideeffectใหม่               | NOT_RUN |

ตัวอย่างตรวจงบที่เสนอ: จัดสรร100000.00 จอง20000.00 เหลือ80000.00 → ย้ายเป็นผูกพัน20000.00ยังเหลือ80000.00 → จ่าย5000.00 ภาระ15000.00 คงเหลือ80000.00 เป็น expected fixture **ไม่ได้มี ledgerจริงที่ restoreแล้ว** Stockกับรายจ่ายไม่ใช่ยอดเดียวกัน partialgoodsreceiptไม่ปิดวงเงินที่ยังไม่ครบเงื่อนไข

## 6 แบบบันทึกผล drill

| ฟิลด์                                                               | ค่าจริงรอบ71          |
| ------------------------------------------------------------------- | --------------------- |
| backup_id / consistent cutoff / source inventory digest             | null                  |
| isolated target / restored file count / account verification        | null                  |
| started_at / database_restored_at / files_restored_at / verified_at | null                  |
| measured RPO / RTO / recovery acceptance                            | null / null / PENDING |
| actual operator / appointed owner / signature                       | null                  |

เก็บรายละเอียดตาม policyส่วนบุคคลที่ยืนยัน ห้ามแนบ dump/files/fullidentityใน public repo CIหรือคู่มือ การลบ backupต้องตรวจ legalhold/retentionตามหนังสือและ audit destructionยังอยู่ การผ่าน drillซอฟต์แวร์ไม่เป็นการรับรองระเบียบงบ สารบรรณหรือฐานการประมวลผลข้อมูล

## แหล่งอ้างอิง

- [PostgreSQL18 SQL dump](https://www.postgresql.org/docs/18/backup-dump.html)
- [Supabase database backups](https://supabase.com/docs/guides/platform/backups)
- [RECORDS_RETENTION](RECORDS_RETENTION.md), [DATA_GOVERNANCE_SIGNOFF](DATA_GOVERNANCE_SIGNOFF.md), [BUDGET_RECONCILIATION](BUDGET_RECONCILIATION.md), [STOCK_LEDGER](STOCK_LEDGER.md)
