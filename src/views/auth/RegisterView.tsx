import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RegisterForm } from './register';
import { MasterKeyView } from './masterKey/MasterKeyView';

interface RegisterViewProps {
  onRegister: (username: string, password: string) => Promise<string>;
  onBack: () => void;
}

function RegisterView({ onRegister, onBack }: RegisterViewProps) {
  const { t } = useTranslation();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({ label: '', color: 'error' as 'error' | 'warning' | 'success' });

  const [masterKey, setMasterKey] = useState('');
  const [view, setView] = useState<'form' | 'masterKey'>('form');

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

  const validatePassword = (value: string) => {
    if (!value || value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage(t('register.passwordMinLength'));
      return false;
    }
    setPasswordError(false);
    setPasswordErrorMessage('');
    return true;
  };

  const validateConfirmPassword = (value: string) => {
    if (value !== password) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage(t('register.passwordsDoNotMatch'));
      return false;
    }
    setConfirmPasswordError(false);
    setConfirmPasswordErrorMessage('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isUsernameValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    if (password !== confirmPassword) {
      setError(t('register.passwordsDoNotMatch'));
      return;
    }

    try {
      setIsLoading(true);
      const generatedMasterKey = await onRegister(username, password);
      setMasterKey(generatedMasterKey);
      setSuccess(t('register.registeredSuccessfully'));
      setView('masterKey');
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

  const handleSignUp = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setMasterKey('');
    setSuccess('');
    setView('form');
  };

  const handleSuccessClose = () => {
    setSuccess('');
  };

  if (view === 'masterKey') {
    return (
      <MasterKeyView
        masterKey={masterKey}
        isLoading={isLoading}
        success={success}
        onSuccessClose={handleSuccessClose}
        onSignUp={handleSignUp}
        onBack={() => setView('form')}
      />
    );
  }

  return (
    <RegisterForm
      username={username}
      password={password}
      confirmPassword={confirmPassword}
      usernameError={usernameError}
      usernameErrorMessage={usernameErrorMessage}
      passwordError={passwordError}
      passwordErrorMessage={passwordErrorMessage}
      confirmPasswordError={confirmPasswordError}
      confirmPasswordErrorMessage={confirmPasswordErrorMessage}
      passwordStrength={passwordStrength}
      showPassword={showPassword}
      showConfirmPassword={showConfirmPassword}
      isLoading={isLoading}
      error={error}
      onUsernameChange={setUsername}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onTogglePasswordVisibility={() => setShowPassword(!showPassword)}
      onToggleConfirmPasswordVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
      onPasswordStrengthChange={setPasswordStrength}
      onErrorChange={setError}
      onSubmit={handleSubmit}
      onBack={onBack}
    />
  );
}

export default RegisterView;