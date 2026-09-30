import AuditForm from '@/components/AuditForm';
import { listAudits } from '@/lib/db';
import Link from 'next/link';
import { getScoreColor, getScoreGrade } from '@/utils/scoring';
import { 
  Bot, 
  Code2, 
  FileText, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  Activity, 
  CheckCircle2, 
  ShieldCheck, 
  Layers,
  Search
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const audits = listAudits() || [];

  return (
    <div className="page-content" style={{ paddingTop: '2.5rem' }}>
      {/* Hero Section */}
      <section className="hero" style={{ textAlign: 'center', paddingBottom: '3rem' }}>
        <div className="container">
          <div 
            className="hero-badge" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.45rem', 
              marginBottom: '1.25rem',
              padding: '0.35rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              background: 'hsla(155, 80%, 50%, 0.08)',
              border: '1px solid hsla(155, 80%, 50%, 0.25)',
              fontSize: '0.82rem',
              color: 'var(--accent-primary)',
              fontWeight: 600,
            }}
          >
            <Sparkles size={14} />
            <span>Next-Gen Answer Engine Optimization</span>
          </div>

          <h1 style={{ fontSize: '3.25rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1.25rem' }}>
            Audit for Search. <br />
            <span className="text-gradient">Optimize for AI.</span>
          </h1>

          <p style={{ maxWidth: '640px', margin: '0 auto 2.5rem', fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Diagnose how ChatGPT, Perplexity, Claude, and Gemini cite your brand.
            Auto-generate JSON-LD schemas, standardized <code className="mono" style={{ color: 'var(--accent-secondary)', fontSize: '0.95rem' }}>llms.txt</code>, and content restructuring fixes.
          </p>

          <AuditForm />
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="container" style={{ margin: '3rem auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Four Engines in One Cohesive Platform
          </h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem' }}>
            Built for modern SEO engineers, founders, and AI content strategists.
          </p>
        </div>

        <div className="bento-grid">
          {/* Bento 1: AI Citation */}
          <div className="bento-card col-6">
            <div>
              <div className="bento-icon-box" style={{ background: 'hsla(200, 90%, 55%, 0.1)', borderColor: 'hsla(200, 90%, 55%, 0.25)', color: 'var(--accent-secondary)' }}>
                <Bot size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                AI Citation Probing
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Simulate generative queries across Perplexity, ChatGPT, and Claude to monitor whether AI engines cite your pages or competitor sources.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', padding: '0.85rem', background: 'hsla(225, 25%, 8%, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span className="badge badge-cited" style={{ fontSize: '0.75rem' }}>AI Cited</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>Perplexity & ChatGPT Grounding Verified</span>
            </div>
          </div>

          {/* Bento 2: Schema Engine */}
          <div className="bento-card col-6">
            <div>
              <div className="bento-icon-box" style={{ background: 'hsla(155, 80%, 50%, 0.1)', borderColor: 'hsla(155, 80%, 50%, 0.25)', color: 'var(--accent-primary)' }}>
                <Code2 size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Autonomous Schema.org Fixes
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Detect missing Organization, Article, Product, and FAQPage schemas, and get production-ready, validated JSON-LD scripts ready to embed.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', padding: '0.85rem', background: 'hsla(225, 25%, 8%, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>JSON-LD</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>Auto-populated with verified page facts</span>
            </div>
          </div>

          {/* Bento 3: 6-D Content Extractability */}
          <div className="bento-card col-6">
            <div>
              <div className="bento-icon-box" style={{ background: 'hsla(270, 75%, 60%, 0.1)', borderColor: 'hsla(270, 75%, 60%, 0.25)', color: 'var(--accent-purple)' }}>
                <Layers size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                6-D Content Extractability
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Score pages across First-Sentence Answerability, Definition Clarity, Fact Specificity, Scannable Structure, FAQ Presence, and Citation Readiness.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['Answerability', 'Definitions', 'Fact Specificity', 'Structure'].map(d => (
                <span key={d} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', background: 'hsla(225, 20%, 15%, 0.8)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Bento 4: llms.txt Standard */}
          <div className="bento-card col-6">
            <div>
              <div className="bento-icon-box" style={{ background: 'hsla(40, 95%, 55%, 0.1)', borderColor: 'hsla(40, 95%, 55%, 0.25)', color: 'var(--accent-warning)' }}>
                <FileText size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Standardized llms.txt Synthesis
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Produce an official <code className="mono">/llms.txt</code> file matching current AI web standards to guide LLMs directly to high-signal documentation.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', padding: '0.85rem', background: 'hsla(225, 25%, 8%, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span className="badge" style={{ fontSize: '0.75rem', background: 'hsla(40, 95%, 55%, 0.15)', color: 'var(--accent-warning)' }}>spec v1.0</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>Instant 1-click download & copy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Audits Section */}
      <section className="container" style={{ marginTop: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Recent Diagnostic Runs</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Past crawl reports and performance snapshots.</p>
          </div>
          <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
            {audits.length} audits logged
          </span>
        </div>

        {audits.length === 0 ? (
          <div className="card empty-state" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <Activity size={32} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No audits executed yet</h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
              Type any website URL in the command bar above or choose a preset like Stripe or Vercel to launch your first AEO audit.
            </p>
          </div>
        ) : (
          <div className="audit-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {audits.map(audit => (
              <Link 
                href={`/audit/${audit.id}`} 
                key={audit.id} 
                className="audit-list-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.35rem',
                  background: 'linear-gradient(145deg, hsla(225, 25%, 13%, 0.7), hsla(225, 25%, 9%, 0.8))',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div className="audit-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <Search size={16} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {audit.url}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      <span className={`status-badge ${audit.status}`}>
                        {audit.status}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} />
                        {new Date(audit.created_at).toLocaleDateString()} {new Date(audit.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  {audit.status === 'completed' && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: `var(${getScoreColor(audit.overall_score)})` }}>
                          {audit.overall_score}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>/100</span>
                        <span className="badge" style={{ marginLeft: '0.35rem', background: 'hsla(225, 20%, 20%, 0.6)' }}>
                          {getScoreGrade(audit.overall_score)}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Overall AEO Score</span>
                    </div>
                  )}
                  <ArrowUpRight size={18} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
