import { GoogleGenAI } from '@google/genai';
import { UserFitnessContext } from './user-context';

export interface AIResponse {
  text: string;
  cardType?: 'WORKOUT_CARD' | 'NUTRITION_CARD' | 'PROGRESS_CARD' | null;
  cardData?: any;
}

export async function generateGyminAIResponse(
  userQuery: string,
  context: UserFitnessContext
): Promise<AIResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  // If Gemini API Key is available, use official GoogleGenAI SDK
  if (apiKey && apiKey.trim() !== '') {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = `You are GYMIN AI, a personal fitness companion, trainer, and nutrition coach for ${context.userName}.
Tone: Friendly, motivating, supportive, knowledgeable, concise, encouraging.
Strict Grounding Rule: You must NEVER invent or hallucinate user-specific data. Only quote the exact statistics provided below. If a user asks about data that has not been logged yet, politely let them know they haven't logged it today.

CURRENT USER CONTEXT (REAL DATABASE STATS):
- Name: ${context.userName}
- Goal: ${context.goal} (${context.experience} level)
- Weight: ${context.weightKg} kg, Height: ${context.heightCm} cm
- Daily Calorie Target: ${context.calorieTarget} kcal
- Daily Protein Target: ${context.proteinTarget} g
- Today's Nutrition Consumed: ${context.todayCalories} kcal (${context.remainingCalories} kcal remaining)
- Today's Protein Consumed: ${context.todayProtein} g (${context.remainingProtein} g remaining)
- Today's Carbs Consumed: ${context.todayCarbs} g / ${context.carbsTarget} g
- Today's Fat Consumed: ${context.todayFat} g / ${context.fatTarget} g
- Foods logged today: ${context.todayFoodsLogged.length > 0 ? context.todayFoodsLogged.join(', ') : 'None yet'}
- Today's Scheduled Workout: ${context.todayWorkoutName} (${context.todayExercises.length} exercises: ${context.todayExercises.map((e) => e.name).join(', ')})
- Today's Steps: ${context.todaySteps} / ${context.stepTarget} steps
- Consistency Streak: ${context.streakDays} days
- Personal Records: ${context.personalRecords.map((pr) => `${pr.exercise}: ${pr.maxWeightKg}kg x ${pr.maxReps}`).join(', ')}

SAFETY GUIDELINES:
- Never diagnose medical conditions or prescribe medications or steroids.
- Do not promote extreme starvation or unsafe rapid weight loss.
- Recommend speaking to a healthcare professional for injuries or medical pain.

If the user asks about their workout today, mention the exercises and you may trigger the workout card.
If the user asks about nutrition, calories, or protein, provide exact numbers and remaining targets.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${userQuery}` }] },
        ],
      });

      const text = response.text || "I'm right here with you! Let me check your fitness stats.";

      // Detect if structured card should be attached
      let cardType: AIResponse['cardType'] = null;
      let cardData: any = null;

      const lowerQuery = userQuery.toLowerCase();
      if (lowerQuery.includes('workout') || lowerQuery.includes('train') || lowerQuery.includes('exercise')) {
        cardType = 'WORKOUT_CARD';
        cardData = {
          dayName: context.todayWorkoutName,
          exerciseCount: context.todayExercises.length,
          durationMin: 55,
          exercises: context.todayExercises,
        };
      } else if (lowerQuery.includes('food') || lowerQuery.includes('protein') || lowerQuery.includes('calorie') || lowerQuery.includes('eat') || lowerQuery.includes('dinner')) {
        cardType = 'NUTRITION_CARD';
        cardData = {
          calories: context.todayCalories,
          targetCalories: context.calorieTarget,
          protein: context.todayProtein,
          targetProtein: context.proteinTarget,
          remainingCalories: context.remainingCalories,
          remainingProtein: context.remainingProtein,
        };
      } else if (lowerQuery.includes('progress') || lowerQuery.includes('pr') || lowerQuery.includes('bench press') || lowerQuery.includes('streak')) {
        cardType = 'PROGRESS_CARD';
        cardData = {
          streak: context.streakDays,
          recentPRs: context.personalRecords,
          completedWorkouts: context.recentWorkoutsCompleted,
        };
      }

      return { text, cardType, cardData };
    } catch (apiError) {
      console.warn('Gemini API call failed, falling back to grounded analytical engine:', apiError);
    }
  }

  // Grounded Analytical Context Engine (Zero-config out of the box fallback)
  return generateGroundedAnalyticalResponse(userQuery, context);
}

/**
 * High-precision grounded analytical response engine that directly answers
 * user questions using the real database records and attaches relevant UI cards.
 */
function generateGroundedAnalyticalResponse(
  query: string,
  ctx: UserFitnessContext
): AIResponse {
  const q = query.toLowerCase().trim();

  // 1. "What is my workout today?" / Workout query
  if (q.includes('workout today') || q.includes("today's workout") || (q.includes('what') && q.includes('workout')) || q.includes('train today')) {
    const exerciseList = ctx.todayExercises.map((e) => `• **${e.name}** (${e.sets} sets × ${e.reps} reps)`).join('\n');
    return {
      text: `Today on your split you have **${ctx.todayWorkoutName}**! 💪\n\nHere is your lineup for today:\n${exerciseList}\n\nTake 60–90 seconds rest between compound movements and focus on controlled eccentric reps. Ready to crush it? Tap below to launch your live workout tracker!`,
      cardType: 'WORKOUT_CARD',
      cardData: {
        dayName: ctx.todayWorkoutName,
        exerciseCount: ctx.todayExercises.length,
        durationMin: 55,
        exercises: ctx.todayExercises,
      },
    };
  }

  // 2. "How much protein have I eaten today?" / Protein query
  if (q.includes('protein') && (q.includes('how much') || q.includes('eaten') || q.includes('logged') || q.includes('have i'))) {
    if (ctx.todayProtein === 0) {
      return {
        text: `You haven't logged any food today yet. Your target is **${ctx.proteinTarget}g** of protein. Start by logging your breakfast to stay on track!`,
        cardType: 'NUTRITION_CARD',
        cardData: {
          calories: ctx.todayCalories,
          targetCalories: ctx.calorieTarget,
          protein: ctx.todayProtein,
          targetProtein: ctx.proteinTarget,
          remainingCalories: ctx.remainingCalories,
          remainingProtein: ctx.remainingProtein,
        },
      };
    }

    const percentage = Math.round((ctx.todayProtein / ctx.proteinTarget) * 100);
    return {
      text: `You have consumed **${ctx.todayProtein}g** out of your **${ctx.proteinTarget}g** protein target today (${percentage}% achieved). You have **${ctx.remainingProtein}g** remaining.\n\nGreat job maintaining muscle recovery fuel!`,
      cardType: 'NUTRITION_CARD',
      cardData: {
        calories: ctx.todayCalories,
        targetCalories: ctx.calorieTarget,
        protein: ctx.todayProtein,
        targetProtein: ctx.proteinTarget,
        remainingCalories: ctx.remainingCalories,
        remainingProtein: ctx.remainingProtein,
      },
    };
  }

  // 3. "How many calories do I have left?" / Calorie query
  if (q.includes('calorie') || q.includes('calories left') || q.includes('how many calories')) {
    return {
      text: `Today you have consumed **${ctx.todayCalories} kcal** of your **${ctx.calorieTarget} kcal** daily goal.\n\nYou have **${ctx.remainingCalories} kcal** left for the day. ${
        ctx.remainingCalories > 400
          ? 'You have plenty of room for a wholesome dinner with complex carbs and lean protein!'
          : 'You are right on track with your calorie budget for the day!'
      }`,
      cardType: 'NUTRITION_CARD',
      cardData: {
        calories: ctx.todayCalories,
        targetCalories: ctx.calorieTarget,
        protein: ctx.todayProtein,
        targetProtein: ctx.proteinTarget,
        remainingCalories: ctx.remainingCalories,
        remainingProtein: ctx.remainingProtein,
      },
    };
  }

  // 4. "What should I eat for dinner?" / Meal suggestion query
  if (q.includes('dinner') || q.includes('what should i eat') || q.includes('meal idea') || q.includes('high-protein meal')) {
    return {
      text: `You have **${ctx.remainingCalories} kcal** and **${ctx.remainingProtein}g protein** left today! Here are two fantastic options:\n\n🍛 **Option 1 (Indian Classic):**\n• 150g Grilled Paneer or Chicken Breast\n• 1 Bowl Yellow Dal Tadka with 1 Whole Wheat Roti\n• Approx: **460 kcal, 38g Protein**\n\n🥗 **Option 2 (High-Protein Quick Fix):**\n• 200g Greek Yogurt or Curd with 1 Scoop Whey & Handful of Almonds\n• Approx: **350 kcal, 36g Protein**\n\nBoth fit nicely into your remaining macros!`,
      cardType: 'NUTRITION_CARD',
      cardData: {
        calories: ctx.todayCalories,
        targetCalories: ctx.calorieTarget,
        protein: ctx.todayProtein,
        targetProtein: ctx.proteinTarget,
        remainingCalories: ctx.remainingCalories,
        remainingProtein: ctx.remainingProtein,
      },
    };
  }

  // 5. "How am I progressing?" / Progress query
  if (q.includes('progress') || q.includes('how am i doing') || q.includes('pr') || q.includes('bench press')) {
    const prDetails = ctx.personalRecords.length > 0
      ? ctx.personalRecords.map((p) => `• **${p.exercise}**: ${p.maxWeightKg} kg (${p.maxReps} reps, Est 1RM: ${p.estimated1RM} kg)`).join('\n')
      : '• Benchmark records being established';

    return {
      text: `Here is your current progress summary, ${ctx.userName}:\n\n🔥 **Streak:** ${ctx.streakDays} consecutive active days!\n🏋️ **Completed Sessions:** ${ctx.recentWorkoutsCompleted} recent workouts logged\n🏆 **Current Personal Records:**\n${prDetails}\n\nYour volume progression is consistently trending upward! Tap below to explore your interactive progression charts.`,
      cardType: 'PROGRESS_CARD',
      cardData: {
        streak: ctx.streakDays,
        recentPRs: ctx.personalRecords,
        completedWorkouts: ctx.recentWorkoutsCompleted,
      },
    };
  }

  // 6. "I missed yesterday's workout. What should I do?"
  if (q.includes('missed') || q.includes('skipped')) {
    return {
      text: `No worries at all! Consistency is about the long-term trend, not a single day.\n\nHere is what I recommend:\n1. **Do not do two full workouts in one day.** That increases injury risk and fatigue.\n2. Simply pick up with **${ctx.todayWorkoutName}** today as scheduled.\n3. If you want to make up the volume, you can shift your rest day to the weekend.\n\nTake a breath and let's get after today's session! 💪`,
      cardType: 'WORKOUT_CARD',
      cardData: {
        dayName: ctx.todayWorkoutName,
        exerciseCount: ctx.todayExercises.length,
        durationMin: 55,
      },
    };
  }

  // 7. "I only have dumbbells today. Modify my workout."
  if (q.includes('dumbbells') || q.includes('dumbbell only') || q.includes('modify')) {
    return {
      text: `Got you covered! Here is an effective Dumbbell-Only substitution for today:\n\n1. **Dumbbell Floor or Bench Press** — 4 sets × 10 reps\n2. **Incline Dumbbell Flyes** — 3 sets × 12 reps\n3. **One-Arm Dumbbell Rows** — 4 sets × 10 reps\n4. **Overhead Dumbbell Tricep Extension** — 3 sets × 12 reps\n5. **Dumbbell Lateral Raises** — 4 sets × 15 reps\n\nFocus on a 3-second lowering tempo to maximize time under tension!`,
      cardType: 'WORKOUT_CARD',
      cardData: {
        dayName: 'Dumbbell Modified Session',
        exerciseCount: 5,
        durationMin: 45,
      },
    };
  }

  // 8. General fallback response adhering to persona
  return {
    text: `Hey ${ctx.userName}! As your GYMIN fitness companion, I'm here to support your **${ctx.goal.replace(/_/g, ' ').toLowerCase()}** journey.\n\nToday you have **${ctx.todayWorkoutName}** scheduled and you've logged **${ctx.todayCalories} / ${ctx.calorieTarget} kcal** (${ctx.todayProtein}g protein).\n\nAsk me anytime about:\n• "What is my workout today?"\n• "How much protein have I eaten today?"\n• "What should I eat for dinner?"\n• "Show me my progress"`,
  };
}
