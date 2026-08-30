import { NextRequest } from 'next/server';
import { success, error, validationError } from '@/lib/api-response';
import { createCheckoutSession, isValidPlan, type PlanType } from '@/lib/billing';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return error('Unauthorized', 401);

    const body = (await request.json()) as { plan?: string };
    const plan = body?.plan?.trim();

    if (!plan || !isValidPlan(plan)) {
      return validationError({ plan: `Invalid plan. Must be one of: starter, pro, enterprise` });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) return error('User ID not found', 401);

    const user = await (await import('@/lib/db')).db.user.findUnique({ where: { id: userId }, select: { orgId: true, email: true } });
    if (!user?.orgId) return error('User not in an organization', 404);

    const checkoutSession = await createCheckoutSession(plan as PlanType, user.orgId, user.email);

    return success({
      url: checkoutSession.url,
      sessionId: checkoutSession.sessionId,
    });
  } catch (err) {
    console.error('[/api/billing/checkout] Error:', err);
    return error('Failed to create checkout session');
  }
}
