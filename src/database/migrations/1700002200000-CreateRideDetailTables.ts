import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * CreateRideDetailTables
 *
 * Creates ride-service detail tables that reference the existing `rides` table
 * (migration 1700000900000):
 *
 *   - ride_tracking      (GPS breadcrumbs during a ride)
 *   - ride_feedback      (post-ride ratings by rider or driver)
 *   - ride_referrals     (friend referral codes and reward tracking)
 *   - ride_sos_alerts    (emergency SOS events triggered during a ride)
 *   - wait_time_tracking (per-ride driver wait periods and associated charges)
 */
export class CreateRideDetailTables1700002200000 implements MigrationInterface {
  name = 'CreateRideDetailTables1700002200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── ride_tracking ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ride_tracking" (
        "id"                      UUID          NOT NULL DEFAULT gen_random_uuid(),
        "ride_id"                 UUID          NOT NULL,
        "location"                JSONB         NOT NULL,
        "speed"                   DECIMAL(10,2),
        "heading"                 DECIMAL(10,2),
        "distance_to_destination" DECIMAL(10,2),
        "eta_minutes"             INTEGER,
        "created_at"              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"              TIMESTAMPTZ,
        CONSTRAINT "pk_ride_tracking"           PRIMARY KEY ("id"),
        CONSTRAINT "fk_ride_tracking_ride"      FOREIGN KEY ("ride_id")
          REFERENCES "rides"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_ride_tracking_ride_id"    ON "ride_tracking" ("ride_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ride_tracking_created_at" ON "ride_tracking" ("created_at")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_ride_tracking_updated_at
        BEFORE UPDATE ON "ride_tracking"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── ride_feedback ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ride_feedback" (
        "id"            UUID          NOT NULL DEFAULT gen_random_uuid(),
        "ride_id"       UUID          NOT NULL,
        "reviewer_id"   UUID          NOT NULL,
        "reviewee_id"   UUID          NOT NULL,
        "rating"        DECIMAL(3,2)  NOT NULL,
        "comment"       TEXT,
        "tags"          JSONB,
        "created_at"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"    TIMESTAMPTZ,
        CONSTRAINT "pk_ride_feedback"           PRIMARY KEY ("id"),
        CONSTRAINT "fk_ride_feedback_ride"      FOREIGN KEY ("ride_id")
          REFERENCES "rides"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_ride_feedback_ride_id"     ON "ride_feedback" ("ride_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ride_feedback_reviewer_id" ON "ride_feedback" ("reviewer_id")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_ride_feedback_updated_at
        BEFORE UPDATE ON "ride_feedback"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── ride_referrals ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ride_referrals" (
        "id"                    UUID        NOT NULL DEFAULT gen_random_uuid(),
        "referrer_id"           UUID        NOT NULL,
        "referee_id"            UUID        NOT NULL,
        "referral_code"         VARCHAR(20) NOT NULL,
        "status"                VARCHAR(20) NOT NULL DEFAULT 'pending'
          CHECK ("status" IN ('pending','completed','expired')),
        "referrer_reward"       INTEGER     NOT NULL DEFAULT 0,
        "referee_reward"        INTEGER     NOT NULL DEFAULT 0,
        "referrer_rewarded"     BOOLEAN     NOT NULL DEFAULT FALSE,
        "referee_rewarded"      BOOLEAN     NOT NULL DEFAULT FALSE,
        "completion_ride_id"    UUID,
        "completed_at"          TIMESTAMPTZ,
        "expires_at"            TIMESTAMPTZ,
        "created_at"            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"            TIMESTAMPTZ,
        CONSTRAINT "pk_ride_referrals"                  PRIMARY KEY ("id"),
        CONSTRAINT "uq_ride_referrals_referral_code"    UNIQUE ("referral_code")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_ride_referrals_referrer_id" ON "ride_referrals" ("referrer_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ride_referrals_referee_id"  ON "ride_referrals" ("referee_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ride_referrals_status"      ON "ride_referrals" ("status")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_ride_referrals_updated_at
        BEFORE UPDATE ON "ride_referrals"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── ride_sos_alerts ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ride_sos_alerts" (
        "id"                  UUID        NOT NULL DEFAULT gen_random_uuid(),
        "ride_id"             UUID        NOT NULL,
        "user_id"             UUID        NOT NULL,
        "status"              VARCHAR(20) NOT NULL DEFAULT 'active'
          CHECK ("status" IN ('active','responded','resolved','false_alarm')),
        "location"            JSONB       NOT NULL,
        "message"             TEXT,
        "contacts_notified"   JSONB,
        "responded_at"        TIMESTAMPTZ,
        "resolved_at"         TIMESTAMPTZ,
        "resolution_notes"    TEXT,
        "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"          TIMESTAMPTZ,
        CONSTRAINT "pk_ride_sos_alerts"          PRIMARY KEY ("id"),
        CONSTRAINT "fk_ride_sos_alerts_ride"     FOREIGN KEY ("ride_id")
          REFERENCES "rides"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_ride_sos_alerts_ride_id"  ON "ride_sos_alerts" ("ride_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ride_sos_alerts_user_id"  ON "ride_sos_alerts" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ride_sos_alerts_status"   ON "ride_sos_alerts" ("status")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_ride_sos_alerts_updated_at
        BEFORE UPDATE ON "ride_sos_alerts"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── wait_time_tracking ───────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "wait_time_tracking" (
        "id"                UUID          NOT NULL DEFAULT gen_random_uuid(),
        "ride_id"           UUID          NOT NULL,
        "user_id"           UUID          NOT NULL,
        "wait_start_time"   TIMESTAMPTZ   NOT NULL,
        "wait_end_time"     TIMESTAMPTZ,
        "wait_minutes"      INTEGER,
        "charge_per_minute" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "total_charge"      DECIMAL(10,2),
        "charge_applied"    BOOLEAN       NOT NULL DEFAULT FALSE,
        "reason"            TEXT,
        "created_at"        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"        TIMESTAMPTZ,
        CONSTRAINT "pk_wait_time_tracking"        PRIMARY KEY ("id"),
        CONSTRAINT "fk_wait_time_tracking_ride"   FOREIGN KEY ("ride_id")
          REFERENCES "rides"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_wait_time_tracking_ride_id" ON "wait_time_tracking" ("ride_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_wait_time_tracking_user_id" ON "wait_time_tracking" ("user_id")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_wait_time_tracking_updated_at
        BEFORE UPDATE ON "wait_time_tracking"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "wait_time_tracking"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ride_sos_alerts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ride_referrals"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ride_feedback"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ride_tracking"`);
  }
}
