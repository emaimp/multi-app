import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

interface TopBarProps {
  onBack?: () => void;
  showBackButton?: boolean;
  actions?: ReactNode[];
}

export function TopBar({ onBack, showBackButton = true, actions }: TopBarProps) {
  const theme = useTheme();

  return (
    <AppBar
      position="fixed"
      sx={{
        background: 'transparent',
        boxShadow: 'none',
        zIndex: theme.zIndex.appBar,
      }}
    >
      <Toolbar sx={{ minHeight: '50px !important' }} >
        {showBackButton && onBack && (
          <IconButton
            aria-label="back"
            onClick={onBack}
            sx={{ p: 0.5, color: 'text.primary' }}
          >
            <ArrowBackIcon sx={{ fontSize: 30 }} />
          </IconButton>
        )}
        {actions && actions.length > 0 && (
          <Box
            sx={{ display: 'flex', gap: 1, ml: 'auto' }}
          >
            {actions}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
