import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import KeyIcon from '@mui/icons-material/Key';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { CenteredCard, TopBar } from '../../../components/common';

interface LoginFormProps {
  username: string;
  masterKey: string;
  usernameError: boolean;
  usernameNotFoundError: boolean;
  masterKeyError: boolean;
  masterKeyInvalidError: boolean;
  showMasterKey: boolean;
  isLoading: boolean;
  error: string;
  onUsernameChange: (value: string) => void;
  onMasterKeyChange: (value: string) => void;
  onToggleMasterKeyVisibility: () => void;
  onUsernameErrorChange: (error: boolean) => void;
  onUsernameNotFoundErrorChange: (error: boolean) => void;
  onMasterKeyErrorChange: (error: boolean) => void;
  onMasterKeyInvalidErrorChange: (error: boolean) => void;
  onErrorChange: (error: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onNavigateToRegister: () => void;
}

function LoginForm({
  username,
  masterKey,
  usernameError,
  usernameNotFoundError,
  masterKeyError,
  masterKeyInvalidError,
  showMasterKey,
  isLoading,
  error,
  onUsernameChange,
  onMasterKeyChange,
  onToggleMasterKeyVisibility,
  onUsernameErrorChange,
  onUsernameNotFoundErrorChange,
  onMasterKeyErrorChange,
  onMasterKeyInvalidErrorChange,
  onErrorChange,
  onSubmit,
  onBack,
  onNavigateToRegister,
}: LoginFormProps) {
  const { t } = useTranslation();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUsernameChange(e.target.value);
    if (usernameError) onUsernameErrorChange(false);
    if (usernameNotFoundError) onUsernameNotFoundErrorChange(false);
    if (error) onErrorChange('');
  };

  const handleMasterKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onMasterKeyChange(e.target.value);
    if (masterKeyError) onMasterKeyErrorChange(false);
    if (masterKeyInvalidError) onMasterKeyInvalidErrorChange(false);
    if (error) onErrorChange('');
  };

  return (
    <>
      <TopBar onBack={onBack} showBackButton={false} />
      
      <CenteredCard error={error} onErrorClose={() => onErrorChange('')}>
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
          {t('login.signIn')}
        </Typography>

        <Box
          component="form"
          onSubmit={onSubmit}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
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
            autoFocus
            fullWidth
            variant="outlined"
            value={username}
            error={usernameError || usernameNotFoundError}
            helperText={usernameError ? t('login.usernameMinLength') : usernameNotFoundError ? t('login.userNotFound') : ''}
            onChange={handleUsernameChange}
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
            label={t('login.masterKey')}
            placeholder={t('login.masterKeyPlaceholder')}
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={masterKey}
            error={masterKeyError || masterKeyInvalidError}
            helperText={masterKeyError ? t('login.masterKeyRequired') : masterKeyInvalidError ? t('login.invalidMasterKey') : ''}
            onChange={handleMasterKeyChange}
            slotProps={{
              input: {
                startAdornment: <KeyIcon sx={{ color: 'action.active', mr: 1 }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle master key visibility"
                      onClick={onToggleMasterKeyVisibility}
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? t('login.signingIn') : t('login.continue')}
          </Button>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              mt: 2,
            }}
          >
            <Typography sx={{ textAlign: 'center' }}>
              {t('login.dontHaveAccount')}&nbsp;
              <Link
                component="button"
                type="button"
                onClick={onNavigateToRegister}
                variant="body2"
                sx={{ alignSelf: 'center' }}
              >
                {t('login.signUp')}
              </Link>
            </Typography>
          </Box>
        </Box>
      </CenteredCard>
    </>
  );
}

export default LoginForm;