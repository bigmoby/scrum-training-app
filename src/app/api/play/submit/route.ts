import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { teamId, caseId, location, suspect, weapon } = await request.json();

    if (!teamId || !caseId) {
        return NextResponse.json({ error: 'Team ID and Case ID are required' }, { status: 400 });
    }

    // Verify Team exists to prevent FK violation
    const teamData = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!teamData) {
      return NextResponse.json({ 
        error: 'Team not found in the database. Your session might have expired or the database was reset. Please register again.',
        code: 'TEAM_NOT_FOUND'
      }, { status: 404 });
    }

    const caseData = await prisma.case.findUnique({
      where: { id: caseId }
    });

    if (!caseData) {
      // This can happen if the database was re-seeded after the case was fetched.
      // The frontend should reload and fetch a new case.
      return NextResponse.json({ 
        error: 'Case not found. The game database may have been updated. Please go back to the dashboard and start a new investigation.',
        code: 'CASE_NOT_FOUND'
      }, { status: 404 });
    }

    // Check answers
    const isCorrectLocation = caseData.correctLocation === location;
    const isCorrectSuspect = caseData.correctSuspect === suspect;
    const isCorrectWeapon = caseData.correctWeapon === weapon;

    // Calculate score (10 pts each, max 30)
    let scoreAwarded = 0;
    if (isCorrectLocation) scoreAwarded += 10;
    if (isCorrectSuspect) scoreAwarded += 10;
    if (isCorrectWeapon) scoreAwarded += 10;

    // Save Play Session
    const session = await prisma.playSession.create({
      data: {
        teamId,
        caseId,
        isCorrectLocation,
        isCorrectSuspect,
        isCorrectWeapon,
        scoreAwarded
      }
    });

    // Update Team Total Score
    await prisma.team.update({
      where: { id: teamId },
      data: {
        totalScore: {
          increment: scoreAwarded
        }
      }
    });

    return NextResponse.json({
        success: true,
        results: {
            isCorrectLocation,
            isCorrectSuspect,
            isCorrectWeapon,
            correctLocation: caseData.correctLocation,
            explanationLocation: caseData.explanationLocation,
            correctSuspect: caseData.correctSuspect,
            explanationSuspect: caseData.explanationSuspect,
            correctWeapon: caseData.correctWeapon,
            explanationWeapon: caseData.explanationWeapon,
            scoreAwarded
        }
    });
  } catch (error) {
    console.error('Error submitting play', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
