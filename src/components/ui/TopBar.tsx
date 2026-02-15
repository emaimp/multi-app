import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface TopBarProps {
  onBack: () => void;
  title?: string;
  transparent?: boolean;
}

export function TopBar({ onBack, title, transparent = false }: TopBarProps) {
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
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
