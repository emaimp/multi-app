import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/AuthContext';
import RegisterView from './RegisterView';
import { LoginForm } from './login';

function LoginView() {
  const { t } = useTranslation();
  const { login, register } = useUser();

  const [view, setView] = useState<'login' | 'register'>('login');

  const [username, setUsername] = useState('');
  const [masterKey, setMasterKey] = useState('');

  const [usernameError, setUsernameError] = useState(false);
  const [usernameNotFoundError, setUsernameNotFoundError] = useState(false);
  const [masterKeyError, setMasterKeyError] = useState(false);
  const [masterKeyInvalidError, setMasterKeyInvalidError] = useState(false);

  const [showMasterKey, setShowMasterKey] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setUsername('');
    setMasterKey('');
    setUsernameError(false);
    setUsernameNotFoundError(false);
    setMasterKeyError(false);
    setMasterKeyInvalidError(false);
    setError('');
  }, [view]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      await login(username, masterKey);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (errorMessage.includes('User not found')) {
        setUsernameNotFoundError(true);
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
    await register(username, masterKey);
  };

  if (view === 'register') {
    return (
      <RegisterView 
        onRegister={handleRegister}
        onBack={() => setView('login')} 
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
      onSubmit={handleSubmit}
      onBack={() => {}}
      onNavigateToRegister={() => setView('register')}
    />
  );
}

export default LoginView;