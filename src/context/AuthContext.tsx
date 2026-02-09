import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, remember?: boolean) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
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
        }
      } catch (e) {
        localStorage.removeItem('rememberedUser');
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

  const login = (user: User, remember?: boolean) => {
    setUser(user);
    if (remember) {
      const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem('rememberedUser', JSON.stringify({ user, expiry }));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rememberedUser');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUser }}>
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
