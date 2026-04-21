import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../../types/user';
import { useBackend } from '../../hooks/core/useBackend';
import { useSession } from './SessionContext';

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingContent: boolean;
  login: (username: string, password: string, masterKey?: string) => Promise<void>;
  register: (username: string, password: string, masterKey: string) => Promise<void>;
  recoverPassword: (username: string, masterKey: string, newPassword: string) => Promise<void>;
  changePassword: (masterKey: string, newPassword: string) => Promise<void>;
  deleteAccount: (masterKey: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  setIsLoadingContent: (loading: boolean) => void;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const { invoke } = useBackend();
  const { clearSession } = useSession();

  useEffect(() => {
    const masterKey = localStorage.getItem('masterKey');
    if (masterKey) {
      setIsLoadingContent(true);
    }
  }, []);

  const login = async (username: string, password: string, masterKey?: string) => {
    const userWithoutAvatar = await invoke<User>('login', { username, password, masterKey: masterKey || '' });
    
    setUser(userWithoutAvatar);
    
    if (masterKey) {
      localStorage.setItem('masterKey', masterKey);
      setIsLoadingContent(true);
    }
  };

  const register = async (username: string, password: string, masterKey: string) => {
    const user = await invoke<User>('register', { username, password, masterKey });
    setUser(user);
    localStorage.setItem('masterKey', masterKey);
    setIsLoadingContent(true);
  };

  const recoverPassword = async (username: string, masterKey: string, newPassword: string) => {
    await invoke('recover_password', { username, masterKey, newPassword });
  };

  const changePassword = async (masterKey: string, newPassword: string) => {
    if (user) {
      await invoke('change_password', { userId: user.id, masterKey, newPassword });
    }
  };

  const deleteAccount = async (masterKey: string) => {
    if (user) {
      await invoke('delete_user', { userId: user.id, masterKey });
      logout();
    }
  };

  const logout = () => {
    if (user) {
      clearSession(user.id);
    }
    setUser(null);
    setIsLoadingContent(false);
    localStorage.removeItem('masterKey');
  };

  function parseAvatarToBytes(avatar: string | null): number[] | null {
    if (!avatar) return null;
    
    if (avatar.startsWith('data:image/svg+xml;utf-8,')) {
      const encoded = avatar.split(',')[1];
      const decoded = decodeURIComponent(encoded);
      return Array.from(new TextEncoder().encode(decoded));
    } else {
      const base64Data = avatar.split(',')[1];
      if (!base64Data) return null;
      try {
        return Array.from(Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)));
      } catch {
        return Array.from(new TextEncoder().encode(atob(base64Data)));
      }
    }
  }

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      if (updates.avatar !== undefined) {
        const avatarBytes = parseAvatarToBytes(updates.avatar);
        await invoke('update_avatar', {
          userId: user.id,
          avatar: avatarBytes,
        });
      }
      setUser({ ...user, ...updates });
    }
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated: !!user, isLoadingContent, login, register, recoverPassword, changePassword, deleteAccount, logout, updateUser, setIsLoadingContent, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
