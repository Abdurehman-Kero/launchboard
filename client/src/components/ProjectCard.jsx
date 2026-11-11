import { Heart } from 'lucide-react';
import { getDeterministicGradient, getInitials } from '../utils.js';

export default function ProjectCard({
  project,
  isLiked,
  onLike,
  onClick,
  justAdded
}) {
  const gradient = getDeterministicGradient(project.title || project.id);
  const initials = getInitials(project.title);
  const builderInitials = getInitials(project.student_name);

  const techStack = Array.isArray(project.tech_stack) ? project.tech_stack : [];
  const displayTech = techStack.slice(0, 3);
  const remainingCount = techStack.length - displayTech.length;

  const handleLikeClick = (e) => {
    e.stopPropagation();
    onLike(project.id);
  };

  return (
    <article
      className={`project-card ${justAdded ? 'just-added' : ''}`}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`Open details for ${project.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Thumbnail area with deterministic gradient */}
      <div
        className="card-thumbnail"
        style={{
          background: gradient.bg,
          color: gradient.text
        }}
      >
        <div className="thumbnail-monogram-badge">
          <span className="thumbnail-initials">{initials}</span>
        </div>

        {/* Top Badges */}
        <div className="card-top-badges">
          <span className={`status-badge ${project.status.toLowerCase()}`}>
            {project.status.toLowerCase() === 'live' && <span className="pulsing-dot" />}
            <span>{project.status}</span>
          </span>

          <span className="category-badge-chip">
            {project.category}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="card-body">
        <h3 className="card-title">{project.title}</h3>
        <p className="card-tagline">{project.tagline}</p>

        {/* Up to 3 tech chips plus +N */}
        <div className="card-tech-chips">
          {displayTech.map((tech) => (
            <span key={tech} className="tech-chip">
              {tech}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="tech-chip-more">+{remainingCount}</span>
          )}
        </div>

        {/* Footer: Builder + Like Button */}
        <div className="card-footer">
          <div className="builder-info">
            <div className="avatar-initials" aria-hidden="true">
              {builderInitials}
            </div>
            <div className="builder-meta">
              <span className="builder-name">{project.student_name}</span>
              <span className="builder-cohort">{project.cohort || 'Graduate'}</span>
            </div>
          </div>

          <button
            type="button"
            className={`like-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLikeClick}
            aria-label={`${isLiked ? 'Unlike' : 'Like'} ${project.title}. Current likes: ${project.likes}`}
          >
            <Heart size={14} />
            <span>{project.likes}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
