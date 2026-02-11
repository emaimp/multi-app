import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, remember?: boolean, masterKey?: string) => Promise<void>;
  register: (username: string, password: string, masterKey: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
      try {
        const { user: savedUser, expiry } = JSON.parse(remembered);
        if (Date.now() < expiry) {
          setUser(savedUser);
        } else {
          localStorage.removeItem('rememberedUser');
          localStorage.removeItem('masterKey');
        }
      } catch (e) {
        localStorage.removeItem('rememberedUser');
        localStorage.removeItem('masterKey');
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      const remembered = localStorage.getItem('rememberedUser');
      if (remembered) {
        try {
          const { expiry } = JSON.parse(remembered);
          localStorage.setItem('rememberedUser', JSON.stringify({ user, expiry }));
        } catch (e) {
          localStorage.setItem('rememberedUser', JSON.stringify({ user, expiry: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
        }
      }
      const masterKey = localStorage.getItem('masterKey');
      if (masterKey) {
        invoke('init_session', { userId: user.id, masterKey }).catch(console.error);
      }
    }
  }, [user]);

  const login = async (username: string, password: string, remember?: boolean, masterKey?: string) => {
    const user = await invoke<User>('login', { username, password });
    setUser(user);
    if (masterKey) {
      localStorage.setItem('masterKey', masterKey);
      await invoke('init_session', { userId: user.id, masterKey });
    }
    if (remember) {
      const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem('rememberedUser', JSON.stringify({ user, expiry }));
    }
  };

  const register = async (username: string, password: string, masterKey: string) => {
    const user = await invoke<User>('register', { username, password, masterKey });
    setUser(user);
    localStorage.setItem('masterKey', masterKey);
    await invoke('init_session', { userId: user.id, masterKey });
  };

  const logout = () => {
    if (user) {
      invoke('logout', { userId: user.id }).catch(console.error);
    }
    setUser(null);
    localStorage.removeItem('rememberedUser');
    localStorage.removeItem('masterKey');
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      if (updates.avatar) {
        const base64Data = updates.avatar.split(',')[1];
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        await invoke('update_avatar', {
          userId: user.id,
          avatar: Array.from(binaryData),
        });
      }
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
