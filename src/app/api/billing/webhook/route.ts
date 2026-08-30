import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-response';
import crypto from 'crypto';

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-razorpay-signature')!;

  const expected = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
  if (signature !== expected) return error('Invalid signature', 400);

  const event = JSON.parse(body);
  const payload = event.payload.subscription?.entity || event.payload.payment?.entity;

  switch (event.event) {
    case 'subscription.activated':
    case 'subscription.charged': {
      const { orgId, plan } = payload.notes;
      await db.organization.update({ where: { id: orgId }, data: { plan } });
      break;
    }
    case 'subscription.cancelled':
    case 'subscription.halted': {
      const { orgId } = payload.notes;
      await db.organization.update({ where: { id: orgId }, data: { plan: 'starter' } });
      break;
    }
    case 'payment.failed': {
      const { orgId } = payload.notes;
      console.warn(`Payment failed for org ${orgId}`);
      break;
    }
  }

  return success({ received: true });
}
