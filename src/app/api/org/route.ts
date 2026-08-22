import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth-guard';
import { success, error, validationError } from '@/lib/api-response';

const updateOrgSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return error('Unauthorized', 401);
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return error('User ID not found in session', 401);
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { orgId: true },
    });

    if (!user?.orgId) {
      return error('User is not part of an organization', 404);
    }

    const org = await db.organization.findUnique({
      where: { id: user.orgId },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!org) {
      return error('Organization not found', 404);
    }

    return success({
      id: org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      userCount: org._count.users,
      createdAt: org.createdAt.toISOString(),
      updatedAt: org.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error('[/api/org] GET Error:', err);
    return error('Failed to fetch organization');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return error('Unauthorized', 401);
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return error('User ID not found in session', 401);
    }

    const body = await request.json();
    const parsed = updateOrgSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.issues);
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { orgId: true, role: true },
    });

    if (!user?.orgId) {
      return error('User is not part of an organization', 404);
    }

    // Only admin or owner can update org
    if (user.role !== 'admin' && user.role !== 'owner') {
      return error('Forbidden: insufficient permissions', 403);
    }

    const updated = await db.organization.update({
      where: { id: user.orgId },
      data: { name: parsed.data.name },
    });

    return success({
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      plan: updated.plan,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error('[/api/org] PATCH Error:', err);
    return error('Failed to update organization');
  }
}
