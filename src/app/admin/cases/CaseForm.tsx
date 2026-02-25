'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

interface CaseFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function CaseForm({ initialData = null, isEdit = false }: CaseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    lang: 'it',
    title: '',
    story: '',
    hint: '',
    correctLocation: '',
    explanationLocation: '',
    correctSuspect: '',
    explanationSuspect: '',
    correctWeapon: '',
    explanationWeapon: '',
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
        correctSuspect: initialData.correctSuspect || '',
        explanationSuspect: initialData.explanationSuspect || '-',
        correctWeapon: initialData.correctWeapon || '',
        explanationWeapon: initialData.explanationWeapon || '-',
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

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-team-id': team.id
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Errore durante il salvataggio');
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
        <Link href="/admin" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors border border-white/5">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">
          {isEdit ? 'Modifica Caso' : 'Nuovo Caso'}
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
          <h3 className="text-lg font-semibold text-primary border-b border-white/10 pb-2">Informazioni Generali</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase">Lingua</label>
              <select 
                name="lang" 
                value={formData.lang} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white"
              >
                <option value="it">Italiano (IT)</option>
                <option value="en">Inglese (EN)</option>
              </select>
            </div>
            <div className="col-span-3 space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase">Titolo</label>
              <input 
                name="title" 
                value={formData.title} 
                onChange={handleChange}
                placeholder="Titolo del caso investigativo"
                required
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase">Storia</label>
            <textarea 
              name="story" 
              value={formData.story} 
              onChange={handleChange}
              placeholder="Descrizione dell'antipattern accaduto (il delitto)..."
              required
              rows={4}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white resize-y"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase">Suggerimento (Hint)</label>
            <textarea 
              name="hint" 
              value={formData.hint} 
              onChange={handleChange}
              placeholder="Un piccolo indizio..."
              rows={2}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white resize-y"
            />
          </div>
        </div>

        {/* Soluzioni e Motivazioni */}
        <div className="space-y-6 pt-4 border-t border-white/10">
          <h3 className="text-lg font-semibold text-primary border-b border-white/10 pb-2">Soluzione e Motivazioni</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Luogo */}
            <div className="space-y-1 bg-white/5 p-4 rounded-xl border border-white/5">
              <label className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Luogo Corretto</label>
              <select name="correctLocation" value={formData.correctLocation} onChange={handleChange} required className="w-full px-4 py-3 mb-2 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white">
                <option value="" disabled>Seleziona Luogo...</option>
                <optgroup label="— Scrum Events (validi) —">
                  <option value="Sprint Planning">Sprint Planning</option>
                  <option value="Daily Scrum">Daily Scrum</option>
                  <option value="Sprint Review">Sprint Review</option>
                  <option value="Retrospective">Retrospective</option>
                  <option value="Refinement">Refinement</option>
                  <option value="During Sprint">During Sprint</option>
                </optgroup>
                <optgroup label="— Trappole —">
                  <option value="Team Meeting">Team Meeting</option>
                  <option value="Stakeholder Presentation">Stakeholder Presentation</option>
                  <option value="Manager Review">Manager Review</option>
                </optgroup>
              </select>
              <textarea name="explanationLocation" value={formData.explanationLocation} onChange={handleChange} placeholder="Motivazione Luogo..." rows={2} required className="w-full px-4 py-2 text-sm bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white" />
            </div>

            {/* Sospettato */}
            <div className="space-y-1 bg-white/5 p-4 rounded-xl border border-white/5">
              <label className="text-xs font-semibold text-orange-400 uppercase tracking-widest">Sospettato Corretto</label>
              <select name="correctSuspect" value={formData.correctSuspect} onChange={handleChange} required className="w-full px-4 py-3 mb-2 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white">
                <option value="" disabled>Seleziona Sospettato...</option>
                <optgroup label="— Accountability Scrum (valide) —">
                  <option value="PO">Product Owner (PO)</option>
                  <option value="Scrum Master">Scrum Master</option>
                  <option value="DEV Team">Developer / DEV Team</option>
                </optgroup>
                <optgroup label="— Trappole —">
                  <option value="Stakeholder">Stakeholder</option>
                  <option value="Manager">Manager</option>
                  <option value="CEO">CEO</option>
                </optgroup>
              </select>
              <textarea name="explanationSuspect" value={formData.explanationSuspect} onChange={handleChange} placeholder="Motivazione Sospettato..." rows={2} required className="w-full px-4 py-2 text-sm bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white" />
            </div>

            {/* Arma */}
            <div className="col-span-1 md:col-span-2 space-y-1 bg-white/5 p-4 rounded-xl border border-white/5">
              <label className="text-xs font-semibold text-red-500 uppercase tracking-widest">Arma Corretta</label>
              <select name="correctWeapon" value={formData.correctWeapon} onChange={handleChange} required className="w-full px-4 py-3 mb-2 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white">
                <option value="" disabled>Seleziona Arma...</option>
                <optgroup label="— Artefatti Scrum (validi) —">
                  <option value="Product Backlog">Product Backlog</option>
                  <option value="Sprint Backlog">Sprint Backlog</option>
                  <option value="Increment">Increment</option>
                  <option value="Definition of Done">Definition of Done (DoD)</option>
                  <option value="Sprint Goal">Sprint Goal</option>
                  <option value="Product Goal">Product Goal</option>
                </optgroup>
                <optgroup label="— Trappole —">
                  <option value="Jira Board">Jira Board</option>
                  <option value="Story Points">Story Points</option>
                  <option value="Velocity">Velocity</option>
                  <option value="Burndown Chart">Burndown Chart</option>
                  <option value="Sicurezza Psicologica (Mancanza di)">Sicurezza Psicologica (Mancanza di)</option>
                  <option value="Technical Debt">Technical Debt</option>
                </optgroup>
              </select>
              <textarea name="explanationWeapon" value={formData.explanationWeapon} onChange={handleChange} placeholder="Motivazione Arma..." rows={2} required className="w-full px-4 py-2 text-sm bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-white" />
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
            {isEdit ? 'Salva Modifiche' : 'Crea Caso'}
          </button>
        </div>
      </form>
    </div>
  );
}
