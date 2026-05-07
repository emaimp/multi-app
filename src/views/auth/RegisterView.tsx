import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RegisterStep1Response } from '../../context/auth/UserContext';
import { RegisterForm, RegisterQR, RegisterConfirm } from './register';

interface RegisterViewProps {
  onRegister: (username: string, masterKey: string) => Promise<RegisterStep1Response>;
  onConfirmRegister: (username: string, totpCode: string, masterKey: string) => Promise<void>;
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
      await onConfirmRegister(username, totpCode, masterKey);
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

  if (step === 'qr' && registerData) {
    return (
      <RegisterQR
        totpSecret={registerData.totp_secret}
        otpauthUrl={registerData.otpauth_url}
        onNext={handleConfirmQr}
        onBack={() => setStep('form')}
      />
    );
  }

  if (step === 'confirm') {
    return (
      <RegisterConfirm
        totpCode={totpCode}
        totpCodeError={totpCodeError}
        isLoading={isLoading}
        error={error}
        onTotpCodeChange={setTotpCode}
        onTotpCodeErrorChange={setTotpCodeError}
        onErrorChange={setError}
        onSubmit={handleSubmitConfirm}
        onBack={() => setStep('qr')}
      />
    );
  }

  return (
    <RegisterForm
      username={username}
      masterKey={masterKey}
      confirmMasterKey={confirmMasterKey}
      usernameError={usernameError}
      usernameErrorMessage={usernameErrorMessage}
      masterKeyError={masterKeyError}
      masterKeyErrorMessage={masterKeyErrorMessage}
      confirmMasterKeyError={confirmMasterKeyError}
      confirmMasterKeyErrorMessage={confirmMasterKeyErrorMessage}
      masterKeyStrength={masterKeyStrength}
      showMasterKey={showMasterKey}
      showConfirmMasterKey={showConfirmMasterKey}
      isLoading={isLoading}
      error={error}
      onUsernameChange={setUsername}
      onMasterKeyChange={setMasterKey}
      onConfirmMasterKeyChange={setConfirmMasterKey}
      onToggleMasterKeyVisibility={() => setShowMasterKey(!showMasterKey)}
      onToggleConfirmMasterKeyVisibility={() => setShowConfirmMasterKey(!showConfirmMasterKey)}
      onMasterKeyStrengthChange={setMasterKeyStrength}
      onErrorChange={setError}
      onSubmit={handleSubmitStep1}
      onBack={onBack}
    />
  );
}

export default RegisterView;