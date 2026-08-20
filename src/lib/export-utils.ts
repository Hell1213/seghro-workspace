/**
 * Format an ISO date string to a human-readable format.
 */
export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format milliseconds to a human-readable duration string.
 * Examples: 1500 → "1.5s", 90000 → "1m 30s", 3600000 → "1h 0m"
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;

  const seconds = ms / 1000;

  if (seconds < 60) {
    return `${seconds % 1 === 0 ? seconds : seconds.toFixed(1)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${hours}h`;
}

/**
 * Escape a CSV cell value.
 * - Wraps in double quotes if the value contains commas, double quotes, or newlines.
 * - Escapes internal double quotes by doubling them.
 */
function escapeCSVCell(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export an array of objects as a CSV file and trigger a browser download.
 *
 * @param data    - Array of row objects to export.
 * @param filename - Desired filename (`.csv` is appended automatically if missing).
 * @param columns  - Optional whitelist of column keys to include (preserves order).
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  columns?: string[],
): void {
  if (data.length === 0) return;

  // Determine columns: use whitelist or union of all keys
  const cols = columns ?? Array.from(
    new Set(data.flatMap((row) => Object.keys(row))),
  );

  // Build CSV rows
  const header = cols.map(escapeCSVCell).join(',');
  const rows = data.map((row) =>
    cols.map((col) => escapeCSVCell(row[col])).join(','),
  );

  const csv = [header, ...rows].join('\n');

  // Trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
