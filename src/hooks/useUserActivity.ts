import { useState, useEffect, useCallback, useRef } from 'react';

type UserStatus = 'active' | 'inactive';

const INACTIVITY_TIMEOUT = 60 * 60 * 1000;

export function useUserActivity() {
  const [status, setStatus] = useState<UserStatus>('active');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetActivity = useCallback(() => {
    setStatus('active');

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setStatus('inactive');
    }, INACTIVITY_TIMEOUT);
  }, []);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      resetActivity();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    resetActivity();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [resetActivity]);

  return { status, resetActivity };
}

export default useUserActivity;
