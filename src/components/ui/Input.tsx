interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  requiredMark?: boolean;
  containerClassName?: string;
}

export function Input({
  label,
  requiredMark = false,
  containerClassName = '',
  className = '',
  id,
  ...props
}: InputProps) {
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-gray-600">
          {label} {requiredMark && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={id}
        className={[
          'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30',
          className,
        ].join(' ')}
        {...props}
      />
    </div>
  );
}
