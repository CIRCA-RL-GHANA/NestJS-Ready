import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateUsersTable1700000100000 implements MigrationInterface {
  name = 'CreateUsersTable1700000100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'phone_number', type: 'varchar', isNullable: true, isUnique: true },
          { name: 'password_hash', type: 'varchar' },
          { name: 'first_name', type: 'varchar' },
          { name: 'last_name', type: 'varchar' },
          { name: 'profile_picture_url', type: 'varchar', isNullable: true },
          { name: 'date_of_birth', type: 'date', isNullable: true },
          { name: 'gender', type: 'enum', enum: ['MALE', 'FEMALE', 'OTHER'], isNullable: true },
          { name: 'user_type', type: 'enum', enum: ['CUSTOMER', 'DRIVER', 'VENDOR', 'ADMIN'], default: "'CUSTOMER'" },
          { name: 'account_status', type: 'enum', enum: ['ACTIVE', 'SUSPENDED', 'DELETED', 'BANNED'], default: "'ACTIVE'" },
          { name: 'is_email_verified', type: 'boolean', default: false },
          { name: 'is_phone_verified', type: 'boolean', default: false },
          { name: 'is_identity_verified', type: 'boolean', default: false },
          { name: 'two_factor_enabled', type: 'boolean', default: false },
          { name: 'two_factor_method', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
        indices: [
          new TableIndex({ columnNames: ['email'] }),
          new TableIndex({ columnNames: ['phone_number'] }),
          new TableIndex({ columnNames: ['user_type'] }),
          new TableIndex({ columnNames: ['account_status'] }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
