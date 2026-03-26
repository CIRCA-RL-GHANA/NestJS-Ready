import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Database Seed Script
 * Populates initial data for application bootstrap
 * Run with: npm run seed
 */
async function seed() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Starting database seed...');

  try {
    // Get repositories
    const userRepo = dataSource.getRepository('User');
    const walletRepo = dataSource.getRepository('Wallet');
    const qpointsRepo = dataSource.getRepository('QPoints');
    const subscriptionRepo = dataSource.getRepository('Subscription');

    // 1. Create admin user
    console.log('📝 Creating admin user...');
    const adminPassword = await bcrypt.hash('AdminPassword123!', 10);
    const admin = await userRepo.save({
      email: 'admin@thedep.app',
      phone_number: '+1234567890',
      password_hash: adminPassword,
      first_name: 'Admin',
      last_name: 'User',
      user_type: 'ADMIN',
      account_status: 'ACTIVE',
      is_email_verified: true,
      is_phone_verified: true,
      is_identity_verified: true,
      two_factor_enabled: true,
    });
    console.log('✅ Admin user created:', admin.id);

    // 2. Create sample customers
    console.log('📝 Creating sample customers...');
    const customers = [];
    for (let i = 1; i <= 5; i++) {
      const customerPassword = await bcrypt.hash('Customer123!', 10);
      const customer = await userRepo.save({
        email: `customer${i}@thedep.app`,
        phone_number: `+123456789${i}`,
        password_hash: customerPassword,
        first_name: `Customer`,
        last_name: `${i}`,
        user_type: 'CUSTOMER',
        account_status: 'ACTIVE',
        is_email_verified: true,
        is_phone_verified: true,
        two_factor_enabled: false,
      });
      customers.push(customer);
      console.log(`✅ Customer ${i} created:`, customer.id);
    }

    // 3. Create sample drivers
    console.log('📝 Creating sample drivers...');
    const drivers = [];
    for (let i = 1; i <= 3; i++) {
      const driverPassword = await bcrypt.hash('Driver123!', 10);
      const driver = await userRepo.save({
        email: `driver${i}@thedep.app`,
        phone_number: `+1234567890${i}`,
        password_hash: driverPassword,
        first_name: `Driver`,
        last_name: `${i}`,
        user_type: 'DRIVER',
        account_status: 'ACTIVE',
        is_email_verified: true,
        is_phone_verified: true,
        is_identity_verified: true,
        two_factor_enabled: true,
      });
      drivers.push(driver);
      console.log(`✅ Driver ${i} created:`, driver.id);
    }

    // 4. Create sample vendors
    console.log('📝 Creating sample vendors...');
    const vendors = [];
    for (let i = 1; i <= 2; i++) {
      const vendorPassword = await bcrypt.hash('Vendor123!', 10);
      const vendor = await userRepo.save({
        email: `vendor${i}@thedep.app`,
        phone_number: `+1234567891${i}`,
        password_hash: vendorPassword,
        first_name: `Vendor`,
        last_name: `${i}`,
        user_type: 'VENDOR',
        account_status: 'ACTIVE',
        is_email_verified: true,
        is_phone_verified: true,
        is_identity_verified: true,
        two_factor_enabled: false,
      });
      vendors.push(vendor);
      console.log(`✅ Vendor ${i} created:`, vendor.id);
    }

    // 5. Create wallets for customers
    console.log('📝 Creating customer wallets...');
    for (const customer of customers) {
      await walletRepo.save({
        user_id: customer.id,
        balance: 500.00,
        currency: 'USD',
        total_credited: 500.00,
        status: 'ACTIVE',
      });
    }
    console.log('✅ Customer wallets created');

    // 6. Create Q-Points for customers
    console.log('📝 Creating customer Q-Points...');
    for (const customer of customers) {
      await qpointsRepo.save({
        user_id: customer.id,
        balance: 1000,
        total_earned: 1000,
        status: 'ACTIVE',
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      });
    }
    console.log('✅ Customer Q-Points created');

    // 7. Create subscriptions
    console.log('📝 Creating subscriptions...');
    const now = new Date();
    for (let i = 0; i < customers.length; i++) {
      const planType = i % 3 === 0 ? 'PREMIUM' : i % 2 === 0 ? 'BASIC' : 'FREE';
      const planPrice = planType === 'PREMIUM' ? 29.99 : planType === 'BASIC' ? 9.99 : 0;

      await subscriptionRepo.save({
        user_id: customers[i].id,
        plan_type: planType,
        plan_price: planPrice,
        billing_cycle: 'MONTHLY',
        start_date: now,
        end_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        auto_renew: true,
        status: 'ACTIVE',
      });
    }
    console.log('✅ Subscriptions created');

    console.log('\n✨ Database seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- 1 Admin user');
    console.log(`- ${customers.length} Customers with wallets, Q-Points, and subscriptions`);
    console.log(`- ${drivers.length} Drivers`);
    console.log(`- ${vendors.length} Vendors`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Execute seeding
seed().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
