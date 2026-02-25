import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../../types/user';
import { useBackend } from '../../hooks/useBackend';
import { useSession } from './SessionContext';

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingContent: boolean;
  login: (username: string, password: string, remember?: boolean, masterKey?: string) => Promise<void>;
  register: (username: string, password: string, masterKey: string) => Promise<void>;
  recoverPassword: (username: string, masterKey: string, newPassword: string) => Promise<void>;
  changePassword: (masterKey: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
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
    const remembered = localStorage.getItem('rememberedUser');
    const masterKey = localStorage.getItem('masterKey');
    if (remembered) {
      try {
        const { user: savedUser, expiry } = JSON.parse(remembered);
        if (Date.now() < expiry) {
          setUser(savedUser);
          if (masterKey) {
            setIsLoadingContent(true);
          }
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
    }
  }, [user]);

  const login = async (username: string, password: string, remember?: boolean, masterKey?: string) => {
    const userWithoutAvatar = await invoke<User>('login', { username, password, masterKey: masterKey || '' });
    
    setUser(userWithoutAvatar);
    
    if (masterKey) {
      localStorage.setItem('masterKey', masterKey);
      setIsLoadingContent(true);
    }
    
    if (remember) {
      const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
      const userToSave = { ...userWithoutAvatar, avatar: null };
      localStorage.setItem('rememberedUser', JSON.stringify({ user: userToSave, expiry }));
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

  const deleteAccount = async () => {
    if (user) {
      await invoke('delete_user', { userId: user.id });
      logout();
    }
  };

  const logout = () => {
    if (user) {
      clearSession(user.id);
    }
    setUser(null);
    setIsLoadingContent(false);
    localStorage.removeItem('rememberedUser');
    localStorage.removeItem('masterKey');
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      if (updates.avatar !== undefined) {
        if (updates.avatar === null) {
          await invoke('update_avatar', {
            userId: user.id,
            avatar: null,
          });
        } else if (updates.avatar) {
          const base64Data = updates.avatar.split(',')[1];
          const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          await invoke('update_avatar', {
            userId: user.id,
            avatar: Array.from(binaryData),
          });
        }
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
