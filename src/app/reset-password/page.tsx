'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/LanguageContext';

function ResetPasswordForm() {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError(t('resetPassword', 'missingTokenErr'));
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!newPassword || !confirmPassword) {
      setError('Compila tutti i campi');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Le password non coincidono');
      return;
    }

    if (newPassword.length < 6) {
      setError('La password deve essere lunga almeno 6 caratteri');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore durante l\'aggiornamento della password');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
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
        transition={{ duration: 0.5 }}
        className="glass-panel p-8 sm:p-10 rounded-3xl w-full max-w-md border border-white/10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30">
            <KeyRound className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">{t('resetPassword', 'title')}</h1>
          <p className="text-muted-foreground text-sm">{t('resetPassword', 'subtitle')}</p>
        </div>

        {error && !token ? (
           <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-sm flex flex-col items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              <p>{error}</p>
              <Link href="/forgot-password" className="mt-2 text-primary hover:text-primary/80 underline font-medium">
                {t('resetPassword', 'requestNewLink')}
              </Link>
           </div>
        ) : success ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl">
              <p className="font-semibold mb-1">Password Aggiornata!</p>
              <p className="text-sm opacity-90">Verrai reindirizzato al login tra pochi secondi...</p>
            </div>
            <button
               onClick={() => router.push('/')}
               className="text-primary hover:text-white text-sm transition-colors"
            >
              {t('resetPassword', 'loginInstead')}
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">{t('resetPassword', 'newPasswordLabel')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-white placeholder-white/30"
                  placeholder={t('resetPassword', 'newPasswordPlaceholder')}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">{t('resetPassword', 'confirmPasswordLabel')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-white placeholder-white/30"
                  placeholder={t('resetPassword', 'confirmPasswordPlaceholder')}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400 text-center py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all duration-200 shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] disabled:opacity-50 flex justify-center items-center"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                t('resetPassword', 'submitBtn')
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center pt-6 border-t border-white/10">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Torna al Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-[80vh]">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
