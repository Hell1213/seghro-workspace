import bcrypt from 'bcryptjs';
import { db } from './db';

export async function validateApiKey(
  authHeader: string | null
): Promise<{ id: string; email: string; name: string | null; role: string } | null> {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  const key = parts[1];
  if (!key.startsWith('seghro_sk_')) return null;

  try {
    // Extract prefix for fast lookup (first 18 chars: "seghro_sk_" + 8 hex)
    const keyPrefix = key.slice(0, 18);

    // Filter by prefix first (uses index)
    const candidates = await db.apiKey.findMany({
      where: { keyPrefix },
      include: {
        user: {
          select: { id: true, email: true, name: true, role: true },
        },
      },
    });

    // Only bcrypt.compare against candidates with matching prefix
    for (const record of candidates) {
      const match = await bcrypt.compare(key, record.keyHash);
      if (match) {
        if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
          return null;
        }

        // Fire-and-forget update of lastUsedAt
        db.apiKey.update({
          where: { id: record.id },
          data: { lastUsedAt: new Date() },
        }).catch(() => {});

        return record.user;
      }
    }

    return null;
  } catch (error) {
    console.error('[API Key Auth] Error:', error);
    return null;
  }
}
