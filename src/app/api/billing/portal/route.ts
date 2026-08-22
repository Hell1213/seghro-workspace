import { success, error } from '@/lib/api-response';
import { createPortalSession } from '@/lib/billing';

export async function POST() {
  try {
    const session = await createPortalSession();

    return success({
      url: session.url,
    });
  } catch (err) {
    console.error('[/api/billing/portal] Error:', err);
    return error('Failed to create portal session');
  }
}
