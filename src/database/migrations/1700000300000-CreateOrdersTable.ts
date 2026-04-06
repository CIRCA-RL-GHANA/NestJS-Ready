import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateOrdersTable1700000300000 implements MigrationInterface {
  name = 'CreateOrdersTable1700000300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'customer_id', type: 'uuid' },
          { name: 'driver_id', type: 'uuid', isNullable: true },
          {
            name: 'order_type',
            type: 'enum',
            enum: ['DELIVERY', 'RIDE', 'SERVICE'],
            default: "'DELIVERY'",
          },
          {
            name: 'order_status',
            type: 'enum',
            enum: ['PENDING', 'ACCEPTED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED', 'FAILED'],
            default: "'PENDING'",
          },
          { name: 'pickup_address', type: 'varchar' },
          { name: 'dropoff_address', type: 'varchar' },
          { name: 'pickup_latitude', type: 'decimal', precision: 10, scale: 8 },
          { name: 'pickup_longitude', type: 'decimal', precision: 11, scale: 8 },
          { name: 'dropoff_latitude', type: 'decimal', precision: 10, scale: 8 },
          { name: 'dropoff_longitude', type: 'decimal', precision: 11, scale: 8 },
          {
            name: 'estimated_distance',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          { name: 'estimated_duration_minutes', type: 'int', isNullable: true },
          { name: 'base_fare', type: 'decimal', precision: 10, scale: 2 },
          { name: 'distance_fare', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'surge_multiplier', type: 'decimal', precision: 5, scale: 2, default: 1.0 },
          { name: 'total_fare', type: 'decimal', precision: 10, scale: 2 },
          { name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'final_amount', type: 'decimal', precision: 10, scale: 2 },
          {
            name: 'payment_method',
            type: 'enum',
            enum: ['CASH', 'CARD', 'WALLET', 'ONLINE'],
            default: "'CARD'",
          },
          {
            name: 'payment_status',
            type: 'enum',
            enum: ['PENDING', 'COMPLETED', 'FAILED'],
            default: "'PENDING'",
          },
          { name: 'customer_rating', type: 'int', isNullable: true },
          { name: 'customer_review', type: 'text', isNullable: true },
          { name: 'driver_rating', type: 'int', isNullable: true },
          { name: 'driver_review', type: 'text', isNullable: true },
          { name: 'scheduled_at', type: 'timestamp', isNullable: true },
          { name: 'accepted_at', type: 'timestamp', isNullable: true },
          { name: 'started_at', type: 'timestamp', isNullable: true },
          { name: 'completed_at', type: 'timestamp', isNullable: true },
          { name: 'cancelled_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
        foreignKeys: [
          {
            columnNames: ['customer_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['driver_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
        indices: [
          new TableIndex({ columnNames: ['customer_id'] }),
          new TableIndex({ columnNames: ['driver_id'] }),
          new TableIndex({ columnNames: ['order_status'] }),
          new TableIndex({ columnNames: ['order_type'] }),
          new TableIndex({ columnNames: ['created_at'] }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('orders');
  }
}
