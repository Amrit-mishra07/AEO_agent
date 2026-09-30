import { describe, it, expect } from 'vitest';
import { analyzeSEO } from '@/lib/seo-analyzer';

describe('seo-analyzer', () => {
  it('identifies missing title and h1', () => {
    const page = {
      url: 'https://example.com/test',
      title: '',
      metaDescription: 'A valid meta description that is between 120 and 160 characters long to satisfy optimal length requirements perfectly for testing purposes.',
      h1s: [],
      h2s: ['Some section'],
      images: [],
      links: [],
      canonicalUrl: 'https://example.com/test',
      robotsMeta: '',
      viewportMeta: 'width=device-width',
      ogTags: { title: 'T', description: 'D', image: 'I' },
      wordCount: 400,
    };

    const result = analyzeSEO([page]);
    expect(result.overallScore).toBeLessThan(100);

    const issues = result.issues;
    expect(issues.some(i => i.issue === 'Missing Title')).toBe(true);
    expect(issues.some(i => i.issue === 'Missing H1')).toBe(true);
    expect(issues.some(i => i.issue === 'Skipped Heading Levels')).toBe(true);
  });

  it('detects images missing alt text', () => {
    const page = {
      url: 'https://example.com/images',
      title: 'Valid Page Title That Fits Between 30 and 60 Chars',
      metaDescription: 'A valid meta description that is between 120 and 160 characters long to satisfy optimal length requirements perfectly for testing purposes.',
      h1s: ['Main Heading'],
      h2s: [],
      images: [
        { src: '/pic1.png', alt: '' },
        { src: '/pic2.png', alt: 'Valid alt text' }
      ],
      links: [],
      canonicalUrl: 'https://example.com/images',
      robotsMeta: '',
      viewportMeta: 'width=device-width',
      ogTags: { title: 'T', description: 'D', image: 'I' },
      wordCount: 500,
    };

    const result = analyzeSEO([page]);
    expect(result.issues.some(i => i.issue === 'Missing Image Alt Text')).toBe(true);
  });

  it('awards 100 for a perfectly optimized page', () => {
    const page = {
      url: 'https://example.com/perfect',
      title: 'Valid Page Title That Fits Between 30 and 60 Chars',
      metaDescription: 'A valid meta description that is between 120 and 160 characters long to satisfy optimal length requirements perfectly for testing purposes.',
      h1s: ['Single Proper H1'],
      h2s: ['Secondary Section'],
      images: [{ src: '/img.png', alt: 'Descriptive text' }],
      links: [{ href: '/about' }],
      canonicalUrl: 'https://example.com/perfect',
      robotsMeta: 'index, follow',
      viewportMeta: 'width=device-width, initial-scale=1',
      ogTags: { title: 'OG Title', description: 'OG Desc', image: 'https://example.com/og.jpg' },
      wordCount: 650,
    };

    const result = analyzeSEO([page]);
    expect(result.overallScore).toBe(100);
    expect(result.issues.length).toBe(0);
  });
});
