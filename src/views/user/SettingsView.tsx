import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import PersonIcon from '@mui/icons-material/Person';
import KeyIcon from '@mui/icons-material/Key';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useUser } from '../../context/AuthContext';
import { useBackend } from '../../hooks/core/useBackend';
import { AvatarPicker, CenteredCard, ConfirmDialog, TopBar } from '../../components/common';

export function SettingsView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser, deleteAccount } = useUser();
  const { invoke } = useBackend();

  const [username, setUsername] = useState(user?.username || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [deleteAccountChecked, setDeleteAccountChecked] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogError, setDeleteDialogError] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);

  const [errors, setErrors] = useState<{
    username?: string;
    general?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [currentMasterKey, setCurrentMasterKey] = useState('');
  const [newMasterKey, setNewMasterKey] = useState('');
  const [confirmNewMasterKey, setConfirmNewMasterKey] = useState('');
  const [showCurrentMasterKey, setShowCurrentMasterKey] = useState(false);
  const [showNewMasterKey, setShowNewMasterKey] = useState(false);
  const [showConfirmNewMasterKey, setShowConfirmNewMasterKey] = useState(false);
  const [changeMasterKeyError, setChangeMasterKeyError] = useState('');
  const [isChangingMasterKey, setIsChangingMasterKey] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (username.length < 3) {
      newErrors.username = t('settings.usernameMinLength');
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

    if (currentMasterKey || newMasterKey || confirmNewMasterKey) {
      await handleChangeMasterKey();
      return;
    }

    await saveSettings();
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      if (avatarPreview !== user?.avatar) {
        await updateUser({ avatar: avatarPreview || null });
      }

      if (username !== user?.username) {
        await updateUser({ username });
      }

      setDeleteAccountChecked(false);

      setSuccessMessage(t('settings.settingsSaved'));
    } catch (err: unknown) {
      setErrorMessage(t('settings.failedToSaveSettings'));
    } finally {
      setIsLoading(false);
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
        setDeleteDialogError(t('settings.invalidMasterKey'));
      } else {
        setDeleteDialogError(t('settings.failedToDelete'));
      }
    } finally {
      setDialogLoading(false);
    }
  };

  const handleChangeMasterKey = async () => {
    if (!currentMasterKey && !newMasterKey && !confirmNewMasterKey) {
      await saveSettings();
      return;
    }

    if (!currentMasterKey || !newMasterKey || !confirmNewMasterKey) {
      setChangeMasterKeyError('All fields are required');
      return;
    }

    if (newMasterKey.length < 6) {
      setChangeMasterKeyError(t('register.masterKeyMinLength'));
      return;
    }

    if (newMasterKey !== confirmNewMasterKey) {
      setChangeMasterKeyError(t('settings.masterKeysDoNotMatch'));
      return;
    }

    setIsChangingMasterKey(true);
    setChangeMasterKeyError('');

    try {
      await invoke('change_master_key', {
        userId: user?.id,
        currentMasterKey,
        newMasterKey,
      });

      localStorage.setItem('masterKey', newMasterKey);
      setCurrentMasterKey('');
      setNewMasterKey('');
      setConfirmNewMasterKey('');
      setSuccessMessage(t('settings.masterKeyChanged'));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Invalid master key') || errorMessage.includes('incorrect')) {
        setChangeMasterKeyError(t('settings.invalidCurrentMasterKey'));
      } else {
        setChangeMasterKeyError('Failed to change master key');
      }
    } finally {
      setIsChangingMasterKey(false);
    }
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
            label={t('settings.username')}
            placeholder={t('settings.usernamePlaceholder')}
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
            label={t('settings.currentMasterKey')}
            type={showCurrentMasterKey ? 'text' : 'password'}
            fullWidth
            value={currentMasterKey}
            onChange={(e) => {
              setCurrentMasterKey(e.target.value);
              setChangeMasterKeyError('');
            }}
            disabled={isChangingMasterKey}
            slotProps={{
              input: {
                startAdornment: <KeyIcon sx={{ color: 'action.active', mr: 1 }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrentMasterKey(!showCurrentMasterKey)} edge="end">
                      {showCurrentMasterKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label={t('settings.newMasterKey')}
            type={showNewMasterKey ? 'text' : 'password'}
            fullWidth
            value={newMasterKey}
            onChange={(e) => {
              setNewMasterKey(e.target.value);
              setChangeMasterKeyError('');
            }}
            disabled={isChangingMasterKey}
            slotProps={{
              input: {
                startAdornment: <KeyIcon sx={{ color: 'action.active', mr: 1 }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewMasterKey(!showNewMasterKey)} edge="end">
                      {showNewMasterKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label={t('settings.confirmNewMasterKey')}
            type={showConfirmNewMasterKey ? 'text' : 'password'}
            fullWidth
            value={confirmNewMasterKey}
            onChange={(e) => {
              setConfirmNewMasterKey(e.target.value);
              setChangeMasterKeyError('');
            }}
            disabled={isChangingMasterKey}
            error={!!changeMasterKeyError}
            helperText={changeMasterKeyError}
            slotProps={{
              input: {
                startAdornment: <KeyIcon sx={{ color: 'action.active', mr: 1 }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmNewMasterKey(!showConfirmNewMasterKey)} edge="end">
                      {showConfirmNewMasterKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
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
                {t('settings.deleteAccount')}
              </Box>
            }
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleSave}
            disabled={isLoading || isChangingMasterKey}
            startIcon={isLoading || isChangingMasterKey ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isChangingMasterKey ? t('settings.changingMasterKey') : isLoading ? t('settings.saving') : t('settings.saveChanges')}
          </Button>
        </Box>
      </CenteredCard>

      <ConfirmDialog
        open={deleteDialogOpen}
        title={t('settings.deleteAccountTitle')}
        message={t('settings.deleteAccountMessage')}
        onConfirm={(masterKey) => masterKey && confirmDeleteAccount(masterKey)}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeleteDialogError('');
        }}
        showMasterKey
        label={t('login.masterKey')}
        placeholder={t('login.masterKeyPlaceholder')}
        error={deleteDialogError}
        isLoading={dialogLoading}
      />
    </>
  );
}

export default SettingsView;
