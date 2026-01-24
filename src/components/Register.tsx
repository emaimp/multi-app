import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface RegisterProps {
  onRegister: (user: any) => void;
  onBack: () => void;
}

function Register({ onRegister, onBack }: RegisterProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const user = await invoke('register', { username, password, masterKey });
      onRegister(user);
    } catch (err) {
      setError(err as string);
    }
  };

  return (
    <div>
      <h2>Register</h2>
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Master Key"
          value={masterKey}
          onChange={(e) => setMasterKey(e.target.value)}
          required
        />
        <p style={{ fontSize: 'small', color: 'gray' }}>Master key is required for password recovery and changes.</p>
        <button type="submit">Register</button>
      </form>
      <button onClick={onBack}>Back to Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Register;