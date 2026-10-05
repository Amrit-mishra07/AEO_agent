import React from 'react';
import Link from 'next/link';
import LocalTime from '@/components/ui/LocalTime';
import Badge from '@/components/ui/Badge';
import Sparkline from '@/components/viz/Sparkline';
import { extractDomain } from '@/view/audit-view-model';
import { calculateScoreDelta, getAuditTrendPoints } from '@/view/history';
import { getScoreGrade, getScoreColor } from '@/utils/scoring';
import { ArrowUpRight, ArrowUp, ArrowDown } from 'lucide-react';

/**
 * Clean data table of recent diagnostic audits
 * @param {object} props
 * @param {object[]} props.audits
 */
export default function RecentAudits({ audits = [] }) {
  if (!audits || audits.length === 0) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          background: 'var(--bg-subtle)',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>
          No audits executed yet
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', maxWidth: '420px', margin: '0 auto' }}>
          Enter a website above to run your first AEO diagnostic and see how AI answer engines perceive your brand.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="table-container">
        <table>
          <caption className="sr-only">List of recent AEO diagnostic audits</caption>
          <thead>
            <tr>
              <th scope="col">Domain</th>
              <th scope="col">Date</th>
              <th scope="col">Status</th>
              <th scope="col">Score & Grade</th>
              <th scope="col">Trend & Delta</th>
              <th scope="col">
                <span className="sr-only">View report</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {audits.map((audit) => {
              const domain = extractDomain(audit.url);
              const { delta } = calculateScoreDelta(audit, audits);
              const trendPoints = getAuditTrendPoints(domain, audits);
              const grade = audit.overall_score !== null && audit.overall_score !== undefined
                ? getScoreGrade(audit.overall_score)
                : null;
              const scoreColor = audit.overall_score !== null && audit.overall_score !== undefined
                ? getScoreColor(audit.overall_score)
                : '--text-3';

              const statusVariant = audit.status === 'completed'
                ? 'good'
                : audit.status === 'running'
                ? 'info'
                : audit.status === 'failed'
                ? 'bad'
                : 'warn';

              return (
                <tr key={audit.id}>
                  {/* Domain */}
                  <td>
                    <Link
                      href={`/audit/${audit.id}`}
                      style={{
                        fontWeight: 600,
                        color: 'var(--text)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.875rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <span>{domain}</span>
                    </Link>
                  </td>

                  {/* Date */}
                  <td className="text-muted text-xs" style={{ whiteSpace: 'nowrap' }}>
                    <LocalTime date={audit.completed_at || audit.created_at} format="datetime" />
                  </td>

                  {/* Status */}
                  <td>
                    <Badge variant={statusVariant} dot={audit.status === 'running'}>
                      {audit.status}
                    </Badge>
                  </td>

                  {/* Overall Score & Grade */}
                  <td>
                    {audit.status === 'completed' && audit.overall_score !== null && audit.overall_score !== undefined ? (
                      <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.35rem' }}>
                        <span
                          className="tabular-nums"
                          style={{
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            color: `var(${scoreColor})`,
                            fontSize: '0.9375rem',
                          }}
                        >
                          {audit.overall_score}
                        </span>
                        <span className="text-xs text-muted">/100</span>
                        {grade && (
                          <span
                            className="badge"
                            style={{
                              fontSize: '0.6875rem',
                              padding: '0.1rem 0.35rem',
                              marginLeft: '0.2rem',
                            }}
                          >
                            {grade}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted text-xs">&mdash;</span>
                    )}
                  </td>

                  {/* Trend Sparkline & Delta */}
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Sparkline points={trendPoints} width={56} height={18} />
                      {delta !== null ? (
                        <span
                          className="tabular-nums"
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: delta > 0 ? 'var(--good)' : delta < 0 ? 'var(--bad)' : 'var(--text-3)',
                          }}
                        >
                          {delta > 0 ? <ArrowUp size={11} aria-hidden="true" /> : delta < 0 ? <ArrowDown size={11} aria-hidden="true" /> : null}
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {/* Action link */}
                  <td style={{ textAlign: 'right' }}>
                    <Link
                      href={`/audit/${audit.id}`}
                      className="btn btn-ghost btn-sm"
                      aria-label={`View audit report for ${domain}`}
                      style={{ padding: '0.25rem 0.5rem' }}
                    >
                      <ArrowUpRight size={15} style={{ color: 'var(--text-3)' }} aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-muted text-xs" style={{ marginTop: '0.75rem' }}>
        Note: Audits are stored locally on this instance.
      </p>
    </div>
  );
}
