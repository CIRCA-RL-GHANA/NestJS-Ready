import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * CreateProfileStaffAuthTables
 *
 * Creates identity and access management tables that depend on `users` and
 * the structural tables created in the previous migration:
 *   - profiles                  (one-to-one with users & entities)
 *   - visibility_settings       (per profile)
 *   - interaction_preferences   (per profile)
 *   - business_categories       (lookup)
 *   - entity_profile_settings   (per entity or branch)
 *   - operating_hours           (per entity or branch)
 *   - staff                     (entity roles for users)
 *   - otps                      (phone/email OTP verification)
 *   - audit_logs                (security audit trail)
 *   - statements                (personal lifestyle statement per user)
 */
export class CreateProfileStaffAuthTables1700001600000
  implements MigrationInterface
{
  name = 'CreateProfileStaffAuthTables1700001600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── profiles ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "profiles" (
        "id"                    UUID          NOT NULL DEFAULT gen_random_uuid(),
        "user_id"               UUID          NOT NULL,
        "entity_id"             UUID          NOT NULL,
        "public_name"           VARCHAR(255)  NOT NULL,
        "profile_picture_url"   VARCHAR(500),
        "bio"                   TEXT,
        "mfa_verified"          BOOLEAN       NOT NULL DEFAULT FALSE,
        "created_at"            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"            TIMESTAMPTZ,
        CONSTRAINT "pk_profiles"              PRIMARY KEY ("id"),
        CONSTRAINT "uq_profiles_user_id"      UNIQUE ("user_id"),
        CONSTRAINT "uq_profiles_entity_id"    UNIQUE ("entity_id"),
        CONSTRAINT "fk_profiles_user"         FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_profiles_entity"       FOREIGN KEY ("entity_id")
          REFERENCES "entities"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TRIGGER trg_profiles_updated_at
        BEFORE UPDATE ON "profiles"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── visibility_settings ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "visibility_settings" (
        "id"                      UUID      NOT NULL DEFAULT gen_random_uuid(),
        "profile_id"              UUID      NOT NULL,
        "is_public"               BOOLEAN   NOT NULL DEFAULT TRUE,
        "allow_profile_view"      BOOLEAN   NOT NULL DEFAULT TRUE,
        "allow_message_receive"   BOOLEAN   NOT NULL DEFAULT TRUE,
        "created_at"              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"              TIMESTAMPTZ,
        CONSTRAINT "pk_visibility_settings"           PRIMARY KEY ("id"),
        CONSTRAINT "uq_visibility_settings_profile"   UNIQUE ("profile_id"),
        CONSTRAINT "fk_visibility_settings_profile"   FOREIGN KEY ("profile_id")
          REFERENCES "profiles"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TRIGGER trg_visibility_settings_updated_at
        BEFORE UPDATE ON "visibility_settings"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── interaction_preferences ─────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "interaction_preferences" (
        "id"                        UUID        NOT NULL DEFAULT gen_random_uuid(),
        "profile_id"                UUID        NOT NULL,
        "message_restriction"       VARCHAR(30) NOT NULL DEFAULT 'Everyone'
          CHECK ("message_restriction" IN ('Everyone','ConnectionsOnly','NoOne')),
        "profile_view_restriction"  VARCHAR(30) NOT NULL DEFAULT 'Public'
          CHECK ("profile_view_restriction" IN ('Public','Private','ConnectionsOnly')),
        "created_at"                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"                TIMESTAMPTZ,
        CONSTRAINT "pk_interaction_preferences"           PRIMARY KEY ("id"),
        CONSTRAINT "uq_interaction_preferences_profile"   UNIQUE ("profile_id"),
        CONSTRAINT "fk_interaction_preferences_profile"   FOREIGN KEY ("profile_id")
          REFERENCES "profiles"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TRIGGER trg_interaction_preferences_updated_at
        BEFORE UPDATE ON "interaction_preferences"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── business_categories ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "business_categories" (
        "id"                  UUID          NOT NULL DEFAULT gen_random_uuid(),
        "name"                VARCHAR(100)  NOT NULL,
        "description"         TEXT,
        "parent_category_id"  UUID,
        "is_active"           BOOLEAN       NOT NULL DEFAULT TRUE,
        "created_at"          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"          TIMESTAMPTZ,
        CONSTRAINT "pk_business_categories"       PRIMARY KEY ("id"),
        CONSTRAINT "uq_business_categories_name"  UNIQUE ("name")
      )
    `);
    await queryRunner.query(`
      CREATE TRIGGER trg_business_categories_updated_at
        BEFORE UPDATE ON "business_categories"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── entity_profile_settings ──────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "entity_profile_settings" (
        "id"                    UUID        NOT NULL DEFAULT gen_random_uuid(),
        "profile_type"          VARCHAR(20) NOT NULL CHECK ("profile_type" IN ('Entity','Branch')),
        "profile_id"            UUID        NOT NULL,
        "location"              TEXT,
        "business_category_id"  UUID,
        "compliance_status"     VARCHAR(20) NOT NULL DEFAULT 'Pending'
          CHECK ("compliance_status" IN ('Pending','Approved','Rejected','Suspended')),
        "visibility"            VARCHAR(20) NOT NULL DEFAULT 'Private'
          CHECK ("visibility" IN ('Public','Private','Restricted')),
        "service_scope"         TEXT,
        "manager_id"            UUID,
        "classification"        VARCHAR(100),
        "metadata"              JSONB,
        "is_verified"           BOOLEAN     NOT NULL DEFAULT FALSE,
        "created_at"            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"            TIMESTAMPTZ,
        CONSTRAINT "pk_entity_profile_settings" PRIMARY KEY ("id"),
        CONSTRAINT "uq_entity_profile_settings_type_id" UNIQUE ("profile_type","profile_id"),
        CONSTRAINT "fk_entity_profile_settings_category" FOREIGN KEY ("business_category_id")
          REFERENCES "business_categories"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_entity_profile_settings_type_id" ON "entity_profile_settings" ("profile_type","profile_id")`);
    await queryRunner.query(`
      CREATE TRIGGER trg_entity_profile_settings_updated_at
        BEFORE UPDATE ON "entity_profile_settings"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── operating_hours ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "operating_hours" (
        "id"            UUID        NOT NULL DEFAULT gen_random_uuid(),
        "profile_type"  VARCHAR(20) NOT NULL CHECK ("profile_type" IN ('Entity','Branch')),
        "profile_id"    UUID        NOT NULL,
        "day_of_week"   VARCHAR(20) NOT NULL
          CHECK ("day_of_week" IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
        "open_time"     TIME        NOT NULL,
        "close_time"    TIME        NOT NULL,
        "is_closed"     BOOLEAN     NOT NULL DEFAULT FALSE,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"    TIMESTAMPTZ,
        CONSTRAINT "pk_operating_hours" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_operating_hours_profile" ON "operating_hours" ("profile_type","profile_id")`);
    await queryRunner.query(`
      CREATE TRIGGER trg_operating_hours_updated_at
        BEFORE UPDATE ON "operating_hours"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── staff ───────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "staff" (
        "id"          UUID        NOT NULL DEFAULT gen_random_uuid(),
        "user_id"     UUID        NOT NULL,
        "entity_id"   UUID        NOT NULL,
        "role"        VARCHAR(40) NOT NULL
          CHECK ("role" IN (
            'Owner','Administrator','Social Officer','Response Officer',
            'Monitor','Branch Manager','Driver'
          )),
        "pin_hash"    VARCHAR     NOT NULL,
        "pos_id"      VARCHAR,
        "is_active"   BOOLEAN     NOT NULL DEFAULT TRUE,
        "branch_id"   UUID,
        "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"  TIMESTAMPTZ,
        CONSTRAINT "pk_staff"           PRIMARY KEY ("id"),
        CONSTRAINT "fk_staff_user"      FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_staff_entity"    FOREIGN KEY ("entity_id")
          REFERENCES "entities"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_staff_branch"    FOREIGN KEY ("branch_id")
          REFERENCES "branches"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_staff_user_id"   ON "staff" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_staff_entity_id" ON "staff" ("entity_id")`);
    await queryRunner.query(`CREATE INDEX "idx_staff_branch_id" ON "staff" ("branch_id")`);
    await queryRunner.query(`
      CREATE TRIGGER trg_staff_updated_at
        BEFORE UPDATE ON "staff"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── otps ────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "otps" (
        "id"            UUID        NOT NULL DEFAULT gen_random_uuid(),
        "phone_number"  VARCHAR     NOT NULL,
        "code"          VARCHAR     NOT NULL,
        "expires_at"    TIMESTAMPTZ NOT NULL,
        "verified"      BOOLEAN     NOT NULL DEFAULT FALSE,
        "attempts"      INTEGER     NOT NULL DEFAULT 0,
        "max_attempts"  INTEGER     NOT NULL DEFAULT 5,
        "type"          VARCHAR(10) NOT NULL DEFAULT 'sms',
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"    TIMESTAMPTZ,
        CONSTRAINT "pk_otps" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_otps_phone_number" ON "otps" ("phone_number")`);
    await queryRunner.query(`
      CREATE TRIGGER trg_otps_updated_at
        BEFORE UPDATE ON "otps"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── audit_logs ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id"            UUID        NOT NULL DEFAULT gen_random_uuid(),
        "action"        VARCHAR     NOT NULL,
        "status"        VARCHAR     NOT NULL,
        "user_id"       UUID,
        "metadata"      JSONB,
        "ip_address"    VARCHAR(45),
        "user_agent"    TEXT,
        "timestamp"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"    TIMESTAMPTZ,
        CONSTRAINT "pk_audit_logs" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_audit_logs_action"  ON "audit_logs" ("action")`);
    await queryRunner.query(`CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs" ("user_id")`);
    await queryRunner.query(`
      CREATE TRIGGER trg_audit_logs_updated_at
        BEFORE UPDATE ON "audit_logs"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── statements ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "statements" (
        "id"                UUID        NOT NULL DEFAULT gen_random_uuid(),
        "user_id"           UUID        NOT NULL,
        "lifestyle"         TEXT,
        "family_details"    TEXT,
        "marital_status"    VARCHAR(20)
          CHECK ("marital_status" IN ('single','married','divorced','widowed')),
        "number_of_children" INTEGER,
        "occupation"        VARCHAR(255),
        "hobbies"           TEXT,
        "health_info"       TEXT,
        "education"         TEXT,
        "personal_goals"    TEXT,
        "notes"             TEXT,
        "created_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"        TIMESTAMPTZ,
        CONSTRAINT "pk_statements"          PRIMARY KEY ("id"),
        CONSTRAINT "uq_statements_user_id"  UNIQUE ("user_id"),
        CONSTRAINT "fk_statements_user"     FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TRIGGER trg_statements_updated_at
        BEFORE UPDATE ON "statements"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "statements"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "otps"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staff"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "operating_hours"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "entity_profile_settings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "business_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "interaction_preferences"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "visibility_settings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "profiles"`);
  }
}
