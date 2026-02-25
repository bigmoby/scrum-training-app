'use client';

import { useTranslation, Language } from '../i18n/LanguageContext';

export default function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();

  return (
    <div className="absolute top-4 right-4 z-50 flex gap-2 p-1 bg-black/40 border border-white/10 rounded-full backdrop-blur-md">
      <button
        onClick={() => setLang('it')}
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
          lang === 'it' 
            ? 'bg-primary text-white font-bold shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
        title="Italiano"
      >
        IT
      </button>
      <button
        onClick={() => setLang('en')}
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
          lang === 'en' 
            ? 'bg-primary text-white font-bold shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
        title="English"
      >
        EN
      </button>
    </div>
  );
}
