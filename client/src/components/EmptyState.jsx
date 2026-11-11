import { FilterX } from 'lucide-react';

export default function EmptyState({ onClearFilters }) {
  return (
    <div className="state-container">
      <div className="state-icon-box" aria-hidden="true">
        <FilterX size={28} strokeWidth={2.2} />
      </div>
      <h3 className="state-title">No projects found</h3>
      <p className="state-description">
        We couldn't find any student projects matching your search query or filters. Try adjusting your keywords or clearing the category and status filters.
      </p>
      {onClearFilters && (
        <button
          type="button"
          className="btn-secondary"
          onClick={onClearFilters}
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
