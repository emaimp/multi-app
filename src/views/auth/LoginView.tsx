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
import RecoverView from './RecoverView';
import { CenteredCard, TopBar } from '../../components/common';

function LoginView() {
  const { t } = useTranslation();
  const { login, register } = useUser();

  const [view, setView] = useState<'login' | 'register' | 'recover'>('login');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [usernameError, setUsernameError] = useState(false);
  const [usernameNotFoundError, setUsernameNotFoundError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordInvalidError, setPasswordInvalidError] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);



  useEffect(() => {
    setUsername('');
    setPassword('');
    setUsernameError(false);
    setUsernameNotFoundError(false);
    setPasswordError(false);
    setPasswordInvalidError(false);
    setError('');
  }, [view]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (usernameError) setUsernameError(false);
    if (usernameNotFoundError) setUsernameNotFoundError(false);
    if (error) setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError(false);
    if (passwordInvalidError) setPasswordInvalidError(false);
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

    if (!password || password.length < 1) {
      setPasswordError(true);
      isValid = false;
    } else {
      setPasswordError(false);
    }

    if (!isValid) {
      return;
    }

    try {
      setIsLoading(true);
      await login(username, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (errorMessage.includes('User not found')) {
        setUsernameNotFoundError(true);
      } else if (errorMessage.includes('Invalid master key')) {
        setPasswordInvalidError(true);
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
        setError(t('login.networkError'));
      } else {
        setError(t('login.loginFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (username: string, password: string): Promise<void> => {
    await register(username, password);
  };

  if (view === 'register') {
    return (
      <RegisterView 
        onRegister={handleRegister}
        onBack={() => setView('login')} 
      />
    );
  }

  if (view === 'recover') {
    return (
      <RecoverView 
        onBack={() => setView('login')}
      />
    );
  }

  return (
    <>
      <TopBar onBack={() => {}} showBackButton={false} />
      
      <CenteredCard
        error={error}
        onErrorClose={() => setError('')}
        minHeight="420px"
      >
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
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            label={t('login.password')}
            placeholder={t('login.passwordPlaceholder')}
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={password}
            error={passwordError || passwordInvalidError}
            helperText={passwordError ? t('login.passwordRequired') : passwordInvalidError ? t('login.invalidPassword') : ''}
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
            <Typography sx={{ textAlign: 'center' }}>
              <Link
                component="button"
                type="button"
                onClick={() => setView('recover')}
                variant="body2"
              >
                {t('recover.forgotPassword')}
              </Link>
            </Typography>
          </Box>
        </Box>
      </CenteredCard>
    </>
  );
}

export default LoginView;