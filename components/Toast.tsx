import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
  autoClose?: number;
}

export default function Toast({ type, message, onClose, autoClose = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, isVisible, onClose]);

  if (!isVisible) return null;

  const baseStyles = 'fixed bottom-4 right-4 left-4 md:left-auto md:max-w-sm flex items-start gap-3 p-4 rounded-2xl border shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-250 z-50';

  const styles = {
    success: `${baseStyles} bg-sage/10 border-sage/20 text-sage`,
    error: `${baseStyles} bg-red-500/10 border-red-500/20 text-red-600`,
    info: `${baseStyles} bg-blue-500/10 border-blue-500/20 text-blue-600`,
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />,
    info: <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />,
  };

  return (
    <div className={styles[type]} role="status" aria-live="polite" aria-atomic="true">
      <div className="flex items-start gap-3 flex-1">
        {icons[type]}
        <p className="text-sm font-medium flex-1">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-current rounded"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
