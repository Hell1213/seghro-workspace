import { getAuthSession } from '@/lib/auth-guard';

/**
 * Get the current user's orgId from the session.
 * Returns null if not authenticated or user has no orgId.
 */
export async function getUserOrgId(): Promise<string | null> {
  try {
    const session = await getAuthSession();
    const user = session?.user as { orgId?: string } | undefined;
    return user?.orgId ?? null;
  } catch {
    return null;
  }
}

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
