'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Search, FileText } from 'lucide-react';

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
    if (!confirm('Sei sicuro di voler eliminare questo caso?')) return;
    
    try {
      const res = await fetch(`/api/admin/cases/${caseId}`, {
        method: 'DELETE',
        headers: { 'x-team-id': teamId }
      });
      if (res.ok) {
        setCases(cases.filter(c => c.id !== caseId));
      } else {
        alert('Errore eliminazione caso');
      }
    } catch (e) {
      alert('Network error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="text-primary w-6 h-6" /> Archivio Casi
        </h1>
        <Link 
          href="/admin/cases/new" 
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> Nuovo Caso
        </Link>
      </div>

      <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-black/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold">Titolo</th>
                <th className="px-6 py-4 font-semibold text-center">Lingua</th>
                <th className="px-6 py-4 font-semibold text-center">Aggiunto Il</th>
                <th className="px-6 py-4 font-semibold text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500 animate-pulse">
                    Caricamento casi...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    Nessun caso presente nel database.
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
                          title="Modifica"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => deleteCase(c.id)}
                          className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Elimina"
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
