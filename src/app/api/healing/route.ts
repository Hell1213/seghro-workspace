import { NextResponse } from 'next/server';
import { healingActions } from '@/lib/self-healing-data';
import { error } from '@/lib/api-response';

// TODO: Move to database when backend is extracted

export async function GET() {
  try {
    const automaticCount = healingActions.filter(
      (a) => a.type === 'automatic',
    ).length;
    const manualCount = healingActions.filter(
      (a) => a.type === 'manual',
    ).length;
    const successCount = healingActions.filter(
      (a) => a.result === 'success',
    ).length;
    const sorted = [...healingActions].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return NextResponse.json({
      actions: sorted,
      summary: {
        totalActions: healingActions.length,
        automaticCount,
        manualCount,
        successRate:
          Math.round((successCount / healingActions.length) * 10000) / 100,
        lastAction: sorted[0]?.timestamp ?? null,
      },
    });
  } catch (err) {
    console.error('[/api/healing] Error:', err);
    return error('Failed to fetch healing actions');
  }
}
