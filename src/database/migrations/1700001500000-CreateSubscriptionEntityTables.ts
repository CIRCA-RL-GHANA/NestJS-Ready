import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * CreateSubscriptionEntityTables
 *
 * Creates the core structural tables that many other tables FK-reference:
 *   - subscription_plans          (standalone lookup table)
 *   - entities                    (every user belongs to one; FK → users, subscription_plans)
 *   - branches                    (physical locations of entities; FK → entities, subscription_plans)
 *   - qpoint_accounts             (one per entity; the ORM entity is QPointAccount / table qpoint_accounts,
 *                                  distinct from the legacy 'qpoints' table created in migration 1700000600000)
 *
 * Ordering matters: subscription_plans → entities → branches → qpoint_accounts
 */
export class CreateSubscriptionEntityTables1700001500000 implements MigrationInterface {
  name = 'CreateSubscriptionEntityTables1700001500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── subscription_plans ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "subscription_plans" (
        "id"                          UUID          NOT NULL DEFAULT gen_random_uuid(),
        "name"                        VARCHAR(50)   NOT NULL,
        "description"                 TEXT,
        "booster_points_allocation"   DECIMAL(10,2) NOT NULL DEFAULT 0,
        "monthly_cost_q_points"       DECIMAL(10,2) NOT NULL DEFAULT 0,
        "max_branches"                INTEGER,
        "max_staff"                   INTEGER,
        "is_active"                   BOOLEAN       NOT NULL DEFAULT TRUE,
        "features"                    JSONB,
        "created_at"                  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"                  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"                  TIMESTAMPTZ,
        CONSTRAINT "pk_subscription_plans" PRIMARY KEY ("id"),
        CONSTRAINT "uq_subscription_plans_name" UNIQUE ("name")
      )
    `);
    await queryRunner.query(`
      CREATE TRIGGER trg_subscription_plans_updated_at
        BEFORE UPDATE ON "subscription_plans"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── entities ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "entities" (
        "id"                  UUID          NOT NULL DEFAULT gen_random_uuid(),
        "type"                VARCHAR(50)   NOT NULL
          CHECK ("type" IN ('Individual', 'Other')),
        "wire_id"             VARCHAR       NOT NULL,
        "social_username"     VARCHAR       NOT NULL,
        "owner_id"            UUID          NOT NULL,
        "name"                VARCHAR,
        "other_entity_type"   VARCHAR(60)
          CHECK ("other_entity_type" IN (
            'Sole Proprietor','Partnership','Company','Public Figure',
            'Trust','Club/Association','NGO','Government Agency'
          )),
        "phone_number"        VARCHAR,
        "subscription_plan_id" UUID,
        "verified"            BOOLEAN       NOT NULL DEFAULT FALSE,
        "created_by_id"       UUID,
        "metadata"            JSONB,
        "created_at"          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"          TIMESTAMPTZ,
        CONSTRAINT "pk_entities"                   PRIMARY KEY ("id"),
        CONSTRAINT "uq_entities_wire_id"           UNIQUE ("wire_id"),
        CONSTRAINT "uq_entities_social_username"   UNIQUE ("social_username"),
        CONSTRAINT "fk_entities_owner"             FOREIGN KEY ("owner_id")
          REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_entities_subscription_plan" FOREIGN KEY ("subscription_plan_id")
          REFERENCES "subscription_plans"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_entities_owner_id"            ON "entities" ("owner_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_entities_type"                ON "entities" ("type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_entities_subscription_plan_id" ON "entities" ("subscription_plan_id")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_entities_updated_at
        BEFORE UPDATE ON "entities"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── branches ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "branches" (
        "id"                    UUID        NOT NULL DEFAULT gen_random_uuid(),
        "entity_id"             UUID        NOT NULL,
        "name"                  VARCHAR     NOT NULL,
        "type"                  VARCHAR(50) NOT NULL
          CHECK ("type" IN (
            'Shop','Warehouse','Office','Pickup Point','Delivery Hub','Service Center'
          )),
        "phone_number"          VARCHAR     NOT NULL,
        "location"              VARCHAR     NOT NULL,
        "subscription_plan_id"  UUID,
        "subscription_active"   BOOLEAN     NOT NULL DEFAULT FALSE,
        "manager_id"            UUID,
        "service_scope"         TEXT,
        "activated_at"          TIMESTAMPTZ,
        "metadata"              JSONB,
        "created_at"            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"            TIMESTAMPTZ,
        CONSTRAINT "pk_branches"                    PRIMARY KEY ("id"),
        CONSTRAINT "fk_branches_entity"             FOREIGN KEY ("entity_id")
          REFERENCES "entities"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_branches_subscription_plan"  FOREIGN KEY ("subscription_plan_id")
          REFERENCES "subscription_plans"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_branches_entity_id"           ON "branches" ("entity_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_branches_subscription_plan_id" ON "branches" ("subscription_plan_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_branches_manager_id"          ON "branches" ("manager_id")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_branches_updated_at
        BEFORE UPDATE ON "branches"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── qpoint_accounts ─────────────────────────────────────────────────────
    // NOTE: The legacy migration 1700000600000 created a table named 'qpoints'.
    // This is the authoritative QPointAccount entity table (table: qpoint_accounts).
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "qpoint_accounts" (
        "id"                    UUID          NOT NULL DEFAULT gen_random_uuid(),
        "entity_id"             UUID          NOT NULL,
        "balance"               DECIMAL(12,2) NOT NULL DEFAULT 0,
        "currency"              VARCHAR(10)   NOT NULL DEFAULT 'QP',
        "is_active"             BOOLEAN       NOT NULL DEFAULT TRUE,
        "is_frozen"             BOOLEAN       NOT NULL DEFAULT FALSE,
        "freeze_reason"         TEXT,
        "daily_limit"           DECIMAL(12,2),
        "monthly_limit"         DECIMAL(12,2),
        "total_earned"          DECIMAL(12,2) NOT NULL DEFAULT 0,
        "total_spent"           DECIMAL(12,2) NOT NULL DEFAULT 0,
        "last_transaction_at"   TIMESTAMPTZ,
        "created_at"            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"            TIMESTAMPTZ,
        CONSTRAINT "pk_qpoint_accounts"           PRIMARY KEY ("id"),
        CONSTRAINT "uq_qpoint_accounts_entity_id" UNIQUE ("entity_id"),
        CONSTRAINT "fk_qpoint_accounts_entity"    FOREIGN KEY ("entity_id")
          REFERENCES "entities"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_qpoint_accounts_entity_id" ON "qpoint_accounts" ("entity_id")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_qpoint_accounts_updated_at
        BEFORE UPDATE ON "qpoint_accounts"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── subscription_assignments ────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "subscription_assignments" (
        "id"            UUID        NOT NULL DEFAULT gen_random_uuid(),
        "target_type"   VARCHAR(20) NOT NULL
          CHECK ("target_type" IN ('Entity','Branch')),
        "target_id"     UUID        NOT NULL,
        "plan_id"       UUID        NOT NULL,
        "activated"     BOOLEAN     NOT NULL DEFAULT FALSE,
        "activated_at"  TIMESTAMPTZ,
        "expires_at"    TIMESTAMPTZ,
        "auto_renew"    BOOLEAN     NOT NULL DEFAULT TRUE,
        "last_renewal_at" TIMESTAMPTZ,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"    TIMESTAMPTZ,
        CONSTRAINT "pk_subscription_assignments"        PRIMARY KEY ("id"),
        CONSTRAINT "fk_subscription_assignments_plan"   FOREIGN KEY ("plan_id")
          REFERENCES "subscription_plans"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_sub_assignments_target" ON "subscription_assignments" ("target_type","target_id")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_subscription_assignments_updated_at
        BEFORE UPDATE ON "subscription_assignments"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "subscription_assignments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "qpoint_accounts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "branches"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "entities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subscription_plans"`);
  }
}
