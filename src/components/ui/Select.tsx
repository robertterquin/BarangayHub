import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  requiredMark?: boolean;
  containerClassName?: string;
}

export function Select({
  label,
  requiredMark = false,
  containerClassName = '',
  className = '',
  id,
  children,
  ...props
}: SelectProps) {
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-gray-600">
          {label} {requiredMark && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={[
            'w-full appearance-none rounded-lg border border-gray-300 px-3 py-2.5 pr-9 text-sm text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30',
            className,
          ].join(' ')}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}
