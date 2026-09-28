import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Account, Provider, AppSettings } from '../types/account';
import { loadAccounts, saveAccounts, loadSettings, saveSettings } from '../utils/storage';
import { isTimerExpired, getTimerStatus } from '../utils/timer';
import { applyTheme } from '../utils/theme';
import { useNotifications } from './useNotifications';

export function useAccounts() {
  const [accounts, setAccountsState] = useState<Account[]>(() => loadAccounts());
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings());

  // Apply and listen to theme changes
  useEffect(() => {
    applyTheme(settings.theme);

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [settings.theme]);

  // Persist accounts whenever they change
  useEffect(() => {
    saveAccounts(accounts);
  }, [accounts]);

  // Persist settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Run notification scheduler
  useNotifications(accounts, settings.notifications);

  const setAccounts = useCallback((updater: Account[] | ((prev: Account[]) => Account[])) => {
    setAccountsState(updater);
  }, []);

  const addAccount = useCallback(
    (email: string, providers: Pick<Provider, 'name' | 'enabled' | 'defaultDurationMinutes'>[]) => {
      const now = new Date().toISOString();
      const account: Account = {
        id: uuidv4(),
        email,
        providers: providers.map((p) => ({
          id: uuidv4(),
          name: p.name,
          enabled: p.enabled,
          defaultDurationMinutes: p.defaultDurationMinutes,
        })),
        createdAt: now,
        updatedAt: now,
      };
      setAccountsState((prev) => [...prev, account]);
      return account;
    },
    []
  );

  const updateAccount = useCallback(
    (id: string, updates: Partial<Pick<Account, 'email' | 'providers'>>) => {
      setAccountsState((prev) =>
        prev.map((acc) => {
          if (acc.id !== id) return acc;
          return {
            ...acc,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    []
  );

  const deleteAccount = useCallback((id: string) => {
    setAccountsState((prev) => prev.filter((acc) => acc.id !== id));
  }, []);

  const updateProvider = useCallback(
    (accountId: string, providerId: string, updates: Partial<Provider>) => {
      setAccountsState((prev) =>
        prev.map((acc) => {
          if (acc.id !== accountId) return acc;
          return {
            ...acc,
            providers: acc.providers.map((p) => {
              if (p.id !== providerId) return p;
              return { ...p, ...updates };
            }),
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    []
  );

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Stats
  const stats = {
    total: accounts.length,
    ready: accounts.filter((a) =>
      a.providers.filter((p) => p.enabled).every((p) => !p.timer || isTimerExpired(p.timer))
    ).length,
    active: accounts.filter((a) =>
      a.providers.filter((p) => p.enabled).some((p) => p.timer && !isTimerExpired(p.timer))
    ).length,
    expiringSoon: accounts.filter((a) =>
      a.providers
        .filter((p) => p.enabled)
        .some(
          (p) =>
            p.timer &&
            !isTimerExpired(p.timer) &&
            (getTimerStatus(p.timer) === 'expiring-soon' || getTimerStatus(p.timer) === 'almost-ready')
        )
    ).length,
  };

  return {
    accounts,
    setAccounts,
    settings,
    addAccount,
    updateAccount,
    deleteAccount,
    updateProvider,
    updateSettings,
    stats,
  };
}
