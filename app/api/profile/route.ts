import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      mainGoal,
      experienceLevel,
      workoutDaysPerWeek,
      workoutDurationMinutes,
      heightCm,
      weightKg,
      targetWeightKg,
      units,
      theme,
      emailNotifications,
      pushNotifications,
    } = body;

    if (name) {
      await prisma.user.update({
        where: { id: session.userId },
        data: { name: name.trim() },
      });
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId: session.userId },
      update: {
        mainGoal,
        experienceLevel,
        workoutDaysPerWeek: parseInt(workoutDaysPerWeek, 10) || 4,
        workoutDurationMinutes: parseInt(workoutDurationMinutes, 10) || 45,
        heightCm: parseFloat(heightCm) || 175,
        weightKg: parseFloat(weightKg) || 75,
        targetWeightKg: targetWeightKg ? parseFloat(targetWeightKg) : undefined,
        units,
        theme,
        emailNotifications,
        pushNotifications,
      },
      create: {
        userId: session.userId,
        mainGoal: mainGoal || 'BUILD_MUSCLE',
        experienceLevel: experienceLevel || 'INTERMEDIATE',
        workoutDaysPerWeek: parseInt(workoutDaysPerWeek, 10) || 4,
        workoutDurationMinutes: parseInt(workoutDurationMinutes, 10) || 45,
        heightCm: parseFloat(heightCm) || 175,
        weightKg: parseFloat(weightKg) || 75,
        targetWeightKg: targetWeightKg ? parseFloat(targetWeightKg) : undefined,
        units: units || 'METRIC',
        theme: theme || 'dark',
        emailNotifications: emailNotifications ?? true,
        pushNotifications: pushNotifications ?? true,
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
