-- Core v0.6.0: apply through Prisma migrate only. PostgreSQL18 compatible.
BEGIN;
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "private";

-- CreateTable
CREATE TABLE "private"."service_actor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_code" TEXT NOT NULL,
    "label_th" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "service_actor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."reference_code" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_actor_id" UUID NOT NULL,
    "updated_by_actor_id" UUID NOT NULL,
    "row_version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "code_set" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label_th" TEXT NOT NULL,
    "verification_status" TEXT NOT NULL DEFAULT 'TO_VERIFY',

    CONSTRAINT "reference_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."organization_type" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_actor_id" UUID NOT NULL,
    "updated_by_actor_id" UUID NOT NULL,
    "row_version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "type_code" TEXT NOT NULL,
    "label_th" TEXT NOT NULL,
    "verification_status" TEXT NOT NULL DEFAULT 'TO_VERIFY',

    CONSTRAINT "organization_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."geography" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_actor_id" UUID NOT NULL,
    "updated_by_actor_id" UUID NOT NULL,
    "row_version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "geography_code" TEXT NOT NULL,
    "geography_kind_id" UUID NOT NULL,
    "label_th" TEXT NOT NULL,
    "parent_geography_id" UUID,

    CONSTRAINT "geography_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."organization" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_actor_id" UUID NOT NULL,
    "updated_by_actor_id" UUID NOT NULL,
    "row_version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "organization_code" TEXT NOT NULL,
    "organization_type_id" UUID NOT NULL,
    "current_status_id" UUID NOT NULL,
    "merged_into_organization_id" UUID,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."document" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_actor_id" UUID NOT NULL,
    "updated_by_actor_id" UUID NOT NULL,
    "row_version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "document_code" TEXT NOT NULL,
    "owner_organization_id" UUID NOT NULL,
    "document_kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "visibility_class" TEXT NOT NULL DEFAULT 'H',
    "lifecycle_status" TEXT NOT NULL DEFAULT 'METADATA_ONLY',

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."policy_version" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_actor_id" UUID NOT NULL,
    "updated_by_actor_id" UUID NOT NULL,
    "row_version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "policy_namespace" TEXT NOT NULL,
    "version_no" INTEGER NOT NULL,
    "verification_status" TEXT NOT NULL DEFAULT 'TO_VERIFY',
    "configuration" JSONB NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "evidence_document_id" UUID,

    CONSTRAINT "policy_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."person" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_actor_id" UUID NOT NULL,
    "updated_by_actor_id" UUID NOT NULL,
    "row_version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "person_code" TEXT NOT NULL,
    "identity_review_status_id" UUID NOT NULL,
    "current_state_id" UUID NOT NULL,
    "merged_into_person_id" UUID,

    CONSTRAINT "person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."person_private" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_actor_id" UUID NOT NULL,
    "updated_by_actor_id" UUID NOT NULL,
    "row_version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "person_id" UUID NOT NULL,
    "birth_date" DATE,
    "private_address_text" TEXT,
    "private_phone" TEXT,
    "private_notes" TEXT,

    CONSTRAINT "person_private_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."person_name_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recorded_by_actor_id" UUID NOT NULL,
    "evidence_document_id" UUID NOT NULL,
    "superseded_at" TIMESTAMPTZ(6),
    "replaces_id" UUID,
    "person_id" UUID NOT NULL,
    "name_kind_id" UUID NOT NULL,
    "prefix_text" TEXT,
    "given_name" TEXT NOT NULL,
    "family_name" TEXT,

    CONSTRAINT "person_name_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."person_contact" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recorded_by_actor_id" UUID NOT NULL,
    "evidence_document_id" UUID NOT NULL,
    "superseded_at" TIMESTAMPTZ(6),
    "replaces_id" UUID,
    "person_id" UUID NOT NULL,
    "contact_code" TEXT NOT NULL,
    "channel_kind_id" UUID NOT NULL,
    "contact_value" TEXT NOT NULL,
    "is_public_eligible" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "person_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."organization_name_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recorded_by_actor_id" UUID NOT NULL,
    "evidence_document_id" UUID NOT NULL,
    "superseded_at" TIMESTAMPTZ(6),
    "replaces_id" UUID,
    "organization_id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,

    CONSTRAINT "organization_name_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."address_version" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recorded_by_actor_id" UUID NOT NULL,
    "evidence_document_id" UUID NOT NULL,
    "superseded_at" TIMESTAMPTZ(6),
    "replaces_id" UUID,
    "organization_id" UUID NOT NULL,
    "address_kind_id" UUID NOT NULL,
    "address_text" TEXT NOT NULL,
    "geography_id" UUID NOT NULL,
    "postal_code" TEXT,

    CONSTRAINT "address_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."organization_contact" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recorded_by_actor_id" UUID NOT NULL,
    "evidence_document_id" UUID NOT NULL,
    "superseded_at" TIMESTAMPTZ(6),
    "replaces_id" UUID,
    "organization_id" UUID NOT NULL,
    "contact_code" TEXT NOT NULL,
    "channel_kind_id" UUID NOT NULL,
    "contact_value" TEXT NOT NULL,
    "is_public_eligible" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "organization_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."academic_year" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_actor_id" UUID NOT NULL,
    "updated_by_actor_id" UUID NOT NULL,
    "row_version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "year_code" TEXT NOT NULL,
    "label_year_ce" INTEGER NOT NULL,
    "starts_on" DATE NOT NULL,
    "ends_on" DATE NOT NULL,
    "policy_version_id" UUID NOT NULL,

    CONSTRAINT "academic_year_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."fiscal_year" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_actor_id" UUID NOT NULL,
    "updated_by_actor_id" UUID NOT NULL,
    "row_version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "year_code" TEXT NOT NULL,
    "label_year_ce" INTEGER NOT NULL,
    "starts_on" DATE NOT NULL,
    "ends_on" DATE NOT NULL,
    "policy_version_id" UUID NOT NULL,

    CONSTRAINT "fiscal_year_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."exam_type" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_actor_id" UUID NOT NULL,
    "updated_by_actor_id" UUID NOT NULL,
    "row_version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "type_code" TEXT NOT NULL,
    "label_th" TEXT NOT NULL,
    "verification_status" TEXT NOT NULL DEFAULT 'TO_VERIFY',

    CONSTRAINT "exam_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."exam_level" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_actor_id" UUID NOT NULL,
    "updated_by_actor_id" UUID NOT NULL,
    "row_version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "exam_type_id" UUID NOT NULL,
    "level_code" TEXT NOT NULL,
    "label_th" TEXT NOT NULL,
    "verification_status" TEXT NOT NULL DEFAULT 'TO_VERIFY',

    CONSTRAINT "exam_level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private"."audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "service_actor_id" UUID NOT NULL,
    "action_code" TEXT NOT NULL,
    "target_kind" TEXT NOT NULL,
    "target_id" UUID NOT NULL,
    "changed_fields" TEXT[],
    "correlation_id" UUID NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_actor_actor_code_key" ON "private"."service_actor"("actor_code");

-- CreateIndex
CREATE UNIQUE INDEX "reference_code_code_set_code_key" ON "private"."reference_code"("code_set", "code");

-- CreateIndex
CREATE UNIQUE INDEX "organization_type_type_code_key" ON "private"."organization_type"("type_code");

-- CreateIndex
CREATE UNIQUE INDEX "geography_geography_code_key" ON "private"."geography"("geography_code");

-- CreateIndex
CREATE INDEX "geography_parent_geography_id_idx" ON "private"."geography"("parent_geography_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_organization_code_key" ON "private"."organization"("organization_code");

-- CreateIndex
CREATE INDEX "organization_organization_type_id_idx" ON "private"."organization"("organization_type_id");

-- CreateIndex
CREATE INDEX "organization_merged_into_organization_id_idx" ON "private"."organization"("merged_into_organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_document_code_key" ON "private"."document"("document_code");

-- CreateIndex
CREATE INDEX "document_owner_organization_id_idx" ON "private"."document"("owner_organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "policy_version_policy_namespace_version_no_key" ON "private"."policy_version"("policy_namespace", "version_no");

-- CreateIndex
CREATE UNIQUE INDEX "person_person_code_key" ON "private"."person"("person_code");

-- CreateIndex
CREATE INDEX "person_merged_into_person_id_idx" ON "private"."person"("merged_into_person_id");

-- CreateIndex
CREATE UNIQUE INDEX "person_private_person_id_key" ON "private"."person_private"("person_id");

-- CreateIndex
CREATE INDEX "person_name_history_person_id_name_kind_id_effective_from_idx" ON "private"."person_name_history"("person_id", "name_kind_id", "effective_from");

-- CreateIndex
CREATE INDEX "person_contact_person_id_effective_from_idx" ON "private"."person_contact"("person_id", "effective_from");

-- CreateIndex
CREATE UNIQUE INDEX "person_contact_contact_code_effective_from_recorded_at_key" ON "private"."person_contact"("contact_code", "effective_from", "recorded_at");

-- CreateIndex
CREATE INDEX "organization_name_history_organization_id_effective_from_idx" ON "private"."organization_name_history"("organization_id", "effective_from");

-- CreateIndex
CREATE INDEX "address_version_organization_id_address_kind_id_effective_f_idx" ON "private"."address_version"("organization_id", "address_kind_id", "effective_from");

-- CreateIndex
CREATE INDEX "address_version_geography_id_idx" ON "private"."address_version"("geography_id");

-- CreateIndex
CREATE INDEX "organization_contact_organization_id_effective_from_idx" ON "private"."organization_contact"("organization_id", "effective_from");

-- CreateIndex
CREATE UNIQUE INDEX "organization_contact_contact_code_effective_from_recorded_a_key" ON "private"."organization_contact"("contact_code", "effective_from", "recorded_at");

-- CreateIndex
CREATE UNIQUE INDEX "academic_year_year_code_key" ON "private"."academic_year"("year_code");

-- CreateIndex
CREATE UNIQUE INDEX "fiscal_year_year_code_key" ON "private"."fiscal_year"("year_code");

-- CreateIndex
CREATE UNIQUE INDEX "exam_type_type_code_key" ON "private"."exam_type"("type_code");

-- CreateIndex
CREATE UNIQUE INDEX "exam_level_exam_type_id_level_code_key" ON "private"."exam_level"("exam_type_id", "level_code");

-- CreateIndex
CREATE UNIQUE INDEX "exam_level_id_exam_type_id_key" ON "private"."exam_level"("id", "exam_type_id");

-- CreateIndex
CREATE INDEX "audit_logs_target_kind_target_id_recorded_at_idx" ON "private"."audit_logs"("target_kind", "target_id", "recorded_at");

-- CreateIndex
CREATE INDEX "audit_logs_service_actor_id_recorded_at_idx" ON "private"."audit_logs"("service_actor_id", "recorded_at");

-- AddForeignKey
ALTER TABLE "private"."reference_code" ADD CONSTRAINT "reference_code_created_by_actor_id_fkey" FOREIGN KEY ("created_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."reference_code" ADD CONSTRAINT "reference_code_updated_by_actor_id_fkey" FOREIGN KEY ("updated_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."organization_type" ADD CONSTRAINT "organization_type_created_by_actor_id_fkey" FOREIGN KEY ("created_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."organization_type" ADD CONSTRAINT "organization_type_updated_by_actor_id_fkey" FOREIGN KEY ("updated_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."geography" ADD CONSTRAINT "geography_created_by_actor_id_fkey" FOREIGN KEY ("created_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."geography" ADD CONSTRAINT "geography_updated_by_actor_id_fkey" FOREIGN KEY ("updated_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."geography" ADD CONSTRAINT "geography_geography_kind_id_fkey" FOREIGN KEY ("geography_kind_id") REFERENCES "private"."reference_code"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."geography" ADD CONSTRAINT "geography_parent_geography_id_fkey" FOREIGN KEY ("parent_geography_id") REFERENCES "private"."geography"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."organization" ADD CONSTRAINT "organization_created_by_actor_id_fkey" FOREIGN KEY ("created_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."organization" ADD CONSTRAINT "organization_updated_by_actor_id_fkey" FOREIGN KEY ("updated_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."organization" ADD CONSTRAINT "organization_organization_type_id_fkey" FOREIGN KEY ("organization_type_id") REFERENCES "private"."organization_type"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."organization" ADD CONSTRAINT "organization_current_status_id_fkey" FOREIGN KEY ("current_status_id") REFERENCES "private"."reference_code"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."organization" ADD CONSTRAINT "organization_merged_into_organization_id_fkey" FOREIGN KEY ("merged_into_organization_id") REFERENCES "private"."organization"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."document" ADD CONSTRAINT "document_created_by_actor_id_fkey" FOREIGN KEY ("created_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."document" ADD CONSTRAINT "document_updated_by_actor_id_fkey" FOREIGN KEY ("updated_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."document" ADD CONSTRAINT "document_owner_organization_id_fkey" FOREIGN KEY ("owner_organization_id") REFERENCES "private"."organization"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."policy_version" ADD CONSTRAINT "policy_version_created_by_actor_id_fkey" FOREIGN KEY ("created_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."policy_version" ADD CONSTRAINT "policy_version_updated_by_actor_id_fkey" FOREIGN KEY ("updated_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."policy_version" ADD CONSTRAINT "policy_version_evidence_document_id_fkey" FOREIGN KEY ("evidence_document_id") REFERENCES "private"."document"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."person" ADD CONSTRAINT "person_created_by_actor_id_fkey" FOREIGN KEY ("created_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."person" ADD CONSTRAINT "person_updated_by_actor_id_fkey" FOREIGN KEY ("updated_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."person" ADD CONSTRAINT "person_identity_review_status_id_fkey" FOREIGN KEY ("identity_review_status_id") REFERENCES "private"."reference_code"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."person" ADD CONSTRAINT "person_current_state_id_fkey" FOREIGN KEY ("current_state_id") REFERENCES "private"."reference_code"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."person" ADD CONSTRAINT "person_merged_into_person_id_fkey" FOREIGN KEY ("merged_into_person_id") REFERENCES "private"."person"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."person_private" ADD CONSTRAINT "person_private_created_by_actor_id_fkey" FOREIGN KEY ("created_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."person_private" ADD CONSTRAINT "person_private_updated_by_actor_id_fkey" FOREIGN KEY ("updated_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."person_private" ADD CONSTRAINT "person_private_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "private"."person"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."person_name_history" ADD CONSTRAINT "person_name_history_recorded_by_actor_id_fkey" FOREIGN KEY ("recorded_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."person_name_history" ADD CONSTRAINT "person_name_history_evidence_document_id_fkey" FOREIGN KEY ("evidence_document_id") REFERENCES "private"."document"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."person_name_history" ADD CONSTRAINT "person_name_history_replaces_id_fkey" FOREIGN KEY ("replaces_id") REFERENCES "private"."person_name_history"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."person_name_history" ADD CONSTRAINT "person_name_history_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "private"."person"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."person_name_history" ADD CONSTRAINT "person_name_history_name_kind_id_fkey" FOREIGN KEY ("name_kind_id") REFERENCES "private"."reference_code"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."person_contact" ADD CONSTRAINT "person_contact_recorded_by_actor_id_fkey" FOREIGN KEY ("recorded_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."person_contact" ADD CONSTRAINT "person_contact_evidence_document_id_fkey" FOREIGN KEY ("evidence_document_id") REFERENCES "private"."document"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."person_contact" ADD CONSTRAINT "person_contact_replaces_id_fkey" FOREIGN KEY ("replaces_id") REFERENCES "private"."person_contact"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."person_contact" ADD CONSTRAINT "person_contact_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "private"."person"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."person_contact" ADD CONSTRAINT "person_contact_channel_kind_id_fkey" FOREIGN KEY ("channel_kind_id") REFERENCES "private"."reference_code"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."organization_name_history" ADD CONSTRAINT "organization_name_history_recorded_by_actor_id_fkey" FOREIGN KEY ("recorded_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."organization_name_history" ADD CONSTRAINT "organization_name_history_evidence_document_id_fkey" FOREIGN KEY ("evidence_document_id") REFERENCES "private"."document"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."organization_name_history" ADD CONSTRAINT "organization_name_history_replaces_id_fkey" FOREIGN KEY ("replaces_id") REFERENCES "private"."organization_name_history"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."organization_name_history" ADD CONSTRAINT "organization_name_history_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "private"."organization"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."address_version" ADD CONSTRAINT "address_version_recorded_by_actor_id_fkey" FOREIGN KEY ("recorded_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."address_version" ADD CONSTRAINT "address_version_evidence_document_id_fkey" FOREIGN KEY ("evidence_document_id") REFERENCES "private"."document"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."address_version" ADD CONSTRAINT "address_version_replaces_id_fkey" FOREIGN KEY ("replaces_id") REFERENCES "private"."address_version"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."address_version" ADD CONSTRAINT "address_version_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "private"."organization"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."address_version" ADD CONSTRAINT "address_version_address_kind_id_fkey" FOREIGN KEY ("address_kind_id") REFERENCES "private"."reference_code"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."address_version" ADD CONSTRAINT "address_version_geography_id_fkey" FOREIGN KEY ("geography_id") REFERENCES "private"."geography"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."organization_contact" ADD CONSTRAINT "organization_contact_recorded_by_actor_id_fkey" FOREIGN KEY ("recorded_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."organization_contact" ADD CONSTRAINT "organization_contact_evidence_document_id_fkey" FOREIGN KEY ("evidence_document_id") REFERENCES "private"."document"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."organization_contact" ADD CONSTRAINT "organization_contact_replaces_id_fkey" FOREIGN KEY ("replaces_id") REFERENCES "private"."organization_contact"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."organization_contact" ADD CONSTRAINT "organization_contact_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "private"."organization"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."organization_contact" ADD CONSTRAINT "organization_contact_channel_kind_id_fkey" FOREIGN KEY ("channel_kind_id") REFERENCES "private"."reference_code"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."academic_year" ADD CONSTRAINT "academic_year_created_by_actor_id_fkey" FOREIGN KEY ("created_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."academic_year" ADD CONSTRAINT "academic_year_updated_by_actor_id_fkey" FOREIGN KEY ("updated_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."academic_year" ADD CONSTRAINT "academic_year_policy_version_id_fkey" FOREIGN KEY ("policy_version_id") REFERENCES "private"."policy_version"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."fiscal_year" ADD CONSTRAINT "fiscal_year_created_by_actor_id_fkey" FOREIGN KEY ("created_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."fiscal_year" ADD CONSTRAINT "fiscal_year_updated_by_actor_id_fkey" FOREIGN KEY ("updated_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."fiscal_year" ADD CONSTRAINT "fiscal_year_policy_version_id_fkey" FOREIGN KEY ("policy_version_id") REFERENCES "private"."policy_version"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."exam_type" ADD CONSTRAINT "exam_type_created_by_actor_id_fkey" FOREIGN KEY ("created_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."exam_type" ADD CONSTRAINT "exam_type_updated_by_actor_id_fkey" FOREIGN KEY ("updated_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."exam_level" ADD CONSTRAINT "exam_level_created_by_actor_id_fkey" FOREIGN KEY ("created_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."exam_level" ADD CONSTRAINT "exam_level_updated_by_actor_id_fkey" FOREIGN KEY ("updated_by_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."exam_level" ADD CONSTRAINT "exam_level_exam_type_id_fkey" FOREIGN KEY ("exam_type_id") REFERENCES "private"."exam_type"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "private"."audit_logs" ADD CONSTRAINT "audit_logs_service_actor_id_fkey" FOREIGN KEY ("service_actor_id") REFERENCES "private"."service_actor"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;



-- Extension needed for UUID/text equality in temporal exclusion constraints.
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA private FROM PUBLIC;

-- Local provenance only; NOT an authentication/authorization context.
-- No runtime policy trusts this user-settable setting.
CREATE FUNCTION private.require_service_actor() RETURNS uuid
LANGUAGE plpgsql SET search_path = pg_catalog, private AS $$
DECLARE actor uuid;
BEGIN
  actor := NULLIF(current_setting('app.service_actor_id', true), '')::uuid;
  IF actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM private.service_actor WHERE id=actor AND is_active
  ) THEN RAISE EXCEPTION 'Active service actor context required' USING ERRCODE='23514'; END IF;
  RETURN actor;
END $$;

CREATE FUNCTION private.prevent_delete() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Physical delete prohibited; close or supersede record' USING ERRCODE='23514'; END $$;

CREATE FUNCTION private.guard_current_record() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, private AS $$
DECLARE actor uuid;
BEGIN
  actor := private.require_service_actor();
  IF TG_OP = 'INSERT' THEN
    IF NEW.created_by_actor_id <> actor OR NEW.updated_by_actor_id <> actor THEN
      RAISE EXCEPTION 'Provenance must match transaction actor' USING ERRCODE='23514';
    END IF;
  ELSE
    IF NEW.id <> OLD.id OR NEW.created_at <> OLD.created_at OR NEW.created_by_actor_id <> OLD.created_by_actor_id THEN
      RAISE EXCEPTION 'Creation identity is immutable' USING ERRCODE='23514';
    END IF;
    NEW.updated_at := clock_timestamp();
    NEW.updated_by_actor_id := actor;
    NEW.row_version := OLD.row_version + 1;
  END IF;
  RETURN NEW;
END $$;

CREATE FUNCTION private.guard_history() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, private AS $$
DECLARE actor uuid;
BEGIN
  actor := private.require_service_actor();
  IF TG_OP = 'INSERT' THEN
    IF NEW.recorded_by_actor_id <> actor THEN RAISE EXCEPTION 'History actor mismatch' USING ERRCODE='23514'; END IF;
  ELSE
    IF (to_jsonb(NEW) - 'superseded_at') IS DISTINCT FROM (to_jsonb(OLD) - 'superseded_at')
      OR OLD.superseded_at IS NOT NULL OR NEW.superseded_at IS NULL THEN
      RAISE EXCEPTION 'History content is immutable; insert replacement version' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE FUNCTION private.audit_change() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, private AS $$
DECLARE changed text[]; actor uuid; correlation uuid;
BEGIN
  actor := private.require_service_actor();
  correlation := NULLIF(current_setting('app.correlation_id', true), '')::uuid;
  IF correlation IS NULL THEN RAISE EXCEPTION 'Correlation context required' USING ERRCODE='23514'; END IF;
  IF TG_OP='INSERT' THEN SELECT array_agg(key ORDER BY key) INTO changed FROM jsonb_each(to_jsonb(NEW));
  ELSE SELECT array_agg(n.key ORDER BY n.key) INTO changed FROM jsonb_each(to_jsonb(NEW)) n
       WHERE n.value IS DISTINCT FROM (to_jsonb(OLD)->n.key);
  END IF;
  INSERT INTO private.audit_logs(service_actor_id,action_code,target_kind,target_id,changed_fields,correlation_id)
    VALUES(actor,TG_OP,TG_TABLE_NAME,NEW.id,coalesce(changed,ARRAY[]::text[]),correlation);
  RETURN NEW;
END $$;
-- Audit contains field names/record identifiers, never raw old/new content.
CREATE FUNCTION private.protect_audit() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Audit is append-only' USING ERRCODE='23514'; END $$;
CREATE TRIGGER protect_audit BEFORE UPDATE OR DELETE ON private.audit_logs FOR EACH ROW EXECUTE FUNCTION private.protect_audit();

CREATE FUNCTION private.guard_actor() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP='UPDATE' THEN RAISE EXCEPTION 'Bootstrap actors immutable in chapter06' USING ERRCODE='23514'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER guard_actor BEFORE UPDATE ON private.service_actor FOR EACH ROW EXECUTE FUNCTION private.guard_actor();

CREATE FUNCTION private.guard_code_domain() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, private AS $$
DECLARE column_name text; expected_domain text; code_id uuid;
BEGIN
  FOR i IN 0..(TG_NARGS/2 - 1) LOOP
    column_name:=TG_ARGV[i*2]; expected_domain:=TG_ARGV[i*2+1];
    code_id:=(to_jsonb(NEW)->>column_name)::uuid;
    IF NOT EXISTS(SELECT 1 FROM private.reference_code WHERE id=code_id AND code_set=expected_domain AND is_active) THEN
      RAISE EXCEPTION 'Reference code domain mismatch' USING ERRCODE='23514';
    END IF;
  END LOOP;
  RETURN NEW;
END $$;

-- Geography does not encode ecclesiastical/education/authorization hierarchy.
CREATE FUNCTION private.guard_geography_tree() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, private AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(606006);
  IF NEW.parent_geography_id IS NOT NULL AND EXISTS (
    WITH RECURSIVE ancestors AS (
      SELECT id,parent_geography_id FROM private.geography WHERE id=NEW.parent_geography_id
      UNION SELECT g.id,g.parent_geography_id FROM private.geography g JOIN ancestors a ON g.id=a.parent_geography_id
    ) SELECT 1 FROM ancestors WHERE id=NEW.id
  ) THEN RAISE EXCEPTION 'Geography cycle prohibited' USING ERRCODE='23514'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER geography_tree BEFORE INSERT OR UPDATE ON private.geography FOR EACH ROW EXECUTE FUNCTION private.guard_geography_tree();

-- RLS with zero policies: reads/writes default-denied even if table privileges
-- are accidentally granted. Owners forced; PostgreSQL superusers still bypass.
ALTER TABLE private.service_actor ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.service_actor FORCE ROW LEVEL SECURITY;
CREATE TRIGGER deny_delete BEFORE DELETE ON private.service_actor FOR EACH ROW EXECUTE FUNCTION private.prevent_delete();
CREATE TRIGGER audit_change AFTER INSERT OR UPDATE ON private.service_actor FOR EACH ROW EXECUTE FUNCTION private.audit_change();
ALTER TABLE private.reference_code ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.reference_code FORCE ROW LEVEL SECURITY;
CREATE TRIGGER deny_delete BEFORE DELETE ON private.reference_code FOR EACH ROW EXECUTE FUNCTION private.prevent_delete();
CREATE TRIGGER audit_change AFTER INSERT OR UPDATE ON private.reference_code FOR EACH ROW EXECUTE FUNCTION private.audit_change();
ALTER TABLE private.reference_code ADD CONSTRAINT reference_code_row_version_positive CHECK (row_version >= 1);
CREATE TRIGGER current_record BEFORE INSERT OR UPDATE ON private.reference_code FOR EACH ROW EXECUTE FUNCTION private.guard_current_record();
ALTER TABLE private.organization_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.organization_type FORCE ROW LEVEL SECURITY;
CREATE TRIGGER deny_delete BEFORE DELETE ON private.organization_type FOR EACH ROW EXECUTE FUNCTION private.prevent_delete();
CREATE TRIGGER audit_change AFTER INSERT OR UPDATE ON private.organization_type FOR EACH ROW EXECUTE FUNCTION private.audit_change();
ALTER TABLE private.organization_type ADD CONSTRAINT organization_type_row_version_positive CHECK (row_version >= 1);
CREATE TRIGGER current_record BEFORE INSERT OR UPDATE ON private.organization_type FOR EACH ROW EXECUTE FUNCTION private.guard_current_record();
ALTER TABLE private.geography ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.geography FORCE ROW LEVEL SECURITY;
CREATE TRIGGER deny_delete BEFORE DELETE ON private.geography FOR EACH ROW EXECUTE FUNCTION private.prevent_delete();
CREATE TRIGGER audit_change AFTER INSERT OR UPDATE ON private.geography FOR EACH ROW EXECUTE FUNCTION private.audit_change();
ALTER TABLE private.geography ADD CONSTRAINT geography_row_version_positive CHECK (row_version >= 1);
CREATE TRIGGER current_record BEFORE INSERT OR UPDATE ON private.geography FOR EACH ROW EXECUTE FUNCTION private.guard_current_record();
ALTER TABLE private.organization ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.organization FORCE ROW LEVEL SECURITY;
CREATE TRIGGER deny_delete BEFORE DELETE ON private.organization FOR EACH ROW EXECUTE FUNCTION private.prevent_delete();
CREATE TRIGGER audit_change AFTER INSERT OR UPDATE ON private.organization FOR EACH ROW EXECUTE FUNCTION private.audit_change();
ALTER TABLE private.organization ADD CONSTRAINT organization_row_version_positive CHECK (row_version >= 1);
CREATE TRIGGER current_record BEFORE INSERT OR UPDATE ON private.organization FOR EACH ROW EXECUTE FUNCTION private.guard_current_record();
ALTER TABLE private.document ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.document FORCE ROW LEVEL SECURITY;
CREATE TRIGGER deny_delete BEFORE DELETE ON private.document FOR EACH ROW EXECUTE FUNCTION private.prevent_delete();
CREATE TRIGGER audit_change AFTER INSERT OR UPDATE ON private.document FOR EACH ROW EXECUTE FUNCTION private.audit_change();
ALTER TABLE private.document ADD CONSTRAINT document_row_version_positive CHECK (row_version >= 1);
CREATE TRIGGER current_record BEFORE INSERT OR UPDATE ON private.document FOR EACH ROW EXECUTE FUNCTION private.guard_current_record();
ALTER TABLE private.policy_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.policy_version FORCE ROW LEVEL SECURITY;
CREATE TRIGGER deny_delete BEFORE DELETE ON private.policy_version FOR EACH ROW EXECUTE FUNCTION private.prevent_delete();
CREATE TRIGGER audit_change AFTER INSERT OR UPDATE ON private.policy_version FOR EACH ROW EXECUTE FUNCTION private.audit_change();
ALTER TABLE private.policy_version ADD CONSTRAINT policy_version_row_version_positive CHECK (row_version >= 1);
CREATE TRIGGER current_record BEFORE INSERT OR UPDATE ON private.policy_version FOR EACH ROW EXECUTE FUNCTION private.guard_current_record();
ALTER TABLE private.person ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.person FORCE ROW LEVEL SECURITY;
CREATE TRIGGER deny_delete BEFORE DELETE ON private.person FOR EACH ROW EXECUTE FUNCTION private.prevent_delete();
CREATE TRIGGER audit_change AFTER INSERT OR UPDATE ON private.person FOR EACH ROW EXECUTE FUNCTION private.audit_change();
ALTER TABLE private.person ADD CONSTRAINT person_row_version_positive CHECK (row_version >= 1);
CREATE TRIGGER current_record BEFORE INSERT OR UPDATE ON private.person FOR EACH ROW EXECUTE FUNCTION private.guard_current_record();
ALTER TABLE private.person_private ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.person_private FORCE ROW LEVEL SECURITY;
CREATE TRIGGER deny_delete BEFORE DELETE ON private.person_private FOR EACH ROW EXECUTE FUNCTION private.prevent_delete();
CREATE TRIGGER audit_change AFTER INSERT OR UPDATE ON private.person_private FOR EACH ROW EXECUTE FUNCTION private.audit_change();
ALTER TABLE private.person_private ADD CONSTRAINT person_private_row_version_positive CHECK (row_version >= 1);
CREATE TRIGGER current_record BEFORE INSERT OR UPDATE ON private.person_private FOR EACH ROW EXECUTE FUNCTION private.guard_current_record();
ALTER TABLE private.person_name_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.person_name_history FORCE ROW LEVEL SECURITY;
CREATE TRIGGER deny_delete BEFORE DELETE ON private.person_name_history FOR EACH ROW EXECUTE FUNCTION private.prevent_delete();
CREATE TRIGGER audit_change AFTER INSERT OR UPDATE ON private.person_name_history FOR EACH ROW EXECUTE FUNCTION private.audit_change();
ALTER TABLE private.person_name_history ADD CONSTRAINT person_name_history_valid_range CHECK (effective_to IS NULL OR effective_to > effective_from);
ALTER TABLE private.person_name_history ADD CONSTRAINT person_name_history_supersession_time CHECK (superseded_at IS NULL OR superseded_at >= recorded_at);
ALTER TABLE private.person_name_history ADD CONSTRAINT person_name_history_no_self_replacement CHECK (replaces_id IS NULL OR replaces_id <> id);
CREATE TRIGGER immutable_history BEFORE INSERT OR UPDATE ON private.person_name_history FOR EACH ROW EXECUTE FUNCTION private.guard_history();
ALTER TABLE private.person_contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.person_contact FORCE ROW LEVEL SECURITY;
CREATE TRIGGER deny_delete BEFORE DELETE ON private.person_contact FOR EACH ROW EXECUTE FUNCTION private.prevent_delete();
CREATE TRIGGER audit_change AFTER INSERT OR UPDATE ON private.person_contact FOR EACH ROW EXECUTE FUNCTION private.audit_change();
ALTER TABLE private.person_contact ADD CONSTRAINT person_contact_valid_range CHECK (effective_to IS NULL OR effective_to > effective_from);
ALTER TABLE private.person_contact ADD CONSTRAINT person_contact_supersession_time CHECK (superseded_at IS NULL OR superseded_at >= recorded_at);
ALTER TABLE private.person_contact ADD CONSTRAINT person_contact_no_self_replacement CHECK (replaces_id IS NULL OR replaces_id <> id);
CREATE TRIGGER immutable_history BEFORE INSERT OR UPDATE ON private.person_contact FOR EACH ROW EXECUTE FUNCTION private.guard_history();
ALTER TABLE private.organization_name_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.organization_name_history FORCE ROW LEVEL SECURITY;
CREATE TRIGGER deny_delete BEFORE DELETE ON private.organization_name_history FOR EACH ROW EXECUTE FUNCTION private.prevent_delete();
CREATE TRIGGER audit_change AFTER INSERT OR UPDATE ON private.organization_name_history FOR EACH ROW EXECUTE FUNCTION private.audit_change();
ALTER TABLE private.organization_name_history ADD CONSTRAINT organization_name_history_valid_range CHECK (effective_to IS NULL OR effective_to > effective_from);
ALTER TABLE private.organization_name_history ADD CONSTRAINT organization_name_history_supersession_time CHECK (superseded_at IS NULL OR superseded_at >= recorded_at);
ALTER TABLE private.organization_name_history ADD CONSTRAINT organization_name_history_no_self_replacement CHECK (replaces_id IS NULL OR replaces_id <> id);
CREATE TRIGGER immutable_history BEFORE INSERT OR UPDATE ON private.organization_name_history FOR EACH ROW EXECUTE FUNCTION private.guard_history();
ALTER TABLE private.address_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.address_version FORCE ROW LEVEL SECURITY;
CREATE TRIGGER deny_delete BEFORE DELETE ON private.address_version FOR EACH ROW EXECUTE FUNCTION private.prevent_delete();
CREATE TRIGGER audit_change AFTER INSERT OR UPDATE ON private.address_version FOR EACH ROW EXECUTE FUNCTION private.audit_change();
ALTER TABLE private.address_version ADD CONSTRAINT address_version_valid_range CHECK (effective_to IS NULL OR effective_to > effective_from);
ALTER TABLE private.address_version ADD CONSTRAINT address_version_supersession_time CHECK (superseded_at IS NULL OR superseded_at >= recorded_at);
ALTER TABLE private.address_version ADD CONSTRAINT address_version_no_self_replacement CHECK (replaces_id IS NULL OR replaces_id <> id);
CREATE TRIGGER immutable_history BEFORE INSERT OR UPDATE ON private.address_version FOR EACH ROW EXECUTE FUNCTION private.guard_history();
ALTER TABLE private.organization_contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.organization_contact FORCE ROW LEVEL SECURITY;
CREATE TRIGGER deny_delete BEFORE DELETE ON private.organization_contact FOR EACH ROW EXECUTE FUNCTION private.prevent_delete();
CREATE TRIGGER audit_change AFTER INSERT OR UPDATE ON private.organization_contact FOR EACH ROW EXECUTE FUNCTION private.audit_change();
ALTER TABLE private.organization_contact ADD CONSTRAINT organization_contact_valid_range CHECK (effective_to IS NULL OR effective_to > effective_from);
ALTER TABLE private.organization_contact ADD CONSTRAINT organization_contact_supersession_time CHECK (superseded_at IS NULL OR superseded_at >= recorded_at);
ALTER TABLE private.organization_contact ADD CONSTRAINT organization_contact_no_self_replacement CHECK (replaces_id IS NULL OR replaces_id <> id);
CREATE TRIGGER immutable_history BEFORE INSERT OR UPDATE ON private.organization_contact FOR EACH ROW EXECUTE FUNCTION private.guard_history();
ALTER TABLE private.academic_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.academic_year FORCE ROW LEVEL SECURITY;
CREATE TRIGGER deny_delete BEFORE DELETE ON private.academic_year FOR EACH ROW EXECUTE FUNCTION private.prevent_delete();
CREATE TRIGGER audit_change AFTER INSERT OR UPDATE ON private.academic_year FOR EACH ROW EXECUTE FUNCTION private.audit_change();
ALTER TABLE private.academic_year ADD CONSTRAINT academic_year_row_version_positive CHECK (row_version >= 1);
CREATE TRIGGER current_record BEFORE INSERT OR UPDATE ON private.academic_year FOR EACH ROW EXECUTE FUNCTION private.guard_current_record();
ALTER TABLE private.fiscal_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.fiscal_year FORCE ROW LEVEL SECURITY;
CREATE TRIGGER deny_delete BEFORE DELETE ON private.fiscal_year FOR EACH ROW EXECUTE FUNCTION private.prevent_delete();
CREATE TRIGGER audit_change AFTER INSERT OR UPDATE ON private.fiscal_year FOR EACH ROW EXECUTE FUNCTION private.audit_change();
ALTER TABLE private.fiscal_year ADD CONSTRAINT fiscal_year_row_version_positive CHECK (row_version >= 1);
CREATE TRIGGER current_record BEFORE INSERT OR UPDATE ON private.fiscal_year FOR EACH ROW EXECUTE FUNCTION private.guard_current_record();
ALTER TABLE private.exam_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.exam_type FORCE ROW LEVEL SECURITY;
CREATE TRIGGER deny_delete BEFORE DELETE ON private.exam_type FOR EACH ROW EXECUTE FUNCTION private.prevent_delete();
CREATE TRIGGER audit_change AFTER INSERT OR UPDATE ON private.exam_type FOR EACH ROW EXECUTE FUNCTION private.audit_change();
ALTER TABLE private.exam_type ADD CONSTRAINT exam_type_row_version_positive CHECK (row_version >= 1);
CREATE TRIGGER current_record BEFORE INSERT OR UPDATE ON private.exam_type FOR EACH ROW EXECUTE FUNCTION private.guard_current_record();
ALTER TABLE private.exam_level ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.exam_level FORCE ROW LEVEL SECURITY;
CREATE TRIGGER deny_delete BEFORE DELETE ON private.exam_level FOR EACH ROW EXECUTE FUNCTION private.prevent_delete();
CREATE TRIGGER audit_change AFTER INSERT OR UPDATE ON private.exam_level FOR EACH ROW EXECUTE FUNCTION private.audit_change();
ALTER TABLE private.exam_level ADD CONSTRAINT exam_level_row_version_positive CHECK (row_version >= 1);
CREATE TRIGGER current_record BEFORE INSERT OR UPDATE ON private.exam_level FOR EACH ROW EXECUTE FUNCTION private.guard_current_record();
ALTER TABLE private.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.audit_logs FORCE ROW LEVEL SECURITY;
CREATE TRIGGER deny_delete BEFORE DELETE ON private.audit_logs FOR EACH ROW EXECUTE FUNCTION private.prevent_delete();
ALTER TABLE private.person_name_history ADD CONSTRAINT person_name_history_no_current_overlap EXCLUDE USING gist (person_id WITH =, name_kind_id WITH =, daterange(effective_from, effective_to, '[)') WITH &&) WHERE (superseded_at IS NULL);
ALTER TABLE private.organization_name_history ADD CONSTRAINT organization_name_history_no_current_overlap EXCLUDE USING gist (organization_id WITH =, daterange(effective_from, effective_to, '[)') WITH &&) WHERE (superseded_at IS NULL);
ALTER TABLE private.address_version ADD CONSTRAINT address_version_no_current_overlap EXCLUDE USING gist (organization_id WITH =, address_kind_id WITH =, daterange(effective_from, effective_to, '[)') WITH &&) WHERE (superseded_at IS NULL);
ALTER TABLE private.person_contact ADD CONSTRAINT person_contact_no_current_overlap EXCLUDE USING gist (contact_code WITH =, daterange(effective_from, effective_to, '[)') WITH &&) WHERE (superseded_at IS NULL);
ALTER TABLE private.organization_contact ADD CONSTRAINT organization_contact_no_current_overlap EXCLUDE USING gist (contact_code WITH =, daterange(effective_from, effective_to, '[)') WITH &&) WHERE (superseded_at IS NULL);

CREATE FUNCTION private.guard_history_replacement() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog, private AS $$
DECLARE previous jsonb; dimension_key text;
BEGIN
  IF NEW.replaces_id IS NULL THEN RETURN NEW; END IF;
  EXECUTE format('SELECT to_jsonb(p) FROM private.%I p WHERE id=$1',TG_TABLE_NAME) INTO previous USING NEW.replaces_id;
  IF previous IS NULL OR previous->>'superseded_at' IS NULL THEN
    RAISE EXCEPTION 'Replacement requires superseded predecessor' USING ERRCODE='23514';
  END IF;
  IF NEW.recorded_at < (previous->>'superseded_at')::timestamptz THEN
    RAISE EXCEPTION 'Replacement recorded before predecessor supersession' USING ERRCODE='23514';
  END IF;
  FOR i IN 0..(TG_NARGS-1) LOOP
    dimension_key:=TG_ARGV[i];
    IF previous->>dimension_key IS DISTINCT FROM to_jsonb(NEW)->>dimension_key THEN
      RAISE EXCEPTION 'Replacement identity mismatch' USING ERRCODE='23514';
    END IF;
  END LOOP;
  RETURN NEW;
END $$;
CREATE TRIGGER history_replacement BEFORE INSERT ON private.person_name_history FOR EACH ROW EXECUTE FUNCTION private.guard_history_replacement('person_id', 'name_kind_id');
CREATE TRIGGER history_replacement BEFORE INSERT ON private.organization_name_history FOR EACH ROW EXECUTE FUNCTION private.guard_history_replacement('organization_id');
CREATE TRIGGER history_replacement BEFORE INSERT ON private.address_version FOR EACH ROW EXECUTE FUNCTION private.guard_history_replacement('organization_id', 'address_kind_id');
CREATE TRIGGER history_replacement BEFORE INSERT ON private.person_contact FOR EACH ROW EXECUTE FUNCTION private.guard_history_replacement('person_id', 'channel_kind_id', 'contact_code');
CREATE TRIGGER history_replacement BEFORE INSERT ON private.organization_contact FOR EACH ROW EXECUTE FUNCTION private.guard_history_replacement('organization_id', 'channel_kind_id', 'contact_code');
ALTER TABLE private.academic_year ADD CONSTRAINT academic_year_valid_range CHECK (ends_on > starts_on);
ALTER TABLE private.academic_year ADD CONSTRAINT academic_year_ce_year CHECK (label_year_ce BETWEEN 1900 AND 2200);
ALTER TABLE private.fiscal_year ADD CONSTRAINT fiscal_year_valid_range CHECK (ends_on > starts_on);
ALTER TABLE private.fiscal_year ADD CONSTRAINT fiscal_year_ce_year CHECK (label_year_ce BETWEEN 1900 AND 2200);

ALTER TABLE private.policy_version ADD CONSTRAINT policy_valid_range CHECK (effective_to IS NULL OR effective_to > effective_from);
ALTER TABLE private.policy_version ADD CONSTRAINT policy_version_positive CHECK (version_no > 0);
ALTER TABLE private.policy_version ADD CONSTRAINT policy_status CHECK (verification_status IN ('TO_VERIFY','VERIFIED','RETIRED'));
ALTER TABLE private.document ADD CONSTRAINT document_visibility CHECK (visibility_class IN ('I','R','H'));
ALTER TABLE private.person ADD CONSTRAINT person_no_self_merge CHECK (merged_into_person_id IS NULL OR merged_into_person_id<>id);
ALTER TABLE private.organization ADD CONSTRAINT organization_no_self_merge CHECK (merged_into_organization_id IS NULL OR merged_into_organization_id<>id);
ALTER TABLE private.geography ADD CONSTRAINT geography_no_self_parent CHECK (parent_geography_id IS NULL OR parent_geography_id<>id);
-- Generic reference catalogs are immutable when used. Changes use a new code.
CREATE FUNCTION private.immutable_code_key() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.id<>OLD.id OR NEW.code_set<>OLD.code_set OR NEW.code<>OLD.code THEN
    RAISE EXCEPTION 'Reference code identity is immutable' USING ERRCODE='23514';
  END IF; RETURN NEW;
END $$;
CREATE TRIGGER immutable_code_key BEFORE UPDATE ON private.reference_code FOR EACH ROW EXECUTE FUNCTION private.immutable_code_key();
CREATE TRIGGER code_domain BEFORE INSERT OR UPDATE ON private.person FOR EACH ROW EXECUTE FUNCTION private.guard_code_domain('identity_review_status_id', 'identity_review', 'current_state_id', 'person_state');
CREATE TRIGGER code_domain BEFORE INSERT OR UPDATE ON private.geography FOR EACH ROW EXECUTE FUNCTION private.guard_code_domain('geography_kind_id', 'geography_kind');
CREATE TRIGGER code_domain BEFORE INSERT OR UPDATE ON private.organization FOR EACH ROW EXECUTE FUNCTION private.guard_code_domain('current_status_id', 'organization_status');
CREATE TRIGGER code_domain BEFORE INSERT OR UPDATE ON private.person_name_history FOR EACH ROW EXECUTE FUNCTION private.guard_code_domain('name_kind_id', 'name_kind');
CREATE TRIGGER code_domain BEFORE INSERT OR UPDATE ON private.person_contact FOR EACH ROW EXECUTE FUNCTION private.guard_code_domain('channel_kind_id', 'contact_channel');
CREATE TRIGGER code_domain BEFORE INSERT OR UPDATE ON private.organization_contact FOR EACH ROW EXECUTE FUNCTION private.guard_code_domain('channel_kind_id', 'contact_channel');
CREATE TRIGGER code_domain BEFORE INSERT OR UPDATE ON private.address_version FOR EACH ROW EXECUTE FUNCTION private.guard_code_domain('address_kind_id', 'address_kind');

-- No public views/DTOs/grants until publication policy is approved.
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA private FROM PUBLIC;
COMMIT;
