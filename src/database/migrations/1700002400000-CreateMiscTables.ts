import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * CreateMiscTables
 *
 * Creates the remaining domain tables not covered by earlier migrations:
 *
 *   - places              (user-saved locations / points of interest)
 *   - go_transactions     (Go wallet transaction ledger)
 *   - planner_transactions (personal finance income/expense records)
 *   - calendar_events     (user calendar entries with recurrence)
 *   - wishlist_items      (user wish-list)
 *   - favorite_drivers    (entity-level favourite-driver list)
 *   - interests           (entity follow / interest graph)
 *   - favorite_shops      (entity-level favourite-branch list)
 *   - market_profiles     (AI-refined marketing demographic profiles)
 *   - market_notifications (market-system notifications per entity/branch/user)
 */
export class CreateMiscTables1700002400000 implements MigrationInterface {
  name = 'CreateMiscTables1700002400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── places ───────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "places" (
        "id"              UUID          NOT NULL DEFAULT gen_random_uuid(),
        "unique_place_id" VARCHAR(50)   NOT NULL,
        "name"            VARCHAR(100)  NOT NULL,
        "owner_id"        UUID          NOT NULL,
        "visibility"      VARCHAR(20)   NOT NULL DEFAULT 'private'
          CHECK ("visibility" IN ('private','public','shared')),
        "category"        VARCHAR(50)   NOT NULL,
        "location"        VARCHAR(255)  NOT NULL,
        "coordinates"     JSONB,
        "metadata"        JSONB,
        "tags"            JSONB,
        "verified"        BOOLEAN       NOT NULL DEFAULT FALSE,
        "rating"          DECIMAL(3,2),
        "review_count"    INTEGER       NOT NULL DEFAULT 0,
        "created_at"      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"      TIMESTAMPTZ,
        CONSTRAINT "pk_places"                  PRIMARY KEY ("id"),
        CONSTRAINT "uq_places_unique_place_id"  UNIQUE ("unique_place_id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_places_owner_id"  ON "places" ("owner_id")`);
    await queryRunner.query(`CREATE INDEX "idx_places_visibility" ON "places" ("visibility")`);
    await queryRunner.query(`CREATE INDEX "idx_places_category"  ON "places" ("category")`);
    await queryRunner.query(`CREATE INDEX "idx_places_location"  ON "places" ("location")`);
    await queryRunner.query(`
      CREATE TRIGGER trg_places_updated_at
        BEFORE UPDATE ON "places"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── go_transactions ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "go_transactions" (
        "id"            UUID          NOT NULL DEFAULT gen_random_uuid(),
        "user_id"       UUID          NOT NULL,
        "wallet_id"     UUID          NOT NULL,
        "type"          VARCHAR(20)   NOT NULL CHECK ("type" IN ('debit','credit')),
        "amount"        DECIMAL(14,2) NOT NULL,
        "currency"      VARCHAR(3)    NOT NULL DEFAULT 'NGN',
        "balance_after" DECIMAL(14,2) NOT NULL,
        "description"   VARCHAR(255)  NOT NULL,
        "category"      VARCHAR(30)   NOT NULL DEFAULT 'other'
          CHECK ("category" IN (
            'ride','order','topup','withdrawal','transfer',
            'refund','investment','other'
          )),
        "status"        VARCHAR(20)   NOT NULL DEFAULT 'completed'
          CHECK ("status" IN ('pending','completed','failed')),
        "reference_id"  UUID,
        "metadata"      JSONB,
        "created_at"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"    TIMESTAMPTZ,
        CONSTRAINT "pk_go_transactions"             PRIMARY KEY ("id"),
        CONSTRAINT "fk_go_transactions_wallet"      FOREIGN KEY ("wallet_id")
          REFERENCES "wallets"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_go_transactions_user_id"   ON "go_transactions" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_go_transactions_wallet_id" ON "go_transactions" ("wallet_id")`);
    await queryRunner.query(`CREATE INDEX "idx_go_transactions_status"    ON "go_transactions" ("status")`);
    await queryRunner.query(`CREATE INDEX "idx_go_transactions_created_at" ON "go_transactions" ("created_at")`);
    await queryRunner.query(`
      CREATE TRIGGER trg_go_transactions_updated_at
        BEFORE UPDATE ON "go_transactions"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── planner_transactions ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "planner_transactions" (
        "id"                UUID          NOT NULL DEFAULT gen_random_uuid(),
        "user_id"           UUID          NOT NULL,
        "type"              VARCHAR(20)   NOT NULL CHECK ("type" IN ('income','expense')),
        "amount"            DECIMAL(15,2) NOT NULL,
        "category"          VARCHAR(30)   NOT NULL
          CHECK ("category" IN (
            'salary','freelance','investment','gift','other_income',
            'food','transportation','housing','utilities','entertainment',
            'healthcare','education','shopping','other_expense'
          )),
        "description"       TEXT          NOT NULL,
        "month"             VARCHAR(2)    NOT NULL,
        "year"              INTEGER       NOT NULL,
        "transaction_date"  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "payment_method"    VARCHAR(100),
        "notes"             TEXT,
        "created_at"        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"        TIMESTAMPTZ,
        CONSTRAINT "pk_planner_transactions"      PRIMARY KEY ("id"),
        CONSTRAINT "fk_planner_transactions_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_planner_tx_user_id"   ON "planner_transactions" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_planner_tx_user_type" ON "planner_transactions" ("user_id","type")`);
    await queryRunner.query(`CREATE INDEX "idx_planner_tx_month_year" ON "planner_transactions" ("month","year")`);
    await queryRunner.query(`
      CREATE TRIGGER trg_planner_transactions_updated_at
        BEFORE UPDATE ON "planner_transactions"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── calendar_events ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "calendar_events" (
        "id"                UUID          NOT NULL DEFAULT gen_random_uuid(),
        "user_id"           UUID          NOT NULL,
        "title"             VARCHAR(255)  NOT NULL,
        "date"              TIMESTAMPTZ   NOT NULL,
        "description"       TEXT,
        "recurring"         BOOLEAN       NOT NULL DEFAULT FALSE,
        "frequency"         VARCHAR(20)   NOT NULL DEFAULT 'none'
          CHECK ("frequency" IN ('none','daily','weekly','monthly','yearly')),
        "location"          VARCHAR(255),
        "duration_minutes"  INTEGER,
        "reminder_enabled"  BOOLEAN       NOT NULL DEFAULT TRUE,
        "reminder_minutes"  INTEGER,
        "created_at"        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"        TIMESTAMPTZ,
        CONSTRAINT "pk_calendar_events"         PRIMARY KEY ("id"),
        CONSTRAINT "fk_calendar_events_user"    FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_calendar_events_user_id" ON "calendar_events" ("user_id")`);
    await queryRunner.query(`
      CREATE TRIGGER trg_calendar_events_updated_at
        BEFORE UPDATE ON "calendar_events"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── wishlist_items ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "wishlist_items" (
        "id"              UUID          NOT NULL DEFAULT gen_random_uuid(),
        "user_id"         UUID          NOT NULL,
        "item"            VARCHAR(255)  NOT NULL,
        "description"     TEXT,
        "category"        VARCHAR(30)   NOT NULL
          CHECK ("category" IN (
            'electronics','clothing','home','books','sports',
            'travel','automotive','health','entertainment','food','other'
          )),
        "priority"        INTEGER       NOT NULL DEFAULT 3,
        "status"          VARCHAR(20)   NOT NULL DEFAULT 'pending'
          CHECK ("status" IN ('pending','purchased','cancelled')),
        "estimated_price" DECIMAL(15,2),
        "target_date"     TIMESTAMPTZ,
        "url"             VARCHAR(500),
        "image_url"       VARCHAR(500),
        "notes"           TEXT,
        "purchased_at"    TIMESTAMPTZ,
        "actual_price"    DECIMAL(15,2),
        "created_at"      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"      TIMESTAMPTZ,
        CONSTRAINT "pk_wishlist_items"        PRIMARY KEY ("id"),
        CONSTRAINT "fk_wishlist_items_user"   FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_wishlist_items_user_id"      ON "wishlist_items" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_wishlist_items_user_status"  ON "wishlist_items" ("user_id","status")`);
    await queryRunner.query(`
      CREATE TRIGGER trg_wishlist_items_updated_at
        BEFORE UPDATE ON "wishlist_items"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── favorite_drivers ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "favorite_drivers" (
        "id"                    UUID          NOT NULL DEFAULT gen_random_uuid(),
        "entity_id"             UUID          NOT NULL,
        "driver_id"             UUID          NOT NULL,
        "added_by_id"           UUID          NOT NULL,
        "ride_history_verified" BOOLEAN       NOT NULL DEFAULT FALSE,
        "visibility"            VARCHAR(20)   NOT NULL DEFAULT 'Private'
          CHECK ("visibility" IN ('Private','Public')),
        "notes"                 TEXT,
        "personal_rating"       DECIMAL(3,2),
        "created_at"            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"            TIMESTAMPTZ,
        CONSTRAINT "pk_favorite_drivers"                  PRIMARY KEY ("id"),
        CONSTRAINT "uq_favorite_drivers_entity_driver"    UNIQUE ("entity_id","driver_id"),
        CONSTRAINT "fk_favorite_drivers_entity"           FOREIGN KEY ("entity_id")
          REFERENCES "entities"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_favorite_drivers_entity_id"   ON "favorite_drivers" ("entity_id")`);
    await queryRunner.query(`CREATE INDEX "idx_favorite_drivers_driver_id"   ON "favorite_drivers" ("driver_id")`);
    await queryRunner.query(`CREATE INDEX "idx_favorite_drivers_added_by_id" ON "favorite_drivers" ("added_by_id")`);
    await queryRunner.query(`
      CREATE TRIGGER trg_favorite_drivers_updated_at
        BEFORE UPDATE ON "favorite_drivers"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── interests ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "interests" (
        "id"              UUID        NOT NULL DEFAULT gen_random_uuid(),
        "owner_id"        UUID        NOT NULL,
        "target_id"       UUID        NOT NULL,
        "target_type"     VARCHAR(20) NOT NULL
          CHECK ("target_type" IN ('Entity','OtherEntity','Branch','Product')),
        "added_by_role"   VARCHAR(30) NOT NULL
          CHECK ("added_by_role" IN (
            'Owner','Administrator','SocialOfficer','BranchManager'
          )),
        "interest_level"  INTEGER     NOT NULL DEFAULT 5,
        "tags"            JSONB,
        "metadata"        JSONB,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"      TIMESTAMPTZ,
        CONSTRAINT "pk_interests"                           PRIMARY KEY ("id"),
        CONSTRAINT "uq_interests_owner_target_type"         UNIQUE ("owner_id","target_id","target_type")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_interests_owner_id"   ON "interests" ("owner_id")`);
    await queryRunner.query(`CREATE INDEX "idx_interests_target_id"  ON "interests" ("target_id")`);
    await queryRunner.query(`CREATE INDEX "idx_interests_target_type" ON "interests" ("target_type")`);
    await queryRunner.query(`
      CREATE TRIGGER trg_interests_updated_at
        BEFORE UPDATE ON "interests"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── favorite_shops ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "favorite_shops" (
        "id"            UUID        NOT NULL DEFAULT gen_random_uuid(),
        "entity_id"     UUID        NOT NULL,
        "shop_id"       UUID        NOT NULL,
        "added_by_role" VARCHAR(20) NOT NULL CHECK ("added_by_role" IN ('Owner','Administrator')),
        "added_by_id"   UUID        NOT NULL,
        "notes"         TEXT,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"    TIMESTAMPTZ,
        CONSTRAINT "pk_favorite_shops"                PRIMARY KEY ("id"),
        CONSTRAINT "uq_favorite_shops_entity_shop"    UNIQUE ("entity_id","shop_id"),
        CONSTRAINT "fk_favorite_shops_entity"         FOREIGN KEY ("entity_id")
          REFERENCES "entities"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_favorite_shops_shop"           FOREIGN KEY ("shop_id")
          REFERENCES "branches"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_favorite_shops_entity_id" ON "favorite_shops" ("entity_id")`);
    await queryRunner.query(`CREATE INDEX "idx_favorite_shops_shop_id"   ON "favorite_shops" ("shop_id")`);
    await queryRunner.query(`
      CREATE TRIGGER trg_favorite_shops_updated_at
        BEFORE UPDATE ON "favorite_shops"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── market_profiles ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "market_profiles" (
        "id"                              UUID        NOT NULL DEFAULT gen_random_uuid(),
        "unique_market_identifier"        VARCHAR     NOT NULL,
        "created_by_type"                 VARCHAR(20) NOT NULL CHECK ("created_by_type" IN ('Entity','Branch')),
        "created_by_id"                   UUID        NOT NULL,
        "demographic_metrics"             JSONB       NOT NULL,
        "business_category"               VARCHAR     NOT NULL,
        "advertisement_exposure_rules"    JSONB,
        "visibility"                      VARCHAR(20) NOT NULL DEFAULT 'Private'
          CHECK ("visibility" IN ('Public','Private')),
        "refined_segments"                JSONB,
        "engagement_analytics"            JSONB,
        "fraud_flag"                      BOOLEAN     NOT NULL DEFAULT FALSE,
        "last_ai_refinement"              TIMESTAMPTZ,
        "created_at"                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"                      TIMESTAMPTZ,
        CONSTRAINT "pk_market_profiles"                         PRIMARY KEY ("id"),
        CONSTRAINT "uq_market_profiles_unique_market_identifier" UNIQUE ("unique_market_identifier")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_market_profiles_creator"           ON "market_profiles" ("created_by_type","created_by_id")`);
    await queryRunner.query(`CREATE INDEX "idx_market_profiles_visibility"        ON "market_profiles" ("visibility")`);
    await queryRunner.query(`CREATE INDEX "idx_market_profiles_business_category" ON "market_profiles" ("business_category")`);
    await queryRunner.query(`
      CREATE TRIGGER trg_market_profiles_updated_at
        BEFORE UPDATE ON "market_profiles"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── market_notifications ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "market_notifications" (
        "id"                UUID        NOT NULL DEFAULT gen_random_uuid(),
        "recipient_type"    VARCHAR(20) NOT NULL CHECK ("recipient_type" IN ('Entity','Branch','User')),
        "recipient_id"      UUID        NOT NULL,
        "message"           TEXT        NOT NULL,
        "type"              VARCHAR(20) NOT NULL DEFAULT 'info'
          CHECK ("type" IN ('info','success','error','warning')),
        "read"              BOOLEAN     NOT NULL DEFAULT FALSE,
        "market_profile_id" UUID,
        "metadata"          JSONB,
        "created_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"        TIMESTAMPTZ,
        CONSTRAINT "pk_market_notifications" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_market_notifications_recipient"   ON "market_notifications" ("recipient_type","recipient_id")`);
    await queryRunner.query(`CREATE INDEX "idx_market_notifications_read"        ON "market_notifications" ("read")`);
    await queryRunner.query(`CREATE INDEX "idx_market_notifications_type"        ON "market_notifications" ("type")`);
    await queryRunner.query(`CREATE INDEX "idx_market_notifications_created_at"  ON "market_notifications" ("created_at")`);
    await queryRunner.query(`
      CREATE TRIGGER trg_market_notifications_updated_at
        BEFORE UPDATE ON "market_notifications"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "market_notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "market_profiles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "favorite_shops"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "interests"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "favorite_drivers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wishlist_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "calendar_events"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "planner_transactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "go_transactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "places"`);
  }
}
