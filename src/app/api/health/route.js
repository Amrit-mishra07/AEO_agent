import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    const db = getDB();
    const result = db.prepare('SELECT 1 as alive').get();
    dbLatencyMs = Date.now() - dbStart;
    if (!result || result.alive !== 1) {
      dbStatus = 'degraded';
    }
  } catch (err) {
    dbStatus = `unhealthy: ${err.message}`;
  }

  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);

  const healthData = {
    status: dbStatus === 'healthy' && geminiConfigured ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    services: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        engine: 'SQLite (better-sqlite3)'
      },
      gemini_ai: {
        configured: geminiConfigured,
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
      }
    },
    responseTimeMs: Date.now() - startTime
  };

  const httpStatus = healthData.status === 'healthy' ? 200 : 503;
  return NextResponse.json(healthData, { status: httpStatus });
}
