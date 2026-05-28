import { useState } from 'react';
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
import { CenteredCard, TopBar } from '../../components/common';
import { useBackend } from '../../hooks/core/useBackend';

interface RecoverViewProps {
  onBack: () => void;
}

function RecoverView({ onBack }: RecoverViewProps) {
  const { t } = useTranslation();
  const { invoke } = useBackend();

  const [username, setUsername] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showMasterKey, setShowMasterKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [usernameError, setUsernameError] = useState(false);
  const [masterKeyError, setMasterKeyError] = useState(false);
  const [masterKeyInvalidError, setMasterKeyInvalidError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({ label: '', color: 'error' as 'error' | 'warning' | 'success' });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    return { label: t('register.highSecurity', { label: 'password' }), color: 'success' };
  };

  const getColor = (color: string) => `${color}.main`;

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (usernameError) setUsernameError(false);
    if (error) setError('');
  };

  const handleMasterKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMasterKey(e.target.value);
    if (masterKeyError) setMasterKeyError(false);
    if (masterKeyInvalidError) setMasterKeyInvalidError(false);
    if (error) setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordError) setPasswordError(false);
    if (confirmPasswordError) setConfirmPasswordError(false);
    if (error) setError('');
    if (value.length === 0) {
      setPasswordStrength({ label: '', color: 'error' });
    } else {
      setPasswordStrength(getStrength(value));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (passwordError) setPasswordError(false);
    if (confirmPasswordError) setConfirmPasswordError(false);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let isValid = true;

    if (!username || username.length < 3) {
      setUsernameError(true);
      isValid = false;
    }

    if (!masterKey || masterKey.length < 1) {
      setMasterKeyError(true);
      isValid = false;
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      isValid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(true);
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    try {
      setIsLoading(true);
      await invoke('recover', {
        username,
        master_key: masterKey,
        new_access_key: password,
      });
      setSuccess(t('recoverPassword.success'));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (errorMessage.includes('User not found')) {
        setUsernameError(true);
        setError(t('login.userNotFound'));
      } else if (errorMessage.includes('Invalid master key')) {
        setMasterKeyInvalidError(true);
        setError(t('recoverPassword.invalidMasterKey'));
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setError(t('login.networkError'));
      } else {
        setError(t('recoverPassword.failed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <TopBar onBack={onBack} />

      <CenteredCard 
        error={error} 
        onErrorClose={() => setError('')}
        success={success}
        onSuccessClose={onBack}
        minHeight="420px"
      >
        <Typography
          component="h1"
          variant="h4"
          sx={{
            width: '100%',
            fontSize: 'clamp(1.5rem, 8vw, 2rem)',
            textAlign: 'center',
            mb: 2,
          }}
        >
          {t('recoverPassword.title')}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {!success && (
            <>
              <TextField
                id="username"
                name="username"
                type="text"
                label={t('login.username')}
                placeholder={t('login.usernamePlaceholder')}
                autoComplete="off"
                fullWidth
                variant="outlined"
                value={username}
                error={usernameError}
                onChange={handleUsernameChange}
                slotProps={{
                  input: {
                    startAdornment: <PersonIcon sx={{ color: 'action.active', mr: 1 }} />,
                  },
                }}
              />

              <TextField
                id="masterKey"
                name="masterKey"
                type={showMasterKey ? 'text' : 'password'}
                label={t('recoverPassword.masterKey')}
                placeholder={t('recoverPassword.masterKeyPlaceholder')}
                autoComplete="off"
                fullWidth
                variant="outlined"
                value={masterKey}
                error={masterKeyError || masterKeyInvalidError}
                helperText={masterKeyError ? t('login.masterKeyRequired') : masterKeyInvalidError ? t('recoverPassword.invalidMasterKey') : t('recoverPassword.masterKeyHelperText')}
                onChange={handleMasterKeyChange}
                slotProps={{
                  input: {
                    startAdornment: <KeyIcon sx={{ color: 'action.active', mr: 1 }} />,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle master key visibility"
                          onClick={() => setShowMasterKey(!showMasterKey)}
                          edge="end"
                        >
                          {showMasterKey ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label={t('changePassword.newPassword')}
                placeholder={t('changePassword.newPasswordPlaceholder')}
                autoComplete="off"
                fullWidth
                variant="outlined"
                value={password}
                error={passwordError}
                helperText={
                  passwordError ? (
                    <span>{t('register.masterKeyMinLength')}</span>
                  ) : password.length < 6 ? (
                    <span>{t('register.masterKeyMinLength')}</span>
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
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label={t('changePassword.confirmNewPassword')}
                placeholder={t('changePassword.confirmNewPasswordPlaceholder')}
                autoComplete="off"
                fullWidth
                variant="outlined"
                value={confirmPassword}
                error={confirmPasswordError}
                helperText={confirmPasswordError ? t('register.passwordsDoNotMatch') : ''}
                onChange={handleConfirmPasswordChange}
                slotProps={{
                  input: {
                    startAdornment: <KeyIcon sx={{ color: 'action.active', mr: 1 }} />,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isLoading ? t('recoverPassword.recovering') : t('recoverPassword.recoverBtn')}
              </Button>
            </>
          )}

          {success && (
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={onBack}
            >
              {t('login.signIn')}
            </Button>
          )}
        </Box>
      </CenteredCard>
    </>
  );
}

export default RecoverView;