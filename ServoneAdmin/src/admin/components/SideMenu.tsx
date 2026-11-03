import { styled } from '@mui/material/styles';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import SelectContent from './SelectContent';
import MenuContent from './MenuContent';
import OptionsMenu from './OptionsMenu';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

export default function SideMenu() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          px: 2,
          py: 1.5,
        }}
      >
        <Box sx={{ bgcolor: '#0055ff', px: 1.5, py: 0.6, borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.4)', display: 'inline-flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0, 85, 255, 0.25)' }}>
          <img
            src="/logo.png"
            alt="Tricelyn Logo"
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
          />
        </Box>
        <SelectContent />
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        
        <MenuContent />
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        
       
        <OptionsMenu />
      </Stack>
    </Drawer>
  );
}
