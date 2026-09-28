import type { TimerState } from '../types/account';
import { getRemainingMs, getProgressPercent, getTimerStatus } from '../utils/timer';
import { formatRemainingTime, formatResetDate } from '../utils/formatting';
import { useCountdown } from '../hooks/useCountdown';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';

type Props = {
  timer?: TimerState;
  compact?: boolean;
};

export function TimerDisplay({ timer, compact = false }: Props) {
  useCountdown();

  const status = getTimerStatus(timer);
  const remaining = getRemainingMs(timer);
  const progress = getProgressPercent(timer);

  if (status === 'ready') {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <StatusBadge status="ready" size={compact ? 'sm' : 'default'} />
          <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            100%
          </span>
        </div>
        <ProgressBar percent={100} status="ready" size={compact ? 'sm' : 'default'} />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-1.5">
        <StatusBadge status={status} size={compact ? 'sm' : 'default'} />
        <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
          {Math.round(progress)}%
        </span>
      </div>

      <p className="text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200 truncate">
        {formatRemainingTime(remaining)}
      </p>

      <ProgressBar percent={progress} status={status} size={compact ? 'sm' : 'default'} />

      {timer && (
        <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 truncate">
          Resets {formatResetDate(timer.resetAt)}
        </p>
      )}
    </div>
  );
}
