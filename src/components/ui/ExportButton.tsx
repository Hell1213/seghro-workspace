'use client';

import { Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { exportToCSV } from '@/lib/export-utils';

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  columns?: string[];
  label?: string;
}

export function ExportButton({
  data,
  filename,
  columns,
  label = 'Export CSV',
}: ExportButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="h-8 px-3 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors inline-flex items-center gap-1.5"
        >
          <Download className="h-3.5 w-3.5" />
          {label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => exportToCSV(data, filename, columns)}
        >
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
