import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import KeyIcon from '@mui/icons-material/Key';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { CenteredCard, TopBar } from '../../components/common';

interface RegisterViewProps {
  onRegister: (username: string, password: string) => Promise<string>;
  onBack: () => void;
}

function RegisterView({ onRegister, onBack }: RegisterViewProps) {
  const { t } = useTranslation();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({ label: '', color: 'error' as 'error' | 'warning' | 'success' });

  const [success, setSuccess] = useState('');
  const [generatedMasterKey, setGeneratedMasterKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const validateUsername = (value: string) => {
    if (!value || value.length < 3) {
      setUsernameError(true);
      setUsernameErrorMessage(t('register.usernameMinLength'));
      return false;
    }
    setUsernameError(false);
    setUsernameErrorMessage('');
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value || value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage(t('register.passwordMinLength'));
      return false;
    }
    setPasswordError(false);
    setPasswordErrorMessage('');
    return true;
  };

  const validateConfirmPassword = (value: string) => {
    if (value !== password) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage(t('register.passwordsDoNotMatch'));
      return false;
    }
    setConfirmPasswordError(false);
    setConfirmPasswordErrorMessage('');
    return true;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setError('');
    if (value.length === 0) {
      setPasswordStrength({ label: '', color: 'error' });
    } else {
      setPasswordStrength(getStrength(value));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isUsernameValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    if (password !== confirmPassword) {
      setError(t('register.passwordsDoNotMatch'));
      return;
    }

    try {
      setIsLoading(true);
      const masterKey = await onRegister(username, password);
      setGeneratedMasterKey(masterKey);
      setSuccess(t('register.registeredSuccessfully'));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (errorMessage.includes('User already exists')) {
        setError(t('register.usernameTaken'));
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
        setError(t('register.networkError'));
      } else {
        setError(t('register.registerFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedMasterKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      <TopBar onBack={onBack} />

      <CenteredCard error={error} onErrorClose={() => setError('')} success={success} onSuccessClose={onBack} minHeight="420px">
        {!success && (
          <>
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
              onSubmit={handleSubmit}
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
                          onClick={() => setShowPassword(!showPassword)}
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
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
          </>
        )}

        {success && (
          <>
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
              {t('register.masterKeyTitle')}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('register.masterKeyDescription')}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                value={generatedMasterKey}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <IconButton onClick={handleCopy} edge="start" title="Copy to clipboard">
                      <ContentCopyIcon color={copied ? 'success' : 'action'} />
                    </IconButton>
                  ),
                  endAdornment: (
                    <IconButton onClick={() => setShowKey(!showKey)} edge="end">
                      {showKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
                type={showKey ? 'text' : 'password'}
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    letterSpacing: '0.1em',
                  },
                }}
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  color="primary"
                />
              }
              label={t('register.masterKeySaved')}
              sx={{ mb: 2 }}
            />

            <Button
              onClick={onBack}
              variant="contained"
              fullWidth
              disabled={!acknowledged || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {t('login.signUp')}
            </Button>
          </>
        )}
      </CenteredCard>
    </>
  );
}

export default RegisterView;