import { NextRequest } from 'next/server';
import { success, error, validationError } from '@/lib/api-response';
import { createCheckoutSession, isValidPlan, type PlanType } from '@/lib/billing';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const VALID_PLANS = new Set<string>(['starter', 'pro', 'enterprise']);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return error('Unauthorized', 401);
    }

    const body = (await request.json()) as { plan?: string };
    const plan = body?.plan?.trim();

    if (!plan || !VALID_PLANS.has(plan)) {
      return validationError({
        plan: `Invalid plan. Must be one of: ${[...VALID_PLANS].join(', ')}`,
      });
    }

    const checkoutSession = await createCheckoutSession(plan as PlanType);

    return success({
      url: checkoutSession.url,
      sessionId: checkoutSession.sessionId,
    });
  } catch (err) {
    console.error('[/api/billing/checkout] Error:', err);
    return error('Failed to create checkout session');
  }
}
