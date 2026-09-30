import { describe, it, expect } from 'vitest';
import { detectPageType, validateSchema, analyzeSchemas } from '@/lib/schema-analyzer';

describe('schema-analyzer', () => {
  it('correctly detects page types based on heuristics', () => {
    const home = { url: 'https://example.com/', textContent: 'Welcome to our platform' };
    expect(detectPageType(home)).toContain('Homepage');

    const article = { url: 'https://example.com/blog/ai-tips', textContent: 'Published on 2026-01-01 by Jane Doe. Detailed guide.', wordCount: 600 };
    expect(detectPageType(article)).toContain('Article');

    const product = { url: 'https://example.com/shop/widget', textContent: 'Special product sale price $49.99 add to cart today' };
    expect(detectPageType(product)).toContain('Product');

    const faq = { url: 'https://example.com/help', textContent: 'Frequently Asked Questions about our service' };
    expect(detectPageType(faq)).toContain('FAQPage');
  });

  it('validates schema and flags missing properties', () => {
    const incompleteOrg = { name: 'Acme Corp' }; // missing url and logo
    const result = validateSchema(incompleteOrg, 'Organization');
    expect(result.valid).toBe(false);
    expect(result.missingProperties).toContain('url');
    expect(result.missingProperties).toContain('logo');

    const validOrg = { name: 'Acme Corp', url: 'https://acme.com', logo: 'https://acme.com/logo.png' };
    const validResult = validateSchema(validOrg, 'Organization');
    expect(validResult.valid).toBe(true);
    expect(validResult.missingProperties.length).toBe(0);
  });

  it('identifies schema gaps for homepage without Organization schema', () => {
    const homepage = {
      url: 'https://example.com/',
      textContent: 'Welcome home',
      jsonLdScripts: []
    };

    const analysis = analyzeSchemas([homepage]);
    expect(analysis.gaps.some(g => g.schemaType === 'Organization' && g.status === 'missing')).toBe(true);
    expect(analysis.gaps.some(g => g.schemaType === 'WebSite' && g.status === 'missing')).toBe(true);
    expect(analysis.overallScore).toBeLessThan(100);
  });
});
