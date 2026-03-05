import { Avatar, Box, IconButton, Skeleton } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';

interface UserHeaderProps {
  avatar?: string | null;
  avatarLoading?: boolean;
  size?: number;
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
  onLogoutClick?: () => void;
}

export function UserHeader({
  avatar,
  avatarLoading = false,
  size = 60,
  onSettingsClick,
  onHelpClick,
  onLogoutClick,
}: UserHeaderProps) {
  const iconSize = 20;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {avatarLoading ? (
          <Skeleton variant="circular" width={size} height={size} />
        ) : (
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
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
          {onSettingsClick && (
            <IconButton
              onClick={onSettingsClick}
              size="medium"
              sx={{ 
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' } 
              }}
            >
              <SettingsIcon sx={{ fontSize: iconSize }} />
            </IconButton>
          )}
          {onHelpClick && (
            <IconButton
              onClick={onHelpClick}
              size="medium"
              sx={{ 
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' } 
              }}
            >
              <HelpOutlineIcon sx={{ fontSize: iconSize }} />
            </IconButton>
          )}
        </Box>
      </Box>
      {onLogoutClick && (
        <IconButton
          onClick={onLogoutClick}
          color="error"
          size="medium"
          sx={{ borderRadius: 1 }}
        >
          <LogoutIcon sx={{ fontSize: iconSize }} />
        </IconButton>
      )}
    </Box>
  );
}

export default UserHeader;
