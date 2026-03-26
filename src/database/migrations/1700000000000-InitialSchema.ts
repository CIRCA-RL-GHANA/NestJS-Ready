import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Note: Individual table migrations follow. This migration serves as the
    // documentation of the initial schema version.
    console.log('Initial schema migration - see individual migration files for changes');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback would be handled by individual migration down methods
    console.log('Rollback initial schema - see individual migration files');
  }
}
