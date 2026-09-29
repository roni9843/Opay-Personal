require('dotenv').config();
const mongoose = require('mongoose');
const SubscriptionPackage = require('./models/SubscriptionPackage');

const seedPackages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seed Script] Connected to MongoDB database...');

    // 1. Clear existing packages
    await SubscriptionPackage.deleteMany({});
    console.log('[Seed Script] Existing subscription packages cleared.');

    // 2. Define fresh packages with demo values for Per Transaction Charge & Free SMS
    const defaultPackages = [
      {
        title: 'Starter Pack (1 Month)',
        durationMonths: 1,
        regularPrice: 2000,
        price: 1500,
        maxAdminDevices: 1,
        maxAgents: 2,
        maxDevicesPerAgent: 1,
        maxDevices: 3,
        freeSmsCount: 1000,
        chargeType: 'percentage',
        chargeValue: 1.5, // 1.5% per transaction
        features: [
          '1 Dedicated Admin SIM Controller',
          '2 Staff Agents Quota',
          'Dual SIM per Device (Up to 6 SIMs)',
          '1,000 Free SMS Quota included',
          'Per Trx Charge: 1.5%',
          'Instant Webhook Callbacks & Realtime Socket Sync',
        ],
        active: true,
      },
      {
        title: 'Professional Pack (3 Months)',
        durationMonths: 3,
        regularPrice: 5500,
        price: 4000,
        maxAdminDevices: 2,
        maxAgents: 5,
        maxDevicesPerAgent: 2,
        maxDevices: 12,
        freeSmsCount: 3500,
        chargeType: 'percentage',
        chargeValue: 1.0, // 1.0% per transaction
        features: [
          '2 Dedicated Admin SIM Controllers',
          '5 Staff Agents Quota',
          'Up to 12 Devices (24 SIM Capacity)',
          '3,500 Free SMS Quota included',
          'Discounted Per Trx Charge: 1.0%',
          'Priority Webhook Dispatch & Socket Listener',
        ],
        active: true,
      },
      {
        title: 'Enterprise Pack (1 Year)',
        durationMonths: 12,
        regularPrice: 20000,
        price: 14500,
        maxAdminDevices: 5,
        maxAgents: 15,
        maxDevicesPerAgent: 2,
        maxDevices: 35,
        freeSmsCount: 15000,
        chargeType: 'flat',
        chargeValue: 2.50, // 2.50 BDT flat per transaction
        features: [
          '5 Dedicated Admin SIM Controllers',
          '15 Staff Agents Quota',
          'Up to 35 Devices (70 SIM Slots)',
          '15,000 Free SMS Quota included',
          'Flat Charge: 2.50 BDT per Trx',
          '24/7 Dedicated Support & VIP Webhook Priority',
        ],
        active: true,
      },
    ];

    const inserted = await SubscriptionPackage.insertMany(defaultPackages);
    console.log(`[Seed Script] Successfully seeded ${inserted.length} fresh packages!`);

    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err.message);
    process.exit(1);
  }
};

seedPackages();
