import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Today's log
    const todayLog = await prisma.stepLog.findUnique({
      where: { userId_date: { userId: session.userId, date: todayStr } },
    });

    // Last 14 days history
    const history = await prisma.stepLog.findMany({
      where: { userId: session.userId },
      orderBy: { date: 'asc' },
      take: 14,
    });

    const target = todayLog?.target || 10000;
    const currentSteps = todayLog?.steps || 7450;
    const totalStepsLogged = history.reduce((sum, h) => sum + h.steps, 0);
    const averageSteps = history.length > 0 ? Math.round(totalStepsLogged / history.length) : currentSteps;

    return NextResponse.json({
      todaySteps: currentSteps,
      target,
      averageSteps,
      history,
    });
  } catch (error) {
    console.error('Steps GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch steps' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { steps, date, target } = body;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const stepsCount = parseInt(steps, 10) || 0;

    const log = await prisma.stepLog.upsert({
      where: { userId_date: { userId: session.userId, date: targetDate } },
      update: { steps: stepsCount, ...(target ? { target: parseInt(target, 10) } : {}) },
      create: {
        userId: session.userId,
        date: targetDate,
        steps: stepsCount,
        target: parseInt(target, 10) || 10000,
      },
    });

    // Check achievement for 100k steps
    const allSteps = await prisma.stepLog.findMany({ where: { userId: session.userId } });
    const grandTotal = allSteps.reduce((sum, s) => sum + s.steps, 0);
    if (grandTotal >= 100000) {
      const ach = await prisma.achievement.findUnique({ where: { code: 'STEPS_100K' } });
      if (ach) {
        await prisma.userAchievement.upsert({
          where: { userId_achievementId: { userId: session.userId, achievementId: ach.id } },
          update: {},
          create: { userId: session.userId, achievementId: ach.id },
        });
      }
    }

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error('Steps POST error:', error);
    return NextResponse.json({ error: 'Failed to record steps' }, { status: 500 });
  }
}
