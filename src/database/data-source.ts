import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config();

/**
 * TypeORM CLI DataSource
 *
 * Entity path strategy:
 *  - Development (ts-node):  __dirname = src/database  → ../  = src/
 *  - Production  (compiled): __dirname = dist/database → ../ = dist/
 * The glob `*.entity{.ts,.js}` matches both source and compiled files, so the
 * same data-source can be used for `typeorm migration:run` in both environments.
 */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'orionstack_dev',
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations', '**', '*{.ts,.js}')],
  synchronize: false,
  logging: true,
});
