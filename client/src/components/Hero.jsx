import { useState, useEffect } from 'react';
import { ArrowDown, Plus } from 'lucide-react';

function useCountUp(targetValue, duration = 800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof targetValue !== 'number' || targetValue <= 0) {
      setCount(targetValue || 0);
      return;
    }

    let start = 0;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quartic
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentVal = Math.round(start + (targetValue - start) * easeProgress);
      setCount(currentVal);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }, [targetValue, duration]);

  return count;
}

export default function Hero({ stats, loading, onSubmitClick }) {
  const displayTotal = useCountUp(stats?.total || 0);
  const displayLive = useCountUp(stats?.live || 0);
  const displayBuilders = useCountUp(stats?.builders || 0);

  const scrollToGallery = () => {
    const el = document.getElementById('gallery');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section">
      <div className="content-wrapper">
        <div className="hero-main">
          <div className="hero-kicker">
            <span>Student Showcase Directory</span>
          </div>
          <h1 className="hero-title">Where bootcamp projects go live.</h1>
          <p className="hero-subtitle">
            A public launchpad for bootcamp graduates to showcase live applications, share code repositories, and get discovered by teams looking for driven builders.
          </p>

          <div className="hero-cta-group">
            <button
              type="button"
              className="btn-primary"
              onClick={onSubmitClick}
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Submit your project</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={scrollToGallery}
            >
              <ArrowDown size={16} />
              <span>Explore gallery</span>
            </button>
          </div>
        </div>

        {/* 3 Stat Tiles */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">
              {loading && !stats ? '—' : displayTotal}
            </div>
            <div className="stat-label">Projects launched</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {loading && !stats ? '—' : displayLive}
            </div>
            <div className="stat-label">Live in production</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {loading && !stats ? '—' : displayBuilders}
            </div>
            <div className="stat-label">Student builders</div>
          </div>
        </div>
      </div>
    </section>
  );
}
