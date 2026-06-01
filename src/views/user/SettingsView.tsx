import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import KeyIcon from '@mui/icons-material/Key';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useUser } from '../../context/AuthContext';
import { AvatarPicker, CenteredCard, ConfirmDialog, TopBar } from '../../components/common';

export function SettingsView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser, changePassword, changeUsername, deleteAccount } = useUser();

  const [username, setUsername] = useState(user?.username || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [deleteAccountChecked, setDeleteAccountChecked] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogError, setDeleteDialogError] = useState('');
  const [deleteDialogLoading, setDeleteDialogLoading] = useState(false);

  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [passwordStrength, setPasswordStrength] = useState({ label: '', color: 'error' as 'error' | 'warning' | 'success' });

  const getStrength = (value: string): { label: string; color: 'error' | 'warning' | 'success' } => {
    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSymbol = /[^a-zA-Z0-9]/.test(value);

    const score = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;

    if (value.length < 6) return { label: t('register.masterKeyMinLength'), color: 'error' };
    if (score <= 1) return { label: t('register.lowSecurity'), color: 'error' };
    if (score <= 2) return { label: t('register.mediumSecurity'), color: 'warning' };
    if (score <= 3) return { label: t('register.mediumSecurity'), color: 'warning' };
    return { label: t('register.highSecurity', { label: 'password' }), color: 'success' };
  };

  const getColor = (color: string) => `${color}.main`;

  const showSuccess = useCallback((msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  }, []);

  const handleBack = () => navigate(-1);

  const handleAvatarChange = async (avatar: string | null) => {
    setAvatarPreview(avatar);
    try {
      await updateUser({ avatar });
    } catch {
      setErrorMessage(t('settings.failedToSaveSettings'));
    }
  };

  const handleSave = async () => {
    setUsernameError('');
    setPasswordError('');
    setCurrentPasswordError('');

    if (!user) return;

    const usernameChanged = username !== user.username;
    const changingPassword = !!newPassword;

    if (usernameChanged && username.length < 3) {
      setUsernameError(t('settings.usernameMinLength'));
      return;
    }

    if (changingPassword && newPassword !== confirmPassword) {
      setPasswordError(t('settings.passwordsDoNotMatch'));
      return;
    }

    if (deleteAccountChecked) {
      setDeleteDialogOpen(true);
      return;
    }

    if (!usernameChanged && !changingPassword) {
      return;
    }

    if (!currentPassword) {
      setCurrentPasswordError(t('settings.currentPasswordHelper'));
      return;
    }

    setIsLoading(true);
    try {
      if (usernameChanged) {
        await changeUsername(currentPassword, username);
      }

      if (changingPassword) {
        await changePassword(currentPassword, newPassword);
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setDeleteAccountChecked(false);
      showSuccess(t('settings.settingsSaved'));
    } catch {
      setCurrentPasswordError(t('settings.invalidPassword'));
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteAccount = async (password: string) => {
    if (!password) return;
    setDeleteDialogLoading(true);
    try {
      await deleteAccount(password);
      setDeleteDialogOpen(false);
      navigate('/');
    } catch {
      setDeleteDialogError(t('settings.invalidPassword'));
    } finally {
      setDeleteDialogLoading(false);
    }
  };

  const renderEye = (show: boolean, toggle: () => void) => (
    <InputAdornment position="end">
      <IconButton
        aria-label="toggle password visibility"
        onClick={toggle}
        edge="end"
      >
        {show ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <>
      <TopBar onBack={handleBack} />

      <CenteredCard
        success={successMessage}
        onSuccessClose={() => setSuccessMessage('')}
        error={errorMessage}
        onErrorClose={() => setErrorMessage('')}
      >
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <AvatarPicker
            value={avatarPreview}
            onChange={handleAvatarChange}
            size={100}
            showUserIcon
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            type="text"
            label={t('login.username')}
            placeholder={t('settings.usernamePlaceholder')}
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={username}
            error={!!usernameError}
            helperText={usernameError || ''}
            onChange={(e) => {
              setUsername(e.target.value);
              if (usernameError) setUsernameError('');
            }}
            slotProps={{
              input: {
                startAdornment: <PersonIcon sx={{ color: 'action.active', mr: 1 }} />,
              },
            }}
          />

          <TextField
            type={showNewPassword ? 'text' : 'password'}
            label={t('settings.newPassword')}
            fullWidth
            variant="outlined"
            value={newPassword}
            helperText={
              newPassword.length < 6 ? (
                <span>{t('register.masterKeyMinLength')}</span>
              ) : (
                <Box component="span" sx={{ color: getColor(passwordStrength.color) }}>
                  {passwordStrength.label}
                  <Tooltip title={t('register.specificChars')}>
                    <InfoOutlined sx={{ fontSize: 14, ml: 1, verticalAlign: 'middle', cursor: 'help', color: 'action.active' }} />
                  </Tooltip>
                </Box>
              )
            }
            onChange={(e) => {
              const value = e.target.value;
              setNewPassword(value);
              if (value.length === 0) {
                setPasswordStrength({ label: '', color: 'error' });
              } else {
                setPasswordStrength(getStrength(value));
              }
            }}
            slotProps={{
              input: {
                startAdornment: <KeyIcon sx={{ color: 'action.active', mr: 1 }} />,
                endAdornment: renderEye(showNewPassword, () => setShowNewPassword(!showNewPassword)),
              },
            }}
          />

          <TextField
            type={showConfirmPassword ? 'text' : 'password'}
            label={t('settings.confirmPassword')}
            fullWidth
            variant="outlined"
            value={confirmPassword}
            error={!!passwordError}
            helperText={passwordError || ''}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (passwordError) setPasswordError('');
            }}
            slotProps={{
              input: {
                startAdornment: <KeyIcon sx={{ color: 'action.active', mr: 1 }} />,
                endAdornment: renderEye(showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword)),
              },
            }}
          />

          <TextField
            type={showCurrentPassword ? 'text' : 'password'}
            label={t('settings.currentPassword')}
            fullWidth
            variant="outlined"
            value={currentPassword}
            error={!!currentPasswordError}
            helperText={currentPasswordError || t('settings.currentPasswordHelper')}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              if (currentPasswordError) setCurrentPasswordError('');
            }}
            slotProps={{
              input: {
                startAdornment: <KeyIcon sx={{ color: 'action.active', mr: 1 }} />,
                endAdornment: renderEye(showCurrentPassword, () => setShowCurrentPassword(!showCurrentPassword)),
              },
            }}
          />

          <Divider />

          <FormControlLabel
            control={
              <Checkbox
                checked={deleteAccountChecked}
                onChange={(e) => setDeleteAccountChecked(e.target.checked)}
                color={deleteAccountChecked ? 'error' : 'primary'}
              />
            }
            label={
              <Box sx={{ color: deleteAccountChecked ? 'error.main' : 'text.secondary' }}>
                {t('settings.deleteAccount')}
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
            {isLoading ? t('settings.saving') : t('settings.saveChanges')}
          </Button>
        </Box>
      </CenteredCard>

      <ConfirmDialog
        open={deleteDialogOpen}
        title={t('settings.deleteAccountTitle')}
        message={t('settings.deleteAccountMessage')}
        onConfirm={(password) => password && confirmDeleteAccount(password)}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeleteDialogError('');
        }}
        showMasterKey
        label={t('login.password')}
        placeholder={t('login.passwordPlaceholder')}
        error={deleteDialogError}
        isLoading={deleteDialogLoading}
      />
    </>
  );
}

export default SettingsView;
