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
    
    // Rimuoviamo l'id interno e date per esportare un oggetto pulito, portabile su altri database
    const exportableCases = cases.map(({ id, createdAt, ...rest }) => rest);
    
    return NextResponse.json(exportableCases);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export cases' }, { status: 500 });
  }
}
