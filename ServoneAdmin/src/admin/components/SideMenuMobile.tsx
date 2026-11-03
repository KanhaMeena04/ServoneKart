import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import MenuButton from './MenuButton';
import MenuContent from './MenuContent';

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
}

export default function SideMenuMobile({ open, toggleDrawer }: SideMenuMobileProps) {
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
          overflowY: 'auto',
          // hide scrollbar but keep scrolling
          '-ms-overflow-style': 'none',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: '50dvw',
          height: '100%',
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ bgcolor: '#0055ff', px: 1.5, py: 0.6, borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.4)', display: 'inline-flex', alignItems: 'center' }}>
          <img
            src="/logo.png"
            alt="Tricelyn Logo"
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
          />
        </Box>
        </Box>
             
        <Stack sx={{ flexGrow: 1 }}>
          
          <MenuContent />
          <Divider />
        </Stack>
        
      </Stack>
    </Drawer>
  );
}
