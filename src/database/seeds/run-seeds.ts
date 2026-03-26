import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env before NestJS bootstrap
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Database Seed Entrypoint
 * Runs: npm run seed
 *
 * Creates initial production-bootstrap data:
 *   - 1 admin user
 *   - 5 sample customers
 *   - 3 sample drivers
 *   - 2 sample vendors
 *   - Wallets, Q-Points, and Subscriptions per customer
 */

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'orionstack_dev',
  entities: [path.resolve(__dirname, '../../**/*.entity{.ts,.js}')],
  synchronize: false,
  logging: false,
});

async function seed() {
  console.log('🌱 Connecting to database...');
  await dataSource.initialize();
  console.log('✅ Database connected');
  console.log('🌱 Starting seed...\n');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Admin user
    const adminHash = await bcrypt.hash('AdminPassword123!', 12);
    const [admin] = await queryRunner.query(
      `INSERT INTO users
        (email, phone_number, password_hash, first_name, last_name, user_type, account_status,
         is_email_verified, is_phone_verified, is_identity_verified, two_factor_enabled)
       VALUES ($1,$2,$3,$4,$5,'ADMIN','ACTIVE',true,true,true,true)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['admin@thedep.app', '+10000000000', adminHash, 'Admin', 'User'],
    );
    if (admin) console.log('✅ Admin created:', admin.id);
    else console.log('ℹ️  Admin already exists, skipping');

    // 2. Sample customers
    const customerIds: string[] = [];
    for (let i = 1; i <= 5; i++) {
      const hash = await bcrypt.hash('Customer123!', 12);
      const [row] = await queryRunner.query(
        `INSERT INTO users
          (email, phone_number, password_hash, first_name, last_name, user_type, account_status,
           is_email_verified, is_phone_verified, two_factor_enabled)
         VALUES ($1,$2,$3,'Customer',$4,'CUSTOMER','ACTIVE',true,true,false)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [`customer${i}@thedep.app`, `+1234567${String(i).padStart(3, '0')}`, hash, `${i}`],
      );
      if (row) {
        customerIds.push(row.id);
        console.log(`✅ Customer ${i} created:`, row.id);
      } else {
        console.log(`ℹ️  Customer ${i} already exists`);
      }
    }

    // 3. Sample drivers
    for (let i = 1; i <= 3; i++) {
      const hash = await bcrypt.hash('Driver123!', 12);
      const [row] = await queryRunner.query(
        `INSERT INTO users
          (email, phone_number, password_hash, first_name, last_name, user_type, account_status,
           is_email_verified, is_phone_verified, is_identity_verified, two_factor_enabled)
         VALUES ($1,$2,$3,'Driver',$4,'DRIVER','ACTIVE',true,true,true,true)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [`driver${i}@thedep.app`, `+1987654${String(i).padStart(3, '0')}`, hash, `${i}`],
      );
      if (row) console.log(`✅ Driver ${i} created:`, row.id);
      else console.log(`ℹ️  Driver ${i} already exists`);
    }

    // 4. Sample vendors
    for (let i = 1; i <= 2; i++) {
      const hash = await bcrypt.hash('Vendor123!', 12);
      const [row] = await queryRunner.query(
        `INSERT INTO users
          (email, phone_number, password_hash, first_name, last_name, user_type, account_status,
           is_email_verified, is_phone_verified, is_identity_verified, two_factor_enabled)
         VALUES ($1,$2,$3,'Vendor',$4,'VENDOR','ACTIVE',true,true,true,false)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [`vendor${i}@thedep.app`, `+1555123${String(i).padStart(3, '0')}`, hash, `${i}`],
      );
      if (row) console.log(`✅ Vendor ${i} created:`, row.id);
      else console.log(`ℹ️  Vendor ${i} already exists`);
    }

    // 5. Wallets and Q-Points for each freshly created customer
    for (const custId of customerIds) {
      await queryRunner.query(
        `INSERT INTO wallets (user_id, balance, currency, total_credited, status)
         VALUES ($1, 500.00, 'USD', 500.00, 'ACTIVE')
         ON CONFLICT (user_id) DO NOTHING`,
        [custId],
      );
      await queryRunner.query(
        `INSERT INTO qpoints (user_id, balance, total_earned, status, expiry_date)
         VALUES ($1, 1000, 1000, 'ACTIVE', NOW() + INTERVAL '1 year')
         ON CONFLICT (user_id) DO NOTHING`,
        [custId],
      );
    }
    if (customerIds.length) {
      console.log(`✅ Wallets and Q-Points created for ${customerIds.length} customers`);
    }

    await queryRunner.commitTransaction();
    console.log('\n✨ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log('  - 1 Admin   → admin@thedep.app       / AdminPassword123!');
    console.log('  - 5 Customers → customer[1-5]@thedep.app / Customer123!');
    console.log('  - 3 Drivers → driver[1-3]@thedep.app    / Driver123!');
    console.log('  - 2 Vendors → vendor[1-2]@thedep.app    / Vendor123!');
  } catch (err) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Seed failed, rolled back:', err);
    throw err;
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

seed().catch((err) => {
  console.error('💥 Fatal:', err);
  process.exit(1);
});
