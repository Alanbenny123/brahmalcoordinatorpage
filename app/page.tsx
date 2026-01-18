'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to coordinator login page
    router.push('/coordinator/login');
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto" />
        <p className="text-slate-400 text-lg">Redirecting to Coordinator Login...</p>
      </div>
    </div>
  );
}
