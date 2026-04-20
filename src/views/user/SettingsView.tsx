import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useUser } from '../../context/AuthContext';
import { AvatarPicker, CenteredCard, ConfirmDialog, TopBar } from '../../components/ui';

export function SettingsView() {
  const navigate = useNavigate();
  const { user, updateUser, changePassword, deleteAccount } = useUser();

  const [username, setUsername] = useState(user?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [deleteAccountChecked, setDeleteAccountChecked] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogError, setDeleteDialogError] = useState('');
  const [passwordDialogError, setPasswordDialogError] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);

  const [errors, setErrors] = useState<{
    username?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters.';
      }
      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (deleteAccountChecked) {
      setDeleteDialogOpen(true);
      return;
    }

    if (newPassword) {
      setPasswordDialogOpen(true);
      return;
    }

    await saveSettings();
  };

  const saveSettings = async (masterKey?: string) => {
    setIsLoading(true);
    setDialogLoading(true);
    try {
      if (avatarPreview !== user?.avatar) {
        await updateUser({ avatar: avatarPreview || null });
      }

      if (username !== user?.username) {
        await updateUser({ username });
      }

      if (newPassword && masterKey) {
        await changePassword(masterKey, newPassword);
      }

      setNewPassword('');
      setConfirmPassword('');
      setDeleteAccountChecked(false);
      setPasswordDialogOpen(false);

      setSuccessMessage('Settings saved successfully.');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (masterKey) {
        if (errorMessage.includes('Invalid master key')) {
          setPasswordDialogError('Invalid master key');
        } else {
          setPasswordDialogError('Failed to save settings.');
        }
      } else {
        setErrorMessage('Failed to save settings.');
      }
    } finally {
      setIsLoading(false);
      setDialogLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const confirmDeleteAccount = async (masterKey: string) => {
    setDialogLoading(true);
    try {
      await deleteAccount(masterKey);
      setDeleteDialogOpen(false);
      navigate('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Invalid master key')) {
        setDeleteDialogError('Invalid master key');
      } else {
        setDeleteDialogError('Failed to delete account.');
      }
    } finally {
      setDialogLoading(false);
    }
  };

  const confirmPasswordChange = (masterKey: string) => {
    saveSettings(masterKey);
  };

  return (
    <>
      <TopBar onBack={handleBack} />

      <CenteredCard 
        success={successMessage} 
        onSuccessClose={() => setSuccessMessage('')}
        error={errorMessage}
        onErrorClose={() => setErrorMessage('')}
      >
        <Box
          sx={{
            textAlign: 'center',
            mb: 1
          }}
        >
          <AvatarPicker
            value={avatarPreview}
            onChange={setAvatarPreview}
            size={100}
            showUserIcon
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
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
            fullWidth
            variant="outlined"
            value={username}
            error={!!errors.username}
            helperText={errors.username || ''}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
            }}
            slotProps={{
              input: {
                startAdornment: <PersonIcon sx={{ color: 'action.active', mr: 1 }} />,
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
            error={!!errors.newPassword}
            helperText={errors.newPassword || ''}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: undefined }));
              if (errorMessage) setErrorMessage('');
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
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirm Password"
            placeholder="••••••"
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={confirmPassword}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword || ''}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
              if (errorMessage) setErrorMessage('');
            }}
            slotProps={{
              input: {
                startAdornment: <LockIcon sx={{ color: 'action.active', mr: 1 }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                checked={deleteAccountChecked}
                onChange={(e) => {
                  setDeleteAccountChecked(e.target.checked);
                  if (errorMessage) setErrorMessage('');
                }}
                color={deleteAccountChecked ? 'error' : 'primary'}
              />
            }
            label={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: deleteAccountChecked ? 'error.main' : 'text.secondary'
                }}
              >
                Delete account
              </Box>
            }
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleSave}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </CenteredCard>

      <ConfirmDialog
        open={passwordDialogOpen}
        title="Password Change"
        message="Please enter your master key to confirm the password change."
        onConfirm={(masterKey) => masterKey && confirmPasswordChange(masterKey)}
        onCancel={() => {
          setPasswordDialogOpen(false);
          setPasswordDialogError('');
        }}
        showMasterKey
        label="Master Key"
        placeholder="Enter master key"
        error={passwordDialogError}
        isLoading={dialogLoading}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Account"
        message="This action cannot be undone and all your data will be permanently lost. Enter your master key to confirm the delete account."
        onConfirm={(masterKey) => masterKey && confirmDeleteAccount(masterKey)}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeleteDialogError('');
        }}
        showMasterKey
        label="Master Key"
        placeholder="Enter master key"
        error={deleteDialogError}
        isLoading={dialogLoading}
      />
    </>
  );
}

export default SettingsView;
