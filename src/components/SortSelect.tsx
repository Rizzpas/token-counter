import type { SortOption } from '../types/account';

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
    <select
      id="sort-accounts"
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      className="px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all cursor-pointer"
    >
      {sortOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
