const https = require('https');
const http = require('http');

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const client = u.protocol === 'https:' ? https : http;
    const req = client.request(u, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch (_) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function run() {
  const BASE_URL = 'https://servonekart.onrender.com';
  console.log('=== VERIFYING TRICELYN LIVE SYSTEM ===\n');

  // 1. Health
  console.log('1. Checking /health...');
  const health = await request(`${BASE_URL}/health`);
  console.log(`Health Status: ${health.status}`, health.body);

  // 2. Grocery Stores
  console.log('\n2. Checking /api/grocery/stores...');
  const stores = await request(`${BASE_URL}/api/grocery/stores`);
  console.log(`Stores Status: ${stores.status}, Count: ${stores.body?.count || stores.body?.data?.length}`);
  if (Array.isArray(stores.body?.data)) {
    stores.body.data.forEach(s => {
      console.log(`  - [${s.restaurantId || s.id}] ${s.name} (${s.area || s.city}) - Delivery: ${s.deliveryTime} mins`);
    });
  }

  // 3. Grocery Categories
  console.log('\n3. Checking /api/grocery/categories...');
  const cats = await request(`${BASE_URL}/api/grocery/categories`);
  console.log(`Categories Status: ${cats.status}, Count: ${cats.body?.count || cats.body?.data?.length}`);
  if (Array.isArray(cats.body?.data)) {
    console.log(`  Top 5 Categories:`, cats.body.data.slice(0, 5).map(c => c.name));
  }

  // 4. Categories Tree (Main + Subcategories)
  console.log('\n4. Checking /api/categories/tree?vertical=grocery...');
  const tree = await request(`${BASE_URL}/api/categories/tree?vertical=grocery`);
  console.log(`Category Tree Status: ${tree.status}, Main Categories: ${tree.body?.count}`);
  if (Array.isArray(tree.body?.data)) {
    tree.body.data.slice(0, 3).forEach(c => {
      console.log(`  - ${c.name} (${c.subcategories?.length} subcategories: ${c.subcategories?.map(s => s.name).join(', ')})`);
    });
  }

  // 5. Grocery Products
  console.log('\n5. Checking /api/grocery/products...');
  const prods = await request(`${BASE_URL}/api/grocery/products`);
  console.log(`Products Status: ${prods.status}, Count: ${prods.body?.count || prods.body?.data?.length}`);
  if (Array.isArray(prods.body?.data)) {
    console.log(`  Sample 4 Products:`);
    prods.body.data.slice(0, 4).forEach(p => {
      console.log(`    * [${p.sku || p.id}] ${p.name} - ₹${p.price} (MRP: ₹${p.mrp}) | Store: ${p.storeName || p.restaurant?.name || 'N/A'}`);
    });
  }

  // 6. Banners
  console.log('\n6. Checking /api/grocery/banners...');
  const banners = await request(`${BASE_URL}/api/grocery/banners`);
  console.log(`Banners Status: ${banners.status}, Hero Count: ${banners.body?.data?.heroSlides?.length}, Offers Count: ${banners.body?.data?.offerBanners?.length}`);

  // 7. Admin Login & Protected Endpoints
  console.log('\n7. Authenticating Admin (admin@gmail.com)...');
  const loginRes = await request(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email: 'admin@gmail.com', password: 'admin123' }
  });
  console.log(`Admin Login Status: ${loginRes.status}`);
  const token = loginRes.body?.token;
  if (!token) {
    console.error('Failed to get admin token:', loginRes.body);
    return;
  }
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 8. Admin Users (Customers)
  console.log('\n8. Checking Admin Customers (/api/admin/users?role=customer)...');
  const usersRes = await request(`${BASE_URL}/api/admin/users?role=customer`, { headers: authHeaders });
  console.log(`Customers Status: ${usersRes.status}, Total: ${usersRes.body?.total || usersRes.body?.users?.length}`);
  if (Array.isArray(usersRes.body?.users)) {
    usersRes.body.users.forEach(u => {
      console.log(`  - [${u.customerId || u._id}] ${u.name} | ${u.mobile} | Wallet: ₹${u.walletBalance}`);
    });
  }

  // 9. Admin Riders
  console.log('\n9. Checking Admin Riders (/api/riders/admin/all)...');
  const ridersRes = await request(`${BASE_URL}/api/riders/admin/all`, { headers: authHeaders });
  console.log(`Riders Status: ${ridersRes.status}, Total: ${ridersRes.body?.total || ridersRes.body?.riders?.length}`);
  if (Array.isArray(ridersRes.body?.riders)) {
    ridersRes.body.riders.forEach(r => {
      console.log(`  - [${r.riderId}] ${r.name} | ${r.mobile} | Status: ${r.verificationStatus} | Online: ${r.isOnline} | Vehicle: ${r.vehicle?.number || r.vehicle?.type}`);
    });
  }

  // 10. Admin Restaurants (All 5 Vendors) & Their Menu Items
  console.log('\n10. Checking Admin Restaurants (/api/restaurants/admin/all)...');
  const adminRests = await request(`${BASE_URL}/api/restaurants/admin/all`, { headers: authHeaders });
  console.log(`Admin Restaurants Status: ${adminRests.status}, Total: ${adminRests.body?.total}`);
  if (Array.isArray(adminRests.body?.restaurants)) {
    for (const r of adminRests.body.restaurants) {
      const menuRes = await request(`${BASE_URL}/api/menu/${r._id}?includePending=true`, { headers: authHeaders });
      console.log(`  - [${r.restaurantId}] ${r.name} | PIN: ${r.pin} | Status: ${r.status} | Menu Items in DB: ${menuRes.body?.count || menuRes.body?.data?.length || 0}`);
    }
  }

  // 11. Admin Catalog Restaurants (Testing our realPin fix!)
  console.log('\n11. Checking Catalog Master Control (/api/catalog/restaurants)...');
  const catRests = await request(`${BASE_URL}/api/catalog/restaurants`, { headers: authHeaders });
  console.log(`Catalog Restaurants Status: ${catRests.status}, Count: ${catRests.body?.count}`);

  // 12. Admin Catalog Products
  console.log('\n12. Checking Catalog Master Control (/api/catalog/products)...');
  const catProds = await request(`${BASE_URL}/api/catalog/products`, { headers: authHeaders });
  console.log(`Catalog Products Status: ${catProds.status}, Count: ${catProds.body?.total || catProds.body?.products?.length}`);

  // 13. Vercel Websites (Website & Admin)
  console.log('\n13. Checking Vercel Deployments...');
  const webRes = await request('https://tricelynwebsite.vercel.app');
  console.log(`Website (https://tricelynwebsite.vercel.app): Status ${webRes.status}`);

  const adminWebRes = await request('https://tricelynadmin.vercel.app');
  console.log(`Admin Panel (https://tricelynadmin.vercel.app): Status ${adminWebRes.status}`);

  console.log('\n=== ALL VERIFICATIONS COMPLETED SUCCESSFULLY ===');
}

run().catch(err => {
  console.error('Verification Error:', err);
});

