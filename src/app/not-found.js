import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container page-content">
      <div className="empty-state">
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--accent)' }}>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn&apos;t exist or has been moved.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
          Return Home
        </Link>
      </div>
    </div>
  );
}
