'use client';

import Link from 'next/link';
import { 
  RotateCcw, 
  ArrowLeft, 
  ShieldAlert, 
  WifiOff, 
  KeyRound, 
  Clock 
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Disclosure from '@/components/ui/Disclosure';

function diagnoseFailure(audit) {
  const url = audit?.url || '';
  const stage = (audit?.current_stage || '').toLowerCase();

  // SSRF check
  if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('10.') || url.includes('192.168.')) {
    return {
      category: 'Security boundary restriction (SSRF)',
      icon: ShieldAlert,
      message: 'The target address resolves to a local or private network address, which is blocked by crawler security guards.',
      action: 'Run audits only against publicly accessible domain names.'
    };
  }

  // Crawl stage failure
  if (stage === 'crawl' || stage === 'crawling' || stage === 'pending') {
    return {
      category: 'Target site unreachable or blocked',
      icon: WifiOff,
      message: 'The crawler could not establish a connection to the target server or was denied access.',
      action: 'Verify that the website is publicly online, responds over standard HTTPS, and is not behind aggressive Cloudflare/WAF bot challenges or CAPTCHAs.'
    };
  }

  // AI scoring / Gemini failure
  if (stage === 'content' || stage === 'citation' || stage === 'llms_txt' || stage === 'fixes') {
    return {
      category: 'Gemini API inference or rate limit error',
      icon: KeyRound,
      message: `The diagnostic failed during the "${stage}" phase while communicating with Gemini API services.`,
      action: 'Verify that the GEMINI_API_KEY environment variable is configured and has sufficient quota available.'
    };
  }

  // Timeout / General
  return {
    category: 'Diagnostic execution timeout',
    icon: Clock,
    message: 'The audit pipeline exceeded its execution threshold before all stages completed.',
    action: 'Try again with fewer target questions, or verify the target site response latency.'
  };
}

export default function FailedState({ audit }) {
  const diagnosis = diagnoseFailure(audit);
  const Icon = diagnosis.icon;

  const retryUrl = audit?.url 
    ? `/?url=${encodeURIComponent(audit.url)}${audit.keywords ? `&questions=${encodeURIComponent(audit.keywords)}` : ''}`
    : '/';

  return (
    <div className="container" style={{ maxWidth: '720px', margin: '3.5rem auto', padding: '0 1.5rem' }}>
      <div 
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          padding: '2.5rem 2rem',
        }}
      >
        {/* Error Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
          <div 
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bad-bg)',
              border: '1px solid var(--bad-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--bad)',
              flexShrink: 0,
            }}
          >
            <Icon size={22} />
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bad)', marginBottom: '0.25rem' }}>
              {diagnosis.category}
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.35rem 0', color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Diagnostic could not be completed
            </h1>
            <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-2)' }}>
              {audit?.url || 'Unknown target'}
            </p>
          </div>
        </div>

        {/* Diagnostic Explanation */}
        <div 
          style={{
            padding: '1.25rem',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem',
          }}
        >
          <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.6 }}>
            {diagnosis.message}
          </p>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.5, borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
            <strong style={{ color: 'var(--text)' }}>Recommended action: </strong>
            {diagnosis.action}
          </div>
        </div>

        {/* Specific Pipeline Error if captured */}
        {(audit?.error_message || audit?.errorMessage) && (
          <div 
            style={{
              padding: '0.75rem 1rem',
              background: 'var(--bad-bg)',
              border: '1px solid var(--bad-border)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.75rem',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--bad)',
            }}
          >
            <strong>Root cause: </strong>
            {audit.error_message || audit.errorMessage}
          </div>
        )}

        {/* Technical Details for Developers */}
        <div style={{ marginBottom: '2rem' }}>
          <Disclosure 
            title="Technical diagnostic metadata" 
            badge={audit?.id ? audit.id.slice(0, 8) : undefined}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: 'var(--text-3)' }}>Audit ID:</span>
              <span style={{ color: 'var(--text-2)' }}>{audit?.id || '—'}</span>

              <span style={{ color: 'var(--text-3)' }}>Target URL:</span>
              <span style={{ color: 'var(--text-2)' }}>{audit?.url || '—'}</span>

              <span style={{ color: 'var(--text-3)' }}>Last Stage:</span>
              <span style={{ color: 'var(--text-2)' }}>{audit?.current_stage || 'unknown'}</span>

              <span style={{ color: 'var(--text-3)' }}>Status:</span>
              <span style={{ color: 'var(--bad)' }}>{audit?.status || 'failed'}</span>

              {(audit?.error_message || audit?.errorMessage) && (
                <>
                  <span style={{ color: 'var(--text-3)' }}>Error Details:</span>
                  <span style={{ color: 'var(--bad)', wordBreak: 'break-word' }}>
                    {audit.error_message || audit.errorMessage}
                  </span>
                </>
              )}

              {audit?.created_at && (
                <>
                  <span style={{ color: 'var(--text-3)' }}>Timestamp:</span>
                  <span style={{ color: 'var(--text-2)' }}>{audit.created_at}</span>
                </>
              )}
            </div>
          </Disclosure>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button as={Link} href={retryUrl} variant="primary" icon={RotateCcw}>
            Try again with this URL
          </Button>
          <Button as={Link} href="/" variant="secondary" icon={ArrowLeft}>
            Return to audit console
          </Button>
        </div>
      </div>
    </div>
  );
}
