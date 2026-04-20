import { useState } from 'react';
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

    if (value.length < 6) return { label: 'It must have at least 6 characters.', color: 'error' };
    if (score <= 1) return { label: 'Low security - Add more specific characters.', color: 'error' };
    if (score <= 2) return { label: 'Medium security - Add more specific characters.', color: 'warning' };
    if (score <= 3) return { label: 'Medium security - Add more specific characters.', color: 'warning' };
    return { label: `High security - Strong ${label}.`, color: 'success' };
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
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (errorMessage.includes('User not found')) {
        setError('User not found. Please check your username.');
        setUsernameNotFoundError(true);
      } else if (errorMessage.includes('Invalid master key')) {
        setError('Invalid master key. Please try again.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
        setError('Network error. Please check your connection.');
      } else {
        setError('Password recovery failed. Please try again.');
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
            error={usernameError || usernameNotFoundError}
            helperText={usernameError ? 'It must have at least 3 characters.' : usernameNotFoundError ? 'User not found.' : ''}
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
            label="Master Key"
            placeholder="Enter master key"
            fullWidth
            variant="outlined"
            value={masterKey}
            error={masterKeyError}
            helperText={masterKeyErrorMessage || 'Required for password recovery.'}
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
            label="New Password"
            placeholder="••••••"
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
                  Key to access. It can be modified.
                </span>
              ) : newPassword.length < 6 ? (
                <Box component="span" sx={{ color: 'error.main' }}>
                  {newPasswordStrength.label}
                </Box>
              ) : (
                <Box component="span" sx={{ color: getColor(newPasswordStrength.color) }}>
                  {newPasswordStrength.label}
                  <Tooltip title="Specific characters: A-Z, 0-9, !@#$">
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
              if (e.target.value.length === 0 || e.target.value === newPassword) {
                setConfirmPasswordError(false);
                setConfirmPasswordErrorMessage('');
              } else {
                setConfirmPasswordError(true);
                setConfirmPasswordErrorMessage('Passwords do not match.');
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
            {isLoading ? 'Recovering...' : 'Recover Password'}
          </Button>
        </Box>
      </CenteredCard>
    </>
  );
}

export default RecoverView;
