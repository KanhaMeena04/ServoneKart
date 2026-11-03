import * as React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Collapse,
  Box,
} from '@mui/material'
import {
  HomeRounded,
  Assignment,
  Store,
  LocationCity,
  DriveEta,
  Cancel,
  Percent,
  Image,
  People,
  ChevronRight,
  RadioButtonUnchecked,
  SettingsApplications,
  Category,
  Map,
  LocalShipping,
  RestaurantMenu,
  AttachMoney,
  Campaign,
  AccountBalance,
  Storefront,
  Tune,
  Flag,
  Schedule,
  Warning,
  ReceiptLong,
  HealthAndSafety,
  LocalGroceryStore,
  Inventory,
} from '@mui/icons-material'
import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import RateReview from "@mui/icons-material/RateReview";
import Article from "@mui/icons-material/Article";
import Security from "@mui/icons-material/Security";
import BarChart from "@mui/icons-material/BarChart";
import SupportAgent from "@mui/icons-material/SupportAgent";

import { useAuth } from '../context/AuthContext';

export interface MenuItemType {
  text: string;
  icon?: React.ReactNode;
  path?: string;
  permission?: string;
  badge?: string;
  children?: { text: string; path: string; permission?: string }[];
}

export const menuItems: MenuItemType[] = [
  { text: 'Dashboard', icon: <HomeRounded />, path: '/dashboard', permission: 'Dashboard' },
  {
    text: 'Category Workspaces',
    icon: <Storefront />,
    permission: 'Dashboard',
    children: [
      { text: '🛒 Grocery & Supermarket (Core)', path: '/admin/grocery/dashboard' },
      { text: '💧 Daily Essentials & Milk', path: '/admin/essentials/dashboard' },
      { text: '💊 Pharmacy & Wellness', path: '/admin/medicine/dashboard' },
      { text: '📦 Courier & Quick Parcel', path: '/admin/courier/dashboard' },
      { text: '🔧 Home & Appliance Services', path: '/admin/home-services/dashboard' },
      { text: '🧺 Laundry & Fabric Care', path: '/admin/laundry/dashboard' },
      { text: '🎁 Gifts & Celebration', path: '/admin/gifts/dashboard' },
    ]
  },
  { text: 'Live Orders', icon: <Assignment />, path: '/order-dashboard', permission: 'Order' },
  { text: 'Live Map', icon: <Map />, path: '/eagles-view', permission: 'Order' },
  { text: 'Customers', icon: <People />, path: '/user-management', permission: 'User' },

  {
    text: 'Dark Stores & Marts',
    icon: <Store />,
    permission: 'Restaurant',
    children: [
      { text: 'Dark Store Control Tower', path: '/vendors' },
      { text: '🔑 Vendor Credentials & RBAC', path: '/admin/vendor-credentials' },
      { text: '🛡️ Role & Permission Matrix', path: '/role-permission-matrix' },
      { text: 'Store Partner Portal', path: '/vendor/portal' },
      { text: 'All Dark Stores & Marts', path: '/restaurants' },
      { text: 'Pending Verification', path: '/pending-restaurants' },
      { text: 'Approved Dark Stores', path: '/approve-restaurant' },
      { text: 'Store Promocodes & Deals', path: '/promocodes', permission: 'Promocode' },
      { text: 'Add Store Promocode', path: '/add-promocodes', permission: 'Promocode' },
    ]
  },

  {
    text: 'Delivery Partners',
    icon: <DriveEta />,
    permission: 'Driver',
    children: [
      { text: 'All Delivery Fleet', path: '/driver-list' },
      { text: 'Pending Verification', path: '/pending-driver-list' },
      { text: 'Earnings & Config', path: '/rider-earnings-control' },
      { text: 'Payout Requests', path: '/rider-payout-requests', permission: 'Settlements' },
      { text: 'Cash Management', path: '/rider-cash-management' },
    ]
  },

  {
    text: 'Grocery Orders',
    icon: <Assignment />,
    permission: 'Order',
    children: [
      { text: 'Orders Analytics', path: '/orders-analytics' },
      { text: 'All Grocery Orders', path: '/new-order' },
      { text: 'Packing & Processing', path: '/processing-order' },
      { text: 'Rider Pickup Orders', path: '/pick-up-order' },
      { text: 'Delivered Grocery Orders', path: '/delivered-order' },
      { text: 'Cancelled Orders', path: '/cancelled-order' },
      { text: 'Failed Orders', path: '/failed-order' },
      { text: 'Refund Orders', path: '/order-refund', permission: 'Reports' },
      { text: 'Abandoned Carts', path: '/abandon-cart' },
    ]
  },

  {
    text: 'Categories & Aisles',
    icon: <Category />,
    permission: 'Category',
    children: [
      { text: 'All Grocery Categories', path: '/category', permission: 'Category' },
      { text: 'Subcategories & Aisles', path: '/category?tab=1', permission: 'Category' },
      { text: 'Add New Category', path: '/category?action=add', permission: 'Category' },
      { text: 'Category Requests', path: '/category-requests', permission: 'Category' },
    ]
  },

  {
    text: 'Products & Approvals',
    icon: <Inventory />,
    permission: 'Restaurant',
    children: [
      { text: 'Master Product Catalog', path: '/catalog-master-control' },
      { text: 'Pending Product Approvals', path: '/pending-menu-approvals', permission: 'MenuApprovals' },
      { text: 'Product Approval History', path: '/menu-approval-history', permission: 'MenuApprovals' },
    ]
  },

  {
    text: 'Inventory & Stock Control',
    icon: <LocalGroceryStore />,
    permission: 'Restaurant',
    children: [
      { text: 'Real-Time Stock Manager', path: '/admin/inventory' },
      { text: 'Low Stock Alerts (< 10)', path: '/admin/inventory?status=low_stock' },
      { text: 'Out of Stock Items', path: '/admin/inventory?status=out_of_stock' },
    ]
  },

  {
    text: 'Billing & Tax Invoices',
    icon: <ReceiptLong />,
    permission: 'Order',
    children: [
      { text: 'Order Tax Invoices', path: '/admin/invoices' },
      { text: 'GST & Payment Reconciliation', path: '/payment-reconciliation', permission: 'Reports' },
      { text: 'Pricing & Delivery Fees', path: '/pricing-control', permission: 'SiteSettings' },
    ]
  },

  {
    text: 'Marketing',
    icon: <Campaign />,
    permission: 'Promocode',
    children: [
      { text: 'Coupons & Offers', path: '/promocodes', permission: 'Promocode' },
      { text: 'Store & App Banners', path: '/restaurant-banner', permission: 'CMSControlTower' },
      { text: 'Customer Notifications', path: '/custom-push', permission: 'PushNotifications' },
    ]
  },

  {
    text: 'Finance & Payouts',
    icon: <AccountBalance />,
    permission: 'Reports',
    children: [
      { text: 'Revenue Overview', path: '/financial-overview', permission: 'Reports' },
      { text: 'Refunds & Returns', path: '/order-refund', permission: 'Reports' },
      { text: 'Dark Store Settlements', path: '/restaurant-payout', permission: 'Settlements' },
      { text: 'Delivery Partner Settlement', path: '/driver-payout', permission: 'Settlements' },
      { text: 'Payment Reconciliation', path: '/payment-reconciliation', permission: 'Reports' },
    ]
  },

  { text: 'Service Areas & Hubs', icon: <LocationCity />, path: '/service-areas', permission: 'City' },
  { text: 'Dark Store Self Pickup', icon: <Storefront />, path: '/self-pickup-control', permission: 'SiteSettings' },
  { text: 'Order Timings & Cancellation', icon: <Schedule />, path: '/order-timing-control', permission: 'SiteSettings' },
  { text: 'App CMS', icon: <Article />, path: '/user-app-cms', permission: 'CMSControlTower' },
  { text: 'Reports & Analytics', icon: <BarChart />, path: '/profit-loss-report', permission: 'Reports' },

  { text: 'Feature Flags', icon: <Flag />, path: '/feature-flags', permission: 'RuleEngine' },

  {
    text: 'Master Settings',
    icon: <SettingsApplications />,
    permission: 'SiteSettings',
    children: [
      { text: 'Order & Cancellation Rules', path: '/order-timing-control' },
      { text: 'Grocery Delivery Rules', path: '/pricing-control' },
      { text: 'Delivery Partner Rules', path: '/rider-earnings-control' },
      { text: 'Dark Store & Mart Rules', path: '/self-pickup-control' },
      { text: 'Refund Rules', path: '/payment-reconciliation' },
    ]
  },

  {
    text: 'Roles & Permissions',
    icon: <Security />,
    permission: 'RuleEngine',
    children: [
      { text: 'Staff Roles', path: '/role' },
      { text: 'RBAC Permission Matrix', path: '/admin/roles/matrix' },
    ]
  },
  { text: 'Audit Logs', icon: <ReceiptLong />, path: '/audit-logs', permission: 'SiteSettings' },
  { text: 'Chat Support', icon: <SupportAgent sx={{ color: '#0055ff' }} />, path: '/support-chat', badge: 'LIVE' },
  { text: 'Emergency Controls', icon: <Warning />, path: '/emergency-controls', permission: 'RuleEngine' },
  { text: 'System Health', icon: <HealthAndSafety />, path: '/dashboard', permission: 'Dashboard' },
];

export default function MenuContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState<string | null>(null);
  const { user } = useAuth();

  const userPerms: string[] | undefined = (user as any)?.permissions;
  const isSuperAdmin = !userPerms ||
    userPerms.length === 0 ||
    userPerms.includes('all') ||
    user?.role === 'admin' ||
    (user as any)?.role === 'admin' ||
    user?.email === 'admin@gmail.com' ||
    user?.email === 'admin@servonekart.com' ||
    user?.email === 'admin@ecdkart.com' ||
    (user as any)?.roleName === 'Super Admin' ||
    (user as any)?.name === 'Super Admin';

  const visibleMenuItems = React.useMemo(() => {
    if (isSuperAdmin || !Array.isArray(userPerms)) {
      return menuItems;
    }
    return menuItems.filter(item => {
      if (!item.permission) return true;
      if (userPerms.includes(item.permission)) return true;
      if (item.children && item.children.length > 0) {
        return item.children.some(child => {
          const perm = child.permission || item.permission;
          return !perm || userPerms.includes(perm);
        });
      }
      return false;
    }).map(item => {
      if (!item.children) return item;
      const filteredChildren = item.children.filter(child => {
        const perm = child.permission || item.permission;
        return !perm || userPerms.includes(perm);
      });
      return { ...item, children: filteredChildren };
    });
  }, [userPerms, isSuperAdmin]);

  return (
    <Stack
      sx={{
        width: '100%',
        position: 'relative',
        top: 0,
        left: 0,
        height: 'auto',
        bgcolor: 'background.paper',
        boxShadow: 'none',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      <List sx={{ pt: 2 }}>
        {visibleMenuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() =>
                  item.children
                    ? setOpen(open === item.text ? null : item.text)
                    : navigate(item.path!)
                }
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  mx: 1,
                  backgroundColor: location.pathname === item.path ? 'rgba(0, 85, 255, 0.10)' : 'transparent',
                  color: location.pathname === item.path ? '#0055ff' : '#2C2C2C',
                  '&:hover': { bgcolor: 'rgba(0, 85, 255, 0.06)' }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: location.pathname === item.path ? '#0055ff' : '#2C2C2C' 
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: location.pathname === item.path ? 600 : 500 }} />
                {item.badge && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    letterSpacing: '0.5px',
                    marginRight: '4px'
                  }}>
                    {item.badge}
                  </span>
                )}
                {item.children && (
                  <Box
                    sx={{
                      ml: 'auto',
                      transform: open === item.text ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: '0.2s',
                      display: 'flex',
                      color: open === item.text ? '#0055ff' : '#2C2C2C'
                    }}
                  >
                    <ChevronRight fontSize="small" />
                  </Box>
                )}
              </ListItemButton>
            </ListItem>

            {item.children && (
              <Collapse in={open === item.text} timeout="auto" unmountOnExit>
                <List sx={{ pl: 4, mt: 0.5 }}>
                  {item.children.map((sub) => (
                    <ListItem key={sub.text} disablePadding sx={{ mb: 0.3 }}>
                      <ListItemButton
                        onClick={() => navigate(sub.path)}
                        sx={{
                          px: 2,
                          py: 0.7,
                          borderRadius: 1,
                          mr: 1,
                          backgroundColor: location.pathname === sub.path ? 'rgba(0, 85, 255, 0.12)' : 'transparent',
                          color: location.pathname === sub.path ? '#0055ff' : '#2C2C2C',
                          '&:hover': {
                            backgroundColor: '#0055ff',
                            color: '#fff',
                            '& .MuiListItemIcon-root': { color: '#fff' }
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 28, color: location.pathname === sub.path ? '#0055ff' : '#93c5fd' }}>
                          <RadioButtonUnchecked sx={{ fontSize: 10 }} />
                        </ListItemIcon>
                        <ListItemText primary={sub.text} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: location.pathname === sub.path ? 600 : 400 }} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Stack>
  );
}