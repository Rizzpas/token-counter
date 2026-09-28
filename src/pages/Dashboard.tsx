import { useState, useMemo } from 'react';
import type { Account, FilterOption, SortOption, AppSettings } from '../types/account';
import { useAccounts } from '../hooks/useAccounts';
import { AccountCard } from '../components/AccountCard';
import { AccountForm } from '../components/AccountForm';
import { SearchBar } from '../components/SearchBar';
import { FilterBar } from '../components/FilterBar';
import { SortSelect } from '../components/SortSelect';
import { SettingsModal } from '../components/SettingsModal';
import { getTimerStatus, isTimerExpired, getRemainingMs } from '../utils/timer';
import { loadSettings, saveSettings } from '../utils/storage';

export function Dashboard() {
  const {
    accounts,
    setAccounts,
    settings,
    addAccount,
    updateAccount,
    deleteAccount,
    updateProvider,
    updateSettings,
    stats,
  } = useAccounts();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort, setSort] = useState<SortOption>('soonest');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Filter & sort accounts
  const filteredAccounts = useMemo(() => {
    let result = [...accounts];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a) => a.email.toLowerCase().includes(q));
    }

    // Filter
    if (filter === 'ready') {
      result = result.filter((a) =>
        a.providers.filter((p) => p.enabled).every((p) => !p.timer || isTimerExpired(p.timer))
      );
    } else if (filter === 'active') {
      result = result.filter((a) =>
        a.providers.filter((p) => p.enabled).some((p) => p.timer && !isTimerExpired(p.timer))
      );
    } else if (filter === 'expiring-soon') {
      result = result.filter((a) =>
        a.providers
          .filter((p) => p.enabled)
          .some((p) => {
            const status = getTimerStatus(p.timer);
            return status === 'expiring-soon' || status === 'almost-ready';
          })
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.email.localeCompare(b.email);
        case 'soonest': {
          const aMin = getMinRemaining(a);
          const bMin = getMinRemaining(b);
          // Ready accounts go to end, active sorted by soonest
          if (aMin === 0 && bMin === 0) return 0;
          if (aMin === 0) return 1;
          if (bMin === 0) return -1;
          return aMin - bMin;
        }
        case 'latest': {
          const aMin = getMinRemaining(a);
          const bMin = getMinRemaining(b);
          if (aMin === 0 && bMin === 0) return 0;
          if (aMin === 0) return 1;
          if (bMin === 0) return -1;
          return bMin - aMin;
        }
        case 'ready-first': {
          const aReady = a.providers.filter((p) => p.enabled).every((p) => !p.timer || isTimerExpired(p.timer));
          const bReady = b.providers.filter((p) => p.enabled).every((p) => !p.timer || isTimerExpired(p.timer));
          if (aReady && !bReady) return -1;
          if (!aReady && bReady) return 1;
          return 0;
        }
        case 'recently-added':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [accounts, searchQuery, filter, sort]);

  const filterCounts = useMemo(
    () => ({
      all: accounts.length,
      ready: stats.ready,
      active: stats.active,
      'expiring-soon': stats.expiringSoon,
    }),
    [accounts.length, stats]
  );

  const handleAddAccount = (email: string, providers: any[]) => {
    addAccount(email, providers);
  };

  const handleImport = (importedAccounts: Account[], importedSettings: AppSettings) => {
    setAccounts(importedAccounts);
    updateSettings(importedSettings);
  };

  const handleClearAll = () => {
    setAccounts([]);
    updateSettings({
      theme: 'dark',
      notifications: {
        enabled: false,
        notifyOnReady: true,
        notify24h: true,
        notify6h: true,
        notify1h: true,
      },
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-50 tracking-tight">
                QuotaTrack
              </h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                Track your AI account reset cycles.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-800/50 transition-colors"
                aria-label="Settings"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setShowAddAccount(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Account
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats Cards */}
        {accounts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard label="Total Accounts" value={stats.total} color="zinc" />
            <StatCard label="Ready" value={stats.ready} color="emerald" />
            <StatCard label="Active" value={stats.active} color="blue" />
            <StatCard label="Expiring Soon" value={stats.expiringSoon} color="amber" />
          </div>
        )}

        {/* Controls */}
        {accounts.length > 0 && (
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
              <SortSelect value={sort} onChange={setSort} />
            </div>
            <FilterBar value={filter} onChange={setFilter} counts={filterCounts} />
          </div>
        )}

        {/* Account List */}
        {filteredAccounts.length > 0 ? (
          <div className="space-y-4">
            {filteredAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onUpdateProvider={(providerId, updates) =>
                  updateProvider(account.id, providerId, updates)
                }
                onUpdateAccount={(updates) =>
                  updateAccount(account.id, updates)
                }
                onDelete={() => deleteAccount(account.id)}
              />
            ))}
          </div>
        ) : accounts.length > 0 ? (
          /* No results from search/filter */
          <div className="text-center py-16">
            <p className="text-zinc-500 text-sm">No accounts match your search or filter.</p>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-zinc-300 mb-2">
              No accounts yet
            </h2>
            <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
              Add your first account to start tracking your AI quota resets.
            </p>
            <button
              onClick={() => setShowAddAccount(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Account
            </button>
          </div>
        )}
      </main>

      {/* Add Account Modal */}
      <AccountForm
        isOpen={showAddAccount}
        onClose={() => setShowAddAccount(false)}
        onSubmit={handleAddAccount}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        accounts={accounts}
        onImport={handleImport}
        onClearAll={handleClearAll}
      />
    </div>
  );
}

// Helper
function getMinRemaining(account: Account): number {
  const enabledProviders = account.providers.filter((p) => p.enabled);
  if (enabledProviders.length === 0) return 0;

  let min = Infinity;
  for (const p of enabledProviders) {
    const remaining = getRemainingMs(p.timer);
    if (remaining > 0 && remaining < min) {
      min = remaining;
    }
  }
  return min === Infinity ? 0 : min;
}

// Stat Card Component
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'zinc' | 'emerald' | 'blue' | 'amber';
}) {
  const colorMap = {
    zinc: 'text-zinc-200',
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold ${colorMap[color]}`}>{value}</p>
    </div>
  );
}
