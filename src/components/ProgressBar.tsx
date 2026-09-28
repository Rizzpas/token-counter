import { type TimerStatus } from '../utils/timer';

type Props = {
  percent: number;
  status: TimerStatus;
  size?: 'default' | 'sm';
};

const barColors: Record<TimerStatus, string> = {
  ready: 'bg-emerald-500',
  'not-ready': 'bg-amber-500',
};

export function ProgressBar({ percent, status, size = 'default' }: Props) {
  const clampedPercent = Math.min(100, Math.max(0, percent));

  return (
    <div className="w-full">
      <div
        className={`w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden ${
          size === 'sm' ? 'h-1' : 'h-1.5'
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${barColors[status]}`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  );
}
