import { type TimerStatus } from '../utils/timer';

type Props = {
  status: TimerStatus;
};

const statusConfig: Record<TimerStatus, { label: string; className: string }> = {
  ready: {
    label: 'READY',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  active: {
    label: 'ACTIVE',
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  'expiring-soon': {
    label: 'EXPIRING SOON',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  'almost-ready': {
    label: 'ALMOST READY',
    className: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  },
};

export function StatusBadge({ status }: Props) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${config.className} transition-colors duration-300`}
    >
      {config.label}
    </span>
  );
}
