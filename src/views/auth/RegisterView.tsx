import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import KeyIcon from '@mui/icons-material/Key';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { CenteredCard, TopBar } from '../../components/common';
import { RegisterStep1Response } from '../../context/auth/UserContext';
import { QRCodeSVG } from 'qrcode.react';

interface RegisterViewProps {
  onRegister: (username: string, masterKey: string) => Promise<RegisterStep1Response>;
  onConfirmRegister: (userId: number, totpCode: string, masterKey: string) => Promise<void>;
  onBack: () => void;
}

function RegisterView({ onRegister, onConfirmRegister, onBack }: RegisterViewProps) {
  const { t } = useTranslation();
  
  const [step, setStep] = useState<'form' | 'qr' | 'confirm'>('form');
  const [username, setUsername] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [confirmMasterKey, setConfirmMasterKey] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const [showMasterKey, setShowMasterKey] = useState(false);
  const [showConfirmMasterKey, setShowConfirmMasterKey] = useState(false);

  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
  const [masterKeyError, setMasterKeyError] = useState(false);
  const [masterKeyErrorMessage, setMasterKeyErrorMessage] = useState('');
  const [confirmMasterKeyError, setConfirmMasterKeyError] = useState(false);
  const [confirmMasterKeyErrorMessage, setConfirmMasterKeyErrorMessage] = useState('');
  const [totpCodeError, setTotpCodeError] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [registerData, setRegisterData] = useState<RegisterStep1Response | null>(null);

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
    return { label: t('register.highSecurity', { label: 'master key' }), color: 'success' };
  };

  const getColor = (color: string) => `${color}.main`;

  const [masterKeyStrength, setMasterKeyStrength] = useState({ label: '', color: 'error' as 'error' | 'warning' | 'success' });

  const validateUsername = (value: string) => {
    if (!value || value.length < 3) {
      setUsernameError(true);
      setUsernameErrorMessage(t('register.usernameMinLength'));
      return false;
    }
    setUsernameError(false);
    setUsernameErrorMessage('');
    return true;
  };

  const validateMasterKey = (value: string) => {
    if (!value || value.length < 6) {
      setMasterKeyError(true);
      setMasterKeyErrorMessage(t('register.masterKeyMinLength'));
      return false;
    }
    setMasterKeyError(false);
    setMasterKeyErrorMessage('');
    return true;
  };

  const validateConfirmMasterKey = (value: string) => {
    if (value !== masterKey) {
      setConfirmMasterKeyError(true);
      setConfirmMasterKeyErrorMessage(t('register.masterKeysDoNotMatch'));
      return false;
    }
    setConfirmMasterKeyError(false);
    setConfirmMasterKeyErrorMessage('');
    return true;
  };

  const handleSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();

    const isUsernameValid = validateUsername(username);
    const isMasterKeyValid = validateMasterKey(masterKey);
    const isConfirmMasterKeyValid = validateConfirmMasterKey(confirmMasterKey);

    if (!isUsernameValid || !isMasterKeyValid || !isConfirmMasterKeyValid) {
      return;
    }

    if (masterKey !== confirmMasterKey) {
      setError(t('register.masterKeysDoNotMatch'));
      return;
    }

    try {
      setIsLoading(true);
      const data = await onRegister(username, masterKey);
      setRegisterData(data);
      setStep('qr');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (errorMessage.includes('User already exists')) {
        setError(t('register.usernameTaken'));
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
        setError(t('register.networkError'));
      } else {
        setError(t('register.registerFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmQr = () => {
    setStep('confirm');
  };

  const handleSubmitConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!totpCode || totpCode.length !== 6) {
      setTotpCodeError(true);
      return;
    }

    if (!registerData) {
      setError('Registration data not found');
      return;
    }

    try {
      setIsLoading(true);
      await onConfirmRegister(registerData.user_id, totpCode, masterKey);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (errorMessage.includes('Invalid TOTP code')) {
        setError(t('register.invalidTotpCode'));
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
        setError(t('register.networkError'));
      } else {
        setError(t('register.registerFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTotpCodeChange = (value: string) => {
    const filtered = value.replace(/\D/g, '').slice(0, 6);
    setTotpCode(filtered);
    if (filtered.length === 6) {
      setTotpCodeError(false);
    }
    if (error) setError('');
  };

  if (step === 'qr' && registerData) {
    return (
      <>
        <TopBar onBack={onBack} showBackButton={true} />
        <CenteredCard error={error} onErrorClose={() => setError('')}>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              width: '100%',
              fontSize: 'clamp(1.5rem, 8vw, 2rem)',
              textAlign: 'center',
              mb: 3,
            }}
          >
            {t('register.scanQrCode')}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
              <QRCodeSVG value={registerData.otpauth_url} size={200} />
            </Box>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              {t('register.scanWithAuthenticator')}
            </Typography>

            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('register.orEnterManually')}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={registerData.totp_secret}
                InputProps={{ readOnly: true }}
                variant="outlined"
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                  },
                }}
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={handleConfirmQr}
              sx={{ mt: 2 }}
            >
              {t('register.iHaveScanned')}
            </Button>
          </Box>
        </CenteredCard>
      </>
    );
  }

  if (step === 'confirm') {
    return (
      <>
        <TopBar onBack={() => setStep('qr')} showBackButton={true} />
        <CenteredCard error={error} onErrorClose={() => setError('')}>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              width: '100%',
              fontSize: 'clamp(1.5rem, 8vw, 2rem)',
              textAlign: 'center',
              mb: 3,
            }}
          >
            {t('register.enterTotpCode')}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmitConfirm}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 1 }}>
              {t('register.enterTotpCodeDesc')}
            </Typography>

            <TextField
              id="totpCode"
              name="totpCode"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              fullWidth
              variant="outlined"
              value={totpCode}
              error={totpCodeError}
              placeholder="000000"
              onChange={(e) => handleTotpCodeChange(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <QrCode2Icon sx={{ color: 'action.active', mr: 1 }} />,
                  style: { fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center' },
                },
              }}
              sx={{ mt: 1 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              disabled={isLoading || totpCode.length !== 6}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isLoading ? t('register.registering') : t('register.confirmAndRegister')}
            </Button>
          </Box>
        </CenteredCard>
      </>
    );
  }

  return (
    <>
      <TopBar onBack={onBack} />

      <CenteredCard error={error} onErrorClose={() => setError('')}>
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
          {t('register.signUp')}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmitStep1}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            id="username"
            name="username"
            type="text"
            label={t('register.username')}
            placeholder={t('register.usernamePlaceholder')}
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={username}
            error={usernameError}
            helperText={
              usernameErrorMessage ? (
                usernameErrorMessage
              ) : username.length > 0 && username.length < 3 ? (
                <Box
                  component="span"
                  sx={{
                    color: 'error.main'
                  }}
                >
                  {t('register.usernameMinLength')}
                </Box>
              ) : (
                ''
              )
            }
            onChange={(e) => {
              setUsername(e.target.value);
              if (e.target.value.length >= 3) {
                setUsernameError(false);
                setUsernameErrorMessage('');
              }
              if (error) setError('');
            }}
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
            label={t('register.masterKey')}
            placeholder={t('register.masterKeyPlaceholder')}
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={masterKey}
            error={masterKeyError}
            helperText={
              masterKeyError ? (
                <span>
                  {masterKeyErrorMessage}
                </span>
              ) : masterKey.length === 0 ? (
                <span>
                  {t('register.keyToConfirmAccess')}
                </span>
              ) : masterKey.length < 6 ? (
                <Box
                  component="span"
                  sx={{
                    color: 'error.main'
                  }}
                >
                  {masterKeyStrength.label}
                </Box>
              ) : (
                <Box
                  component="span"
                  sx={{
                    color: getColor(masterKeyStrength.color)
                  }}
                >
                  {masterKeyStrength.label}
                  <Tooltip title={t('register.specificChars')}>
                    <InfoOutlined
                      sx={{
                        fontSize: 14,
                        ml: 1,
                        verticalAlign: 'middle',
                        cursor: 'help',
                        color: 'action.active',
                      }}
                    />
                  </Tooltip>
                </Box>
              )
            }
            onChange={(e) => {
              setMasterKey(e.target.value);
              
              if (e.target.value.length === 0) {
                setMasterKeyStrength({ label: '', color: 'error' });
                setMasterKeyError(false);
                setMasterKeyErrorMessage('');
              } else {
                setMasterKeyStrength(getStrength(e.target.value));
                if (e.target.value.length >= 6) {
                  setMasterKeyError(false);
                  setMasterKeyErrorMessage('');
                }
              }
              
              if (confirmMasterKey && !confirmMasterKeyError) {
                validateConfirmMasterKey(confirmMasterKey);
              }
              if (error) setError('');
            }}
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
            sx={{ mt: 1 }}
          />

          <TextField
            id="confirmMasterKey"
            name="confirmMasterKey"
            type={showConfirmMasterKey ? 'text' : 'password'}
            label={t('register.confirmMasterKey')}
            placeholder={t('register.confirmMasterKeyPlaceholder')}
            autoComplete="off"
            fullWidth
            variant="outlined"
            value={confirmMasterKey}
            error={confirmMasterKeyError}
            helperText={confirmMasterKeyErrorMessage}
            onChange={(e) => {
              setConfirmMasterKey(e.target.value);
              if (e.target.value.length === 0 || e.target.value === masterKey) {
                setConfirmMasterKeyError(false);
                setConfirmMasterKeyErrorMessage('');
              } else {
                setConfirmMasterKeyError(true);
                setConfirmMasterKeyErrorMessage(t('register.masterKeysDoNotMatch'));
              }
              if (error) setError('');
            }}
            slotProps={{
              input: {
                startAdornment: <KeyIcon sx={{ color: 'action.active', mr: 1 }} />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm master key visibility"
                      onClick={() => setShowConfirmMasterKey(!showConfirmMasterKey)}
                      edge="end"
                    >
                      {showConfirmMasterKey ? <VisibilityOff /> : <Visibility />}
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
            {isLoading ? t('register.registering') : t('register.registerBtn')}
          </Button>
        </Box>
      </CenteredCard>
    </>
  );
}

export default RegisterView;