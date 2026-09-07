import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const todayStr = dateParam || new Date().toISOString().split('T')[0];

    // Fetch user profile for targets
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.userId },
    });

    const calorieTarget = profile?.calorieTarget || 2200;
    const proteinTarget = profile?.proteinTarget || 140;
    const carbsTarget = profile?.carbsTarget || 250;
    const fatTarget = profile?.fatTarget || 70;
    const waterTargetMl = profile?.waterTargetMl || 3000;

    // Fetch all logs for this date
    const logs = await prisma.nutritionLog.findMany({
      where: {
        userId: session.userId,
        date: todayStr,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by meal
    const meals = {
      BREAKFAST: logs.filter((l) => l.mealType === 'BREAKFAST'),
      LUNCH: logs.filter((l) => l.mealType === 'LUNCH'),
      DINNER: logs.filter((l) => l.mealType === 'DINNER'),
      SNACK: logs.filter((l) => l.mealType === 'SNACK'),
    };

    const totalCalories = Math.round(logs.reduce((acc, l) => acc + l.calories, 0));
    const totalProtein = Math.round(logs.reduce((acc, l) => acc + l.protein, 0));
    const totalCarbs = Math.round(logs.reduce((acc, l) => acc + l.carbs, 0));
    const totalFat = Math.round(logs.reduce((acc, l) => acc + l.fat, 0));

    return NextResponse.json({
      date: todayStr,
      targets: {
        calories: calorieTarget,
        protein: proteinTarget,
        carbs: carbsTarget,
        fat: fatTarget,
        waterTargetMl,
      },
      consumed: {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
      },
      remaining: {
        calories: Math.max(0, calorieTarget - totalCalories),
        protein: Math.max(0, proteinTarget - totalProtein),
        carbs: Math.max(0, carbsTarget - totalCarbs),
        fat: Math.max(0, fatTarget - totalFat),
      },
      meals,
      allLogs: logs,
    });
  } catch (error) {
    console.error('Nutrition today error:', error);
    return NextResponse.json({ error: 'Failed to fetch nutrition data' }, { status: 500 });
  }
}
