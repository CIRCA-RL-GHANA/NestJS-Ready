import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateProductsTable1700000700000 implements MigrationInterface {
  name = 'CreateProductsTable1700000700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'seller_id', type: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'sku', type: 'varchar', isUnique: true },
          { name: 'category', type: 'varchar' },
          { name: 'subcategory', type: 'varchar', isNullable: true },
          { name: 'price', type: 'decimal', precision: 10, scale: 2 },
          { name: 'cost_price', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'stock_quantity', type: 'int', default: 0 },
          { name: 'image_url', type: 'varchar', isNullable: true },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED'],
            default: "'ACTIVE'",
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
            columnNames: ['seller_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('products');
  }
}
