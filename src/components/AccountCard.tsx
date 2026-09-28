import { useState, useRef, useEffect } from 'react';
import type { Account, Provider } from '../types/account';
import { ProviderCard } from './ProviderCard';
import { AccountForm } from './AccountForm';
import { ConfirmDialog } from './ConfirmDialog';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { MoreHorizontal, Pencil, Trash2, Mail, Bot } from 'lucide-react';

type Props = {
  account: Account;
  onUpdateProvider: (providerId: string, updates: Partial<Provider>) => void;
  onUpdateAccount: (updates: Partial<Pick<Account, 'email' | 'providers'>>) => void;
  onDelete: () => void;
  compact?: boolean;
};

export function AccountCard({
  account,
  onUpdateProvider,
  onUpdateAccount,
  onDelete,
  compact = true,
}: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <Card className="flex flex-col justify-between overflow-hidden transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700/80 hover:shadow-sm">
      {/* Header */}
      <CardHeader className="p-2.5 sm:p-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/70 bg-zinc-50/50 dark:bg-zinc-950/20">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="h-5 w-5 rounded-md bg-zinc-200/80 dark:bg-zinc-800 flex items-center justify-center shrink-0">
              <Mail className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
            </div>
            <span
              className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate"
              title={account.email}
            >
              {account.email}
            </span>
          </div>

          <div className="relative shrink-0" ref={menuRef}>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowMenu(!showMenu)}
              className="h-6 w-6 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              aria-label="Account options"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-32 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 z-30 animate-scale-in">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowEditForm(true);
                  }}
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Body: Providers */}
      <CardContent className="p-2.5 sm:p-3 pt-2.5 space-y-2 flex-1">
        {enabledProviders.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            compact={compact}
            onUpdateProvider={(updates) => onUpdateProvider(provider.id, updates)}
          />
        ))}

        {enabledProviders.length === 0 && (
          <div className="py-4 text-center">
            <Bot className="h-5 w-5 mx-auto text-zinc-400 mb-1 opacity-60" />
            <p className="text-[11px] text-zinc-500">No active providers</p>
            <Button
              variant="link"
              size="xs"
              onClick={() => setShowEditForm(true)}
              className="text-[11px] text-blue-600 dark:text-blue-400 mt-1"
            >
              Configure providers
            </Button>
          </div>
        )}
      </CardContent>

      {/* Edit Form Modal */}
      <AccountForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={handleEditSubmit}
        editAccount={account}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={`Delete ${account.email}?`}
        message="This will remove the account and its timers from this device."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={onDelete}
      />
    </Card>
  );
}
