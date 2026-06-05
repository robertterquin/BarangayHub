interface SpinnerProps {
  label?: string;
  className?: string;
}

export function Spinner({ label = 'Loading...', className = '' }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center gap-2 text-sm font-medium text-gray-400 ${className}`}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      {label}
    </div>
  );
}
