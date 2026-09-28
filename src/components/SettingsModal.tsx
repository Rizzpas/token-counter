import { useState, useRef } from 'react';
import type { AppSettings } from '../types/account';
import { exportData, importData, clearAllData } from '../utils/storage';
import type { Account } from '../types/account';
import { ConfirmDialog } from './ConfirmDialog';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  accounts: Account[];
  onImport: (accounts: Account[], settings: AppSettings) => void;
  onClearAll: () => void;
};

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  accounts,
  onImport,
  onClearAll,
}: Props) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportData(accounts, settings);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importData(file);
      onImport(data.accounts, data.settings);
      setImportError('');
      onClose();
    } catch (err: any) {
      setImportError(err.message || 'Failed to import data');
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNotificationToggle = async (key: string, value: boolean) => {
    if (key === 'enabled' && value) {
      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          return;
        }
      }
    }
    onUpdateSettings({
      notifications: { ...settings.notifications, [key]: value },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-zinc-100">Settings</h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Appearance */}
        <section className="mb-6">
          <h4 className="text-sm font-semibold text-zinc-300 mb-3">
            Appearance
          </h4>
          <div className="space-y-2">
            {(['dark', 'light', 'system'] as const).map((theme) => (
              <label
                key={theme}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="theme"
                  checked={settings.theme === theme}
                  onChange={() => onUpdateSettings({ theme })}
                  className="w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 focus:ring-blue-500/40 focus:ring-offset-0"
                />
                <span className="text-sm text-zinc-300 capitalize">
                  {theme}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Notifications */}
        <section className="mb-6">
          <h4 className="text-sm font-semibold text-zinc-300 mb-3">
            Notifications
          </h4>
          <div className="space-y-2">
            {[
              { key: 'enabled', label: 'Enable notifications' },
              { key: 'notifyOnReady', label: 'Notify when an account becomes READY' },
              { key: 'notify24h', label: 'Notify 24 hours before reset' },
              { key: 'notify6h', label: 'Notify 6 hours before reset' },
              { key: 'notify1h', label: 'Notify 1 hour before reset' },
            ].map(({ key, label }) => (
              <label
                key={key}
                className={`flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 cursor-pointer transition-colors ${
                  key !== 'enabled' && !settings.notifications.enabled
                    ? 'opacity-40 pointer-events-none'
                    : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={
                    settings.notifications[
                      key as keyof typeof settings.notifications
                    ] as boolean
                  }
                  onChange={(e) =>
                    handleNotificationToggle(key, e.target.checked)
                  }
                  className="w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500/40 focus:ring-offset-0"
                />
                <span className="text-sm text-zinc-300">{label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Data */}
        <section>
          <h4 className="text-sm font-semibold text-zinc-300 mb-3">Data</h4>
          <div className="space-y-2">
            <button
              onClick={handleExport}
              className="w-full px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 rounded-lg transition-colors text-left"
            >
              Export Data
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 rounded-lg transition-colors text-left"
            >
              Import Data
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            {importError && (
              <p className="text-xs text-red-400 px-1">{importError}</p>
            )}
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full px-4 py-2 text-sm font-medium text-red-400 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 rounded-lg transition-colors text-left"
            >
              Clear All Data
            </button>
          </div>
        </section>

        <ConfirmDialog
          isOpen={showClearConfirm}
          onClose={() => setShowClearConfirm(false)}
          title="Clear all data?"
          message="This will permanently remove all locally stored accounts and timers."
          confirmLabel="Clear Everything"
          confirmVariant="danger"
          onConfirm={() => {
            clearAllData();
            onClearAll();
          }}
        />
      </div>
    </div>
  );
}
