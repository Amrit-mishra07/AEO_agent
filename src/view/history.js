import { extractDomain } from './audit-view-model';
import { formatScore } from '@/utils/scoring';

/**
 * Normalizes any URL or domain string to a clean, canonical hostname.
 * Strips protocol, www prefix, port, and path; converts to lowercase.
 * @param {string} urlString
 * @returns {string}
 */
export function normalizeHostname(urlString) {
  return extractDomain(urlString);
}

/**
 * Groups a list of audits by normalized hostname.
 * @param {object[]} audits
 * @returns {Record<string, object[]>}
 */
export function groupAuditsByHost(audits = []) {
  const groups = {};
  for (const audit of audits) {
    if (!audit || !audit.url) continue;
    const host = normalizeHostname(audit.url);
    if (!groups[host]) groups[host] = [];
    groups[host].push(audit);
  }
  return groups;
}

/**
 * Calculates score delta and historical comparison between an audit and prior runs of the same host.
 * @param {object} currentAudit
 * @param {object[]} allAudits
 * @returns {{ delta: number | null, previousScore: number | null, previousDate: string | null }}
 */
export function calculateScoreDelta(currentAudit, allAudits = []) {
  if (!currentAudit || !currentAudit.url || currentAudit.overall_score === null || currentAudit.overall_score === undefined) {
    return { delta: null, previousScore: null, previousDate: null };
  }

  const host = normalizeHostname(currentAudit.url);
  const currentScore = formatScore(currentAudit.overall_score);
  const currentTime = new Date(currentAudit.completed_at || currentAudit.created_at || 0).getTime();

  // Find previous completed audits for the same host created strictly before current audit
  const priorAudits = allAudits
    .filter((a) => {
      if (!a || a.id === currentAudit.id || a.status !== 'completed' || normalizeHostname(a.url) !== host) {
        return false;
      }
      if (a.overall_score === null || a.overall_score === undefined) return false;
      const t = new Date(a.completed_at || a.created_at || 0).getTime();
      return t < currentTime;
    })
    .sort((a, b) => {
      const tA = new Date(a.completed_at || a.created_at || 0).getTime();
      const tB = new Date(b.completed_at || b.created_at || 0).getTime();
      return tB - tA; // most recent first
    });

  if (priorAudits.length === 0) {
    return { delta: null, previousScore: null, previousDate: null };
  }

  const previous = priorAudits[0];
  const previousScore = formatScore(previous.overall_score);
  const delta = currentScore - previousScore;

  return {
    delta,
    previousScore,
    previousDate: previous.completed_at || previous.created_at || null,
  };
}

/**
 * Extracts chronological score points for a given hostname (useful for Sparkline viz).
 * @param {string} hostname
 * @param {object[]} allAudits
 * @param {number} [maxPoints=6]
 * @returns {number[]}
 */
export function getAuditTrendPoints(hostname, allAudits = [], maxPoints = 6) {
  const targetHost = normalizeHostname(hostname);
  if (!targetHost) return [];

  const completed = allAudits
    .filter((a) => a && a.status === 'completed' && normalizeHostname(a.url) === targetHost && a.overall_score !== null && a.overall_score !== undefined)
    .sort((a, b) => {
      const tA = new Date(a.completed_at || a.created_at || 0).getTime();
      const tB = new Date(b.completed_at || b.created_at || 0).getTime();
      return tA - tB; // chronological order: oldest to newest
    })
    .map((a) => formatScore(a.overall_score));

  return completed.slice(-maxPoints);
}
