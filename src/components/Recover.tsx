import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface RecoverProps {
  onBack: () => void;
}

function Recover({ onBack }: RecoverProps) {
  const [username, setUsername] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await invoke('recover_password', { username, masterKey, newPassword });
      setSuccess('Password recovered successfully. You can now log in.');
      setError('');
    } catch (err) {
      setError(err as string);
      setSuccess('');
    }
  };

  return (
    <div>
      <h2>Recover Password</h2>
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
          placeholder="Master Key"
          value={masterKey}
          onChange={(e) => setMasterKey(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
        />
        <button type="submit">Recover Password</button>
      </form>
      <button onClick={onBack}>Back to Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
}

export default Recover;