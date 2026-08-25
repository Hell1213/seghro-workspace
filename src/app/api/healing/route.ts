import { db } from '@/lib/db';
import { healingActions as seedHealingActions } from '@/lib/self-healing-data';
import { error, success } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/** Seed healing actions from self-healing-data.ts into the database */
async function seedHealingActionsFromData() {
  const count = await db.healingAction.count();
  if (count > 0) return;

  await db.healingAction.createMany({
    data: seedHealingActions.map((ha) => ({
      id: ha.id,
      type: ha.type,
      endpointName: ha.endpointName,
      action: ha.action,
      result: ha.result,
      severity: ha.severity,
      reasoning: ha.details,
      steps: '[]',
      timestamp: new Date(ha.timestamp),
    })),
  });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return error('Unauthorized', 401);
    }

    await seedHealingActionsFromData();

    const actions = await db.healingAction.findMany({
      orderBy: { timestamp: 'desc' },
    });

    const totalActions = actions.length;
    const automaticCount = actions.filter((a) => a.type === 'automatic').length;
    const manualCount = actions.filter((a) => a.type === 'manual').length;
    const successCount = actions.filter((a) => a.result === 'success').length;
    const successRate =
      totalActions > 0
        ? Math.round((successCount / totalActions) * 10000) / 100
        : 0;

    return success({
      actions: actions.map((a) => ({
        id: a.id,
        endpointId: '',
        endpointName: a.endpointName,
        action: a.action,
        type: a.type,
        severity: a.severity,
        details: a.reasoning ?? '',
        result: a.result,
        timestamp: a.timestamp.toISOString(),
      })),
      summary: {
        totalActions,
        automaticCount,
        manualCount,
        successRate,
        lastAction: actions[0]?.timestamp.toISOString() ?? null,
      },
    });
  } catch (err) {
    console.error('[/api/healing] Error:', err);
    return error('Failed to fetch healing actions');
  }
}
