import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

async function checkAdmin(request: Request) {
  const teamId = request.headers.get('x-team-id');
  if (!teamId) return false;
  
  try {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    return team?.isAdmin === true;
  } catch (error) {
    return false;
  }
}

export async function POST(request: Request) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: 'Accesso negato. Permessi da amministratore richiesti.' }, { status: 403 });
  }

  try {
    const casesOnly = request.headers.get('x-import-cases-only') === 'true';
    const payload = await request.json();
    
    let casesToProcess: any[] = [];
    let teamsToProcess: any[] = [];
    let sessionsToProcess: any[] = [];

    // Support legacy array format or the new full dump object format
    if (Array.isArray(payload)) {
      casesToProcess = payload;
    } else if (payload && typeof payload === 'object') {
      casesToProcess = Array.isArray(payload.cases) ? payload.cases : [];
      teamsToProcess = Array.isArray(payload.teams) ? payload.teams : [];
      sessionsToProcess = Array.isArray(payload.playSessions) ? payload.playSessions : [];
    } else {
      return NextResponse.json({ error: 'Il formato JSON non è valido o supportato.' }, { status: 400 });
    }

    if (casesOnly) {
      teamsToProcess = [];
      sessionsToProcess = [];
    }

    // NORMALIZE: Ensure every item has a temporary ID for mapping if none exists
    const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    casesToProcess.forEach((c, i) => { 
      if (!c.id) {
        c.id = `dump-case-${i}-${slugify(c.title || 'untitled')}`.substring(0, 50); 
      }
    });
    teamsToProcess.forEach((t, i) => { if (!t.id) t.id = `dump-team-${i}-${t.name}`.substring(0, 50); });
    sessionsToProcess.forEach((s, i) => { if (!s.id) s.id = `dump-session-${Date.now()}-${i}`; });

    return await prisma.$transaction(async (tx) => {
      // 1. Process TEAMS
      const existingTeams = await tx.team.findMany({ select: { id: true, name: true, email: true, totalScore: true } });
      const teamIdMap: Record<string, string> = {};
      const teamsToCreate: any[] = [];
      let teamsUpdated = 0;

      for (const t of teamsToProcess) {
        const match = existingTeams.find(et => et.id === t.id || et.name === t.name || (t.email && et.email === t.email));

        if (match) {
          teamIdMap[t.id] = match.id;
          // Sync score if different
          if (match.totalScore !== (t.totalScore || 0)) {
            await tx.team.update({
              where: { id: match.id },
              data: { totalScore: t.totalScore || 0 }
            });
            teamsUpdated++;
          }
        } else {
          teamsToCreate.push({
            id: t.id,
            name: t.name,
            email: t.email || null,
            password: t.password || null,
            isAdmin: t.isAdmin || false,
            totalScore: t.totalScore || 0,
            createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
            updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date()
          });
          teamIdMap[t.id] = t.id;
        }
      }

      if (teamsToCreate.length > 0) {
        await tx.team.createMany({ data: teamsToCreate });
      }

      // 2. Process CASES
      const existingCases = await tx.case.findMany({ select: { id: true, title: true, lang: true } });
      const caseIdMap: Record<string, string> = {};
      const casesToCreate: any[] = [];

      for (const c of casesToProcess) {
        const match = existingCases.find(ec => ec.id === c.id || (ec.title === c.title && ec.lang === c.lang));
        
        if (match) {
          caseIdMap[c.id] = match.id;
        } else {
          const idToUse = c.id; 
          casesToCreate.push({
            id: idToUse,
            lang: c.lang || 'it',
            title: c.title,
            story: c.story,
            hint: c.hint || null,
            correctLocation: c.correctLocation || '',
            explanationLocation: c.explanationLocation || '-',
            correctSuspect: c.correctSuspect || '',
            explanationSuspect: c.explanationSuspect || '-',
            correctWeapon: c.correctWeapon || '',
            explanationWeapon: c.explanationWeapon || '-',
            locationChoices: Array.isArray(c.locationChoices) ? JSON.stringify(c.locationChoices) : (c.locationChoices || '[]'),
            suspectChoices: Array.isArray(c.suspectChoices) ? JSON.stringify(c.suspectChoices) : (c.suspectChoices || '[]'),
            weaponChoices: Array.isArray(c.weaponChoices) ? JSON.stringify(c.weaponChoices) : (c.weaponChoices || '[]'),
            createdAt: c.createdAt ? new Date(c.createdAt) : new Date()
          });
          caseIdMap[c.id] = idToUse;
        }
      }

      if (casesToCreate.length > 0) {
        await tx.case.createMany({ data: casesToCreate });
      }

      // 3. Process PLAY SESSIONS
      const existingSessions = await tx.playSession.findMany({ select: { id: true } });
      const existingSessionIds = new Set(existingSessions.map(s => s.id));
      const sessionsToCreate: any[] = [];
      let skippedSessions = 0;

      for (const s of sessionsToProcess) {
        if (existingSessionIds.has(s.id)) {
          skippedSessions++;
          continue;
        }

        const targetTeamId = teamIdMap[s.teamId];
        const targetCaseId = caseIdMap[s.caseId];

        if (targetTeamId && targetCaseId) {
          // Find original case title for context if not present in session dump
          const originalCase = casesToProcess.find(c => c.id === s.caseId);
          
          sessionsToCreate.push({
            id: s.id,
            teamId: targetTeamId,
            caseId: targetCaseId,
            caseTitle: s.caseTitle || originalCase?.title || null,
            locationAnswer: s.locationAnswer || null,
            suspectAnswer: s.suspectAnswer || null,
            weaponAnswer: s.weaponAnswer || null,
            isCorrectLocation: s.isCorrectLocation || false,
            isCorrectSuspect: s.isCorrectSuspect || false,
            isCorrectWeapon: s.isCorrectWeapon || false,
            scoreAwarded: s.scoreAwarded || 0,
            completedAt: s.completedAt ? new Date(s.completedAt) : new Date()
          } as any);
        } else {
          skippedSessions++;
        }
      }

      if (sessionsToCreate.length > 0) {
        await tx.playSession.createMany({ data: sessionsToCreate });
      }

      return NextResponse.json({ 
        success: true, 
        counts: {
          cases: casesToCreate.length,
          teams: teamsToCreate.length,
          teamsUpdated,
          sessions: sessionsToCreate.length,
          skippedSessions
        }
      });
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message || 'Failed to import cases' }, { status: 500 });
  }
}
