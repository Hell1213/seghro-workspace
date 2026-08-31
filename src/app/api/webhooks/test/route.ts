import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { dispatchWebhooks } from '@/lib/webhook-dispatcher';
import { success, error } from '@/lib/api-response';
import { getAuthSession } from '@/lib/auth-guard';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return error('Unauthorized', 401);

    const { event, payload } = await request.json();

    const result = await dispatchWebhooks(event, payload);
    return success(result);
  } catch (err) {
    return error('Failed to dispatch webhook');
  }
}
