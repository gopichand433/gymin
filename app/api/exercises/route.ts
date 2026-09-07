import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const muscle = searchParams.get('muscle');
    const equipment = searchParams.get('equipment');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');

    const where: any = {};

    if (muscle && muscle !== 'ALL') {
      where.primaryMuscle = muscle;
    }
    if (equipment && equipment !== 'ALL') {
      where.equipment = equipment;
    }
    if (difficulty && difficulty !== 'ALL') {
      where.difficulty = difficulty;
    }
    if (search && search.trim() !== '') {
      where.name = { contains: search.trim() };
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ exercises });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 });
  }
}
