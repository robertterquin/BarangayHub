type BadgeTone = 'blue' | 'green' | 'red' | 'yellow' | 'orange' | 'gray';

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  blue: 'bg-blue-50 text-blue-600 border border-blue-200',
  green: 'bg-green-50 text-green-600 border border-green-200',
  red: 'bg-red-50 text-red-600 border border-red-200',
  yellow: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  orange: 'bg-orange-50 text-orange-600 border border-orange-200',
  gray: 'bg-gray-100 text-gray-500 border border-gray-200',
};

export function Badge({ children, tone = 'gray', className = '' }: BadgeProps) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE_CLASSES[tone]} ${className}`}>
      {children}
    </span>
  );
}
