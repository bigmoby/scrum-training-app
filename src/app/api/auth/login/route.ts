import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { nickname, password } = await request.json();

    if (!nickname || nickname.trim() === '' || !password) {
      return NextResponse.json({ error: 'Nickname e Password sono obbligatori' }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { name: nickname.trim() },
    });

    if (!team || !team.password) {
      return NextResponse.json({ error: 'Le credenziali inserite non sono corrette' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, team.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Le credenziali inserite non sono corrette' }, { status: 401 });
    }

    return NextResponse.json({ 
        team: { id: team.id, name: team.name, totalScore: team.totalScore, isAdmin: team.isAdmin } 
    });
  } catch (error) {
    console.error('Error in login route', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
