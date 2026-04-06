import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRidesTable1700000900000 implements MigrationInterface {
  name = 'CreateRidesTable1700000900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'rides',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'passenger_id', type: 'uuid' },
          { name: 'driver_id', type: 'uuid', isNullable: true },
          { name: 'vehicle_id', type: 'uuid', isNullable: true },
          {
            name: 'ride_type',
            type: 'enum',
            enum: ['ECONOMY', 'PREMIUM', 'SHARED'],
            default: "'ECONOMY'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['REQUESTED', 'ACCEPTED', 'STARTED', 'COMPLETED', 'CANCELLED'],
            default: "'REQUESTED'",
          },
          { name: 'pickup_location', type: 'varchar' },
          { name: 'dropoff_location', type: 'varchar' },
          { name: 'pickup_lat', type: 'decimal', precision: 10, scale: 8 },
          { name: 'pickup_lng', type: 'decimal', precision: 11, scale: 8 },
          { name: 'dropoff_lat', type: 'decimal', precision: 10, scale: 8 },
          { name: 'dropoff_lng', type: 'decimal', precision: 11, scale: 8 },
          { name: 'estimated_fare', type: 'decimal', precision: 10, scale: 2 },
          { name: 'actual_fare', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'distance_km', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'duration_minutes', type: 'int', isNullable: true },
          { name: 'rating', type: 'int', isNullable: true },
          { name: 'review', type: 'text', isNullable: true },
          { name: 'scheduled_at', type: 'timestamp', isNullable: true },
          { name: 'accepted_at', type: 'timestamp', isNullable: true },
          { name: 'started_at', type: 'timestamp', isNullable: true },
          { name: 'completed_at', type: 'timestamp', isNullable: true },
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
            columnNames: ['passenger_id'],
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
          {
            columnNames: ['vehicle_id'],
            referencedTableName: 'vehicles',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('rides');
  }
}
