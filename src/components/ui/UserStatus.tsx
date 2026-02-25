import { Avatar, Box, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

type UserActivityStatus = 'active' | 'inactive';

interface UserStatusProps {
  username?: string;
  avatar?: string | null;
  size?: number;
  status?: UserActivityStatus;
}

export function UserStatus({ username, avatar, size = 48, status = 'active' }: UserStatusProps) {
  const indicatorSize = Math.round(size * 0.2);
  const statusColor = status === 'active' ? 'success.main' : 'warning.main';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ position: 'relative' }}>
        <Avatar
          sx={{
            width: size,
            height: size,
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
            width: indicatorSize,
            height: indicatorSize,
            borderRadius: '50%',
            bgcolor: statusColor,
            border: '1px solid',
            borderColor: 'background.paper',
          }}
        />
      </Box>
      <Typography variant="body1" fontWeight={500}>
        {username}
      </Typography>
    </Box>
  );
}

export default UserStatus;
