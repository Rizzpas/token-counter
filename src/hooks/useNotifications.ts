import { useEffect, useRef } from 'react';
import type { Account, NotificationSettings } from '../types/account';
import { getRemainingMs } from '../utils/timer';

export function useNotifications(
  accounts: Account[],
  settings: NotificationSettings
) {
  // Store sent notifications as a Set of keys: `${providerId}_${resetAt}_${milestone}`
  const notifiedKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!settings.enabled || typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission !== 'granted') {
      return;
    }

    const checkNotifications = () => {
      accounts.forEach((account) => {
        account.providers.forEach((provider) => {
          if (!provider.enabled || !provider.timer) return;

          const resetAt = provider.timer.resetAt;
          const remaining = getRemainingMs(provider.timer);

          // 1. Ready notification
          if (remaining <= 0) {
            const key = `${provider.id}_${resetAt}_ready`;
            if (settings.notifyOnReady && !notifiedKeys.current.has(key)) {
              notifiedKeys.current.add(key);
              new Notification(`Quota Ready: ${provider.name}`, {
                body: `${account.email}'s ${provider.name} quota is now 100% READY!`,
                icon: '/vite.svg',
              });
            }
            return;
          }

          const hoursRemaining = remaining / (1000 * 60 * 60);

          // 2. 1 hour warning
          if (hoursRemaining <= 1) {
            const key = `${provider.id}_${resetAt}_1h`;
            if (settings.notify1h && !notifiedKeys.current.has(key)) {
              notifiedKeys.current.add(key);
              new Notification(`Reset Warning: ${provider.name}`, {
                body: `${account.email}'s ${provider.name} quota will reset in less than 1 hour.`,
                icon: '/vite.svg',
              });
            }
          }
          // 3. 6 hour warning
          else if (hoursRemaining <= 6) {
            const key = `${provider.id}_${resetAt}_6h`;
            if (settings.notify6h && !notifiedKeys.current.has(key)) {
              notifiedKeys.current.add(key);
              new Notification(`Reset Reminder: ${provider.name}`, {
                body: `${account.email}'s ${provider.name} quota will reset in ~6 hours.`,
                icon: '/vite.svg',
              });
            }
          }
          // 4. 24 hour warning
          else if (hoursRemaining <= 24) {
            const key = `${provider.id}_${resetAt}_24h`;
            if (settings.notify24h && !notifiedKeys.current.has(key)) {
              notifiedKeys.current.add(key);
              new Notification(`Reset Reminder: ${provider.name}`, {
                body: `${account.email}'s ${provider.name} quota will reset in ~24 hours.`,
                icon: '/vite.svg',
              });
            }
          }
        });
      });
    };

    // Check periodically
    const timer = setInterval(checkNotifications, 5000);
    checkNotifications();

    return () => clearInterval(timer);
  }, [accounts, settings]);
}
