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
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { CenteredCard, TopBar } from '../../components/common';

interface RegisterViewProps {
  onRegister: (username: string, password: string, masterKey: string) => Promise<void>;
  onBack: () => void;
}

function RegisterView({ onRegister, onBack }: RegisterViewProps) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [confirmMasterKey, setConfirmMasterKey] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showMasterKey, setShowMasterKey] = useState(false);
  const [showConfirmMasterKey, setShowConfirmMasterKey] = useState(false);

  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState('');
  const [masterKeyError, setMasterKeyError] = useState(false);
  const [masterKeyErrorMessage, setMasterKeyErrorMessage] = useState('');
  const [confirmMasterKeyError, setConfirmMasterKeyError] = useState(false);
  const [confirmMasterKeyErrorMessage, setConfirmMasterKeyErrorMessage] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getStrength = (value: string, label: string): { label: string; color: 'error' | 'warning' | 'success' } => {
    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSymbol = /[^a-zA-Z0-9]/.test(value);

    const score = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;

    if (value.length < 6) return { label: t('register.passwordMinLength'), color: 'error' };
    if (score <= 1) return { label: t('register.lowSecurity'), color: 'error' };
    if (score <= 2) return { label: t('register.mediumSecurity'), color: 'warning' };
    if (score <= 3) return { label: t('register.mediumSecurity'), color: 'warning' };
    return { label: t('register.highSecurity', { label }), color: 'success' };
  };

  const getColor = (color: string) => `${color}.main`;

  const [passwordStrength, setPasswordStrength] = useState({ label: '', color: 'error' as 'error' | 'warning' | 'success' });

  const [masterKeyStrength, setMasterKeyStrength] = useState({ label: '', color: 'error' as 'error' | 'warning' | 'success' });

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

  const validateMasterKey = (value: string) => {
    if (!value || value.length < 6) {
      setMasterKeyError(true);
      setMasterKeyErrorMessage(t('register.masterKeyMinLength'));
      return false;
    }
    setMasterKeyError(false);
    setMasterKeyErrorMessage('');
    return true;
  };

  const validateConfirmMasterKey = (value: string) => {
    if (value !== masterKey) {
      setConfirmMasterKeyError(true);
      setConfirmMasterKeyErrorMessage(t('register.masterKeysDoNotMatch'));
      return false;
    }
    setConfirmMasterKeyError(false);
    setConfirmMasterKeyErrorMessage('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    const isMasterKeyValid = validateMasterKey(masterKey);
    const isConfirmMasterKeyValid = validateConfirmMasterKey(confirmMasterKey);

    if (!isUsernameValid || !isPasswordValid || !isConfirmPasswordValid || !isMasterKeyValid || !isConfirmMasterKeyValid) {
      return;
    }

    if (password !== confirmPassword) {
      setError(t('register.passwordsDoNotMatch'));
      return;
    }

    if (masterKey !== confirmMasterKey) {
      setError(t('register.masterKeysDoNotMatch'));
      return;
    }

    try {
      setIsLoading(true);
      await onRegister(username, password, masterKey);
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

  return (
    <>
      <TopBar onBack={onBack} />

      <CenteredCard error={error} onErrorClose={() => setError('')}>
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
                <Box
                  component="span"
                  sx={{
                    color: 'error.main'
                  }}
                >
                  {t('register.usernameMinLength')}
                </Box>
              ) : (
                ''
              )
            }
            onChange={(e) => {
              setUsername(e.target.value);
              if (e.target.value.length >= 3) {
                setUsernameError(false);
                setUsernameErrorMessage('');
              }
              if (error) setError('');
            }}
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
              passwordErrorMessage ? (
                <span>
                  {passwordErrorMessage}
                </span>
              ) : password.length === 0 ? (
                <span>
                  {t('register.keyToAccess')}
                </span>
              ) : password.length < 6 ? (
                <Box
                  component="span"
                  sx={{
                    color: 'error.main'
                  }}
                >
                  {passwordStrength.label}
                </Box>
              ) : (
                <Box
                  component="span"
                  sx={{
                    color: getColor(passwordStrength.color)
                  }}
                >
                  {passwordStrength.label}
                  <Tooltip title={t('register.specificChars')}>
                    <InfoOutlined
                      sx={{
                        fontSize: 14,
                        ml: 1,
                        verticalAlign: 'middle',
                        cursor: 'help',
                        color: 'action.active'
                      }}
                    />
                  </Tooltip>
                </Box>
              )
            }
            onChange={(e) => {
              setPassword(e.target.value);
              
              if (e.target.value.length === 0) {
                setPasswordStrength({ label: '', color: 'error' });
                setPasswordError(false);
                setPasswordErrorMessage('');
              } else {
                setPasswordStrength(getStrength(e.target.value, 'password'));
                if (e.target.value.length >= 6) {
                  setPasswordError(false);
                  setPasswordErrorMessage('');
                }
              }
              
              if (confirmPassword && !confirmPasswordError) {
                validateConfirmPassword(confirmPassword);
              }
              if (error) setError('');
            }}
            slotProps={{
              input: {
                startAdornment: <LockIcon sx={{ color: 'action.active', mr: 1 }} />,
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
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (e.target.value.length === 0 || e.target.value === password) {
                setConfirmPasswordError(false);
                setConfirmPasswordErrorMessage('');
              } else {
                setConfirmPasswordError(true);
                setConfirmPasswordErrorMessage(t('register.passwordsDoNotMatch'));
              }
              if (error) setError('');
            }}
            slotProps={{
              input: {
                startAdornment: <LockIcon sx={{ color: 'action.active', mr: 1 }} />,
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
                <span>
                  {masterKeyErrorMessage}
                </span>
              ) : masterKey.length === 0 ? (
                <span>
                  {t('register.keyToConfirmAccess')}
                </span>
              ) : masterKey.length < 6 ? (
                <Box
                  component="span"
                  sx={{
                    color: 'error.main'
                  }}
                >
                  {masterKeyStrength.label}
                </Box>
              ) : (
                <Box
                  component="span"
                  sx={{
                    color: getColor(masterKeyStrength.color)
                  }}
                >
                  {masterKeyStrength.label}
                  <Tooltip title={t('register.specificChars')}>
                    <InfoOutlined
                      sx={{
                        fontSize: 14,
                        ml: 1,
                        verticalAlign: 'middle',
                        cursor: 'help',
                        color: 'action.active',
                      }}
                    />
                  </Tooltip>
                </Box>
              )
            }
            onChange={(e) => {
              setMasterKey(e.target.value);
              
              if (e.target.value.length === 0) {
                setMasterKeyStrength({ label: '', color: 'error' });
                setMasterKeyError(false);
                setMasterKeyErrorMessage('');
              } else {
                setMasterKeyStrength(getStrength(e.target.value, 'master key'));
                if (e.target.value.length >= 6) {
                  setMasterKeyError(false);
                  setMasterKeyErrorMessage('');
                }
              }
              
              if (confirmMasterKey && !confirmMasterKeyError) {
                validateConfirmMasterKey(confirmMasterKey);
              }
              if (error) setError('');
            }}
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
            onChange={(e) => {
              setConfirmMasterKey(e.target.value);
              if (e.target.value.length === 0 || e.target.value === masterKey) {
                setConfirmMasterKeyError(false);
                setConfirmMasterKeyErrorMessage('');
              } else {
                setConfirmMasterKeyError(true);
                setConfirmMasterKeyErrorMessage(t('register.masterKeysDoNotMatch'));
              }
              if (error) setError('');
            }}
            slotProps={{
              input: {
                startAdornment: <KeyIcon sx={{ color: 'action.active', mr: 1 }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm master key visibility"
                      onClick={() => setShowConfirmMasterKey(!showConfirmMasterKey)}
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

export default RegisterView;
