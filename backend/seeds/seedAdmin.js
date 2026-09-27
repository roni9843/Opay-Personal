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
      console.log(`✅ Default Mother Super Admin created: ${superAdminEmail}`);
    } else {
      console.log(`ℹ️ Super Admin already exists: ${superAdminEmail}`);
    }

    // 2. Remove all old packages and re-seed clean new packages
    await SubscriptionPackage.deleteMany({});
    console.log('🧹 Old subscription packages removed.');

    const newPackages = [
      {
        title: 'Starter Pack (1 Month)',
        durationMonths: 1,
        regularPrice: 2000,
        price: 1499, // Offer Price
        maxAdminDevices: 1,
        maxAgents: 2,
        maxDevicesPerAgent: 1,
        maxDevices: 3, // (1 + 2 * 1) = 3 Devices = 6 SIMs
        features: [
          '3 Total Devices (6 SIM Capacity)',
          '1 Admin Device + 2 Staff Agents',
          'Realtime SMS Match Engine',
          'Instant Webhook Callbacks',
          '24/7 Socket Listener',
        ],
      },
      {
        title: 'Growth Pack (3 Months)',
        durationMonths: 3,
        regularPrice: 5500,
        price: 3999,
        maxAdminDevices: 2,
        maxAgents: 5,
        maxDevicesPerAgent: 2,
        maxDevices: 12, // (2 + 5 * 2) = 12 Devices = 24 SIMs
        features: [
          '12 Total Devices (24 SIM Capacity)',
          '2 Admin Devices + 5 Staff Agents',
          'Priority Webhook Dispatcher',
          'Full Analytics Dashboard',
          'Dedicated Support',
        ],
      },
      {
        title: 'Enterprise Pack (6 Months)',
        durationMonths: 6,
        regularPrice: 11000,
        price: 7499,
        maxAdminDevices: 4,
        maxAgents: 10,
        maxDevicesPerAgent: 2,
        maxDevices: 24, // (4 + 10 * 2) = 24 Devices = 48 SIMs
        features: [
          '24 Total Devices (48 SIM Capacity)',
          '4 Admin Devices + 10 Staff Agents',
          'High-Speed Webhook Engine',
          'Custom Gateway Branding',
          '24/7 VIP Support',
        ],
      },
      {
        title: 'Pro Yearly (12 Months)',
        durationMonths: 12,
        regularPrice: 22000,
        price: 13999,
        maxAdminDevices: 10,
        maxAgents: 25,
        maxDevicesPerAgent: 2,
        maxDevices: 60, // (10 + 25 * 2) = 60 Devices = 120 SIMs
        features: [
          '60 Total Devices (120 SIM Capacity)',
          '10 Admin Devices + 25 Staff Agents',
          'Unlimited API Integration',
          'Dedicated Server Allocation',
          'Priority SLA Support',
        ],
      },
    ];

    await SubscriptionPackage.insertMany(newPackages);
    console.log('✅ New Subscription Packages seeded successfully!');

    console.log('[Seed Completed Successfully]');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedAdmin();
