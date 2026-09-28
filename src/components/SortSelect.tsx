import type { SortOption } from '../types/account';
import { ArrowUpDown } from 'lucide-react';

type Props = {
  value: SortOption;
  onChange: (value: SortOption) => void;
};

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'soonest', label: 'Soonest reset' },
  { value: 'latest', label: 'Latest reset' },
  { value: 'ready-first', label: 'Ready first' },
  { value: 'name', label: 'Account name' },
  { value: 'recently-added', label: 'Recently added' },
];

export function SortSelect({ value, onChange }: Props) {
  return (
    <div className="relative inline-flex items-center">
      <ArrowUpDown className="absolute left-2.5 h-3 w-3 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
      <select
        id="sort-accounts"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="h-8 rounded-md border border-zinc-200 bg-white pl-7 pr-8 text-xs text-zinc-800 shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-200 dark:focus-visible:ring-zinc-700 cursor-pointer appearance-none transition-colors"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
        <svg
          className="h-3 w-3 text-zinc-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
