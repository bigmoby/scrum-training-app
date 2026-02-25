'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, PlayCircle, LogOut, ArrowRight, ShieldAlert, Settings } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/LanguageContext';

export default function Dashboard() {
  const { t } = useTranslation();
  const [team, setTeam] = useState<{ id: string; name: string; totalScore: number; isAdmin?: boolean } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedTeam = localStorage.getItem('scrum_team');
    if (!savedTeam) {
      router.push('/');
    } else {
      setTeam(JSON.parse(savedTeam));
      // Optionally fetch latest score from API
    }
  }, [router]);

  if (!team) return <div className="min-h-[50vh] flex items-center justify-center text-white"><span className="animate-pulse">{t('dashboard', 'loading')}</span></div>;

  const handleLogout = () => {
    localStorage.removeItem('scrum_team');
    router.push('/');
  };

  return (
    <div className="w-full max-w-4xl mx-auto pt-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
              <ShieldAlert className="text-primary w-8 h-8"/> {t('dashboard', 'title')}
            </h1>
            <p className="text-muted-foreground">{t('dashboard', 'welcome')} <span className="text-white font-medium">{team.name}</span></p>
          </div>
          <div className="flex gap-3">
            {team.isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors border border-primary/20"
              >
                <Settings className="w-4 h-4" /> <span className="hidden sm:inline">Admin Panel</span>
              </Link>
            )}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors border border-white/10"
            >
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">{t('dashboard', 'logout')}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div whileHover={{ scale: 1.02 }} className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-primary/10 group-hover:text-primary/20 transition-colors">
              <Trophy className="w-24 h-24 rotate-12" />
            </div>
            <h2 className="text-lg font-medium text-gray-400 mb-1">{t('dashboard', 'totalScore')}</h2>
            <p className="text-5xl font-bold text-white mb-6">
              {team.totalScore} <span className="text-xl text-primary font-normal">{t('dashboard', 'pts')}</span>
            </p>
            <Link 
              href="/leaderboard"
              className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors"
            >
              {t('dashboard', 'seeLeaderboard')} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="glass-panel p-8 rounded-3xl relative overflow-hidden bg-gradient-to-br from-primary/20 to-transparent border-primary/30">
            <h2 className="text-2xl font-bold text-white mb-3">{t('dashboard', 'newCase')}</h2>
            <p className="text-gray-300 mb-8 max-w-[80%]">{t('dashboard', 'newCaseDesc')}</p>
            <Link 
              href="/play"
              className="inline-flex items-center justify-center gap-2 w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
            >
              <PlayCircle className="w-5 h-5" /> {t('dashboard', 'investigateNow')}
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
