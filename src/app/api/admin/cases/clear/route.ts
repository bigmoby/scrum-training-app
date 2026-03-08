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
    return NextResponse.json({ error: 'Accesso negato. Permessi da amministratore richiesti.' }, { status: 403 });
  }

  try {
    // Dopodiché eliminiamo tutti i casi. 
    // Grazie alla relazione SetNull definita nello schema, le sessioni rimarranno nel DB scollegate.
    await prisma.case.deleteMany({});
    
    return NextResponse.json({ success: true, message: 'All cases cleared successfully. Statistics preserved.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to clear the database' }, { status: 500 });
  }
}
