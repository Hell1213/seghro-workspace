import { getRazorpay, RAZORPAY_PLANS } from './razorpay';
import { db } from './db';

export type PlanType = 'starter' | 'pro' | 'enterprise';

export interface PlanLimits {
  agents: number;
  traces: number;
  retention: number;
}

export interface PlanPrice {
  price: number;
  label: string;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  starter: { agents: 3, traces: 1_000, retention: 7 },
  pro: { agents: 25, traces: 100_000, retention: 30 },
  enterprise: { agents: Infinity, traces: Infinity, retention: 90 },
};

export const PLAN_PRICES: Record<PlanType, PlanPrice> = {
  starter: { price: 0, label: 'Free' },
  pro: { price: 4900, label: '₹49/mo' },
  enterprise: { price: 0, label: 'Custom' },
};

const VALID_PLANS = new Set<string>(Object.keys(PLAN_LIMITS));

export function isValidPlan(plan: string): plan is PlanType {
  return VALID_PLANS.has(plan);
}

export async function createCheckoutSession(plan: PlanType, orgId: string, customerEmail: string) {
  if (!isValidPlan(plan)) throw new Error(`Invalid plan: ${plan}`);

  const planId = RAZORPAY_PLANS[plan];
  if (!planId) throw new Error(`No Razorpay plan for: ${plan}`);

  const subscription = await getRazorpay().subscriptions.create({
    plan_id: planId,
    total_count: 12,
    customer_notify: 1,
    notes: { orgId, plan, customerEmail },
  });

  await db.organization.update({
    where: { id: orgId },
    data: { stripeCustomerId: subscription.id },
  });

  return {
    url: `${process.env.NEXTAUTH_URL}/billing/razorpay?subscription_id=${subscription.id}`,
    sessionId: subscription.id,
  };
}

export async function createPortalSession() {
  return { url: `${process.env.NEXTAUTH_URL}/billing` };
}

export async function getSubscription(orgId: string) {
  const org = await db.organization.findUniqueOrThrow({
    where: { id: orgId },
    select: { plan: true },
  });

  const plan = isValidPlan(org.plan) ? (org.plan as PlanType) : 'starter';
  const limits = PLAN_LIMITS[plan];
  const pricing = PLAN_PRICES[plan];

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

export function formatUsage(used: number, limit: number): string {
  if (limit === Infinity) return `${used.toLocaleString()} / ∞`;
  return `${used.toLocaleString()} / ${limit.toLocaleString()}`;
}
