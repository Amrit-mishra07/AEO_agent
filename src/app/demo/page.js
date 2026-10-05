'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SAMPLE_AUDIT_SCENARIOS } from '@/view/fixtures/sample-audit';
import { toAuditViewModel } from '@/view/audit-view-model';
import { extractPriorityFixes } from '@/view/priority';
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
import MethodologyNote from '@/components/report/MethodologyNote';
import NextStepsFooter from '@/components/report/NextStepsFooter';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ArrowLeft, Sparkles, Home, Layers } from 'lucide-react';

export default function DemoPage() {
  const [scenarioKey, setScenarioKey] = useState('saas');

  const rawAudit = SAMPLE_AUDIT_SCENARIOS[scenarioKey] || SAMPLE_AUDIT_SCENARIOS.saas;
  const viewModel = toAuditViewModel(rawAudit, []);
  const priorityFixes = extractPriorityFixes(viewModel);

  return (
    <div className="container page-content" style={{ paddingBottom: '5rem' }}>
      
      {/* Demo Sandbox Alert Banner */}
      <div
        style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--accent)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant="brand" size="md">Demo Sandbox</Badge>
          <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
            Exploring realistic pre-computed diagnostic data. <strong>Zero API key or configuration required.</strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600 }}>Preset:</span>
            <button
              type="button"
              onClick={() => setScenarioKey('saas')}
              className={`btn btn-sm ${scenarioKey === 'saas' ? 'btn-primary' : 'btn-secondary'}`}
            >
              B2B SaaS (74 C+)
            </button>
            <button
              type="button"
              onClick={() => setScenarioKey('clean')}
              className={`btn btn-sm ${scenarioKey === 'clean' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Optimized Baseline (94 A)
            </button>
          </div>

          <Button as={Link} href="/" variant="primary" size="sm">
            Audit Your Own Site
          </Button>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: '1.25rem' }}>
        <Link href="/" style={{ color: 'var(--text-2)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}>
          <Home size={14} /> Home
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text)', fontWeight: 600 }}>
          Interactive Demo
        </span>
        <span>/</span>
        <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
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

      {/* Executive Summary & 4-Vector Breakdown */}
      <ExecutiveSummary audit={viewModel} />

      {/* Top Priority Fixes */}
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

      {/* AI Citation Prober */}
      <VisibilitySection 
        citations={viewModel.citations} 
        domain={viewModel.domain} 
      />

      {/* Generated llms.txt Studio */}
      <LlmsTxtSection 
        content={viewModel.llmsTxt} 
      />

      {/* Crawled Pages Surface */}
      <PagesSection 
        pages={viewModel.pages} 
      />

      {/* Methodology Note */}
      <MethodologyNote />

      {/* Next Steps Footer */}
      <NextStepsFooter />

    </div>
  );
}
