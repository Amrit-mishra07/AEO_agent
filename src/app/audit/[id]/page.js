import { getAudit, listAudits } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Home, AlertTriangle } from 'lucide-react';
import RunningState from '@/components/running/RunningState';
import FailedState from '@/components/running/FailedState';
import ReportHeader from '@/components/report/ReportHeader';
import ReportNav from '@/components/report/ReportNav';
import ExecutiveSummary from '@/components/report/ExecutiveSummary';
import PriorityFixes from '@/components/report/PriorityFixes';
import SeoSection from '@/components/report/SeoSection';
import SchemaSection from '@/components/report/SchemaSection';
import ContentSection from '@/components/report/ContentSection';
import VisibilitySection from '@/components/report/VisibilitySection';
import LlmsTxtSection from '@/components/report/LlmsTxtSection';
import PagesSection from '@/components/report/PagesSection';
import RewriteViewer from '@/components/report/RewriteViewer';
import MethodologyNote from '@/components/report/MethodologyNote';
import NextStepsFooter from '@/components/report/NextStepsFooter';
import { toAuditViewModel } from '@/view/audit-view-model';
import { extractPriorityFixes } from '@/view/priority';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const audit = getAudit(id);
  if (!audit) return { title: 'Audit Not Found' };
  try {
    const domain = new URL(audit.url).hostname;
    return { title: `AEO Diagnostic Report — ${domain}` };
  } catch {
    return { title: `AEO Diagnostic Report — ${audit.url}` };
  }
}

export const dynamic = 'force-dynamic';

export default async function AuditReportPage({ params }) {
  const { id } = await params;
  const audit = getAudit(id);

  if (!audit) notFound();

  if (audit.status === 'running' || audit.status === 'pending') {
    return <RunningState auditId={id} url={audit.url} />;
  }

  if (audit.status === 'failed') {
    return <FailedState audit={audit} />;
  }

  const allAudits = listAudits() || [];
  const viewModel = toAuditViewModel(audit, allAudits);
  const priorityFixes = extractPriorityFixes(viewModel);

  return (
    <div className="container page-content" style={{ paddingBottom: '5rem' }}>
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: '1.25rem' }}>
        <Link href="/" style={{ color: 'var(--text-2)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}>
          <Home size={14} /> Home
        </Link>
        <span>/</span>
        <Link href="/#recent-audits" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>
          Audits
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          {viewModel.domain}
        </span>
      </nav>

      {/* Analyst Report Header */}
      <ReportHeader audit={viewModel} />

      {/* Sticky Section Navigation */}
      <ReportNav
        counts={{
          priorityFixes: priorityFixes.length,
          seo: viewModel.seoIssues.length,
          schemas: viewModel.schemaGaps.length,
          content: viewModel.contentScores.length,
          citations: viewModel.citations.length,
          pages: viewModel.pages.length,
        }}
      />

      {/* SPA Warning Banner if detected */}
      {viewModel.spaPages.length > 0 && (
        <div 
          style={{ 
            marginBottom: '1.75rem', 
            padding: '1rem 1.25rem', 
            borderRadius: 'var(--radius-sm)', 
            background: 'var(--warn-bg)', 
            border: '1px solid var(--warn-border)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem' 
          }}
        >
          <AlertTriangle size={18} style={{ color: 'var(--warn)', flexShrink: 0 }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
            <strong style={{ color: 'var(--warn)' }}>Client-Side Rendered (SPA) Framework Detected: </strong>
            {viewModel.spaPages.length} crawled page(s) render via client-side JavaScript. AI answer engines prioritize static HTML and may fail to extract client-rendered content without server-side rendering.
          </div>
        </div>
      )}

      {/* Executive Summary & 4-Vector Breakdown */}
      <ExecutiveSummary audit={viewModel} />

      {/* Top 5 Priority Remediation Fixes */}
      <PriorityFixes audit={viewModel} />

      {/* Technical SEO Section */}
      <SeoSection 
        issues={viewModel.seoIssues} 
        pageMetaFixes={viewModel.pageMetaFixes} 
      />

      {/* Schema Markup Analysis */}
      <SchemaSection 
        gaps={viewModel.schemaGaps} 
      />

      {/* Content Extractability Breakdown */}
      <ContentSection 
        contentScores={viewModel.contentScores} 
      />

      {/* AI Citation Prober (Gemini + Grounding) */}
      <VisibilitySection 
        citations={viewModel.citations} 
        domain={viewModel.domain} 
        keywords={viewModel.keywords}
      />

      {/* Generated llms.txt Studio */}
      <LlmsTxtSection 
        content={viewModel.llmsTxt} 
      />

      {/* Content Rewrites for low extractability pages */}
      <RewriteViewer 
        rewrites={viewModel.contentRewrites} 
      />

      {/* Crawled Pages Surface */}
      <PagesSection 
        pages={viewModel.pages} 
      />

      {/* Transparent Methodology Specification */}
      <MethodologyNote />

      {/* Recommended Next Steps Footer */}
      <NextStepsFooter />

    </div>
  );
}
