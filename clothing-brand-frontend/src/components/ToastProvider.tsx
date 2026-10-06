import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { ToastContext, type ToastKind } from '../lib/toast';

interface Toast { id: number; message: string; kind: ToastKind }

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };

const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const show = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = nextId.current++;
    setToasts((t) => [...t.slice(-2), { id, message, kind }]);
    window.setTimeout(() => dismiss(id), kind === 'error' ? 6000 : 3500);
  }, [dismiss]);

  const api = useMemo(() => ({
    show,
    success: (m: string) => show(m, 'success'),
    error: (m: string) => show(m, 'error'),
  }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="rc-toasts" role="status" aria-live="polite">
        {toasts.map((t) => {
          const Icon = ICONS[t.kind];
          return (
            <div key={t.id} className={`rc-toast rc-toast--${t.kind}`}>
              <Icon size={18} aria-hidden />
              <span>{t.message}</span>
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss notification"><X size={16} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
