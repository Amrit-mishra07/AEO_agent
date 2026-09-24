export default function ReportCard({ title, subtitle, icon, accentColor, children }) {
  return (
    <section className="card report-section" style={{ '--card-accent': accentColor }}>
      <div className="card-header">
        {icon && (
          <div className="section-icon" style={{ backgroundColor: accentColor }}>
            {icon}
          </div>
        )}
        <div>
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="card-content">
        {children}
      </div>
    </section>
  );
}
