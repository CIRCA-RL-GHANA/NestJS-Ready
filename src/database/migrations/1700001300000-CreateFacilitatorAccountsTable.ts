import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFacilitatorAccountsTable1700001300000 implements MigrationInterface {
  name = 'CreateFacilitatorAccountsTable1700001300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "facilitator_accounts" (
        "id"          UUID          NOT NULL DEFAULT uuid_generate_v4(),
        "user_id"     UUID          NOT NULL,
        "provider"    VARCHAR(32)   NOT NULL,
        "external_id" VARCHAR(255)  NOT NULL,
        "metadata"    JSONB,
        "created_at"  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

        CONSTRAINT "pk_facilitator_accounts"
          PRIMARY KEY ("id"),
        CONSTRAINT "uq_facilitator_accounts_user_provider"
          UNIQUE ("user_id", "provider")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_facilitator_accounts_user_id"
        ON "facilitator_accounts" ("user_id");
    `);

    await queryRunner.query(`
      COMMENT ON TABLE "facilitator_accounts" IS
        'Stores external payment-facilitator recipient / account IDs per user. '
        'One row per (user_id, provider) pair.';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_facilitator_accounts_user_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "facilitator_accounts";`);
  }
}
