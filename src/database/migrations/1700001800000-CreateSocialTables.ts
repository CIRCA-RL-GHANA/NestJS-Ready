import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * CreateSocialTables
 *
 * Creates the social networking tables:
 *   - updates            (user status posts / feed updates)
 *   - update_comments    (threaded comments on updates)
 *   - engagements        (likes, views, shares on updates/comments)
 *   - heyya_requests     (connection-initiation requests)
 *   - chat_sessions      (1-to-1 chat sessions)
 *   - chat_messages      (messages within a chat session)
 *   - connection_requests (follow/connect requests between users)
 */
export class CreateSocialTables1700001800000 implements MigrationInterface {
  name = 'CreateSocialTables1700001800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── updates ─────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "updates" (
        "id"            UUID        NOT NULL DEFAULT gen_random_uuid(),
        "author_id"     UUID        NOT NULL,
        "content"       TEXT        NOT NULL,
        "visibility"    VARCHAR(20) NOT NULL DEFAULT 'public'
          CHECK ("visibility" IN ('public','friends','private')),
        "media"         JSONB,
        "like_count"    INTEGER     NOT NULL DEFAULT 0,
        "comment_count" INTEGER     NOT NULL DEFAULT 0,
        "share_count"   INTEGER     NOT NULL DEFAULT 0,
        "is_pinned"     BOOLEAN     NOT NULL DEFAULT FALSE,
        "tagged_users"  JSONB,
        "metadata"      JSONB,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"    TIMESTAMPTZ,
        CONSTRAINT "pk_updates" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_updates_author_id"  ON "updates" ("author_id")`);
    await queryRunner.query(`CREATE INDEX "idx_updates_visibility" ON "updates" ("visibility")`);
    await queryRunner.query(`CREATE INDEX "idx_updates_created_at" ON "updates" ("created_at")`);
    await queryRunner.query(`
      CREATE TRIGGER trg_updates_updated_at
        BEFORE UPDATE ON "updates"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── update_comments ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "update_comments" (
        "id"                UUID      NOT NULL DEFAULT gen_random_uuid(),
        "update_id"         UUID      NOT NULL,
        "author_id"         UUID      NOT NULL,
        "content"           TEXT      NOT NULL,
        "parent_comment_id" UUID,
        "like_count"        INTEGER   NOT NULL DEFAULT 0,
        "is_edited"         BOOLEAN   NOT NULL DEFAULT FALSE,
        "created_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"        TIMESTAMPTZ,
        CONSTRAINT "pk_update_comments"       PRIMARY KEY ("id"),
        CONSTRAINT "fk_update_comments_update" FOREIGN KEY ("update_id")
          REFERENCES "updates"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_update_comments_update_id"  ON "update_comments" ("update_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_update_comments_author_id"  ON "update_comments" ("author_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_update_comments_created_at" ON "update_comments" ("created_at")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_update_comments_updated_at
        BEFORE UPDATE ON "update_comments"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── engagements ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "engagements" (
        "id"          UUID        NOT NULL DEFAULT gen_random_uuid(),
        "user_id"     UUID        NOT NULL,
        "target_type" VARCHAR(20) NOT NULL CHECK ("target_type" IN ('update','comment')),
        "target_id"   UUID        NOT NULL,
        "type"        VARCHAR(20) NOT NULL CHECK ("type" IN ('like','comment','share','view')),
        "metadata"    JSONB,
        "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"  TIMESTAMPTZ,
        CONSTRAINT "pk_engagements" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_engagements_user_id"     ON "engagements" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_engagements_target"       ON "engagements" ("target_type","target_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_engagements_type"         ON "engagements" ("type")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_engagements_updated_at
        BEFORE UPDATE ON "engagements"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── heyya_requests ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "heyya_requests" (
        "id"            UUID        NOT NULL DEFAULT gen_random_uuid(),
        "sender_id"     UUID        NOT NULL,
        "recipient_id"  UUID        NOT NULL,
        "message"       TEXT,
        "status"        VARCHAR(20) NOT NULL DEFAULT 'pending'
          CHECK ("status" IN ('pending','accepted','declined','expired')),
        "expires_at"    TIMESTAMPTZ,
        "responded_at"  TIMESTAMPTZ,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"    TIMESTAMPTZ,
        CONSTRAINT "pk_heyya_requests" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_heyya_requests_sender_id"    ON "heyya_requests" ("sender_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_heyya_requests_recipient_id" ON "heyya_requests" ("recipient_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_heyya_requests_status"       ON "heyya_requests" ("status")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_heyya_requests_updated_at
        BEFORE UPDATE ON "heyya_requests"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── chat_sessions ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "chat_sessions" (
        "id"                UUID        NOT NULL DEFAULT gen_random_uuid(),
        "participant1_id"   UUID        NOT NULL,
        "participant2_id"   UUID        NOT NULL,
        "last_message"      TEXT,
        "last_message_at"   TIMESTAMPTZ,
        "unread_count1"     INTEGER     NOT NULL DEFAULT 0,
        "unread_count2"     INTEGER     NOT NULL DEFAULT 0,
        "is_active"         BOOLEAN     NOT NULL DEFAULT TRUE,
        "metadata"          JSONB,
        "created_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"        TIMESTAMPTZ,
        CONSTRAINT "pk_chat_sessions" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_chat_sessions_p1"     ON "chat_sessions" ("participant1_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_chat_sessions_p2"     ON "chat_sessions" ("participant2_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_chat_sessions_p1_p2"  ON "chat_sessions" ("participant1_id","participant2_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_chat_sessions_active" ON "chat_sessions" ("is_active")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_chat_sessions_updated_at
        BEFORE UPDATE ON "chat_sessions"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── chat_messages ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "chat_messages" (
        "id"          UUID        NOT NULL DEFAULT gen_random_uuid(),
        "session_id"  UUID        NOT NULL,
        "sender_id"   UUID        NOT NULL,
        "type"        VARCHAR(20) NOT NULL DEFAULT 'text'
          CHECK ("type" IN ('text','image','video','audio','file','voice_note')),
        "content"     TEXT,
        "media_url"   TEXT,
        "is_read"     BOOLEAN     NOT NULL DEFAULT FALSE,
        "read_at"     TIMESTAMPTZ,
        "is_edited"   BOOLEAN     NOT NULL DEFAULT FALSE,
        "metadata"    JSONB,
        "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"  TIMESTAMPTZ,
        CONSTRAINT "pk_chat_messages"          PRIMARY KEY ("id"),
        CONSTRAINT "fk_chat_messages_session"  FOREIGN KEY ("session_id")
          REFERENCES "chat_sessions"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_chat_messages_session_id"  ON "chat_messages" ("session_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_chat_messages_sender_id"   ON "chat_messages" ("sender_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_chat_messages_created_at"  ON "chat_messages" ("created_at")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_chat_messages_updated_at
        BEFORE UPDATE ON "chat_messages"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    // ─── connection_requests ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "connection_requests" (
        "id"                UUID        NOT NULL DEFAULT gen_random_uuid(),
        "sender_id"         UUID        NOT NULL,
        "receiver_id"       UUID        NOT NULL,
        "status"            VARCHAR(20) NOT NULL DEFAULT 'pending'
          CHECK ("status" IN ('pending','approved','declined','blocked')),
        "message"           TEXT,
        "responded_at"      TIMESTAMPTZ,
        "response_notes"    TEXT,
        "connection_score"  INTEGER     NOT NULL DEFAULT 0,
        "metadata"          JSONB,
        "created_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at"        TIMESTAMPTZ,
        CONSTRAINT "pk_connection_requests"               PRIMARY KEY ("id"),
        CONSTRAINT "uq_connection_requests_sender_receiver" UNIQUE ("sender_id","receiver_id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_connection_requests_sender_id"   ON "connection_requests" ("sender_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_connection_requests_receiver_id" ON "connection_requests" ("receiver_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_connection_requests_status"      ON "connection_requests" ("status")`,
    );
    await queryRunner.query(`
      CREATE TRIGGER trg_connection_requests_updated_at
        BEFORE UPDATE ON "connection_requests"
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "connection_requests"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "chat_messages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "chat_sessions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "heyya_requests"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "engagements"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "update_comments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "updates"`);
  }
}
