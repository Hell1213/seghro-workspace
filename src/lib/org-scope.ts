import { getAuthSession } from '@/lib/auth-guard';
import { DEMO_ORG_ID, isDemoMode } from '@/lib/demo-data';

export async function getUserOrgId(): Promise<string | null> {
  try {
    const session = await getAuthSession();
    if (!session?.user) return null;
    const user = session.user as { orgId?: string | null } | undefined;
    return user?.orgId ?? null;
  } catch {
    return null;
  }
}

export function getDemoOrgId(): string {
  return DEMO_ORG_ID;
}

export { isDemoMode };

/**
 * Run a query with org-scoping when authenticated.
 *
 * If the current user has an orgId, calls `queryFn(orgId)` to apply
 * an org-scoped filter. Otherwise falls back to `fallbackFn()`
 * (demo mode — returns all data without org filtering).
 */
export async function withOrgScope<T>(
  queryFn: (orgId: string) => Promise<T>,
  fallbackFn: () => Promise<T>,
): Promise<T> {
  const orgId = await getUserOrgId();
  if (orgId) {
    return queryFn(orgId);
  }
  return fallbackFn();
}
