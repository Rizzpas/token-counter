import type { TimerState } from '../types/account';
import { getRemainingMs, getProgressPercent, getTimerStatus } from '../utils/timer';
import { formatRemainingTime, formatResetDate } from '../utils/formatting';
import { useCountdown } from '../hooks/useCountdown';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';

type Props = {
  timer?: TimerState;
};

export function TimerDisplay({ timer }: Props) {
  useCountdown();

  const status = getTimerStatus(timer);
  const remaining = getRemainingMs(timer);
  const progress = getProgressPercent(timer);

  if (status === 'ready') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <StatusBadge status="ready" />
          <span className="text-emerald-400 text-sm font-semibold">100%</span>
        </div>
        <ProgressBar percent={100} status="ready" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <StatusBadge status={status} />
      </div>
      <p className="text-sm font-medium text-zinc-200">
        {formatRemainingTime(remaining)}
      </p>
      <ProgressBar percent={progress} status={status} />
      {timer && (
        <p className="text-xs text-zinc-500">
          Resets {formatResetDate(timer.resetAt)}
        </p>
      )}
    </div>
  );
}
