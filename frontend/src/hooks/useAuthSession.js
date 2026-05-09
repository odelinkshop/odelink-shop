import { useEffect, useState } from 'react';
import { getAuthSnapshot, hydrateAuthSessionFromServer, subscribeToAuthChanges } from '../utils/authStorage';

export default function useAuthSession() {
  const [snapshot, setSnapshot] = useState(() => getAuthSnapshot());
  const [ready, setReady] = useState(() => Boolean(getAuthSnapshot().token));

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = subscribeToAuthChanges((nextSnapshot) => {
      if (!cancelled) setSnapshot(nextSnapshot);
    });

    const bootstrap = async () => {
      const initial = getAuthSnapshot();
      if (!cancelled) setSnapshot(initial);

      // If user is not logged in (no token), do not call session endpoint.
      // This prevents repeated 401 noise on public/non-auth routes.
      if (!initial?.token) {
        setReady(true);
        return;
      }

      const restored = await hydrateAuthSessionFromServer();
      if (cancelled) return;

      if (restored) {
        setSnapshot(restored);
      } else {
        setSnapshot(getAuthSnapshot());
      }
      setReady(true);
    };

    bootstrap();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return {
    ...snapshot,
    ready
  };
}
