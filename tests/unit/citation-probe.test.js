import { describe, it, expect } from 'vitest';
import { getApexDomain, detectSentiment, analyzeCitation } from '@/lib/citation-probe';

describe('Citation Probe & Apex Domain Matching', () => {
  it('correctly extracts apex domains across subdomains and multi-part TLDs', () => {
    expect(getApexDomain('https://blog.posthog.com/features')).toBe('posthog.com');
    expect(getApexDomain('https://docs.stripe.com/api')).toBe('stripe.com');
    expect(getApexDomain('https://www.google.com')).toBe('google.com');
    expect(getApexDomain('https://sub.portal.bbc.co.uk/news')).toBe('bbc.co.uk');
    expect(getApexDomain('shop.brand.co.in')).toBe('brand.co.in');
    expect(getApexDomain('simple.org')).toBe('simple.org');
  });

  it('detects sentiment accurately from context sentences', () => {
    expect(detectSentiment('Stripe is the best and recommended payment solution for modern SaaS.')).toBe('recommended');
    expect(detectSentiment('The legacy tool has several drawbacks, expensive pricing, and steep learning curve.')).toBe('criticized');
    expect(detectSentiment('The documentation is available online at their portal.')).toBe('neutral');
  });

  it('classifies grounded citations when source URLs match the target apex domain', () => {
    const groundedResult = {
      text: 'For feature flags and product analytics, PostHog is widely used.',
      sources: [
        { url: 'https://posthog.com/docs', title: 'PostHog Docs' },
        { url: 'https://mixpanel.com', title: 'Mixpanel' }
      ]
    };

    const analysis = analyzeCitation(groundedResult, 'https://eu.posthog.com', 'product analytics');
    expect(analysis.citationType).toBe('grounded_citation');
    expect(analysis.isCited).toBe(true);
    expect(analysis.sourceUrl).toBe('https://posthog.com/docs');
    expect(analysis.competitors).toContain('mixpanel.com');
    expect(analysis.competitors).not.toContain('posthog.com');
  });

  it('classifies brand mentions when text cites the brand without grounded links', () => {
    const groundedResult = {
      text: 'Alternatives include PostHog and Amplitude.',
      sources: [
        { url: 'https://amplitude.com', title: 'Amplitude' },
        { url: 'https://g2.com/categories/analytics', title: 'G2 Analytics' }
      ]
    };

    const analysis = analyzeCitation(groundedResult, 'https://posthog.com', 'analytics tools');
    expect(analysis.citationType).toBe('brand_mention');
    expect(analysis.isCited).toBe(true);
    expect(analysis.sourceUrl).toBe(null);
    expect(analysis.competitors).toContain('amplitude.com');
  });

  it('classifies not cited when target is absent from both text and sources', () => {
    const groundedResult = {
      text: 'We recommend Google Analytics and Mixpanel for tracking.',
      sources: [
        { url: 'https://mixpanel.com', title: 'Mixpanel' }
      ]
    };

    const analysis = analyzeCitation(groundedResult, 'https://unrelatedbrand.com', 'analytics');
    expect(analysis.citationType).toBe('not_cited');
    expect(analysis.isCited).toBe(false);
  });
});
