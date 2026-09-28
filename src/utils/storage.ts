import type { Account, AppSettings } from '../types/account';

const ACCOUNTS_KEY = 'quotatrack_accounts';
const SETTINGS_KEY = 'quotatrack_settings';

export function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Account[];
  } catch {
    return [];
  }
}

export function saveAccounts(accounts: Account[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return getDefaultSettings();
    return JSON.parse(raw) as AppSettings;
  } catch {
    return getDefaultSettings();
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getDefaultSettings(): AppSettings {
  return {
    theme: 'dark',
    notifications: {
      enabled: false,
      notifyOnReady: true,
      notify24h: true,
      notify6h: true,
      notify1h: true,
    },
  };
}

export function exportData(accounts: Account[], settings: AppSettings): void {
  const data = { accounts, settings, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quotatrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(
  file: File
): Promise<{ accounts: Account[]; settings: AppSettings }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!data.accounts || !Array.isArray(data.accounts)) {
          reject(new Error('Invalid backup file: missing accounts array'));
          return;
        }
        resolve({
          accounts: data.accounts,
          settings: data.settings || getDefaultSettings(),
        });
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function clearAllData(): void {
  localStorage.removeItem(ACCOUNTS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}
