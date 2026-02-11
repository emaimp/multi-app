import { useState } from 'react';
import { useUser } from '../../context/AuthContext';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import KeyIcon from '@mui/icons-material/Key';
import { AuthLayout, AuthFormField, PasswordField } from '../../components/auth';

interface RecoverViewProps {
  onBack: () => void;
}

function RecoverView({ onBack }: RecoverViewProps) {
  const { recoverPassword } = useUser();
  const [username, setUsername] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showMasterKey, setShowMasterKey] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Validation states
  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
  const [masterKeyError, setMasterKeyError] = useState(false);
  const [masterKeyErrorMessage, setMasterKeyErrorMessage] = useState('');
  const [newPasswordError, setNewPasswordError] = useState(false);
  const [newPasswordErrorMessage, setNewPasswordErrorMessage] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState('');

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

  const validateNewPassword = (value: string) => {
    if (!value || value.length < 6) {
      setNewPasswordError(true);
      setNewPasswordErrorMessage('Password must be at least 6 characters.');
      return false;
    } else {
      setNewPasswordError(false);
      setNewPasswordErrorMessage('');
      return true;
    }
  };

  const validateConfirmPassword = (value: string) => {
    if (value !== newPassword) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage('Passwords do not match.');
      return false;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage('');
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const isUsernameValid = validateUsername(username);
    const isMasterKeyValid = validateMasterKey(masterKey);
    const isNewPasswordValid = validateNewPassword(newPassword);
    const isConfirmPasswordValid = validateConfirmPassword(confirmNewPassword);
    
    if (!isUsernameValid || !isMasterKeyValid || !isNewPasswordValid || !isConfirmPasswordValid) {
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      await recoverPassword(username, masterKey, newPassword);
      setSuccess('Password recovered successfully. You can now log in.');
      setError('');
    } catch (err) {
      setError(err as string);
      setSuccess('');
    }
  };

  return (
    <AuthLayout showBackButton={true} onBack={onBack} transparent={true}>
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', textAlign: 'center' }}
        >
          Recover Password
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <AuthFormField
            id="username"
            name="username"
            label="Username"
            type="text"
            placeholder="Enter your username"
            autoComplete="username"
            value={username}
            onChange={(value) => {
              setUsername(value);
              validateUsername(value);
            }}
            error={usernameError}
            helperText={usernameErrorMessage}
            icon={<PersonIcon sx={{ color: 'action.active', mr: 1 }} />}
          />
          
          <PasswordField
            id="masterKey"
            name="masterKey"
            label="Master Key"
            placeholder="Enter your master key"
            value={masterKey}
            onChange={(value) => {
              setMasterKey(value);
              validateMasterKey(value);
            }}
            error={masterKeyError}
            helperText={masterKeyErrorMessage || 'Required for password recovery.'}
            icon={<KeyIcon sx={{ color: 'action.active', mr: 1 }} />}
            showPassword={showMasterKey}
            onToggleVisibility={() => setShowMasterKey(!showMasterKey)}
          />
          
          <PasswordField
            id="newPassword"
            name="newPassword"
            label="New Password"
            placeholder="••••••"
            autoComplete="new-password"
            value={newPassword}
            onChange={(value) => {
              setNewPassword(value);
              validateNewPassword(value);
              if (confirmNewPassword) {
                validateConfirmPassword(confirmNewPassword);
              }
            }}
            error={newPasswordError}
            helperText={newPasswordErrorMessage}
            icon={<LockIcon sx={{ color: 'action.active', mr: 1 }} />}
            showPassword={showNewPassword}
            onToggleVisibility={() => setShowNewPassword(!showNewPassword)}
          />
          
          <PasswordField
            id="confirmNewPassword"
            name="confirmNewPassword"
            label="Confirm New Password"
            placeholder="••••••"
            autoComplete="new-password"
            value={confirmNewPassword}
            onChange={(value) => {
              setConfirmNewPassword(value);
              validateConfirmPassword(value);
            }}
            error={confirmPasswordError}
            helperText={confirmPasswordErrorMessage}
            icon={<LockIcon sx={{ color: 'action.active', mr: 1 }} />}
            showPassword={showConfirmNewPassword}
            onToggleVisibility={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
          />
          
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
            Recover Password
          </Button>
        </Box>
        
        {error && (
          <Typography color="error" sx={{ textAlign: 'center' }}>
            {error}
          </Typography>
        )}
        
        {success && (
          <Typography color="success" sx={{ textAlign: 'center' }}>
            {success}
          </Typography>
        )}
      </AuthLayout>
  );
}

export default RecoverView;
