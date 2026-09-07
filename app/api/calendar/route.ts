import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all workouts
    const workouts = await prisma.workoutSession.findMany({
      where: { userId: session.userId },
      orderBy: { startedAt: 'asc' },
    });

    // Fetch all nutrition logs
    const nutrition = await prisma.nutritionLog.findMany({
      where: { userId: session.userId },
    });

    // Fetch step logs
    const steps = await prisma.stepLog.findMany({
      where: { userId: session.userId },
    });

    // Fetch weight logs
    const weights = await prisma.weightLog.findMany({
      where: { userId: session.userId },
    });

    // Aggregate by date (YYYY-MM-DD)
    const calendarMap: Record<
      string,
      {
        date: string;
        workouts: any[];
        calories: number;
        protein: number;
        steps: number;
        weight?: number;
      }
    > = {};

    for (const w of workouts) {
      const d = w.startedAt.toISOString().split('T')[0];
      if (!calendarMap[d]) {
        calendarMap[d] = { date: d, workouts: [], calories: 0, protein: 0, steps: 0 };
      }
      calendarMap[d].workouts.push(w);
    }

    for (const n of nutrition) {
      const d = n.date;
      if (!calendarMap[d]) {
        calendarMap[d] = { date: d, workouts: [], calories: 0, protein: 0, steps: 0 };
      }
      calendarMap[d].calories += n.calories;
      calendarMap[d].protein += n.protein;
    }

    for (const s of steps) {
      const d = s.date;
      if (!calendarMap[d]) {
        calendarMap[d] = { date: d, workouts: [], calories: 0, protein: 0, steps: 0 };
      }
      calendarMap[d].steps = s.steps;
    }

    for (const wt of weights) {
      const d = wt.date;
      if (!calendarMap[d]) {
        calendarMap[d] = { date: d, workouts: [], calories: 0, protein: 0, steps: 0 };
      }
      calendarMap[d].weight = wt.weightKg;
    }

    return NextResponse.json({ calendarMap });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 });
  }
}
