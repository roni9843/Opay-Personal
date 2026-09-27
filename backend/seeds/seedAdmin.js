require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const SubscriptionPackage = require('../models/SubscriptionPackage');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seed] Connected to MongoDB');

    // 1. Seed Mother Super Admin Account
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'admin@opay.com').toLowerCase();
    let superAdmin = await User.findOne({ email: superAdminEmail });

    if (!superAdmin) {
      superAdmin = new User({
        name: process.env.SUPER_ADMIN_NAME || 'Mother Admin',
        email: superAdminEmail,
        phone: process.env.SUPER_ADMIN_PHONE || '01700000000',
        password: process.env.SUPER_ADMIN_PASS || 'Admin123456!',
        role: 'super_admin',
        companyName: 'Opay-Personal Platform Owner',
        status: 'active',
      });
      await superAdmin.save();
      console.log(`✅ Default Mother Super Admin created: ${superAdminEmail} / ${process.env.SUPER_ADMIN_PASS || 'Admin123456!'}`);
    } else {
      console.log(`ℹ️ Super Admin already exists: ${superAdminEmail}`);
    }

    // 2. Seed Default Subscription Packages
    const packageCount = await SubscriptionPackage.countDocuments({});
    if (packageCount === 0) {
      const packages = [
        {
          title: 'Starter 1 Month',
          durationMonths: 1,
          price: 1500,
          maxDevices: 2,
          maxAgents: 3,
          features: ['2 Active SIM Devices', '3 Staff Agents', 'Real-time SMS Match', 'Instant Webhooks'],
        },
        {
          title: 'Growth 3 Months',
          durationMonths: 3,
          price: 4000,
          maxDevices: 5,
          maxAgents: 8,
          features: ['5 Active SIM Devices', '8 Staff Agents', 'Priority Webhooks', 'Full Analytics'],
        },
        {
          title: 'Enterprise 6 Months',
          durationMonths: 6,
          price: 7500,
          maxDevices: 12,
          maxAgents: 20,
          features: ['12 Active SIM Devices', '20 Staff Agents', 'Unlimited Webhooks', 'Dedicated Support'],
        },
        {
          title: 'Pro Yearly (12 Months)',
          durationMonths: 12,
          price: 13500,
          maxDevices: 30,
          maxAgents: 50,
          features: ['30 Active SIM Devices', '50 Staff Agents', 'API Access', 'Enterprise SLA'],
        },
      ];

      await SubscriptionPackage.insertMany(packages);
      console.log('✅ Default Subscription Packages seeded successfully');
    }

    console.log('[Seed Completed Successfully]');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedAdmin();
