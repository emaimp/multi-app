import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TranslateIcon from '@mui/icons-material/Translate';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

interface TopBarProps {
  onBack?: () => void;
  showBackButton?: boolean;
  showLanguageButton?: boolean;
  actions?: ReactNode[];
}

export function TopBar({ onBack, showBackButton = true, showLanguageButton = true, actions }: TopBarProps) {
  const theme = useTheme();
  const [languageAnchor, setLanguageAnchor] = useState<null | HTMLElement>(null);

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
            aria-label="Back"
            onClick={onBack}
            sx={{ p: 0.5, color: 'text.primary' }}
          >
            <ArrowBackIcon sx={{ fontSize: 30 }} />
          </IconButton>
        )}
        <Box
          sx={{ display: 'flex', gap: 1, ml: 'auto' }}
        >
          {actions}
          {showLanguageButton && (
            <>
              <IconButton
                aria-label="Change language"
                onClick={(e) => setLanguageAnchor(e.currentTarget)}
                sx={{ p: 1, color: 'text.primary' }}
              >
                <TranslateIcon sx={{ fontSize: 25 }} />
              </IconButton>
              <Menu
                anchorEl={languageAnchor}
                open={Boolean(languageAnchor)}
                onClose={() => setLanguageAnchor(null)}
              >
                <MenuItem onClick={() => setLanguageAnchor(null)}>English</MenuItem>
                <MenuItem onClick={() => setLanguageAnchor(null)}>Spanish</MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
