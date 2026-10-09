# สัญญาหน้าร่าง ตรวจ และ preview หนังสือ — บท 54

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | **Proposal / BLOCKED — หน้าที่ระบุยังไม่ได้สร้างหรือใช้งานจริง**

ใช้ [CORRESPONDENCE_FLOW](CORRESPONDENCE_FLOW.md), [RECORD_PREVIEW_SECURITY](RECORD_PREVIEW_SECURITY.md) และข้อมูลกลาง53 ไม่สร้างlogin/Person/Organization/Document/แบบapprovalแยก browserstateช่วยกรอกแต่ไม่เป็นauthorizationหรือapprovedrevision ไม่มีpublicpreview/exportendpointใน54

## 1 Pages และ action contractsเสนอ

| Pageเสนอ                                            | เนื้อหา/การใช้งาน                                                                                                               | Server action/DALเสนอ                                                                                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/app/office/records/new`                           | เลือกประเภทและหน่วยที่ได้รับสิทธิ์→สร้างร่างในCorrespondenceเดิม                                                                | createDraft(currentactor,type,org,operationkey); type-policy/source/purpose/currentgrants validate                                                    |
| `/app/office/records/{id}/draft`                    | subject, structuredbody, signer, recipientpicker, attachments, priority/confidentiality/reviewdue; save/resume/revision/history | readDraft/saveDraft(expected_revision)/validateDraft; explicitfieldallowlist/CSRF/currentscope/CAS/idempotency                                        |
| `/app/office/records/{id}/preview?version={opaque}` | labelร่างหรือรุ่นที่อนุมัติ/DEMO; แสดงสิ่งที่จะตรวจพร้อมผู้รับจริงและattachmentsที่มีสิทธิ์                                     | previewVersion(version,expected_digest,templateversion); allowlisted DTO/record-file-sourceACL/currentCLEAN                                           |
| `/app/office/review`                                | งานตามlevel/พื้นที่/membership/delegation/currentrecordACL                                                                      | listReviewAssignments(cursor,filters); predicateก่อนcount/limit ไม่มีsubject/rosterนอกscope                                                           |
| `/app/office/records/{id}/review?version={opaque}`  | candidateimmutable/ความต่างรุ่นก่อน/manifest/ผู้ลงนามผู้รับ/หลักฐาน/returncomment/reason                                        | readCandidate/returnForCorrection/approveCandidate/rejectCandidate(expected_revision,digest,cycle,evidence); workflow11/currentauthority/makerchecker |
| `/app/office/records/{id}/print?version={opaque}`   | privateHTMLprint A4/Sarabun/manifestเดียวกับpreview/watermarkชัด                                                                | authorizePrintVersion(action PRINT,currentgrants); serverrender safeASTไม่มีclient-HTML/Document.latest replacement                                   |

เส้นทางเป็นProposalไม่routesที่เปิดแล้ว Pageเปลี่ยนID/childfile/recipientcounter/ownercontextต้องserverdeny read403เมื่อไม่มีaction/404เมื่อobjectถูกซ่อนตามPERMISSIONS No fallbackALLOWED/mockworkflowหรือseedPII ทำให้UIดูพร้อม

## 2 ร่างและตรวจความครบ

เรียงform5ส่วน: เรื่องและประเภท → เนื้อหาและผู้ลงนาม → ผู้รับและช่องทางที่ยืนยัน → หลักฐานและกำหนดตรวจ → previewตรวจทาน Labelภาษาไทยมีrequired/help/error association ใช้fieldset/group ไม่อ้างข้อความplaceholderเป็นlabel Bodyedittoolbarkeyboard/simpletextmodeต้องได้equivalentstructuredAST ไม่บังคับdrag/mouseเพื่อเลือกผู้รับหรือจัดลำดับไฟล์

Save statusแสดงกำลังบันทึก/บันทึกสำเร็จพร้อมrevision/เครือข่ายขาด/ข้อมูลเปลี่ยน/ไม่มีสิทธิ์ Draftresumeอ่านserverrevisionปัจจุบัน autosaveเก่ารายงานconflictและเลือกเปรียบเทียบ/โหลดใหม่ ไม่ทับเงียบ ๆ localcacheของเนื้อหาลับปิดค่าเริ่มต้นจนpolicyยืนยัน ห้ามlogเต็มsubject/body/recipientcontactsเมื่อnetworkerror

Submit errorแยกfieldrequirementsด้วยเหตุผลภาษาไทยเช่น “ยังไม่ได้เลือกตัวตนผู้รับ”, “หลักฐานรุ่นนี้ยังไม่ผ่านการตรวจ”, “แบบหนังสือทางการยังไม่ยืนยัน” แต่ไม่เผยชื่อ/ไฟล์นอกscope serverตรวจtype/docrequirement/signer-authority/recipients/currenttemplate/reviewdue/contentlimits/CLEAN/CASเอง การselectหรือpreviewไม่ส่ง/ออกเลขใหม่

## 3 ผู้รับจริงและผู้ลงนาม

Pickerค้นเฉพาะPerson/Organizationกลางที่อ่านได้ คืนcode/opaqueID/name/org-rolecontextที่มีสิทธิ์ ไม่ส่งDOB/เลขส่วนตัว/เบอร์ส่วนตัว/address rosterเต็มชุด UIใช้ผลค้นpaged เลือกแถวที่ระบุID+หน่วย+contextแล้วเพิ่มchipพร้อมลบ/ย้อนเลือกด้วยkeyboard ผู้ชื่อเหมือนต้องเลือกแถวอย่างชัดเจน ถ้าหนึ่งPersonหลายสังกัดเลือกcontextตามหลักฐาน ไม่มี “คนแรก” หรือstringautocompleteที่ส่งชื่อแทนID

Review/previewแสดงรายการrecipientจริง **ชื่อ รหัส หน่วยงาน และหน้าที่/บริบทที่ยืนยัน** ตามfieldpolicyพร้อมconfirmationที่อ้างsortedrecipient-set digest ไม่ใช้checkboxหรือcountจากclientเป็นหลักฐานตัวตน serverresolve IDsทุกครั้ง หากpermission/Person-role/scopeเปลี่ยนระหว่างเลือกถึงsubmitแสดงconflictหรือให้เลือกใหม่ตามpolicy ไม่autoselectreplacement

SignerแสดงPerson+ตำแหน่ง/หน่วย/sourceversionช่วงมีผล และแยก “ผู้ลงนามที่เสนอ” จาก “ผู้ตรวจ/ผู้อนุมัติ” ไม่มีsignerportrait/scanned signatureหรือคำว่าsignedofficialจากdropdown/approve หากsigning authority/templateไม่ยืนยัน officialปิด แม้policyDEMOเลือกTESTPersonได้

## 4 หน้าตรวจและการแก้หลังอนุมัติ

Reviewerเห็นcandidate/ไฟล์versionhash/template/recipientset/reason/sourceonlyที่อ่านได้ diffbodyใช้renderedtext/validatedAST ไม่rawHTMLที่executeได้ Fullbody/title/returnreasonและfilepreviewอยู่privatefields ไม่ส่งผ่านnotificationหรือerrorlog

Approverตรวจsnapshotเดียวกับpreviewและการมอบหมาย ณ เวลากด CAS/worker/API makercheckerทำฝั่งserver ผู้สร้างrootและผู้แก้สาระสำคัญห้ามapproveเองแม้มีหลายrole ผู้ดูแลเทคนิคไม่มีอำนาจจากระบบ การ approveสองคน raceต้องคำตัดสินหนึ่งชุดและแจ้ง “รายการนี้มีคำตัดสินใหม่แล้ว โปรดโหลดข้อมูลล่าสุด” ตามproofnative11

Approvedviewแสดงlabelรุ่นที่ตรึงพร้อมdecisiontime/cycle/manifest; การเปิดแก้สาระสำคัญทำholdก่อนDraftVersionใหม่ เก็บแผงคำตัดสินเก่าในhistoryแต่ไม่แสดงว่าversionใหม่อนุมัติแล้ว ไม่แก้approvedPreviewโดยดึงlatesttemplate/file/signerชื่อใหม่มาแทน snapshot

## 5 Preview/print/ข้อจำกัด

ใช้template versionที่ได้รับสิทธิ์และยืนยัน O08 demoแสดงwatermark “TEST — ตัวอย่างทดลอง ยังไม่ใช่หนังสือทางการ” fontSarabun local/A4/วันที่พ.ศ.ตามconfirmedstack RendererรับsafeAST servervalidatedกับpinnedmanifestเท่านั้น ไม่ใช้dangerouslySetInnerHTMLจากผู้กรอก ไม่embedHTML/PDF/SVGหรือremoteassetsที่ยังไม่ตรวจ

PDFตามMASTERคือเปิดprivateHTMLprintและผู้ใช้SavePDFในbrowser ไม่อ้างว่ามีPDFbinaryสร้างโดยserverใน54 หากต้องเก็บPDFartifactเพื่อการส่งภายหลังต้องuploadผ่าน10/CLEAN/hash/currentACLและให้approvalsnapshotbindartifactversionหรือreviewใหม่ตามpolicy BrowsergeneratedPDFfileอาจไม่byte-identicalต่างbrowser; อนุมัติHTMLmanifestไม่รับรองPDFที่ใครแก้หรือuploadโดยอัตโนมัติ

Manifestต้องpinrecordversion/bodyhash/template-font-layout-content versions/attachments/recipients/signer/date จึงตรวจscreen/print/exportว่าตรงกันได้ หากfontโหลดไม่ได้/layoutoverflow/แสดงไม่ครบให้หยุดverifiedpreviewหรือapproval ไม่fallbackแล้วอ้างว่าตรวจแบบเดิมครบ Officialtemplateunknownไม่ออกแบบทางการ ไม่มีactualtemplate/PDF/UIproofในรอบนี้

ทุกpageต้องloading/empty/error/denied/notfound/draftconflict/expiredsession/focusreturn ภาษาไทย keyboardและ375/768/1024/1440ต้องรันจริงเมื่อพร้อม AllP54-01–20 **NOT RUN** ไม่มีpages/actions/preview/PDFหรือapproveddispatch service ไม่เริ่ม55
