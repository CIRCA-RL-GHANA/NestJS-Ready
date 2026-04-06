import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * AddUpdatedAtTriggers
 *
 * Attaches the `set_updated_at()` trigger (created in InitialSchema) to every
 * table that was created by the earlier migrations. This ensures `updated_at`
 * is kept accurate even for raw SQL UPDATE statements, since PostgreSQL does NOT
 * support MySQL's `ON UPDATE CURRENT_TIMESTAMP` syntax — that clause is silently
 * accepted by the TypeORM Table builder but has no effect in PostgreSQL.
 */
export class AddUpdatedAtTriggers1700001400000 implements MigrationInterface {
  name = 'AddUpdatedAtTriggers1700001400000';

  private readonly tables = [
    'users',
    'vehicles',
    'orders',
    'payments',
    'wallets',
    'qpoints',
    'products',
    'subscriptions',
    'rides',
    'social_interactions',
    'facilitator_accounts',
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const t of this.tables) {
      await queryRunner.query(`DROP TRIGGER IF EXISTS trg_${t}_updated_at ON "${t}"`);
      await queryRunner.query(`
        CREATE TRIGGER trg_${t}_updated_at
          BEFORE UPDATE ON "${t}"
          FOR EACH ROW EXECUTE FUNCTION set_updated_at()
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const t of this.tables) {
      await queryRunner.query(`DROP TRIGGER IF EXISTS trg_${t}_updated_at ON "${t}"`);
    }
  }
}
