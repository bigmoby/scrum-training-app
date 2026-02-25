'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '../i18n/LanguageContext';

export default function Login() {
  const { t } = useTranslation();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  
  const router = useRouter();

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setSuccessMsg('');
    setPreviewUrl('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !password) {
      setError('Compila tutti i campi obbligatori');
      return;
    }

    if (!isLoginMode && !email.trim()) {
      setError('Inserisci anche l\'email per registrarti');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/signup';
      const body = isLoginMode 
        ? { nickname, password }
        : { nickname, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.suggestedNickname) {
           throw new Error(`${data.error}. Potresti usare: ${data.suggestedNickname}`);
        }
        throw new Error(data.error || 'Errore durante l\'autenticazione');
      }

      if (!isLoginMode) {
        // Sucessfully registered
        setSuccessMsg(t('login', 'successSignup'));
        if (data.previewUrl) setPreviewUrl(data.previewUrl);
        setIsLoginMode(true);
        setPassword('');
      } else {
        // Save to local storage for simple session management
        localStorage.setItem('scrum_team', JSON.stringify(data.team));
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-panel p-8 sm:p-10 rounded-3xl w-full max-w-md glow-primary relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <div className="text-center mb-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30"
          >
            <Search className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{t('login', 'title')}</h1>
          <p className="text-muted-foreground text-sm">{t('login', 'subtitle')}</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-black/40 rounded-xl p-1 mb-8 border border-white/10 relative">
          <motion.div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-lg shadow-lg"
            animate={{ left: isLoginMode ? 4 : "50%" }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          />
          <button
            onClick={() => toggleMode()}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium z-10 transition-colors ${isLoginMode ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <LogIn className="w-4 h-4" /> {t('login', 'signInBtn')}
          </button>
          <button
            onClick={() => toggleMode()}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium z-10 transition-colors ${!isLoginMode ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <UserPlus className="w-4 h-4" /> {t('login', 'signUpBtn')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-500/10 text-green-400 border border-green-500/20 p-3 rounded-xl text-sm text-center mb-4 flex flex-col items-center gap-2"
              >
                <p>{successMsg}</p>
                {previewUrl && (
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-white bg-green-600 hover:bg-green-500 px-3 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors">
                    <Mail className="w-3 h-3" /> {t('login', 'readEmailDev')}
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">{t('login', 'teamLabel')}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-white placeholder-white/30"
                placeholder={t('login', 'teamPlaceholder')}
                disabled={isLoading}
              />
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {!isLoginMode && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="space-y-1"
              >
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">{t('login', 'emailLabel')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-white placeholder-white/30"
                    placeholder={t('login', 'emailPlaceholder')}
                    disabled={isLoading}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">{t('login', 'passwordLabel')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-white placeholder-white/30"
                placeholder={t('login', 'passwordPlaceholder')}
                disabled={isLoading}
              />
            </div>
          </div>
          
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400 text-center py-2">
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? (
              <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : isLoginMode ? (
              t('login', 'signInBtn')
            ) : (
              t('login', 'signUpBtn')
            )}
          </button>
        </form>

        <AnimatePresence mode="popLayout">
          {isLoginMode && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 text-center pt-5 border-t border-white/10"
            >
              <Link href="/forgot-password" className="text-sm text-gray-400 hover:text-white transition-colors">
                {t('login', 'forgotPassword')}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
