'use client';

import React, { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Client-Side LocalTime Component
 * Avoids server/client hydration mismatch when rendering formatted dates.
 * Uses useSyncExternalStore to detect client mount without cascading effect renders.
 * @param {object} props
 * @param {string | number | Date} props.date
 * @param {'datetime' | 'date' | 'time'} [props.format='datetime']
 * @param {string} [props.className='']
 */
export default function LocalTime({ date, timestamp, format = 'datetime', className = '' }) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const rawDate = date || timestamp;
  if (!rawDate) return <span className={className}>N/A</span>;

  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return <span className={className}>Invalid date</span>;

  const iso = d.toISOString();

  // Server-rendered fallback: deterministic UTC representation
  if (!isClient) {
    const utcFallback = d.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
    return (
      <time dateTime={iso} className={className} title={utcFallback}>
        {utcFallback}
      </time>
    );
  }

  // Client-rendered local time
  let formatted = '';
  if (format === 'date') {
    formatted = d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } else if (format === 'time') {
    formatted = d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else {
    formatted = d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <time dateTime={iso} className={className} title={iso}>
      {formatted}
    </time>
  );
}
