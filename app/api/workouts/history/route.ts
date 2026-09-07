import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await prisma.workoutSession.findMany({
      where: { userId: session.userId },
      include: {
        sets: {
          include: { exercise: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const previousPerformance: Record<string, { weightKg: number; reps: number }> = {};
    for (const s of sessions) {
      for (const set of s.sets) {
        if (!previousPerformance[set.exerciseId] && set.weightKg > 0) {
          previousPerformance[set.exerciseId] = {
            weightKg: set.weightKg,
            reps: set.actualReps,
          };
        }
      }
    }

    return NextResponse.json({ sessions, previousPerformance });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
