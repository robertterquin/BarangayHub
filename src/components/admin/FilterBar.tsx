import { RefreshCw, Search } from 'lucide-react';

interface FilterBarProps {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  searchValue,
  searchPlaceholder = 'Search...',
  onSearchChange,
  onRefresh,
  loading = false,
  children,
  className = '',
}: FilterBarProps) {
  return (
    <div className={`mb-5 flex flex-wrap items-center gap-3 ${className}`}>
      {onSearchChange && (
        <div className="flex w-full items-center gap-2 sm:w-auto sm:flex-1 sm:min-w-64">
          <div className="relative min-w-0 flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchValue ?? ''}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-700 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500"
            />
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="shrink-0 rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-600 disabled:opacity-50 sm:hidden"
              aria-label="Refresh data"
            >
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
            </button>
          )}
        </div>
      )}
      {children}
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="hidden shrink-0 rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-600 disabled:opacity-50 sm:block"
          aria-label="Refresh data"
        >
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
        </button>
      )}
    </div>
  );
}
