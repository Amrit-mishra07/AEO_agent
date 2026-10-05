import { ImageResponse } from 'next/og';

export const alt = 'AEO Agent — Answer Engine Optimization Audit';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background: '#FFFFFF',
          color: '#12151C',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#0B7A4B',
            }}
          />
          <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: '#12151C' }}>
            AEO Agent
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              fontSize: 60,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              margin: 0,
              lineHeight: 1.15,
              color: '#12151C',
            }}
          >
            Does AI recommend your brand?
          </div>
          <div
            style={{
              fontSize: 24,
              color: '#4A5365',
              margin: 0,
              lineHeight: 1.45,
              maxWidth: 900,
            }}
          >
            Technical crawl hygiene, Schema.org gap analysis, 6-dimension extractability, and Gemini citation probes.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #E2E5EA',
            paddingTop: '24px',
            fontSize: 20,
            color: '#667085',
          }}
        >
          <span>Transparent AEO Diagnostics</span>
          <span>Open Source (MIT)</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
