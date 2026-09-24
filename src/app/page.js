import AuditForm from '@/components/AuditForm';
import { listAudits } from '@/lib/db';
import Link from 'next/link';
import { getScoreColor, getScoreGrade } from '@/utils/scoring';

export default function HomePage() {
  const audits = listAudits() || [];

  return (
    <div className="page-content">
      <section className="hero">
        <div className="container">
          <div className="hero-badge">AI + SEO Analysis</div>
          <h1>AEO / SEO Copilot</h1>
          <p>Scan your website, diagnose SEO and AI visibility issues, and get auto-generated fixes. Optimize for Answer Engines.</p>
          <AuditForm />
        </div>
      </section>

      <section className="container">
        <h2>Recent Audits</h2>
        {audits.length === 0 ? (
          <div className="empty-state">
            <p>No audits yet. Enter a URL above to start your first scan!</p>
          </div>
        ) : (
          <div className="audit-list">
            {audits.map(audit => (
              <Link href={`/audit/${audit.id}`} key={audit.id} className="audit-list-item">
                <div className="audit-info">
                  <h3>{audit.url}</h3>
                  <span className={`status-badge ${audit.status}`}>
                    {audit.status}
                  </span>
                  <span className="audit-date">{new Date(audit.created_at).toLocaleString()}</span>
                </div>
                {audit.status === 'completed' && (
                  <div className="audit-score">
                    <div className="score-value" style={{ color: `var(--${getScoreColor(audit.overall_score)})` }}>
                      {audit.overall_score}
                    </div>
                    <div className="score-grade">{getScoreGrade(audit.overall_score)}</div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
