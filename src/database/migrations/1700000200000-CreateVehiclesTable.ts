import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateVehiclesTable1700000200000 implements MigrationInterface {
  name = 'CreateVehiclesTable1700000200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'vehicles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'driver_id', type: 'uuid' },
          {
            name: 'vehicle_type',
            type: 'enum',
            enum: ['SEDAN', 'SUV', 'TRUCK', 'VAN', 'BIKE', 'MOTORCYCLE'],
            default: "'SEDAN'",
          },
          { name: 'license_plate', type: 'varchar', isUnique: true },
          { name: 'color', type: 'varchar' },
          { name: 'make', type: 'varchar' },
          { name: 'model', type: 'varchar' },
          { name: 'year', type: 'int' },
          { name: 'registration_number', type: 'varchar', isUnique: true },
          { name: 'insurance_provider', type: 'varchar', isNullable: true },
          { name: 'insurance_expiry', type: 'date', isNullable: true },
          {
            name: 'vehicle_status',
            type: 'enum',
            enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RETIRED'],
            default: "'ACTIVE'",
          },
          { name: 'document_verified', type: 'boolean', default: false },
          {
            name: 'inspection_status',
            type: 'enum',
            enum: ['PENDING', 'PASSED', 'FAILED'],
            default: "'PENDING'",
          },
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
            columnNames: ['driver_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          new TableIndex({ columnNames: ['driver_id'] }),
          new TableIndex({ columnNames: ['license_plate'] }),
          new TableIndex({ columnNames: ['vehicle_type'] }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('vehicles');
  }
}
