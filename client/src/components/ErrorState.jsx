import { AlertTriangle, RotateCw } from 'lucide-react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state-container" role="alert">
      <div className="state-icon-box" style={{ color: 'var(--danger)', backgroundColor: 'var(--danger-soft)' }}>
        <AlertTriangle size={28} strokeWidth={2.2} />
      </div>
      <h3 className="state-title">Unable to load projects</h3>
      <p className="state-description">
        {message || 'An unexpected error occurred while communicating with the server. Please check your connection and try again.'}
      </p>
      {onRetry && (
        <button
          type="button"
          className="btn-primary"
          onClick={onRetry}
        >
          <RotateCw size={16} />
          <span>Try again</span>
        </button>
      )}
    </div>
  );
}
