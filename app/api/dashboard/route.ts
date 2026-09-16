import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, calculateUserStreak } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Fetch user & profile
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true },
    });

    const profile = user?.profile;
    const calorieTarget = profile?.calorieTarget || 2200;
    const proteinTarget = profile?.proteinTarget || 140;
    const carbsTarget = profile?.carbsTarget || 250;
    const fatTarget = profile?.fatTarget || 70;
    const stepTarget = profile?.stepTarget || 10000;
    const waterTargetMl = profile?.waterTargetMl || 3000;

    // 2. Fetch today's nutrition
    const nutritionLogs = await prisma.nutritionLog.findMany({
      where: { userId: session.userId, date: todayStr },
    });
    const consumedCalories = Math.round(nutritionLogs.reduce((sum, n) => sum + n.calories, 0));
    const consumedProtein = Math.round(nutritionLogs.reduce((sum, n) => sum + n.protein, 0));
    const consumedCarbs = Math.round(nutritionLogs.reduce((sum, n) => sum + n.carbs, 0));
    const consumedFat = Math.round(nutritionLogs.reduce((sum, n) => sum + n.fat, 0));

    // 3. Fetch active workout split & today's day
    const activePlan = await prisma.workoutPlan.findFirst({
      where: { userId: session.userId, isActive: true },
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

    const dayOfWeek = new Date().getDay() === 0 ? 7 : new Date().getDay();
    const todayDay = activePlan?.days.find((d) => d.dayOfWeek === dayOfWeek) || activePlan?.days[0];

    // Check if user already completed a workout session today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayCompletedSession = await prisma.workoutSession.findFirst({
      where: {
        userId: session.userId,
        createdAt: { gte: startOfToday },
      },
    });

    // 4. Fetch today's steps
    const stepLog = await prisma.stepLog.findUnique({
      where: { userId_date: { userId: session.userId, date: todayStr } },
    });

    // 5. Fetch weight
    const weightLogs = await prisma.weightLog.findMany({
      where: { userId: session.userId },
      orderBy: { date: 'asc' },
    });
    const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weightKg : (profile?.weightKg || 76.5);
    const startWeight = weightLogs.length > 0 ? weightLogs[0].weightKg : currentWeight;
    const weightChange = Math.round((currentWeight - startWeight) * 10) / 10;

    // 6. Recent Achievements
    const recentAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
      take: 3,
    });

    // 7. Dynamic unbroken streak calculation
    const streakDays = await calculateUserStreak(session.userId);

    const tomorrowDayOfWeek = dayOfWeek === 7 ? 1 : dayOfWeek + 1;
    const nextDay = activePlan?.days.find((d) => d.dayOfWeek === tomorrowDayOfWeek) || activePlan?.days[1] || activePlan?.days[0];

    return NextResponse.json({
      userName: user?.name || 'Athlete',
      streakDays,
      todayWorkout: {
        dayName: todayDay?.name || 'Chest & Triceps',
        exerciseCount: todayDay?.exercises?.length || 6,
        durationMin: profile?.workoutDurationMinutes || 55,
        isCompleted: !!todayCompletedSession,
        completedAt: todayCompletedSession?.createdAt || null,
        completedSessionId: todayCompletedSession?.id || null,
      },
      nextWorkout: nextDay ? {
        dayName: nextDay.name,
        exerciseCount: nextDay.exercises?.length || 6,
      } : null,
      nutrition: {
        calories: consumedCalories,
        calorieTarget,
        protein: consumedProtein,
        proteinTarget,
        carbs: consumedCarbs,
        carbsTarget,
        fat: consumedFat,
        fatTarget,
      },
      steps: {
        current: stepLog?.steps ?? 0,
        target: stepTarget,
      },
      water: {
        current: 0,
        target: waterTargetMl,
      },
      weight: {
        current: currentWeight,
        change: weightChange,
      },
      recentAchievements: recentAchievements.map((ra) => ({
        id: ra.achievement.id,
        title: ra.achievement.title,
        icon: ra.achievement.icon,
      })),
    });
  } catch (error) {
    console.error('Dashboard GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
