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

export default async function AuditReportPage({ params }) {
  const { id } = await params;
  const audit = getAudit(id);
  
  if (!audit) notFound();

  if (audit.status === 'running') {
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

  return (
    <div className="container page-content animate-fade-in">
      <div className="report-header">
        <h1>Audit Report: {audit.url}</h1>
        <p className="timestamp">Completed at {new Date(audit.completed_at).toLocaleString()}</p>
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
        <IssueList auditId={id} />
      </ReportCard>

      <ReportCard title="Schema Markup Analysis" icon="🏷️">
        <SchemaGapList auditId={id} />
      </ReportCard>

      <ReportCard title="Content Extractability" icon="📄">
        <ContentScoreCard auditId={id} />
      </ReportCard>

      <ReportCard title="AI Citation Tracking" icon="🤖">
        <CitationTable auditId={id} />
      </ReportCard>

      <ReportCard title="Generated llms.txt" icon="📝">
        <LlmsTxtPreview content={audit.llms_txt} />
      </ReportCard>

      <ReportCard title="Auto-Fix Package" icon="🛠️">
        <div className="fix-package-cta">
          <p>Download generated code fixes to resolve schema gaps and SEO issues automatically.</p>
          <button className="btn btn-primary">Download All Fixes</button>
        </div>
      </ReportCard>
    </div>
  );
}
