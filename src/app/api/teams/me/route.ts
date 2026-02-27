import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const teamId = request.headers.get('x-team-id');
  if (!teamId) return NextResponse.json({ error: 'Missing team id' }, { status: 400 });

  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        totalScore: true,
        isAdmin: true,
      }
    });

    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    return NextResponse.json({ team });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
  }
}
