export default function SkeletonGrid() {
  return (
    <div className="projects-grid" aria-label="Loading projects">
      {[1, 2, 3, 4, 5, 6].map((key) => (
        <div key={key} className="skeleton-card">
          <div className="skeleton-shimmer" style={{ height: '160px', width: '100%' }} />
          <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="skeleton-shimmer" style={{ height: '22px', width: '70%', borderRadius: '4px' }} />
            <div className="skeleton-shimmer" style={{ height: '16px', width: '90%', borderRadius: '4px' }} />
            <div className="skeleton-shimmer" style={{ height: '16px', width: '60%', borderRadius: '4px' }} />
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <div className="skeleton-shimmer" style={{ height: '24px', width: '56px', borderRadius: '6px' }} />
              <div className="skeleton-shimmer" style={{ height: '24px', width: '72px', borderRadius: '6px' }} />
              <div className="skeleton-shimmer" style={{ height: '24px', width: '48px', borderRadius: '6px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div className="skeleton-shimmer" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                <div className="skeleton-shimmer" style={{ width: '88px', height: '14px', borderRadius: '4px' }} />
              </div>
              <div className="skeleton-shimmer" style={{ width: '48px', height: '32px', borderRadius: '16px' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
