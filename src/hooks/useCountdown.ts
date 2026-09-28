import { useState, useEffect } from 'react';

/**
 * Hook that returns the current time, updating every second.
 * Used to drive countdown displays without storing decrementing values.
 */
export function useCountdown(intervalMs = 1000): number {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
