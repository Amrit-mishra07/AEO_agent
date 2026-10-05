'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Search, Code2, Layers, Bot, Sparkles, Check, Clock, Lightbulb } from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'crawl', label: 'Site Crawler', icon: Globe, desc: 'Extracting pages, links & metadata' },
  { id: 'seo', label: 'Technical SEO', icon: Search, desc: 'Analyzing titles, H1s, viewport & canonicals' },
  { id: 'schema', label: 'Schema Engine', icon: Code2, desc: 'Validating JSON-LD & identifying gaps' },
  { id: 'content', label: 'AEO Scorer', icon: Layers, desc: 'Scoring 6 dimensions with Gemini 2.5' },
  { id: 'citation', label: 'Citation Probe', icon: Bot, desc: 'Simulating AI engine grounding' },
  { id: 'fixes', label: 'Fix Synthesis', icon: Sparkles, desc: 'Generating schemas & llms.txt' },
];

const AEO_TIPS = [
  'Answer engines prioritize concise, declarative definitions within the first 30 words of an article.',
  'Structured FAQPage and Article schemas help web crawlers index key facts with precision.',
  'An /llms.txt file gives AI web crawlers a curated markdown index of your documentation.',
  'High fact-specificity with dates and verifiable metrics prevents hallucination during retrieval.',
];

export function AuditLoadingState({ auditId, url }) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  // Live stopwatch counter
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Animate through pipeline steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev < PIPELINE_STAGES.length - 1 ? prev + 1 : prev));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Rotate educational tips
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % AEO_TIPS.length);
    }, 6000);
    return () => clearInterval(tipInterval);
  }, []);

  // Poll the API to check audit completion & update stage
  useEffect(() => {
    if (!auditId) return;

    const STAGE_INDEX_MAP = {
      crawl: 0,
      seo: 1,
      schema: 2,
      content: 3,
      citation: 4,
      fixes: 5,
      completed: 5,
    };

    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/audit?id=${auditId}`);
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.current_stage && STAGE_INDEX_MAP[data.current_stage] !== undefined) {
          setActiveStep(prev => Math.max(prev, STAGE_INDEX_MAP[data.current_stage]));
        }

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(poll);
          router.refresh();
        }
      } catch {
        // Silently ignore polling network errors
      }
    }, 2500);

    return () => clearInterval(poll);
  }, [auditId, router]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container page-content" style={{ maxWidth: '840px', margin: '2rem auto', textAlign: 'center' }}>
      <div 
        className="card"
        style={{
          background: 'linear-gradient(145deg, hsla(225, 25%, 13%, 0.8), hsla(225, 25%, 8%, 0.95))',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          padding: '3rem 2rem',
          boxShadow: '0 20px 60px -15px hsla(0, 0%, 0%, 0.7)'
        }}
      >
        {/* Pulsing radar icon */}
        <div style={{ position: 'relative', width: '64px', height: '64px', margin: '0 auto 1.5rem' }}>
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'hsla(155, 80%, 50%, 0.2)',
              animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
          <div 
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'var(--gradient-card)',
              border: '2px solid var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px hsla(155, 80%, 50%, 0.4)'
            }}
          >
            <Sparkles size={28} style={{ color: 'var(--accent-primary)' }} />
          </div>
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
          Running Deep AEO Diagnostics
        </h2>

        {url && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-secondary)', marginBottom: '1.5rem' }}>
            Target: {url}
          </p>
        )}

        {/* Live Stopwatch Badge */}
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'hsla(225, 20%, 15%, 0.7)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
            marginBottom: '2.5rem'
          }}
        >
          <Clock size={13} />
          <span>Elapsed Time: {formatTime(seconds)}</span>
        </div>

        {/* Pipeline Stepper */}
        <div className="pipeline-stepper" style={{ marginBottom: '2.5rem' }}>
          {PIPELINE_STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const isCompleted = i < activeStep;
            const isActive = i === activeStep;

            return (
              <div 
                key={stage.id} 
                className={`pipeline-step ${isCompleted ? 'completed' : isActive ? 'active' : ''}`}
                style={{ flex: 1 }}
              >
                <div className="pipeline-node">
                  {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span className="pipeline-label">{stage.label}</span>
              </div>
            );
          })}
        </div>

        {/* Current Stage Description */}
        <div 
          style={{
            padding: '1rem 1.5rem',
            background: 'hsla(225, 25%, 10%, 0.7)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem'
          }}
        >
          <div className="loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Stage {activeStep + 1} of {PIPELINE_STAGES.length}: {PIPELINE_STAGES[activeStep].desc}
          </span>
        </div>

        {/* Rotating Educational Tip */}
        <div 
          style={{
            padding: '0.85rem 1.25rem',
            background: 'hsla(200, 90%, 55%, 0.06)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid hsla(200, 90%, 55%, 0.18)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.65rem',
            maxWidth: '650px',
            textAlign: 'left'
          }}
        >
          <Lightbulb size={16} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
            <strong style={{ color: 'var(--accent-secondary)' }}>AEO Best Practice: </strong>
            {AEO_TIPS[tipIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ReportSkeleton() {
  return (
    <div className="report-skeleton">
      <div className="skeleton skeleton-title" style={{ width: '60%', height: '2rem', marginBottom: '1rem' }}></div>
      <div className="skeleton skeleton-text" style={{ width: '40%', height: '1rem', marginBottom: '2rem' }}></div>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="skeleton skeleton-gauge" style={{ width: '140px', height: '140px', borderRadius: '50%' }}></div>
        <div className="skeleton skeleton-gauge" style={{ width: '140px', height: '140px', borderRadius: '50%' }}></div>
        <div className="skeleton skeleton-gauge" style={{ width: '140px', height: '140px', borderRadius: '50%' }}></div>
      </div>

      <div className="skeleton skeleton-card" style={{ width: '100%', height: '200px', borderRadius: '8px', marginBottom: '2rem' }}></div>
      <div className="skeleton skeleton-card" style={{ width: '100%', height: '200px', borderRadius: '8px' }}></div>
    </div>
  );
}
