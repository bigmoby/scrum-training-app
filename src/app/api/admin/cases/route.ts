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
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ cases });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: 'Accesso negato. Permessi da amministratore richiesti.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const newCase = await prisma.case.create({
      data: {
        lang: body.lang || 'it',
        title: body.title,
        story: body.story,
        hint: body.hint || null,
        correctLocation: body.correctLocation,
        explanationLocation: body.explanationLocation || '-',
        correctSuspect: body.correctSuspect,
        explanationSuspect: body.explanationSuspect || '-',
        correctWeapon: body.correctWeapon,
        explanationWeapon: body.explanationWeapon || '-',
      },
    });
    
    return NextResponse.json({ success: true, case: newCase });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create case' }, { status: 500 });
  }
}
