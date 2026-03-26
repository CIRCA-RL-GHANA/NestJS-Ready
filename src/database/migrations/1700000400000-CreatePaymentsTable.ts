import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePaymentsTable1700000400000 implements MigrationInterface {
  name = 'CreatePaymentsTable1700000400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'order_id', type: 'uuid' },
          { name: 'user_id', type: 'uuid' },
          { name: 'amount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'currency', type: 'varchar', default: "'USD'" },
          { name: 'payment_method', type: 'enum', enum: ['CASH', 'CARD', 'WALLET', 'BANK_TRANSFER', 'ONLINE'], default: "'CARD'" },
          { name: 'transaction_id', type: 'varchar', isUnique: true, isNullable: true },
          { name: 'payment_gateway', type: 'varchar', isNullable: true },
          { name: 'status', type: 'enum', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'], default: "'PENDING'" },
          { name: 'reference_number', type: 'varchar', isNullable: true },
          { name: 'receipt_url', type: 'varchar', isNullable: true },
          { name: 'retry_count', type: 'int', default: 0 },
          { name: 'last_retry_at', type: 'timestamp', isNullable: true },
          { name: 'completed_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
        foreignKeys: [
          { columnNames: ['order_id'], referencedTableName: 'orders', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
          { columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payments');
  }
}
