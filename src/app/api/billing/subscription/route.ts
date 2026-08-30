import { success, error } from '@/lib/api-response';
import { getSubscription, PLAN_LIMITS, PLAN_PRICES, type PlanType } from '@/lib/billing';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    let orgId: string | null = null;
    try {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        const user = session.user as { orgId?: string | null };
        orgId = user.orgId ?? null;
      }
    } catch { /* unauthenticated — demo mode */ }

    if (!orgId) {
      console.warn('[/api/billing/subscription] No auth — returning demo plan data');
      const plan: PlanType = 'starter';
      const limits = PLAN_LIMITS[plan];
      const pricing = PLAN_PRICES[plan];
      return success({
        plan, limits, pricing,
        usage: { agents: 2, traces: 847 },
        formatted: { agents: '2 / 3', traces: '847 / 1,000' },
        source: 'demo',
      });
    }

    const details = await getSubscription(orgId);
    return success({ ...details, source: 'database' });
  } catch (err) {
    console.error('[/api/billing/subscription] Error:', err);
    return error('Failed to fetch subscription');
  }
}
