import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      orderBy: {
        totalScore: 'desc'
      },
      take: 20 // Top 20 teams
    });

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Error fetching leaderboard', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
