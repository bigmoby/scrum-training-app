'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CaseForm from '../CaseForm';

export default function EditCasePage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    
    const fetchCase = async () => {
      try {
        const saved = localStorage.getItem('scrum_team');
        if (!saved) throw new Error('Unauthorized');
        const team = JSON.parse(saved);

        const res = await fetch(`/api/admin/cases/${id}`, {
          headers: { 'x-team-id': team.id }
        });
        
        if (!res.ok) throw new Error('Failed to fetch case data');
        
        const json = await res.json();
        setData(json.case);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCase();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-10 text-center text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">{error}</div>;
  }

  return <CaseForm initialData={data} isEdit={true} />;
}
