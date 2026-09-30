export default function ReportCard({ id, title, subtitle, icon, badge, actions, accentColor, children, className = '' }) {
  return (
    <section id={id} className={`card report-section ${className}`} style={{ '--card-accent': accentColor, scrollMarginTop: '130px' }}>
      <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {icon && (
            <div className="section-icon" style={{ backgroundColor: accentColor || 'hsla(220, 20%, 20%, 0.5)' }}>
              {icon}
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h3 className="card-title" style={{ margin: 0 }}>{title}</h3>
              {badge && <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>{badge}</span>}
            </div>
            {subtitle && <p className="card-subtitle" style={{ margin: '0.2rem 0 0' }}>{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="card-actions">{actions}</div>}
      </div>
      <div className="card-content">
        {children}
      </div>
    </section>
  );
}
