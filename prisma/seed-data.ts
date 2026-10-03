import type { PrismaClient } from "../src/generated/prisma/client";
import {
  fixtureId,
  FIXTURE_TIME,
  FIXTURE_DATE,
  REFERENCE_CODES,
  SEED_ACTOR_ID,
} from "./fixtures";

/** Insert-only upserts: reruns do not overwrite existing data or history. */
export async function seedSyntheticData(prisma: PrismaClient): Promise<void> {
  await prisma.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.service_actor_id', ${SEED_ACTOR_ID}, true)`;
      await tx.$executeRaw`SELECT set_config('app.correlation_id', ${fixtureId("operation:seed")}, true)`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(606007)`;
      await tx.serviceActor.upsert({
        where: { id: SEED_ACTOR_ID },
        update: {},
        create: {
          id: SEED_ACTOR_ID,
          actorCode: "DEMO_SEED_V1",
          labelTh: "ผู้บันทึกข้อมูลสมมติบท06 ไม่ใช่บัญชีเข้าสู่ระบบ",
          createdAt: FIXTURE_TIME,
        },
      });
      const common = {
        createdAt: FIXTURE_TIME,
        updatedAt: FIXTURE_TIME,
        createdByActorId: SEED_ACTOR_ID,
        updatedByActorId: SEED_ACTOR_ID,
      };
      for (const [codeSet, code, labelTh] of REFERENCE_CODES) {
        const id = fixtureId(`code:${codeSet}:${code}`);
        await tx.referenceCode.upsert({
          where: { id },
          update: {},
          create: { id, codeSet, code, labelTh, ...common },
        });
      }
      const codeId = (set: string, code: string) =>
        fixtureId(`code:${set}:${code}`);
      const organizationTypeId = fixtureId("orgtype:demo");
      await tx.organizationType.upsert({
        where: { id: organizationTypeId },
        update: {},
        create: {
          id: organizationTypeId,
          typeCode: "DEMO_UNIT",
          labelTh: "หน่วยงานสมมติ",
          ...common,
        },
      });
      for (const key of ["a", "b"]) {
        const id = fixtureId(`geo:${key}`);
        await tx.geography.upsert({
          where: { id },
          update: {},
          create: {
            id,
            geographyCode: `DEMO_GEO_${key.toUpperCase()}`,
            geographyKindId: codeId("geography_kind", "DEMO_AREA"),
            labelTh: `พื้นที่สมมติ ${key.toUpperCase()}`,
            parentGeographyId: key === "b" ? fixtureId("geo:a") : null,
            ...common,
          },
        });
      }
      for (const key of ["a", "b"]) {
        const id = fixtureId(`org:${key}`);
        await tx.organization.upsert({
          where: { id },
          update: {},
          create: {
            id,
            organizationCode: `DEMO_ORG_${key.toUpperCase()}`,
            organizationTypeId,
            currentStatusId: codeId("organization_status", "DEMO_ACTIVE"),
            ...common,
          },
        });
      }
      const documentId = fixtureId("document:evidence");
      await tx.document.upsert({
        where: { id: documentId },
        update: {},
        create: {
          id: documentId,
          documentCode: "DEMO_EVIDENCE_001",
          ownerOrganizationId: fixtureId("org:a"),
          documentKind: "DEMO_REFERENCE",
          title: "หลักฐานสมมติ — ไม่มีไฟล์จริงหรือคำสั่งทางการ",
          ...common,
        },
      });
      const policyId = fixtureId("policy:calendar");
      await tx.policyVersion.upsert({
        where: { id: policyId },
        update: {},
        create: {
          id: policyId,
          policyNamespace: "DEMO_CALENDAR",
          versionNo: 1,
          configuration: {
            synthetic: true,
            timeZone: "Asia/Bangkok",
            officialRules: "TO VERIFY",
          },
          effectiveFrom: FIXTURE_DATE,
          evidenceDocumentId: documentId,
          ...common,
        },
      });
      const history = {
        effectiveFrom: FIXTURE_DATE,
        recordedAt: FIXTURE_TIME,
        recordedByActorId: SEED_ACTOR_ID,
        evidenceDocumentId: documentId,
      };
      for (const key of ["a", "b"]) {
        const organizationId = fixtureId(`org:${key}`);
        const nameId = fixtureId(`orgname:${key}`);
        await tx.organizationNameHistory.upsert({
          where: { id: nameId },
          update: {},
          create: {
            id: nameId,
            organizationId,
            displayName: `หน่วยงานสมมติ ${key.toUpperCase()} — ทดลองเท่านั้น`,
            ...history,
          },
        });
        const addressId = fixtureId(`address:${key}`);
        await tx.addressVersion.upsert({
          where: { id: addressId },
          update: {},
          create: {
            id: addressId,
            organizationId,
            addressKindId: codeId("address_kind", "DEMO_LOCATION"),
            addressText: `ที่ตั้งสมมติ ${key.toUpperCase()} ไม่มีเลขที่หรือสถานที่จริง`,
            geographyId: fixtureId("geo:a"),
            ...history,
          },
        });
        const contactId = fixtureId(`orgcontact:${key}`);
        await tx.organizationContact.upsert({
          where: { id: contactId },
          update: {},
          create: {
            id: contactId,
            organizationId,
            contactCode: `DEMO_ORG_CONTACT_${key.toUpperCase()}`,
            channelKindId: codeId("contact_channel", "DEMO_EMAIL"),
            contactValue: `demo-unit-${key}@example.invalid`,
            ...history,
          },
        });
      }
      for (const key of ["a", "b", "c"]) {
        const personId = fixtureId(`person:${key}`);
        await tx.person.upsert({
          where: { id: personId },
          update: {},
          create: {
            id: personId,
            personCode: `DEMO_PERSON_${key.toUpperCase()}`,
            identityReviewStatusId: codeId(
              "identity_review",
              "DEMO_UNVERIFIED",
            ),
            currentStateId: codeId("person_state", "DEMO_ACTIVE"),
            ...common,
          },
        });
        const privateId = fixtureId(`private:${key}`);
        await tx.personPrivate.upsert({
          where: { id: privateId },
          update: {},
          create: {
            id: privateId,
            personId,
            privateNotes:
              "ข้อมูลสมมติ ไม่มีเลขบัตร วันเกิด เบอร์โทร หรือที่อยู่จริง",
            ...common,
          },
        });
        const nameId = fixtureId(`personname:${key}`);
        await tx.personNameHistory.upsert({
          where: { id: nameId },
          update: {},
          create: {
            id: nameId,
            personId,
            nameKindId: codeId("name_kind", "DEMO_DISPLAY"),
            givenName: `บุคคลสมมติ ${key.toUpperCase()}`,
            familyName: "ตัวอย่างบท06",
            ...history,
          },
        });
        const contactId = fixtureId(`personcontact:${key}`);
        await tx.personContact.upsert({
          where: { id: contactId },
          update: {},
          create: {
            id: contactId,
            personId,
            contactCode: `DEMO_PERSON_CONTACT_${key.toUpperCase()}`,
            channelKindId: codeId("contact_channel", "DEMO_EMAIL"),
            contactValue: `demo-person-${key}@example.invalid`,
            ...history,
          },
        });
      }
      for (const yearCe of [2026, 2027]) {
        const ranges = {
          labelYearCe: yearCe,
          startsOn: new Date(`${yearCe}-02-01T00:00:00Z`),
          endsOn: new Date(`${yearCe + 1}-02-01T00:00:00Z`),
          policyVersionId: policyId,
          ...common,
        };
        const academicId = fixtureId(`academic:${yearCe}`);
        await tx.academicYear.upsert({
          where: { id: academicId },
          update: {},
          create: {
            id: academicId,
            yearCode: `DEMO_AY_${yearCe}`,
            ...ranges,
          },
        });
        const fiscalId = fixtureId(`fiscal:${yearCe}`);
        await tx.fiscalYear.upsert({
          where: { id: fiscalId },
          update: {},
          create: {
            id: fiscalId,
            yearCode: `DEMO_FY_${yearCe}`,
            ...ranges,
            startsOn: new Date(`${yearCe}-04-01T00:00:00Z`),
            endsOn: new Date(`${yearCe + 1}-04-01T00:00:00Z`),
          },
        });
      }
      const examTypeId = fixtureId("examtype:demo");
      await tx.examType.upsert({
        where: { id: examTypeId },
        update: {},
        create: {
          id: examTypeId,
          typeCode: "DEMO_EXAM",
          labelTh: "ประเภทสอบสมมติ ไม่ใช่รหัสทางการ",
          ...common,
        },
      });
      for (const key of ["a", "b", "c"]) {
        const id = fixtureId(`examlevel:${key}`);
        await tx.examLevel.upsert({
          where: { id },
          update: {},
          create: {
            id,
            examTypeId,
            levelCode: `DEMO_LEVEL_${key.toUpperCase()}`,
            labelTh: `ระดับสมมติ ${key.toUpperCase()}`,
            ...common,
          },
        });
      }
    },
    { timeout: 30000 },
  );
}
