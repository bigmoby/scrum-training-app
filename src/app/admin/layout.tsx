'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('scrum_team');
    if (saved) {
      try {
        const team = JSON.parse(saved);
        if (team?.isAdmin) {
          setIsAuthorized(true);
        } else {
          router.push('/dashboard');
        }
      } catch (e) {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto pt-6 px-4 pb-20">
      <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center bg-black/60 border border-primary/30 p-4 rounded-2xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
        <div>
          <h2 className="text-xl font-bold font-mono tracking-widest text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]">ADMIN DATABANK</h2>
          <p className="text-xs text-gray-500 font-mono">Top Secret Investigation Files</p>
        </div>
        <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-400 hover:text-white transition-colors border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5 font-medium">
          Exit Admin Level
        </button>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
