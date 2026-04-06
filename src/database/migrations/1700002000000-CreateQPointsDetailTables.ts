import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * CreateQPointsDetailTables
 *
 * Creates the accounting and fraud-detection tables for the QPoints system.
 * These reference the `qpoint_accounts` table created in migration 1700001500000.
 *
 *   - general_ledgers         (chart of accounts for double-entry bookkeeping)
 *   - booster_points_accounts (per-entity/branch advertising credit accounts)
 *   - qpoint_transactions     (every debit/credit movement on a QPoint account)
 *   - journal_entries         (double-entry journal lines per transaction)
 *   - behavior_logs           (flagged user-behavior records for fraud analysis)
 *   - fraud_logs              (confirmed or suspected fraud events)
 */
export class CreateQPointsDetailTables1700002000000 implements MigrationInterface {
  name = 'CreateQPointsDetailTables1700002000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── general_ledgers ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "general_ledgers" (
        "id"                    UUID          NOT NULL DEFAULT gen_random_uuid(),
        "account_code"          VARCHAR       NOT NULL,
        "account_name"          VARCHAR       NOT NULL,
        "account_type"          VARCHAR(20)   NOT NULL
          CHECK ("account_type" IN ('Asset','Liability','Equity','Revenue','Expense')),
        "balance"               DECIMAL(18,2) NOT NULL DEFAULT 0,
        "description"           TEXT,
        "is_active"             BOOLEAN       NOT NULL DEFAULT TRUE,
        "parent_account_code"   VARCHAR,
        "metadata"              JSONB,
        "created_at"            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"            TIMESTAMPTZ,
        CONSTRAINT "pk_general_ledgers"              PRIMARY KEY ("id"),
        CONSTRAINT "uq_general_ledgers_account_code" UNIQUE ("account_code")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_general_ledgers_account_code" ON "general_ledgers" ("account_code")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_general_ledgers_account_type" ON "general_ledgers" ("account_type")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_general_ledgers_updated_at
        BEFORE UPDATE ON "general_ledgers"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── booster_points_accounts ──────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "booster_points_accounts" (
        "id"                UUID          NOT NULL DEFAULT gen_random_uuid(),
        "entity_id"         UUID,
        "branch_id"         UUID,
        "balance"           DECIMAL(12,2) NOT NULL DEFAULT 0,
        "currency"          VARCHAR(10)   NOT NULL DEFAULT 'BPT',
        "is_active"         BOOLEAN       NOT NULL DEFAULT TRUE,
        "total_earned"      DECIMAL(12,2) NOT NULL DEFAULT 0,
        "total_spent"       DECIMAL(12,2) NOT NULL DEFAULT 0,
        "last_transaction_at" TIMESTAMPTZ,
        "created_at"        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"        TIMESTAMPTZ,
        CONSTRAINT "pk_booster_points_accounts" PRIMARY KEY ("id"),
        CONSTRAINT "fk_booster_entity"          FOREIGN KEY ("entity_id")
          REFERENCES "entities"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_booster_branch"          FOREIGN KEY ("branch_id")
          REFERENCES "branches"("id") ON DELETE CASCADE
      )
    `);
    // Partial unique indexes: only one account per entity, one per branch
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_booster_entity_id"
        ON "booster_points_accounts" ("entity_id")
        WHERE "entity_id" IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_booster_branch_id"
        ON "booster_points_accounts" ("branch_id")
        WHERE "branch_id" IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE TRIGGER trg_booster_points_accounts_updated_at
        BEFORE UPDATE ON "booster_points_accounts"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── qpoint_transactions ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "qpoint_transactions" (
        "id"                    UUID          NOT NULL DEFAULT gen_random_uuid(),
        "source_account_id"     UUID,
        "destination_account_id" UUID,
        "amount"                DECIMAL(12,2) NOT NULL,
        "type"                  VARCHAR(20)   NOT NULL
          CHECK ("type" IN (
            'Deposit','Withdrawal','Transfer','Purchase',
            'Refund','Reward','Fee','Penalty'
          )),
        "status"                VARCHAR(20)   NOT NULL DEFAULT 'Pending'
          CHECK ("status" IN (
            'Pending','Completed','Failed','Reversed','Cancelled','Flagged'
          )),
        "reference"             VARCHAR       NOT NULL,
        "description"           TEXT,
        "initiated_by"          UUID,
        "balance_before"        DECIMAL(12,2) NOT NULL,
        "balance_after"         DECIMAL(12,2) NOT NULL,
        "fee"                   DECIMAL(12,2) NOT NULL DEFAULT 0,
        "metadata"              JSONB,
        "ip_address"            VARCHAR(45),
        "error_message"         TEXT,
        "risk_score"            INTEGER       NOT NULL DEFAULT 0,
        "risk_level"            VARCHAR(10)   NOT NULL DEFAULT 'Low'
          CHECK ("risk_level" IN ('Low','Medium','High','Critical')),
        "fraud_flag"            BOOLEAN       NOT NULL DEFAULT FALSE,
        "fraud_reason"          TEXT,
        "verified"              BOOLEAN       NOT NULL DEFAULT FALSE,
        "approved"              BOOLEAN       NOT NULL DEFAULT FALSE,
        "approved_at"           TIMESTAMPTZ,
        "approved_by"           UUID,
        "device_fingerprint"    VARCHAR(255),
        "geolocation"           JSONB,
        "fee_waived"            BOOLEAN       NOT NULL DEFAULT FALSE,
        "created_at"            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"            TIMESTAMPTZ,
        CONSTRAINT "pk_qpoint_transactions"            PRIMARY KEY ("id"),
        CONSTRAINT "uq_qpoint_transactions_reference"  UNIQUE ("reference"),
        CONSTRAINT "fk_qpoint_transactions_source"     FOREIGN KEY ("source_account_id")
          REFERENCES "qpoint_accounts"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_qpoint_transactions_dest"       FOREIGN KEY ("destination_account_id")
          REFERENCES "qpoint_accounts"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_qpoint_tx_source"       ON "qpoint_transactions" ("source_account_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_qpoint_tx_destination"  ON "qpoint_transactions" ("destination_account_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_qpoint_tx_type"         ON "qpoint_transactions" ("type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_qpoint_tx_status"       ON "qpoint_transactions" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_qpoint_tx_initiated_by" ON "qpoint_transactions" ("initiated_by")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_qpoint_tx_reference"    ON "qpoint_transactions" ("reference")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_qpoint_tx_risk_level"   ON "qpoint_transactions" ("risk_level")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_qpoint_tx_fraud_flag"   ON "qpoint_transactions" ("fraud_flag")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_qpoint_transactions_updated_at
        BEFORE UPDATE ON "qpoint_transactions"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── journal_entries ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "journal_entries" (
        "id"                UUID          NOT NULL DEFAULT gen_random_uuid(),
        "transaction_id"    UUID          NOT NULL,
        "ledger_account_id" UUID          NOT NULL,
        "entry_type"        VARCHAR(10)   NOT NULL CHECK ("entry_type" IN ('Debit','Credit')),
        "amount"            DECIMAL(18,2) NOT NULL,
        "description"       TEXT          NOT NULL,
        "created_by"        UUID,
        "metadata"          JSONB,
        "created_at"        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"        TIMESTAMPTZ,
        CONSTRAINT "pk_journal_entries"            PRIMARY KEY ("id"),
        CONSTRAINT "fk_journal_entries_ledger"     FOREIGN KEY ("ledger_account_id")
          REFERENCES "general_ledgers"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_journal_entries_tx"         FOREIGN KEY ("transaction_id")
          REFERENCES "qpoint_transactions"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_journal_entries_tx_id"      ON "journal_entries" ("transaction_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_journal_entries_ledger_id"  ON "journal_entries" ("ledger_account_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_journal_entries_entry_type" ON "journal_entries" ("entry_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_journal_entries_created_at" ON "journal_entries" ("created_at")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_journal_entries_updated_at
        BEFORE UPDATE ON "journal_entries"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── behavior_logs ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "behavior_logs" (
        "id"                  UUID        NOT NULL DEFAULT gen_random_uuid(),
        "account_id"          UUID        NOT NULL,
        "user_id"             UUID        NOT NULL,
        "behavior_type"       VARCHAR(50) NOT NULL
          CHECK ("behavior_type" IN (
            'Login Attempt','Transaction Attempt','Account Access','Profile Update',
            'Failed Transaction','High Value Transaction',
            'Rapid Transactions','Unusual Pattern'
          )),
        "transaction_id"      UUID,
        "ip_address"          VARCHAR(45),
        "device_fingerprint"  VARCHAR(255),
        "geolocation"         JSONB,
        "behavior_details"    JSONB       NOT NULL,
        "suspicious"          BOOLEAN     NOT NULL DEFAULT FALSE,
        "risk_score"          INTEGER     NOT NULL DEFAULT 0,
        "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"          TIMESTAMPTZ,
        CONSTRAINT "pk_behavior_logs" PRIMARY KEY ("id"),
        CONSTRAINT "fk_behavior_logs_account" FOREIGN KEY ("account_id")
          REFERENCES "qpoint_accounts"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_behavior_logs_account_id"    ON "behavior_logs" ("account_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_behavior_logs_user_id"       ON "behavior_logs" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_behavior_logs_behavior_type" ON "behavior_logs" ("behavior_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_behavior_logs_created_at"    ON "behavior_logs" ("created_at")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_behavior_logs_updated_at
        BEFORE UPDATE ON "behavior_logs"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── fraud_logs ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "fraud_logs" (
        "id"                      UUID        NOT NULL DEFAULT gen_random_uuid(),
        "transaction_id"          UUID        NOT NULL,
        "account_id"              UUID        NOT NULL,
        "fraud_detection_reason"  VARCHAR(50) NOT NULL
          CHECK ("fraud_detection_reason" IN (
            'Unusual Amount','Unusual Frequency','High Velocity','Unusual Location',
            'Device Mismatch','Pattern Anomaly','Blacklisted IP',
            'Multiple Failures','Suspicious Behavior'
          )),
        "action_taken"            VARCHAR(20) NOT NULL
          CHECK ("action_taken" IN (
            'Flagged','Blocked','Manual Review','Verified','False Positive'
          )),
        "risk_score"              INTEGER     NOT NULL,
        "detection_details"       JSONB       NOT NULL,
        "ip_address"              VARCHAR(45),
        "device_fingerprint"      VARCHAR(255),
        "geolocation"             JSONB,
        "reviewed_by"             UUID,
        "reviewed_at"             TIMESTAMPTZ,
        "review_notes"            TEXT,
        "created_at"              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"              TIMESTAMPTZ,
        CONSTRAINT "pk_fraud_logs"           PRIMARY KEY ("id"),
        CONSTRAINT "fk_fraud_logs_account"   FOREIGN KEY ("account_id")
          REFERENCES "qpoint_accounts"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_fraud_logs_tx"        FOREIGN KEY ("transaction_id")
          REFERENCES "qpoint_transactions"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_fraud_logs_tx_id"       ON "fraud_logs" ("transaction_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_fraud_logs_account_id"  ON "fraud_logs" ("account_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_fraud_logs_reason"      ON "fraud_logs" ("fraud_detection_reason")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_fraud_logs_action"      ON "fraud_logs" ("action_taken")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_fraud_logs_created_at"  ON "fraud_logs" ("created_at")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_fraud_logs_updated_at
        BEFORE UPDATE ON "fraud_logs"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "fraud_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "behavior_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "journal_entries"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "qpoint_transactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "booster_points_accounts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "general_ledgers"`);
  }
}
