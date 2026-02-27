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
    // Eliminiamo logicamente le relazioni o facciamo pulizia a cascata. 
    // Siccome PlaySession è legato ai casi tramite foreign key, se c'è restrict fallirebbe. 
    // Prisma con SQLite predefinito blocca se ci sono sessioni legate, quindi le dobbiamo eliminare prima
    await prisma.playSession.deleteMany({});
    
    // Dopodiché eliminiamo tutti i casi
    await prisma.case.deleteMany({});
    
    return NextResponse.json({ success: true, message: 'All cases and play sessions cleared successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to clear the database' }, { status: 500 });
  }
}
