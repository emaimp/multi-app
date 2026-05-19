import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useUser } from '../../context/AuthContext';
import RegisterView from './RegisterView';
import MasterKeyView from './MasterKeyView';
import { CenteredCard, TopBar } from '../../components/common';

function LoginView() {
  const { t } = useTranslation();
  const { login, register } = useUser();

  const [view, setView] = useState<'login' | 'register' | 'masterKey'>('login');

  const [username, setUsername] = useState('');
  const [masterKey, setMasterKey] = useState('');

  const [usernameError, setUsernameError] = useState(false);
  const [usernameNotFoundError, setUsernameNotFoundError] = useState(false);
  const [masterKeyError, setMasterKeyError] = useState(false);
  const [masterKeyInvalidError, setMasterKeyInvalidError] = useState(false);

  const [showMasterKey, setShowMasterKey] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [generatedMasterKey, setGeneratedMasterKey] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setUsername('');
    setMasterKey('');
    setUsernameError(false);
    setUsernameNotFoundError(false);
    setMasterKeyError(false);
    setMasterKeyInvalidError(false);
    setError('');
  }, [view]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (usernameError) setUsernameError(false);
    if (usernameNotFoundError) setUsernameNotFoundError(false);
    if (error) setError('');
  };

  const handleMasterKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMasterKey(e.target.value);
    if (masterKeyError) setMasterKeyError(false);
    if (masterKeyInvalidError) setMasterKeyInvalidError(false);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let isValid = true;

    if (!username || username.length < 3) {
      setUsernameError(true);
      isValid = false;
    } else {
      setUsernameError(false);
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
      await login(username, masterKey);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (errorMessage.includes('User not found')) {
        setUsernameNotFoundError(true);
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

  const handleRegister = async (username: string, password: string): Promise<string> => {
    const masterKey = await register(username, password);
    setGeneratedMasterKey(masterKey);
    setSuccessMessage(t('register.registeredSuccessfully'));
    setView('masterKey');
    return masterKey;
  };

  const handleSignUp = () => {
    setUsername('');
    setMasterKey('');
    setGeneratedMasterKey('');
    setSuccessMessage('');
    setView('login');
  };

  if (view === 'masterKey') {
    return (
      <MasterKeyView
        masterKey={generatedMasterKey}
        isLoading={isLoading}
        success={successMessage}
        onSuccessClose={() => setSuccessMessage('')}
        onSignUp={handleSignUp}
        onBack={() => setView('register')}
      />
    );
  }

  if (view === 'register') {
    return (
      <RegisterView 
        onRegister={handleRegister}
        onBack={() => setView('login')} 
      />
    );
  }

  return (
    <>
      <TopBar onBack={() => {}} showBackButton={false} />
      
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
            label={t('login.masterKey')}
            placeholder={t('login.masterKeyPlaceholder')}
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={masterKey}
            error={masterKeyError || masterKeyInvalidError}
            helperText={masterKeyError ? t('login.masterKeyRequired') : masterKeyInvalidError ? t('login.invalidMasterKey') : ''}
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
            {isLoading ? t('login.signingIn') : t('login.continue')}
          </Button>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              mt: 2,
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
        </Box>
      </CenteredCard>
    </>
  );
}

export default LoginView;