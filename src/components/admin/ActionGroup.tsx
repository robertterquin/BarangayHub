interface ActionGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function ActionGroup({ children, className = '' }: ActionGroupProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {children}
    </div>
  );
}
