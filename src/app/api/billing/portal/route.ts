import { NextResponse } from 'next/server';
import { success, error } from '@/lib/api-response';
import { createPortalSession } from '@/lib/billing';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portalSession = await createPortalSession();

    return success({
      url: portalSession.url,
    });
  } catch (err) {
    console.error('[/api/billing/portal] Error:', err);
    return error('Failed to create portal session');
  }
}
