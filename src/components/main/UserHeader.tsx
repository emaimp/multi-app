import { Avatar, Box, Typography, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

interface UserHeaderProps {
  username?: string;
  avatar?: string | null;
  onLogout: () => void;
}

export function UserHeader({ username, avatar, onLogout }: UserHeaderProps) {
  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'action.hover',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              color: 'text.primary',
              bgcolor: 'transparent',
              border: '1px solid',
              borderColor: 'divider',
            }}
            src={avatar || undefined}
          >
            {!avatar && <PersonIcon />}
          </Avatar>
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: 'success.main',
              border: '1px solid',
              borderColor: 'background.paper',
            }}
          />
        </Box>
        <Typography variant="body1" fontWeight={500}>
          {username}
        </Typography>
      </Box>
      <IconButton
        onClick={onLogout}
        color="error"
        size="small"
        sx={{
          borderRadius: 1,
        }}
      >
        <LogoutIcon />
      </IconButton>
    </Box>
  );
}

export default UserHeader;
