'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Target, UserX, Wrench, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/LanguageContext';

interface Case {
  id: string;
  title: string;
  story: string;
  hint: string;
}

export default function PlayGame() {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const [team, setTeam] = useState<{ id: string; name: string } | null>(null);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Selections
  const [location, setLocation] = useState('');
  const [suspect, setSuspect] = useState('');
  const [weapon, setWeapon] = useState('');

  // Results
  const [results, setResults] = useState<any>(null);

  // Randomized options shown to the player (refreshed each case)
  const [displayedLocations, setDisplayedLocations] = useState<string[]>([]);
  const [displayedSuspects, setDisplayedSuspects] = useState<string[]>([]);
  const [displayedWeapons, setDisplayedWeapons] = useState<string[]>([]);

  // Full option pools
  const allLocations = [
    "Sprint Planning", "Daily Scrum", "Sprint Review", "Retrospective",
    "Refinement", "During Sprint",
    "Team Meeting", "Stakeholder Presentation", "Manager Review",
  ];
  const allSuspects = [
    "PO", "Scrum Master", "DEV Team",
    "Stakeholder", "Manager", "CEO",
  ];
  const allWeapons = [
    "Product Backlog", "Sprint Backlog", "Increment",
    "Definition of Done", "Sprint Goal", "Product Goal",
    "Jira Board", "Story Points", "Velocity",
    "Burndown Chart", "Sicurezza Psicologica (Mancanza di)", "Technical Debt",
  ];

  /** Returns `count` unique items from `pool`, always including `mustInclude`. */
  function buildOptions(pool: string[], mustInclude: string, count: number): string[] {
    const others = pool.filter(o => o !== mustInclude);
    const shuffled = [...others].sort(() => Math.random() - 0.5);
    const picked = [mustInclude, ...shuffled.slice(0, count - 1)];
    return picked.sort(() => Math.random() - 0.5);
  }

  useEffect(() => {
    const savedTeam = localStorage.getItem('scrum_team');
    if (!savedTeam) {
      router.push('/');
      return;
    }
    
    const parsedTeam = JSON.parse(savedTeam);
    setTeam(parsedTeam);

    // Reset state before fetching (important if lang changes)
    setIsLoading(true);
    setResults(null);
    setLocation('');
    setSuspect('');
    setWeapon('');
    setError('');
    setCaseData(null);

    async function fetchCase() {
      try {
        const res = await fetch(`/api/cases/random?teamId=${parsedTeam.id}&lang=${lang}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || t('play', 'noMoreCases'));
        } else {
          setCaseData(data.caseData);
          // Build randomized option subsets now that we know the correct answers
          setDisplayedLocations(buildOptions(allLocations, data.caseData.correctLocation, 6));
          setDisplayedSuspects(buildOptions(allSuspects, data.caseData.correctSuspect, 4));
          setDisplayedWeapons(buildOptions(allWeapons, data.caseData.correctWeapon, 6));
        }
      } catch (err: any) {
        setError('Errore di connessione');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCase();
  }, [router, lang]);

  const handleAccuse = async () => {
    if (!location || !suspect || !weapon) {
      setError(t('play', 'errorMissing'));
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/play/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: team?.id,
          caseId: caseData?.id,
          location,
          suspect,
          weapon
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update local storage score if possible, or force dashboard reload
      const savedTeamStr = localStorage.getItem('scrum_team');
      if (savedTeamStr) {
          const t = JSON.parse(savedTeamStr);
          t.totalScore = (t.totalScore || 0) + data.results.scoreAwarded;
          localStorage.setItem('scrum_team', JSON.stringify(t));
      }

      setResults(data.results);
    } catch (err: any) {
      setError(err.message || 'Errore durante l\'accusa');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-[50vh] flex items-center justify-center text-white"><span className="animate-pulse">{t('play', 'loadingCases')}</span></div>;

  if (error && !caseData) {
    return (
      <div className="w-full max-w-2xl mx-auto pt-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">{t('play', 'noMoreCases')}</h2>
        <p className="text-gray-400 mb-8">{error}</p>
        <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all">
          <ArrowLeft className="w-5 h-5" /> {t('play', 'backToDashboard')}
        </Link>
      </div>
    );
  }

  // Helper component for selections
  const SelectionGroup = ({ title, icon: Icon, options, value, onChange }: any) => (
    <div className="glass-panel p-6 rounded-2xl">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Icon className="text-primary w-5 h-5" /> {title}
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {options.map((opt: string) => (
          <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${value === opt ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-black/20 border-white/5 hover:border-white/20'}`}>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${value === opt ? 'border-primary' : 'border-gray-500'}`}>
              {value === opt && <div className="w-3 h-3 bg-primary rounded-full" />}
            </div>
            <span className={value === opt ? 'text-white' : 'text-gray-400'}>{opt}</span>
            <input 
              type="radio" name={title} value={opt} 
              checked={value === opt} onChange={(e) => onChange(e.target.value)} 
              className="hidden" 
            />
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto pt-6 pb-20">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('play', 'abandonCase')}
      </Link>

      <AnimatePresence mode="wait">
        {!results ? (
          <motion.div 
            key="game-board"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            {/* Case File */}
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden border-l-4 border-l-primary">
              <span className="absolute top-4 right-6 text-xs font-mono text-primary/60 tracking-widest uppercase">{t('play', 'classified')}</span>
              <h1 className="text-3xl font-bold text-white mb-4">{caseData?.title}</h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-6 bg-black/20 p-6 rounded-2xl border border-white/5">
                {caseData?.story}
              </p>
              {caseData?.hint && (
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl text-primary-foreground text-sm flex gap-3 items-start">
                  <span className="font-bold text-primary">{t('play', 'hintTitle')}</span>
                  <span className="opacity-90">{caseData.hint}</span>
                </div>
              )}
            </div>

            {/* Evidence Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SelectionGroup title={t('play', 'theLocation')} icon={Target} options={displayedLocations} value={location} onChange={setLocation} />
              <SelectionGroup title={t('play', 'theSuspect')} icon={UserX} options={displayedSuspects} value={suspect} onChange={setSuspect} />
              <SelectionGroup title={t('play', 'theWeapon')} icon={Wrench} options={displayedWeapons} value={weapon} onChange={setWeapon} />
            </div>

            {error && <p className="text-red-400 text-center font-medium animate-pulse">{error}</p>}

            <div className="text-center pt-4">
              <button 
                onClick={handleAccuse}
                disabled={isSubmitting}
                className="px-12 py-4 bg-red-600 hover:bg-red-700 text-white text-xl font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] disabled:opacity-50 mt-4 active:scale-95"
              >
                {isSubmitting ? t('play', 'verifyingBtn') : t('play', 'accuseBtn')}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-6 md:p-10 rounded-3xl max-w-4xl w-full mx-auto text-center relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-full h-2 ${results.scoreAwarded === 30 ? 'bg-green-500' : results.scoreAwarded > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
            
            <h2 className="text-4xl font-bold text-white mb-2">{t('play', 'investigationResult')}</h2>
            <p className="text-gray-400 mb-8">{t('play', 'youScored')} <span className="text-2xl font-bold text-primary">{results.scoreAwarded}</span> {t('play', 'points')}</p>
            
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 mb-8 text-left shadow-inner">
              <h3 className="text-lg font-bold text-white mb-3">{t('play', 'theCase')} {caseData?.title}</h3>
              <p className="text-gray-300 italic text-base leading-relaxed">"{caseData?.story}"</p>
            </div>
            
            <div className="flex flex-col gap-4 mb-10 text-left">
              {[
                { label: t('play', 'theLocation'), isCorrect: results.isCorrectLocation, correct: results.correctLocation, user: location, explanation: results.explanationLocation },
                { label: t('play', 'theSuspect'), isCorrect: results.isCorrectSuspect, correct: results.correctSuspect, user: suspect, explanation: results.explanationSuspect },
                { label: t('play', 'theWeapon'), isCorrect: results.isCorrectWeapon, correct: results.correctWeapon, user: weapon, explanation: results.explanationWeapon },
              ].map((item, i) => (
                <div key={i} className={`p-4 md:p-5 rounded-xl border flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center ${item.isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  
                  {/* Icon & User Answer */}
                  <div className="flex items-center gap-4 min-w-[280px]">
                    {item.isCorrect ? <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" /> : <XCircle className="w-8 h-8 text-red-500 shrink-0" />}
                    <div>
                      <p className="text-sm text-gray-400">{item.label}</p>
                      <p className="text-white font-medium">{t('play', 'youSaid')} {item.user}</p>
                      {!item.isCorrect && <p className="text-sm text-green-400 mt-1">{t('play', 'itWas')} {item.correct}</p>}
                    </div>
                  </div>

                  {/* Explanation text (fills remaining space) */}
                  <div className="flex-1 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-6 text-sm text-gray-300">
                    <strong className="text-primary mr-2 block mb-1 md:inline-block md:mb-0">{t('play', 'explanation')}</strong> 
                    <span className="leading-relaxed">{item.explanation}</span>
                  </div>

                  {/* Score */}
                  <div className="hidden md:block ml-auto font-bold text-xl w-12 text-right">
                    {item.isCorrect ? '+10' : '0'}
                  </div>
                </div>
              ))}
            </div>

            <Link href="/dashboard" className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] inline-block">
              {t('play', 'backToBase')}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
