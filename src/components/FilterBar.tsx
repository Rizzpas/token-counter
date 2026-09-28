import type { FilterOption } from '../types/account';

type Props = {
  value: FilterOption;
  onChange: (value: FilterOption) => void;
  counts: {
    all: number;
    ready: number;
    'not-ready': number;
  };
};

const filters: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'ready', label: 'Ready' },
  { value: 'not-ready', label: 'Not Ready' },
];

export function FilterBar({ value, onChange, counts }: Props) {
  return (
    <div className="inline-flex h-8 items-center rounded-lg border border-zinc-200 bg-zinc-50/50 p-0.5 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
      {filters.map((filter) => {
        const isActive = value === filter.value;
        const count = counts[filter.value];
        return (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${
              isActive
                ? 'bg-white text-zinc-950 shadow-2xs dark:bg-zinc-800 dark:text-zinc-50 font-semibold'
                : 'hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <span>{filter.label}</span>
            <span
              className={`ml-1.5 rounded-full px-1 text-[10px] font-mono ${
                isActive
                  ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
