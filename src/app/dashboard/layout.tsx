'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SeghroLogo } from '@/components/SeghroLogo';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  LogOut,
  ArrowLeft,
  User,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] dark:bg-[#0a0a0a]">
        <div className="animate-spin w-8 h-8 border-2 border-[#dc2626] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] dark:bg-[#0a0a0a]">
      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 sm:px-6 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <SeghroLogo iconSize={28} textClass="text-base" />
          <span className="hidden sm:inline text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            Dashboard
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* User badge */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mr-2">
            <User className="w-3.5 h-3.5" />
            <span className="max-w-[160px] truncate">
              {session.user?.name || session.user?.email}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="gap-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="gap-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
