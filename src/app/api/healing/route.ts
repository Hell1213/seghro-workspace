import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { healingActions as seedHealingActions } from '@/lib/self-healing-data';
import { error } from '@/lib/api-response';

/** Seed healing actions from self-healing-data.ts into the database */
async function seedHealingActionsFromData() {
  const [row] = await db.$queryRawUnsafe<{ c: number }[]>('SELECT COUNT(*) as c FROM HealingAction');
  if (row.c > 0) return;

  for (const ha of seedHealingActions) {
    await db.$executeRawUnsafe(
      `INSERT INTO HealingAction (id, type, endpointName, action, result, severity, reasoning, steps, timestamp, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      ha.id, ha.type, ha.endpointName, ha.action, ha.result, ha.severity, ha.details, '[]',
      new Date(ha.timestamp).toISOString()
    );
  }
}

export async function GET() {
  try {
    await seedHealingActionsFromData();

    const actions = await db.$queryRawUnsafe<{
      id: string; type: string; endpointName: string; action: string;
      result: string; severity: string; reasoning: string | null;
      timestamp: string;
    }[]>('SELECT id, type, endpointName, action, result, severity, reasoning, timestamp FROM HealingAction ORDER BY timestamp DESC');

    const totalActions = actions.length;
    const automaticCount = actions.filter((a) => a.type === 'automatic').length;
    const manualCount = actions.filter((a) => a.type === 'manual').length;
    const successCount = actions.filter((a) => a.result === 'success').length;
    const successRate =
      totalActions > 0
        ? Math.round((successCount / totalActions) * 10000) / 100
        : 0;

    return NextResponse.json({
      actions: actions.map((a) => ({
        id: a.id,
        endpointId: '',
        endpointName: a.endpointName,
        action: a.action,
        type: a.type,
        severity: a.severity,
        details: a.reasoning ?? '',
        result: a.result,
        timestamp: a.timestamp,
      })),
      summary: {
        totalActions,
        automaticCount,
        manualCount,
        successRate,
        lastAction: actions[0]?.timestamp ?? null,
      },
    });
  } catch (err) {
    console.error('[/api/healing] Error:', err);
    return error('Failed to fetch healing actions');
  }
}
