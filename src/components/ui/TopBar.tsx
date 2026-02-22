import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import { ReactNode } from 'react';

interface TopBarProps {
  onBack: () => void;
  title?: string;
  transparent?: boolean;
  actions?: ReactNode[];
}

export function TopBar({ onBack, title, transparent = false, actions }: TopBarProps) {
  return (
    <AppBar
      position="fixed"
      sx={{
        background: transparent ? 'transparent' : (theme) => theme.palette.background.paper,
        boxShadow: transparent ? 'none' : (theme) => theme.shadows[1],
        minHeight: '48px !important',
        height: '48px',
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar
        sx={{
          minHeight: '48px !important',
          height: '48px',
          minWidth: 'auto',
          px: 2,
        }}
      >
        <IconButton
          color="inherit"
          aria-label="back"
          onClick={onBack}
          sx={{ p: 0.5 }}
        >
          <ArrowBackIcon sx={{ fontSize: 25, color: (theme) => theme.palette.text.primary }} />
        </IconButton>
        {title && (
          <Typography
            variant="h6"
            sx={{
              ml: 2,
              fontSize: '1.1rem',
              fontWeight: 500,
              color: (theme) => theme.palette.text.primary,
            }}
          >
            {title}
          </Typography>
        )}
        {actions && actions.length > 0 && (
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            {actions}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
