import { success, error } from '@/lib/api-response';
import { getSubscription, PLAN_LIMITS, PLAN_PRICES, type PlanType } from '@/lib/billing';
import { getUserOrgId } from '@/lib/org-scope';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const orgId = await getUserOrgId();

    // ── Demo / unauthenticated fallback ────────────────────────────
    if (!orgId) {
      console.warn('[/api/billing/subscription] No auth — returning demo plan data');

      const plan: PlanType = 'starter';
      const limits = PLAN_LIMITS[plan];
      const pricing = PLAN_PRICES[plan];

      return success({
        plan,
        limits,
        pricing,
        usage: {
          agents: 2,
          traces: 847,
        },
        formatted: {
          agents: '2 / 3',
          traces: '847 / 1,000',
        },
        source: 'demo',
      });
    }

    // ── Authenticated path ────────────────────────────────────────
    const details = await getSubscription(orgId);

    return success({
      ...details,
      source: 'database',
    });
  } catch (err) {
    console.error('[/api/billing/subscription] Error:', err);
    return error('Failed to fetch subscription');
  }
}
