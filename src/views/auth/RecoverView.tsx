import { useState } from 'react';
import { useUser } from '../../context/AuthContext';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import KeyIcon from '@mui/icons-material/Key';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { CenteredCard, TopBar } from '../../components/ui';

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

  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
  const [masterKeyError, setMasterKeyError] = useState(false);
  const [masterKeyErrorMessage, setMasterKeyErrorMessage] = useState('');
  const [newPasswordError, setNewPasswordError] = useState(false);
  const [newPasswordErrorMessage, setNewPasswordErrorMessage] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateUsername = (value: string) => {
    if (!value || value.length < 3) {
      setUsernameError(true);
      setUsernameErrorMessage('Username must be at least 3 characters.');
      return false;
    }
    setUsernameError(false);
    setUsernameErrorMessage('');
    return true;
  };

  const validateMasterKey = (value: string) => {
    if (!value || value.length < 1) {
      setMasterKeyError(true);
      setMasterKeyErrorMessage('Master key is required.');
      return false;
    }
    setMasterKeyError(false);
    setMasterKeyErrorMessage('');
    return true;
  };

  const validateNewPassword = (value: string) => {
    if (!value || value.length < 6) {
      setNewPasswordError(true);
      setNewPasswordErrorMessage('Password must be at least 6 characters.');
      return false;
    }
    setNewPasswordError(false);
    setNewPasswordErrorMessage('');
    return true;
  };

  const validateConfirmPassword = (value: string) => {
    if (value !== newPassword) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage('Passwords do not match.');
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
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await recoverPassword(username, masterKey, newPassword);
      setSuccess('Password recovered. You can now log in.');
      setError('');
    } catch (err) {
      setError(err as string);
      setSuccess('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <TopBar onBack={onBack} transparent />

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
          Recover Password
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
            label="Username"
            placeholder="Enter username"
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={username}
            error={usernameError}
            helperText={usernameErrorMessage}
            onChange={(e) => {
              setUsername(e.target.value);
              validateUsername(e.target.value);
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
            label="Master Key"
            placeholder="Enter master key"
            fullWidth
            variant="outlined"
            value={masterKey}
            error={masterKeyError}
            helperText={masterKeyErrorMessage || 'Required for password recovery.'}
            onChange={(e) => {
              setMasterKey(e.target.value);
              validateMasterKey(e.target.value);
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
            label="New Password"
            placeholder="••••••"
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={newPassword}
            error={newPasswordError}
            helperText={newPasswordErrorMessage}
            onChange={(e) => {
              setNewPassword(e.target.value);
              validateNewPassword(e.target.value);
              if (confirmNewPassword) {
                validateConfirmPassword(confirmNewPassword);
              }
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
            label="Confirm New Password"
            placeholder="••••••"
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={confirmNewPassword}
            error={confirmPasswordError}
            helperText={confirmPasswordErrorMessage}
            onChange={(e) => {
              setConfirmNewPassword(e.target.value);
              validateConfirmPassword(e.target.value);
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
            {isLoading ? 'Recovering...' : 'Recover Password'}
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ textAlign: 'center', mt: 2 }}>
            {error}
          </Typography>
        )}

        {success && (
          <Typography color="success.main" sx={{ textAlign: 'center', mt: 2 }}>
            {success}
          </Typography>
        )}
      </CenteredCard>
    </>
  );
}

export default RecoverView;
