import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find active plan for user, or find system preset if none
    let plan = await prisma.workoutPlan.findFirst({
      where: { userId: session.userId, isActive: true },
      include: {
        days: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!plan) {
      // Fallback to any active plan or the 5-day split
      plan = await prisma.workoutPlan.findFirst({
        where: { isCustom: false },
        include: {
          days: {
            include: {
              exercises: {
                include: { exercise: true },
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      });
    }

    // Determine today's day (1 = Monday ... 7 = Sunday)
    const dayOfWeek = new Date().getDay() === 0 ? 7 : new Date().getDay();
    const todayDay = plan?.days.find((d) => d.dayOfWeek === dayOfWeek) || plan?.days[0];

    // Fetch previous weights/reps for each exercise in today's day so the user has previous benchmarks!
    const exerciseIds = todayDay?.exercises.map((e) => e.exerciseId) || [];
    const previousSets = await prisma.workoutSet.findMany({
      where: {
        exerciseId: { in: exerciseIds },
        isCompleted: true,
        session: { userId: session.userId },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const previousPerformanceMap: Record<string, { weightKg: number; reps: number }> = {};
    for (const s of previousSets) {
      if (!previousPerformanceMap[s.exerciseId]) {
        previousPerformanceMap[s.exerciseId] = {
          weightKg: s.weightKg,
          reps: s.actualReps || s.targetReps,
        };
      }
    }

    return NextResponse.json({
      plan,
      todayDay,
      previousPerformance: previousPerformanceMap,
    });
  } catch (error) {
    console.error('Active plan error:', error);
    return NextResponse.json({ error: 'Failed to fetch active workout plan' }, { status: 500 });
  }
}
