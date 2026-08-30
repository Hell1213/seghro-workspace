import { z } from 'zod';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-response';
import { generateVerificationToken } from '@/lib/token';
import { sendPasswordResetEmail } from '@/lib/email';

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return error('Validation failed', 400, parsed.error.flatten().fieldErrors);

    const { email } = parsed.data;
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return error('No account found with that email', 404);
    if (!user.password) return error('This account uses OAuth. Please sign in with your provider.', 400);

    await db.passwordReset.deleteMany({ where: { userId: user.id, usedAt: null } });
    const token = await generateVerificationToken(email, 'password-reset');
    await db.passwordReset.create({ data: { userId: user.id, token, expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000) } });

    await sendPasswordResetEmail(email, token);
    return success({ message: 'Password reset instructions sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return error('Internal server error', 500);
  }
}
