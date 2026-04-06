import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * CreateAITables
 *
 * Creates all six AI module tables:
 *   - ai_models          (ML model registry)
 *   - ai_inferences      (model inference requests and results)
 *   - ai_features        (computed feature vectors per entity)
 *   - ai_recommendations (personalized recommendation records)
 *   - ai_workflows       (multi-step AI workflow execution tracking)
 *   - ai_events          (AI-related event capture for training/analytics)
 */
export class CreateAITables1700001700000 implements MigrationInterface {
  name = 'CreateAITables1700001700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── ai_models ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ai_models" (
        "id"                    UUID          NOT NULL DEFAULT gen_random_uuid(),
        "name"                  VARCHAR(100)  NOT NULL,
        "model_type"            VARCHAR(30)   NOT NULL
          CHECK ("model_type" IN (
            'regression','classification','clustering',
            'recommendation','nlp','vision','custom'
          )),
        "version"               VARCHAR(20)   NOT NULL,
        "status"                VARCHAR(20)   NOT NULL DEFAULT 'draft'
          CHECK ("status" IN ('draft','training','trained','deployed','deprecated','failed')),
        "description"           TEXT          NOT NULL,
        "config"                JSONB         NOT NULL,
        "metrics"               JSONB,
        "artifacts_path"        TEXT,
        "training_started_at"   TIMESTAMPTZ,
        "training_completed_at" TIMESTAMPTZ,
        "created_at"            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"            TIMESTAMPTZ,
        CONSTRAINT "pk_ai_models"       PRIMARY KEY ("id"),
        CONSTRAINT "uq_ai_models_name"  UNIQUE ("name")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_ai_models_status"     ON "ai_models" ("status")`);
    await queryRunner.query(
      `CREATE INDEX "idx_ai_models_model_type" ON "ai_models" ("model_type")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_ai_models_updated_at
        BEFORE UPDATE ON "ai_models"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── ai_inferences ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ai_inferences" (
        "id"                  UUID          NOT NULL DEFAULT gen_random_uuid(),
        "model_id"            UUID          NOT NULL,
        "user_id"             UUID,
        "status"              VARCHAR(20)   NOT NULL DEFAULT 'pending'
          CHECK ("status" IN ('pending','processing','completed','failed')),
        "input"               JSONB         NOT NULL,
        "output"              JSONB,
        "confidence"          DECIMAL(5,4),
        "processing_time_ms"  INTEGER,
        "error"               TEXT,
        "metadata"            JSONB,
        "created_at"          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"          TIMESTAMPTZ,
        CONSTRAINT "pk_ai_inferences"       PRIMARY KEY ("id"),
        CONSTRAINT "fk_ai_inferences_model" FOREIGN KEY ("model_id")
          REFERENCES "ai_models"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_ai_inferences_model_id" ON "ai_inferences" ("model_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ai_inferences_user_id"  ON "ai_inferences" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ai_inferences_status"   ON "ai_inferences" ("status")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_ai_inferences_updated_at
        BEFORE UPDATE ON "ai_inferences"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── ai_features ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ai_features" (
        "id"            UUID          NOT NULL DEFAULT gen_random_uuid(),
        "entity_type"   VARCHAR(50)   NOT NULL,
        "entity_id"     UUID          NOT NULL,
        "feature_name"  VARCHAR(100)  NOT NULL,
        "feature_type"  VARCHAR(20)   NOT NULL
          CHECK ("feature_type" IN ('numerical','categorical','text','embedding')),
        "feature_value" JSONB         NOT NULL,
        "version"       VARCHAR(20)   NOT NULL DEFAULT '1.0.0',
        "metadata"      JSONB,
        "computed_at"   TIMESTAMPTZ,
        "created_at"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"    TIMESTAMPTZ,
        CONSTRAINT "pk_ai_features" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_ai_features_entity_type"  ON "ai_features" ("entity_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ai_features_feature_name" ON "ai_features" ("feature_name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ai_features_entity"       ON "ai_features" ("entity_type","entity_id")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_ai_features_updated_at
        BEFORE UPDATE ON "ai_features"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── ai_recommendations ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ai_recommendations" (
        "id"                      UUID          NOT NULL DEFAULT gen_random_uuid(),
        "user_id"                 UUID          NOT NULL,
        "recommendation_type"     VARCHAR(20)   NOT NULL
          CHECK ("recommendation_type" IN ('product','shop','driver','content')),
        "item_id"                 UUID          NOT NULL,
        "score"                   DECIMAL(5,4)  NOT NULL,
        "reason"                  TEXT          NOT NULL,
        "algorithm"               VARCHAR(100)  NOT NULL,
        "viewed"                  BOOLEAN       NOT NULL DEFAULT FALSE,
        "clicked"                 BOOLEAN       NOT NULL DEFAULT FALSE,
        "converted"               BOOLEAN       NOT NULL DEFAULT FALSE,
        "viewed_at"               TIMESTAMPTZ,
        "clicked_at"              TIMESTAMPTZ,
        "converted_at"            TIMESTAMPTZ,
        "metadata"                JSONB,
        "created_at"              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"              TIMESTAMPTZ,
        CONSTRAINT "pk_ai_recommendations" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_ai_recommendations_user_id" ON "ai_recommendations" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ai_recommendations_type"    ON "ai_recommendations" ("recommendation_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ai_recommendations_item_id" ON "ai_recommendations" ("item_id")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_ai_recommendations_updated_at
        BEFORE UPDATE ON "ai_recommendations"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── ai_workflows ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ai_workflows" (
        "id"                UUID          NOT NULL DEFAULT gen_random_uuid(),
        "workflow_name"     VARCHAR(100)  NOT NULL,
        "workflow_type"     VARCHAR(50)   NOT NULL,
        "status"            VARCHAR(20)   NOT NULL DEFAULT 'pending'
          CHECK ("status" IN ('pending','running','completed','failed','cancelled')),
        "config"            JSONB         NOT NULL,
        "current_step"      VARCHAR(100),
        "total_steps"       INTEGER       NOT NULL DEFAULT 0,
        "completed_steps"   INTEGER       NOT NULL DEFAULT 0,
        "results"           JSONB,
        "error"             TEXT,
        "started_at"        TIMESTAMPTZ,
        "completed_at"      TIMESTAMPTZ,
        "triggered_by"      UUID,
        "created_at"        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"        TIMESTAMPTZ,
        CONSTRAINT "pk_ai_workflows" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_ai_workflows_status"       ON "ai_workflows" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ai_workflows_triggered_by" ON "ai_workflows" ("triggered_by")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_ai_workflows_updated_at
        BEFORE UPDATE ON "ai_workflows"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── ai_events ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ai_events" (
        "id"              UUID          NOT NULL DEFAULT gen_random_uuid(),
        "event_type"      VARCHAR(30)   NOT NULL
          CHECK ("event_type" IN (
            'user_action','system_event','model_prediction','workflow_event'
          )),
        "event_name"      VARCHAR(100)  NOT NULL,
        "entity_type"     VARCHAR(50)   NOT NULL,
        "entity_id"       UUID          NOT NULL,
        "user_id"         UUID,
        "payload"         JSONB         NOT NULL,
        "metadata"        JSONB,
        "processed"       BOOLEAN       NOT NULL DEFAULT FALSE,
        "processed_at"    TIMESTAMPTZ,
        "created_at"      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"      TIMESTAMPTZ,
        CONSTRAINT "pk_ai_events" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_ai_events_event_type"  ON "ai_events" ("event_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ai_events_entity"       ON "ai_events" ("entity_type","entity_id")`,
    );
    await queryRunner.query(`CREATE INDEX "idx_ai_events_user_id"      ON "ai_events" ("user_id")`);
    await queryRunner.query(
      `CREATE INDEX "idx_ai_events_processed"    ON "ai_events" ("processed")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_ai_events_updated_at
        BEFORE UPDATE ON "ai_events"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_events"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_workflows"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_recommendations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_features"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_inferences"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_models"`);
  }
}
