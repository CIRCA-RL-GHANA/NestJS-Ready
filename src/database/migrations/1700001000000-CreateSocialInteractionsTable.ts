import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateSocialInteractionsTable1700001000000 implements MigrationInterface {
  name = 'CreateSocialInteractionsTable1700001000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'social_interactions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid' },
          { name: 'followed_user_id', type: 'uuid' },
          { name: 'interaction_type', type: 'enum', enum: ['FOLLOW', 'LIKE', 'COMMENT', 'SHARE'], default: "'FOLLOW'" },
          { name: 'post_id', type: 'uuid', isNullable: true },
          { name: 'comment_text', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
        foreignKeys: [
          { columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
          { columnNames: ['followed_user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
        ],
        indices: [
          new TableIndex({ columnNames: ['user_id', 'interaction_type'] }),
          new TableIndex({ columnNames: ['followed_user_id'] }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('social_interactions');
  }
}
