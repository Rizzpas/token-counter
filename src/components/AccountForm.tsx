import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Account, Provider, DEFAULT_PROVIDERS } from '../types/account';
import { DEFAULT_PROVIDERS as PROVIDERS } from '../types/account';

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
      prev.map((p) =>
        p.id === id ? { ...p, enabled: !p.enabled } : p
      )
    );
  };

  const updateDuration = (id: string, value: string) => {
    const minutes = parseDurationInput(value);
    if (minutes !== null) {
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

  const getDurationDisplay = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = minutes / 60;
    if (hours < 24) return `${hours}h`;
    return `${hours / 24}d`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">
          {editAccount ? 'Edit Account' : 'Add Account'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mike@gmail.com"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700/50 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              required
            />
          </div>

          {/* Providers */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-3">
              Providers
            </label>
            <div className="space-y-3">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    provider.enabled
                      ? 'bg-zinc-800/50 border-zinc-700/50'
                      : 'bg-zinc-900/30 border-zinc-800/30 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-zinc-200">
                      {provider.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleProvider(provider.id)}
                        className={`relative w-9 h-5 rounded-full transition-colors ${
                          provider.enabled ? 'bg-blue-600' : 'bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                            provider.enabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      {/* Only show remove for custom (non-default) providers */}
                      {!PROVIDERS.some((dp) => dp.name === provider.name) && (
                        <button
                          type="button"
                          onClick={() => removeProvider(provider.id)}
                          className="text-zinc-600 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  {provider.enabled && (
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">
                        Default duration
                      </label>
                      <select
                        value={provider.defaultDurationMinutes}
                        onChange={(e) =>
                          updateDuration(provider.id, e.target.value)
                        }
                        className="w-full px-2 py-1.5 bg-zinc-700/50 border border-zinc-600/50 rounded text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
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
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={customProviderName}
                onChange={(e) => setCustomProviderName(e.target.value)}
                placeholder="Add custom provider..."
                className="flex-1 px-3 py-1.5 bg-zinc-800 border border-zinc-700/50 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomProvider();
                  }
                }}
              />
              <button
                type="button"
                onClick={addCustomProvider}
                disabled={!customProviderName.trim()}
                className="px-3 py-1.5 text-sm font-medium text-blue-400 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {editAccount ? 'Save Changes' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function parseDurationInput(value: string): number | null {
  const num = parseInt(value, 10);
  return isNaN(num) ? null : num;
}
