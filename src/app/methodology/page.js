import React from 'react';
import Link from 'next/link';
import { Home, ShieldCheck, ArrowRight, Bot, Layers, Code2, Search } from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Methodology & Scoring System — AEO Agent',
  description: 'How AEO Agent evaluates answer engine readiness, technical crawler hygiene, content extractability, and Gemini citations.',
};

export default function MethodologyPage() {
  return (
    <div className="container page-content" style={{ maxWidth: '820px', paddingBottom: '5rem' }}>
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: '1.5rem' }}>
        <Link href="/" style={{ color: 'var(--text-2)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}>
          <Home size={14} /> Home
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text)', fontWeight: 600 }}>
          Methodology Specification
        </span>
      </nav>

      {/* Header */}
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.75rem 0', color: 'var(--text)' }}>
          AEO Diagnostic Methodology
        </h1>
        <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
          Transparent, deterministic, and evidence-backed evaluation standards for Answer Engine Optimization. No vanity scores, no fabricated boosts.
        </p>
      </header>

      {/* Core Principles */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text)' }}>
          1. What is Answer Engine Optimization?
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.65 }}>
          Traditional search engines index keywords to rank lists of links. Modern AI answer engines (such as Gemini, Perplexity, and AI Overviews) synthesize answers directly from web content.
          To be synthesized and cited by an answer engine, a website must be cleanly discoverable by automated crawlers, provide structured knowledge entities via Schema.org, and offer concise, declarative facts that can be extracted without semantic ambiguity.
        </p>
      </section>

      {/* 4 Diagnostic Vectors */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text)' }}>
          2. The Four Diagnostic Vectors & Scoring Weights
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
          When customer search queries are provided, the overall synthesis score is calculated using published, weighted formulas. If no search queries are provided, the score recalculates across the three technical readiness dimensions:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* SEO Vector */}
          <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Search size={16} style={{ color: 'var(--accent)' }} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
                Technical SEO & Crawler Hygiene (30% weight)
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.55 }}>
              Deterministic evaluation of 12 critical indexability rules: title length, meta description, viewport tag, canonical URL presence, H1 single-declaration, sequential heading hierarchy, image alt attributes, OpenGraph tags, and minimum substantive word count.
            </p>
          </div>

          {/* Schema Vector */}
          <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Code2 size={16} style={{ color: 'var(--accent)' }} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
                Schema.org Entity Coverage (25% weight)
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.55 }}>
              Validation of existing JSON-LD markup against high-impact knowledge graph schemas (Organization, WebSite, Article/TechArticle, FAQPage, Product). Unambiguous structured entities allow AI engines to parse identity and facts without hallucinating.
            </p>
          </div>

          {/* Content Vector */}
          <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Layers size={16} style={{ color: 'var(--accent)' }} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
                Content Extractability (25% weight)
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.55 }}>
              6-dimension evaluation conducted by Gemini 2.5 Flash: (1) First sentence answerability, (2) Definition clarity, (3) Fact specificity with verifiable metrics, (4) Scannable heading structure, (5) FAQ presence, and (6) Citation readiness.
            </p>
          </div>

          {/* Citation Vector */}
          <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Bot size={16} style={{ color: 'var(--accent)' }} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
                AI Citation Visibility (20% weight)
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.55 }}>
              Live simulated queries executed via Gemini 2.5 with Google Search Grounding (up to 5 queries). We observe whether Gemini retrieves your domain, cites a grounded source URL, mentions your brand name in text, or selects a competitor.
            </p>
          </div>
        </div>
      </section>

      {/* Grounding vs Mention */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text)' }}>
          3. Grounded Source Links vs. Text Mentions
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.65 }}>
          A grounded citation occurs when the answer engine explicitly returns your domain URL as an authoritative reference card or footnote in the synthesized answer.
          A brand mention occurs when the model includes your company name in conversational prose without linking to your site. AEO Agent weights grounded citations higher because they drive direct referral traffic and verify authoritative indexing.
        </p>
      </section>

      {/* Honesty Boundaries */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text)' }}>
          4. Honesty & Boundary Declarations
        </h2>
        <div style={{ padding: '1.25rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.65 }}>
            <li><strong>Only Gemini is probed:</strong> We probe Gemini with Google Search Grounding. We do not claim to probe ChatGPT, Perplexity, or Claude because our runtime pipeline uses Gemini APIs.</li>
            <li><strong>Sample size transparency:</strong> Probes test at most 5 queries per run. Generative models produce stochastic variation; results reflect a spot-check rather than global search index certainty.</li>
            <li><strong>llms.txt is an emerging proposal:</strong> The <code style={{ fontFamily: 'var(--font-mono)' }}>/llms.txt</code> file is a proposed specification. We provide valid markdown files, but engine adoption is voluntary.</li>
            <li><strong>Draft fixes require review:</strong> Auto-generated JSON-LD schemas and content rewrites are AI-assisted drafts. Always validate them before deploying to production.</li>
          </ul>
        </div>
      </section>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button as={Link} href="/demo" variant="primary">
          Explore Interactive Demo Report
        </Button>
        <Button as={Link} href="/" variant="secondary">
          Run an Audit
        </Button>
      </div>

    </div>
  );
}
