import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import KeyIcon from '@mui/icons-material/Key';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { CenteredCard, TopBar } from '../../components/common';
import { useBackend } from '../../hooks/core/useBackend';

interface RecoverPasswordViewProps {
  onBack: () => void;
}

function RecoverPasswordView({ onBack }: RecoverPasswordViewProps) {
  const { t } = useTranslation();
  const { invoke } = useBackend();

  const [username, setUsername] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [newAccessKey, setNewAccessKey] = useState('');
  const [confirmNewAccessKey, setConfirmNewAccessKey] = useState('');

  const [showMasterKey, setShowMasterKey] = useState(false);
  const [showNewAccessKey, setShowNewAccessKey] = useState(false);
  const [showConfirmNewAccessKey, setShowConfirmNewAccessKey] = useState(false);

  const [usernameError, setUsernameError] = useState(false);
  const [masterKeyError, setMasterKeyError] = useState(false);
  const [masterKeyInvalidError, setMasterKeyInvalidError] = useState(false);
  const [newAccessKeyError, setNewAccessKeyError] = useState(false);
  const [accessKeysNotMatchError, setAccessKeysNotMatchError] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (usernameError) setUsernameError(false);
    if (error) setError('');
  };

  const handleMasterKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMasterKey(e.target.value);
    if (masterKeyError) setMasterKeyError(false);
    if (masterKeyInvalidError) setMasterKeyInvalidError(false);
    if (error) setError('');
  };

  const handleNewAccessKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAccessKey(e.target.value);
    if (newAccessKeyError) setNewAccessKeyError(false);
    if (accessKeysNotMatchError) setAccessKeysNotMatchError(false);
    if (error) setError('');
  };

  const handleConfirmNewAccessKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmNewAccessKey(e.target.value);
    if (newAccessKeyError) setNewAccessKeyError(false);
    if (accessKeysNotMatchError) setAccessKeysNotMatchError(false);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let isValid = true;

    if (!username || username.length < 3) {
      setUsernameError(true);
      isValid = false;
    }

    if (!masterKey || masterKey.length < 1) {
      setMasterKeyError(true);
      isValid = false;
    }

    if (!newAccessKey || newAccessKey.length < 6) {
      setNewAccessKeyError(true);
      isValid = false;
    }

    if (newAccessKey !== confirmNewAccessKey) {
      setAccessKeysNotMatchError(true);
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    try {
      setIsLoading(true);
      await invoke('recover_access_key', {
        username,
        masterKey,
        newAccessKey,
      });
      setSuccess(t('recoverPassword.success'));
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (errorMessage.includes('User not found')) {
        setUsernameError(true);
        setError(t('login.userNotFound'));
      } else if (errorMessage.includes('Invalid master key')) {
        setMasterKeyInvalidError(true);
        setError(t('recoverPassword.invalidMasterKey'));
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setError(t('login.networkError'));
      } else {
        setError(t('recoverPassword.failed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <TopBar onBack={onBack} />

      <CenteredCard 
        error={error} 
        onErrorClose={() => setError('')}
        success={success}
        onSuccessClose={() => setSuccess('')}
      >
        <Typography
          component="h1"
          variant="h4"
          sx={{
            width: '100%',
            fontSize: 'clamp(1.5rem, 8vw, 2rem)',
            textAlign: 'center',
            mb: 2,
          }}
        >
          {t('recoverPassword.title')}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('recoverPassword.description')}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
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
            label={t('login.username')}
            placeholder={t('login.usernamePlaceholder')}
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={username}
            error={usernameError}
            onChange={handleUsernameChange}
            slotProps={{
              input: {
                startAdornment: <PersonIcon sx={{ color: 'action.active', mr: 1 }} />,
              },
            }}
          />

          <TextField
            id="masterKey"
            name="masterKey"
            type={showMasterKey ? 'text' : 'password'}
            label={t('recoverPassword.masterKey')}
            placeholder={t('login.masterKeyPlaceholder')}
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={masterKey}
            error={masterKeyError || masterKeyInvalidError}
            helperText={masterKeyError ? t('login.masterKeyRequired') : masterKeyInvalidError ? t('recoverPassword.invalidMasterKey') : ''}
            onChange={handleMasterKeyChange}
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
          />

          <TextField
            id="newAccessKey"
            name="newAccessKey"
            type={showNewAccessKey ? 'text' : 'password'}
            label={t('recoverPassword.newAccessKey')}
            placeholder={t('recoverPassword.newAccessKeyPlaceholder')}
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={newAccessKey}
            error={newAccessKeyError}
            helperText={newAccessKeyError ? t('register.masterKeyMinLength') : ''}
            onChange={handleNewAccessKeyChange}
            slotProps={{
              input: {
                startAdornment: <KeyIcon sx={{ color: 'action.active', mr: 1 }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle new access key visibility"
                      onClick={() => setShowNewAccessKey(!showNewAccessKey)}
                      edge="end"
                    >
                      {showNewAccessKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            id="confirmNewAccessKey"
            name="confirmNewAccessKey"
            type={showConfirmNewAccessKey ? 'text' : 'password'}
            label={t('recoverPassword.confirmNewAccessKey')}
            placeholder={t('recoverPassword.confirmNewAccessKeyPlaceholder')}
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={confirmNewAccessKey}
            error={accessKeysNotMatchError}
            helperText={accessKeysNotMatchError ? t('settings.masterKeysDoNotMatch') : ''}
            onChange={handleConfirmNewAccessKeyChange}
            slotProps={{
              input: {
                startAdornment: <KeyIcon sx={{ color: 'action.active', mr: 1 }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm new access key visibility"
                      onClick={() => setShowConfirmNewAccessKey(!showConfirmNewAccessKey)}
                      edge="end"
                    >
                      {showConfirmNewAccessKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? t('recoverPassword.recovering') : t('recoverPassword.recoverBtn')}
          </Button>
        </Box>
      </CenteredCard>
    </>
  );
}

export default RecoverPasswordView;