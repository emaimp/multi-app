import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import Register from './Register';
import Recover from './Recover';

interface LoginProps {
  onLogin: (user: any, remember?: boolean) => void;
}

function Login({ onLogin }: LoginProps) {
  const [view, setView] = useState<'login' | 'register' | 'recover'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await invoke('login', { username, password });
      onLogin(user, rememberMe);
    } catch (err) {
      setError(err as string);
    }
  };

  if (view === 'register') {
    return <Register onRegister={(user) => onLogin(user)} onBack={() => setView('login')} />;
  }

  if (view === 'recover') {
    return <Recover onBack={() => setView('login')} />;
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember me
        </label>
        <button type="submit">Login</button>
      </form>
      <button onClick={() => setView('register')}>Go to Register</button>
      <button onClick={() => setView('recover')}>Forgot Password?</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Login;