import { type TimerStatus } from '../utils/timer';

type Props = {
  percent: number;
  status: TimerStatus;
};

const barColors: Record<TimerStatus, string> = {
  ready: 'bg-emerald-500',
  active: 'bg-blue-500',
  'expiring-soon': 'bg-amber-500',
  'almost-ready': 'bg-orange-500',
};

export function ProgressBar({ percent, status }: Props) {
  const clampedPercent = Math.min(100, Math.max(0, percent));

  return (
    <div className="w-full">
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${barColors[status]}`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  );
}
