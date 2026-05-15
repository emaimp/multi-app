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
  password: string;
  confirmPassword: string;
  usernameError: boolean;
  usernameErrorMessage: string;
  passwordError: boolean;
  passwordErrorMessage: string;
  confirmPasswordError: boolean;
  confirmPasswordErrorMessage: string;
  passwordStrength: { label: string; color: 'error' | 'warning' | 'success' };
  showPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
  error: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTogglePasswordVisibility: () => void;
  onToggleConfirmPasswordVisibility: () => void;
  onPasswordStrengthChange: (strength: { label: string; color: 'error' | 'warning' | 'success' }) => void;
  onErrorChange: (error: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

function RegisterForm({
  username,
  password,
  confirmPassword,
  usernameError,
  usernameErrorMessage,
  passwordError,
  passwordErrorMessage,
  confirmPasswordError,
  confirmPasswordErrorMessage,
  passwordStrength,
  showPassword,
  showConfirmPassword,
  isLoading,
  error,
  onUsernameChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePasswordVisibility,
  onToggleConfirmPasswordVisibility,
  onPasswordStrengthChange,
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onPasswordChange(value);
    
    if (value.length === 0) {
      onPasswordStrengthChange({ label: '', color: 'error' });
    } else {
      onPasswordStrengthChange(getStrength(value));
    }
    
    onErrorChange('');
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfirmPasswordChange(e.target.value);
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
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            label={t('register.password')}
            placeholder={t('register.passwordPlaceholder')}
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={password}
            error={passwordError}
            helperText={
              passwordError ? (
                <span>{passwordErrorMessage}</span>
              ) : password.length === 0 ? (
                <span>{t('register.passwordHelperText')}</span>
              ) : password.length < 6 ? (
                <Box component="span" sx={{ color: 'error.main' }}>
                  {passwordStrength.label}
                </Box>
              ) : (
                <Box component="span" sx={{ color: getColor(passwordStrength.color) }}>
                  {passwordStrength.label}
                  <Tooltip title={t('register.specificChars')}>
                    <InfoOutlined sx={{ fontSize: 14, ml: 1, verticalAlign: 'middle', cursor: 'help', color: 'action.active' }} />
                  </Tooltip>
                </Box>
              )
            }
            onChange={handlePasswordChange}
            slotProps={{
              input: {
                startAdornment: <KeyIcon sx={{ color: 'action.active', mr: 1 }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={onTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mt: 1 }}
          />

          <TextField
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            label={t('register.confirmPassword')}
            placeholder={t('register.confirmPasswordPlaceholder')}
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={confirmPassword}
            error={confirmPasswordError}
            helperText={confirmPasswordErrorMessage}
            onChange={handleConfirmPasswordChange}
            slotProps={{
              input: {
                startAdornment: <KeyIcon sx={{ color: 'action.active', mr: 1 }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={onToggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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