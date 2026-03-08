import { PrismaClient } from '@prisma/client';
import StatsDisplay from '../../components/StatsDisplay';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import Link from 'next/link';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function StatisticsPage() {
  // 1. Fetch active cases with their sessions
  const cases = await prisma.case.findMany({
    include: {
      playSessions: true,
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  // 2. Fetch orphaned sessions (from deleted cases)
  const orphanedSessions = await prisma.playSession.findMany({
    where: { caseId: null } as any,
    orderBy: { completedAt: 'asc' }
  });

  // 3. Process active cases
  const activeStats = cases.map((c) => {
    const totalSessions = c.playSessions.length;
    const locChoices: string[] = JSON.parse(c.locationChoices || '[]');
    const locStats: Record<string, number> = {};
    locChoices.forEach(choice => locStats[choice] = 0);
    
    const susChoices: string[] = JSON.parse(c.suspectChoices || '[]');
    const susStats: Record<string, number> = {};
    susChoices.forEach(choice => susStats[choice] = 0);
    
    const wepChoices: string[] = JSON.parse(c.weaponChoices || '[]');
    const wepStats: Record<string, number> = {};
    wepChoices.forEach(choice => wepStats[choice] = 0);

    c.playSessions.forEach(session => {
        if (session.locationAnswer) locStats[session.locationAnswer] = (locStats[session.locationAnswer] || 0) + 1;
        if (session.suspectAnswer) susStats[session.suspectAnswer] = (susStats[session.suspectAnswer] || 0) + 1;
        if (session.weaponAnswer) wepStats[session.weaponAnswer] = (wepStats[session.weaponAnswer] || 0) + 1;
    });

    return {
      id: c.id,
      title: c.title,
      story: c.story,
      hint: c.hint,
      lang: c.lang,
      totalSessions,
      correctLocation: c.correctLocation,
      correctSuspect: c.correctSuspect,
      correctWeapon: c.correctWeapon,
      locations: Object.entries(locStats).map(([name, count]) => ({
        name,
        count,
        percentage: totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0
      })).sort((a, b) => b.count - a.count),
      suspects: Object.entries(susStats).map(([name, count]) => ({
        name,
        count,
        percentage: totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0
      })).sort((a, b) => b.count - a.count),
      weapons: Object.entries(wepStats).map(([name, count]) => ({
        name,
        count,
        percentage: totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0
      })).sort((a, b) => b.count - a.count),
    }
  });

  // 4. Process orphaned sessions grouped by title
  const orphanedGroups: Record<string, any[]> = {};
  orphanedSessions.forEach((s: any) => {
    const title = s.caseTitle || 'Unknown Case';
    if (!orphanedGroups[title]) orphanedGroups[title] = [];
    orphanedGroups[title].push(s);
  });

  const legacyStats = Object.entries(orphanedGroups).map(([title, sessions]) => {
    const totalSessions = sessions.length;
    const locStats: Record<string, number> = {};
    const susStats: Record<string, number> = {};
    const wepStats: Record<string, number> = {};

    sessions.forEach(s => {
      if (s.locationAnswer) locStats[s.locationAnswer] = (locStats[s.locationAnswer] || 0) + 1;
      if (s.suspectAnswer) susStats[s.suspectAnswer] = (susStats[s.suspectAnswer] || 0) + 1;
      if (s.weaponAnswer) wepStats[s.weaponAnswer] = (wepStats[s.weaponAnswer] || 0) + 1;
    });

    return {
      id: `legacy-${title}`,
      title: `${title} (Archived)`,
      story: "Legacy data from a deleted case.",
      hint: null,
      lang: 'it', // Legacy data shows in Italian by default or current lang
      totalSessions,
      correctLocation: "",
      correctSuspect: "",
      correctWeapon: "",
      locations: Object.entries(locStats).map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalSessions) * 100)
      })).sort((a, b) => b.count - a.count),
      suspects: Object.entries(susStats).map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalSessions) * 100)
      })).sort((a, b) => b.count - a.count),
      weapons: Object.entries(wepStats).map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalSessions) * 100)
      })).sort((a, b) => b.count - a.count),
    }
  });

  const statsData = [...activeStats, ...legacyStats as any];

  return (
    <div className="w-full max-w-5xl mx-auto pt-10">
      <StatsDisplay cases={statsData} />
    </div>
  );
}
