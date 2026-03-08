'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Users, Zap, CheckCircle2, ArrowLeft, BarChart3, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';
import Link from 'next/link';

type StatItem = {
  name: string;
  count: number;
  percentage: number;
};

type CaseStatsData = {
  id: string;
  title: string;
  story: string;
  hint: string | null;
  lang: string;
  totalSessions: number;
  correctLocation: string;
  correctSuspect: string;
  correctWeapon: string;
  locations: StatItem[];
  suspects: StatItem[];
  weapons: StatItem[];
};

export default function StatsDisplay({ cases }: { cases: CaseStatsData[] }) {
  const { lang, t } = useTranslation();
  const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>({});

  const toggleStory = (id: string) => {
    setExpandedStories(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter cases by current language globally and ensure they have at least 1 play session
  const filteredCases = cases.filter(c => c.lang === lang && c.totalSessions > 0);

  const ProgressBar = ({ item, isCorrect, totalCount }: { item: StatItem, isCorrect: boolean, totalCount: number }) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="flex items-center gap-1 text-gray-300">
           {item.name} 
           {isCorrect && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
        </span>
        <span className="text-gray-400">{item.percentage}% ({item.count})</span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-2.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${item.percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-2.5 rounded-full ${isCorrect ? 'bg-emerald-500' : 'bg-primary'}`}
          style={{ 
             boxShadow: isCorrect ? '0 0 10px rgba(16, 185, 129, 0.4)' : '0 0 10px rgba(99, 102, 241, 0.4)'
          }}
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4 text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> {t('statistics', 'backToDashboard')}
          </Link>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="text-primary w-8 h-8"/> {t('statistics', 'title')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('statistics', 'subtitle')}
          </p>
        </div>
      </div>

      {filteredCases.length === 0 ? (
        <div className="glass-panel p-8 rounded-3xl text-center text-gray-400">
          {t('statistics', 'noData')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredCases.map((c, i) => (
            <motion.div 
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass-panel p-6 rounded-3xl"
            >
              <div className="mb-6 pb-4 border-b border-white/10 flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4">
                  <h2 className="text-xl font-bold text-white tracking-tight leading-snug">{c.title}</h2>
                  <div className="text-sm font-medium text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20 whitespace-nowrap">
                    {c.totalSessions} {t('statistics', 'plays')}
                  </div>
                </div>

                {/* Collapsible Story Section */}
                <div>
                  <button
                    onClick={() => toggleStory(c.id)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors py-1"
                  >
                    <FileText className="w-4 h-4" />
                    {expandedStories[c.id] ? t('statistics', 'hideStoryBtn') : t('statistics', 'showStoryBtn')}
                    {expandedStories[c.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  <AnimatePresence>
                    {expandedStories[c.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {c.story}
                          
                          {c.hint && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                              <span className="font-semibold text-primary block mb-1">{t('play', 'hintTitle')}</span>
                              <span className="text-gray-400 italic">{c.hint}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Location Stats */}
                <div>
                  <h3 className="text-gray-400 font-medium mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" /> {t('statistics', 'locationVotes')}
                  </h3>
                  {c.locations.map(item => (
                    <ProgressBar 
                      key={item.name} 
                      item={item} 
                      isCorrect={item.name === c.correctLocation} 
                      totalCount={c.totalSessions}
                    />
                  ))}
                </div>

                {/* Suspect Stats */}
                <div>
                  <h3 className="text-gray-400 font-medium mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-400" /> {t('statistics', 'suspectVotes')}
                  </h3>
                  {c.suspects.map(item => (
                    <ProgressBar 
                      key={item.name} 
                      item={item} 
                      isCorrect={item.name === c.correctSuspect} 
                      totalCount={c.totalSessions}
                    />
                  ))}
                </div>

                {/* Weapon Stats */}
                <div>
                  <h3 className="text-gray-400 font-medium mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-rose-400" /> {t('statistics', 'weaponVotes')}
                  </h3>
                  {c.weapons.map(item => (
                    <ProgressBar 
                      key={item.name} 
                      item={item} 
                      isCorrect={item.name === c.correctWeapon} 
                      totalCount={c.totalSessions}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
