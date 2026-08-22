// ─── Plan Limits & Pricing ───────────────────────────────────────────

export type PlanType = 'starter' | 'pro' | 'enterprise';

export interface PlanLimits {
  agents: number;
  traces: number;
  retention: number; // days
}

export interface PlanPrice {
  price: number;
  label: string;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  starter: {
    agents: 3,
    traces: 1_000,
    retention: 7,
  },
  pro: {
    agents: 25,
    traces: 100_000,
    retention: 30,
  },
  enterprise: {
    agents: Infinity,
    traces: Infinity,
    retention: 90,
  },
};

export const PLAN_PRICES: Record<PlanType, PlanPrice> = {
  starter: {
    price: 0,
    label: 'Free',
  },
  pro: {
    price: 49,
    label: '$49/mo',
  },
  enterprise: {
    price: 0,
    label: 'Custom',
  },
};

// ─── Valid Plans ─────────────────────────────────────────────────────

const VALID_PLANS = new Set<string>(Object.keys(PLAN_LIMITS));

export function isValidPlan(plan: string): plan is PlanType {
  return VALID_PLANS.has(plan);
}

// ─── Mock Stripe Session Helpers ─────────────────────────────────────

/**
 * In production, this would call `stripe.checkout.sessions.create()`.
 * For the sandbox demo, it returns a redirect URL and a mock session ID.
 */
export async function createCheckoutSession(plan: string): Promise<{
  url: string;
  sessionId: string;
}> {
  if (!isValidPlan(plan)) {
    throw new Error(`Invalid plan: ${plan}`);
  }

  return {
    url: `/register?plan=${plan}`,
    sessionId: crypto.randomUUID(),
  };
}

/**
 * In production, this would call `stripe.billingPortal.sessions.create()`.
 * For the sandbox demo, it returns the settings page URL.
 */
export async function createPortalSession(): Promise<{ url: string }> {
  return { url: '/settings' };
}

// ─── Subscription Details ────────────────────────────────────────────

export interface UsageCounts {
  agents: number;
  traces: number;
}

export interface SubscriptionDetails {
  plan: PlanType;
  limits: PlanLimits;
  pricing: PlanPrice;
  usage: UsageCounts;
  formatted: {
    agents: string;
    traces: string;
  };
}

/**
 * Read the organization's current plan from Prisma, combine with limits,
 * pricing, and live usage counts from the database.
 */
export async function getSubscription(
  orgId: string,
): Promise<SubscriptionDetails> {
  const { db } = await import('@/lib/db');

  const org = await db.organization.findUniqueOrThrow({
    where: { id: orgId },
    select: { plan: true },
  });

  const plan = (isValidPlan(org.plan) ? org.plan : 'starter') as PlanType;
  const limits = PLAN_LIMITS[plan];
  const pricing = PLAN_PRICES[plan];

  // Count live usage
  const [agentCount, traceCount] = await Promise.all([
    db.agent.count({ where: { orgId } }),
    db.trace.count({
      where: {
        agent: { orgId },
        createdAt: { gte: new Date(Date.now() - limits.retention * 86_400_000) },
      },
    }),
  ]);

  const usage = { agents: agentCount, traces: traceCount };

  return {
    plan,
    limits,
    pricing,
    usage,
    formatted: {
      agents: formatUsage(usage.agents, limits.agents),
      traces: formatUsage(usage.traces, limits.traces),
    },
  };
}

// ─── Display Helpers ─────────────────────────────────────────────────

/**
 * Format a usage metric as `"847 / 1,000"` and return a Tailwind text-color
 * class that turns red when usage is ≥ 80 % of the limit.
 */
export function formatUsage(used: number, limit: number): string {
  if (limit === Infinity) return `${used.toLocaleString()} / ∞`;
  return `${used.toLocaleString()} / ${limit.toLocaleString()}`;
}

/**
 * Returns a Tailwind text-color class based on usage percentage.
 * - ≥ 100 % → `text-red-500`
 * - ≥ 80 %  → `text-amber-500`
 * - < 80 %  → `text-muted-foreground`
 */
export function usageColorClass(used: number, limit: number): string {
  if (limit === Infinity) return 'text-muted-foreground';
  const pct = used / limit;
  if (pct >= 1) return 'text-red-500';
  if (pct >= 0.8) return 'text-amber-500';
  return 'text-muted-foreground';
}
