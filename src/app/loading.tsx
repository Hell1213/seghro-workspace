import { Shield } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="absolute inset-0 bg-grid-pattern dark:opacity-30" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#dc2626] shadow-lg shadow-red-500/20">
          <Shield className="h-6 w-6 text-white" />
          <span className="absolute inset-0 rounded-xl bg-[#dc2626] animate-ping opacity-20" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading Seghro...</span>
        </div>
      </div>
    </div>
  );
}
