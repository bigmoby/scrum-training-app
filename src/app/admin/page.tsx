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
  const { t } = useTranslation();

  useEffect(() => {
    const saved = localStorage.getItem('scrum_team');
    if (saved) {
      const team = JSON.parse(saved);
      setTeamId(team.id);
      fetchCases(team.id);
    }
  }, []);

  const fetchCases = async (id: string) => {
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
      const res = await fetch(`/api/admin/cases/${caseId}`, {
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
    if (!confirm(t('admin', 'clearConfirm'))) return;
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

  const importCases = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            'x-team-id': teamId 
          },
          body: JSON.stringify(json)
        });
        if (res.ok) {
          alert(t('admin', 'importSuccess'));
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="text-primary w-6 h-6" /> {t('admin', 'casesIndex')}
        </h1>
        
        <div className="flex items-center gap-3">
          <button onClick={exportCases} className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 sm:py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all" title={t('admin', 'exportBtn')}>
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">{t('admin', 'exportBtn')}</span>
          </button>

          <label className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 sm:py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer" title={t('admin', 'importBtn')}>
            <Upload className="w-4 h-4" /> <span className="hidden sm:inline">{t('admin', 'importBtn')}</span>
            <input type="file" accept=".json" className="hidden" onChange={importCases} />
          </label>

          <button onClick={clearDatabase} className="bg-red-500/20 hover:bg-red-500/40 text-red-200 hover:text-white px-4 py-3 sm:py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all" title={t('admin', 'clearBtn')}>
            <AlertTriangle className="w-4 h-4" /> <span className="hidden sm:inline">{t('admin', 'clearBtn')}</span>
          </button>

          <Link 
            href="/admin/cases/new" 
            className="bg-primary hover:bg-primary/90 text-white px-4 py-3 sm:py-2 rounded-xl text-sm font-semibold shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] flex items-center gap-2 transition-all sm:ml-4"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t('admin', 'newCaseBtn')}</span>
          </Link>
        </div>
      </div>

      <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-black/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold text-center">Lang</th>
                <th className="px-6 py-4 font-semibold text-center">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500 animate-pulse">
                    {t('admin', 'loading')}
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    Empty Archive
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{c.title}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${c.lang === 'it' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {c.lang.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/cases/${c.id}`}
                          className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                          title={t('admin', 'editCaseBtn')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => deleteCase(c.id)}
                          className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
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
