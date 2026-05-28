import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { CenteredCard, TopBar } from '../../components/common';
import { QRCodeSVG } from 'qrcode.react';

interface TwoFactorViewProps {
  otpauthUrl: string;
  totpCode: string;
  totpCodeError: string;
  isLoading: boolean;
  onTotpCodeChange: (value: string) => void;
  onVerify: () => void;
  onBack: () => void;
}

export function TwoFactorView({
  otpauthUrl,
  totpCode,
  totpCodeError,
  isLoading,
  onTotpCodeChange,
  onVerify,
  onBack,
}: TwoFactorViewProps) {
  const { t } = useTranslation();

  const handleTotpCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    onTotpCodeChange(value);
  };

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
          {t('twofactor.scanQrCode')}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
            <QRCodeSVG value={otpauthUrl} size={200} />
          </Box>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            {t('twofactor.scanWithAuthenticator')}
          </Typography>

          <TextField
            fullWidth
            label={t('twofactor.enterTotpCode')}
            placeholder="000000"
            value={totpCode}
            onChange={handleTotpCodeChange}
            error={!!totpCodeError}
            helperText={totpCodeError}
            inputProps={{ maxLength: 6, inputMode: 'numeric' }}
            sx={{ mt: 1 }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={onVerify}
            disabled={isLoading || totpCode.length !== 6}
            sx={{ mt: 1 }}
          >
            {isLoading ? t('twofactor.registering') : t('twofactor.signUpBtn')}
          </Button>
        </Box>
      </CenteredCard>
    </>
  );
}

export default TwoFactorView;