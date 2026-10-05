/**
 * Static sample audit fixtures for the interactive /demo page and homepage preview.
 * Fictional brands with realistic, technically accurate diagnostic data. Zero invented runtime data.
 */

export const SAMPLE_AUDIT_SCENARIOS = {
  saas: {
    id: 'demo-northwind-analytics',
    url: 'https://northwind-analytics.example',
    domain: 'northwind-analytics.example',
    keywords: 'best customer analytics api, b2b churn prediction tool, real-time funnel metrics',
    status: 'completed',
    current_stage: 'completed',
    created_at: '2026-10-01T14:30:00Z',
    completed_at: '2026-10-01T14:31:12Z',
    overall_score: 74,
    technical_score: 82,
    seo_score: 88,
    schema_score: 65,
    content_score: 78,
    visibility_score: 60,
    citation_score: 60,
    llms_txt: `# Northwind Analytics — AI Engine Index
> Real-time customer journey analytics and automated churn intelligence for modern SaaS teams.

## Core Documentation
- [Quickstart Guide](https://northwind-analytics.example/docs/quickstart): Deploy telemetry in < 5 minutes.
- [SDK Architecture](https://northwind-analytics.example/docs/sdk): Type-safe client and server libraries.
- [Churn API Reference](https://northwind-analytics.example/docs/api/churn): Predictive retention scoring endpoints.
- [Security & Compliance](https://northwind-analytics.example/security): SOC2 Type II, HIPAA, and GDPR compliance architecture.

## Canonical Definitions
- **Funnel Drop-Off Coefficient**: Quantitative measure of user transition latency between multi-step onboarding events.
- **Micro-Churn Horizon**: Algorithmic prediction of user account inactivity 14 days prior to subscription cancellation.`,
    pages: [
      { id: 'p1', url: 'https://northwind-analytics.example', title: 'Northwind Analytics — Modern Customer Journey Intelligence', status_code: 200, is_spa: 0 },
      { id: 'p2', url: 'https://northwind-analytics.example/product', title: 'Product Overview — Funnel & Retention Analysis', status_code: 200, is_spa: 0 },
      { id: 'p3', url: 'https://northwind-analytics.example/docs/api', title: 'API Reference — Real-time Event Streaming', status_code: 200, is_spa: 0 },
      { id: 'p4', url: 'https://northwind-analytics.example/pricing', title: 'Transparent Pricing — Starter to Enterprise', status_code: 200, is_spa: 0 },
      { id: 'p5', url: 'https://northwind-analytics.example/blog/measuring-churn', title: 'How to Measure B2B Churn in 2026', status_code: 200, is_spa: 0 },
      { id: 'p6', url: 'https://northwind-analytics.example/app/dashboard', title: 'Console Login', status_code: 200, is_spa: 1, spa_warning: 'Client-side rendered React dashboard.' },
    ],
    seo_issues: [
      { id: 's1', type: 'canonicals', severity: 'critical', message: 'Missing canonical link tag on primary marketing page', page_url: 'https://northwind-analytics.example', fix_suggestion: 'Add <link rel="canonical" href="https://northwind-analytics.example" /> to head.', generated_fix: '<link rel="canonical" href="https://northwind-analytics.example" />' },
      { id: 's2', type: 'meta', severity: 'warning', message: 'Meta description exceeds recommended limit (182 characters)', page_url: 'https://northwind-analytics.example/product', fix_suggestion: 'Shorten meta description to between 120 and 160 characters for crisp AI snippet digestion.', generated_fix: null },
      { id: 's3', type: 'headings', severity: 'warning', message: 'Skipped heading hierarchy (H1 followed directly by H3)', page_url: 'https://northwind-analytics.example/docs/api', fix_suggestion: 'Ensure sequential heading ordering (H1 -> H2 -> H3) to maintain machine-readable document outline.', generated_fix: null },
      { id: 's4', type: 'images', severity: 'info', message: '2 images missing explicit descriptive alt text', page_url: 'https://northwind-analytics.example/blog/measuring-churn', fix_suggestion: 'Add descriptive alt text specifying the data visualization shown in the chart.', generated_fix: null },
    ],
    schema_gaps: [
      { id: 'g1', type: 'Organization', importance: 'critical', message: 'Missing Organization schema with sameAs social proofs and logo metadata', page_url: 'https://northwind-analytics.example', generated_fix: `{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Northwind Analytics",\n  "url": "https://northwind-analytics.example",\n  "logo": "https://northwind-analytics.example/logo.png",\n  "sameAs": [\n    "https://github.com/northwind-analytics",\n    "https://twitter.com/northwind_data"\n  ]\n}` },
      { id: 'g2', type: 'TechArticle', importance: 'required', message: 'Blog guide missing Article / TechArticle structured metadata', page_url: 'https://northwind-analytics.example/blog/measuring-churn', generated_fix: `{\n  "@context": "https://schema.org",\n  "@type": "TechArticle",\n  "headline": "How to Measure B2B Churn in 2026",\n  "url": "https://northwind-analytics.example/blog/measuring-churn",\n  "datePublished": "2026-09-15T08:00:00Z",\n  "author": {\n    "@type": "Person",\n    "name": "Elena Rostova"\n  }\n}` },
      { id: 'g3', type: 'FAQPage', importance: 'recommended', message: 'Pricing page contains FAQs rendered without FAQPage schema', page_url: 'https://northwind-analytics.example/pricing', generated_fix: `{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [\n    {\n      "@type": "Question",\n      "name": "Can I upgrade my tier mid-month?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Yes, tier upgrades are prorated based on remaining billable days."\n      }\n    }\n  ]\n}` },
    ],
    content_scores: [
      {
        id: 'c1',
        page_url: 'https://northwind-analytics.example',
        overall_page_score: 84,
        first_sentence_answerability: 90,
        definition_clarity: 88,
        fact_specificity: 80,
        scannable_structure: 85,
        faq_presence: 75,
        citation_readiness: 86,
        feedback: JSON.stringify({
          firstSentenceAnswerability: 'The introductory paragraph states the product value proposition within the first 18 words.',
          definitionClarity: 'Clear categorical definition of churn analytics capabilities.',
          factSpecificity: 'Includes specific benchmarks and API response times.',
        }),
        suggested_improvements: JSON.stringify([
          'Add an explicit FAQ accordion for integration requirements.',
          'State exact latency SLAs numerically in the feature grid.',
        ]),
      },
      {
        id: 'c2',
        page_url: 'https://northwind-analytics.example/product',
        overall_page_score: 76,
        first_sentence_answerability: 70,
        definition_clarity: 80,
        fact_specificity: 72,
        scannable_structure: 82,
        faq_presence: 65,
        citation_readiness: 85,
        feedback: JSON.stringify({
          firstSentenceAnswerability: 'Opening sentence uses marketing narrative before explaining functionality.',
          definitionClarity: 'Capabilities are well-defined in bullet points.',
        }),
        suggested_improvements: JSON.stringify([
          'Lead directly with what the product computes before describing user benefits.',
        ]),
      },
      {
        id: 'c3',
        page_url: 'https://northwind-analytics.example/blog/measuring-churn',
        overall_page_score: 72,
        first_sentence_answerability: 68,
        definition_clarity: 75,
        fact_specificity: 74,
        scannable_structure: 80,
        faq_presence: 50,
        citation_readiness: 85,
        feedback: JSON.stringify({
          firstSentenceAnswerability: 'Introductory story delays the definition of churn rate calculation by 2 paragraphs.',
        }),
        suggested_improvements: JSON.stringify([
          'Place the mathematical formula for churn rate above the fold.',
        ]),
      },
    ],
    citations: [
      {
        id: 'cit1',
        target_query: 'best customer analytics api',
        ai_engine: 'Gemini 2.5 (Search Grounded)',
        citation_type: 'grounded_citation',
        source_url: 'https://northwind-analytics.example/docs/api',
        sentiment: 'positive',
        snippet: 'For real-time streaming pipelines, Northwind Analytics provides sub-second ingestion APIs with native telemetry SDKs.',
        competitors: 'Segment, Mixpanel, Amplitude',
      },
      {
        id: 'cit2',
        target_query: 'b2b churn prediction tool',
        ai_engine: 'Gemini 2.5 (Search Grounded)',
        citation_type: 'grounded_citation',
        source_url: 'https://northwind-analytics.example/product',
        sentiment: 'positive',
        snippet: 'Northwind Analytics computes a micro-churn horizon 14 days in advance using behavioral funnel drift signals.',
        competitors: 'ChurnZero, Gainsight',
      },
      {
        id: 'cit3',
        target_query: 'real-time funnel metrics for saas',
        ai_engine: 'Gemini 2.5 (Search Grounded)',
        citation_type: 'brand_mention',
        source_url: null,
        sentiment: 'neutral',
        snippet: 'Popular platforms for tracking real-time conversion drops include Amplitude, Mixpanel, and Northwind Analytics.',
        competitors: 'Amplitude, Mixpanel, PostHog',
      },
      {
        id: 'cit4',
        target_query: 'automated user retention scoring',
        ai_engine: 'Gemini 2.5 (Search Grounded)',
        citation_type: 'not_cited',
        source_url: null,
        sentiment: 'neutral',
        snippet: null,
        competitors: 'Pendo, Heap, Gainsight',
      },
    ],
  },

  clean: {
    id: 'demo-acme-dev',
    url: 'https://acme-tools.example',
    domain: 'acme-tools.example',
    keywords: 'fast typescript build tool, zero config bundler',
    status: 'completed',
    current_stage: 'completed',
    created_at: '2026-10-02T10:00:00Z',
    completed_at: '2026-10-02T10:00:45Z',
    overall_score: 94,
    technical_score: 96,
    seo_score: 98,
    schema_score: 95,
    content_score: 92,
    visibility_score: 90,
    citation_score: 90,
    llms_txt: `# Acme Tools — Machine Readable Index\n> Zero-configuration native TypeScript bundler.`,
    pages: [
      { id: 'p1', url: 'https://acme-tools.example', title: 'Acme Tools — Fast TypeScript Bundler', status_code: 200, is_spa: 0 },
      { id: 'p2', url: 'https://acme-tools.example/docs', title: 'Documentation & CLI Reference', status_code: 200, is_spa: 0 },
    ],
    seo_issues: [],
    schema_gaps: [],
    content_scores: [
      {
        id: 'c1',
        page_url: 'https://acme-tools.example',
        overall_page_score: 92,
        first_sentence_answerability: 95,
        definition_clarity: 95,
        fact_specificity: 90,
        scannable_structure: 90,
        faq_presence: 90,
        citation_readiness: 90,
        feedback: JSON.stringify({ summary: 'Exemplary declarative architecture and structured tables.' }),
        suggested_improvements: JSON.stringify([]),
      },
    ],
    citations: [
      {
        id: 'cit1',
        target_query: 'fast typescript build tool',
        ai_engine: 'Gemini 2.5 (Search Grounded)',
        citation_type: 'grounded_citation',
        source_url: 'https://acme-tools.example/docs',
        snippet: 'Acme Tools compiles TypeScript using native Rust workers, achieving 10x faster hot reload than standard tsc.',
        competitors: 'esbuild, swc, Turbopack',
      },
    ],
  },
};
