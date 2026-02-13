import { useState } from 'react';
import { useUser } from '../../context/AuthContext';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import KeyIcon from '@mui/icons-material/Key';
import { AuthLayout, AuthFormField, PasswordField } from '../../components/auth';
import RegisterView from './RegisterView';
import RecoverView from './RecoverView';

function LoginView() {
  const { login, register } = useUser();
  const [view, setView] = useState<'login' | 'register' | 'recover'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [masterKeyError, setMasterKeyError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMasterKey, setShowMasterKey] = useState(false);

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
      await login(username, password, rememberMe, masterKey);
    } catch (err) {
      setError(err as string);
    }
  };

  if (view === 'register') {
    return <RegisterView onRegister={register} onBack={() => setView('login')} />;
  }

  if (view === 'recover') {
    return <RecoverView onBack={() => setView('login')} />;
  }

  return (
    <AuthLayout showBackButton={false}>
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', textAlign: 'center' }}
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
          <AuthFormField
            id="username"
            name="username"
            label="Username"
            type="text"
            placeholder="Enter your username"
            autoComplete="off"
            autoFocus
            value={username}
            onChange={setUsername}
            error={usernameError}
            helperText={usernameError ? 'Username must be at least 3 characters.' : ''}
            icon={<PersonIcon sx={{ color: 'action.active', mr: 1 }} />}
          />
          
          <PasswordField
            id="password"
            name="password"
            label="Password"
            placeholder="••••••"
            autoComplete="off"
            value={password}
            onChange={setPassword}
            error={passwordError}
            helperText={passwordError ? 'Password must be at least 6 characters.' : ''}
            icon={<LockIcon sx={{ color: 'action.active', mr: 1 }} />}
            showPassword={showPassword}
            onToggleVisibility={() => setShowPassword(!showPassword)}
          />

          <PasswordField
            id="masterKey"
            name="masterKey"
            label="Master Key"
            placeholder="Enter your master key"
            value={masterKey}
            onChange={setMasterKey}
            error={masterKeyError}
            helperText={masterKeyError ? 'Master key is required.' : ''}
            icon={<KeyIcon sx={{ color: 'action.active', mr: 1 }} />}
            showPassword={showMasterKey}
            onToggleVisibility={() => setShowMasterKey(!showMasterKey)}
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
          <Button type="submit" fullWidth variant="contained">
            Sign In
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
        <Divider>or</Divider>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ textAlign: 'center' }}>
            Don&apos;t have an account?{' '}
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
      </AuthLayout>
  );
}

export default LoginView;
