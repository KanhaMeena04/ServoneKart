/**
 * ECDKART Super App Canonical Business Verticals and Partner Types
 */
const VERTICALS = {
  FOOD: 'food',
  GROCERY: 'grocery',
  HOME_SERVICES: 'home_services',
  MEDICINE: 'medicine',
  COURIER: 'courier',
  LAUNDRY: 'laundry',
  GIFTS_BAKERY: 'gifts_bakery',
  ESSENTIALS: 'essentials'
};

const BUSINESS_TYPES = {
  RESTAURANT: 'restaurant',
  GROCERY_STORE: 'grocery_store',
  PHARMACY: 'pharmacy',
  LAUNDRY: 'laundry',
  HOME_SERVICE_PROVIDER: 'home_service_provider',
  BAKERY_GIFTS: 'bakery_gifts',
  WATER_DAIRY_SUPPLIER: 'water_dairy_supplier'
};

const VERTICAL_METADATA = {
  [VERTICALS.FOOD]: {
    name: 'Food Delivery',
    slug: 'food',
    icon: 'restaurant',
    badge: 'Express',
    accentColor: '#248C70',
    description: 'Order from top restaurants in your local area'
  },
  [VERTICALS.GROCERY]: {
    name: 'Grocery & Staples',
    slug: 'grocery',
    icon: 'local_grocery_store',
    badge: '10-20 mins',
    accentColor: '#16A34A',
    description: 'Fresh fruits, vegetables, dairy & daily household essentials'
  },
  [VERTICALS.HOME_SERVICES]: {
    name: 'Home Services',
    slug: 'home-services',
    icon: 'home_repair_service',
    badge: 'Verified Pros',
    accentColor: '#2563EB',
    description: 'Electricians, plumbers, AC technicians, cleaning & repairs'
  },
  [VERTICALS.MEDICINE]: {
    name: 'Medicine & Pharmacy',
    slug: 'medicine',
    icon: 'medication',
    badge: 'Prescription',
    accentColor: '#DC2626',
    description: 'Genuine medicines, health supplements & OTC healthcare'
  },
  [VERTICALS.COURIER]: {
    name: 'Courier & Parcel',
    slug: 'courier',
    icon: 'local_shipping',
    badge: 'Doorstep',
    accentColor: '#E89D1E',
    description: 'Send parcels, documents, gifts & packages anywhere in Indore'
  },
  [VERTICALS.LAUNDRY]: {
    name: 'Laundry & Dry Clean',
    slug: 'laundry',
    icon: 'local_laundry_service',
    badge: 'Care',
    accentColor: '#0D9488',
    description: 'Washing, steam ironing, dry cleaning with doorstep pickup'
  },
  [VERTICALS.GIFTS_BAKERY]: {
    name: 'Bakery, Cakes & Gifts',
    slug: 'gifts-bakery',
    icon: 'cake',
    badge: 'Fresh',
    accentColor: '#EC4899',
    description: 'Fresh cakes, flowers, chocolates & custom celebration gifts'
  },
  [VERTICALS.ESSENTIALS]: {
    name: 'Daily Essentials & Water',
    slug: 'essentials',
    icon: 'water_drop',
    badge: 'Subscription',
    accentColor: '#0284C7',
    description: '20L water cans, daily milk subscriptions & pet essentials'
  }
};

module.exports = {
  VERTICALS,
  BUSINESS_TYPES,
  VERTICAL_METADATA
};

