import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Stack, CircularProgress, FormControlLabel, Checkbox } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import { useUser } from '../../context/AuthContext';
import { TopBar } from '../../components/ui/TopBar';
import { AvatarPicker } from '../../components/ui/AvatarPicker';
import CenteredCard from '../../components/ui/CenteredCard';
import TextInput from '../../components/ui/TextInput';
import PasswordInput from '../../components/ui/PasswordInput';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

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

  const [errors, setErrors] = useState<{
    username?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (username && username.length < 3) {
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
        setErrors({ general: 'Failed to save settings.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const confirmDeleteAccount = async (masterKey: string) => {
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
    }
  };

  const confirmPasswordChange = (masterKey: string) => {
    saveSettings(masterKey);
  };

  return (
    <>
      <TopBar onBack={handleBack} transparent={true} />
      <CenteredCard>
        <Box sx={{ textAlign: 'center', mb: 1 }}>
          <AvatarPicker
            value={avatarPreview}
            onChange={setAvatarPreview}
            size={100}
            showUserIcon={true}
          />
        </Box>

        <Stack spacing={2}>
          <TextInput
            id="username"
            name="username"
            label="Username"
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={setUsername}
            error={!!errors.username}
            helperText={errors.username || ''}
            icon={<PersonIcon sx={{ color: 'action.active', mr: 1 }} />}
          />

          <PasswordInput
            id="newPassword"
            name="newPassword"
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            error={!!errors.newPassword}
            helperText={errors.newPassword || ''}
            icon={<LockIcon sx={{ color: 'action.active', mr: 1 }} />}
            showPassword={showNewPassword}
            onToggleVisibility={() => setShowNewPassword(!showNewPassword)}
          />

          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword || ''}
            icon={<LockIcon sx={{ color: 'action.active', mr: 1 }} />}
            showPassword={showConfirmPassword}
            onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={deleteAccountChecked}
                onChange={(e) => setDeleteAccountChecked(e.target.checked)}
                color={deleteAccountChecked ? 'error' : 'primary'}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', color: deleteAccountChecked ? 'error.main' : 'text.secondary' }}>
                Delete account
              </Box>
            }
          />

          {errors.general && (
            <Typography color="error" sx={{ textAlign: 'center' }}>
              {errors.general}
            </Typography>
          )}
        </Stack>

        <Box sx={{ mt: 1 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSave}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          
          {successMessage && (
            <Typography color="success" sx={{ textAlign: 'center', mt: 2 }}>
              {successMessage}
            </Typography>
          )}
        </Box>
      </CenteredCard>

      <ConfirmDialog
        open={passwordDialogOpen}
        title="Password Change"
        message="Please enter your master key to confirm the password change."
        onConfirm={(masterKey) => masterKey && confirmPasswordChange(masterKey)}
        onCancel={() => { setPasswordDialogOpen(false); setPasswordDialogError(''); }}
        showMasterKey={true}
        label="Master Key"
        placeholder="Enter master key"
        error={passwordDialogError}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Account"
        message="This action cannot be undone and all your data will be permanently lost. Enter your master key to confirm the delete account."
        onConfirm={(masterKey) => masterKey && confirmDeleteAccount(masterKey)}
        onCancel={() => { setDeleteDialogOpen(false); setDeleteDialogError(''); }}
        showMasterKey={true}
        label="Master Key"
        placeholder="Enter master key"
        error={deleteDialogError}
      />
    </>
  );
}

export default SettingsView;
