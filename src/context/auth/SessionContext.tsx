import { createContext, useContext, useState, ReactNode } from 'react';
import { useBackend } from '../../hooks/useBackend';

interface SessionContextType {
  hasSession: boolean;
  initSession: (userId: number, masterKey: string) => Promise<void>;
  clearSession: (userId: number) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { invoke } = useBackend();
  const [hasSession, setHasSession] = useState(false);

  const initSession = async (userId: number, masterKey: string) => {
    await invoke('init_session', { userId, masterKey });
    setHasSession(true);
  };

  const clearSession = async (userId: number) => {
    await invoke('logout', { userId });
    setHasSession(false);
  };

  return (
    <SessionContext.Provider value={{ hasSession, initSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
