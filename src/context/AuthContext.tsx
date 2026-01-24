import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  password_hash: string;
  master_key_hash: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, remember?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for remembered session
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

  const login = (user: User, remember?: boolean) => {
    setUser(user);
    if (remember) {
      const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
      localStorage.setItem('rememberedUser', JSON.stringify({ user, expiry }));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rememberedUser');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
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