import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { CenteredCard, TopBar } from '../../../components/common';
import { QRCodeSVG } from 'qrcode.react';

interface RegisterQRViewProps {
  totpSecret: string;
  otpauthUrl: string;
  onNext: () => void;
  onBack: () => void;
}

function RegisterQRView({ totpSecret, otpauthUrl, onNext, onBack }: RegisterQRViewProps) {
  const { t } = useTranslation();

  return (
    <>
      <TopBar onBack={onBack} showBackButton={true} />
      
      <CenteredCard>
        <Typography
          component="h1"
          variant="h4"
          sx={{
            width: '100%',
            fontSize: 'clamp(1.5rem, 8vw, 2rem)',
            textAlign: 'center',
            mb: 3,
          }}
        >
          {t('register.scanQrCode')}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
            <QRCodeSVG value={otpauthUrl} size={200} />
          </Box>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            {t('register.scanWithAuthenticator')}
          </Typography>

          <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('register.orEnterManually')}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={totpSecret}
              InputProps={{ readOnly: true }}
              variant="outlined"
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                },
              }}
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={onNext}
            sx={{ mt: 2 }}
          >
            {t('register.iHaveScanned')}
          </Button>
        </Box>
      </CenteredCard>
    </>
  );
}

export default RegisterQRView;