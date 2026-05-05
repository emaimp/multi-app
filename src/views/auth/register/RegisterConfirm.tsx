import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { CenteredCard, TopBar } from '../../../components/common';

interface RegisterConfirmProps {
  totpCode: string;
  totpCodeError: boolean;
  isLoading: boolean;
  error: string;
  onTotpCodeChange: (value: string) => void;
  onTotpCodeErrorChange: (error: boolean) => void;
  onErrorChange: (error: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

function RegisterConfirm({
  totpCode,
  totpCodeError,
  isLoading,
  error,
  onTotpCodeChange,
  onTotpCodeErrorChange,
  onErrorChange,
  onSubmit,
  onBack,
}: RegisterConfirmProps) {
  const { t } = useTranslation();

  const handleTotpCodeChange = (value: string) => {
    const filtered = value.replace(/\D/g, '').slice(0, 6);
    onTotpCodeChange(filtered);
    if (filtered.length === 6) {
      onTotpCodeErrorChange(false);
    }
    onErrorChange('');
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
            fontSize: 'clamp(1.5rem, 8vw, 2rem)',
            textAlign: 'center',
            mb: 3,
          }}
        >
          {t('register.enterTotpCode')}
        </Typography>

        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 1 }}>
            {t('register.enterTotpCodeDesc')}
          </Typography>

          <TextField
            id="totpCode"
            name="totpCode"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={totpCode}
            error={totpCodeError}
            placeholder="000000"
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
            {isLoading ? t('register.registering') : t('register.confirmAndRegister')}
          </Button>
        </Box>
      </CenteredCard>
    </>
  );
}

export default RegisterConfirm;