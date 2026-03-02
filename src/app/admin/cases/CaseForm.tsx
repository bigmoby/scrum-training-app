'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';

interface CaseFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function CaseForm({ initialData = null, isEdit = false }: CaseFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    lang: 'it',
    title: '',
    story: '',
    hint: '',
    correctLocation: '',
    explanationLocation: '',
    locationChoices: 'Sprint Planning, Daily Scrum, Sprint Review, Retrospective, Refinement, During Sprint, Team Meeting, Stakeholder Presentation, Manager Review',
    correctSuspect: '',
    explanationSuspect: '',
    suspectChoices: 'PO, Scrum Master, DEV Team, Stakeholder, Manager, CEO',
    correctWeapon: '',
    explanationWeapon: '',
    weaponChoices: 'Product Backlog, Sprint Backlog, Increment, Definition of Done, Sprint Goal, Product Goal, Jira Board, Story Points, Velocity, Burndown Chart, Sicurezza Psicologica (mancanza di), Technical Debt',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        lang: initialData.lang || 'it',
        title: initialData.title || '',
        story: initialData.story || '',
        hint: initialData.hint || '',
        correctLocation: initialData.correctLocation || '',
        explanationLocation: initialData.explanationLocation || '-',
        locationChoices: initialData.locationChoices ? (typeof initialData.locationChoices === 'string' ? JSON.parse(initialData.locationChoices).join(', ') : initialData.locationChoices.join(', ')) : '',
        correctSuspect: initialData.correctSuspect || '',
        explanationSuspect: initialData.explanationSuspect || '-',
        suspectChoices: initialData.suspectChoices ? (typeof initialData.suspectChoices === 'string' ? JSON.parse(initialData.suspectChoices).join(', ') : initialData.suspectChoices.join(', ')) : '',
        correctWeapon: initialData.correctWeapon || '',
        explanationWeapon: initialData.explanationWeapon || '-',
        weaponChoices: initialData.weaponChoices ? (typeof initialData.weaponChoices === 'string' ? JSON.parse(initialData.weaponChoices).join(', ') : initialData.weaponChoices.join(', ')) : '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const saved = localStorage.getItem('scrum_team');
    if (!saved) return;
    const team = JSON.parse(saved);

    try {
      const url = isEdit ? `/api/admin/cases/${initialData.id}` : '/api/admin/cases';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        locationChoices: formData.locationChoices.split(',').map(s => s.trim()).filter(Boolean),
        suspectChoices: formData.suspectChoices.split(',').map(s => s.trim()).filter(Boolean),
        weaponChoices: formData.weaponChoices.split(',').map(s => s.trim()).filter(Boolean),
      };

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-team-id': team.id
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t('admin', 'formError'));
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors border border-white/5" title={t('admin', 'backBtn')}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">
          {isEdit ? t('admin', 'editCaseTitle') : t('admin', 'createCaseTitle')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 relative">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}
        
        {/* Generali */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary border-b border-white/10 pb-2">Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase">{t('admin', 'formLangLabel')}</label>
              <select 
                name="lang" 
                value={formData.lang} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white"
              >
                <option value="it">Italiano (IT)</option>
                <option value="en">English (EN)</option>
              </select>
            </div>
            <div className="col-span-3 space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase">{t('admin', 'formTitleLabel')}</label>
              <input 
                name="title" 
                value={formData.title} 
                onChange={handleChange}
                placeholder={t('admin', 'formTitleLabel')}
                required
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase">{t('admin', 'formStoryLabel')}</label>
            <textarea 
              name="story" 
              value={formData.story} 
              onChange={handleChange}
              placeholder={t('admin', 'formStoryLabel')}
              required
              rows={4}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white resize-y"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase">{t('admin', 'formHintLabel')}</label>
            <textarea 
              name="hint" 
              value={formData.hint} 
              onChange={handleChange}
              placeholder={t('admin', 'formHintLabel')}
              rows={2}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white resize-y"
            />
          </div>
        </div>

        {/* Soluzioni e Motivazioni */}
        <div className="space-y-6 pt-4 border-t border-white/10">
          <h3 className="text-lg font-semibold text-primary border-b border-white/10 pb-2">Solutions & Explanations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Luogo */}
            <div className="space-y-1 bg-white/5 p-4 rounded-xl border border-white/5">
              <label className="text-xs font-semibold text-blue-400 uppercase tracking-widest">{t('admin', 'formLocationChoicesLabel')}</label>
              <textarea name="locationChoices" value={formData.locationChoices} onChange={handleChange} placeholder="Sprint Planning, Daily Scrum, ..." rows={2} required className="w-full px-4 py-2 text-sm bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white mb-2" />
              
              <label className="text-xs font-semibold text-blue-400 uppercase tracking-widest">{t('admin', 'formCorrectLocationLabel')}</label>
              <select name="correctLocation" value={formData.correctLocation} onChange={handleChange} required className="w-full px-4 py-3 mb-2 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white">
                <option value="" disabled>Select...</option>
                {formData.locationChoices.split(',').map(s => s.trim()).filter(Boolean).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <label className="text-xs font-semibold text-blue-400 uppercase tracking-widest mt-2">{t('admin', 'formExplanationLocationLabel')}</label>
              <textarea name="explanationLocation" value={formData.explanationLocation} onChange={handleChange} placeholder={t('admin', 'formExplanationPlaceholder')} rows={2} required className="w-full px-4 py-2 text-sm bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white" />
            </div>

            {/* Sospettato */}
            <div className="space-y-1 bg-white/5 p-4 rounded-xl border border-white/5">
              <label className="text-xs font-semibold text-orange-400 uppercase tracking-widest">{t('admin', 'formSuspectChoicesLabel')}</label>
              <textarea name="suspectChoices" value={formData.suspectChoices} onChange={handleChange} placeholder="PO, Scrum Master, DEV Team, ..." rows={2} required className="w-full px-4 py-2 text-sm bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white mb-2" />

              <label className="text-xs font-semibold text-orange-400 uppercase tracking-widest">{t('admin', 'formCorrectSuspectLabel')}</label>
              <select name="correctSuspect" value={formData.correctSuspect} onChange={handleChange} required className="w-full px-4 py-3 mb-2 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white">
                <option value="" disabled>Select...</option>
                {formData.suspectChoices.split(',').map(s => s.trim()).filter(Boolean).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <label className="text-xs font-semibold text-orange-400 uppercase tracking-widest mt-2">{t('admin', 'formExplanationSuspectLabel')}</label>
              <textarea name="explanationSuspect" value={formData.explanationSuspect} onChange={handleChange} placeholder={t('admin', 'formExplanationPlaceholder')} rows={2} required className="w-full px-4 py-2 text-sm bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white" />
            </div>

            {/* Arma */}
            <div className="col-span-1 md:col-span-2 space-y-1 bg-white/5 p-4 rounded-xl border border-white/5">
              <label className="text-xs font-semibold text-red-500 uppercase tracking-widest">{t('admin', 'formWeaponChoicesLabel')}</label>
              <textarea name="weaponChoices" value={formData.weaponChoices} onChange={handleChange} placeholder="Product Backlog, Sprint Backlog, ..." rows={2} required className="w-full px-4 py-2 text-sm bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white mb-2" />

              <label className="text-xs font-semibold text-red-500 uppercase tracking-widest">{t('admin', 'formCorrectWeaponLabel')}</label>
              <select name="correctWeapon" value={formData.correctWeapon} onChange={handleChange} required className="w-full px-4 py-3 mb-2 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white">
                <option value="" disabled>Select...</option>
                {formData.weaponChoices.split(',').map(s => s.trim()).filter(Boolean).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <label className="text-xs font-semibold text-red-500 uppercase tracking-widest mt-2">{t('admin', 'formExplanationWeaponLabel')}</label>
              <textarea name="explanationWeapon" value={formData.explanationWeapon} onChange={handleChange} placeholder={t('admin', 'formExplanationPlaceholder')} rows={2} required className="w-full px-4 py-2 text-sm bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white" />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isLoading ? t('admin', 'formSavingBtn') : t('admin', 'formSubmitBtn')}
          </button>
        </div>
      </form>
    </div>
  );
}
