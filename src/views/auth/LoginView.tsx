import { useState } from 'react';
import { useUser } from '../../context/AuthContext';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import KeyIcon from '@mui/icons-material/Key';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { CenteredCard } from '../../components/ui';
import RegisterView from './RegisterView';
import RecoverView from './RecoverView';

function LoginView() {
  const { login, register } = useUser();

  const [view, setView] = useState<'login' | 'register' | 'recover'>('login');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [masterKey, setMasterKey] = useState('');

  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [masterKeyError, setMasterKeyError] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMasterKey, setShowMasterKey] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let isValid = true;

    if (!username || username.length < 3) {
      setUsernameError(true);
      isValid = false;
    } else {
      setUsernameError(false);
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      isValid = false;
    } else {
      setPasswordError(false);
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
      await login(username, password, rememberMe, masterKey);
    } catch (err) {
      setError(err as string);
    } finally {
      setIsLoading(false);
    }
  };

  if (view === 'register') {
    return <RegisterView onRegister={register} onBack={() => setView('login')} />;
  }

  if (view === 'recover') {
    return <RecoverView onBack={() => setView('login')} />;
  }

  return (
    <CenteredCard>
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
        Sign In
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
          label="Username"
          placeholder="Enter username"
          autoComplete="off"
          autoFocus
          fullWidth
          variant="outlined"
          value={username}
          error={usernameError}
          helperText={usernameError ? 'Username must be at least 3 characters.' : ''}
          onChange={(e) => setUsername(e.target.value)}
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
          label="Password"
          placeholder="••••••"
          autoComplete="off"
          fullWidth
          variant="outlined"
          value={password}
          error={passwordError}
          helperText={passwordError ? 'Password must be at least 6 characters.' : ''}
          onChange={(e) => setPassword(e.target.value)}
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
          id="masterKey"
          name="masterKey"
          type={showMasterKey ? 'text' : 'password'}
          label="Master Key"
          placeholder="Enter master key"
          fullWidth
          variant="outlined"
          value={masterKey}
          error={masterKeyError}
          helperText={masterKeyError ? 'Master key is required.' : ''}
          onChange={(e) => setMasterKey(e.target.value)}
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

        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              value="remember"
              color="primary"
            />
          }
          label="Remember me"
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>

        <Link
          component="button"
          type="button"
          onClick={() => setView('recover')}
          variant="body2"
          sx={{ alignSelf: 'center' }}
        >
          Forgot your password?
        </Link>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography sx={{ textAlign: 'center' }}>
          Don&apos;t have an account?&nbsp;
          <Link
            component="button"
            type="button"
            onClick={() => setView('register')}
            variant="body2"
            sx={{ alignSelf: 'center' }}
          >
            Sign up
          </Link>
        </Typography>
      </Box>

      {error && (
        <Typography color="error" sx={{ textAlign: 'center', mt: 1 }}>
          {error}
        </Typography>
      )}
    </CenteredCard>
  );
}

export default LoginView;
