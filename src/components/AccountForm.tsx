import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Account, DEFAULT_PROVIDERS } from '../types/account';
import { DEFAULT_PROVIDERS as PROVIDERS } from '../types/account';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Mail, Plus, Trash2, UserPlus } from 'lucide-react';

type ProviderForm = {
  id: string;
  name: string;
  enabled: boolean;
  defaultDurationMinutes: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, providers: ProviderForm[]) => void;
  editAccount?: Account;
};

export function AccountForm({ isOpen, onClose, onSubmit, editAccount }: Props) {
  const [email, setEmail] = useState('');
  const [providers, setProviders] = useState<ProviderForm[]>([]);
  const [customProviderName, setCustomProviderName] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editAccount) {
        setEmail(editAccount.email);
        setProviders(
          editAccount.providers.map((p) => ({
            id: p.id,
            name: p.name,
            enabled: p.enabled,
            defaultDurationMinutes: p.defaultDurationMinutes,
          }))
        );
      } else {
        setEmail('');
        setProviders(
          PROVIDERS.map((p) => ({
            id: uuidv4(),
            name: p.name,
            enabled: true,
            defaultDurationMinutes: p.defaultDurationMinutes,
          }))
        );
      }
      setCustomProviderName('');
    }
  }, [isOpen, editAccount]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onSubmit(email.trim(), providers);
    onClose();
  };

  const toggleProvider = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const updateDuration = (id: string, value: string) => {
    const minutes = parseInt(value, 10);
    if (!isNaN(minutes)) {
      setProviders((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, defaultDurationMinutes: minutes } : p
        )
      );
    }
  };

  const addCustomProvider = () => {
    if (!customProviderName.trim()) return;
    setProviders((prev) => [
      ...prev,
      {
        id: uuidv4(),
        name: customProviderName.trim(),
        enabled: true,
        defaultDurationMinutes: 7 * 24 * 60,
      },
    ]);
    setCustomProviderName('');
  };

  const removeProvider = (id: string) => {
    setProviders((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-blue-500" />
            <DialogTitle>{editAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
          </div>
          <DialogDescription>
            {editAccount
              ? 'Update account email and provider configuration.'
              : 'Add an AI account to track its quota and reset timers.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              <Mail className="h-3 w-3 text-zinc-400" />
              Account Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. developer@company.com"
              className="h-8"
              required
              autoFocus
            />
          </div>

          {/* Providers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Providers & Default Cycles
              </label>
              <span className="text-[11px] text-zinc-400">
                {providers.filter((p) => p.enabled).length} enabled
              </span>
            </div>

            <div className="space-y-2">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className={`rounded-lg border p-2.5 transition-colors ${
                    provider.enabled
                      ? 'border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/50'
                      : 'border-zinc-200/60 bg-zinc-100/50 opacity-50 dark:border-zinc-800/40 dark:bg-zinc-900/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {provider.name}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Switch */}
                      <button
                        type="button"
                        onClick={() => toggleProvider(provider.id)}
                        className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          provider.enabled ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300 dark:bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white dark:bg-zinc-900 shadow-sm ring-0 transition duration-200 ease-in-out ${
                            provider.enabled ? 'translate-x-3' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      {!PROVIDERS.some((dp) => dp.name === provider.name) && (
                        <button
                          type="button"
                          onClick={() => removeProvider(provider.id)}
                          className="text-zinc-400 hover:text-red-500 transition-colors p-0.5"
                          title="Remove custom provider"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {provider.enabled && (
                    <div className="mt-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-zinc-500">Default Reset Duration:</span>
                      <select
                        value={provider.defaultDurationMinutes}
                        onChange={(e) => updateDuration(provider.id, e.target.value)}
                        className="h-6 rounded border border-zinc-200 bg-white px-2 text-[11px] text-zinc-800 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                      >
                        <option value={60}>1 hour</option>
                        <option value={360}>6 hours</option>
                        <option value={720}>12 hours</option>
                        <option value={1440}>1 day</option>
                        <option value={2880}>2 days</option>
                        <option value={4320}>3 days</option>
                        <option value={10080}>7 days</option>
                        <option value={20160}>14 days</option>
                        <option value={43200}>30 days</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Custom Provider */}
            <div className="mt-2.5 flex gap-1.5">
              <Input
                type="text"
                value={customProviderName}
                onChange={(e) => setCustomProviderName(e.target.value)}
                placeholder="Custom provider name (e.g. GPT, Codex)"
                className="h-7 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomProvider();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={addCustomProvider}
                disabled={!customProviderName.trim()}
                className="h-7 px-2.5 shrink-0"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {editAccount ? 'Save Changes' : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
