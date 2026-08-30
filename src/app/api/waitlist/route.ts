import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { success, error, validationError } from '@/lib/api-response';

const schema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.issues);

    const { email } = parsed.data;

    const existing = await db.waitlist.findUnique({ where: { email } });
    if (existing) {
      return success({ message: 'Already on waitlist', alreadyJoined: true });
    }

    await db.waitlist.create({
      data: { email, source: body.source || 'landing' },
    });

    return success({ message: 'Added to waitlist' }, 201);
  } catch (err) {
    console.error('[Waitlist] Error:', err);
    return error('Failed to join waitlist');
  }
}
