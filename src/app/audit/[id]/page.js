import { getAudit } from '@/lib/db';
import { notFound } from 'next/navigation';
import SEOScoreGauge from '@/components/SEOScoreGauge';
import ReportCard from '@/components/ReportCard';
import IssueList from '@/components/IssueList';
import SchemaGapList from '@/components/SchemaGapList';
import ContentScoreCard from '@/components/ContentScoreCard';
import CitationTable from '@/components/CitationTable';
import LlmsTxtPreview from '@/components/LlmsTxtPreview';
import { AuditLoadingState } from '@/components/LoadingStates';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const audit = getAudit(id);
  if (!audit) return { title: 'Audit Not Found' };
  return { title: `Audit Report — ${audit.url}` };
}

export const dynamic = 'force-dynamic';

export default async function AuditReportPage({ params }) {
  const { id } = await params;
  const audit = getAudit(id);
  
  if (!audit) notFound();

  if (audit.status === 'running' || audit.status === 'pending') {
    return <AuditLoadingState auditId={id} url={audit.url} />;
  }

  if (audit.status === 'failed') {
    return (
      <div className="container page-content">
        <ReportCard title="Audit Failed" icon="❌">
          <p>There was an error running the audit for {audit.url}. Please try again.</p>
        </ReportCard>
      </div>
    );
  }

  // Map DB column names to what components expect
  const seoIssues = (audit.seo_issues || []).map(row => ({
    severity: row.severity,
    category: row.type,
    issue: row.message,
    details: row.message,
    pageUrl: row.page_url,
    url: row.page_url,
  }));

  const schemaGaps = (audit.schema_gaps || []).map(row => ({
    schemaType: row.type,
    status: row.importance,
    details: row.message,
    pageUrl: row.page_url || '',
    generatedFix: row.generated_fix || null,
  }));

  const citations = (audit.citations || []).map(row => ({
    keyword: row.target_query,
    engine: row.ai_engine || 'Unknown',
    status: row.snippet ? 'cited' : 'not_cited',
    citationContext: row.snippet,
    competitorsCited: [],
  }));

  return (
    <div className="container page-content animate-fade-in">
      <div className="report-header">
        <h1>Audit Report: {audit.url}</h1>
        {audit.completed_at && (
          <p className="timestamp">Completed at {new Date(audit.completed_at).toLocaleString()}</p>
        )}
      </div>

      <div className="gauge-container">
        <SEOScoreGauge score={audit.overall_score} label="Overall AEO Score" size="large" />
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <h3>SEO Score</h3>
          <SEOScoreGauge score={audit.seo_score} />
        </div>
        <div className="stat-box">
          <h3>Schema Score</h3>
          <SEOScoreGauge score={audit.schema_score} />
        </div>
        <div className="stat-box">
          <h3>Content Score</h3>
          <SEOScoreGauge score={audit.content_score} />
        </div>
        <div className="stat-box">
          <h3>Citation Rate</h3>
          <SEOScoreGauge score={audit.citation_score} />
        </div>
      </div>

      <ReportCard title="Technical SEO Issues" icon="🔍">
        <IssueList issues={seoIssues} />
      </ReportCard>

      <ReportCard title="Schema Markup Analysis" icon="🏷️">
        <SchemaGapList gaps={schemaGaps} />
      </ReportCard>

      {audit.pages && audit.pages.length > 0 && (
        <ReportCard title="Crawled Pages" icon="📄">
          <div className="issue-list">
            {audit.pages.map((page, i) => (
              <div key={i} className="issue-item" style={{ padding: '0.75rem' }}>
                <h4>{page.title || page.url}</h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>{page.url}</p>
              </div>
            ))}
          </div>
        </ReportCard>
      )}

      <ReportCard title="AI Citation Tracking" icon="🤖">
        <CitationTable citations={citations} />
      </ReportCard>

      <ReportCard title="Generated llms.txt" icon="📝">
        <LlmsTxtPreview content={audit.llms_txt} />
      </ReportCard>
    </div>
  );
}
