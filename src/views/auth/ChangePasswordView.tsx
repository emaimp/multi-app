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
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { CenteredCard, TopBar } from '../../components/common';
import { useBackend } from '../../hooks/core/useBackend';

interface ChangePasswordViewProps {
  onBack: () => void;
  onSuccess: () => void;
  userId: number;
  masterKey: string;
}

function ChangePasswordView({ onBack, onSuccess, userId, masterKey }: ChangePasswordViewProps) {
  const { t } = useTranslation();
  const { invoke } = useBackend();

  const [newAccessKey, setNewAccessKey] = useState('');
  const [confirmNewAccessKey, setConfirmNewAccessKey] = useState('');

  const [showNewAccessKey, setShowNewAccessKey] = useState(false);
  const [showConfirmNewAccessKey, setShowConfirmNewAccessKey] = useState(false);

  const [newAccessKeyError, setNewAccessKeyError] = useState(false);
  const [accessKeysNotMatchError, setAccessKeysNotMatchError] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      await invoke('change_access_key', {
        userId,
        masterKey,
        newAccessKey,
      });
      setSuccess(t('changePassword.success'));
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (errorMessage.includes('Invalid master key')) {
        setError(t('changePassword.invalidMasterKey'));
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setError(t('login.networkError'));
      } else {
        setError(t('changePassword.failed'));
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
        onSuccessClose={onSuccess}
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
          {t('changePassword.title')}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('changePassword.description')}
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
            id="newAccessKey"
            name="newAccessKey"
            type={showNewAccessKey ? 'text' : 'password'}
            label={t('changePassword.newAccessKey')}
            placeholder={t('changePassword.newAccessKeyPlaceholder')}
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
            label={t('changePassword.confirmNewAccessKey')}
            placeholder={t('changePassword.confirmNewAccessKeyPlaceholder')}
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
            {isLoading ? t('changePassword.changing') : t('changePassword.changeBtn')}
          </Button>
        </Box>
      </CenteredCard>
    </>
  );
}

export default ChangePasswordView;
