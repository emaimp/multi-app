import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import KeyIcon from '@mui/icons-material/Key';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { CenteredCard, TopBar } from '../../../components/common';

interface RegisterFormProps {
  username: string;
  masterKey: string;
  confirmMasterKey: string;
  usernameError: boolean;
  usernameErrorMessage: string;
  masterKeyError: boolean;
  masterKeyErrorMessage: string;
  confirmMasterKeyError: boolean;
  confirmMasterKeyErrorMessage: string;
  masterKeyStrength: { label: string; color: 'error' | 'warning' | 'success' };
  showMasterKey: boolean;
  showConfirmMasterKey: boolean;
  isLoading: boolean;
  error: string;
  onUsernameChange: (value: string) => void;
  onMasterKeyChange: (value: string) => void;
  onConfirmMasterKeyChange: (value: string) => void;
  onToggleMasterKeyVisibility: () => void;
  onToggleConfirmMasterKeyVisibility: () => void;
  onMasterKeyStrengthChange: (strength: { label: string; color: 'error' | 'warning' | 'success' }) => void;
  onErrorChange: (error: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

function RegisterForm({
  username,
  masterKey,
  confirmMasterKey,
  usernameError,
  usernameErrorMessage,
  masterKeyError,
  masterKeyErrorMessage,
  confirmMasterKeyError,
  confirmMasterKeyErrorMessage,
  masterKeyStrength,
  showMasterKey,
  showConfirmMasterKey,
  isLoading,
  error,
  onUsernameChange,
  onMasterKeyChange,
  onConfirmMasterKeyChange,
  onToggleMasterKeyVisibility,
  onToggleConfirmMasterKeyVisibility,
  onMasterKeyStrengthChange,
  onErrorChange,
  onSubmit,
  onBack,
}: RegisterFormProps) {
  const { t } = useTranslation();

  const getStrength = (value: string): { label: string; color: 'error' | 'warning' | 'success' } => {
    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSymbol = /[^a-zA-Z0-9]/.test(value);

    const score = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;

    if (value.length < 6) return { label: t('register.masterKeyMinLength'), color: 'error' };
    if (score <= 1) return { label: t('register.lowSecurity'), color: 'error' };
    if (score <= 2) return { label: t('register.mediumSecurity'), color: 'warning' };
    if (score <= 3) return { label: t('register.mediumSecurity'), color: 'warning' };
    return { label: t('register.highSecurity', { label: 'master key' }), color: 'success' };
  };

  const getColor = (color: string) => `${color}.main`;

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUsernameChange(e.target.value);
    onErrorChange('');
  };

  const handleMasterKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onMasterKeyChange(value);
    
    if (value.length === 0) {
      onMasterKeyStrengthChange({ label: '', color: 'error' });
    } else {
      onMasterKeyStrengthChange(getStrength(value));
    }
    
    onErrorChange('');
  };

  const handleConfirmMasterKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfirmMasterKeyChange(e.target.value);
    onErrorChange('');
  };

  return (
    <>
      <TopBar onBack={onBack} />

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
          {t('register.signUp')}
        </Typography>

        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            id="username"
            name="username"
            type="text"
            label={t('register.username')}
            placeholder={t('register.usernamePlaceholder')}
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={username}
            error={usernameError}
            helperText={
              usernameErrorMessage ? (
                usernameErrorMessage
              ) : username.length > 0 && username.length < 3 ? (
                <Box component="span" sx={{ color: 'error.main' }}>
                  {t('register.usernameMinLength')}
                </Box>
              ) : (
                ''
              )
            }
            onChange={handleUsernameChange}
            slotProps={{
              input: {
                startAdornment: <PersonIcon sx={{ color: 'action.active', mr: 1 }} />,
              },
            }}
            sx={{ mt: 1 }}
          />

          <TextField
            id="masterKey"
            name="masterKey"
            type={showMasterKey ? 'text' : 'password'}
            label={t('register.masterKey')}
            placeholder={t('register.masterKeyPlaceholder')}
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={masterKey}
            error={masterKeyError}
            helperText={
              masterKeyError ? (
                <span>{masterKeyErrorMessage}</span>
              ) : masterKey.length === 0 ? (
                <span>{t('register.keyToConfirmAccess')}</span>
              ) : masterKey.length < 6 ? (
                <Box component="span" sx={{ color: 'error.main' }}>
                  {masterKeyStrength.label}
                </Box>
              ) : (
                <Box component="span" sx={{ color: getColor(masterKeyStrength.color) }}>
                  {masterKeyStrength.label}
                  <Tooltip title={t('register.specificChars')}>
                    <InfoOutlined sx={{ fontSize: 14, ml: 1, verticalAlign: 'middle', cursor: 'help', color: 'action.active' }} />
                  </Tooltip>
                </Box>
              )
            }
            onChange={handleMasterKeyChange}
            slotProps={{
              input: {
                startAdornment: <KeyIcon sx={{ color: 'action.active', mr: 1 }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle master key visibility"
                      onClick={onToggleMasterKeyVisibility}
                      edge="end"
                    >
                      {showMasterKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mt: 1 }}
          />

          <TextField
            id="confirmMasterKey"
            name="confirmMasterKey"
            type={showConfirmMasterKey ? 'text' : 'password'}
            label={t('register.confirmMasterKey')}
            placeholder={t('register.confirmMasterKeyPlaceholder')}
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={confirmMasterKey}
            error={confirmMasterKeyError}
            helperText={confirmMasterKeyErrorMessage}
            onChange={handleConfirmMasterKeyChange}
            slotProps={{
              input: {
                startAdornment: <KeyIcon sx={{ color: 'action.active', mr: 1 }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm master key visibility"
                      onClick={onToggleConfirmMasterKeyVisibility}
                      edge="end"
                    >
                      {showConfirmMasterKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mt: 1 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? t('register.registering') : t('register.registerBtn')}
          </Button>
        </Box>
      </CenteredCard>
    </>
  );
}

export default RegisterForm;