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
  onVerified: (userId: number, username: string, masterKey: string) => void;
}

function RecoverPasswordView({ onBack, onVerified }: RecoverPasswordViewProps) {
  const { t } = useTranslation();
  const { invoke } = useBackend();

  const [username, setUsername] = useState('');
  const [masterKey, setMasterKey] = useState('');

  const [showMasterKey, setShowMasterKey] = useState(false);

  const [usernameError, setUsernameError] = useState(false);
  const [masterKeyError, setMasterKeyError] = useState(false);
  const [masterKeyInvalidError, setMasterKeyInvalidError] = useState(false);

  const [error, setError] = useState('');
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

    if (!isValid) {
      return;
    }

    try {
      setIsLoading(true);
      const userId: number = await invoke('verify_user_by_master_key', {
        username,
        masterKey,
      });
      onVerified(userId, username, masterKey);
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? t('recoverPassword.verifying') : t('recoverPassword.verifyBtn')}
          </Button>
        </Box>
      </CenteredCard>
    </>
  );
}

export default RecoverPasswordView;
