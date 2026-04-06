import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * CreateOrderDetailTables
 *
 * Creates the order-fulfillment detail tables:
 *   - order_items          (line items per order)
 *   - deliveries           (driver-to-recipient delivery tracking)
 *   - delivery_packages    (bundled delivery sets per driver)
 *   - return_requests      (customer return / refund claims)
 *   - fulfillment_sessions (picker/packer sessions in a warehouse or shop)
 *
 * All tables reference the existing `orders` table created in migration 1700000300000.
 */
export class CreateOrderDetailTables1700001900000 implements MigrationInterface {
  name = 'CreateOrderDetailTables1700001900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── order_items ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order_items" (
        "id"                      UUID          NOT NULL DEFAULT gen_random_uuid(),
        "order_id"                UUID          NOT NULL,
        "product_id"              UUID          NOT NULL,
        "product_name"            VARCHAR(200)  NOT NULL,
        "quantity"                INTEGER       NOT NULL,
        "unit_price"              DECIMAL(10,2) NOT NULL,
        "total_price"             DECIMAL(10,2) NOT NULL,
        "notes"                   TEXT,
        "is_available"            BOOLEAN       NOT NULL DEFAULT TRUE,
        "replacement_product_id"  UUID,
        "created_at"              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"              TIMESTAMPTZ,
        CONSTRAINT "pk_order_items"          PRIMARY KEY ("id"),
        CONSTRAINT "fk_order_items_order"    FOREIGN KEY ("order_id")
          REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_order_items_product"  FOREIGN KEY ("product_id")
          REFERENCES "products"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_order_items_order_id"   ON "order_items" ("order_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_order_items_product_id" ON "order_items" ("product_id")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_order_items_updated_at
        BEFORE UPDATE ON "order_items"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── delivery_packages ────────────────────────────────────────────────────
    // Must be created before deliveries (deliveries.package_id → delivery_packages.id)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "delivery_packages" (
        "id"              UUID        NOT NULL DEFAULT gen_random_uuid(),
        "package_number"  VARCHAR(50) NOT NULL,
        "driver_id"       UUID        NOT NULL,
        "total_orders"    INTEGER     NOT NULL DEFAULT 0,
        "route"           JSONB,
        "is_completed"    BOOLEAN     NOT NULL DEFAULT FALSE,
        "completed_at"    TIMESTAMPTZ,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"      TIMESTAMPTZ,
        CONSTRAINT "pk_delivery_packages"           PRIMARY KEY ("id"),
        CONSTRAINT "uq_delivery_packages_number"    UNIQUE ("package_number")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_delivery_packages_driver_id"   ON "delivery_packages" ("driver_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_delivery_packages_created_at"  ON "delivery_packages" ("created_at")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_delivery_packages_updated_at
        BEFORE UPDATE ON "delivery_packages"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── deliveries ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "deliveries" (
        "id"                  UUID          NOT NULL DEFAULT gen_random_uuid(),
        "order_id"            UUID          NOT NULL,
        "driver_id"           UUID          NOT NULL,
        "package_id"          UUID,
        "status"              VARCHAR(20)   NOT NULL DEFAULT 'pending'
          CHECK ("status" IN ('pending','assigned','picked_up','in_transit','delivered','failed')),
        "pickup_location"     JSONB         NOT NULL,
        "delivery_location"   JSONB         NOT NULL,
        "estimated_distance"  DECIMAL(10,2),
        "actual_distance"     DECIMAL(10,2),
        "picked_up_at"        TIMESTAMPTZ,
        "delivered_at"        TIMESTAMPTZ,
        "proof_of_delivery"   TEXT,
        "recipient_name"      VARCHAR(100),
        "notes"               TEXT,
        "rating"              DECIMAL(3,2),
        "created_at"          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"          TIMESTAMPTZ,
        CONSTRAINT "pk_deliveries"             PRIMARY KEY ("id"),
        CONSTRAINT "fk_deliveries_order"       FOREIGN KEY ("order_id")
          REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_deliveries_package"     FOREIGN KEY ("package_id")
          REFERENCES "delivery_packages"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_deliveries_order_id"   ON "deliveries" ("order_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_deliveries_driver_id"  ON "deliveries" ("driver_id")`,
    );
    await queryRunner.query(`CREATE INDEX "idx_deliveries_status"     ON "deliveries" ("status")`);
    await queryRunner.query(`
      CREATE TRIGGER trg_deliveries_updated_at
        BEFORE UPDATE ON "deliveries"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── return_requests ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "return_requests" (
        "id"                UUID          NOT NULL DEFAULT gen_random_uuid(),
        "order_id"          UUID          NOT NULL,
        "requested_by"      UUID          NOT NULL,
        "reason"            VARCHAR(30)   NOT NULL
          CHECK ("reason" IN (
            'damaged','wrong_item','not_as_described',
            'quality_issue','change_of_mind','other'
          )),
        "status"            VARCHAR(20)   NOT NULL DEFAULT 'requested'
          CHECK ("status" IN (
            'requested','approved','rejected','in_transit','received','refunded'
          )),
        "description"       TEXT          NOT NULL,
        "item_ids"          JSONB         NOT NULL,
        "evidence"          JSONB,
        "refund_amount"     DECIMAL(10,2),
        "approved_at"       TIMESTAMPTZ,
        "rejection_reason"  TEXT,
        "created_at"        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"        TIMESTAMPTZ,
        CONSTRAINT "pk_return_requests"          PRIMARY KEY ("id"),
        CONSTRAINT "fk_return_requests_order"    FOREIGN KEY ("order_id")
          REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_return_requests_order_id"      ON "return_requests" ("order_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_return_requests_requested_by"  ON "return_requests" ("requested_by")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_return_requests_status"        ON "return_requests" ("status")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_return_requests_updated_at
        BEFORE UPDATE ON "return_requests"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── fulfillment_sessions ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "fulfillment_sessions" (
        "id"              UUID        NOT NULL DEFAULT gen_random_uuid(),
        "fulfiller_id"    UUID        NOT NULL,
        "order_id"        UUID        NOT NULL,
        "status"          VARCHAR(20) NOT NULL DEFAULT 'not_started'
          CHECK ("status" IN ('not_started','in_progress','completed','paused')),
        "started_at"      TIMESTAMPTZ,
        "completed_at"    TIMESTAMPTZ,
        "notes"           TEXT,
        "adjustments"     JSONB,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"      TIMESTAMPTZ,
        CONSTRAINT "pk_fulfillment_sessions"        PRIMARY KEY ("id"),
        CONSTRAINT "fk_fulfillment_sessions_order"  FOREIGN KEY ("order_id")
          REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_fulfillment_sessions_fulfiller_id" ON "fulfillment_sessions" ("fulfiller_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_fulfillment_sessions_order_id"     ON "fulfillment_sessions" ("order_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_fulfillment_sessions_status"       ON "fulfillment_sessions" ("status")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_fulfillment_sessions_updated_at
        BEFORE UPDATE ON "fulfillment_sessions"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "fulfillment_sessions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "return_requests"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "deliveries"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "delivery_packages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items"`);
  }
}
