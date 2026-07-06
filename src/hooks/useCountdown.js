import { useEffect, useState } from 'react';

export function useCountdown(targetTs) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = targetTs - now;
  const isPast = diff <= 0;
  const d = Math.max(0, diff);
  return {
    isPast,
    isUpcoming: !isPast,
    days: String(Math.floor(d / 86400000)),
    hours: String(Math.floor((d % 86400000) / 3600000)).padStart(2, '0'),
    mins: String(Math.floor((d % 3600000) / 60000)).padStart(2, '0'),
    secs: String(Math.floor((d % 60000) / 1000)).padStart(2, '0'),
  };
}
