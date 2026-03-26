import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateQPointsTable1700000600000 implements MigrationInterface {
  name = 'CreateQPointsTable1700000600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'qpoints',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isUnique: true },
          { name: 'balance', type: 'int', default: 0 },
          { name: 'total_earned', type: 'int', default: 0 },
          { name: 'total_redeemed', type: 'int', default: 0 },
          { name: 'expiry_date', type: 'date', isNullable: true },
          { name: 'status', type: 'enum', enum: ['ACTIVE', 'SUSPENDED', 'EXPIRED'], default: "'ACTIVE'" },
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
    await queryRunner.dropTable('qpoints');
  }
}
