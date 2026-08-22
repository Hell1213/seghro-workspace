import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth-guard';
import { success, error, validationError } from '@/lib/api-response';

const updateUserSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['admin', 'viewer', 'owner']),
});

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return error('Unauthorized', 401);
    }

    const userId = (session.user as { id?: string }).id;
    const userRole = (session.user as { role?: string }).role ?? 'viewer';

    if (userRole !== 'admin' && userRole !== 'owner') {
      return error('Forbidden: admin only', 403);
    }

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

    const users = await db.user.findMany({
      where: { orgId: user.orgId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return success(users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString(), updatedAt: u.updatedAt.toISOString() })));
  } catch (err) {
    console.error('[/api/users] GET Error:', err);
    return error('Failed to fetch users');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return error('Unauthorized', 401);
    }

    const userId = (session.user as { id?: string }).id;
    const userRole = (session.user as { role?: string }).role ?? 'viewer';

    if (userRole !== 'admin' && userRole !== 'owner') {
      return error('Forbidden: admin only', 403);
    }

    if (!userId) {
      return error('User ID not found in session', 401);
    }

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.issues);
    }

    const { userId: targetUserId, role } = parsed.data;

    // Verify the target user is in the same org
    const [currentUser, targetUser] = await Promise.all([
      db.user.findUnique({ where: { id: userId }, select: { orgId: true, role: true } }),
      db.user.findUnique({ where: { id: targetUserId }, select: { orgId: true, role: true } }),
    ]);

    if (!currentUser?.orgId) {
      return error('Current user is not part of an organization', 404);
    }

    if (!targetUser || targetUser.orgId !== currentUser.orgId) {
      return error('Target user not found or not in the same organization', 404);
    }

    // Prevent non-owners from changing owner roles
    if (role === 'owner' && currentUser.role !== 'owner') {
      return error('Forbidden: only owners can assign the owner role', 403);
    }

    const updated = await db.user.update({
      where: { id: targetUserId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return success(updated);
  } catch (err) {
    console.error('[/api/users] PATCH Error:', err);
    return error('Failed to update user role');
  }
}
