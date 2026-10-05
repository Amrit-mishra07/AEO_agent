import Skeleton from '@/components/ui/Skeleton';

export default function ReportSkeleton() {
  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem', maxWidth: '1200px' }} aria-busy="true" aria-label="Loading audit report">
      {/* Breadcrumb skeleton */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <Skeleton width="50px" height="14px" />
        <span style={{ color: 'var(--border-strong)' }}>/</span>
        <Skeleton width="60px" height="14px" />
        <span style={{ color: 'var(--border-strong)' }}>/</span>
        <Skeleton width="120px" height="14px" />
      </div>

      {/* Header banner skeleton */}
      <div 
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Skeleton width="90px" height="24px" radius="var(--radius-full)" />
            <Skeleton width="110px" height="24px" radius="var(--radius-full)" />
          </div>
          <Skeleton width="320px" height="32px" style={{ marginBottom: '0.75rem' }} />
          <Skeleton width="220px" height="16px" />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Skeleton width="100px" height="36px" radius="var(--radius-sm)" />
          <Skeleton width="120px" height="36px" radius="var(--radius-sm)" />
        </div>
      </div>

      {/* Subnav skeleton */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'hidden' }}>
        <Skeleton width="110px" height="36px" radius="var(--radius-sm)" />
        <Skeleton width="130px" height="36px" radius="var(--radius-sm)" />
        <Skeleton width="120px" height="36px" radius="var(--radius-sm)" />
        <Skeleton width="140px" height="36px" radius="var(--radius-sm)" />
        <Skeleton width="110px" height="36px" radius="var(--radius-sm)" />
      </div>

      {/* KPI Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Main Gauge Card */}
        <div 
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
          }}
        >
          <Skeleton width="140px" height="16px" />
          <Skeleton width="130px" height="130px" radius="50%" />
          <Skeleton width="160px" height="24px" radius="var(--radius-full)" />
        </div>

        {/* 4 Vector Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <Skeleton width="80px" height="14px" />
              <Skeleton width="70px" height="70px" radius="50%" />
              <Skeleton width="100px" height="14px" />
            </div>
          ))}
        </div>
      </div>

      {/* Section Content Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div 
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
          }}
        >
          <Skeleton width="220px" height="24px" style={{ marginBottom: '1rem' }} />
          <Skeleton width="100%" height="80px" style={{ marginBottom: '0.75rem' }} />
          <Skeleton width="100%" height="80px" />
        </div>
      </div>
    </div>
  );
}
