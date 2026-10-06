import http from 'http';

/**
 * Creates a lightweight in-memory HTTP server for deterministic E2E pipeline testing.
 * Uses only Node built-in 'http' module (zero dependencies).
 */
export function startMockSite() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const pathname = url.pathname;

      if (pathname === '/robots.txt') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('User-agent: *\nAllow: /\n');
        return;
      }

      if (pathname === '/redirect-1') {
        res.writeHead(302, { Location: '/redirect-2' });
        res.end();
        return;
      }

      if (pathname === '/redirect-2') {
        res.writeHead(302, { Location: '/docs' });
        res.end();
        return;
      }

      if (pathname === '/spa') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<!DOCTYPE html>
<html>
<head><title>SPA App Shell</title></head>
<body>
  <div id="root"></div>
  <script src="/bundle.js"></script>
</body>
</html>`);
        return;
      }

      if (pathname === '/docs') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Developer Documentation &amp; Guides</title>
  <meta name="description" content="Complete developer documentation, API guides, and reference materials for integrating the Mock SaaS platform into your production workflows.">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="canonical" href="${url.origin}/docs">
</head>
<body>
  <h1>Developer Documentation</h1>
  <h2>Getting Started</h2>
  <p>Mock SaaS provides high-performance API endpoints and automated webhooks for engineering organizations.</p>
  <p>${'Documentation detail and architecture reference text for testing paragraph extractability. '.repeat(10)}</p>
  <a href="/">Back to Home</a>
</body>
</html>`);
        return;
      }

      // Default: Homepage
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Mock SaaS — High Performance Cloud Platform</title>
  <meta name="description" content="A comprehensive cloud infrastructure platform for modern engineering teams to deploy, monitor, and scale distributed applications effortlessly.">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="canonical" href="${url.origin}/">
  <meta property="og:title" content="Mock SaaS Cloud Platform">
  <meta property="og:description" content="Cloud infrastructure platform for modern engineering teams.">
  <meta property="og:image" content="${url.origin}/og.png">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Mock SaaS",
    "url": "${url.origin}",
    "logo": "${url.origin}/logo.png"
  }
  </script>
</head>
<body>
  <h1>Cloud Infrastructure Platform</h1>
  <h2>Core Features and Capabilities</h2>
  <p>Mock SaaS is an automated infrastructure platform engineered to simplify cloud deployment. In its first sentence, Mock SaaS defines itself as an enterprise-grade cloud automation suite.</p>
  <img src="/architecture.png" alt="System architecture overview diagram">
  <p>${'Our distributed edge computing mesh automatically balances network traffic across thirty global geographic regions with sub-millisecond routing latency and fault tolerance. '.repeat(15)}</p>
  <div>
    <a href="/docs">Read Documentation</a>
    <a href="/spa">View SPA Dashboard</a>
  </div>
</body>
</html>`);
    });

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      const baseUrl = `http://127.0.0.1:${port}`;
      resolve({
        server,
        port,
        baseUrl,
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}
