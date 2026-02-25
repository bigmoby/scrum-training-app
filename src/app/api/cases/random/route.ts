import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');
  const lang = searchParams.get('lang') || 'it';

  if (!teamId) {
    return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
  }

  try {
    // Find cases that the team has NOT played yet
    const playedCases = await prisma.playSession.findMany({
      where: { teamId },
      select: { caseId: true }
    });
    
    const playedCaseIds = playedCases.map(pc => pc.caseId);

    // Fetch available cases matching the requested language
    // Note: if a user switches language they might play the translated version of a case they already played in another language,
    // but here we just filter out the specific playedCaseIds which are globally unique per language in our seed since they are distinct rows.
    const availableCases = await prisma.case.findMany({
      where: {
        id: { notIn: playedCaseIds },
        lang: lang
      }
    });

    if (availableCases.length === 0) {
      return NextResponse.json({ message: 'No more cases available' }, { status: 404 });
    }

    // Pick a random case
    const randomCase = availableCases[Math.floor(Math.random() * availableCases.length)];

    return NextResponse.json({ caseData: randomCase });
  } catch (error) {
    console.error('Error fetching random case', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
