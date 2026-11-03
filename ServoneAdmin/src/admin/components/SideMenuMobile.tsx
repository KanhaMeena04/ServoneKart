import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuContent from './MenuContent';
import { useAuth } from '../context/AuthContext';

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
}

export default function SideMenuMobile({ open, toggleDrawer }: SideMenuMobileProps) {
  const { user } = useAuth();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      }}
    >
      <Stack
        sx={{
          width: { xs: '80vw', sm: '320px' },
          maxWidth: '340px',
          height: '100%',
        }}
      >
        {/* Mobile Header: Logo & Status */}
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              bgcolor: '#021b44',
              px: 2,
              py: 1,
              borderRadius: '14px',
              border: '1px solid rgba(0, 85, 255, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0, 85, 255, 0.22)',
            }}
          >
            <img
              src="/logo.png"
              alt="Tricelyn Logo"
              style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
            />
          </Box>
          <Box
            sx={{
              mt: 1.2,
              px: 1.2,
              py: 0.5,
              borderRadius: '10px',
              bgcolor: 'rgba(0, 85, 255, 0.06)',
              border: '1px solid rgba(0, 85, 255, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#0055ff' }}>
                INDORE OPS LIVE
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#475569' }}>
              v2.6
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(0, 85, 255, 0.08)' }} />

        <Stack sx={{ flexGrow: 1, overflowY: 'auto' }}>
          <MenuContent />
        </Stack>

        <Divider sx={{ borderColor: 'rgba(0, 85, 255, 0.08)' }} />

        {/* Bottom Profile Pill */}
        <Box sx={{ p: 1.6, bgcolor: 'rgba(0, 85, 255, 0.02)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#0055ff', fontSize: '0.78rem', fontWeight: 800 }}>
                {((user?.name || 'Admin').split(' ').map((n) => n[0]).slice(0, 2).join('')).toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                  {user?.name || 'Super Admin'}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#0055ff' }}>
                  {(user as any)?.roleName || 'Admin'}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={handleLogout} sx={{ color: '#ef4444' }}>
              <LogoutRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </Stack>
    </Drawer>
  );
}
