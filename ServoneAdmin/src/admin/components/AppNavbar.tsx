import * as React from 'react';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MuiToolbar from '@mui/material/Toolbar';
import { tabsClasses } from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SideMenuMobile from './SideMenuMobile';
import MenuButton from './MenuButton';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import Search from './Search';

const Toolbar = styled(MuiToolbar)({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  justifyContent: 'center',
  gap: '12px',
  flexShrink: 0,
  [`& ${tabsClasses.flexContainer}`]: {
    gap: '8px',
    p: '8px',
    pb: 0,
  },
});

export default function AppNavbar({ open: propOpen, toggleDrawer: propToggleDrawer }: { open?: boolean; toggleDrawer?: (newOpen: boolean) => () => void }) {
  const [localOpen, setLocalOpen] = React.useState(false);
  const [notifAnchorEl, setNotifAnchorEl] = React.useState<null | HTMLElement>(null);

  const effectiveToggleDrawer = propToggleDrawer ?? ((newOpen: boolean) => () => {
    setLocalOpen(newOpen);
  });

  const open = typeof propOpen === 'boolean' ? propOpen : localOpen;

  return (
    <AppBar
      position="fixed"
      sx={{
        display: { xs: 'auto', md: 'none' },
        boxShadow: '0 2px 10px rgba(0, 85, 255, 0.08)',
        bgcolor: '#ffffff',
        backgroundImage: 'none',
        borderBottom: '1px solid rgba(0, 85, 255, 0.12)',
        top: 'var(--template-frame-height, 0px)',
      }}
    >
      <Toolbar variant="regular">
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            flexGrow: 1,
            width: '100%',
            gap: 1,
          }}
        >
          {/* 1. Menu Button */}
          <MenuButton aria-label="menu" onClick={effectiveToggleDrawer(true)}>
            <MenuRoundedIcon sx={{ color: '#0B3EDB' }} />
          </MenuButton>

          {/* 2. Tricelyn Mobile Branded Logo */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'start', flexGrow: 1, alignItems: 'center' }}
          >
            <Box sx={{ bgcolor: '#021b44', px: 1.5, py: 0.5, borderRadius: '10px', border: '1px solid rgba(0, 85, 255, 0.3)', display: 'inline-flex', alignItems: 'center' }}>
              <img
                src="/logo.png"
                alt="Tricelyn Logo"
                style={{ height: '22px', width: 'auto', objectFit: 'contain' }}
              />
            </Box>
          </Stack>

          {/* 3. Actions on the right */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Search />
            <MenuButton showBadge aria-label="Open notifications" onClick={(e) => setNotifAnchorEl(e.currentTarget)}>
              <NotificationsRoundedIcon sx={{ color: '#0B3EDB' }} />
            </MenuButton>
            <Menu
              anchorEl={notifAnchorEl}
              open={Boolean(notifAnchorEl)}
              onClose={() => setNotifAnchorEl(null)}
              PaperProps={{
                elevation: 4,
                sx: { mt: 1.5, width: 280, borderRadius: 3, p: 1 }
              }}
            >
              <Typography variant="subtitle2" sx={{ p: 1, fontWeight: 700, borderBottom: '1px solid #eee', color: '#0B3EDB' }}>
                Notifications
              </Typography>
              <MenuItem onClick={() => setNotifAnchorEl(null)}>
                <Typography variant="body2">🔔 New Order #1094 Received</Typography>
              </MenuItem>
              <MenuItem onClick={() => setNotifAnchorEl(null)}>
                <Typography variant="body2">🛵 Delivery Partner assigned to Order #1089</Typography>
              </MenuItem>
            </Menu>
          </Stack>
          
          <SideMenuMobile open={open} toggleDrawer={effectiveToggleDrawer} />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export function CustomIcon() {
  return (
    <Box
      sx={{
        width: '1.5rem',
        height: '1.5rem',
        bgcolor: '#0B3EDB',
        borderRadius: '999px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundImage: 'linear-gradient(135deg, hsl(210, 98%, 60%) 0%, hsl(210, 100%, 35%) 100%)',
        color: 'hsla(210, 100%, 95%, 0.9)',
        border: '1px solid',
        borderColor: 'hsl(210, 100%, 55%)',
        boxShadow: 'inset 0 2.5px 0 hsla(210, 100%, 77%, 1), inset 0 -2px 0 hsla(210, 100%, 35%, 1)',
      }}
    >
      <DashboardRoundedIcon color="inherit" sx={{ fontSize: '1rem' }} />
    </Box>
  );
}
