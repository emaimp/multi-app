import { Box, IconButton, Skeleton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import { AvatarDisplay } from '../../ui/avatar';

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

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {avatarLoading ? (
          <Skeleton
            variant="circular"
            width={size}
            height={size}
          />
        ) : (
          <AvatarDisplay
            src={avatar}
            size={size}
            showUserIcon
          />
        )}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            ml: 1
          }}
        >
          {onSettingsClick && (
            <IconButton
              onClick={onSettingsClick}
              size="medium"
              sx={{ 
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' } 
              }}
            >
              <SettingsIcon sx={{ fontSize: 20 }} />
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
              <HelpOutlineIcon sx={{ fontSize: 20 }} />
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
          <LogoutIcon sx={{ fontSize: 20 }} />
        </IconButton>
      )}
    </Box>
  );
}

export default UserHeader;
