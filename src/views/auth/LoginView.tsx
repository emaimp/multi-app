import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/AuthContext';
import RegisterView from './RegisterView';
import { LoginForm, LoginTOTPView } from './login';

function LoginView() {
  const { t } = useTranslation();
  const { login, register, confirmRegister } = useUser();

  const [view, setView] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'form' | 'totp'>('form');

  const [username, setUsername] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [masterKey, setMasterKey] = useState('');

  const [usernameError, setUsernameError] = useState(false);
  const [usernameNotFoundError, setUsernameNotFoundError] = useState(false);
  const [totpCodeError, setTotpCodeError] = useState(false);
  const [totpCodeInvalidError, setTotpCodeInvalidError] = useState(false);
  const [masterKeyError, setMasterKeyError] = useState(false);
  const [masterKeyInvalidError, setMasterKeyInvalidError] = useState(false);

  const [showMasterKey, setShowMasterKey] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setUsername('');
    setTotpCode('');
    setMasterKey('');
    setUsernameError(false);
    setUsernameNotFoundError(false);
    setTotpCodeError(false);
    setTotpCodeInvalidError(false);
    setMasterKeyError(false);
    setMasterKeyInvalidError(false);
    setError('');
    setStep('form');
  }, [view]);

  const handleSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();

    let isValid = true;

    if (!username || username.length < 3) {
      setUsernameError(true);
      isValid = false;
    } else {
      setUsernameError(false);
    }

    if (!masterKey || masterKey.length < 1) {
      setMasterKeyError(true);
      isValid = false;
    } else {
      setMasterKeyError(false);
    }

    if (!isValid) {
      return;
    }

    try {
      setIsLoading(true);
      await login(username, '000000', masterKey);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (errorMessage.includes('User not found')) {
        setUsernameNotFoundError(true);
      } else if (errorMessage.includes('Invalid master key')) {
        setMasterKeyInvalidError(true);
      } else if (errorMessage.includes('Invalid TOTP code') || errorMessage.includes('locked')) {
        setStep('totp');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
        setError(t('login.networkError'));
      } else {
        setError(t('login.loginFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitStep2 = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!totpCode || totpCode.length !== 6) {
      setTotpCodeError(true);
      return;
    }

    try {
      setIsLoading(true);
      await login(username, totpCode, masterKey);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (errorMessage.includes('User not found')) {
        setUsernameNotFoundError(true);
      } else if (errorMessage.includes('Invalid TOTP code') || errorMessage.includes('locked')) {
        setTotpCodeInvalidError(true);
      } else if (errorMessage.includes('Invalid master key')) {
        setMasterKeyInvalidError(true);
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
        setError(t('login.networkError'));
      } else {
        setError(t('login.loginFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (username: string, masterKey: string) => {
    return await register(username, masterKey);
  };

  const handleConfirmRegister = async (username: string, totpCode: string, masterKey: string) => {
    await confirmRegister(username, totpCode, masterKey);
  };

  if (view === 'register') {
    return (
      <RegisterView 
        onRegister={handleRegister} 
        onConfirmRegister={handleConfirmRegister}
        onBack={() => setView('login')} 
      />
    );
  }

  if (step === 'totp') {
    return (
      <LoginTOTPView
        username={username}
        totpCode={totpCode}
        totpCodeError={totpCodeError}
        totpCodeInvalidError={totpCodeInvalidError}
        isLoading={isLoading}
        error={error}
        onTotpCodeChange={setTotpCode}
        onTotpCodeErrorChange={setTotpCodeError}
        onTotpCodeInvalidErrorChange={setTotpCodeInvalidError}
        onErrorChange={setError}
        onSubmit={handleSubmitStep2}
        onBack={() => setStep('form')}
      />
    );
  }

  return (
    <LoginForm
      username={username}
      masterKey={masterKey}
      usernameError={usernameError}
      usernameNotFoundError={usernameNotFoundError}
      masterKeyError={masterKeyError}
      masterKeyInvalidError={masterKeyInvalidError}
      showMasterKey={showMasterKey}
      isLoading={isLoading}
      error={error}
      onUsernameChange={setUsername}
      onMasterKeyChange={setMasterKey}
      onToggleMasterKeyVisibility={() => setShowMasterKey(!showMasterKey)}
      onUsernameErrorChange={setUsernameError}
      onUsernameNotFoundErrorChange={setUsernameNotFoundError}
      onMasterKeyErrorChange={setMasterKeyError}
      onMasterKeyInvalidErrorChange={setMasterKeyInvalidError}
      onErrorChange={setError}
      onSubmit={handleSubmitStep1}
      onBack={() => {}}
      onNavigateToRegister={() => setView('register')}
    />

  );
}

export default LoginView;