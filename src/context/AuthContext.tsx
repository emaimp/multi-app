import { ReactNode } from 'react';
import { SessionProvider } from './auth/SessionContext';
import { UserProvider } from './auth/UserContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </SessionProvider>
  );
}

export { useUser } from './auth/UserContext';
export { useSession } from './auth/SessionContext';
