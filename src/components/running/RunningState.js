'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Globe, 
  Search, 
  Code2, 
  Layers, 
  FileText, 
  Bot, 
  Wrench, 
  Check, 
  Clock, 
  Lightbulb, 
  ArrowLeft,
  Loader2
} from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'crawl', aliases: ['crawl', 'crawling'], label: 'Crawl site', icon: Globe, desc: 'Boundary-guarded crawl (up to 10 pages, depth 1)' },
  { id: 'seo', aliases: ['seo'], label: 'Technical SEO', icon: Search, desc: 'Evaluating 12 technical hygiene and indexability rules' },
  { id: 'schema', aliases: ['schema'], label: 'Schema.org analysis', icon: Code2, desc: 'Detecting structured JSON-LD entities and missing gaps' },
  { id: 'content', aliases: ['content'], label: 'Content extractability', icon: Layers, desc: 'Scoring 6 extractability dimensions with Gemini 2.5 Flash' },
  { id: 'llms_txt', aliases: ['llms_txt', 'llms-txt'], label: 'Draft /llms.txt', icon: FileText, desc: 'Drafting proposed markdown index for AI crawlers' },
  { id: 'citation', aliases: ['citation', 'probing'], label: 'Citation probe', icon: Bot, desc: 'Probing Gemini visibility with Google Search Grounding' },
  { id: 'fixes', aliases: ['fixes'], label: 'Synthesize fixes', icon: Wrench, desc: 'Drafting structured JSON-LD, meta tags, and rewrites' },
];

const AEO_TIPS = [
  'Answer engines prioritize direct, declarative definitions within the first sentence of an article.',
  'Structured FAQPage and Article schemas help web crawlers index key facts without ambiguous parsing.',
  'An /llms.txt file provides AI web crawlers a curated markdown index of your documentation.',
  'High fact-specificity with dates, numbers, and verifiable metrics prevents hallucination during retrieval.',
  'Gemini citation probes test real-world retrieval against live search results, not static training data.',
];

function getStageIndex(currentStage) {
  if (!currentStage || currentStage === 'pending') return 0;
  const stage = currentStage.toLowerCase();
  for (let i = 0; i < PIPELINE_STAGES.length; i++) {
    if (PIPELINE_STAGES[i].aliases.includes(stage)) return i;
  }
  return 0;
}

export default function RunningState({ auditId, url }) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const isPollingRef = useRef(false);

  const isDoneRef = useRef(false);
  const secondsRef = useRef(0);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  // Live elapsed seconds stopwatch
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotating informative tips
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % AEO_TIPS.length);
    }, 7000);
    return () => clearInterval(tipInterval);
  }, []);

  // Polling with backoff and visibility awareness
  const checkStatus = useCallback(async () => {
    if (isDoneRef.current || isPollingRef.current || !auditId) return;

    isPollingRef.current = true;
    try {
      const res = await fetch(`/api/audit?id=${encodeURIComponent(auditId)}`);
      if (!res.ok) return;
      const data = await res.json();

      if (data.status === 'completed' || data.status === 'failed') {
        isDoneRef.current = true;
        router.refresh();
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
        return;
      }

      if (data.current_stage) {
        const idx = getStageIndex(data.current_stage);
        setActiveStep(prev => Math.max(prev, idx));
      }
    } catch {
      // Ignore network errors while polling
    } finally {
      isPollingRef.current = false;
    }
  }, [auditId, router]);

  useEffect(() => {
    let timerId;
    let isCancelled = false;

    const scheduleNext = () => {
      if (isCancelled || isDoneRef.current) return;
      // Backoff: 2.5s initial, 5s after 60 seconds
      const delay = secondsRef.current > 60 ? 5000 : 2500;
      timerId = setTimeout(async () => {
        await checkStatus();
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    const handleVisibilityChange = () => {
      if (!document.hidden && !isDoneRef.current) {
        checkStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isCancelled = true;
      clearTimeout(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkStatus]);

  const progressPercent = Math.min(
    95,
    Math.round(((activeStep + 0.3) / PIPELINE_STAGES.length) * 100)
  );

  const activeStage = PIPELINE_STAGES[activeStep] || PIPELINE_STAGES[0];

  return (
    <div className="container" style={{ maxWidth: '780px', margin: '3rem auto', padding: '0 1.5rem' }}>
      {/* Screen reader live updates */}
      <div 
        aria-live="polite" 
        className="sr-only" 
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
      >
        Stage {activeStep + 1} of {PIPELINE_STAGES.length}: {activeStage.label}. {activeStage.desc}
      </div>

      <div 
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          padding: '2.5rem 2rem',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="live-status-dot" style={{ width: 8, height: 8 }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)' }}>
                Diagnostic in progress
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.35rem 0', color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Analyzing Answer Engine Readiness
            </h1>
            <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-2)' }}>
              {url}
            </p>
          </div>

          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-2)',
            }}
          >
            <Clock size={13} style={{ color: 'var(--text-3)' }} />
            <span>Elapsed: {seconds}s</span>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.5rem', color: 'var(--text-2)' }}>
            <span>Stage {activeStep + 1} of {PIPELINE_STAGES.length}: <strong style={{ color: 'var(--text)' }}>{activeStage.label}</strong></span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{progressPercent}%</span>
          </div>
          <div 
            style={{ 
              height: 6, 
              background: 'var(--bg-sunken)', 
              borderRadius: 3, 
              overflow: 'hidden',
              border: '1px solid var(--border)' 
            }}
          >
            <div 
              style={{ 
                height: '100%', 
                width: `${progressPercent}%`, 
                background: 'var(--accent)', 
                transition: 'width 0.4s ease' 
              }} 
            />
          </div>
        </div>

        {/* Stage List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '2rem' }}>
          {PIPELINE_STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const isCompleted = i < activeStep;
            const isActive = i === activeStep;

            return (
              <div 
                key={stage.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'var(--accent-subtle)' : isCompleted ? 'transparent' : 'var(--bg-subtle)',
                  border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                  opacity: (!isActive && !isCompleted) ? 0.6 : 1,
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div 
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isCompleted ? 'var(--good-bg)' : isActive ? 'var(--accent)' : 'var(--bg)',
                    color: isCompleted ? 'var(--good)' : isActive ? '#ffffff' : 'var(--text-3)',
                    border: isCompleted ? '1px solid var(--good-border)' : isActive ? 'none' : '1px solid var(--border)',
                    flexShrink: 0,
                  }}
                >
                  {isCompleted ? <Check size={14} strokeWidth={2.5} /> : isActive ? <Loader2 size={14} className="loading-spinner" /> : <Icon size={14} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--text)' : isCompleted ? 'var(--text)' : 'var(--text-2)' }}>
                      {stage.label}
                    </span>
                    {isActive && (
                      <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: 3, background: 'var(--accent)', color: '#ffffff', fontWeight: 600 }}>
                        Active
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.15rem' }}>
                    {stage.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fact / Tip Card */}
        <div 
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            marginBottom: '1.75rem',
          }}
        >
          <Lightbulb size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>
              AEO Diagnostic Insight
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
              {AEO_TIPS[tipIndex]}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link 
            href="/" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '0.85rem', 
              color: 'var(--text-2)',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={14} /> Back to audit console
          </Link>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
            Status auto-refreshes every {seconds > 60 ? '5s' : '2.5s'}
          </span>
        </div>

      </div>
    </div>
  );
}
