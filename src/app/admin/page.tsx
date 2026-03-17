'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Search, FileText, Download, Upload, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';

interface CaseType {
  id: string;
  title: string;
  lang: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [cases, setCases] = useState<CaseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamId, setTeamId] = useState('');
  
  const router = useRouter();
  const { t, lang } = useTranslation();

  useEffect(() => {
    const saved = localStorage.getItem('scrum_team');
    if (saved) {
      const team = JSON.parse(saved);
      setTeamId(team.id);
      fetchCases(team.id);
    }
  }, []);

  const fetchCases = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/cases', {
        headers: { 'x-team-id': id }
      });
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCase = async (caseId: string) => {
    if (!confirm(t('admin', 'confirmDelete'))) return;
    
    try {
      const res = await fetch(`/api/admin/cases/${encodeURIComponent(caseId)}`, {
        method: 'DELETE',
        headers: { 'x-team-id': teamId }
      });
      if (res.ok) {
        setCases(cases.filter(c => c.id !== caseId));
      } else {
        alert('Error');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const exportCases = async () => {
    try {
      const res = await fetch('/api/admin/cases/export', {
        headers: { 'x-team-id': teamId }
      });
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'scrum-cases-export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert('Export failed');
      }
    } catch (e) {
      alert('Network error during export');
    }
  };

  const clearDatabase = async () => {
    if (!confirm('⚠️ Sei sicuro di voler SVUOTARE l\'intero archivio dei casi? Questa azione è irreversibile.\n\n✅ NOTA: Le statistiche (voti e giocate) verranno PRESERVATE.')) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/cases/clear', {
        method: 'DELETE',
        headers: { 'x-team-id': teamId }
      });
      if (res.ok) {
        alert(t('admin', 'clearSuccess'));
        fetchCases(teamId);
      } else {
        alert('Clear failed');
        setIsLoading(false);
      }
    } catch (e) {
      alert('Network error');
      setIsLoading(false);
    }
  };

  const resetLeaderboard = async () => {
    if (!confirm(t('admin', 'resetLeaderboardConfirm'))) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/leaderboard/reset', {
        method: 'DELETE',
        headers: { 'x-team-id': teamId }
      });
      if (res.ok) {
        alert(t('admin', 'resetLeaderboardSuccess'));
        
        // Update local storage so the admin's own dashboard reflects the reset immediately
        const savedTeam = localStorage.getItem('scrum_team');
        if (savedTeam) {
          const team = JSON.parse(savedTeam);
          team.totalScore = 0;
          localStorage.setItem('scrum_team', JSON.stringify(team));
        }
      } else {
        alert('Reset failed');
      }
    } catch (e) {
      alert('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const importCases = async (e: React.ChangeEvent<HTMLInputElement>, casesOnly: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = await fetch('/api/admin/cases/import', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-team-id': teamId,
            ...(casesOnly ? { 'x-import-cases-only': 'true' } : {})
          },
          body: JSON.stringify(json)
        });
        if (res.ok) {
          const result = await res.json();
          const { cases, teams, teamsUpdated, sessions, skippedSessions } = result.counts;
          
          let report = t('admin', 'importSuccess');
          report += `\n\n📊 Dettagli:`;
          report += `\n- Casi: ${cases}`;
          report += `\n- Squadre: ${teams}`;
          if (teamsUpdated > 0) report += `\n- Punteggi sync: ${teamsUpdated}`;
          report += `\n- Sessioni (Stats): ${sessions}`;
          if (skippedSessions > 0) report += `\n- Saltati/Esistenti: ${skippedSessions}`;
          
          alert(report);
          fetchCases(teamId);
        } else {
          alert('Import failed. Check JSON format.');
          setIsLoading(false);
        }
      } catch (err) {
        alert('Invalid JSON file');
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FileText className="text-primary w-8 h-8 opacity-90 shadow-sm" />
            {t('admin', 'casesIndex')}
          </h1>
        </div>
        
        <Link 
          href="/admin/cases/new" 
          className="group relative w-full sm:w-auto bg-[#6366f1] text-white px-6 py-3.5 rounded-2xl text-[15px] font-bold shadow-[0_8px_20px_rgba(99,102,241,0.25)] flex items-center justify-center gap-2.5 transition-all hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(99,102,241,0.4)] border border-indigo-400/30 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
          <Plus className="w-5 h-5 relative z-10 drop-shadow-sm" /> <span className="relative z-10 tracking-wide">{t('admin', 'newCaseBtn')}</span>
        </Link>
      </div>

      {/* Control Panel Toolbar */}
      <div className="bg-[#0A0F1C]/80 border border-[#1E293B]/60 rounded-3xl p-6 sm:p-8 flex flex-col xl:flex-row justify-between items-start gap-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Stats Focus */}
        <div className="flex flex-col gap-3 min-w-[200px] relative z-10 w-full xl:w-1/3">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            DATABASE <span className="text-[9px] font-normal text-gray-600 tracking-widest">- {t('admin', 'archiveStatus')}</span>
          </div>
          {cases.length > 0 ? (
            <div className="flex items-center bg-[#0B101E] border border-[#1E293B]/60 rounded-xl h-11 shadow-inner w-fit px-1">
              <div className="flex items-center px-4 gap-2.5 border-r border-[#1E293B]/60 h-7" title="Italian Cases">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                <span className="text-sm font-bold text-emerald-500 tracking-wide">IT <span className="text-white ml-2 text-sm">{cases.filter(c => c.lang === 'it').length} <span className="text-xs font-normal text-gray-400">casi</span></span></span>
              </div>
              <div className="flex items-center px-4 gap-2.5 h-7" title="English Cases">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                <span className="text-sm font-bold text-[#3b82f6] tracking-wide">EN <span className="text-white ml-2 text-sm">{cases.filter(c => c.lang === 'en').length} <span className="text-xs font-normal text-gray-400">cases</span></span></span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic bg-[#0B101E] px-5 py-2.5 rounded-xl border border-[#1E293B]/60 w-fit">Empty Archive</div>
          )}
        </div>

        {/* Action Buttons Container */}
        <div className="flex flex-col gap-4 w-full xl:w-auto relative z-10">
          
          {/* Data Actions (Top Row) */}
          <div className="flex items-center bg-[#0F172A]/50 border border-[#1E293B] rounded-2xl p-1.5 w-full sm:w-auto overflow-hidden divide-x divide-white/10 shadow-lg">
            <button onClick={exportCases} className="flex-1 sm:flex-none hover:bg-white/10 text-gray-300 hover:text-white px-5 py-3 sm:py-2.5 text-sm font-semibold flex items-center justify-center gap-2.5 transition-all group rounded-xl" title={t('admin', 'exportBtn')}>
              <Upload className="w-4 h-4 text-gray-400 group-hover:text-amber-400 group-hover:-translate-y-0.5 transition-all duration-300" /> <span className="whitespace-nowrap">{t('admin', 'exportBtn')}</span>
            </button>
            <label className="flex-1 sm:flex-none hover:bg-white/10 text-gray-300 hover:text-white px-5 py-3 sm:py-2.5 text-sm font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer group rounded-xl" title={t('admin', 'importBtn')}>
              <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-400 group-hover:translate-y-0.5 transition-all duration-300" /> <span className="whitespace-nowrap">{t('admin', 'importBtn')}</span>
              <input type="file" accept=".json" className="hidden" onChange={(e) => importCases(e, false)} />
            </label>
            <label className="flex-1 sm:flex-none hover:bg-white/10 text-gray-300 hover:text-white px-5 py-3 sm:py-2.5 text-sm font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer group rounded-xl" title={t('admin', 'importCasesOnlyBtn')}>
              <Download className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 group-hover:translate-y-0.5 transition-all duration-300" /> <span className="whitespace-nowrap">{t('admin', 'importCasesOnlyBtn')}</span>
              <input type="file" accept=".json" className="hidden" onChange={(e) => importCases(e, true)} />
            </label>
          </div>

          {/* Danger Actions (Bottom Row) */}
           <div className="flex items-center bg-red-950/10 border border-red-900/40 rounded-2xl p-1.5 w-full sm:w-auto overflow-hidden divide-x divide-red-900/30">
            <button onClick={resetLeaderboard} className="flex-1 sm:flex-none hover:bg-red-900/30 text-red-300/80 hover:text-red-300 px-5 py-3 sm:py-2.5 text-sm font-medium flex items-center justify-center gap-2.5 transition-colors rounded-xl" title={t('admin', 'resetLeaderboardBtn')}>
              <AlertTriangle className="w-4 h-4 text-orange-500/70" /> <span className="whitespace-nowrap">{t('admin', 'resetLeaderboardBtn')}</span>
            </button>
            <button onClick={clearDatabase} className="flex-1 sm:flex-none hover:bg-red-900/30 text-red-400/80 hover:text-red-400 px-5 py-3 sm:py-2.5 text-sm font-medium flex items-center justify-center gap-2.5 transition-colors rounded-xl" title={t('admin', 'clearBtn')}>
              <Trash2 className="w-4 h-4 text-red-500/70" /> <span className="whitespace-nowrap">{t('admin', 'clearBtn')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#0F172A]/90 border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-[#1E293B]/70 border-b border-[#1E293B]">
              <tr>
                <th className="px-8 py-5 font-bold tracking-wider w-1/2">Title</th>
                <th className="px-8 py-5 font-bold tracking-wider text-center">Lang</th>
                <th className="px-8 py-5 font-bold tracking-wider text-center">Date</th>
                <th className="px-8 py-5 font-bold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-semibold tracking-wide">{t('admin', 'loading')}</span>
                    </div>
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-500 bg-black/20">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-12 h-12 opacity-20 mb-2" />
                      <span className="font-medium">Empty Archive.</span>
                      <span className="text-xs opacity-70">Start by creating a new case.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.04] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-semibold text-white text-base leading-snug">{c.title}</div>
                      <div className="text-xs text-gray-500 mt-1.5 font-mono opacity-60 group-hover:opacity-100 transition-opacity">id: {c.id}</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex min-w-[3.5rem] justify-center px-3 py-1.5 text-xs font-bold rounded-lg border ${c.lang === 'it' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                        {c.lang.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center text-gray-500 font-medium">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/admin/cases/${encodeURIComponent(c.id)}`}
                          className="p-3 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all hover:scale-110 shadow-sm"
                          title={t('admin', 'editCaseBtn')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => deleteCase(c.id)}
                          className="p-3 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all hover:scale-110 shadow-sm"
                          title={t('admin', 'deleteCaseBtn')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
