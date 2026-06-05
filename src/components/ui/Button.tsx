type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-blue-700 text-white hover:bg-blue-800 border border-blue-700',
  secondary: 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200',
  danger: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200',
  success: 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200',
  warning: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200',
  ghost: 'bg-transparent text-gray-500 hover:bg-gray-50 border border-gray-200',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
