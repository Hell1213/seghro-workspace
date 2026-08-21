import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="absolute inset-0 bg-grid-pattern dark:opacity-30" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-red-500/5 blur-[120px]" />

      <div className="relative z-10 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-red-500/10 mb-6">
          <Shield className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-8xl font-bold text-gray-900 dark:text-gray-100 tracking-tighter">
          4<span className="text-red-500">0</span>4
        </h1>
        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Page not found
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Button asChild className="bg-[#dc2626] hover:bg-[#b91c1c] text-white btn-glow">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
