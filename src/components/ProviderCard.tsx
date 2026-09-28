import { useState } from 'react';
import type { Provider } from '../types/account';
import { TimerDisplay } from './TimerDisplay';
import { AddTimerModal } from './AddTimerModal';
import { ConfirmDialog } from './ConfirmDialog';
import { getTimerStatus, createTimer } from '../utils/timer';

type Props = {
  provider: Provider;
  onUpdateProvider: (updates: Partial<Provider>) => void;
};

export function ProviderCard({ provider, onUpdateProvider }: Props) {
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const status = getTimerStatus(provider.timer);
  const isReady = status === 'ready';

  const handleStartTimer = (durationMinutes: number, startDate: Date) => {
    const timer = createTimer(durationMinutes, startDate);
    onUpdateProvider({ timer });
  };

  const handleConfirmReset = () => {
    setShowResetConfirm(false);
    // Allow user to immediately configure the new timer
    setShowTimerModal(true);
  };

  if (!provider.enabled) return null;

  return (
    <div className="flex-1 min-w-[200px] p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/60 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-zinc-200 tracking-wide">{provider.name}</h4>
      </div>

      <TimerDisplay timer={isReady ? undefined : provider.timer} />

      <div className="mt-4">
        {isReady ? (
          <button
            onClick={() => setShowTimerModal(true)}
            className="w-full py-2 px-3 text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Start Timer
          </button>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2 px-3 text-xs font-semibold text-zinc-300 bg-zinc-800/70 hover:bg-zinc-700 border border-zinc-700/60 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset {provider.name}
          </button>
        )}
      </div>

      <AddTimerModal
        isOpen={showTimerModal}
        onClose={() => setShowTimerModal(false)}
        providerName={provider.name}
        defaultDurationMinutes={provider.defaultDurationMinutes}
        onStart={handleStartTimer}
      />

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title={`Reset ${provider.name} timer?`}
        message="The current timer will be replaced with a new timer."
        confirmLabel="Continue"
        onConfirm={handleConfirmReset}
      />
    </div>
  );
}
