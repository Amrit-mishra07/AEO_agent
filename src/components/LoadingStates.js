export function AuditLoadingState() {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <div className="loading-steps" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <div className="loading-step">Crawling site...</div>
        <div className="loading-step">Analyzing SEO...</div>
        <div className="loading-step">Checking schemas...</div>
        <div className="loading-step">Scoring content...</div>
        <div className="loading-step">Probing AI citations...</div>
        <div className="loading-step">Generating fixes...</div>
      </div>
    </div>
  );
}

export function ReportSkeleton() {
  return (
    <div className="report-skeleton">
      <div className="skeleton skeleton-title" style={{ width: '60%', height: '2rem', marginBottom: '1rem' }}></div>
      <div className="skeleton skeleton-text" style={{ width: '40%', height: '1rem', marginBottom: '2rem' }}></div>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="skeleton skeleton-gauge" style={{ width: '140px', height: '140px', borderRadius: '50%' }}></div>
        <div className="skeleton skeleton-gauge" style={{ width: '140px', height: '140px', borderRadius: '50%' }}></div>
        <div className="skeleton skeleton-gauge" style={{ width: '140px', height: '140px', borderRadius: '50%' }}></div>
      </div>

      <div className="skeleton skeleton-card" style={{ width: '100%', height: '200px', borderRadius: '8px', marginBottom: '2rem' }}></div>
      <div className="skeleton skeleton-card" style={{ width: '100%', height: '200px', borderRadius: '8px' }}></div>
    </div>
  );
}
