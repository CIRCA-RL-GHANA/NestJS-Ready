import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSubscriptionsTable1700000800000 implements MigrationInterface {
  name = 'CreateSubscriptionsTable1700000800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'subscriptions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid' },
          {
            name: 'plan_type',
            type: 'enum',
            enum: ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'],
            default: "'FREE'",
          },
          { name: 'plan_price', type: 'decimal', precision: 10, scale: 2 },
          {
            name: 'billing_cycle',
            type: 'enum',
            enum: ['MONTHLY', 'QUARTERLY', 'ANNUAL'],
            default: "'MONTHLY'",
          },
          { name: 'start_date', type: 'timestamp' },
          { name: 'end_date', type: 'timestamp' },
          { name: 'renewal_date', type: 'timestamp', isNullable: true },
          { name: 'auto_renew', type: 'boolean', default: true },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED'],
            default: "'ACTIVE'",
          },
          { name: 'cancellation_reason', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('subscriptions');
  }
}
