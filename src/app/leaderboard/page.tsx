'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/LanguageContext';

interface Team {
  id: string;
  name: string;
  totalScore: number;
}

export default function Leaderboard() {
  const { t } = useTranslation();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        setTeams(data.teams);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto pt-10">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('leaderboard', 'backToDashboard')}
      </Link>

      <div className="text-center mb-12">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30"
        >
          <Trophy className="w-10 h-10 text-primary" />
        </motion.div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">{t('leaderboard', 'title')}</h1>
        <p className="text-muted-foreground text-sm">{t('leaderboard', 'subtitle')}</p>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden p-2 sm:p-6 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />
        
        {isLoading ? (
          <div className="py-20 text-center animate-pulse text-gray-400">{t('leaderboard', 'loading')}</div>
        ) : teams.length === 0 ? (
          <div className="py-20 text-center text-gray-400">0 Casi completati finora.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {teams.map((team, index) => (
              <motion.div 
                key={team.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center p-4 rounded-2xl ${index === 0 ? 'bg-primary/20 border border-primary/30 glow-primary' : 'bg-black/30 border border-white/5'}`}
              >
                <div className="w-12 text-center font-bold text-xl text-gray-500 flex items-center justify-center">
                  {index === 0 ? <Medal className="w-8 h-8 text-yellow-400" /> : 
                   index === 1 ? <Medal className="w-7 h-7 text-gray-300" /> : 
                   index === 2 ? <Medal className="w-6 h-6 text-amber-600" /> : 
                   `#${index + 1}`}
                </div>
                <div className="flex-1 px-4">
                  <h3 className={`font-semibold text-lg ${index === 0 ? 'text-primary-foreground' : 'text-gray-200'}`}>
                    {team.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className={`font-bold text-2xl ${index === 0 ? 'text-primary' : 'text-white'}`}>
                    {team.totalScore}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">pts</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
