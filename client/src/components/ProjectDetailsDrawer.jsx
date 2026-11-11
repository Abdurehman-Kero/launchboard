import { useEffect, useRef, useState } from 'react';
import { X, ExternalLink, Github, Copy, Check, Heart, Calendar, User } from 'lucide-react';
import { getDeterministicGradient, getInitials, formatDate } from '../utils.js';

export default function ProjectDetailsDrawer({
  project,
  isLiked,
  onLike,
  onClose
}) {
  const [copied, setCopied] = useState(false);
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Focus management & body scroll lock
  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    document.body.classList.add('drawer-open');

    if (panelRef.current) {
      panelRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('drawer-open');
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [onClose]);

  if (!project) return null;

  const gradient = getDeterministicGradient(project.title || project.id);
  const initials = getInitials(project.title);
  const builderInitials = getInitials(project.student_name);

  const handleCopyLink = async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('project', project.id);
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Panel */}
      <div
        className="modal-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
      >
        {/* Banner with Deterministic Gradient */}
        <div
          className="drawer-banner"
          style={{
            background: gradient.bg,
            color: gradient.text
          }}
        >
          <div className="drawer-banner-monogram">
            <span className="drawer-banner-initials">{initials}</span>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close project details"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="drawer-content">
          <div className="drawer-title-group">
            <div className="drawer-badge-row">
              <span className={`status-badge ${project.status.toLowerCase()}`}>
                {project.status.toLowerCase() === 'live' && <span className="pulsing-dot" />}
                <span>{project.status}</span>
              </span>
              <span className="category-badge-chip">
                {project.category}
              </span>
            </div>

            <h2 id="drawer-title" className="drawer-title">
              {project.title}
            </h2>
            <p className="drawer-tagline">
              {project.tagline}
            </p>
          </div>

          {/* Action Row */}
          <div className="drawer-actions-row">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <span>View live project</span>
                <ExternalLink size={16} />
              </a>
            )}

            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <Github size={16} />
              <span>View on GitHub</span>
            </a>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleCopyLink}
              aria-label="Copy share link for project"
            >
              {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
              <span>{copied ? 'Copied' : 'Copy link'}</span>
            </button>

            <button
              type="button"
              className={`like-btn ${isLiked ? 'liked' : ''}`}
              onClick={() => onLike(project.id)}
              aria-label="Like project"
            >
              <Heart size={16} />
              <span>{project.likes}</span>
            </button>
          </div>

          {/* About Description */}
          <div>
            <h3 className="drawer-section-title">About the project</h3>
            <p className="drawer-description">{project.description}</p>
          </div>

          {/* Tech Stack */}
          {Array.isArray(project.tech_stack) && project.tech_stack.length > 0 && (
            <div>
              <h3 className="drawer-section-title">Technologies used</h3>
              <div className="card-tech-chips" style={{ paddingBottom: 0 }}>
                {project.tech_stack.map((tech) => (
                  <span key={tech} className="tech-chip" style={{ fontSize: '13px', padding: '4px 10px' }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Builder & Submission Box */}
          <div>
            <h3 className="drawer-section-title">Builder details</h3>
            <div className="drawer-meta-box">
              <div className="builder-info">
                <div className="avatar-initials" style={{ width: '38px', height: '38px', fontSize: '14px' }}>
                  {builderInitials}
                </div>
                <div className="builder-meta">
                  <span className="builder-name" style={{ fontSize: '15px' }}>
                    {project.student_name}
                  </span>
                  <span className="builder-cohort" style={{ fontSize: '13px' }}>
                    {project.cohort || 'Bootcamp Graduate'}
                  </span>
                </div>
              </div>

              {project.created_at && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--ink-muted)' }}>
                  <Calendar size={14} />
                  <span>{formatDate(project.created_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
