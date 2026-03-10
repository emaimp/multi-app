import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';

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

interface CenteredCardProps {
  children: ReactNode;
  error?: string;
  onErrorClose?: () => void;
  success?: string;
  onSuccessClose?: () => void;
}

function CenteredCard({ children, error, onErrorClose, success, onSuccessClose }: CenteredCardProps) {
  return (
    <AuthContainer direction="column">
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          pt: 2,
        }}
      >
        <Card variant="outlined">{children}</Card>

        {error && (
          <Snackbar
            open={!!error}
            autoHideDuration={10000}
            onClose={onErrorClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert severity="error" onClose={onErrorClose} sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
        )}

        {success && (
          <Snackbar
            open={!!success}
            autoHideDuration={5000}
            onClose={onSuccessClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert severity="success" onClose={onSuccessClose} sx={{ width: '100%' }}>
              {success}
            </Alert>
          </Snackbar>
        )}
      </Box>
    </AuthContainer>
  );
}

export default CenteredCard;
export { Card };
