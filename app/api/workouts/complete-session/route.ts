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
    const { planId, dayName, durationSec, sets, notes } = body;

    const completedSets = (sets || []).filter((s: any) => s.isCompleted);

    // Calculate total volume: Sets x Reps x Weight
    let totalVolumeKg = 0;
    for (const s of completedSets) {
      const weight = parseFloat(s.weightKg) || 0;
      const reps = parseInt(s.actualReps, 10) || 0;
      totalVolumeKg += weight * reps;
    }

    // Estimate calories burned based on workout duration (approx 7.5 kcal/min)
    const durationMinutes = Math.max(1, Math.round((durationSec || 0) / 60));
    const estimatedCaloriesBurned = Math.round(durationMinutes * 7.5);

    // Create WorkoutSession
    const workoutSession = await prisma.workoutSession.create({
      data: {
        userId: session.userId,
        planId: planId || null,
        dayName: dayName || 'Custom Workout',
        durationSec: durationSec || 0,
        totalVolumeKg: Math.round(totalVolumeKg),
        totalSets: completedSets.length,
        caloriesBurned: estimatedCaloriesBurned,
        notes: notes || null,
      },
    });

    const newPrs: Array<{ exerciseName: string; weightKg: number; reps: number }> = [];

    // Process each set and detect PRs
    for (const s of completedSets) {
      const weightKg = parseFloat(s.weightKg) || 0;
      const actualReps = parseInt(s.actualReps, 10) || 0;
      const targetReps = parseInt(s.targetReps, 10) || 10;
      let isPr = false;

      if (weightKg > 0 && actualReps > 0) {
        const estimated1RM = Math.round(weightKg * (1 + actualReps / 30));

        const existingPr = await prisma.personalRecord.findUnique({
          where: {
            userId_exerciseId: {
              userId: session.userId,
              exerciseId: s.exerciseId,
            },
          },
        });

        if (!existingPr || weightKg > existingPr.maxWeightKg || estimated1RM > existingPr.estimated1RM) {
          isPr = true;
          await prisma.personalRecord.upsert({
            where: {
              userId_exerciseId: {
                userId: session.userId,
                exerciseId: s.exerciseId,
              },
            },
            update: {
              maxWeightKg: Math.max(existingPr?.maxWeightKg || 0, weightKg),
              maxReps: actualReps,
              estimated1RM,
              achievedAt: new Date(),
            },
            create: {
              userId: session.userId,
              exerciseId: s.exerciseId,
              maxWeightKg: weightKg,
              maxReps: actualReps,
              estimated1RM,
            },
          });

          // Fetch exercise name for PR announcement
          const ex = await prisma.exercise.findUnique({ where: { id: s.exerciseId } });
          newPrs.push({
            exerciseName: ex?.name || 'Exercise',
            weightKg,
            reps: actualReps,
          });
        }
      }

      await prisma.workoutSet.create({
        data: {
          sessionId: workoutSession.id,
          exerciseId: s.exerciseId,
          setNumber: s.setNumber || 1,
          targetReps,
          actualReps,
          weightKg,
          isCompleted: true,
          isPr,
        },
      });
    }

    // Check & Unlock Achievements
    const totalSessions = await prisma.workoutSession.count({ where: { userId: session.userId } });

    // First Workout achievement
    if (totalSessions >= 1) {
      const ach = await prisma.achievement.findUnique({ where: { code: 'FIRST_WORKOUT' } });
      if (ach) {
        await prisma.userAchievement.upsert({
          where: { userId_achievementId: { userId: session.userId, achievementId: ach.id } },
          update: {},
          create: { userId: session.userId, achievementId: ach.id },
        });
      }
    }

    // 10 Workouts achievement
    if (totalSessions >= 10) {
      const ach = await prisma.achievement.findUnique({ where: { code: 'WORKOUTS_10' } });
      if (ach) {
        await prisma.userAchievement.upsert({
          where: { userId_achievementId: { userId: session.userId, achievementId: ach.id } },
          update: {},
          create: { userId: session.userId, achievementId: ach.id },
        });
      }
    }

    // First PR achievement
    if (newPrs.length > 0) {
      const ach = await prisma.achievement.findUnique({ where: { code: 'FIRST_PR' } });
      if (ach) {
        await prisma.userAchievement.upsert({
          where: { userId_achievementId: { userId: session.userId, achievementId: ach.id } },
          update: {},
          create: { userId: session.userId, achievementId: ach.id },
        });
      }
    }

    return NextResponse.json({
      success: true,
      sessionId: workoutSession.id,
      summary: {
        durationSec,
        durationMinutes,
        totalVolumeKg: Math.round(totalVolumeKg),
        totalSets: completedSets.length,
        caloriesBurned: estimatedCaloriesBurned,
        newPrs,
      },
    });
  } catch (error) {
    console.error('Failed to complete workout session:', error);
    return NextResponse.json({ error: 'Failed to record workout session' }, { status: 500 });
  }
}
