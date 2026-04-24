import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/AuthContext';
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

interface RecoverViewProps {
  onBack: () => void;
}

function RecoverView({ onBack }: RecoverViewProps) {
  const { t } = useTranslation();
  const { recoverPassword } = useUser();

  const [username, setUsername] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [showMasterKey, setShowMasterKey] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [usernameError, setUsernameError] = useState(false);
  const [usernameNotFoundError, setUsernameNotFoundError] = useState(false);
  const [masterKeyError, setMasterKeyError] = useState(false);
  const [masterKeyErrorMessage, setMasterKeyErrorMessage] = useState('');
  const [newPasswordError, setNewPasswordError] = useState(false);
  const [newPasswordErrorMessage, setNewPasswordErrorMessage] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  const [newPasswordStrength, setNewPasswordStrength] = useState({ label: '', color: 'error' as 'error' | 'warning' | 'success' });

  const validateUsername = (value: string) => {
    if (!value || value.length < 3) {
      setUsernameError(true);
      return false;
    }
    setUsernameError(false);
    return true;
  };

  const validateMasterKey = (value: string) => {
    if (!value || value.length < 1) {
      setMasterKeyError(true);
      setMasterKeyErrorMessage(t('recover.masterKeyRequired'));
      return false;
    }
    setMasterKeyError(false);
    setMasterKeyErrorMessage('');
    return true;
  };

  const validateNewPassword = (value: string) => {
    if (!value || value.length < 6) {
      setNewPasswordError(true);
      setNewPasswordErrorMessage(t('recover.newPasswordMinLength'));
      return false;
    }
    setNewPasswordError(false);
    setNewPasswordErrorMessage('');
    return true;
  };

  const validateConfirmPassword = (value: string) => {
    if (value !== newPassword) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage(t('recover.passwordsDoNotMatch'));
      return false;
    }
    setConfirmPasswordError(false);
    setConfirmPasswordErrorMessage('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isUsernameValid = validateUsername(username);
    const isMasterKeyValid = validateMasterKey(masterKey);
    const isNewPasswordValid = validateNewPassword(newPassword);
    const isConfirmPasswordValid = validateConfirmPassword(confirmNewPassword);

    if (!isUsernameValid || !isMasterKeyValid || !isNewPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError(t('recover.passwordsDoNotMatch'));
      return;
    }

    try {
      setIsLoading(true);
      await recoverPassword(username, masterKey, newPassword);
      setSuccess(t('recover.passwordRecovered'));
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (errorMessage.includes('User not found')) {
        setError(t('recover.userNotFound'));
        setUsernameNotFoundError(true);
      } else if (errorMessage.includes('Invalid master key')) {
        setError(t('recover.invalidMasterKey'));
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
        setError(t('recover.networkError'));
      } else {
        setError(t('recover.recoverFailed'));
      }
      setSuccess('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <TopBar onBack={onBack} />

      <CenteredCard error={error} onErrorClose={() => setError('')} success={success} onSuccessClose={() => setSuccess('')}>
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
          {t('recover.recoverPassword')}
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
            label={t('recover.username')}
            placeholder={t('recover.usernamePlaceholder')}
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={username}
            error={usernameError || usernameNotFoundError}
            helperText={usernameError ? t('recover.usernameMinLength') : usernameNotFoundError ? t('recover.userNotFound') : ''}
            onChange={(e) => {
              setUsername(e.target.value);
              if (usernameError) setUsernameError(false);
              if (usernameNotFoundError) setUsernameNotFoundError(false);
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
            id="masterKey"
            name="masterKey"
            type={showMasterKey ? 'text' : 'password'}
            label={t('recover.masterKey')}
            placeholder={t('recover.masterKeyPlaceholder')}
            fullWidth
            variant="outlined"
            value={masterKey}
            error={masterKeyError}
            helperText={masterKeyErrorMessage || t('recover.requiredForRecovery')}
            onChange={(e) => {
              setMasterKey(e.target.value);
              if (!masterKeyError) {
                validateMasterKey(e.target.value);
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
            id="newPassword"
            name="newPassword"
            type={showNewPassword ? 'text' : 'password'}
            label={t('recover.newPassword')}
            placeholder={t('recover.newPasswordPlaceholder')}
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={newPassword}
            error={newPasswordError}
            helperText={
              newPasswordErrorMessage ? (
                <span>
                  {newPasswordErrorMessage}
                </span>
              ) : newPassword.length === 0 ? (
                <span>
                  {t('recover.keyToAccess')}
                </span>
              ) : newPassword.length < 6 ? (
                <Box component="span" sx={{ color: 'error.main' }}>
                  {newPasswordStrength.label}
                </Box>
              ) : (
                <Box component="span" sx={{ color: getColor(newPasswordStrength.color) }}>
                  {newPasswordStrength.label}
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
              setNewPassword(e.target.value);
              
              if (e.target.value.length === 0) {
                setNewPasswordStrength({ label: '', color: 'error' });
                setNewPasswordError(false);
                setNewPasswordErrorMessage('');
              } else {
                setNewPasswordStrength(getStrength(e.target.value, 'password'));
                if (e.target.value.length >= 6) {
                  setNewPasswordError(false);
                  setNewPasswordErrorMessage('');
                }
              }
              
              if (confirmNewPassword && !confirmPasswordError) {
                validateConfirmPassword(confirmNewPassword);
              }
              if (error) setError('');
            }}
            slotProps={{
              input: {
                startAdornment: <LockIcon sx={{ color: 'action.active', mr: 1 }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle new password visibility"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mt: 1 }}
          />

          <TextField
            id="confirmNewPassword"
            name="confirmNewPassword"
            type={showConfirmNewPassword ? 'text' : 'password'}
            label={t('recover.confirmNewPassword')}
            placeholder={t('recover.confirmNewPasswordPlaceholder')}
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={confirmNewPassword}
            error={confirmPasswordError}
            helperText={confirmPasswordErrorMessage}
            onChange={(e) => {
              setConfirmNewPassword(e.target.value);
              if (e.target.value.length === 0 || e.target.value === newPassword) {
                setConfirmPasswordError(false);
                setConfirmPasswordErrorMessage('');
              } else {
                setConfirmPasswordError(true);
                setConfirmPasswordErrorMessage(t('recover.passwordsDoNotMatch'));
              }
              if (error) setError('');
            }}
            slotProps={{
              input: {
                startAdornment: <LockIcon sx={{ color: 'action.active', mr: 1 }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm new password visibility"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      edge="end"
                    >
                      {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
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
            {isLoading ? t('recover.recovering') : t('recover.recoverPassword')}
          </Button>
        </Box>
      </CenteredCard>
    </>
  );
}

export default RecoverView;
