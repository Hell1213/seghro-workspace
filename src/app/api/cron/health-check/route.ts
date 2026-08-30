import { NextRequest } from 'next/server';
import { runHealthChecks } from '@/lib/health-monitor';
import { success, error } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const results = await runHealthChecks();
    return success({ checked: results.length, results });
  } catch (err) {
    console.error('[/api/cron/health-check] Error:', err);
    return error('Health check run failed');
  }
}
