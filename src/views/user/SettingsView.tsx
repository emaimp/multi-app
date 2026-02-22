import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Stack } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import KeyIcon from '@mui/icons-material/Key';
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
  const [masterKey, setMasterKey] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showMasterKey, setShowMasterKey] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [errors, setErrors] = useState<{
    username?: string;
    newPassword?: string;
    confirmPassword?: string;
    masterKey?: string;
    general?: string;
  }>({});

  const [saved, setSaved] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (username && username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    }

    if (masterKey || newPassword || confirmPassword) {
      if (newPassword && newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters.';
      }
      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
      if (!masterKey) {
        newErrors.masterKey = 'Master key is required.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

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
      setMasterKey('');

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      if (errorMessage.includes('Invalid master key')) {
        setErrors({ masterKey: 'Invalid master key' });
      } else {
        setErrors({ general: 'Failed to save settings.' });
      }
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
    navigate('/');
  };

  const deleteAccountButton = (
    <Button
      variant="outlined"
      color="error"
      size="small"
      startIcon={<DeleteIcon />}
      onClick={() => setDeleteDialogOpen(true)}
    >
      Delete Account
    </Button>
  );

  return (
    <>
      <TopBar
        onBack={handleBack}
        title="Settings"
        transparent={true}
        actions={[deleteAccountButton]}
      />
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

          <PasswordInput
            id="masterKey"
            name="masterKey"
            label="Master Key"
            value={masterKey}
            onChange={setMasterKey}
            error={!!errors.masterKey}
            helperText={errors.masterKey || ''}
            icon={<KeyIcon sx={{ color: 'action.active', mr: 1 }} />}
            showPassword={showMasterKey}
            onToggleVisibility={() => setShowMasterKey(!showMasterKey)}
          />

          {errors.general && (
            <Typography color="error" sx={{ textAlign: 'center' }}>
              {errors.general}
            </Typography>
          )}
        </Stack>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSave}
            color={saved ? 'success' : 'primary'}
            endIcon={saved ? <CheckIcon /> : null}
            sx={{
              transition: 'all 0.3s ease',
              ...(saved && {
                animation: 'pulse 0.3s ease-in-out',
              }),
            }}
          >
            {saved ? 'Saved' : 'Save Changes'}
          </Button>
        </Box>
      </CenteredCard>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}

export default SettingsView;
