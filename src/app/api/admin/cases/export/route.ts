import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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

export async function GET(request: Request) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: 'Accesso negato. Permessi da amministratore richiesti.' }, { status: 403 });
  }

  try {
    const cases = await prisma.case.findMany({
      orderBy: { createdAt: 'asc' },
    });
    
    const teams = await prisma.team.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const playSessions = await prisma.playSession.findMany({
      orderBy: { completedAt: 'asc' },
    });
    
    // Return a full dump object. We no longer strip 'id' so that relationships
    // can be maintained when importing the dump back.
    const dump = {
      cases,
      teams,
      playSessions
    };
    
    return NextResponse.json(dump);
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export database dump' }, { status: 500 });
  }
}
