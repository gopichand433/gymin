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

function sanitizeApiKey(key?: string): string | undefined {
  if (!key) return undefined;
  let cleaned = key.trim();
  cleaned = cleaned.replace(/^["']|["']$/g, '').trim();
  cleaned = cleaned.replace(/^(GEMINI_API_KEY|OPENAI_API_KEY|API_KEY)[:=]\s*/i, '').trim();
  return cleaned || undefined;
}

async function callGemini(
  apiKey: string,
  query: string,
  context: UserFitnessContext
): Promise<{ text: string }> {
  const cleanKey = sanitizeApiKey(apiKey);
  if (!cleanKey) {
    throw new Error('API_KEY_INVALID: API key is empty');
  }

  const ai = new GoogleGenAI({ apiKey: cleanKey });
  const systemPrompt = buildSystemPrompt(context);
  // gemini-2.0-flash is universally available and has full Google Search tool support
  const models = ['gemini-2.0-flash', 'gemini-2.5-flash'];

  let lastError: any = null;

  for (const model of models) {
    // Attempt 1: With Google Search Grounding for live online browsing
    try {
      const response = await ai.models.generateContent({
        model,
        contents: query,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
          tools: [{ googleSearch: {} }],
        },
      });

      let text = response.text?.trim();
      if (text) {
        // Extract real-time web sources from grounding metadata safely
        const metadata = response.candidates?.[0]?.groundingMetadata;
        if (metadata?.groundingChunks && metadata.groundingChunks.length > 0) {
          const links: string[] = [];
          for (const chunk of metadata.groundingChunks) {
            if (chunk.web?.uri) {
              let domain = chunk.web.uri;
              try {
                domain = new URL(chunk.web.uri).hostname;
              } catch {
                // Keep raw uri if URL parsing fails
              }
              const title = chunk.web.title || domain;
              links.push(`• [${title}](${chunk.web.uri})`);
            }
          }
          if (links.length > 0) {
            const uniqueLinks = Array.from(new Set(links)).slice(0, 4);
            text += '\n\n---\n🌐 **Live Online Web Sources Verified:**\n' + uniqueLinks.join('\n');
          }
        }
        return { text };
      }
    } catch (searchError: any) {
      lastError = searchError;
      const msg = searchError?.message || '';
      // If the API key is completely invalid, don't waste time retrying
      if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
        throw new Error('API_KEY_INVALID: The provided Gemini API key is invalid or unauthorized.');
      }
      console.warn(`Gemini search grounding on ${model} failed, attempting standard generation:`, msg);
    }

    // Attempt 2: Standard generation without search grounding fallback
    try {
      const response = await ai.models.generateContent({
        model,
        contents: query,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      if (response.text?.trim()) {
        return { text: response.text.trim() };
      }
    } catch (genError: any) {
      lastError = genError;
      const msg = genError?.message || '';
      if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
        throw new Error('API_KEY_INVALID: The provided Gemini API key is invalid or unauthorized.');
      }
      console.warn(`Gemini generation on ${model} failed:`, msg);
      continue;
    }
  }

  throw lastError || new Error('All Gemini model candidates failed');
}

async function callChatGPT(apiKey: string, query: string, context: UserFitnessContext): Promise<string> {
  const cleanKey = sanitizeApiKey(apiKey);
  if (!cleanKey) {
    throw new Error('OpenAI API key is empty');
  }

  const systemPrompt = buildSystemPrompt(context);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cleanKey}`,
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
  context: UserFitnessContext,
  customApiKey?: string
): Promise<AIResponse> {
  const cleanCustomKey = sanitizeApiKey(customApiKey);
  const isCustomOpenAI = cleanCustomKey ? cleanCustomKey.startsWith('sk-') : false;
  const geminiKey = (!isCustomOpenAI && cleanCustomKey ? cleanCustomKey : sanitizeApiKey(process.env.GEMINI_API_KEY))?.trim();
  const openAIKey = (isCustomOpenAI && cleanCustomKey ? cleanCustomKey : sanitizeApiKey(process.env.OPENAI_API_KEY))?.trim();
  const preferredProvider = process.env.AI_PROVIDER?.toLowerCase().trim();

  let noticePrefix: string | null = null;

  // 1. If user explicitly requests OpenAI or only OpenAI key is present
  if (preferredProvider === 'openai' || (!geminiKey && openAIKey)) {
    if (openAIKey) {
      try {
        const text = await callChatGPT(openAIKey, userQuery, context);
        const { cardType, cardData } = detectCard(userQuery, context);
        return { text, cardType, cardData, provider: 'openai' };
      } catch (err: any) {
        console.warn('ChatGPT API call failed, attempting fallback:', err);
        noticePrefix = `> ⚠️ **OpenAI Key Issue:** ${err?.message || 'API call failed'}. Answering via built-in Sports Science Coach:\n\n`;
      }
    }
  }

  // 2. Try Google Gemini with Live Online Web Browsing
  if (geminiKey) {
    try {
      const result = await callGemini(geminiKey, userQuery, context);
      const { cardType, cardData } = detectCard(userQuery, context);
      return { text: result.text, cardType, cardData, provider: 'gemini' };
    } catch (err: any) {
      console.warn('Gemini API call failed, attempting fallback:', err);
      const errMsg = err?.message || '';
      if (errMsg.includes('API_KEY_INVALID')) {
        noticePrefix = `> ⚠️ **Gemini Key Notice:** The API key entered is invalid or expired. You can get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey). Answering via built-in Sports Science Coach:\n\n`;
      } else if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('429')) {
        noticePrefix = `> ⚠️ **Gemini Rate Limit:** Your API quota was exceeded. Answering via built-in Sports Science Coach:\n\n`;
      } else {
        noticePrefix = `> ⚠️ **Live Search Notice:** Temporary connection issue with live search. Answering via built-in Sports Science Coach:\n\n`;
      }
    }
  }

  // 3. Fallback to OpenAI if Gemini failed and OpenAI key exists
  if (openAIKey && !noticePrefix?.includes('OpenAI')) {
    try {
      const text = await callChatGPT(openAIKey, userQuery, context);
      const { cardType, cardData } = detectCard(userQuery, context);
      return { text, cardType, cardData, provider: 'openai' };
    } catch (err) {
      console.warn('Fallback ChatGPT API call failed:', err);
    }
  }

  // 4. Zero-config Grounded Analytical Knowledge Engine
  const analytical = generateGroundedAnalyticalResponse(userQuery, context);
  return {
    ...analytical,
    text: (noticePrefix || '') + analytical.text,
    provider: 'analytical',
  };
}

/**
 * High-precision grounded analytical response engine that directly answers
 * user questions using the real database records and an extensive sports science knowledge base.
 */
function generateGroundedAnalyticalResponse(
  query: string,
  ctx: UserFitnessContext
): AIResponse {
  const q = query.toLowerCase().trim();

  // 1. "What is my workout today?" / Workout query
  if (q.includes('workout today') || q.includes("today's workout") || (q.includes('what') && q.includes('workout')) || q.includes('train today') || q.includes('what to do')) {
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
  if (q.includes('protein') && (q.includes('how much') || q.includes('eaten') || q.includes('logged') || q.includes('have i') || q.includes('consumed'))) {
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

  // 6. Creatine questions
  if (q.includes('creatine')) {
    return {
      text: `**Everything you need to know about Creatine Monohydrate:**\n\n1. **How it works:** Creatine saturates phosphocreatine stores in muscle cells, regenerating ATP (adenosine triphosphate) rapidly during explosive lifts (squats, bench press, sprints).\n2. **Dosage:** 3–5 grams per day taken consistently. A "loading phase" (20g/day for 5 days) is optional; taking 5g daily reaches full saturation within 3–4 weeks without stomach discomfort.\n3. **Timing:** Timing is secondary to consistency, but post-workout with protein/carbs offers slight absorption benefits.\n4. **Water:** Drink 3.5–4 liters of water daily since creatine pulls intracellular water into muscle cells (improving cell swelling and protein synthesis).`,
    };
  }

  // 7. Whey Protein & Protein Powders
  if (q.includes('whey') || q.includes('isolate') || q.includes('protein powder')) {
    return {
      text: `**Whey Protein Guide (Isolate vs Concentrate):**\n\n• **Whey Concentrate (~80% protein):** Great cost-effective option containing minimal lactose and fat with bioactive peptides.\n• **Whey Isolate (90%+ protein):** Processed to filter out virtually all lactose and fat. Ideal if you are lactose-sensitive or on a strict cutting phase.\n• **Optimal Intake:** Target 1.6–2.2g of protein per kg of body weight daily (for your weight of ${ctx.weightKg}kg, that is **${Math.round(ctx.weightKg * 1.8)}–${Math.round(ctx.weightKg * 2.0)}g**).\n• **When to drink:** Within 1–2 hours post-workout or between meals to hit your daily protein goal.`,
    };
  }

  // 8. Soreness / DOMS
  if (q.includes('sore') || q.includes('doms') || q.includes('stiff') || q.includes('pain after')) {
    return {
      text: `**Dealing with Muscle Soreness (DOMS):**\n\nDelayed Onset Muscle Soreness peaks 24–48 hours after training new movements or high eccentric volume.\n\n1. **Can I train when sore?** Yes, if it's general muscular soreness (not joint or tendon pain). Light activity increases blood flow and speeds recovery.\n2. **Best recovery methods:**\n   • 10–15 min light walking or cycling (active recovery)\n   • Hit your protein target (**${ctx.proteinTarget}g**) to rebuild micro-tears\n   • 7–9 hours of deep sleep where Human Growth Hormone (HGH) is released\n   • Adequate hydration (3L+ water)`,
    };
  }

  // 9. Deadlift technique / Back pain
  if (q.includes('deadlift') || (q.includes('back') && q.includes('pain'))) {
    return {
      text: `**Safe Deadlift Form & Protecting Your Lower Back:**\n\n1. **The Wedge & Brace:** Before pulling, take a deep belly breath into your diaphragm (Valsalva maneuver) and brace your abs like you're about to take a punch.\n2. **Lats Engaged:** Think of "protecting your armpits" or "bending the bar around your shins". This locks your thoracic spine.\n3. **Bar Path:** Keep the barbell in continuous contact with your shins and thighs. If the bar drifts forward, the lever arm on your lower back increases exponentially.\n4. **Hip Hinge:** Push your hips back rather than squatting down.\n\n*If you feel sharp spinal pain or numbness, stop immediately and consult a sports physical therapist.*`,
    };
  }

  // 10. Squat form / Knee pain
  if (q.includes('squat') || (q.includes('knee') && q.includes('pain'))) {
    return {
      text: `**Squat Mechanics & Eliminating Knee Discomfort:**\n\n1. **Foot Position:** Stand with feet shoulder-width apart, toes angled outward 15–30 degrees.\n2. **Knee Tracking:** Force your knees outward to track in the exact same direction as your toes throughout the descent and ascent (prevent knee valgus/caving).\n3. **Rooting:** Grip the floor with your big toe, pinky toe, and heel (the tripod foot).\n4. **Depth:** Aim for hip crease below the top of the patella (parallel) to balance quad and hamstring/glute loads.`,
    };
  }

  // 11. Bench Press / Shoulder Pain
  if (q.includes('bench') && (q.includes('shoulder') || q.includes('chest'))) {
    return {
      text: `**Bench Press Form for Maximum Chest Growth & Shoulder Safety:**\n\n1. **Scapular Retraction:** Pinch your shoulder blades together and pull them down into your back pockets before un-racking. Never press with loose, flat shoulders.\n2. **Elbow Angle:** Tuck your elbows to a 45–75 degree angle relative to your torso. Avoid 90-degree "T-pose" flaring which causes shoulder impingement.\n3. **Bar Path:** Touch the bar to your lower sternum/nipple line, then press in a slight backward J-curve toward your eye line.`,
    };
  }

  // 12. Bulking vs Cutting
  if (q.includes('bulk') || q.includes('cut') || q.includes('deficit') || q.includes('lose fat') || q.includes('gain muscle')) {
    return {
      text: `**Lean Bulking vs Cutting Principles:**\n\n• **Clean Bulk:** Eat in a modest 250–350 kcal surplus above maintenance. Aim to gain ~0.5–1 kg per month to maximize lean muscle over adipose fat.\n• **Cutting / Fat Loss:** Maintain a 300–500 kcal deficit. Keep protein high (**${ctx.proteinTarget}g**) and lift heavy to preserve existing muscle tissue while burning fat.\n• **Scale Tracking:** Weigh yourself 3–4 mornings per week upon waking up and track the weekly average rather than day-to-day fluctuations.`,
    };
  }

  // 13. Pre-workout & Caffeine
  if (q.includes('pre-workout') || q.includes('preworkout') || q.includes('caffeine')) {
    return {
      text: `**Pre-Workout & Caffeine Optimization:**\n\n• **Effective Caffeine Dose:** 3–6 mg per kg bodyweight taken 30–45 minutes pre-training.\n• **Key Ingredients to look for:**\n  - **L-Citrulline (6–8g):** Nitric oxide booster for vasodilation and muscle pumps.\n  - **Beta-Alanine (3.2g):** Buffers lactic acid (causes the harmless tingling sensation).\n• **Sleep Rule:** Avoid stimulants within 6–8 hours of bedtime to protect deep slow-wave sleep and nighttime recovery.`,
    };
  }

  // 14. Water & Hydration
  if (q.includes('water') || q.includes('hydration') || q.includes('drink')) {
    return {
      text: `**Daily Hydration for Resistance Training:**\n\n• Target **3.5 to 4.5 Liters** of water per day.\n• A 2% drop in body water causes up to a 10–15% drop in lifting strength and muscular endurance.\n• Ensure adequate electrolytes (especially sodium and potassium) around heavy training sessions.`,
    };
  }

  // 15. Vegetarian / Indian Protein Sources
  if (q.includes('veg') || q.includes('vegetarian') || q.includes('vegan') || q.includes('paneer') || q.includes('soya')) {
    return {
      text: `**Top High-Protein Vegetarian & Indian Foods:**\n\n1. **Soya Chunks:** ~52g protein per 100g (one of the highest protein densities in existence).\n2. **Paneer / Cottage Cheese:** ~18g protein per 100g + healthy fats.\n3. **Greek Yogurt / Hung Curd:** ~10g protein per 100g.\n4. **Lentils / Dal + Rice combo:** Complete amino acid profile when eaten together.\n5. **Chickpeas (Chana) & Rajma:** Great sources of complex carbohydrates, fiber, and ~19g protein per cup.\n6. **Whey Protein:** The cleanest way to close any remaining protein gap.`,
    };
  }

  // 16. Rest Days & Frequency
  if (q.includes('rest day') || q.includes('recovery') || q.includes('frequency')) {
    return {
      text: `**Rest Days & Muscular Hypertrophy:**\n\n• Muscle protein synthesis remains elevated for 24–48 hours post-workout. Muscles grow while resting, eating, and sleeping—not in the gym.\n• Aim for **1 to 2 rest days per week** so your Central Nervous System (CNS) and tendons recover.\n• On rest days, maintain your protein target (**${ctx.proteinTarget}g**) and do light walking (8k–10k steps) for active recovery.`,
    };
  }

  // 17. General Intelligent Fallback
  return {
    text: `Great question, ${ctx.userName}! Here is the scientific coaching guidance on **${query.replace(/^[a-z]/, (c) => c.toUpperCase())}**:\n\n1. **Training Volume & Progressive Overload:** Ensure every muscle group receives 10–20 working sets per week, training within 1–3 reps of failure (RPE 7–9).\n2. **Nutritional Fuel:** Maintain your daily budget of **${ctx.calorieTarget} kcal** and **${ctx.proteinTarget}g protein** to provide amino acids for muscle tissue repair.\n3. **Recovery & Sleep:** Target 7–9 hours of sleep nightly to allow optimal hormone release and central nervous system replenishment.\n\n*Tip: Connect your Google Gemini API key to activate live real-time Google Search online browsing for deep research on any fitness topic!*`,
  };
}

