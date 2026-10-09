-- v0.8 shared services. Synthetic requests only; never activate a register here.
BEGIN;
CREATE ROLE portal_work_guard NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE portal_event_worker NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE portal_scan_worker NOLOGIN NOSUPERUSER NOBYPASSRLS;
GRANT portal_work_guard TO CURRENT_USER;
GRANT USAGE ON SCHEMA private TO portal_work_guard,portal_event_worker,portal_scan_worker;
ALTER TABLE private.role_assignment DROP CONSTRAINT role_assignment_role_code_check;
ALTER TABLE private.role_assignment DROP CONSTRAINT role_assignment_actions_check;
ALTER TABLE private.role_assignment DROP CONSTRAINT role_assignment_check1;
ALTER TABLE private.role_assignment ADD CHECK(role_code IN ('REGISTER_READER','TECHNICAL_ADMIN','BUSINESS_OPERATOR'));
ALTER TABLE private.role_assignment ADD CHECK(cardinality(actions)>0 AND actions <@ ARRAY['people.read','organizations.read','admin.read','documents.upload','documents.read','documents.share','requests.create','requests.read','requests.review','requests.approve']::text[]);
ALTER TABLE private.role_assignment ADD CHECK((role_code='TECHNICAL_ADMIN' AND organization_id IS NULL AND actions=ARRAY['admin.read']::text[]) OR (role_code IN ('REGISTER_READER','BUSINESS_OPERATOR') AND organization_id IS NOT NULL AND NOT 'admin.read'=ANY(actions) AND (role_code='BUSINESS_OPERATOR' OR actions <@ ARRAY['people.read','organizations.read']::text[])));
CREATE TABLE private.file_version (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),document_id uuid NOT NULL REFERENCES private.document(id),version_no integer NOT NULL CHECK(version_no>0),
 object_key text NOT NULL UNIQUE,sha256 text NOT NULL CHECK(sha256 ~ '^[a-f0-9]{64}$'),size_bytes integer NOT NULL CHECK(size_bytes BETWEEN 1 AND 10485760),
 mime_type text NOT NULL CHECK(mime_type IN ('application/pdf','image/png','image/jpeg')),file_label text NOT NULL CHECK(length(file_label) BETWEEN 1 AND 150),
 scan_status text NOT NULL DEFAULT 'UPLOAD_PENDING' CHECK(scan_status IN ('UPLOAD_PENDING','QUARANTINED','CLEAN','REJECTED')),uploaded_at timestamptz,scanned_at timestamptz,scan_engine text,
 created_by_account_id uuid NOT NULL REFERENCES private.user_account(id),created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(document_id,version_no), CHECK((scan_status IN ('CLEAN','REJECTED'))=(scanned_at IS NOT NULL)),CHECK(scan_status='UPLOAD_PENDING' OR uploaded_at IS NOT NULL)
);
CREATE TABLE private.document_access (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),document_id uuid NOT NULL REFERENCES private.document(id),account_id uuid NOT NULL REFERENCES private.user_account(id),
 granted_by_account_id uuid NOT NULL REFERENCES private.user_account(id),starts_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,ends_at timestamptz NOT NULL,revoked_at timestamptz,
 CHECK(ends_at>starts_at),UNIQUE(document_id,account_id)
);
CREATE TABLE private.workflow_request (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organization_id uuid NOT NULL REFERENCES private.organization(id),created_by_account_id uuid NOT NULL REFERENCES private.user_account(id),
 kind text NOT NULL CHECK(kind IN ('PERSON_CORRECTION','ORGANIZATION_CHANGE','EXAM_CENTER_CHANGE')),status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','submitted','reviewed','returned','approved','rejected','cancelled')),
 revision integer NOT NULL DEFAULT 1 CHECK(revision>0),event_version integer NOT NULL DEFAULT 0 CHECK(event_version>=0),tracking_code text NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text,'-',''),
 created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,data_mode text NOT NULL DEFAULT 'SYNTHETIC' CHECK(data_mode='SYNTHETIC')
);
CREATE TABLE private.workflow_revision (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),request_id uuid NOT NULL REFERENCES private.workflow_request(id),revision integer NOT NULL CHECK(revision>0),
 payload jsonb NOT NULL CHECK(jsonb_typeof(payload)='object' AND octet_length(payload::text)<=16384),file_version_ids uuid[] NOT NULL DEFAULT '{}',
 policy_version_id uuid NOT NULL REFERENCES private.policy_version(id),snapshot_hash text NOT NULL CHECK(snapshot_hash ~ '^[a-f0-9]{64}$'),created_by_account_id uuid NOT NULL REFERENCES private.user_account(id),created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(request_id,revision),CHECK(cardinality(file_version_ids)<=10)
);
ALTER TABLE private.workflow_request ADD FOREIGN KEY(id,revision) REFERENCES private.workflow_revision(request_id,revision) DEFERRABLE INITIALLY DEFERRED;
CREATE TABLE private.workflow_decision (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),request_id uuid NOT NULL,revision integer NOT NULL,
 decision text NOT NULL CHECK(decision IN ('returned','reviewed','approved','rejected','cancelled')),reason text NOT NULL CHECK(length(reason) BETWEEN 10 AND 2000),
 account_id uuid NOT NULL REFERENCES private.user_account(id),authority_assignment_id uuid NOT NULL REFERENCES private.role_assignment(id),authority_snapshot jsonb NOT NULL CHECK(jsonb_typeof(authority_snapshot)='object'),snapshot_hash text NOT NULL,
 decided_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(request_id,revision) REFERENCES private.workflow_revision(request_id,revision)
);
CREATE UNIQUE INDEX workflow_one_final_decision ON private.workflow_decision(request_id,revision) WHERE decision IN ('approved','rejected');
CREATE TABLE private.integration_outbox (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),event_type text NOT NULL CHECK(event_type='RequestTransitioned'),aggregate_id uuid NOT NULL REFERENCES private.workflow_request(id),aggregate_version integer NOT NULL,
 organization_id uuid NOT NULL REFERENCES private.organization(id),occurred_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,correlation_id uuid NOT NULL,payload jsonb NOT NULL,
 processed_at timestamptz,UNIQUE(aggregate_id,aggregate_version)
);
CREATE TABLE private.portal_notification (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),event_id uuid NOT NULL REFERENCES private.integration_outbox(id),account_id uuid NOT NULL REFERENCES private.user_account(id),
 request_id uuid NOT NULL REFERENCES private.workflow_request(id),event_type text NOT NULL,created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,acknowledged_at timestamptz,
 UNIQUE(event_id,account_id)
);
CREATE TABLE private.integration_receipt (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),event_id uuid NOT NULL REFERENCES private.integration_outbox(id),consumer text NOT NULL CHECK(consumer='portal-notifications'),processed_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE(event_id,consumer)
);
CREATE TABLE private.worker_scope (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),db_login text NOT NULL,organization_id uuid NOT NULL REFERENCES private.organization(id),purpose text NOT NULL CHECK(purpose IN ('notification','scan')),
 starts_at timestamptz NOT NULL,ends_at timestamptz NOT NULL CHECK(ends_at>starts_at),revoked_at timestamptz,UNIQUE(db_login,organization_id,purpose)
);
CREATE TABLE private.operation_receipt (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),account_id uuid NOT NULL REFERENCES private.user_account(id),idempotency_key uuid NOT NULL,fingerprint text NOT NULL,response jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE(account_id,idempotency_key)
);
-- Narrow helper owner can see context and central metadata. Web has RPC access only.
GRANT SELECT ON private.user_account,private.portal_session,private.role_assignment,private.organization,private.service_actor,private.document TO portal_work_guard;
GRANT INSERT,UPDATE ON private.document TO portal_work_guard;
GRANT UPDATE ON private.role_assignment TO portal_work_guard;
GRANT SELECT ON private.policy_version,private.person_affiliation TO portal_work_guard;
CREATE POLICY work_policy ON private.policy_version FOR SELECT TO portal_work_guard USING(policy_namespace='workflow.synthetic');
CREATE POLICY work_target ON private.person_affiliation FOR SELECT TO portal_work_guard USING(true);
GRANT INSERT ON private.audit_logs TO portal_work_guard;
GRANT EXECUTE ON FUNCTION private.require_service_actor() TO portal_work_guard;
CREATE POLICY work_context ON private.user_account FOR SELECT TO portal_work_guard USING(true);
CREATE POLICY work_context ON private.portal_session FOR SELECT TO portal_work_guard USING(true);
CREATE POLICY work_context ON private.role_assignment FOR SELECT TO portal_work_guard USING(true);
CREATE POLICY work_lock ON private.role_assignment FOR UPDATE TO portal_work_guard USING(true) WITH CHECK(false);
CREATE POLICY work_context ON private.organization FOR SELECT TO portal_work_guard USING(true);
CREATE POLICY work_context ON private.service_actor FOR SELECT TO portal_work_guard USING(actor_code='PORTAL_WORKFLOW');
CREATE POLICY work_metadata ON private.document TO portal_work_guard USING(true) WITH CHECK(true);
CREATE POLICY work_audit ON private.audit_logs FOR INSERT TO portal_work_guard WITH CHECK(service_actor_id='10000000-0000-4000-8000-000000000008');
SELECT set_config('app.service_actor_id','10000000-0000-4000-8000-000000000008',true),set_config('app.correlation_id','10000000-0000-4000-8000-000000000008',true);
INSERT INTO private.service_actor(id,actor_code,label_th) VALUES('10000000-0000-4000-8000-000000000008','PORTAL_WORKFLOW','ตัวประมวลธุรกรรมกลาง');
INSERT INTO private.policy_version(policy_namespace,version_no,verification_status,configuration,effective_from,created_by_actor_id,updated_by_actor_id) VALUES('workflow.synthetic',1,'TO_VERIFY','{"mode":"SYNTHETIC","required_fields":["subject","reason","target_id","effective_on"]}',CURRENT_DATE,'10000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000008');
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['file_version','document_access','workflow_request','workflow_revision','workflow_decision','integration_outbox','portal_notification','integration_receipt','worker_scope','operation_receipt'] LOOP
  EXECUTE format('ALTER TABLE private.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('ALTER TABLE private.%I FORCE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON private.%I FROM PUBLIC',t);
  EXECUTE format('GRANT SELECT,INSERT,UPDATE ON private.%I TO portal_work_guard',t);
  EXECUTE format('CREATE POLICY guard_only ON private.%I TO portal_work_guard USING(true) WITH CHECK(true)',t);
  EXECUTE format('CREATE TRIGGER deny_delete BEFORE DELETE ON private.%I FOR EACH ROW EXECUTE FUNCTION private.prevent_delete()',t);
  EXECUTE format('CREATE TRIGGER audit_change AFTER INSERT OR UPDATE ON private.%I FOR EACH ROW EXECUTE FUNCTION private.audit_change()',t);
 END LOOP;
END $$;
CREATE INDEX workflow_scoped_queue ON private.workflow_request(organization_id,status,updated_at DESC);
CREATE INDEX file_quarantine_queue ON private.file_version(created_at) WHERE scan_status='QUARANTINED';
CREATE INDEX outbox_pending_queue ON private.integration_outbox(occurred_at,id) WHERE processed_at IS NULL;
CREATE INDEX notice_owner_list ON private.portal_notification(account_id,created_at DESC);
-- No worker can invent scope or authority; even the helper cannot write worker assignments.
REVOKE INSERT,UPDATE ON private.worker_scope FROM portal_work_guard;
CREATE FUNCTION private.work_actor() RETURNS void LANGUAGE sql SET search_path=pg_catalog,private AS $$
 SELECT set_config('app.service_actor_id','10000000-0000-4000-8000-000000000008',true)
$$;
CREATE FUNCTION private.work_account() RETURNS uuid LANGUAGE plpgsql STABLE SET search_path=pg_catalog,private AS $$
DECLARE a uuid; BEGIN
 SELECT u.id INTO a FROM private.user_account u JOIN private.portal_session s ON s.account_id=u.id
 WHERE u.auth_user_id=nullif(current_setting('app.auth_uid',true),'')::uuid AND u.is_active
 AND s.token_hash=current_setting('app.session_hash',true) AND s.revoked_at IS NULL AND s.expires_at>clock_timestamp() AND s.created_at>u.revoked_before
 AND to_timestamp(nullif(current_setting('app.auth_issued_at',true),'')::double precision/1000)>u.revoked_before
 AND (NOT u.require_mfa OR current_setting('app.strong_mfa',true)='true');
 IF a IS NULL THEN RAISE EXCEPTION 'WORK_UNAUTHENTICATED' USING ERRCODE='28000'; END IF; RETURN a;
END $$;
CREATE FUNCTION private.work_authority(a uuid,action_name text,org uuid) RETURNS uuid LANGUAGE sql STABLE SET search_path=pg_catalog,private AS $$
 SELECT id FROM private.role_assignment WHERE account_id=a AND organization_id=org AND action_name=ANY(actions) AND starts_at<=clock_timestamp() AND ends_at>clock_timestamp() AND revoked_at IS NULL ORDER BY id LIMIT 1
$$;
CREATE FUNCTION private.work_require(a uuid,action_name text,org uuid) RETURNS uuid LANGUAGE plpgsql STABLE SET search_path=pg_catalog,private AS $$
DECLARE g uuid; BEGIN g:=private.work_authority(a,action_name,org); IF g IS NULL THEN RAISE EXCEPTION 'WORK_FORBIDDEN' USING ERRCODE='42501'; END IF; RETURN g; END $$;
CREATE FUNCTION private.work_document_access(a uuid,doc uuid,action_name text) RETURNS boolean LANGUAGE sql STABLE SET search_path=pg_catalog,private AS $$
 SELECT EXISTS(SELECT 1 FROM private.document d JOIN private.document_access x ON x.document_id=d.id WHERE d.id=doc AND d.is_active AND x.account_id=a AND x.revoked_at IS NULL AND x.starts_at<=clock_timestamp() AND x.ends_at>clock_timestamp() AND private.work_authority(a,action_name,d.owner_organization_id) IS NOT NULL)
$$;
CREATE FUNCTION private.work_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'WORK_IMMUTABLE' USING ERRCODE='23514'; END $$;
CREATE TRIGGER immutable BEFORE UPDATE ON private.workflow_revision FOR EACH ROW EXECUTE FUNCTION private.work_immutable();
CREATE TRIGGER immutable BEFORE UPDATE ON private.workflow_decision FOR EACH ROW EXECUTE FUNCTION private.work_immutable();
CREATE TRIGGER immutable BEFORE UPDATE ON private.integration_receipt FOR EACH ROW EXECUTE FUNCTION private.work_immutable();
CREATE TRIGGER immutable BEFORE UPDATE ON private.operation_receipt FOR EACH ROW EXECUTE FUNCTION private.work_immutable();
CREATE FUNCTION private.work_file_guard() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF (to_jsonb(NEW)-ARRAY['uploaded_at','scan_status','scanned_at','scan_engine']) IS DISTINCT FROM (to_jsonb(OLD)-ARRAY['uploaded_at','scan_status','scanned_at','scan_engine']) OR OLD.scan_status IN ('CLEAN','REJECTED') OR NOT ((OLD.scan_status='UPLOAD_PENDING' AND NEW.scan_status='QUARANTINED') OR (OLD.scan_status='QUARANTINED' AND NEW.scan_status IN ('CLEAN','REJECTED'))) THEN RAISE EXCEPTION 'WORK_IMMUTABLE' USING ERRCODE='23514'; END IF; RETURN NEW;
END $$;
CREATE TRIGGER immutable_file BEFORE UPDATE ON private.file_version FOR EACH ROW EXECUTE FUNCTION private.work_file_guard();
CREATE FUNCTION private.work_idempotency(a uuid,k uuid,f text) RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog,private AS $$
DECLARE r private.operation_receipt; BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(a::text||k::text,0));
 SELECT * INTO r FROM private.operation_receipt WHERE account_id=a AND idempotency_key=k;
 IF FOUND AND r.fingerprint<>f THEN RAISE EXCEPTION 'WORK_IDEMPOTENCY_CONFLICT' USING ERRCODE='40001'; END IF;
 RETURN r.response;
END $$;
CREATE FUNCTION private.work_record(a uuid,k uuid,f text,response jsonb) RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog,private AS $$ BEGIN
 INSERT INTO private.operation_receipt(account_id,idempotency_key,fingerprint,response) VALUES(a,k,f,response); RETURN response;
END $$;
CREATE FUNCTION private.work_file_prepare(org uuid,doc uuid,label text,mime text,bytes integer,sha text,k uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,private AS $$
DECLARE a uuid:=private.work_account(); d uuid:=doc; f text; cached jsonb; v uuid:=gen_random_uuid(); n integer; BEGIN
 PERFORM private.work_require(a,'documents.upload',org); PERFORM private.work_actor();
 f:=jsonb_build_array('file',org,doc,label,mime,bytes,sha)::text; f:=encode(sha256(convert_to(f,'UTF8')),'hex'); cached:=private.work_idempotency(a,k,f); PERFORM private.work_account(); IF cached IS NOT NULL THEN RETURN cached; END IF;
 IF d IS NULL THEN
  d:=gen_random_uuid(); INSERT INTO private.document(id,document_code,owner_organization_id,document_kind,title,visibility_class,lifecycle_status,created_by_actor_id,updated_by_actor_id) VALUES(d,'TEST_DOC_'||replace(d::text,'-',''),org,'EVIDENCE',label,'H','QUARANTINED','10000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000008');
  INSERT INTO private.document_access(document_id,account_id,granted_by_account_id,ends_at) VALUES(d,a,a,CURRENT_TIMESTAMP+interval '30 days');
 ELSE
  PERFORM 1 FROM private.document WHERE id=d AND owner_organization_id=org FOR UPDATE;
  IF NOT FOUND OR NOT private.work_document_access(a,d,'documents.upload') THEN RAISE EXCEPTION 'WORK_FORBIDDEN' USING ERRCODE='42501'; END IF;
 END IF;
 SELECT coalesce(max(version_no),0)+1 INTO n FROM private.file_version WHERE document_id=d;
 INSERT INTO private.file_version(id,document_id,version_no,object_key,sha256,size_bytes,mime_type,file_label,created_by_account_id) VALUES(v,d,n,org::text||'/'||d::text||'/'||v::text,sha,bytes,mime,label,a);
 RETURN private.work_record(a,k,f,jsonb_build_object('id',v,'document_id',d,'object_key',org::text||'/'||d::text||'/'||v::text,'revision',n,'sha256',sha));
END $$;
CREATE FUNCTION private.work_file_uploaded(v uuid,sha text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,private AS $$
DECLARE a uuid:=private.work_account(); r private.file_version; BEGIN
 SELECT * INTO r FROM private.file_version WHERE id=v FOR UPDATE;
 IF NOT FOUND OR r.sha256<>sha OR NOT private.work_document_access(a,r.document_id,'documents.upload') THEN RAISE EXCEPTION 'WORK_FORBIDDEN' USING ERRCODE='42501'; END IF;
 IF r.scan_status<>'UPLOAD_PENDING' THEN RETURN r.scan_status; END IF;
 PERFORM private.work_actor(); UPDATE private.file_version SET scan_status='QUARANTINED',uploaded_at=CURRENT_TIMESTAMP WHERE id=v; RETURN 'QUARANTINED';
END $$;
CREATE FUNCTION private.work_files() RETURNS SETOF jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,private AS $$
DECLARE a uuid:=private.work_account(); BEGIN
 RETURN QUERY SELECT jsonb_build_object('id',v.id,'document_id',v.document_id,'revision',v.version_no,'label',v.file_label,'scan_status',v.scan_status,'sha256',v.sha256) FROM private.file_version v WHERE private.work_document_access(a,v.document_id,'documents.read') ORDER BY v.created_at DESC LIMIT 50;
END $$;
CREATE FUNCTION private.work_file_read(v uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,private AS $$
DECLARE a uuid:=private.work_account(); r private.file_version; BEGIN
 SELECT * INTO r FROM private.file_version WHERE id=v;
 IF NOT FOUND OR r.scan_status<>'CLEAN' OR NOT private.work_document_access(a,r.document_id,'documents.read') THEN RAISE EXCEPTION 'WORK_FORBIDDEN' USING ERRCODE='42501'; END IF;
 RETURN jsonb_build_object('object_key',r.object_key,'sha256',r.sha256,'size_bytes',r.size_bytes,'label',r.file_label,'mime_type',r.mime_type);
END $$;
CREATE FUNCTION private.work_share(doc uuid,recipient uuid,until_at timestamptz) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,private AS $$
DECLARE a uuid:=private.work_account(); org uuid; BEGIN
 SELECT owner_organization_id INTO org FROM private.document WHERE id=doc;
 IF NOT private.work_document_access(a,doc,'documents.share') OR private.work_authority(recipient,'documents.read',org) IS NULL OR until_at<=CURRENT_TIMESTAMP OR until_at>CURRENT_TIMESTAMP+interval '30 days' THEN RAISE EXCEPTION 'WORK_FORBIDDEN' USING ERRCODE='42501'; END IF;
 PERFORM private.work_actor(); INSERT INTO private.document_access(document_id,account_id,granted_by_account_id,ends_at) VALUES(doc,recipient,a,until_at) ON CONFLICT(document_id,account_id) DO UPDATE SET ends_at=EXCLUDED.ends_at,starts_at=CURRENT_TIMESTAMP,revoked_at=NULL,granted_by_account_id=a;
END $$;
CREATE FUNCTION private.work_revoke(doc uuid,recipient uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,private AS $$
DECLARE a uuid:=private.work_account(); BEGIN
 IF NOT private.work_document_access(a,doc,'documents.share') THEN RAISE EXCEPTION 'WORK_FORBIDDEN' USING ERRCODE='42501'; END IF;
 PERFORM private.work_actor(); UPDATE private.document_access SET revoked_at=CURRENT_TIMESTAMP WHERE document_id=doc AND account_id=recipient;
END $$;
CREATE FUNCTION private.work_save(req uuid,org uuid,kind_name text,data jsonb,files uuid[],expected_revision integer,k uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,private AS $$
DECLARE a uuid:=private.work_account(); r private.workflow_request; f text; cached jsonb; result jsonb; id uuid:=req; n integer; sh text; policy_id uuid; BEGIN
 IF expected_revision IS NULL OR expected_revision<0 OR k IS NULL OR kind_name IS NULL OR data IS NULL OR files IS NULL THEN RAISE EXCEPTION 'WORK_INVALID_INPUT' USING ERRCODE='22023'; END IF;
 PERFORM private.work_require(a,'requests.create',org); PERFORM private.work_actor();
 IF coalesce(data->>'target_id','')<>'' THEN
  IF kind_name='PERSON_CORRECTION' THEN
   IF NOT EXISTS(SELECT 1 FROM private.person_affiliation WHERE person_id=(data->>'target_id')::uuid AND organization_id=org AND effective_from<=(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Bangkok')::date AND (effective_to IS NULL OR effective_to>(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Bangkok')::date)) THEN RAISE EXCEPTION 'WORK_FORBIDDEN' USING ERRCODE='42501'; END IF;
  ELSIF data->>'target_id'<>org::text THEN RAISE EXCEPTION 'WORK_FORBIDDEN' USING ERRCODE='42501'; END IF;
 END IF;
 SELECT p.id INTO STRICT policy_id FROM private.policy_version p WHERE policy_namespace='workflow.synthetic' AND version_no=1 AND is_active;
 IF cardinality(files)<>cardinality(ARRAY(SELECT DISTINCT unnest(files))) OR cardinality(files)>10 THEN RAISE EXCEPTION 'WORK_INVALID_EVIDENCE' USING ERRCODE='23514'; END IF;
 IF EXISTS(SELECT 1 FROM unnest(files) x LEFT JOIN private.file_version v ON v.id=x WHERE v.id IS NULL OR v.scan_status<>'CLEAN' OR NOT private.work_document_access(a,v.document_id,'documents.read')) THEN RAISE EXCEPTION 'WORK_INVALID_EVIDENCE' USING ERRCODE='23514'; END IF;
 f:=jsonb_build_array('save',req,org,kind_name,data,files,expected_revision)::text; f:=encode(sha256(convert_to(f,'UTF8')),'hex'); cached:=private.work_idempotency(a,k,f); PERFORM private.work_account(); IF cached IS NOT NULL THEN RETURN cached; END IF;
 IF id IS NULL THEN
  IF expected_revision<>0 THEN RAISE EXCEPTION 'WORK_REVISION_CONFLICT' USING ERRCODE='40001'; END IF;
  id:=gen_random_uuid(); n:=1; INSERT INTO private.workflow_request(id,organization_id,created_by_account_id,kind) VALUES(id,org,a,kind_name);
 ELSE
  SELECT * INTO r FROM private.workflow_request WHERE workflow_request.id=req FOR UPDATE;
  IF NOT FOUND OR r.created_by_account_id<>a OR r.organization_id<>org OR r.kind<>kind_name THEN RAISE EXCEPTION 'WORK_FORBIDDEN' USING ERRCODE='42501'; END IF;
  IF r.revision<>expected_revision OR r.status NOT IN ('draft','returned') THEN RAISE EXCEPTION 'WORK_REVISION_CONFLICT' USING ERRCODE='40001'; END IF;
  n:=r.revision+1; UPDATE private.workflow_request SET revision=n,status='draft',updated_at=CURRENT_TIMESTAMP WHERE workflow_request.id=req;
 END IF;
 sh:=encode(sha256(convert_to(jsonb_build_object('kind',kind_name,'org',org,'payload',data,'policy_version_id',policy_id,'evidence',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',v.id,'sha256',v.sha256) ORDER BY v.id),'[]') FROM private.file_version v WHERE v.id=ANY(files)))::text,'UTF8')),'hex');
 INSERT INTO private.workflow_revision(request_id,revision,payload,file_version_ids,snapshot_hash,policy_version_id,created_by_account_id) VALUES(id,n,data,files,sh,policy_id,a);
 result:=jsonb_build_object('id',id,'revision',n,'status','draft'); RETURN private.work_record(a,k,f,result);
END $$;
CREATE FUNCTION private.work_requests() RETURNS SETOF jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,private AS $$
DECLARE a uuid:=private.work_account(); BEGIN
 RETURN QUERY SELECT jsonb_build_object('id',r.id,'kind',r.kind,'organization_id',r.organization_id,'status',r.status,'revision',r.revision,'tracking_code',r.tracking_code,'payload',v.payload,'file_version_ids',v.file_version_ids,'snapshot_hash',v.snapshot_hash,'data_mode',r.data_mode,'created_by_account_id',r.created_by_account_id,'decisions',(SELECT coalesce(jsonb_agg(jsonb_build_object('decision',d.decision,'reason',d.reason,'revision',d.revision,'decided_at',d.decided_at,'account_id',d.account_id,'authority_assignment_id',d.authority_assignment_id,'authority_snapshot',d.authority_snapshot,'snapshot_hash',d.snapshot_hash) ORDER BY d.decided_at),'[]') FROM private.workflow_decision d WHERE d.request_id=r.id))
 FROM private.workflow_request r JOIN private.workflow_revision v ON v.request_id=r.id AND v.revision=r.revision
 WHERE private.work_authority(a,'requests.read',r.organization_id) IS NOT NULL AND (r.created_by_account_id=a OR private.work_authority(a,'requests.review',r.organization_id) IS NOT NULL OR private.work_authority(a,'requests.approve',r.organization_id) IS NOT NULL)
 ORDER BY r.updated_at DESC LIMIT 50;
END $$;
CREATE FUNCTION private.work_transition(req uuid,expected_revision integer,next_status text,why text,k uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,private AS $$
DECLARE a uuid:=private.work_account(); r private.workflow_request; v private.workflow_revision; g uuid; f text; cached jsonb; result jsonb; action_name text; authority jsonb; BEGIN
 IF expected_revision IS NULL OR expected_revision<1 OR k IS NULL THEN RAISE EXCEPTION 'WORK_INVALID_INPUT' USING ERRCODE='22023'; END IF;
 PERFORM private.work_actor(); f:=jsonb_build_array('transition',req,expected_revision,next_status,why)::text; f:=encode(sha256(convert_to(f,'UTF8')),'hex'); cached:=private.work_idempotency(a,k,f);
 SELECT * INTO r FROM private.workflow_request WHERE id=req FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'WORK_FORBIDDEN' USING ERRCODE='42501'; END IF;
 PERFORM private.work_account();
 action_name:=CASE WHEN next_status IN ('submitted','cancelled') THEN 'requests.create' WHEN next_status IN ('returned','reviewed') THEN 'requests.review' WHEN next_status IN ('approved','rejected') THEN 'requests.approve' ELSE '' END;
 g:=private.work_require(a,action_name,r.organization_id);
 IF next_status IN ('submitted','cancelled') AND a<>r.created_by_account_id OR next_status IN ('returned','reviewed','approved','rejected') AND a=r.created_by_account_id THEN RAISE EXCEPTION 'WORK_MAKER_CHECKER' USING ERRCODE='42501'; END IF;
 IF cached IS NOT NULL THEN RETURN cached; END IF;
 IF r.revision<>expected_revision THEN RAISE EXCEPTION 'WORK_REVISION_CONFLICT' USING ERRCODE='40001'; END IF;
 IF NOT ((next_status='submitted' AND r.status='draft') OR (next_status IN ('returned','reviewed') AND r.status='submitted') OR (next_status IN ('approved','rejected') AND r.status='reviewed') OR (next_status='cancelled' AND r.status IN ('draft','submitted','returned'))) THEN RAISE EXCEPTION 'WORK_STATE_CONFLICT' USING ERRCODE='40001'; END IF;
 SELECT * INTO v FROM private.workflow_revision WHERE request_id=req AND revision=r.revision;
 IF next_status='submitted' THEN
  IF EXISTS(SELECT 1 FROM private.policy_version p CROSS JOIN LATERAL jsonb_array_elements_text(p.configuration->'required_fields') fld WHERE p.id=v.policy_version_id AND coalesce(v.payload->>fld,'')='') OR length(coalesce(v.payload->>'subject','')) NOT BETWEEN 1 AND 200 OR length(coalesce(v.payload->>'reason','')) NOT BETWEEN 10 AND 2000 OR cardinality(v.file_version_ids)=0 THEN RAISE EXCEPTION 'WORK_REQUIRED_FIELDS' USING ERRCODE='23514'; END IF;
  IF coalesce(v.payload->>'effective_on','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN RAISE EXCEPTION 'WORK_REQUIRED_FIELDS' USING ERRCODE='23514'; END IF;
  PERFORM (v.payload->>'effective_on')::date;
 END IF;
 IF next_status IN ('submitted','reviewed','approved') THEN
  IF r.kind='PERSON_CORRECTION' THEN
   IF NOT EXISTS(SELECT 1 FROM private.person_affiliation WHERE person_id=(v.payload->>'target_id')::uuid AND organization_id=r.organization_id AND effective_from<=(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Bangkok')::date AND (effective_to IS NULL OR effective_to>(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Bangkok')::date)) THEN RAISE EXCEPTION 'WORK_FORBIDDEN' USING ERRCODE='42501'; END IF;
  ELSIF v.payload->>'target_id' IS DISTINCT FROM r.organization_id::text THEN RAISE EXCEPTION 'WORK_FORBIDDEN' USING ERRCODE='42501'; END IF;
 END IF;
 IF next_status IN ('submitted','reviewed','approved') AND EXISTS(SELECT 1 FROM unnest(v.file_version_ids) x LEFT JOIN private.file_version fv ON fv.id=x WHERE fv.id IS NULL OR fv.scan_status<>'CLEAN' OR NOT private.work_document_access(a,fv.document_id,'documents.read')) THEN RAISE EXCEPTION 'WORK_INVALID_EVIDENCE' USING ERRCODE='23514'; END IF;
 IF next_status IN ('approved','rejected') AND EXISTS(SELECT 1 FROM private.workflow_decision WHERE request_id=req AND revision=r.revision AND decision='reviewed' AND account_id=a) THEN RAISE EXCEPTION 'WORK_MAKER_CHECKER' USING ERRCODE='42501'; END IF;
 IF next_status<>'submitted' THEN
  PERFORM 1 FROM private.role_assignment WHERE id=g FOR SHARE;
  PERFORM private.work_require(a,action_name,r.organization_id);
  SELECT jsonb_build_object('account_id',account_id,'organization_id',organization_id,'role_code',role_code,'actions',actions,'starts_at',starts_at,'ends_at',ends_at,'checked_at',clock_timestamp()) INTO authority FROM private.role_assignment WHERE id=g;
  INSERT INTO private.workflow_decision(request_id,revision,decision,reason,account_id,authority_assignment_id,authority_snapshot,snapshot_hash) VALUES(req,r.revision,next_status,why,a,g,authority,v.snapshot_hash);
 END IF;
 UPDATE private.workflow_request SET status=next_status,event_version=event_version+1,updated_at=CURRENT_TIMESTAMP WHERE id=req RETURNING * INTO r;
 INSERT INTO private.integration_outbox(event_type,aggregate_id,aggregate_version,organization_id,correlation_id,payload) VALUES('RequestTransitioned',req,r.event_version,r.organization_id,nullif(current_setting('app.correlation_id',true),'')::uuid,jsonb_build_object('status',next_status));
 result:=jsonb_build_object('id',req,'revision',r.revision,'status',r.status,'tracking_code',r.tracking_code); RETURN private.work_record(a,k,f,result);
END $$;
CREATE FUNCTION private.work_notifications() RETURNS SETOF jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,private AS $$
DECLARE a uuid:=private.work_account(); BEGIN
 RETURN QUERY SELECT jsonb_build_object('id',n.id,'request_id',n.request_id,'event_type',n.event_type,'created_at',n.created_at,'acknowledged_at',n.acknowledged_at) FROM private.portal_notification n JOIN private.workflow_request r ON r.id=n.request_id WHERE n.account_id=a AND private.work_authority(a,'requests.read',r.organization_id) IS NOT NULL ORDER BY n.created_at DESC LIMIT 50;
END $$;
CREATE FUNCTION private.work_notification_ack(n uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,private AS $$
DECLARE a uuid:=private.work_account(); BEGIN PERFORM private.work_actor(); UPDATE private.portal_notification SET acknowledged_at=coalesce(acknowledged_at,CURRENT_TIMESTAMP) WHERE id=n AND account_id=a AND EXISTS(SELECT 1 FROM private.workflow_request r WHERE r.id=request_id AND private.work_authority(a,'requests.read',r.organization_id) IS NOT NULL); END $$;
CREATE FUNCTION private.work_worker_can(org uuid,kind text) RETURNS boolean LANGUAGE sql STABLE SET search_path=pg_catalog,private AS $$
 SELECT EXISTS(SELECT 1 FROM private.worker_scope WHERE db_login=session_user AND organization_id=org AND purpose=kind AND starts_at<=clock_timestamp() AND ends_at>clock_timestamp() AND revoked_at IS NULL)
$$;
CREATE FUNCTION private.work_deliver_one() RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,private AS $$
DECLARE e private.integration_outbox; r private.workflow_request; BEGIN
 SELECT o.* INTO e FROM private.integration_outbox o WHERE o.processed_at IS NULL AND private.work_worker_can(o.organization_id,'notification') AND NOT EXISTS(SELECT 1 FROM private.integration_outbox p WHERE p.aggregate_id=o.aggregate_id AND p.aggregate_version<o.aggregate_version AND p.processed_at IS NULL) ORDER BY o.occurred_at,o.id FOR UPDATE SKIP LOCKED LIMIT 1;
 IF NOT FOUND THEN RETURN NULL; END IF; PERFORM private.work_actor(); PERFORM set_config('app.correlation_id',e.correlation_id::text,true);
 SELECT * INTO r FROM private.workflow_request WHERE id=e.aggregate_id;
 INSERT INTO private.portal_notification(event_id,account_id,request_id,event_type) VALUES(e.id,r.created_by_account_id,r.id,e.payload->>'status') ON CONFLICT(event_id,account_id) DO NOTHING;
 INSERT INTO private.integration_receipt(event_id,consumer) VALUES(e.id,'portal-notifications') ON CONFLICT(event_id,consumer) DO NOTHING;
 UPDATE private.integration_outbox SET processed_at=CURRENT_TIMESTAMP WHERE id=e.id; RETURN e.id;
END $$;
CREATE FUNCTION private.work_scan_candidates() RETURNS SETOF jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,private AS $$ BEGIN
 RETURN QUERY SELECT jsonb_build_object('id',v.id,'object_key',v.object_key,'sha256',v.sha256,'size_bytes',v.size_bytes) FROM private.file_version v JOIN private.document d ON d.id=v.document_id WHERE v.scan_status='QUARANTINED' AND private.work_worker_can(d.owner_organization_id,'scan') ORDER BY v.created_at LIMIT 10;
END $$;
CREATE FUNCTION private.work_scan_result(v uuid,sha text,result text,engine text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,private AS $$
DECLARE r private.file_version; org uuid; BEGIN
 SELECT * INTO r FROM private.file_version WHERE id=v FOR UPDATE; SELECT owner_organization_id INTO org FROM private.document WHERE id=r.document_id;
 IF NOT FOUND OR NOT private.work_worker_can(org,'scan') OR r.sha256<>sha OR result NOT IN ('CLEAN','REJECTED') OR engine<>'CLAMAV_INSTREAM' THEN RAISE EXCEPTION 'WORK_FORBIDDEN' USING ERRCODE='42501'; END IF;
 IF r.scan_status IN ('CLEAN','REJECTED') THEN IF r.scan_status<>result THEN RAISE EXCEPTION 'WORK_SCAN_CONFLICT' USING ERRCODE='40001'; END IF; RETURN; END IF;
 IF r.scan_status<>'QUARANTINED' THEN RAISE EXCEPTION 'WORK_STATE_CONFLICT' USING ERRCODE='40001'; END IF;
 PERFORM private.work_actor(); PERFORM set_config('app.correlation_id',gen_random_uuid()::text,true); UPDATE private.file_version SET scan_status=result,scanned_at=CURRENT_TIMESTAMP,scan_engine=engine WHERE id=v;
END $$;
-- Own helper functions by a role subject to FORCE RLS, pin search_path, remove default PUBLIC execution.
DO $$ DECLARE p record; BEGIN FOR p IN SELECT oid::regprocedure AS signature FROM pg_proc WHERE pronamespace='private'::regnamespace AND proname LIKE 'work_%' LOOP
 EXECUTE format('ALTER FUNCTION %s OWNER TO portal_work_guard',p.signature);
 EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC',p.signature);
END LOOP; END $$;
GRANT EXECUTE ON FUNCTION private.work_file_prepare(uuid,uuid,text,text,integer,text,uuid),private.work_file_uploaded(uuid,text),private.work_files(),private.work_file_read(uuid),private.work_share(uuid,uuid,timestamptz),private.work_revoke(uuid,uuid),private.work_save(uuid,uuid,text,jsonb,uuid[],integer,uuid),private.work_requests(),private.work_transition(uuid,integer,text,text,uuid),private.work_notifications(),private.work_notification_ack(uuid) TO portal_runtime;
GRANT EXECUTE ON FUNCTION private.work_deliver_one() TO portal_event_worker;
GRANT EXECUTE ON FUNCTION private.work_scan_candidates(),private.work_scan_result(uuid,text,text,text) TO portal_scan_worker;
COMMIT;
