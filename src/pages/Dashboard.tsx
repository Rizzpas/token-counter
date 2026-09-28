import { useState, useMemo } from 'react';
import type { Account, FilterOption, SortOption, AppSettings } from '../types/account';
import { useAccounts } from '../hooks/useAccounts';
import { AccountCard } from '../components/AccountCard';
import { AccountForm } from '../components/AccountForm';
import { SearchBar } from '../components/SearchBar';
import { FilterBar } from '../components/FilterBar';
import { SortSelect } from '../components/SortSelect';
import { SettingsModal } from '../components/SettingsModal';
import { getTimerStatus, isTimerExpired, getRemainingMs, createTimer } from '../utils/timer';
import { Button } from '../components/ui/button';
import {
  Timer,
  Plus,
  Settings,
  LayoutGrid,
  List,
  Sparkles,
  Inbox,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { ProgressBar } from '../components/ProgressBar';
import { formatRemainingTime } from '../utils/formatting';
import { useCountdown } from '../hooks/useCountdown';

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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useCountdown();

  // Filter & sort accounts
  const filteredAccounts = useMemo(() => {
    let result = [...accounts];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a) => a.email.toLowerCase().includes(q));
    }

    // Filter: strictly Ready or Not Ready
    if (filter === 'ready') {
      result = result.filter((a) =>
        a.providers.filter((p) => p.enabled).every((p) => !p.timer || isTimerExpired(p.timer))
      );
    } else if (filter === 'not-ready') {
      result = result.filter((a) =>
        a.providers.filter((p) => p.enabled).some((p) => p.timer && !isTimerExpired(p.timer))
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
      'not-ready': stats.notReady,
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

  // Seed sample accounts (useful to preview 10 cards layout immediately)
  const handleLoadSampleAccounts = () => {
    const samples = [
      { email: 'mike.dev@google.com', geminiDuration: 7 * 24 * 60, claudeDuration: 2 * 24 * 60, geminiActive: true, claudeActive: true },
      { email: 'zilong.engineer@antigravity.ai', geminiDuration: 7 * 24 * 60, claudeDuration: 2 * 24 * 60, geminiActive: false, claudeActive: false },
      { email: 'sarah.ai@anthropic-team.org', geminiDuration: 7 * 24 * 60, claudeDuration: 2 * 24 * 60, geminiActive: false, claudeActive: true },
      { email: 'alex.chen@work-ide.io', geminiDuration: 7 * 24 * 60, claudeDuration: 2 * 24 * 60, geminiActive: true, claudeActive: false },
      { email: 'elena.rostova@cloudscale.net', geminiDuration: 7 * 24 * 60, claudeDuration: 2 * 24 * 60, geminiActive: true, claudeActive: true },
      { email: 'marcus.vance@codex-lab.org', geminiDuration: 7 * 24 * 60, claudeDuration: 2 * 24 * 60, geminiActive: false, claudeActive: false },
      { email: 'priya.sharma@deeplearning.io', geminiDuration: 7 * 24 * 60, claudeDuration: 2 * 24 * 60, geminiActive: true, claudeActive: true },
      { email: 'kenji.sato@tokyo-research.jp', geminiDuration: 7 * 24 * 60, claudeDuration: 2 * 24 * 60, geminiActive: false, claudeActive: true },
      { email: 'david.miller@kernel-ops.dev', geminiDuration: 7 * 24 * 60, claudeDuration: 2 * 24 * 60, geminiActive: true, claudeActive: false },
      { email: 'chloe.dubois@paris-ai.fr', geminiDuration: 7 * 24 * 60, claudeDuration: 2 * 24 * 60, geminiActive: false, claudeActive: false },
    ];

    samples.forEach((sample, idx) => {
      const acc = addAccount(sample.email, [
        { name: 'Gemini', enabled: true, defaultDurationMinutes: sample.geminiDuration },
        { name: 'Claude', enabled: true, defaultDurationMinutes: sample.claudeDuration },
      ]);

      if (sample.geminiActive) {
        // Varying offsets for realistic view
        const offsetHours = (idx * 16) % (7 * 24);
        const startTime = new Date(Date.now() - offsetHours * 3600000);
        updateProvider(acc.id, acc.providers[0].id, {
          timer: createTimer(sample.geminiDuration, startTime),
        });
      }

      if (sample.claudeActive) {
        const offsetHours = (idx * 9) % (2 * 24);
        const startTime = new Date(Date.now() - offsetHours * 3600000);
        updateProvider(acc.id, acc.providers[1].id, {
          timer: createTimer(sample.claudeDuration, startTime),
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-150">
      {/* Sleek Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-[1720px] mx-auto px-3 sm:px-6 h-12 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 flex items-center justify-center shadow-2xs font-semibold">
              <Timer className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs sm:text-sm tracking-tight text-zinc-900 dark:text-zinc-50">
                QuotaTrack
              </span>
              <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-zinc-100/50 dark:bg-zinc-900/50">
                v1.0
              </span>
            </div>
          </div>

          {/* Quick Metrics Ribbon (Header) */}
          {accounts.length > 0 && (
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
                <span className="text-[11px] text-zinc-500">Accounts:</span>
                <span className="font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                  {stats.total}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                <span className="text-[11px]">Ready:</span>
                <span className="font-semibold font-mono">{stats.ready}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400">
                <Clock className="h-3 w-3" />
                <span className="text-[11px]">Not Ready:</span>
                <span className="font-semibold font-mono">{stats.notReady}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* View toggle */}
            {accounts.length > 0 && (
              <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-md p-0.5 bg-zinc-100/50 dark:bg-zinc-900/50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded text-xs transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                  title="Compact Grid View (fits 10+ cards)"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1 rounded text-xs transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                  title="Dense Table View"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="h-8 w-8 p-0"
              aria-label="Settings"
            >
              <Settings className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
            </Button>

            <Button
              size="sm"
              onClick={() => setShowAddAccount(true)}
              className="h-8 px-2.5 sm:px-3 text-xs gap-1.5 font-medium"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Account</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-3 sm:px-6 py-3 space-y-3">
        {/* Controls Toolbar: Search, Filters, Sorters */}
        {accounts.length > 0 && (
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pb-1">
            <div className="flex-1 max-w-sm">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <FilterBar value={filter} onChange={setFilter} counts={filterCounts} />
              <SortSelect value={sort} onChange={setSort} />
            </div>
          </div>
        )}

        {/* View Mode: Compact Grid (fits 10 cards in viewport!) */}
        {filteredAccounts.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
              {filteredAccounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  compact={true}
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
          ) : (
            /* View Mode: Ultra-Dense Table View */
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Account Email</th>
                      <th className="py-2.5 px-3">Gemini Status</th>
                      <th className="py-2.5 px-3">Claude Status</th>
                      <th className="py-2.5 px-3">Custom Providers</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                    {filteredAccounts.map((account) => {
                      const gemini = account.providers.find((p) => p.name === 'Gemini');
                      const claude = account.providers.find((p) => p.name === 'Claude');
                      const custom = account.providers.filter(
                        (p) => p.name !== 'Gemini' && p.name !== 'Claude' && p.enabled
                      );

                      return (
                        <tr
                          key={account.id}
                          className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                        >
                          <td className="py-2 px-3 font-medium text-zinc-900 dark:text-zinc-100">
                            {account.email}
                          </td>
                          <td className="py-2 px-3">
                            {gemini && gemini.enabled ? (
                              <div className="space-y-1 max-w-[180px]">
                                <div className="flex items-center justify-between gap-1">
                                  <StatusBadge status={getTimerStatus(gemini.timer)} size="sm" />
                                  <span className="text-[10px] font-mono text-zinc-400">
                                    {formatRemainingTime(getRemainingMs(gemini.timer))}
                                  </span>
                                </div>
                                <ProgressBar
                                  percent={gemini.timer ? (getRemainingMs(gemini.timer) <= 0 ? 100 : (100 - (getRemainingMs(gemini.timer) / (gemini.timer.durationMinutes * 60000)) * 100)) : 100}
                                  status={getTimerStatus(gemini.timer)}
                                  size="sm"
                                />
                              </div>
                            ) : (
                              <span className="text-zinc-400 text-[11px]">—</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {claude && claude.enabled ? (
                              <div className="space-y-1 max-w-[180px]">
                                <div className="flex items-center justify-between gap-1">
                                  <StatusBadge status={getTimerStatus(claude.timer)} size="sm" />
                                  <span className="text-[10px] font-mono text-zinc-400">
                                    {formatRemainingTime(getRemainingMs(claude.timer))}
                                  </span>
                                </div>
                                <ProgressBar
                                  percent={claude.timer ? (getRemainingMs(claude.timer) <= 0 ? 100 : (100 - (getRemainingMs(claude.timer) / (claude.timer.durationMinutes * 60000)) * 100)) : 100}
                                  status={getTimerStatus(claude.timer)}
                                  size="sm"
                                />
                              </div>
                            ) : (
                              <span className="text-zinc-400 text-[11px]">—</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-[11px] text-zinc-500">
                            {custom.length > 0
                              ? custom.map((c) => c.name).join(', ')
                              : 'None'}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => deleteAccount(account.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : accounts.length > 0 ? (
          /* Filtered empty state */
          <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8 text-center my-6">
            <Inbox className="h-8 w-8 mx-auto text-zinc-400 mb-2 opacity-60" />
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              No matching accounts found
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Try adjusting your search query or status filter.
            </p>
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                setSearchQuery('');
                setFilter('all');
              }}
              className="mt-3 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          /* Empty Initial State */
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/40 p-10 text-center max-w-lg mx-auto my-12 shadow-xs">
            <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Timer className="h-6 w-6 text-zinc-600 dark:text-zinc-300" />
            </div>
            <h2 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
              No accounts yet
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5 max-w-sm mx-auto leading-relaxed">
              Add your AI accounts to automatically track reset countdowns and quota cycles.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <Button
                size="sm"
                onClick={() => setShowAddAccount(true)}
                className="gap-1.5 w-full sm:w-auto"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Your First Account
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadSampleAccounts}
                className="gap-1.5 w-full sm:w-auto text-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Load 10 Sample Accounts
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Account Modal */}
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
