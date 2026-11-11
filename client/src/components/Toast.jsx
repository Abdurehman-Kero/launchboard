import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" role="status">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item ${toast.type || 'info'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {toast.type === 'success' && <CheckCircle2 size={18} color="var(--status-live-text)" />}
            {toast.type === 'error' && <AlertCircle size={18} color="var(--danger)" />}
            {(!toast.type || toast.type === 'info') && <Info size={18} color="var(--accent)" />}
            <span>{toast.message}</span>
          </div>

          <button
            type="button"
            className="btn-ghost"
            style={{ width: '28px', height: '28px', padding: 0 }}
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
