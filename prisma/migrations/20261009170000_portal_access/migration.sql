BEGIN;
CREATE ROLE portal_runtime NOLOGIN NOSUPERUSER NOBYPASSRLS;
CREATE ROLE portal_auth_guard NOLOGIN NOSUPERUSER NOBYPASSRLS;
GRANT portal_auth_guard TO CURRENT_USER;
CREATE TABLE private.user_account (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), auth_user_id uuid NOT NULL UNIQUE,
 person_id uuid UNIQUE REFERENCES private.person(id) ON DELETE RESTRICT,
 is_active boolean NOT NULL DEFAULT true, require_mfa boolean NOT NULL DEFAULT true,
 revoked_before timestamptz NOT NULL DEFAULT '-infinity', created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE private.role_assignment (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), account_id uuid NOT NULL REFERENCES private.user_account(id) ON DELETE RESTRICT,
 organization_id uuid REFERENCES private.organization(id) ON DELETE RESTRICT,
 role_code text NOT NULL CHECK(role_code IN ('REGISTER_READER','TECHNICAL_ADMIN')),
 actions text[] NOT NULL CHECK(actions <@ ARRAY['people.read','organizations.read','admin.read']::text[] AND cardinality(actions)>0),
 starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL CHECK(ends_at>starts_at), revoked_at timestamptz,
 CHECK((role_code='REGISTER_READER' AND organization_id IS NOT NULL AND NOT 'admin.read'=ANY(actions)) OR (role_code='TECHNICAL_ADMIN' AND organization_id IS NULL AND actions=ARRAY['admin.read']::text[]))
);
CREATE INDEX role_assignment_lookup ON private.role_assignment(account_id, organization_id, starts_at, ends_at);
CREATE TABLE private.portal_session (
 token_hash text PRIMARY KEY CHECK(token_hash ~ '^[a-f0-9]{64}$'), account_id uuid NOT NULL REFERENCES private.user_account(id) ON DELETE RESTRICT,
 created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, expires_at timestamptz NOT NULL CHECK(expires_at>created_at), revoked_at timestamptz
);
CREATE TABLE private.person_affiliation (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), person_id uuid NOT NULL REFERENCES private.person(id) ON DELETE RESTRICT,
 organization_id uuid NOT NULL REFERENCES private.organization(id) ON DELETE RESTRICT,
 effective_from date NOT NULL, effective_to date CHECK(effective_to IS NULL OR effective_to>effective_from),
 recorded_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 evidence_document_id uuid NOT NULL REFERENCES private.document(id) ON DELETE RESTRICT,
 UNIQUE(person_id, organization_id, effective_from)
);
CREATE TABLE private.portal_auth_limit (key_hash text PRIMARY KEY, window_start timestamptz NOT NULL, attempts integer NOT NULL CHECK(attempts>0));
CREATE TABLE private.portal_access_event (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), account_id uuid NOT NULL REFERENCES private.user_account(id) ON DELETE RESTRICT,
 event_type text NOT NULL CHECK(event_type IN ('login','logout','people.read','organizations.read','admin.read')),
 occurred_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE FUNCTION private.portal_uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('app.auth_uid',true),'')::uuid $$;
CREATE FUNCTION private.portal_account() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT id FROM private.user_account WHERE auth_user_id=private.portal_uid() AND is_active $$;
CREATE FUNCTION private.portal_can(action_name text, org_id uuid) RETURNS boolean LANGUAGE sql STABLE AS $$
 SELECT EXISTS(SELECT 1 FROM private.role_assignment r WHERE r.account_id=private.portal_account()
 AND action_name=ANY(r.actions) AND r.organization_id IS NOT DISTINCT FROM org_id
 AND r.starts_at<=CURRENT_TIMESTAMP AND r.ends_at>CURRENT_TIMESTAMP AND r.revoked_at IS NULL)
$$;
CREATE FUNCTION private.portal_login_attempt(attempt_key text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,private,pg_temp AS $$
DECLARE n integer;
BEGIN
 IF attempt_key !~ '^[a-f0-9]{64}$' THEN RETURN false; END IF;
 INSERT INTO private.portal_auth_limit(key_hash,window_start,attempts) VALUES(attempt_key,CURRENT_TIMESTAMP,1)
 ON CONFLICT(key_hash) DO UPDATE SET
 attempts=CASE WHEN portal_auth_limit.window_start<CURRENT_TIMESTAMP-interval '10 minutes' THEN 1 ELSE portal_auth_limit.attempts+1 END,
 window_start=CASE WHEN portal_auth_limit.window_start<CURRENT_TIMESTAMP-interval '10 minutes' THEN CURRENT_TIMESTAMP ELSE portal_auth_limit.window_start END
 RETURNING attempts INTO n;
 RETURN n<=10;
END $$;
ALTER TABLE private.user_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.user_account FORCE ROW LEVEL SECURITY;
CREATE POLICY portal_self ON private.user_account FOR SELECT TO portal_runtime USING(auth_user_id=private.portal_uid());
ALTER TABLE private.role_assignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.role_assignment FORCE ROW LEVEL SECURITY;
CREATE POLICY portal_self ON private.role_assignment FOR SELECT TO portal_runtime USING(account_id=private.portal_account());
ALTER TABLE private.portal_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.portal_session FORCE ROW LEVEL SECURITY;
CREATE POLICY portal_self ON private.portal_session TO portal_runtime USING(account_id=private.portal_account()) WITH CHECK(account_id=private.portal_account());
ALTER TABLE private.person_affiliation ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.person_affiliation FORCE ROW LEVEL SECURITY;
CREATE POLICY portal_scope ON private.person_affiliation FOR SELECT TO portal_runtime USING(private.portal_can('people.read',organization_id));
ALTER TABLE private.portal_auth_limit ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.portal_auth_limit FORCE ROW LEVEL SECURITY;
CREATE POLICY auth_guard_only ON private.portal_auth_limit TO portal_auth_guard USING(true) WITH CHECK(true);
GRANT USAGE ON SCHEMA private TO portal_auth_guard;
GRANT SELECT,INSERT,UPDATE ON private.portal_auth_limit TO portal_auth_guard;
ALTER FUNCTION private.portal_login_attempt(text) OWNER TO portal_auth_guard;
ALTER TABLE private.portal_access_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.portal_access_event FORCE ROW LEVEL SECURITY;
CREATE POLICY portal_self ON private.portal_access_event FOR INSERT TO portal_runtime WITH CHECK(account_id=private.portal_account());
CREATE POLICY portal_scope ON private.organization FOR SELECT TO portal_runtime USING(private.portal_can('organizations.read',id));
CREATE POLICY portal_scope ON private.organization_name_history FOR SELECT TO portal_runtime USING(private.portal_can('organizations.read',organization_id));
CREATE POLICY portal_scope ON private.person FOR SELECT TO portal_runtime USING(EXISTS(SELECT 1 FROM private.person_affiliation a WHERE a.person_id=person.id AND private.portal_can('people.read',a.organization_id) AND a.effective_from<=(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Bangkok')::date AND (a.effective_to IS NULL OR a.effective_to>(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Bangkok')::date)));
CREATE POLICY portal_scope ON private.person_name_history FOR SELECT TO portal_runtime USING(EXISTS(SELECT 1 FROM private.person p WHERE p.id=person_id));
GRANT USAGE ON SCHEMA private TO portal_runtime;
GRANT SELECT ON private.user_account,private.role_assignment,private.person,private.person_name_history,private.person_affiliation,private.organization,private.organization_name_history TO portal_runtime;
GRANT SELECT,INSERT,UPDATE ON private.portal_session TO portal_runtime;
GRANT INSERT ON private.portal_access_event TO portal_runtime;
REVOKE ALL ON private.user_account,private.role_assignment,private.portal_session,private.person_affiliation,private.portal_auth_limit,private.portal_access_event FROM PUBLIC;
REVOKE ALL ON FUNCTION private.portal_uid(),private.portal_account(),private.portal_can(text,uuid),private.portal_login_attempt(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.portal_uid(),private.portal_account(),private.portal_can(text,uuid),private.portal_login_attempt(text) TO portal_runtime;
COMMIT;
