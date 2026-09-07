import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, days } = body;

    if (!name || !days || days.length === 0) {
      return NextResponse.json({ error: 'Plan name and at least one day are required.' }, { status: 400 });
    }

    // Set other plans for this user as inactive
    await prisma.workoutPlan.updateMany({
      where: { userId: session.userId },
      data: { isActive: false },
    });

    // Create custom workout plan
    const newPlan = await prisma.workoutPlan.create({
      data: {
        userId: session.userId,
        name: name.trim(),
        description: description?.trim() || 'Customized user training split',
        splitType: 'CUSTOM',
        isCustom: true,
        isActive: true,
        days: {
          create: days.map((d: any, dayIdx: number) => ({
            name: d.name || `Day ${dayIdx + 1}`,
            dayOfWeek: dayIdx + 1,
            order: dayIdx + 1,
            exercises: {
              create: (d.exercises || []).map((e: any, exIdx: number) => ({
                exerciseId: e.exerciseId,
                targetSets: parseInt(e.targetSets, 10) || 3,
                targetReps: String(e.targetReps || '8-12'),
                targetRestSec: parseInt(e.targetRestSec, 10) || 60,
                order: exIdx + 1,
              })),
            },
          })),
        },
      },
      include: {
        days: {
          include: {
            exercises: {
              include: { exercise: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, plan: newPlan });
  } catch (error) {
    console.error('Save custom plan error:', error);
    return NextResponse.json({ error: 'Failed to save workout plan' }, { status: 500 });
  }
}
