import { Box, Button, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { UserHeader } from './UserHeader';

interface MainSidebarProps {
  avatar?: string | null;
  avatarLoading?: boolean;
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
  onLogoutClick?: () => void;
  onNewClick?: () => void;
  onContentClick?: () => void;
  children: React.ReactNode;
}

export function MainSidebar({
  avatar,
  avatarLoading,
  onSettingsClick,
  onHelpClick,
  onLogoutClick,
  onNewClick,
  onContentClick,
  children,
}: MainSidebarProps) {
  return (
    <Box
      sx={{
        width: 250,
        flexShrink: 0,
        height: '100vh',
        boxSizing: 'border-box',
        backgroundColor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          height: 60,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'action.hover',
        }}
      >
        <UserHeader
          avatar={avatar}
          avatarLoading={avatarLoading}
          onSettingsClick={onSettingsClick}
          onHelpClick={onHelpClick}
          onLogoutClick={onLogoutClick}
        />
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onNewClick}
          startIcon={<AddIcon />}
        >
          New
        </Button>
      </Box>
      <Divider />
      <Box 
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onContentClick?.();
          }
        }}
        sx={{
          flex: 1,
          overflow: 'auto',
          cursor: 'pointer'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default MainSidebar;
