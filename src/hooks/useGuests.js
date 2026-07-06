import { useEffect, useState, useCallback } from 'react';
import { fetchAllGuests, subscribeToGuests } from '../lib/guestsApi.js';

export function useGuests(active) {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const data = await fetchAllGuests();
    setGuests(data);
  }, []);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setLoading(true);
    fetchAllGuests().then((data) => {
      if (!cancelled) {
        setGuests(data);
        setLoading(false);
      }
    });
    const unsubscribe = subscribeToGuests(() => {
      fetchAllGuests().then((data) => {
        if (!cancelled) setGuests(data);
      });
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [active]);

  return { guests, loading, reload };
}
