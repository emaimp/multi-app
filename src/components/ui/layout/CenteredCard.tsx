import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  margin: 'auto',
  gap: theme.spacing(2),
  padding: theme.spacing(4),
  boxSizing: 'border-box',
  backgroundColor: 'background.paper', [theme.breakpoints.up('sm')]: { maxWidth: '410px' },
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
