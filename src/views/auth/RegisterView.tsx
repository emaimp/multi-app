import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import KeyIcon from '@mui/icons-material/Key';
import { CenteredCard, TextInput, PasswordInput } from '../../components/ui';
import { TopBar } from '../../components/ui/TopBar';

interface RegisterViewProps {
  onRegister: (username: string, password: string, masterKey: string) => Promise<void>;
  onBack: () => void;
}

function RegisterView({ onRegister, onBack }: RegisterViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showMasterKey, setShowMasterKey] = useState(false);
  const [error, setError] = useState('');
  
  // Validation states
  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState('');
  const [masterKeyError, setMasterKeyError] = useState(false);
  const [masterKeyErrorMessage, setMasterKeyErrorMessage] = useState('');

  // Real-time validation functions
  const validateUsername = (value: string) => {
    if (!value || value.length < 3) {
      setUsernameError(true);
      setUsernameErrorMessage('Username must be at least 3 characters.');
      return false;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage('');
      return true;
    }
  };

  const validatePassword = (value: string) => {
    if (!value || value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters.');
      return false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
      return true;
    }
  };

  const validateConfirmPassword = (value: string) => {
    if (value !== password) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage('Passwords do not match.');
      return false;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage('');
      return true;
    }
  };

  const validateMasterKey = (value: string) => {
    if (!value || value.length < 1) {
      setMasterKeyError(true);
      setMasterKeyErrorMessage('Master key is required.');
      return false;
    } else {
      setMasterKeyError(false);
      setMasterKeyErrorMessage('');
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    const isMasterKeyValid = validateMasterKey(masterKey);
    
    if (!isUsernameValid || !isPasswordValid || !isConfirmPasswordValid || !isMasterKeyValid) {
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      await onRegister(username, password, masterKey);
    } catch (err) {
      setError(err as string);
    }
  };

  return (
    <>
      <TopBar onBack={onBack} transparent={true} />
      <CenteredCard>
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', textAlign: 'center' }}
        >
          Sign Up
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextInput
            id="username"
            name="username"
            label="Username"
            type="text"
            placeholder="Enter your username"
            autoComplete="off"
            value={username}
            onChange={(value) => {
              setUsername(value);
              validateUsername(value);
            }}
            error={usernameError}
            helperText={usernameErrorMessage}
            icon={<PersonIcon sx={{ color: 'action.active', mr: 1 }} />}
          />
          
          <PasswordInput
            id="password"
            name="password"
            label="Password"
            placeholder="••••••"
            autoComplete="off"
            value={password}
            onChange={(value) => {
              setPassword(value);
              validatePassword(value);
              if (confirmPassword) {
                validateConfirmPassword(confirmPassword);
              }
            }}
            error={passwordError}
            helperText={passwordErrorMessage}
            icon={<LockIcon sx={{ color: 'action.active', mr: 1 }} />}
            showPassword={showPassword}
            onToggleVisibility={() => setShowPassword(!showPassword)}
          />
          
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            placeholder="••••••"
            autoComplete="off"
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(value);
              validateConfirmPassword(value);
            }}
            error={confirmPasswordError}
            helperText={confirmPasswordErrorMessage}
            icon={<LockIcon sx={{ color: 'action.active', mr: 1 }} />}
            showPassword={showConfirmPassword}
            onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
          />
          
          <PasswordInput
            id="masterKey"
            name="masterKey"
            label="Master Key"
            placeholder="Enter master key"
            value={masterKey}
            onChange={(value) => {
              setMasterKey(value);
              validateMasterKey(value);
            }}
            error={masterKeyError}
            helperText={masterKeyErrorMessage || 'Required for password recovery and changes.'}
            icon={<KeyIcon sx={{ color: 'action.active', mr: 1 }} />}
            showPassword={showMasterKey}
            onToggleVisibility={() => setShowMasterKey(!showMasterKey)}
          />
          
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
            Register
          </Button>
        </Box>
        
        {error && (
          <Typography color="error" sx={{ textAlign: 'center' }}>
            {error}
          </Typography>
        )}
      </CenteredCard>
    </>
  );
}

export default RegisterView;
