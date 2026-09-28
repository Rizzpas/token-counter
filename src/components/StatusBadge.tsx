import { type TimerStatus } from '../utils/timer';

type Props = {
  status: TimerStatus;
  size?: 'default' | 'sm';
};

const statusConfig: Record<
  TimerStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  ready: {
    label: 'READY',
    badgeClass:
      'bg-emerald-500/10 text-emerald-600 border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
    dotClass: 'bg-emerald-500',
  },
  active: {
    label: 'ACTIVE',
    badgeClass:
      'bg-blue-500/10 text-blue-600 border-blue-500/25 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
    dotClass: 'bg-blue-500',
  },
  'expiring-soon': {
    label: '<24H',
    badgeClass:
      'bg-amber-500/10 text-amber-600 border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
    dotClass: 'bg-amber-500 animate-pulse',
  },
  'almost-ready': {
    label: '<1H',
    badgeClass:
      'bg-orange-500/10 text-orange-600 border-orange-500/25 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30',
    dotClass: 'bg-orange-500 animate-pulse',
  },
};

export function StatusBadge({ status, size = 'default' }: Props) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium font-mono uppercase tracking-wider transition-colors select-none ${
        size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
      } ${config.badgeClass}`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
}
