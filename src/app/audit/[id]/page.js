import { getAudit } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SEOScoreGauge from '@/components/SEOScoreGauge';
import ReportCard from '@/components/ReportCard';
import IssueList from '@/components/IssueList';
import SchemaGapList from '@/components/SchemaGapList';
import ContentScoreCard from '@/components/ContentScoreCard';
import CitationTable from '@/components/CitationTable';
import LlmsTxtPreview from '@/components/LlmsTxtPreview';
import ExportReportButton from '@/components/ExportReportButton';
import AuditSubnav from '@/components/AuditSubnav';
import { AuditLoadingState } from '@/components/LoadingStates';
import { getScoreGrade } from '@/utils/scoring';
import { 
  Home, 
  ExternalLink, 
  Calendar, 
  RotateCcw, 
  Search, 
  Code2, 
  Layers, 
  Bot, 
  FileText, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Activity,
  ArrowUpRight
} from 'lucide-react';

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
    return <AuditLoadingState auditId={id} url={audit.url} />;
  }

  if (audit.status === 'failed') {
    return (
      <div className="container page-content animate-fade-in" style={{ padding: '3rem 1.5rem', maxWidth: 700 }}>
        <ReportCard 
          title="Diagnostic Audit Failed" 
          icon={<AlertTriangle style={{ color: 'var(--accent-danger)' }} />}
          accentColor="var(--accent-danger-dim)"
        >
          <div style={{ padding: '1rem 0' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              There was an error communicating with or indexing <strong style={{ color: 'var(--text-primary)' }}>{audit.url}</strong>. 
              The target server may be blocking automated requests or the URL provided was unreachable.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link href="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <RotateCcw style={{ width: 16, height: 16 }} /> Try Another Audit
              </Link>
            </div>
          </div>
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
    fixSuggestion: row.fix_suggestion || null,
    generatedFix: row.generated_fix || null,
  }));

  const schemaGaps = (audit.schema_gaps || []).map(row => ({
    schemaType: row.type,
    status: row.importance,
    details: row.message,
    pageUrl: row.page_url || '',
    generatedFix: row.generated_fix || null,
  }));

  const contentScores = (audit.content_scores || []).map(row => {
    let parsedFeedback = row.feedback;
    try {
      if (typeof row.feedback === 'string' && (row.feedback.startsWith('{') || row.feedback.startsWith('['))) {
        parsedFeedback = JSON.parse(row.feedback);
      }
    } catch {
      // keep raw string
    }

    let parsedImprovements = [];
    try {
      if (typeof row.suggested_improvements === 'string' && row.suggested_improvements.startsWith('[')) {
        parsedImprovements = JSON.parse(row.suggested_improvements);
      } else if (row.suggested_improvements) {
        parsedImprovements = [row.suggested_improvements];
      }
    } catch {
      parsedImprovements = row.suggested_improvements ? [row.suggested_improvements] : [];
    }

    const feedbackText = typeof parsedFeedback === 'object' && parsedFeedback !== null
      ? Object.entries(parsedFeedback).map(([k, v]) => `${k}: ${v}`).join('\n')
      : (parsedFeedback || '');

    return {
      url: row.page_url,
      overallPageScore: row.overall_page_score,
      scores: {
        firstSentenceAnswerability: row.first_sentence_answerability,
        definitionClarity: row.definition_clarity,
        factSpecificity: row.fact_specificity,
        scannableStructure: row.scannable_structure,
        faqPresence: row.faq_presence,
        citationReadiness: row.citation_readiness,
      },
      feedback: feedbackText,
      suggestedImprovements: parsedImprovements,
    };
  });

  const citations = (audit.citations || []).map(row => ({
    keyword: row.target_query,
    engine: row.ai_engine || 'Unknown',
    status: row.snippet ? 'cited' : 'not_cited',
    citationContext: row.snippet,
    competitorsCited: [],
  }));

  let domain = audit.url;
  try {
    domain = new URL(audit.url).hostname;
  } catch {
    // keep raw
  }

  const overallGrade = getScoreGrade(audit.overall_score);
  const criticalCount = seoIssues.filter(i => i.severity?.toLowerCase() === 'critical').length;
  const warningCount = seoIssues.filter(i => i.severity?.toLowerCase() === 'warning').length;

  return (
    <div className="container page-content animate-fade-in" style={{ paddingBottom: '5rem' }}>
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '1.25rem' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', transition: 'color 0.2s' }}>
          <Home style={{ width: 14, height: 14 }} /> Home
        </Link>
        <span>/</span>
        <Link href="/#recent-audits" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>
          Audits
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
          {domain}
        </span>
      </nav>

      {/* Executive Header Banner */}
      <header className="report-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', padding: '1.75rem', background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '4px 10px' }}>
              <span className="live-status-dot" style={{ width: 7, height: 7 }} />
              Audit Complete
            </span>
            <span className="badge badge-secondary" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              {audit.pages?.length || 1} {audit.pages?.length === 1 ? 'Page' : 'Pages'} Crawled
            </span>
            {audit.completed_at && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar style={{ width: 13, height: 13 }} />
                {new Date(audit.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', margin: '0.4rem 0 0.6rem', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span>{domain}</span>
            <a 
              href={audit.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              title="Open audited site"
              style={{ color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', padding: '4px', borderRadius: '4px', transition: 'color 0.2s' }}
            >
              <ExternalLink style={{ width: 20, height: 20 }} />
            </a>
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{audit.url}</span>
            {audit.keywords && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Target Queries:</span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>{audit.keywords}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link 
            href="/" 
            className="btn btn-secondary" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            <RotateCcw style={{ width: 15, height: 15 }} />
            <span>New Audit</span>
          </Link>
          <ExportReportButton audit={audit} />
        </div>
      </header>

      {/* Sticky Section Navigation */}
      <AuditSubnav 
        counts={{
          seo: seoIssues.length,
          schemas: schemaGaps.length,
          content: contentScores.length,
          citations: citations.length,
          pages: audit.pages?.length
        }} 
      />

      {/* KPI Overview Section */}
      <section id="overview" style={{ scrollMarginTop: '130px', marginBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
          
          {/* Hero Overall AEO Score Card */}
          <div className="bento-card" style={{ padding: '2rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
              Overall Synthesis Score
            </span>
            <div style={{ margin: '1rem 0' }}>
              <SEOScoreGauge 
                score={audit.overall_score} 
                size="large" 
                grade={overallGrade}
              />
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <span 
                className={`badge ${audit.overall_score >= 80 ? 'badge-success' : audit.overall_score >= 60 ? 'badge-warning' : 'badge-danger'}`}
                style={{ fontSize: '0.825rem', padding: '4px 12px', fontWeight: 600 }}
              >
                {audit.overall_score >= 80 ? 'Optimal for AI Ingestion' : audit.overall_score >= 60 ? 'Moderate Extractability' : 'Critical Synthesis Deficits'}
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-tertiary)', marginTop: '0.75rem', maxWidth: 260, lineHeight: 1.5 }}>
              Aggregated across crawler hygiene, semantic markup, extractable facts, and multi-LLM citation probability.
            </p>
          </div>

          {/* 4-Vector Sub-Scores Grid */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            
            {/* Technical SEO Card */}
            <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-secondary)' }}>
                <Search style={{ width: 16, height: 16 }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Technical SEO</span>
              </div>
              <div style={{ margin: '0.75rem 0' }}>
                <SEOScoreGauge score={audit.seo_score} size="default" />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {criticalCount > 0 ? (
                  <span style={{ color: 'var(--accent-danger)', fontWeight: 600 }}>{criticalCount} critical issues</span>
                ) : warningCount > 0 ? (
                  <span style={{ color: 'var(--accent-warning)', fontWeight: 600 }}>{warningCount} warnings</span>
                ) : (
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Clean baseline</span>
                )}
              </div>
            </div>

            {/* Schema Markup Card */}
            <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-purple)' }}>
                <Code2 style={{ width: 16, height: 16 }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Schema Data</span>
              </div>
              <div style={{ margin: '0.75rem 0' }}>
                <SEOScoreGauge score={audit.schema_score} size="default" />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {schemaGaps.length > 0 ? (
                  <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{schemaGaps.length} schema gaps</span>
                ) : (
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Fully structured</span>
                )}
              </div>
            </div>

            {/* Content Extractability Card */}
            <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)' }}>
                <Layers style={{ width: 16, height: 16 }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Extractability</span>
              </div>
              <div style={{ margin: '0.75rem 0' }}>
                <SEOScoreGauge score={audit.content_score} size="default" />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: 600 }}>6-Vector LLM Audit</span>
              </div>
            </div>

            {/* Citation Rate Card */}
            <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-warning)' }}>
                <Bot style={{ width: 16, height: 16 }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Citations</span>
              </div>
              <div style={{ margin: '0.75rem 0' }}>
                <SEOScoreGauge score={audit.citation_score} size="default" />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: 600 }}>
                  {citations.filter(c => c.status === 'cited').length} of {citations.length} Cited
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Technical SEO Issues */}
      <ReportCard 
        id="seo-issues"
        title="Technical SEO Diagnostics" 
        subtitle="Algorithmic crawler discoverability, metadata hygiene, canonicals, and heading hierarchy"
        icon={<Search style={{ width: 18, height: 18, color: 'var(--accent-secondary)' }} />}
        badge={`${seoIssues.length} issues`}
        accentColor="var(--accent-secondary-dim)"
      >
        <IssueList issues={seoIssues} />
      </ReportCard>

      {/* Schema Markup Analysis */}
      <ReportCard 
        id="schemas"
        title="Schema Markup & Structured Data" 
        subtitle="Rich snippet verification, knowledge graph entities, and automated JSON-LD fixes"
        icon={<Code2 style={{ width: 18, height: 18, color: 'var(--accent-purple)' }} />}
        badge={`${schemaGaps.length} gaps detected`}
        accentColor="var(--accent-purple-dim)"
      >
        <SchemaGapList gaps={schemaGaps} />
      </ReportCard>

      {/* Content Extractability Breakdown */}
      {contentScores && contentScores.length > 0 && (
        <ReportCard 
          id="extractability"
          title="Content Extractability & Direct Answer Readiness" 
          subtitle="6-dimension LLM evaluation for zero-click AI snippet generation and factual synthesis"
          icon={<Layers style={{ width: 18, height: 18, color: 'var(--accent-primary)' }} />}
          badge={`${contentScores.length} pages audited`}
          accentColor="var(--accent-primary-dim)"
        >
          <div className="content-scores-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {contentScores.map((score, i) => (
              <ContentScoreCard key={i} pageScore={score} />
            ))}
          </div>
        </ReportCard>
      )}

      {/* AI Citation Prober */}
      <ReportCard 
        id="citations"
        title="AI Citation Tracking & Multi-Engine Probe" 
        subtitle="Live simulated queries across Perplexity, ChatGPT, Claude, and Gemini to test domain citations"
        icon={<Bot style={{ width: 18, height: 18, color: 'var(--accent-warning)' }} />}
        badge={`${citations.length} probes`}
        accentColor="var(--accent-warning-dim)"
      >
        <CitationTable citations={citations} />
      </ReportCard>

      {/* Generated llms.txt Studio */}
      <ReportCard 
        id="llmstxt"
        title="Engine Knowledge Protocol: llms.txt" 
        subtitle="Machine-readable markdown digest compliant with the /llms.txt standard for AI crawlers"
        icon={<FileText style={{ width: 18, height: 18, color: 'var(--accent-secondary)' }} />}
        badge="/llms.txt"
        accentColor="var(--accent-secondary-dim)"
      >
        <LlmsTxtPreview content={audit.llms_txt} />
      </ReportCard>

      {/* Crawled Pages Surface */}
      {audit.pages && audit.pages.length > 0 && (
        <ReportCard 
          id="pages"
          title="Crawled Surface & Architecture" 
          subtitle="Indexed endpoints and structured pages evaluated in this diagnostic run"
          icon={<Globe style={{ width: 18, height: 18, color: 'var(--accent-primary)' }} />}
          badge={`${audit.pages.length} endpoints`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {audit.pages.map((page, i) => (
              <div 
                key={i} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem', 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ minWidth: 240, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span 
                      style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '0.75rem', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        background: 'var(--accent-primary-dim)', 
                        color: 'var(--accent-primary)',
                        fontWeight: 600
                      }}
                    >
                      {page.status_code || 200}
                    </span>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {page.title || 'Untitled Page'}
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    {page.url}
                  </p>
                </div>

                <a 
                  href={page.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                >
                  <span>Visit</span>
                  <ArrowUpRight style={{ width: 14, height: 14 }} />
                </a>
              </div>
            ))}
          </div>
        </ReportCard>
      )}

    </div>
  );
}
