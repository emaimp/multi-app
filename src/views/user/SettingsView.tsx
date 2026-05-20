import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import PersonIcon from '@mui/icons-material/Person';
import { useUser } from '../../context/AuthContext';
import { AvatarPicker, CenteredCard, ConfirmDialog, TopBar } from '../../components/common';

export function SettingsView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser, deleteAccount } = useUser();

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
