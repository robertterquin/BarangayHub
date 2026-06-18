import { X } from 'lucide-react';

type ModalWidth = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  title: string;
  subtitle?: string;
  width?: ModalWidth;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const WIDTH_CLASSES: Record<ModalWidth, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
};

export function Modal({
  title,
  subtitle,
  width = 'md',
  onClose,
  children,
  footer,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className={`max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${WIDTH_CLASSES[width]}`}>
        <div className="flex items-start justify-between bg-linear-to-r from-blue-800 to-blue-600 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold leading-tight text-white">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-blue-200">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 rounded-full p-1 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 pb-5">{footer}</div>}
      </div>
    </div>
  );
}
