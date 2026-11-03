import React from 'react';
import { styled } from '@mui/material/styles';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuContent from './MenuContent';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
    borderRight: '1px solid rgba(0, 85, 255, 0.12)',
    boxShadow: '4px 0 24px rgba(0, 85, 255, 0.04)',
    backgroundColor: '#ffffff',
  },
});

export default function SideMenu() {
  const { user } = useAuth();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
      }}
    >
      {/* Top Header: Tricelyn Branded Logo Container & Ops Pill */}
      <Box sx={{ p: 2, pb: 1.5 }}>
        <Box
          sx={{
            bgcolor: '#021b44',
            px: 2,
            py: 1.2,
            borderRadius: '16px',
            border: '1px solid rgba(0, 85, 255, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0, 85, 255, 0.22)',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.02)' }
          }}
        >
          <img
            src="/logo.png"
            alt="Tricelyn Logo"
            style={{ height: '34px', width: 'auto', objectFit: 'contain' }}
          />
        </Box>

        {/* Live Operational Status Pill */}
        <Box
          sx={{
            mt: 1.5,
            px: 1.4,
            py: 0.6,
            borderRadius: '12px',
            bgcolor: 'rgba(0, 85, 255, 0.06)',
            border: '1px solid rgba(0, 85, 255, 0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#0055ff', letterSpacing: '0.4px' }}>
              INDORE OPS LIVE
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#475569', bgcolor: '#ffffff', px: 1, py: 0.2, borderRadius: '6px', border: '1px solid rgba(0, 85, 255, 0.12)' }}>
            v2.6
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(0, 85, 255, 0.08)' }} />

      {/* Navigation Menu List */}
      <Box
        sx={{
          overflow: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          '&::-webkit-scrollbar': { width: '5px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0, 85, 255, 0.15)', borderRadius: '10px' },
        }}
      >
        <MenuContent />
      </Box>

      <Divider sx={{ borderColor: 'rgba(0, 85, 255, 0.08)' }} />

      {/* Bottom Profile & Logout Footer */}
      <Box sx={{ p: 1.8, bgcolor: 'rgba(0, 85, 255, 0.02)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#0055ff',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 800,
                boxShadow: '0 2px 8px rgba(0, 85, 255, 0.3)',
                border: '2px solid #bfdbfe'
              }}
            >
              {((user?.name || 'Admin').split(' ').map((n) => n[0]).slice(0, 2).join('')).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2
                }}
              >
                {user?.name || 'Super Admin'}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#0055ff', lineHeight: 1 }}>
                {(user as any)?.roleName || (user?.role === 'admin' ? 'Super Admin' : user?.role || 'Admin')}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={handleLogout}
            title="Logout from Admin Console"
            sx={{
              color: '#94a3b8',
              p: 0.8,
              borderRadius: '10px',
              '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.08)' }
            }}
          >
            <LogoutRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
}
