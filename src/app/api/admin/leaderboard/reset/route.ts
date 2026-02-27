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

export async function DELETE(request: Request) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: 'Accesso negato.' }, { status: 403 });
  }

  try {
    // 1. Delete all play sessions 
    await prisma.playSession.deleteMany();

    // 2. Delete all registered teams (except administrators)
    await prisma.team.deleteMany({
      where: {
        isAdmin: false
      }
    });

    return NextResponse.json({ success: true, message: 'Classifica e squadre resettate con successo' });
  } catch (error: any) {
    console.error('Reset error:', error);
    return NextResponse.json({ error: error.message || 'Failed to reset leaderboard' }, { status: 500 });
  }
}
