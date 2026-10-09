/** Supplementary single-connection SQL; not native concurrency acceptance. */
import test from "node:test";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";
import { fixtureReplay } from "./fixture-replay";
import { seedSyntheticData } from "../../prisma/seed-data";
import { workflowCases } from "./workflow-cases";
test("shared documents/workflow — supplementary SQL WASM", async (t) => {
  const db = new PGlite({ extensions: { btree_gist } });
  try {
    for (const name of [
      "20261003130000_core_foundation",
      "20261009170000_portal_access",
      "20261009190000_documents_workflow",
    ])
      await db.exec(
        readFileSync(`prisma/migrations/${name}/migration.sql`, "utf8"),
      );
    await seedSyntheticData(fixtureReplay(db));
    await workflowCases(t, db);
  } finally {
    await db.close();
  }
});
