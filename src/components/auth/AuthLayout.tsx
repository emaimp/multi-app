import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const SHADOW_LIGHT = 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px';
const SHADOW_DARK = 'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  margin: 'auto',
  gap: theme.spacing(2),
  padding: theme.spacing(4),
  boxSizing: 'border-box',
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('sm')]: {
    maxWidth: '400px',
  },
  boxShadow: SHADOW_LIGHT,
  ...theme.applyStyles('dark', {
    boxShadow: SHADOW_DARK,
  }),
}));

const AuthContainer = styled(Stack)(() => ({
  minHeight: '100vh',
  boxSizing: 'border-box',
}));

interface AuthLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
}

function AuthLayout({ children, showBackButton = false, onBack }: AuthLayoutProps) {
  return (
    <AuthContainer direction="column">
      <AppBar
        position="fixed"
        sx={{
          background: (theme) => theme.palette.background.paper,
          boxShadow: (theme) => theme.shadows[1],
          minHeight: '45px !important',
          height: '45px',
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Toolbar
          sx={{
            minHeight: '45px !important',
            height: '45px',
            minWidth: 'auto',
            px: 2,
          }}
        >
          {showBackButton && onBack && (
            <IconButton
              color="inherit"
              aria-label="back"
              onClick={onBack}
              sx={{ p: 0.5 }}
            >
              <ArrowBackIcon sx={{ fontSize: 25, color: (theme) => theme.palette.text.primary }} />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        pt: 10,
        pb: 5,
      }}>
        <Card variant="outlined">
          {children}
        </Card>
      </Box>
    </AuthContainer>
  );
}

export default AuthLayout;
export { Card };
