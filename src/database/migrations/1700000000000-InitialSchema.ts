import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * InitialSchema — Database Bootstrapping
 *
 * 1. Enables the uuid-ossp and pgcrypto extensions required for UUID generation.
 * 2. Creates the `set_updated_at()` trigger function used by every table to keep
 *    the `updated_at` column accurate even for raw SQL updates (PostgreSQL does NOT
 *    support MySQL's ON UPDATE CURRENT_TIMESTAMP syntax).
 *
 * This migration MUST run first so that all subsequent migrations can use
 * uuid_generate_v4() and attach the trigger to their tables.
 */
export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Required for uuid_generate_v4() used in earlier migrations
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    // Required for gen_random_uuid() and pgcrypto utilities
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // Shared trigger function: keeps updated_at current on every UPDATE
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP FUNCTION IF EXISTS set_updated_at()`);
    // Leave extensions in place — other DB objects may depend on them
  }
}
