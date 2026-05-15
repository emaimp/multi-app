import { createContext, useContext, ReactNode } from 'react';
import { useBackend } from '../../hooks/core/useBackend';

interface SessionContextType {
  initSession: (userId: number, accessKey: string) => Promise<void>;
  clearSession: (userId: number) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { invoke } = useBackend();

  const initSession = async (userId: number, accessKey: string) => {
    await invoke('init_session', { userId, access_key: accessKey });
  };

  const clearSession = async (userId: number) => {
    await invoke('logout', { userId });
  };

  return (
    <SessionContext.Provider value={{ initSession, clearSession }}>
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
