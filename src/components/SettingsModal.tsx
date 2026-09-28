import { useState, useRef } from 'react';
import type { AppSettings, Account } from '../types/account';
import { exportData, importData, clearAllData } from '../utils/storage';
import { ConfirmDialog } from './ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  Bell,
  Download,
  Upload,
  Trash2,
} from 'lucide-react';

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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNotificationToggle = async (key: string, value: boolean) => {
    if (key === 'enabled' && value) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-zinc-500" />
            <DialogTitle>Settings</DialogTitle>
          </div>
          <DialogDescription>
            Manage application appearance, alerts, and local backup data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          {/* Theme */}
          <div className="rounded-lg border border-zinc-200/80 p-3 dark:border-zinc-800/80">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Appearance
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'system', label: 'System', icon: Monitor },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onUpdateSettings({ theme: id as any })}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-md border p-2 text-center transition-all ${
                    settings.theme === id
                      ? 'border-zinc-900 bg-zinc-100 font-semibold text-zinc-900 dark:border-zinc-100 dark:bg-zinc-800 dark:text-zinc-50 shadow-2xs'
                      : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:hover:bg-zinc-800/50 dark:text-zinc-400'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-[11px]">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-lg border border-zinc-200/80 p-3 dark:border-zinc-800/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-zinc-500" />
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Browser Alerts
                </h4>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleNotificationToggle(
                    'enabled',
                    !settings.notifications.enabled
                  )
                }
                className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.notifications.enabled
                    ? 'bg-zinc-900 dark:bg-zinc-100'
                    : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white dark:bg-zinc-900 shadow-sm ring-0 transition duration-200 ease-in-out ${
                    settings.notifications.enabled ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div
              className={`space-y-1.5 pt-1 transition-opacity ${
                !settings.notifications.enabled ? 'opacity-40 pointer-events-none' : ''
              }`}
            >
              {[
                { key: 'notifyOnReady', label: 'Notify when quota becomes READY' },
                { key: 'notify24h', label: 'Notify 24 hours before reset' },
                { key: 'notify6h', label: 'Notify 6 hours before reset' },
                { key: 'notify1h', label: 'Notify 1 hour before reset' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-2 rounded px-1.5 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer text-[11px] text-zinc-700 dark:text-zinc-300"
                >
                  <input
                    type="checkbox"
                    checked={
                      settings.notifications[
                        key as keyof typeof settings.notifications
                      ] as boolean
                    }
                    onChange={(e) => handleNotificationToggle(key, e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Backup & Data */}
          <div className="rounded-lg border border-zinc-200/80 p-3 dark:border-zinc-800/80">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Data Management
            </h4>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Button
                variant="outline"
                size="xs"
                onClick={handleExport}
                className="h-7 text-[11px] justify-center"
              >
                <Download className="h-3 w-3 mr-1" />
                Export JSON
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => fileInputRef.current?.click()}
                className="h-7 text-[11px] justify-center"
              >
                <Upload className="h-3 w-3 mr-1" />
                Import JSON
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            {importError && (
              <p className="text-[11px] text-red-500 mb-2">{importError}</p>
            )}

            <Button
              variant="destructive"
              size="xs"
              onClick={() => setShowClearConfirm(true)}
              className="w-full h-7 text-[11px] justify-center"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All Stored Data
            </Button>
          </div>
        </div>

        <ConfirmDialog
          isOpen={showClearConfirm}
          onClose={() => setShowClearConfirm(false)}
          title="Clear all stored data?"
          message="This will permanently remove all accounts, timers, and preferences from this browser."
          confirmLabel="Clear Everything"
          confirmVariant="danger"
          onConfirm={() => {
            clearAllData();
            onClearAll();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
