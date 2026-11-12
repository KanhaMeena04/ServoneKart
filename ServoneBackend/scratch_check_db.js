const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function check() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('MONGODB_URI / MONGO_URI environment variable is required.');
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);
  
  const Restaurant = mongoose.model('Restaurant', new mongoose.Schema({}, { strict: false }));
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

  const users = await User.find({ mobile: '8305370330' });
  console.log('Users found:', users.map(u => ({ id: u._id, name: u.name, mobile: u.mobile, role: u.role })));

  const rests = await Restaurant.find({ 
    $or: [
      { contactNumber: '8305370330' },
      { email: /8305370330/ },
      { 'name.en': /Shikha/i },
      { name: /Shikha/i }
    ]
  });

  console.log('Restaurants found count:', rests.length);
  for (const rest of rests) {
    console.log('--- RESTAURANT ---');
    console.log('ID:', rest._id);
    console.log('Name:', rest.name);
    console.log('Approved:', rest.restaurantApproved);
    console.log('MenuApproved:', rest.menuApproved);
    console.log('Menu array:', rest.menu);
    
    const prods = await Product.find({ restaurant: rest._id });
    console.log('Products for this rest count:', prods.length);
    prods.forEach(p => console.log('  Product:', p.name, 'Price:', p.basePrice || p.sellingPrice, 'Category:', p.category, 'Approved:', p.isApproved));
  }

  process.exit(0);
}

check().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
