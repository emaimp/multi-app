import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/AuthContext';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import KeyIcon from '@mui/icons-material/Key';
import PersonIcon from '@mui/icons-material/Person';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { CenteredCard, TopBar } from '../../components/common';
import RegisterView from './RegisterView';

function LoginView() {
  const { t } = useTranslation();
  const { login, register, confirmRegister } = useUser();

  const [view, setView] = useState<'login' | 'register'>('login');

  const [username, setUsername] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [masterKey, setMasterKey] = useState('');

  const [usernameError, setUsernameError] = useState(false);
  const [usernameNotFoundError, setUsernameNotFoundError] = useState(false);
  const [totpCodeError, setTotpCodeError] = useState(false);
  const [totpCodeInvalidError, setTotpCodeInvalidError] = useState(false);
  const [masterKeyError, setMasterKeyError] = useState(false);
  const [masterKeyInvalidError, setMasterKeyInvalidError] = useState(false);

  const [showMasterKey, setShowMasterKey] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setUsername('');
    setTotpCode('');
    setMasterKey('');
    setUsernameError(false);
    setUsernameNotFoundError(false);
    setTotpCodeError(false);
    setTotpCodeInvalidError(false);
    setMasterKeyError(false);
    setMasterKeyInvalidError(false);
    setError('');
  }, [view]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let isValid = true;

    if (!username || username.length < 3) {
      setUsernameError(true);
      isValid = false;
    } else {
      setUsernameError(false);
    }

    if (!totpCode || totpCode.length !== 6) {
      setTotpCodeError(true);
      isValid = false;
    } else {
      setTotpCodeError(false);
    }

    if (!masterKey || masterKey.length < 1) {
      setMasterKeyError(true);
      isValid = false;
    } else {
      setMasterKeyError(false);
    }

    if (!isValid) {
      return;
    }

    try {
      setIsLoading(true);
      await login(username, totpCode, masterKey);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (errorMessage.includes('User not found')) {
        setUsernameNotFoundError(true);
      } else if (errorMessage.includes('Invalid TOTP code') || errorMessage.includes('locked')) {
        setTotpCodeInvalidError(true);
      } else if (errorMessage.includes('Invalid master key')) {
        setMasterKeyInvalidError(true);
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
        setError(t('login.networkError'));
      } else {
        setError(t('login.loginFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (username: string, masterKey: string) => {
    return await register(username, masterKey);
  };

  const handleConfirmRegister = async (userId: number, totpCode: string, masterKey: string) => {
    await confirmRegister(userId, totpCode, masterKey);
  };

  const handleTotpCodeChange = (value: string) => {
    const filtered = value.replace(/\D/g, '').slice(0, 6);
    setTotpCode(filtered);
    if (totpCodeError) setTotpCodeError(false);
    if (totpCodeInvalidError) setTotpCodeInvalidError(false);
    if (error) setError('');
  };

  if (view === 'register') {
    return (
      <RegisterView 
        onRegister={handleRegister} 
        onConfirmRegister={handleConfirmRegister}
        onBack={() => setView('login')} 
      />
    );
  }

  return (
    <>
      <TopBar showBackButton={false} />
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
          {t('login.signIn')}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <TextField
            id="username"
            name="username"
            type="text"
            label={t('login.username')}
            placeholder={t('login.usernamePlaceholder')}
            autoComplete="off"
            autoFocus
            fullWidth
            variant="outlined"
            value={username}
            error={usernameError || usernameNotFoundError}
            helperText={usernameError ? t('login.usernameMinLength') : usernameNotFoundError ? t('login.userNotFound') : ''}
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
                style: { letterSpacing: totpCode.length > 0 ? '0.3rem' : 'normal' },
              },
            }}
            sx={{ mt: 1 }}
          />

          <TextField
            id="masterKey"
            name="masterKey"
            type={showMasterKey ? 'text' : 'password'}
            label={t('login.masterKey')}
            placeholder={t('login.masterKeyPlaceholder')}
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={masterKey}
            error={masterKeyError || masterKeyInvalidError}
            helperText={masterKeyError ? t('login.masterKeyRequired') : masterKeyInvalidError ? t('login.invalidMasterKey') : ''}
            onChange={(e) => {
              setMasterKey(e.target.value);
              if (masterKeyError) setMasterKeyError(false);
              if (masterKeyInvalidError) setMasterKeyInvalidError(false);
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? t('login.signingIn') : t('login.signIn')}
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography sx={{ textAlign: 'center' }}>
            {t('login.dontHaveAccount')}&nbsp;
            <Link
              component="button"
              type="button"
              onClick={() => setView('register')}
              variant="body2"
              sx={{ alignSelf: 'center' }}
            >
              {t('login.signUp')}
            </Link>
          </Typography>
        </Box>
      </CenteredCard>
    </>
  );
}

export default LoginView;