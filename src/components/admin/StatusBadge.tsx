import { Badge } from '../ui/Badge';

type StatusTone = 'blue' | 'green' | 'red' | 'yellow' | 'orange' | 'gray';

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  className?: string;
}

export function StatusBadge({ label, tone = 'gray', className = '' }: StatusBadgeProps) {
  return (
    <Badge tone={tone} className={className}>
      {label}
    </Badge>
  );
}
