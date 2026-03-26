import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateWalletsTable1700000500000 implements MigrationInterface {
  name = 'CreateWalletsTable1700000500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'wallets',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isUnique: true },
          { name: 'balance', type: 'decimal', precision: 15, scale: 2, default: 0.0 },
          { name: 'currency', type: 'varchar', default: "'USD'" },
          { name: 'total_credited', type: 'decimal', precision: 15, scale: 2, default: 0.0 },
          { name: 'total_debited', type: 'decimal', precision: 15, scale: 2, default: 0.0 },
          { name: 'blocked_amount', type: 'decimal', precision: 15, scale: 2, default: 0.0 },
          { name: 'status', type: 'enum', enum: ['ACTIVE', 'FROZEN', 'SUSPENDED'], default: "'ACTIVE'" },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
        foreignKeys: [
          { columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('wallets');
  }
}
