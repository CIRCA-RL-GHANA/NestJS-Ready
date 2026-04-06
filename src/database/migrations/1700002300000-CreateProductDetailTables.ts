import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * CreateProductDetailTables
 *
 * Creates product-catalogue detail tables that reference the existing `products`
 * table (migration 1700000700000) and `branches` (migration 1700001500000):
 *
 *   - product_media    (images/videos for a product)
 *   - delivery_zones   (geographic delivery areas with fees per branch)
 *   - discount_tiers   (time-bound, quantity-based discount rules)
 *   - sos_alerts       (generic SOS alerts — separate from ride_sos_alerts)
 */
export class CreateProductDetailTables1700002300000 implements MigrationInterface {
  name = 'CreateProductDetailTables1700002300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── product_media ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_media" (
        "id"              UUID        NOT NULL DEFAULT gen_random_uuid(),
        "product_id"      UUID        NOT NULL,
        "type"            VARCHAR(20) NOT NULL CHECK ("type" IN ('image','video')),
        "url"             TEXT        NOT NULL,
        "thumbnail_url"   TEXT,
        "description"     TEXT,
        "display_order"   INTEGER     NOT NULL DEFAULT 0,
        "is_primary"      BOOLEAN     NOT NULL DEFAULT FALSE,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"      TIMESTAMPTZ,
        CONSTRAINT "pk_product_media"           PRIMARY KEY ("id"),
        CONSTRAINT "fk_product_media_product"   FOREIGN KEY ("product_id")
          REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_product_media_product_id" ON "product_media" ("product_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_media_type"       ON "product_media" ("type")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_product_media_updated_at
        BEFORE UPDATE ON "product_media"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── delivery_zones ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "delivery_zones" (
        "id"                        UUID          NOT NULL DEFAULT gen_random_uuid(),
        "branch_id"                 UUID          NOT NULL,
        "name"                      VARCHAR(100)  NOT NULL,
        "location"                  JSONB         NOT NULL,
        "radius_meters"             FLOAT         NOT NULL DEFAULT 3218,
        "fee_cedis"                 DECIMAL(10,2) NOT NULL,
        "min_order_amount"          DECIMAL(10,2) NOT NULL DEFAULT 0,
        "estimated_delivery_time"   INTEGER       NOT NULL DEFAULT 45,
        "active"                    BOOLEAN       NOT NULL DEFAULT TRUE,
        "operating_hours"           JSONB,
        "created_at"                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"                TIMESTAMPTZ,
        CONSTRAINT "pk_delivery_zones"          PRIMARY KEY ("id"),
        CONSTRAINT "fk_delivery_zones_branch"   FOREIGN KEY ("branch_id")
          REFERENCES "branches"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_delivery_zones_branch_id" ON "delivery_zones" ("branch_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_delivery_zones_active"    ON "delivery_zones" ("active")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_delivery_zones_updated_at
        BEFORE UPDATE ON "delivery_zones"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── discount_tiers ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "discount_tiers" (
        "id"                        UUID          NOT NULL DEFAULT gen_random_uuid(),
        "product_id"                UUID,
        "branch_id"                 UUID,
        "name"                      VARCHAR(100)  NOT NULL,
        "description"               TEXT,
        "discount_percentage"       DECIMAL(5,2)  NOT NULL,
        "min_quantity"              INTEGER       NOT NULL DEFAULT 1,
        "max_quantity"              INTEGER,
        "min_purchase_amount"       DECIMAL(10,2),
        "valid_from"                TIMESTAMPTZ   NOT NULL,
        "valid_to"                  TIMESTAMPTZ   NOT NULL,
        "is_active"                 BOOLEAN       NOT NULL DEFAULT TRUE,
        "created_by"                UUID          NOT NULL,
        "applicable_customer_tiers" JSONB,
        "created_at"                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"                TIMESTAMPTZ,
        CONSTRAINT "pk_discount_tiers"            PRIMARY KEY ("id"),
        CONSTRAINT "fk_discount_tiers_product"    FOREIGN KEY ("product_id")
          REFERENCES "products"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_discount_tiers_branch"     FOREIGN KEY ("branch_id")
          REFERENCES "branches"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_discount_tiers_product_id"  ON "discount_tiers" ("product_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_discount_tiers_branch_id"   ON "discount_tiers" ("branch_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_discount_tiers_is_active"   ON "discount_tiers" ("is_active")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_discount_tiers_valid_range" ON "discount_tiers" ("valid_from","valid_to")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_discount_tiers_updated_at
        BEFORE UPDATE ON "discount_tiers"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── sos_alerts ───────────────────────────────────────────────────────────
    // Generic SOS alert (not ride-specific; see also ride_sos_alerts)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "sos_alerts" (
        "id"                UUID        NOT NULL DEFAULT gen_random_uuid(),
        "user_id"           UUID        NOT NULL,
        "recipient_id"      UUID        NOT NULL,
        "ride_id"           UUID,
        "location"          JSONB,
        "message"           TEXT,
        "status"            VARCHAR(20) NOT NULL DEFAULT 'active'
          CHECK ("status" IN ('active','resolved','cancelled')),
        "resolved_at"       TIMESTAMPTZ,
        "resolution_notes"  TEXT,
        "created_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"        TIMESTAMPTZ,
        CONSTRAINT "pk_sos_alerts" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_sos_alerts_user_id"      ON "sos_alerts" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_sos_alerts_recipient_id" ON "sos_alerts" ("recipient_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_sos_alerts_status"       ON "sos_alerts" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_sos_alerts_ride_id"      ON "sos_alerts" ("ride_id")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_sos_alerts_updated_at
        BEFORE UPDATE ON "sos_alerts"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "sos_alerts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "discount_tiers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "delivery_zones"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_media"`);
  }
}
