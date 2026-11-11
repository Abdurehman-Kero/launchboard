import { useState, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Web App',
  'E-commerce',
  'Education',
  'Health',
  'Social',
  'Productivity',
  'Other'
];

const STATUS_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'building', label: 'Building' },
  { id: 'idea', label: 'Idea' }
];

export default function Toolbar({
  search,
  category,
  status,
  sort,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onSortChange,
  resultsCount,
  loading
}) {
  const [localSearch, setLocalSearch] = useState(search);

  // Sync internal state if prop changes externally (e.g., URL popstate or clear filters)
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [localSearch, search, onSearchChange]);

  const handleClearSearch = () => {
    setLocalSearch('');
    onSearchChange('');
  };

  return (
    <div id="gallery" className="toolbar-section">
      <div className="toolbar-top-row">
        {/* Search Input */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search projects, builders, tech..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            aria-label="Search projects by title, tagline, student name, or tech stack"
          />
          {localSearch && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={handleClearSearch}
              aria-label="Clear search query"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Segmented Control & Sort Dropdown */}
        <div className="toolbar-controls">
          <div className="segmented-control" role="group" aria-label="Filter by project status">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`segmented-btn ${status === opt.id ? 'active' : ''}`}
                onClick={() => onStatusChange(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="sort-select-wrapper">
            <select
              className="sort-select"
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Sort projects"
            >
              <option value="newest">Newest first</option>
              <option value="popular">Most liked</option>
            </select>
            <ChevronDown size={14} className="sort-select-arrow" />
          </div>
        </div>
      </div>

      {/* Category Chips (Horizontally Scrollable) */}
      <div className="category-row" role="tablist" aria-label="Filter by category">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={category === cat}
            className={`category-chip ${category === cat ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Count Line */}
      <div className="results-summary">
        <span>
          Showing <span className="results-count-bold">{loading ? '...' : resultsCount}</span> {resultsCount === 1 ? 'project' : 'projects'}
        </span>
      </div>
    </div>
  );
}
