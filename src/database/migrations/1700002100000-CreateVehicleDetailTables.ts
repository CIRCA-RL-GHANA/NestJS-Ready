import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * CreateVehicleDetailTables
 *
 * Creates vehicle-fleet management detail tables that reference the existing
 * `vehicles` table (created in migration 1700000200000) and the `branches`
 * table created in migration 1700001500000:
 *
 *   - vehicle_bands            (named groups/tiers of vehicles per branch)
 *   - vehicle_band_memberships (many-to-many: vehicles ↔ bands)
 *   - vehicle_pricing          (per-vehicle wait-time pricing per branch)
 *   - vehicle_media            (photos/videos/documents attached to a vehicle)
 *   - vehicle_assignments      (driver ↔ vehicle assignments with status)
 */
export class CreateVehicleDetailTables1700002100000 implements MigrationInterface {
  name = 'CreateVehicleDetailTables1700002100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── vehicle_bands ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vehicle_bands" (
        "id"          UUID          NOT NULL DEFAULT gen_random_uuid(),
        "name"        VARCHAR(100)  NOT NULL,
        "branch_id"   UUID          NOT NULL,
        "manager_id"  UUID          NOT NULL,
        "description" TEXT,
        "is_active"   BOOLEAN       NOT NULL DEFAULT TRUE,
        "created_at"  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"  TIMESTAMPTZ,
        CONSTRAINT "pk_vehicle_bands"         PRIMARY KEY ("id"),
        CONSTRAINT "fk_vehicle_bands_branch"  FOREIGN KEY ("branch_id")
          REFERENCES "branches"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_vehicle_bands_branch_id"  ON "vehicle_bands" ("branch_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_vehicle_bands_manager_id" ON "vehicle_bands" ("manager_id")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_vehicle_bands_updated_at
        BEFORE UPDATE ON "vehicle_bands"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── vehicle_band_memberships ─────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vehicle_band_memberships" (
        "id"          UUID        NOT NULL DEFAULT gen_random_uuid(),
        "vehicle_id"  UUID        NOT NULL,
        "band_id"     UUID        NOT NULL,
        "added_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"  TIMESTAMPTZ,
        CONSTRAINT "pk_vehicle_band_memberships"             PRIMARY KEY ("id"),
        CONSTRAINT "uq_vehicle_band_memberships_vehicle_band" UNIQUE ("vehicle_id","band_id"),
        CONSTRAINT "fk_vehicle_band_memberships_vehicle"     FOREIGN KEY ("vehicle_id")
          REFERENCES "vehicles"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_vehicle_band_memberships_band"        FOREIGN KEY ("band_id")
          REFERENCES "vehicle_bands"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_vehicle_band_mem_vehicle_id" ON "vehicle_band_memberships" ("vehicle_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_vehicle_band_mem_band_id"    ON "vehicle_band_memberships" ("band_id")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_vehicle_band_memberships_updated_at
        BEFORE UPDATE ON "vehicle_band_memberships"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── vehicle_pricing ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vehicle_pricing" (
        "id"                    UUID          NOT NULL DEFAULT gen_random_uuid(),
        "vehicle_id"            UUID          NOT NULL,
        "branch_id"             UUID          NOT NULL,
        "allowable_wait_time"   INTEGER       NOT NULL,
        "price_per_minute"      DECIMAL(10,2) NOT NULL,
        "created_at"            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"            TIMESTAMPTZ,
        CONSTRAINT "pk_vehicle_pricing"             PRIMARY KEY ("id"),
        CONSTRAINT "uq_vehicle_pricing_vehicle_branch" UNIQUE ("vehicle_id","branch_id"),
        CONSTRAINT "fk_vehicle_pricing_vehicle"     FOREIGN KEY ("vehicle_id")
          REFERENCES "vehicles"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_vehicle_pricing_branch"      FOREIGN KEY ("branch_id")
          REFERENCES "branches"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_vehicle_pricing_vehicle_id" ON "vehicle_pricing" ("vehicle_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_vehicle_pricing_branch_id"  ON "vehicle_pricing" ("branch_id")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_vehicle_pricing_updated_at
        BEFORE UPDATE ON "vehicle_pricing"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── vehicle_media ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vehicle_media" (
        "id"            UUID        NOT NULL DEFAULT gen_random_uuid(),
        "vehicle_id"    UUID        NOT NULL,
        "type"          VARCHAR(20) NOT NULL CHECK ("type" IN ('photo','video','document')),
        "url"           TEXT        NOT NULL,
        "description"   TEXT,
        "uploaded_by"   UUID        NOT NULL,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"    TIMESTAMPTZ,
        CONSTRAINT "pk_vehicle_media"          PRIMARY KEY ("id"),
        CONSTRAINT "fk_vehicle_media_vehicle"  FOREIGN KEY ("vehicle_id")
          REFERENCES "vehicles"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_vehicle_media_vehicle_id" ON "vehicle_media" ("vehicle_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_vehicle_media_type"       ON "vehicle_media" ("type")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_vehicle_media_updated_at
        BEFORE UPDATE ON "vehicle_media"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── vehicle_assignments ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vehicle_assignments" (
        "id"          UUID        NOT NULL DEFAULT gen_random_uuid(),
        "vehicle_id"  UUID        NOT NULL,
        "driver_id"   UUID        NOT NULL,
        "status"      VARCHAR(20) NOT NULL DEFAULT 'active'
          CHECK ("status" IN ('active','inactive','completed')),
        "start_date"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "end_date"    TIMESTAMPTZ,
        "notes"       TEXT,
        "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"  TIMESTAMPTZ,
        CONSTRAINT "pk_vehicle_assignments"          PRIMARY KEY ("id"),
        CONSTRAINT "fk_vehicle_assignments_vehicle"  FOREIGN KEY ("vehicle_id")
          REFERENCES "vehicles"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_vehicle_assignments_vehicle_id" ON "vehicle_assignments" ("vehicle_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_vehicle_assignments_driver_id"  ON "vehicle_assignments" ("driver_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_vehicle_assignments_status"     ON "vehicle_assignments" ("status")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_vehicle_assignments_updated_at
        BEFORE UPDATE ON "vehicle_assignments"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "vehicle_assignments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vehicle_media"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vehicle_pricing"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vehicle_band_memberships"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vehicle_bands"`);
  }
}
