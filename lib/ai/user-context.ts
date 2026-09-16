import prisma from '@/lib/prisma';
import { calculateUserStreak } from '@/lib/auth';

export interface UserFitnessContext {
  userName: string;
  goal: string;
  experience: string;
  weightKg: number;
  heightCm: number;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  
  // Today's Stats
  todayDate: string;
  todayCalories: number;
  todayProtein: number;
  todayCarbs: number;
  todayFat: number;
  remainingCalories: number;
  remainingProtein: number;
  todayFoodsLogged: string[];
  
  // Workout Split & Today's Workout
  activePlanName: string | null;
  todayWorkoutName: string | null;
  todayExercises: Array<{ name: string; sets: number; reps: string; muscle: string }>;
  recentWorkoutsCompleted: number;
  
  // Steps & Consistency
  todaySteps: number;
  stepTarget: number;
  streakDays: number;
  
  // Personal Records
  personalRecords: Array<{ exercise: string; maxWeightKg: number; maxReps: number; estimated1RM: number }>;
}

export async function getUserFitnessContext(userId: string): Promise<UserFitnessContext> {
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Fetch User & Profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  const profile = user?.profile;

  // 2. Fetch Today's Nutrition Logs
  const nutritionLogs = await prisma.nutritionLog.findMany({
    where: { userId, date: todayStr },
  });

  const todayCalories = Math.round(nutritionLogs.reduce((sum, item) => sum + item.calories, 0));
  const todayProtein = Math.round(nutritionLogs.reduce((sum, item) => sum + item.protein, 0));
  const todayCarbs = Math.round(nutritionLogs.reduce((sum, item) => sum + item.carbs, 0));
  const todayFat = Math.round(nutritionLogs.reduce((sum, item) => sum + item.fat, 0));
  const todayFoodsLogged = nutritionLogs.map((item) => `${item.foodName} (${Math.round(item.calories)} kcal, ${Math.round(item.protein)}g P)`);

  const calorieTarget = profile?.calorieTarget || 2200;
  const proteinTarget = profile?.proteinTarget || 140;
  const remainingCalories = Math.max(0, calorieTarget - todayCalories);
  const remainingProtein = Math.max(0, proteinTarget - todayProtein);

  // 3. Fetch Active Workout Plan & Today's Schedule
  const activePlan = await prisma.workoutPlan.findFirst({
    where: { userId, isActive: true },
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

  // Determine today's day of week (1=Monday ... 7=Sunday)
  const dayOfWeek = new Date().getDay() === 0 ? 7 : new Date().getDay();
  const todayDay = activePlan?.days.find((d) => d.dayOfWeek === dayOfWeek) || activePlan?.days[0];

  const todayWorkoutName = todayDay?.name || 'Chest & Triceps';
  const todayExercises =
    todayDay?.exercises.map((e) => ({
      name: e.exercise.name,
      sets: e.targetSets,
      reps: e.targetReps,
      muscle: e.exercise.primaryMuscle,
    })) || [];

  // 4. Fetch Completed Sessions (last 14 days)
  const recentSessions = await prisma.workoutSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // 5. Fetch Today's Steps
  const stepLog = await prisma.stepLog.findUnique({
    where: { userId_date: { userId, date: todayStr } },
  });

  // 6. Fetch PRs
  const prs = await prisma.personalRecord.findMany({
    where: { userId },
    include: { exercise: true },
  });

  const personalRecords = prs.map((pr) => ({
    exercise: pr.exercise.name,
    maxWeightKg: pr.maxWeightKg,
    maxReps: pr.maxReps,
    estimated1RM: pr.estimated1RM,
  }));

  return {
    userName: user?.name || 'Athlete',
    goal: profile?.mainGoal || 'BUILD_MUSCLE',
    experience: profile?.experienceLevel || 'INTERMEDIATE',
    weightKg: profile?.weightKg || 75,
    heightCm: profile?.heightCm || 175,
    calorieTarget,
    proteinTarget,
    carbsTarget: profile?.carbsTarget || 250,
    fatTarget: profile?.fatTarget || 70,

    todayDate: todayStr,
    todayCalories,
    todayProtein,
    todayCarbs,
    todayFat,
    remainingCalories,
    remainingProtein,
    todayFoodsLogged,

    activePlanName: activePlan?.name || '5-Day Hypertrophy Split',
    todayWorkoutName,
    todayExercises,
    recentWorkoutsCompleted: recentSessions.length,

    todaySteps: stepLog?.steps ?? 0,
    stepTarget: profile?.stepTarget || 10000,
    streakDays: await calculateUserStreak(userId),

    personalRecords,
  };
}
