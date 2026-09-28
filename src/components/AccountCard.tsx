import { useState, useRef, useEffect } from 'react';
import type { Account, Provider } from '../types/account';
import { ProviderCard } from './ProviderCard';
import { AccountForm } from './AccountForm';
import { ConfirmDialog } from './ConfirmDialog';

type Props = {
  account: Account;
  onUpdateProvider: (providerId: string, updates: Partial<Provider>) => void;
  onUpdateAccount: (updates: Partial<Pick<Account, 'email' | 'providers'>>) => void;
  onDelete: () => void;
};

export function AccountCard({
  account,
  onUpdateProvider,
  onUpdateAccount,
  onDelete,
}: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

  const enabledProviders = account.providers.filter((p) => p.enabled);

  const handleEditSubmit = (email: string, providers: any[]) => {
    // Preserve existing timer data when editing
    const updatedProviders = providers.map((p) => {
      const existing = account.providers.find((ep) => ep.id === p.id);
      return {
        ...p,
        timer: existing?.timer,
      };
    });
    onUpdateAccount({ email, providers: updatedProviders });
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 transition-all duration-200 hover:border-zinc-700/60 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-zinc-100 truncate">
          {account.email}
        </h3>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
            aria-label="Account menu"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-zinc-800 border border-zinc-700/50 rounded-lg shadow-xl py-1 z-20 animate-scale-in origin-top-right">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowEditForm(true);
                }}
                className="w-full px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 text-left transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowDeleteConfirm(true);
                }}
                className="w-full px-3 py-2 text-sm text-red-400 hover:bg-zinc-700 hover:text-red-300 text-left transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Providers Grid */}
      <div className="flex flex-wrap gap-5">
        {enabledProviders.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onUpdateProvider={(updates) =>
              onUpdateProvider(provider.id, updates)
            }
          />
        ))}
      </div>

      {enabledProviders.length === 0 && (
        <p className="text-sm text-zinc-600 italic">
          No providers enabled.{' '}
          <button
            onClick={() => setShowEditForm(true)}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Edit account
          </button>
        </p>
      )}

      {/* Edit Form */}
      <AccountForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={handleEditSubmit}
        editAccount={account}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={`Delete ${account.email}?`}
        message="This will remove the account and its timers from this device."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={onDelete}
      />
    </div>
  );
}
