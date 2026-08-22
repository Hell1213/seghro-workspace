import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

/**
 * Validate an API key from the Authorization header.
 * Expects format: `Bearer seghro_sk_...`
 *
 * Returns the user object if valid, null otherwise.
 * Also updates lastUsedAt on the key.
 */
export async function validateApiKey(
  authHeader: string | null
): Promise<{ id: string; email: string; name: string | null; role: string } | null> {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  const key = parts[1];
  if (!key.startsWith('seghro_sk_')) return null;

  try {
    // Find all keys (SQLite is small enough; for larger DB add a prefix index)
    const allKeys = await db.apiKey.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true, role: true },
        },
      },
    });

    for (const record of allKeys) {
      const match = await bcrypt.compare(key, record.keyHash);
      if (match) {
        // Check expiry
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
