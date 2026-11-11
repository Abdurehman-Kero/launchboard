import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { validateProjectData } from '../api.js';

const CATEGORIES = [
  'Web App',
  'E-commerce',
  'Education',
  'Health',
  'Social',
  'Productivity',
  'Other'
];

export default function SubmitProjectDrawer({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  serverErrors = {}
}) {
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    student_name: '',
    student_email: '',
    cohort: '',
    category: 'Web App',
    status: 'live',
    github_url: '',
    live_url: '',
    tech_stack: []
  });

  const [tagInput, setTagInput] = useState('');
  const [touched, setTouched] = useState({});
  const [clientErrors, setClientErrors] = useState({});

  // Reset form when drawer opens
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      document.body.classList.add('drawer-open');
      if (panelRef.current) {
        panelRef.current.focus();
      }
    } else {
      document.body.classList.remove('drawer-open');
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('drawer-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Merge client and server errors
  const errors = { ...clientErrors, ...serverErrors };

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // If field was already touched, re-validate
    if (touched[field]) {
      const allErrors = validateProjectData(updated);
      setClientErrors((prev) => ({
        ...prev,
        [field]: allErrors[field] || undefined
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const allErrors = validateProjectData(formData);
    setClientErrors((prev) => ({
      ...prev,
      [field]: allErrors[field] || undefined
    }));
  };

  // Tech stack chip handlers
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^,+|,+$/g, '');
      if (!trimmed) return;

      if (formData.tech_stack.length >= 8) {
        setClientErrors((prev) => ({ ...prev, tech_stack: 'Maximum 8 tags allowed' }));
        return;
      }
      if (trimmed.length > 24) {
        setClientErrors((prev) => ({ ...prev, tech_stack: 'Tag must be 24 characters or less' }));
        return;
      }
      if (formData.tech_stack.includes(trimmed)) {
        setTagInput('');
        return;
      }

      const nextStack = [...formData.tech_stack, trimmed];
      setFormData((prev) => ({ ...prev, tech_stack: nextStack }));
      setTagInput('');
      setClientErrors((prev) => ({ ...prev, tech_stack: undefined }));
    } else if (e.key === 'Backspace' && !tagInput && formData.tech_stack.length > 0) {
      const nextStack = formData.tech_stack.slice(0, -1);
      setFormData((prev) => ({ ...prev, tech_stack: nextStack }));
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    const nextStack = formData.tech_stack.filter((_, idx) => idx !== indexToRemove);
    setFormData((prev) => ({ ...prev, tech_stack: nextStack }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all as touched
    const touchedAll = {
      title: true,
      tagline: true,
      description: true,
      student_name: true,
      category: true,
      status: true,
      github_url: true,
      live_url: true,
      tech_stack: true
    };
    setTouched(touchedAll);

    // Validate
    const formErrors = validateProjectData(formData);
    setClientErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-title"
        tabIndex={-1}
      >
        <div className="form-header-bar">
          <h2 id="submit-title" className="form-header-title">
            Submit your project
          </h2>
          <button
            type="button"
            className="drawer-close-btn"
            style={{ position: 'static' }}
            onClick={onClose}
            aria-label="Close submit form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="submit-form" noValidate>
          {/* Project Title */}
          <div className="form-field">
            <div className="form-label-row">
              <label htmlFor="title" className="form-label">
                Project title *
              </label>
              <span className="form-counter">{formData.title.length}/60</span>
            </div>
            <input
              id="title"
              type="text"
              maxLength={60}
              className={`form-input ${errors.title ? 'has-error' : ''}`}
              placeholder="e.g. Shega Pay"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              onBlur={() => handleBlur('title')}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <span className="field-error-message" role="alert">
                <AlertCircle size={13} /> {errors.title}
              </span>
            )}
          </div>

          {/* Tagline */}
          <div className="form-field">
            <div className="form-label-row">
              <label htmlFor="tagline" className="form-label">
                One-line tagline *
              </label>
              <span className="form-counter">{formData.tagline.length}/100</span>
            </div>
            <input
              id="tagline"
              type="text"
              maxLength={100}
              className={`form-input ${errors.tagline ? 'has-error' : ''}`}
              placeholder="What does it do in one punchy sentence?"
              value={formData.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              onBlur={() => handleBlur('tagline')}
              aria-invalid={!!errors.tagline}
            />
            {errors.tagline && (
              <span className="field-error-message" role="alert">
                <AlertCircle size={13} /> {errors.tagline}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="form-field">
            <div className="form-label-row">
              <label htmlFor="description" className="form-label">
                Description *
              </label>
              <span className="form-counter">{formData.description.length}/600</span>
            </div>
            <textarea
              id="description"
              maxLength={600}
              className={`form-textarea ${errors.description ? 'has-error' : ''}`}
              placeholder="Tell visitors what problem this solves, the background, or what you learned building it..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <span className="field-error-message" role="alert">
                <AlertCircle size={13} /> {errors.description}
              </span>
            )}
          </div>

          {/* Student Name */}
          <div className="form-field">
            <div className="form-label-row">
              <label htmlFor="student_name" className="form-label">
                Your name *
              </label>
              <span className="form-counter">{formData.student_name.length}/60</span>
            </div>
            <input
              id="student_name"
              type="text"
              maxLength={60}
              className={`form-input ${errors.student_name ? 'has-error' : ''}`}
              placeholder="e.g. Bethlehem Tadesse"
              value={formData.student_name}
              onChange={(e) => handleChange('student_name', e.target.value)}
              onBlur={() => handleBlur('student_name')}
              aria-invalid={!!errors.student_name}
            />
            {errors.student_name && (
              <span className="field-error-message" role="alert">
                <AlertCircle size={13} /> {errors.student_name}
              </span>
            )}
          </div>

          {/* Email (Optional) */}
          <div className="form-field">
            <label htmlFor="student_email" className="form-label">
              Email (optional)
            </label>
            <input
              id="student_email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.student_email}
              onChange={(e) => handleChange('student_email', e.target.value)}
            />
            <span className="form-helper-text">Never shown publicly</span>
          </div>

          {/* Cohort */}
          <div className="form-field">
            <label htmlFor="cohort" className="form-label">
              Cohort / Batch
            </label>
            <input
              id="cohort"
              type="text"
              className="form-input"
              placeholder="e.g. Batch 04 or Cohort 2026"
              value={formData.cohort}
              onChange={(e) => handleChange('cohort', e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="form-field">
            <label htmlFor="category" className="form-label">
              Category *
            </label>
            <select
              id="category"
              className="form-select"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status (Segmented: Idea / Building / Live) */}
          <div className="form-field">
            <label className="form-label">
              Status *
            </label>
            <div className="segmented-control" role="radiogroup" aria-label="Project Status">
              {['idea', 'building', 'live'].map((st) => (
                <button
                  key={st}
                  type="button"
                  role="radio"
                  aria-checked={formData.status === st}
                  className={`segmented-btn ${formData.status === st ? 'active' : ''}`}
                  onClick={() => handleChange('status', st)}
                >
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* GitHub URL */}
          <div className="form-field">
            <label htmlFor="github_url" className="form-label">
              GitHub repository URL *
            </label>
            <input
              id="github_url"
              type="url"
              className={`form-input ${errors.github_url ? 'has-error' : ''}`}
              placeholder="https://github.com/user/repo"
              value={formData.github_url}
              onChange={(e) => handleChange('github_url', e.target.value)}
              onBlur={() => handleBlur('github_url')}
              aria-invalid={!!errors.github_url}
            />
            {errors.github_url && (
              <span className="field-error-message" role="alert">
                <AlertCircle size={13} /> {errors.github_url}
              </span>
            )}
          </div>

          {/* Live URL: Appears and becomes required ONLY when status is Live */}
          {formData.status === 'live' && (
            <div className="form-field">
              <label htmlFor="live_url" className="form-label">
                Live project URL *
              </label>
              <input
                id="live_url"
                type="url"
                className={`form-input ${errors.live_url ? 'has-error' : ''}`}
                placeholder="https://yourproject.com"
                value={formData.live_url}
                onChange={(e) => handleChange('live_url', e.target.value)}
                onBlur={() => handleBlur('live_url')}
                aria-invalid={!!errors.live_url}
              />
              {errors.live_url ? (
                <span className="field-error-message" role="alert">
                  <AlertCircle size={13} /> {errors.live_url}
                </span>
              ) : (
                <span className="form-helper-text">Must start with https://</span>
              )}
            </div>
          )}

          {/* Tech Stack Chip Input */}
          <div className="form-field">
            <div className="form-label-row">
              <label htmlFor="tech_input" className="form-label">
                Tech stack *
              </label>
              <span className="form-counter">{formData.tech_stack.length}/8 tags</span>
            </div>

            <div
              className={`tag-input-container ${errors.tech_stack ? 'has-error' : ''}`}
              onClick={() => {
                const el = document.getElementById('tech_input');
                if (el) el.focus();
              }}
            >
              {formData.tech_stack.map((tag, idx) => (
                <span key={`${tag}-${idx}`} className="tag-chip-editable">
                  <span>{tag}</span>
                  <span
                    className="tag-chip-remove"
                    role="button"
                    tabIndex={0}
                    aria-label={`Remove ${tag}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(idx);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.stopPropagation();
                        handleRemoveTag(idx);
                      }
                    }}
                  >
                    <X size={12} />
                  </span>
                </span>
              ))}

              {formData.tech_stack.length < 8 && (
                <input
                  id="tech_input"
                  type="text"
                  className="tag-bare-input"
                  placeholder={formData.tech_stack.length === 0 ? "Type tech and press Enter or comma..." : "Add more..."}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => handleBlur('tech_stack')}
                />
              )}
            </div>

            {errors.tech_stack ? (
              <span className="field-error-message" role="alert">
                <AlertCircle size={13} /> {errors.tech_stack}
              </span>
            ) : (
              <span className="form-helper-text">
                Press Enter or comma to add each technology (e.g. React, PostgreSQL, Tailwind)
              </span>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Publish project</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
