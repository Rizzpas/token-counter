import type { FilterOption } from '../types/account';

type Props = {
  value: FilterOption;
  onChange: (value: FilterOption) => void;
  counts: {
    all: number;
    ready: number;
    active: number;
    'expiring-soon': number;
  };
};

const filters: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'ready', label: 'Ready' },
  { value: 'active', label: 'Active' },
  { value: 'expiring-soon', label: 'Expiring Soon' },
];

export function FilterBar({ value, onChange, counts }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = value === filter.value;
        const count = counts[filter.value];
        return (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-200 ${
              isActive
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-700/50 hover:text-zinc-300'
            }`}
          >
            {filter.label}
            <span
              className={`ml-1.5 text-xs ${
                isActive ? 'text-blue-400/70' : 'text-zinc-600'
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
