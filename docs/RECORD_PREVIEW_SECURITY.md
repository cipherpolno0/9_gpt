# Structured rich text และ private preview — บท 54

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | source `0585b6c` | **Proposal / BLOCKED — ยังไม่มีeditor/validator/renderer/sanitizer/browser testsจริง**

[CORRESPONDENCE_FLOW](CORRESPONDENCE_FLOW.md)ตรึงสิ่งที่previewก่อนapprove [workspace](CORRESPONDENCE_WORKSPACE.md)ใช้Document/FileVersion/ACLกลาง53 packageปัจจุบันไม่มีrich-text sanitizerหรือPDFserverdependency ไม่ติดตั้งlibrary/editor/renderingengineใหม่ในรอบนี้ ไม่มีผลว่าXSSหรือPDFป้องกันได้แล้ว

## 1 Representationและvalidationเสนอ

ค่าเริ่มต้นDEMOรับstructuredASTแบบclosed schema ไม่เก็บrawHTMLเป็นเนื้อหาที่renderโดยตรง NodesเสนอDOC/PARAGRAPH/HEADING(ระดับที่กำหนด)/BULLET_LIST/ORDERED_LIST/LIST_ITEM/TEXT/LINE_BREAK; textmarks BOLD/ITALIC/UNDERLINEเท่านั้น TEXTมีstringของผู้ใช้แต่ห้ามนำไปinnerHTML ทุกnodeมีexplicitkeys/type/childshape/size-depth limitsที่มีรุ่น UnknownHTML_NODE/CUSTOM/component/tag/attributes/style/eventhandlers/URL fields/script nodes/constructor/prototype keysต้องreject ไม่spreaduserJSONเป็นReactprops

Subject/names/recipientlabels/returncomments/filenames/diff/errorข้อความใช้plain text safe sink/contextencoding ไม่interpolateในscript/style/HTMLattributeหรือtemplatecode ASTtextที่ดูเหมือนscriptแสดงliteralได้ด้วยescaping ไม่เป็นHTML UserinputในJSON/scriptbootstrapต้องserializeสำหรับcontextอย่างถูกต้องไม่ปิดscript tagด้วยstringจากฟอร์ม

DEMOlimitsเสนอmaxdepth16/nodecount2000/totaltext50000Unicodecodepoints/subject300/recipients100/attachments20 ทั้งหมดconfigTO VERIFY ไม่เป็นกฎหมาย ต้องservervalidationก่อนsave/submit/preview/approveกับresourcebound limitsในrenderer ไม่แค่maxlengthclient ใส่ขนาดbyte/ไฟล์ตามpolicy10 ไม่เดาthresholdทางการ

PasteHTMLไม่ได้เป็นสิทธิ์ส่งrawHTML: baselineรับplain textหรือASTที่editorแปลงแล้วและservervalidateซ้ำ ห้ามregex-strip tagแล้วclaim sanitizer หากจำเป็นต้องingestHTMLในอนาคตต้องADR trustedparser+maintainedsanitizer serverและallowlist version/fuzz tests/encoded-malformed-markup/DOM-clobbering/URLcontext หลังcleanต้องreviewcanonical outputก่อนapprove ปัจจุบันrawHTML transport/active nodesไม่รองรับ ไม่อ้างว่าตัวcleanerมีแล้ว

## 2 Rendering และ content restriction

Renderermapnodeเป็นcontrolledReactcomponents/escapedtextเท่านั้น userไม่เลือกcomponent/tag/props/CSS/class/URL JSprotocol/dataHTML/blob/script URLs/iframe/object/embed/SVG/MathML/forms/onclick/style/script/style-tag/remote-font/image/cssurlต้องไม่เข้าrender pipeline ค่าเริ่มต้นDEMOปิดlinks/imagesในbody; attachmentsมีopaqueDocument/FileVersionrefsนอกAST

รูปภาพ/ไฟล์แนบถ้าหน่วยงานต้องใช้ต้อง10ตรวจMIMEจากbytes/CLEAN/ACL/hashและapprovedpurpose decode/reencode/limitsตามadapterpolicy ห้ามpreviewactiveattachmentด้วยembedในeditor ใช้safe derivativeผ่านgatewayที่ผูกcurrentauth ไม่fetchURLจากเนื้อหาเพื่อrenderPDF/previewและไม่ส่งcookies/credentialsไปexternal source

Contentpolicy/Sanitizationpolicy/ASTschema/renderer/template/font/layoutversionspinในcandidate/approvedmanifest การsanitize/rewriteสำคัญหลังapproveเปลี่ยนผลที่เห็น→hold/reviewใหม่ Oldimmutablefile/versionไม่เท่ากับgrantปัจจุบันให้renderหรือdownloadได้

Privatepreview/printใช้record-version-file-sourceACLintersection/currentclearance/currentCLEAN/hashทุกครั้ง Cache-control/private routing/CSPตามpageจริงต้องทดสอบ ไม่public staticexport/ISRหรือCDNcacheสาระหนังสือ Inlineprintstylesที่ควบคุมโดยโครงการต้องCSP-compatible ไม่เปิดunsafe-inlineให้userhtml เอกสารHTMLpreviewไม่มีuseractivecode; viewer/editorappอาจมีtrustedframeworkJSตามnonce/hashesที่ตรวจ ไม่พูดว่าสั่งscript-src noneทั้งappแล้วeditorยังทำงาน

CSP/sandboxเป็นเสริมไม่แทนservervalidation/contextencodingหรือcanonicalization รายงานCSP/errorlogต้องลดข้อมูล ไม่ส่งfullsubject/body/URLquery/recipientPIIออกreportendpoint หากใช้isolatedpreviewiframeต้องpolicyCSP/sandbox/currentauthorizationและไม่allow-user-scripts ไม่มีiframe/viewerหรือheadersที่ทดสอบจริงในบทนี้

## 3 Template/print/approval integrity

CorrespondenceTemplateVersionเสนอconfignamespaceOFFICE_TEMPLATEผ่านPolicyVersion+Document/FileVersionหลักฐานกลาง ไม่คัดลอกexamFormTemplateหรือสร้างtemplate engineอีกชุด Fields source/license/verifiedstatus/effectivewindow/allowedfields/rendererlayoutversion/fontversion/templatehash/reviewer/approvedowner required unknownofficialgateปิดทดลองTESTwatermarkเท่านั้น

Fixtureระบุ `digest_reference_spec` และ `preview_manifest_reference` ชัดเจนเพื่อคำนวณซ้ำด้วยUTF-8/SHA256ของsorted-key JSONเฉพาะข้อมูลสมมติ ไม่ใช่canonicalization protocolที่พร้อมใช้ข้ามภาษา ต้องADRเรื่องUnicode/schema/interoperabilityก่อนruntime

Previewmanifest pinrecordversion/canonicalbody/metadata/file hashes/template/font/layout/content versions/rendereddate/signer/recipientset ไม่มีlivegrant/session/signedURLในdigest Claimreviewedpreviewต้องfontloaded/noglyphloss/renderedallfields/paginationตรวจได้ บทนี้ไม่generatePDFจริง ไม่ใช้HTMLreferencehashเป็นPDFbytehashหรือe-signature

Serverprintและscreenใช้snapshotเดียวแต่browserSavePDFอาจต่างbytesตามbrowser/provider เพื่อแนบPDFส่งจริงในอนาคตต้องapproveexactFileVersionหรือverifiedgenerationadapterที่policyรับรองพร้อมcanonicalrenderhash ไม่ผูกclient-uploadPDFกับoldapprovalแค่เพราะชื่อไฟล์เหมือน

## 4 Corpus และ proofที่ยังขาด

[fixture54](fixtures/correspondence-54-plan.json)เก็บTEXTscript-looking literal, forbidden rawHTML/ASTfields, XSS/event/URL/SVG/MathML/template/prototype/oversize descriptorsพร้อมexpectedresponse ทุกcorpuscase actual=NULL/browser_executed=false ไม่ใช่executable securitytests Referenceescaping/hash/predicate checksไม่พิสูจน์DOM/serverAPIหรือbrowserไม่มีscriptexecution

ต้องรันP54-11–14/17/19ที่ทุกsinkจริง input→save→resume→reviewdiff→preview→print→error→notification/exportsด้วยbrowser instrumentation เช่น sentinel/canary eventและrequestsที่อนุญาตในdev ตรวจไม่execute/fetch/leak ตรวจcontextในbuiltHTML/JS/JSONไม่เพียงหาstringscript ผลยังNOT RUN ไม่เรียกsafeเพราะเอาpayloadออกจากfixture

แหล่งหลักสำหรับreviewdesign: [OWASP XSS prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) และ [OWASP CSP](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html) ไม่เป็นผลตรวจappจริงหรือการรับรองtemplate/อำนาจทางการ ไม่มีsource/runtime migration/libraryเปลี่ยน ไม่เริ่ม55
