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

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: 'Accesso negato.' }, { status: 403 });
  }

  const { id } = await props.params;

  try {
    const caseItem = await prisma.case.findUnique({
      where: { id },
    });
    
    if (!caseItem) {
      return NextResponse.json({ error: 'Caso non trovato.' }, { status: 404 });
    }
    
    return NextResponse.json({ case: caseItem });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch case' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: 'Accesso negato.' }, { status: 403 });
  }

  const { id } = await props.params;

  try {
    const body = await request.json();
    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        lang: body.lang,
        title: body.title,
        story: body.story,
        hint: body.hint,
        correctLocation: body.correctLocation,
        explanationLocation: body.explanationLocation,
        correctSuspect: body.correctSuspect,
        explanationSuspect: body.explanationSuspect,
        correctWeapon: body.correctWeapon,
        explanationWeapon: body.explanationWeapon,
      },
    });
    
    return NextResponse.json({ success: true, case: updatedCase });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update case' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: 'Accesso negato.' }, { status: 403 });
  }

  const { id } = await props.params;

  try {
    // Also delete any play sessions linked to this case to avoid foreign key constraints errors
    await prisma.playSession.deleteMany({
      where: { caseId: id }
    });
    
    await prisma.case.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete case' }, { status: 500 });
  }
}
