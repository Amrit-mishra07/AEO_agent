import Link from 'next/link';

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="header-logo">
          <span className="header-logo-icon"></span>
          AEO Copilot
        </Link>
        <nav className="header-nav">
          <Link href="/dashboard" className="header-nav-link">Dashboard</Link>
          <a 
            href="https://docs.aeocopilot.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="header-nav-link"
          >
            Documentation
          </a>
        </nav>
      </div>
    </header>
  );
}
