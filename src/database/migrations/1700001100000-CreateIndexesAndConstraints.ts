import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateIndexesAndConstraints1700001100000 implements MigrationInterface {
  name = 'CreateIndexesAndConstraints1700001100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create composite indexes for better query performance
    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_orders_customer_status',
        columnNames: ['customer_id', 'order_status'],
      }),
    );

    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_orders_driver_status',
        columnNames: ['driver_id', 'order_status'],
      }),
    );

    await queryRunner.createIndex(
      'rides',
      new TableIndex({
        name: 'IDX_rides_passenger_status',
        columnNames: ['passenger_id', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'rides',
      new TableIndex({
        name: 'IDX_rides_driver_status',
        columnNames: ['driver_id', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_payments_user_status',
        columnNames: ['user_id', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_type_status',
        columnNames: ['user_type', 'account_status'],
      }),
    );

    // Indexes for date-range queries
    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_orders_created_at',
        columnNames: ['created_at'],
      }),
    );

    await queryRunner.createIndex(
      'rides',
      new TableIndex({
        name: 'IDX_rides_created_at',
        columnNames: ['created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all indexes
    await queryRunner.dropIndex('orders', 'IDX_orders_customer_status');
    await queryRunner.dropIndex('orders', 'IDX_orders_driver_status');
    await queryRunner.dropIndex('rides', 'IDX_rides_passenger_status');
    await queryRunner.dropIndex('rides', 'IDX_rides_driver_status');
    await queryRunner.dropIndex('payments', 'IDX_payments_user_status');
    await queryRunner.dropIndex('users', 'IDX_users_type_status');
    await queryRunner.dropIndex('orders', 'IDX_orders_created_at');
    await queryRunner.dropIndex('rides', 'IDX_rides_created_at');
  }
}
