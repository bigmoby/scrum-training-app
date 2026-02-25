'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/LanguageContext';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Inserisci la tua email');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMsg('');
    setPreviewUrl('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore durante la richiesta');
      }

      setSuccessMsg(t('forgotPassword', 'successMessage'));
      if (data.previewUrl) setPreviewUrl(data.previewUrl);
      setEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-panel p-8 sm:p-10 rounded-3xl w-full max-w-md border border-white/10 relative overflow-hidden"
      >
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">{t('forgotPassword', 'title')}</h1>
          <p className="text-muted-foreground text-sm">{t('forgotPassword', 'subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="popLayout">
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-500/10 text-green-400 border border-green-500/20 p-4 rounded-xl text-sm text-center flex flex-col items-center gap-3"
              >
                <p>{successMsg}</p>
                {previewUrl && (
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-white bg-green-600 hover:bg-green-500 px-3 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 transition-colors">
                    <Mail className="w-4 h-4" /> {t('forgotPassword', 'readEmailDev')}
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!successMsg && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">{t('forgotPassword', 'emailLabel')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-white placeholder-white/30"
                  placeholder={t('forgotPassword', 'emailPlaceholder')}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400 text-center">
              {error}
            </motion.p>
          )}

          {!successMsg && (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all duration-200 shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <><Send className="w-4 h-4" /> {t('forgotPassword', 'submitBtn')}</>
              )}
            </button>
          )}
        </form>

        <div className="mt-8 text-center pt-6 border-t border-white/10">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> {t('forgotPassword', 'backToLogin')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
