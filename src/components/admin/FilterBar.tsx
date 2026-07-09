import { Search } from 'lucide-react';

interface FilterBarProps {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  searchValue,
  searchPlaceholder = 'Search...',
  onSearchChange,
  children,
  className = '',
}: FilterBarProps) {
  return (
    <div className={`mb-5 flex flex-wrap items-center gap-3 ${className}`}>
      {onSearchChange && (
        <div className="relative w-full min-w-0 flex-1 sm:min-w-64">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchValue ?? ''}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-700 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500"
          />
        </div>
      )}
      {children}
    </div>
  );
}
