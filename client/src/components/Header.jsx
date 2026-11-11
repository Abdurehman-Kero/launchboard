import { Plus, Rocket } from 'lucide-react';
import { DEMO_MODE } from '../api.js';

export default function Header({ onSubmitClick }) {
  return (
    <header className="site-header">
      <div className="content-wrapper site-header-inner">
        <a href="/" className="brand-zone" aria-label="LaunchBoard Home">
          <div className="brand-mark">
            <Rocket size={20} strokeWidth={2.2} />
          </div>
          <span className="brand-text">LaunchBoard</span>
        </a>

        <div className="header-actions">
          {DEMO_MODE && (
            <div className="demo-pill" title="Serving local mock data with artificial latency">
              <span className="demo-pill-dot" />
              <span>Demo data</span>
            </div>
          )}

          <button
            type="button"
            className="btn-primary"
            onClick={onSubmitClick}
            aria-label="Submit project"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Submit project</span>
          </button>
        </div>
      </div>
    </header>
  );
}
