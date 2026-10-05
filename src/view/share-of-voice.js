/**
 * Computes competitor share of voice from empirical Gemini citation probe results.
 */

export function computeShareOfVoice(citations = [], targetDomain = 'Your Domain') {
  if (!Array.isArray(citations) || citations.length === 0) {
    return {
      entities: [],
      totalProbes: 0,
      sampleSizeNote: 'No citation probes were executed.',
    };
  }

  const totalProbes = citations.length;
  const counts = new Map();

  // Initialize target domain
  counts.set(targetDomain, {
    name: targetDomain,
    citedCount: 0,
    mentionCount: 0,
    isTarget: true,
  });

  citations.forEach((probe) => {
    // 1. Tally target domain
    const isCited = probe.status === 'cited' || probe.citationType === 'grounded_citation';
    const isMentioned = probe.status === 'mentioned' || probe.citationType === 'brand_mention';

    const target = counts.get(targetDomain);
    if (isCited) target.citedCount += 1;
    else if (isMentioned) target.mentionCount += 1;

    // 2. Tally competitors
    const competitors = Array.isArray(probe.competitors) ? probe.competitors : [];
    competitors.forEach((rawComp) => {
      const compName = String(rawComp).trim();
      if (!compName || compName.toLowerCase() === targetDomain.toLowerCase()) return;

      if (!counts.has(compName)) {
        counts.set(compName, {
          name: compName,
          citedCount: 0,
          mentionCount: 0,
          isTarget: false,
        });
      }
      counts.get(compName).citedCount += 1;
    });
  });

  const entities = Array.from(counts.values())
    .map((item) => {
      const totalScore = item.citedCount * 1.0 + item.mentionCount * 0.5;
      const sharePercent = totalProbes > 0 ? Math.round((item.citedCount / totalProbes) * 100) : 0;
      return {
        ...item,
        totalScore,
        sharePercent: Math.min(100, sharePercent),
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  return {
    entities,
    totalProbes,
    sampleSizeNote: `Computed from ${totalProbes} empirical queries probed with Gemini and Google Search Grounding. Small sample size.`,
  };
}
