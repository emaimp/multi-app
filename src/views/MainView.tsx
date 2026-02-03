import { Box, Drawer, Avatar, Typography, Button, Divider } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 240;

export function MainView() {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Drawer
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            height: '100vh',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'background.paper',
          },
        }}
        variant="permanent"
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Typography variant="subtitle1" fontWeight={500}>
            {user?.username || 'User'}
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ flexGrow: 1, p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Main content placeholder
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={logout}
            fullWidth
          >
            Log out
          </Button>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          overflow: 'auto',
        }}
      >
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.username}
        </Typography>
        <Typography color="text.secondary">
          Select an option from the menu to start.
        </Typography>
      </Box>
    </Box>
  );
}

export default MainView;
