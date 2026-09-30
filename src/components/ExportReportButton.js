'use client';

import { useState } from 'react';
import { FileDown, FileCode, Share2, Check, Download } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function ExportReportButton({ audit }) {
  const [downloading, setDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const toast = useToast();

  const downloadFile = (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success('Report URL copied to clipboard');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleExportJSON = () => {
    setDownloading(true);
    try {
      const cleanUrl = (audit.url || 'audit').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${cleanUrl}_audit_report.json`;
      const jsonContent = JSON.stringify(audit, null, 2);
      downloadFile(filename, jsonContent, 'application/json');
      toast.success('JSON report downloaded successfully');
    } catch {
      toast.error('Failed to export JSON report');
    } finally {
      setDownloading(false);
    }
  };

  const handleExportMarkdown = () => {
    setDownloading(true);
    try {
      const cleanUrl = (audit.url || 'audit').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${cleanUrl}_audit_report.md`;

      const md = [
        `# AEO & SEO Audit Report: ${audit.url}`,
        ``,
        `- **Status:** ${audit.status}`,
        `- **Completed:** ${audit.completed_at ? new Date(audit.completed_at).toLocaleString() : 'N/A'}`,
        `- **Overall Score:** ${audit.overall_score ?? 'N/A'}/100`,
        `- **SEO Score:** ${audit.seo_score ?? 'N/A'}/100`,
        `- **Schema Score:** ${audit.schema_score ?? 'N/A'}/100`,
        `- **Content Score:** ${audit.content_score ?? 'N/A'}/100`,
        `- **Citation Rate:** ${audit.citation_score ?? 'N/A'}%`,
        ``,
        `---`,
        ``,
        `## Technical SEO Issues (${(audit.seo_issues || []).length})`,
        ...((audit.seo_issues || []).map(i => 
          `- **[${(i.severity || 'info').toUpperCase()}]** ${i.type || i.category}: ${i.message || i.issue} (${i.page_url || i.url || 'Site-wide'})\n  *Fix:* ${i.fix_suggestion || i.fixSuggestion || 'None'}`
        )),
        ``,
        `## Schema Gaps (${(audit.schema_gaps || []).length})`,
        ...((audit.schema_gaps || []).map(g => 
          `- **${g.type || g.schemaType}** [${g.importance || g.status}]: ${g.message || g.details} (${g.page_url || g.pageUrl || 'Site-wide'})${g.generated_fix || g.generatedFix ? '\n  ```json\n  ' + (g.generated_fix || g.generatedFix) + '\n  ```' : ''}`
        )),
        ``,
        `## Granular Content Extractability`,
        ...((audit.content_scores || []).map(c => 
          `### Page: ${c.page_url}\n- Overall Page Score: ${c.overall_page_score}/100\n- First Sentence Answerability: ${c.first_sentence_answerability}/100\n- Definition Clarity: ${c.definition_clarity}/100\n- Fact Specificity: ${c.fact_specificity}/100\n- Scannable Structure: ${c.scannable_structure}/100\n- FAQ Presence: ${c.faq_presence}/100\n- Citation Readiness: ${c.citation_readiness}/100\n- Feedback: ${c.feedback || 'None'}\n`
        )),
        ``,
        `## llms.txt`,
        '```markdown',
        audit.llms_txt || 'No llms.txt generated',
        '```'
      ].join('\n');

      downloadFile(filename, md, 'text/markdown');
      toast.success('Markdown report downloaded successfully');
    } catch {
      toast.error('Failed to export Markdown report');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="export-actions" style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <button 
        type="button" 
        className="btn btn-secondary btn-sm"
        onClick={handleCopyLink}
        title="Copy link to this report"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem' }}
      >
        {copiedLink ? <Check size={14} style={{ color: 'var(--accent-primary)' }} /> : <Share2 size={14} />}
        <span>{copiedLink ? 'Copied' : 'Share'}</span>
      </button>

      <button 
        type="button" 
        className="btn btn-secondary btn-sm"
        onClick={handleExportMarkdown}
        disabled={downloading}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem' }}
      >
        <FileDown size={14} />
        <span>Markdown</span>
      </button>

      <button 
        type="button" 
        className="btn btn-secondary btn-sm"
        onClick={handleExportJSON}
        disabled={downloading}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem' }}
      >
        <FileCode size={14} />
        <span>JSON</span>
      </button>
    </div>
  );
}
