import React from 'react';
import Link from 'next/link';
import { APP_NAME, REPO_URL } from '@/config/site';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <div>
          <span>{APP_NAME} &bull; Open source (MIT) &bull; Built on Next.js and Gemini</span>
        </div>

        <div className="footer-links">
          <Link href="/demo" className="footer-link">
            Demo
          </Link>
          <Link href="/methodology" className="footer-link">
            Methodology
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
