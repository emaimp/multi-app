import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { CenteredCard, TopBar } from '../../../components/common';

interface Login2FAProps {
  username: string;
  totpCode: string;
  totpCodeError: boolean;
  totpCodeInvalidError: boolean;
  isLoading: boolean;
  error: string;
  onTotpCodeChange: (value: string) => void;
  onTotpCodeErrorChange: (error: boolean) => void;
  onTotpCodeInvalidErrorChange: (error: boolean) => void;
  onErrorChange: (error: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

function Login2FA({
  username,
  totpCode,
  totpCodeError,
  totpCodeInvalidError,
  isLoading,
  error,
  onTotpCodeChange,
  onTotpCodeErrorChange,
  onTotpCodeInvalidErrorChange,
  onErrorChange,
  onSubmit,
  onBack,
}: Login2FAProps) {
  const { t } = useTranslation();

  const handleTotpCodeChange = (value: string) => {
    const filtered = value.replace(/\D/g, '').slice(0, 6);
    onTotpCodeChange(filtered);
    if (filtered.length === 6) {
      onTotpCodeErrorChange(false);
      onTotpCodeInvalidErrorChange(false);
    }
    if (error) onErrorChange('');
  };

  return (
    <>
      <TopBar onBack={onBack} showBackButton={true} />
      
      <CenteredCard error={error} onErrorClose={() => onErrorChange('')}>
        <Typography
          component="h1"
          variant="h4"
          sx={{
            width: '100%',
            fontSize: 'clamp(2rem, 10vw, 2.15rem)',
            textAlign: 'center',
            mb: 2,
          }}
        >
          {t('login.enterTotpCode')}
        </Typography>

        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          {t('login.welcomeBack', { username })}
        </Typography>

        <Box
          component="form"
          onSubmit={onSubmit}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <TextField
            id="totpCode"
            name="totpCode"
            type="text"
            inputMode="numeric"
            label={t('login.totpCode')}
            placeholder="000000"
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={totpCode}
            error={totpCodeError || totpCodeInvalidError}
            helperText={totpCodeError ? t('login.totpCodeRequired') : totpCodeInvalidError ? t('login.invalidTotpCode') : ''}
            onChange={(e) => handleTotpCodeChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <QrCode2Icon sx={{ color: 'action.active', mr: 1 }} />,
                style: { fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center' },
              },
            }}
            sx={{ mt: 1 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={isLoading || totpCode.length !== 6}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? t('login.signingIn') : t('login.signIn')}
          </Button>
        </Box>
      </CenteredCard>
    </>
  );
}

export default Login2FA;