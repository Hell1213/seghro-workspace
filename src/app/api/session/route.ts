import { getAuthSession } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-response';

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
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return error('User not found', 404);
    }

    return success({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    console.error('[/api/session] GET Error:', err);
    return error('Failed to fetch session');
  }
}
