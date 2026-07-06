import { useEffect, useState } from 'react';
import { fetchAllLinkClicks, subscribeToLinkClicks } from '../lib/guestsApi.js';

export function useLinkClicks(active) {
  const [clicks, setClicks] = useState([]);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    fetchAllLinkClicks().then((data) => {
      if (!cancelled) setClicks(data);
    });
    const unsubscribe = subscribeToLinkClicks(() => {
      fetchAllLinkClicks().then((data) => {
        if (!cancelled) setClicks(data);
      });
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [active]);

  return clicks;
}
