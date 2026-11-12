const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function inspectCats() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('MONGODB_URI / MONGO_URI environment variable is required.');
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const total = await db.collection('categories').countDocuments();
  const mainCats = await db.collection('categories').countDocuments({ type: "main" });
  const subCats = await db.collection('categories').countDocuments({ type: "subcategory" });
  const nullParent = await db.collection('categories').countDocuments({ parentCategoryId: null });
  const withParent = await db.collection('categories').countDocuments({ parentCategoryId: { $ne: null } });

  console.log('Category Counts:', {
    total,
    mainCats,
    subCats,
    nullParent,
    withParent
  });

  await mongoose.disconnect();
}

inspectCats();
