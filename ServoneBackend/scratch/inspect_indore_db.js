const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Restaurant = require('../models/Restaurant');

async function inspectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGODB_URI / MONGO_URI environment variable is required.');
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    const restaurants = await Restaurant.find({}).lean();
    console.log(`TOTAL RESTAURANTS IN DB: ${restaurants.length}\n`);

    restaurants.forEach((r, idx) => {
      console.log(`--- RESTAURANT #${idx + 1} ---`);
      console.log(`_id: ${r._id}`);
      console.log(`name:`, r.name);
      console.log(`slug: ${r.slug}`);
      console.log(`city: ${r.city}`);
      console.log(`address: ${r.address}`);
      console.log(`location:`, r.location);
      console.log(`isActive: ${r.isActive}`);
      console.log(`restaurantApproved: ${r.restaurantApproved}`);
      console.log(`menuApproved: ${r.menuApproved}`);
      console.log(`acceptingOrders: ${r.acceptingOrders}`);
      console.log(`geofenceRadius: ${r.geofenceRadius}`);
      console.log(`owner: ${r.owner}\n`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspectDB();
