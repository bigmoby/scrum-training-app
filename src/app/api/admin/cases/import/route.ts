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

export async function POST(request: Request) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: 'Accesso negato. Permessi da amministratore richiesti.' }, { status: 403 });
  }

  try {
    const cases = await request.json();
    
    if (!Array.isArray(cases)) {
      return NextResponse.json({ error: 'Il formato JSON deve essere un array di oggetti caso.' }, { status: 400 });
    }

    // Facciamo un filtro veloce per assicurarci che abbiano almeno un titolo e una storia
    const validCases = cases.filter(c => c.title && c.story);

    if (validCases.length === 0) {
      return NextResponse.json({ error: 'Nessun caso valido trovato nel file.' }, { status: 400 });
    }

    // Assicuriamoci che non stiamo iniettando ID vecchi, in modo che il db li autogeneri
    const importableCases = validCases.map(c => ({
      lang: c.lang || 'it',
      title: c.title,
      story: c.story,
      hint: c.hint || null,
      correctLocation: c.correctLocation || '',
      explanationLocation: c.explanationLocation || '-',
      correctSuspect: c.correctSuspect || '',
      explanationSuspect: c.explanationSuspect || '-',
      correctWeapon: c.correctWeapon || '',
      explanationWeapon: c.explanationWeapon || '-'
    }));

    await prisma.case.createMany({
      data: importableCases,
    });
    
    return NextResponse.json({ success: true, count: importableCases.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to import cases' }, { status: 500 });
  }
}
