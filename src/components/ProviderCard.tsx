import { useState } from 'react';
import type { Provider } from '../types/account';
import { TimerDisplay } from './TimerDisplay';
import { AddTimerModal } from './AddTimerModal';
import { ConfirmDialog } from './ConfirmDialog';
import { getTimerStatus, createTimer } from '../utils/timer';
import { Button } from './ui/button';
import { Play, RotateCcw, Sparkles } from 'lucide-react';

type Props = {
  provider: Provider;
  onUpdateProvider: (updates: Partial<Provider>) => void;
  compact?: boolean;
};

export function ProviderCard({ provider, onUpdateProvider, compact = false }: Props) {
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
    setShowTimerModal(true);
  };

  if (!provider.enabled) return null;

  return (
    <div className="rounded-lg border border-zinc-200/70 bg-zinc-50/60 p-2.5 dark:border-zinc-800/80 dark:bg-zinc-950/40 transition-colors">
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Sparkles className="h-3 w-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {provider.name}
          </span>
        </div>

        {isReady ? (
          <Button
            variant="outline"
            size="xs"
            onClick={() => setShowTimerModal(true)}
            className="h-5 px-1.5 text-[10px] text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-medium"
          >
            <Play className="h-2.5 w-2.5 mr-0.5 fill-current" />
            Start
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setShowResetConfirm(true)}
            className="h-5 px-1.5 text-[10px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
          >
            <RotateCcw className="h-2.5 w-2.5 mr-0.5" />
            Reset
          </Button>
        )}
      </div>

      <TimerDisplay timer={isReady ? undefined : provider.timer} compact={compact} />

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
