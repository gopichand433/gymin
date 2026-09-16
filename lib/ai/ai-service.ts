import { GoogleGenAI } from '@google/genai';
import { UserFitnessContext } from './user-context';

export interface AIResponse {
  text: string;
  cardType?: 'WORKOUT_CARD' | 'NUTRITION_CARD' | 'PROGRESS_CARD' | null;
  cardData?: any;
  provider?: 'gemini' | 'openai' | 'analytical';
}

function buildSystemPrompt(context: UserFitnessContext): string {
  return `You are GYMIN AI, a world-class personal fitness coach and nutrition consultant dedicated to helping ${context.userName}.
Tone: Energetic, motivating, supportive, scientifically grounded, concise, and direct.
Strict Grounding Rule: You must NEVER hallucinate or invent personal metrics. Use only the exact statistics provided below. If a user asks about unrecorded metrics, politely advise them that it hasn't been logged yet today.

CURRENT ATHLETE CONTEXT (FROM REAL DATABASE RECORDS):
- Athlete Name: ${context.userName}
- Primary Fitness Goal: ${context.goal.replace(/_/g, ' ')} (${context.experience} level)
- Biometrics: Weight ${context.weightKg} kg, Height ${context.heightCm} cm
- Daily Calorie Target: ${context.calorieTarget} kcal
- Daily Protein Target: ${context.proteinTarget} g
- Today's Nutrition Consumed: ${context.todayCalories} kcal (${context.remainingCalories} kcal remaining)
- Today's Protein Consumed: ${context.todayProtein} g (${context.remainingProtein} g remaining)
- Today's Carbs Consumed: ${context.todayCarbs} g / ${context.carbsTarget} g
- Today's Fat Consumed: ${context.todayFat} g / ${context.fatTarget} g
- Foods Logged Today: ${context.todayFoodsLogged.length > 0 ? context.todayFoodsLogged.join(', ') : 'None yet today'}
- Today's Scheduled Workout: ${context.todayWorkoutName} (${context.todayExercises.length} exercises: ${context.todayExercises.map((e) => e.name).join(', ')})
- Steps Tracked Today: ${context.todaySteps} / ${context.stepTarget} steps
- Unbroken Habit Streak: ${context.streakDays} days
- Personal Records: ${context.personalRecords.length > 0 ? context.personalRecords.map((pr) => `${pr.exercise}: ${pr.maxWeightKg}kg x ${pr.maxReps}`).join(', ') : 'Benchmark records established'}

SAFETY GUIDELINES:
- Never diagnose medical injuries, prescribe medications, or endorse anabolic substances.
- Emphasize progressive overload, proper form, controlled eccentrics, and adequate protein.
- Recommend consulting a physician for joint or acute medical pain.`;
}

function detectCard(userQuery: string, context: UserFitnessContext): { cardType: AIResponse['cardType']; cardData: any } {
  const q = userQuery.toLowerCase();
  if (q.includes('workout') || q.includes('train') || q.includes('exercise') || q.includes('split') || q.includes('gym')) {
    return {
      cardType: 'WORKOUT_CARD',
      cardData: {
        dayName: context.todayWorkoutName,
        exerciseCount: context.todayExercises.length,
        durationMin: 55,
        exercises: context.todayExercises,
      },
    };
  }
  if (q.includes('food') || q.includes('protein') || q.includes('calorie') || q.includes('eat') || q.includes('dinner') || q.includes('lunch') || q.includes('macro') || q.includes('meal')) {
    return {
      cardType: 'NUTRITION_CARD',
      cardData: {
        calories: context.todayCalories,
        targetCalories: context.calorieTarget,
        protein: context.todayProtein,
        targetProtein: context.proteinTarget,
        remainingCalories: context.remainingCalories,
        remainingProtein: context.remainingProtein,
      },
    };
  }
  if (q.includes('progress') || q.includes('pr') || q.includes('bench press') || q.includes('streak') || q.includes('record') || q.includes('gains')) {
    return {
      cardType: 'PROGRESS_CARD',
      cardData: {
        streak: context.streakDays,
        recentPRs: context.personalRecords,
        completedWorkouts: context.recentWorkoutsCompleted,
      },
    };
  }
  return { cardType: null, cardData: null };
}

async function callGemini(apiKey: string, query: string, context: UserFitnessContext): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
  const systemPrompt = buildSystemPrompt(context);
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: query,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      if (response.text && response.text.trim()) {
        return response.text.trim();
      }
    } catch {
      continue;
    }
  }

  throw new Error('All Gemini model candidates failed');
}

async function callChatGPT(apiKey: string, query: string, context: UserFitnessContext): Promise<string> {
  const systemPrompt = buildSystemPrompt(context);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      temperature: 0.7,
      max_tokens: 650,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`OpenAI HTTP ${res.status}: ${errorBody}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('No content returned by OpenAI');
  }

  return text.trim();
}

export async function generateGyminAIResponse(
  userQuery: string,
  context: UserFitnessContext
): Promise<AIResponse> {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openAIKey = process.env.OPENAI_API_KEY?.trim();
  const preferredProvider = process.env.AI_PROVIDER?.toLowerCase().trim();

  // 1. If user explicitly requests OpenAI or only OpenAI key is present
  if (preferredProvider === 'openai' || (!geminiKey && openAIKey)) {
    if (openAIKey) {
      try {
        const text = await callChatGPT(openAIKey, userQuery, context);
        const { cardType, cardData } = detectCard(userQuery, context);
        return { text, cardType, cardData, provider: 'openai' };
      } catch (err) {
        console.warn('ChatGPT API call failed, attempting fallback:', err);
      }
    }
  }

  // 2. Try Google Gemini
  if (geminiKey) {
    try {
      const text = await callGemini(geminiKey, userQuery, context);
      const { cardType, cardData } = detectCard(userQuery, context);
      return { text, cardType, cardData, provider: 'gemini' };
    } catch (err) {
      console.warn('Gemini API call failed, attempting fallback:', err);
    }
  }

  // 3. Fallback to OpenAI if Gemini failed and OpenAI key exists
  if (openAIKey) {
    try {
      const text = await callChatGPT(openAIKey, userQuery, context);
      const { cardType, cardData } = detectCard(userQuery, context);
      return { text, cardType, cardData, provider: 'openai' };
    } catch (err) {
      console.warn('OpenAI fallback also failed:', err);
    }
  }

  // 4. Zero-config Grounded Analytical Engine Fallback
  const analytical = generateGroundedAnalyticalResponse(userQuery, context);
  return { ...analytical, provider: 'analytical' };
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
