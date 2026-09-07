import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { calculateMifflinStJeorTargets } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      goal,
      experience,
      daysPerWeek,
      duration,
      location,
      equipment,
      heightCm,
      weightKg,
      targetWeightKg,
      activityLevel,
      age,
      gender,
    } = body;

    const parsedHeight = parseFloat(heightCm) || 175;
    const parsedWeight = parseFloat(weightKg) || 75;
    const parsedTargetWeight = targetWeightKg ? parseFloat(targetWeightKg) : parsedWeight;
    const parsedDays = parseInt(daysPerWeek, 10) || 4;
    const parsedDuration = parseInt(duration, 10) || 45;
    const parsedAge = age ? parseInt(age, 10) : 25;
    const resolvedGender = gender || 'MALE';

    // Calculate personalized nutrition targets via Mifflin-St Jeor formula
    const macroTargets = calculateMifflinStJeorTargets({
      age: parsedAge,
      gender: resolvedGender as any,
      heightCm: parsedHeight,
      weightKg: parsedWeight,
      activityLevel: (activityLevel || 'MODERATE') as any,
      goal: (goal || 'BUILD_MUSCLE') as any,
    });

    // Create or update UserProfile
    const profile = await prisma.userProfile.upsert({
      where: { userId: session.userId },
      update: {
        age: parsedAge,
        gender: resolvedGender,
        heightCm: parsedHeight,
        weightKg: parsedWeight,
        targetWeightKg: parsedTargetWeight,
        mainGoal: goal,
        experienceLevel: experience,
        workoutDaysPerWeek: parsedDays,
        workoutDurationMinutes: parsedDuration,
        workoutLocation: location,
        equipmentList: JSON.stringify(equipment || []),
        activityLevel: activityLevel || 'MODERATE',
        calorieTarget: macroTargets.calories,
        proteinTarget: macroTargets.protein,
        carbsTarget: macroTargets.carbs,
        fatTarget: macroTargets.fat,
      },
      create: {
        userId: session.userId,
        age: parsedAge,
        gender: resolvedGender,
        heightCm: parsedHeight,
        weightKg: parsedWeight,
        targetWeightKg: parsedTargetWeight,
        mainGoal: goal,
        experienceLevel: experience,
        workoutDaysPerWeek: parsedDays,
        workoutDurationMinutes: parsedDuration,
        workoutLocation: location,
        equipmentList: JSON.stringify(equipment || []),
        activityLevel: activityLevel || 'MODERATE',
        calorieTarget: macroTargets.calories,
        proteinTarget: macroTargets.protein,
        carbsTarget: macroTargets.carbs,
        fatTarget: macroTargets.fat,
      },
    });

    // Create initial weight entry
    const todayStr = new Date().toISOString().split('T')[0];
    await prisma.weightLog.upsert({
      where: {
        userId_date: {
          userId: session.userId,
          date: todayStr,
        },
      },
      update: { weightKg: parsedWeight },
      create: {
        userId: session.userId,
        date: todayStr,
        weightKg: parsedWeight,
        notes: 'Starting weight from onboarding',
      },
    });

    // Create or assign personalized workout split
    // Check if user already has an active plan
    const existingPlan = await prisma.workoutPlan.findFirst({
      where: { userId: session.userId, isActive: true },
    });

    if (!existingPlan) {
      // Find key exercises to build the split
      const exercises = await prisma.exercise.findMany({ take: 100 });
      const exMap = new Map(exercises.map((e) => [e.slug, e.id]));

      let splitName = 'Personalized 4-Day Upper/Lower Split';
      let splitType = '4_DAY_UPPER_LOWER';
      let daysConfig = [
        {
          name: 'Upper Body A',
          dayOfWeek: 1,
          exercises: [
            { slug: 'barbell-bench-press', sets: 4, reps: '8-10' },
            { slug: 'incline-dumbbell-press', sets: 4, reps: '10-12' },
            { slug: 'barbell-bent-over-row', sets: 4, reps: '8-10' },
            { slug: 'lat-pulldown', sets: 4, reps: '10-12' },
            { slug: 'overhead-barbell-press', sets: 3, reps: '8-10' },
            { slug: 'cable-tricep-pushdown', sets: 3, reps: '12-15' },
          ],
        },
        {
          name: 'Lower Body A',
          dayOfWeek: 2,
          exercises: [
            { slug: 'barbell-back-squat', sets: 4, reps: '8-10' },
            { slug: 'leg-press', sets: 4, reps: '10-12' },
            { slug: 'romanian-deadlift', sets: 3, reps: '10-12' },
            { slug: 'leg-extension', sets: 3, reps: '12-15' },
            { slug: 'lying-leg-curl', sets: 3, reps: '12-15' },
            { slug: 'standing-calf-raise', sets: 4, reps: '15' },
          ],
        },
        {
          name: 'Upper Body B',
          dayOfWeek: 4,
          exercises: [
            { slug: 'incline-dumbbell-press', sets: 4, reps: '10-12' },
            { slug: 'pull-ups', sets: 3, reps: '8-10' },
            { slug: 'seated-cable-row', sets: 4, reps: '10-12' },
            { slug: 'dumbbell-lateral-raise', sets: 4, reps: '12-15' },
            { slug: 'barbell-bicep-curl', sets: 3, reps: '10-12' },
            { slug: 'skull-crushers', sets: 3, reps: '10-12' },
          ],
        },
        {
          name: 'Lower Body B',
          dayOfWeek: 5,
          exercises: [
            { slug: 'conventional-deadlift', sets: 3, reps: '6-8' },
            { slug: 'bulgarian-split-squat', sets: 3, reps: '10-12' },
            { slug: 'barbell-hip-thrust', sets: 3, reps: '10-12' },
            { slug: 'lying-leg-curl', sets: 3, reps: '12-15' },
            { slug: 'standing-calf-raise', sets: 4, reps: '15' },
            { slug: 'plank', sets: 3, reps: '60' },
          ],
        },
      ];

      if (parsedDays === 3) {
        splitName = 'Personalized 3-Day Full Body Split';
        splitType = '3_DAY_FULL_BODY';
        daysConfig = [
          {
            name: 'Full Body A',
            dayOfWeek: 1,
            exercises: [
              { slug: 'barbell-back-squat', sets: 3, reps: '8-10' },
              { slug: 'barbell-bench-press', sets: 3, reps: '8-10' },
              { slug: 'barbell-bent-over-row', sets: 3, reps: '8-10' },
              { slug: 'overhead-barbell-press', sets: 3, reps: '8-10' },
              { slug: 'cable-tricep-pushdown', sets: 3, reps: '12-15' },
              { slug: 'standing-calf-raise', sets: 3, reps: '15' },
            ],
          },
          {
            name: 'Full Body B',
            dayOfWeek: 3,
            exercises: [
              { slug: 'conventional-deadlift', sets: 3, reps: '6-8' },
              { slug: 'incline-dumbbell-press', sets: 3, reps: '10-12' },
              { slug: 'lat-pulldown', sets: 3, reps: '10-12' },
              { slug: 'dumbbell-lateral-raise', sets: 3, reps: '12-15' },
              { slug: 'barbell-bicep-curl', sets: 3, reps: '10-12' },
              { slug: 'hanging-leg-raises', sets: 3, reps: '12-15' },
            ],
          },
          {
            name: 'Full Body C',
            dayOfWeek: 5,
            exercises: [
              { slug: 'leg-press', sets: 3, reps: '10-12' },
              { slug: 'chest-dips', sets: 3, reps: '10-12' },
              { slug: 'pull-ups', sets: 3, reps: '8-10' },
              { slug: 'seated-dumbbell-shoulder-press', sets: 3, reps: '10-12' },
              { slug: 'hammer-curls', sets: 3, reps: '10-12' },
              { slug: 'plank', sets: 3, reps: '60' },
            ],
          },
        ];
      } else if (parsedDays >= 5) {
        splitName = parsedDays === 6 ? 'Personalized 6-Day Push/Pull/Legs' : 'Personalized 5-Day Hypertrophy Split';
        splitType = parsedDays === 6 ? '6_DAY_PPL' : '5_DAY_SPLIT';
        daysConfig = [
          {
            name: 'Chest & Triceps',
            dayOfWeek: 1,
            exercises: [
              { slug: 'barbell-bench-press', sets: 4, reps: '8-10' },
              { slug: 'incline-dumbbell-press', sets: 4, reps: '10-12' },
              { slug: 'cable-chest-flyes', sets: 3, reps: '12-15' },
              { slug: 'chest-dips', sets: 3, reps: '10-12' },
              { slug: 'cable-tricep-pushdown', sets: 4, reps: '12-15' },
              { slug: 'skull-crushers', sets: 3, reps: '10-12' },
            ],
          },
          {
            name: 'Back & Biceps',
            dayOfWeek: 2,
            exercises: [
              { slug: 'conventional-deadlift', sets: 4, reps: '6-8' },
              { slug: 'lat-pulldown', sets: 4, reps: '10-12' },
              { slug: 'barbell-bent-over-row', sets: 4, reps: '8-10' },
              { slug: 'seated-cable-row', sets: 3, reps: '10-12' },
              { slug: 'barbell-bicep-curl', sets: 4, reps: '10-12' },
              { slug: 'hammer-curls', sets: 3, reps: '12-15' },
            ],
          },
          {
            name: 'Legs & Calves',
            dayOfWeek: 3,
            exercises: [
              { slug: 'barbell-back-squat', sets: 4, reps: '8-10' },
              { slug: 'leg-press', sets: 4, reps: '10-12' },
              { slug: 'romanian-deadlift', sets: 3, reps: '10-12' },
              { slug: 'leg-extension', sets: 3, reps: '12-15' },
              { slug: 'lying-leg-curl', sets: 3, reps: '12-15' },
              { slug: 'standing-calf-raise', sets: 4, reps: '15' },
            ],
          },
          {
            name: 'Shoulders & Traps',
            dayOfWeek: 4,
            exercises: [
              { slug: 'overhead-barbell-press', sets: 4, reps: '8-10' },
              { slug: 'dumbbell-lateral-raise', sets: 4, reps: '12-15' },
              { slug: 'seated-dumbbell-shoulder-press', sets: 3, reps: '10-12' },
              { slug: 'reverse-pec-deck-fly', sets: 3, reps: '12-15' },
              { slug: 'barbell-shrugs', sets: 4, reps: '12-15' },
              { slug: 'hanging-leg-raises', sets: 3, reps: '15' },
            ],
          },
          {
            name: 'Arms & Core Focus',
            dayOfWeek: 5,
            exercises: [
              { slug: 'preacher-curl', sets: 3, reps: '10-12' },
              { slug: 'incline-dumbbell-curl', sets: 3, reps: '10-12' },
              { slug: 'overhead-dumbbell-tricep-extension', sets: 3, reps: '12-15' },
              { slug: 'diamond-push-ups', sets: 3, reps: '12-15' },
              { slug: 'ab-wheel-rollout', sets: 3, reps: '10-12' },
              { slug: 'plank', sets: 3, reps: '60' },
            ],
          },
        ];

        if (parsedDays === 6) {
          daysConfig.push({
            name: 'Full Lower & Posterior Chain',
            dayOfWeek: 6,
            exercises: [
              { slug: 'barbell-back-squat', sets: 4, reps: '8-10' },
              { slug: 'romanian-deadlift', sets: 4, reps: '8-10' },
              { slug: 'bulgarian-split-squat', sets: 3, reps: '10-12' },
              { slug: 'lying-leg-curl', sets: 3, reps: '12-15' },
              { slug: 'standing-calf-raise', sets: 4, reps: '15' },
              { slug: 'hanging-leg-raises', sets: 3, reps: '15' },
            ],
          });
        }
      }

      await prisma.workoutPlan.create({
        data: {
          userId: session.userId,
          name: splitName,
          description: `Customized for your goal (${goal}) and ${parsedDays} days/week commitment.`,
          splitType,
          isCustom: true,
          isActive: true,
          days: {
            create: daysConfig.map((d, dayIdx) => ({
              name: d.name,
              dayOfWeek: d.dayOfWeek,
              order: dayIdx + 1,
              exercises: {
                create: d.exercises
                  .map((ex, exIdx) => {
                    const exerciseId = exMap.get(ex.slug) || exercises[exIdx % exercises.length]?.id;
                    if (!exerciseId) return null;
                    return {
                      exerciseId,
                      targetSets: ex.sets,
                      targetReps: ex.reps,
                      targetRestSec: 60,
                      order: exIdx + 1,
                    };
                  })
                  .filter(Boolean) as any,
              },
            })),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      profile,
      redirectUrl: '/dashboard',
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding. Please try again.' },
      { status: 500 }
    );
  }
}
