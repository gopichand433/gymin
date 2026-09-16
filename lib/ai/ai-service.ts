import { GoogleGenAI } from '@google/genai';
import { UserFitnessContext } from './user-context';

export interface AIResponse {
  text: string;
  cardType?: 'WORKOUT_CARD' | 'NUTRITION_CARD' | 'PROGRESS_CARD' | null;
  cardData?: any;
  provider?: 'gemini' | 'openai' | 'analytical';
}

function buildSystemPrompt(context: UserFitnessContext): string {
  return `You are GYMIN AI, an elite, world-class personal strength coach, athletic trainer, and sports nutrition specialist dedicated to helping ${context.userName}.
Tone: Direct, practical, highly encouraging, scientifically grounded, and concise. Speak like an experienced personal trainer on the gym floor, not a textbook.

CRITICAL COACHING DIRECTIVES:
1. ANSWER THE USER'S DIRECT QUESTION IMMEDIATELY: Always provide a clear, practical, direct solution in your very first paragraph. Never output generic filler, boilerplate motivational clichés, or repeat daily calorie/protein stats unless the user explicitly asked about their diet.
2. INJURIES, PAIN & REHABILITATION:
   - If user asks about pain or injuries (e.g., "my back hurts is it ok to do leg workout", "knee pain on squats", "shoulder clicks on bench"):
     • Give an immediate, definitive answer (e.g., "Yes, you can still train legs today, but you MUST eliminate axial spinal compression.").
     • Explicitly list exercises to AVOID (e.g., Barbell Back Squats, Deadlifts).
     • Explicitly list SAFE replacement exercises with suggested sets and rep ranges (e.g., Seated Leg Press with lower back pinned, Lying Leg Curls, Leg Extensions).
     • Provide key form cues and safety thresholds (e.g., if sharp, stabbing pain occurs, stop immediately).
3. WORKOUT MODIFICATIONS:
   - If user asks about limited equipment (e.g., dumbbells only, home workout), missed sessions, or time crunches, provide an exact routine with exercise names, sets, and rep targets tailored to their goal (${context.goal.replace(/_/g, ' ')}).
4. STRICT GROUNDING: Never hallucinate or contradict the athlete's real stats below.

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
- Personal Records: ${context.personalRecords.length > 0 ? context.personalRecords.map((pr) => `${pr.exercise}: ${pr.maxWeightKg}kg x ${pr.maxReps}`).join(', ') : 'Benchmark records established'}`;
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
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];

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

  // 1. If user explicitly requests OpenAI or only OpenAI key is present
  if (preferredProvider === 'openai' || (!geminiKey && openAIKey)) {
    if (openAIKey) {
      try {
        const text = await callChatGPT(openAIKey, userQuery, context);
        const { cardType, cardData } = detectCard(userQuery, context);
        return { text, cardType, cardData, provider: 'openai' };
      } catch (err: any) {
        console.warn('ChatGPT API call failed, attempting fallback:', err);
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
      console.warn('Gemini API call failed, falling back to sports science coach:', err);
    }
  }

  // 3. Fallback to OpenAI if Gemini failed and OpenAI key exists
  if (openAIKey) {
    try {
      const text = await callChatGPT(openAIKey, userQuery, context);
      const { cardType, cardData } = detectCard(userQuery, context);
      return { text, cardType, cardData, provider: 'openai' };
    } catch (err) {
      console.warn('Fallback ChatGPT API call failed:', err);
    }
  }

  // 4. Zero-config Grounded Analytical Knowledge Engine (Direct solutions, no banners)
  const analytical = generateGroundedAnalyticalResponse(userQuery, context);
  return {
    ...analytical,
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

  // 9. Back Pain / Back Hurts / Spine Discomfort during Leg Workouts, Squats, or Deadlifts
  const isBackIssue = q.includes('back') && (
    q.includes('hurt') || q.includes('pain') || q.includes('ache') ||
    q.includes('sore') || q.includes('strain') || q.includes('tweak') ||
    q.includes('leg') || q.includes('squat') || q.includes('deadlift') || q.includes('spine')
  );
  if (isBackIssue) {
    const isLegDay = q.includes('leg') || q.includes('squat') || q.includes('lower') || q.includes('quad') || q.includes('hamstring');
    if (isLegDay) {
      return {
        text: `**Yes, you CAN still do a leg workout today, but you MUST eliminate all spinal compression (axial loading).**

When your back hurts or feels strained, loading a heavy barbell onto your spine (like back squats or deadlifts) risks converting minor muscular fatigue into a serious disc or lumbar injury. Here is your exact modified leg routine:

🛑 **Exercises to AVOID Today:**
• **Barbell Back Squats & Front Squats** (compresses the lumbar spine)
• **Deadlifts & Romanian Deadlifts (RDLs)** (places high shear stress across the lower back)
• **Barbell Good Mornings & Heavy Standing Lunges**

✅ **Safe, Back-Friendly Leg Workout:**
1. **Seated or Lying Leg Curls:** 3–4 sets × 12–15 reps *(Completely safe; eliminates all lower back strain while isolating hamstrings).*
2. **Leg Extensions:** 3–4 sets × 12–15 reps *(Isolates your quadriceps with your back pressed firmly against the seat pad).*
3. **Seated Leg Press:** 3 sets × 10–12 reps *(CRITICAL FORM: Keep your lower back and glutes pinned flat to the backrest. **Do NOT let your lower back round at the bottom of the movement**).*
4. **Bodyweight or Light Dumbbell Walking Lunges:** 3 sets × 10 steps per leg *(Keep your torso completely upright).*
5. **Seated Machine Calf Raises:** 3 sets × 15 reps.

💡 **Trainer Safety Rule:** If you feel any sharp, shooting pain, or tingling radiating down your glutes or legs, STOP immediately. If it's dull muscular stiffness, these machine-supported movements will safely pump blood into your legs without irritating your back!`,
      };
    }

    return {
      text: `**Lower Back Pain & Weight Training Guidance:**

1. **Rule #1: Eliminate Axial Spine Loading:** While your lower back is irritated, remove heavy standing spinal compression exercises (Barbell Squats, Standing Overhead Press, Bent-over Barbell Rows, Deadlifts).
2. **Switch to Chest-Supported Movements:**
   • Replace Bent-over Rows with **Chest-Supported Incline Dumbbell Rows** or **T-Bar Rows**.
   • Replace Standing Overhead Press with **Seated Dumbbell Press (with high back support)**.
   • Replace Squats with **Leg Extensions and Supported Leg Press**.
3. **Activate Core Stabilizers (The McGill Big 3):**
   • Perform 3 sets of Bird-Dogs, Side Planks, and McGill Curl-Ups before your workouts to lock in lumbar spinal stiffness.
4. **When to Stop:** If you experience sharp, shooting pain, or tingling radiating down your leg, stop lifting immediately and consult a sports physiotherapist.`,
    };
  }

  // 10. Knee Pain / Knees Hurt during Squats or Leg Day
  if (q.includes('knee') && (q.includes('hurt') || q.includes('pain') || q.includes('ache') || q.includes('squat') || q.includes('sore') || q.includes('click') || q.includes('pop'))) {
    return {
      text: `**Training Around Knee Pain / Patellar Discomfort:**

1. **Immediate Rule:** Do NOT push through sharp anterior knee pain. Temporarily reduce deep knee flexion past 90 degrees under heavy load.
2. **Shift to Posterior Chain Movements:**
   • Train hip-dominant exercises that place virtually zero shear on the patella: **Romanian Deadlifts (RDLs)**, **Hip Thrusts**, **Glute Bridges**, and **Seated Leg Curls**.
3. **Knee-Friendly Quad Exercises:**
   • **Box Squats:** Sit back onto a box or bench so your shins stay completely vertical.
   • **Reverse Lunges:** Stepping backward places significantly less force on the patellar tendon than forward lunges.
   • **Terminal Knee Extensions (TKE):** Loop a resistance band behind your knee and straighten against resistance (3 sets × 20 reps) to fire the VMO (inner quad stabilizer).
4. **Knee Tracking Cue:** On any squat or leg press, ensure your knees track outward in the exact direction of your 2nd and 3rd toes. Never allow your knees to cave inward (valgus collapse).`,
    };
  }

  // 11. Shoulder Pain / Shoulder Hurt on Bench Press
  if (q.includes('shoulder') && (q.includes('hurt') || q.includes('pain') || q.includes('click') || q.includes('bench') || q.includes('press') || q.includes('impinge'))) {
    return {
      text: `**Shoulder Pain & Bench Press Solutions:**

1. **Stop Wide-Grip Barbell Bench Press:** Flaring your elbows out at 90 degrees puts the rotator cuff tendons in direct impingement under the acromion bone.
2. **Safe Pressing Alternatives:**
   • **Neutral-Grip Dumbbell Press:** Turn your palms facing inward toward each other. This rotates the humeral head into a safe, open position.
   • **Floor Press:** Pressing with dumbbells while lying on the floor stops your elbows at 90 degrees, preventing dangerous hyperextension of the anterior shoulder capsule.
   • **Low Incline (15–30°):** Far easier on the shoulder joint than steep 45° incline benches.
3. **Scapular Retraction:** Always pull your shoulder blades "down and together" into your rear pockets before un-racking. Press with an engaged, locked upper back.
4. **Warm-Up Must:** Do 3 sets of 15 reps of **Face Pulls** and **Band Pull-Aparts** before any chest or shoulder session.`,
    };
  }

  // 12. Elbow / Wrist Pain / Tendonitis
  if ((q.includes('elbow') || q.includes('wrist')) && (q.includes('hurt') || q.includes('pain') || q.includes('tendonitis') || q.includes('curl') || q.includes('press'))) {
    return {
      text: `**Relieving Elbow & Wrist Pain in the Gym:**

1. **Ditch the Straight Barbell for Bicep Curls:** Straight bars force your wrists and forearms into extreme unnatural supination, causing medial epicondylitis (Golfer's elbow). Switch immediately to an **EZ-Curl Bar** or **Neutral-Grip Dumbbell Hammer Curls**.
2. **Wrist Stacking on Presses:** Ensure the barbell or dumbbell rests directly over the heel of your palm (stacked straight above your radius/ulna bones), rather than bent backward toward your fingers.
3. **Use Lifting Straps:** If forearm tendonitis limits your pulling strength, use lifting straps on deadlifts and rows so your grip tendons can heal.
4. **Avoid Harsh Lockouts:** Stop pressing and tricep extension reps just shy of bone-on-bone hyperextension.`,
    };
  }

  // 13. Missed a Workout / What to do after missing days
  if ((q.includes('miss') || q.includes('skip') || q.includes('forgot')) && (q.includes('workout') || q.includes('yesterday') || q.includes('gym') || q.includes('day') || q.includes('split'))) {
    return {
      text: `**What to Do When You Miss a Workout:**

1. **Rule #1: NEVER do two full workouts in one day.** Combining "Chest Day" and "Leg Day" into a 2-hour workout causes massive central nervous system fatigue and drastically elevates injury risk.
2. **If You Missed 1 Day:**
   • Simply **shift your entire split forward by 1 day**. If you missed yesterday's workout, do it today! Muscles recover on a rolling 48-hour timeline, not an arbitrary 7-day calendar.
3. **If You Missed 2–3 Days (Busy Week):**
   • Perform a **45-Minute Consolidated Full Body Session** today:
     - Quad/Hips: Leg Press or Goblet Squat (3 sets × 10 reps)
     - Chest: Dumbbell Bench Press (3 sets × 8–10 reps)
     - Upper Back: Lat Pulldown or Seated Cable Row (3 sets × 10 reps)
     - Hamstrings: Romanian Deadlift or Leg Curls (3 sets × 10 reps)
   • You hit every major muscle group, preserve your momentum, and restart fresh!`,
      cardType: 'WORKOUT_CARD',
      cardData: {
        dayName: ctx.todayWorkoutName,
        exerciseCount: ctx.todayExercises.length,
        durationMin: 50,
        exercises: ctx.todayExercises,
      },
    };
  }

  // 14. Only Have Dumbbells / Home Workout Today
  if (q.includes('dumbbell') || q.includes('home') || q.includes('no gym') || q.includes('only have')) {
    return {
      text: `**Dumbbell-Only Routine for ${ctx.todayWorkoutName}:**

No machines needed! Here is your complete, high-intensity dumbbell routine:

1. **Dumbbell Goblet Squat / Flat Dumbbell Press:** 4 sets × 10–12 reps *(Controlled 3-second lowering tempo).*
2. **Dumbbell Romanian Deadlift / Incline Press:** 3 sets × 12 reps *(Focus on a deep stretch).*
3. **Chest-Supported or Single-Arm DB Row:** 3 sets × 12 reps per side *(Pull elbow back toward your hip pocket).*
4. **Dumbbell Bulgarian Split Squat or Lateral Raises:** 3 sets × 12–15 reps.
5. **Dumbbell Hammer Curls or Overhead Tricep Extension:** 3 sets × 12–15 reps.

💡 **Pro Tip for Home Dumbbells:** If your dumbbells are lighter than your gym weights, slow down your tempo (3 seconds down, 1 second pause at the bottom) and limit rest to 45 seconds to maximize muscle hypertrophy!`,
      cardType: 'WORKOUT_CARD',
      cardData: {
        dayName: 'Dumbbell ' + ctx.todayWorkoutName,
        exerciseCount: 5,
        durationMin: 45,
      },
    };
  }

  // 15. Short on Time / 20–30 Minutes
  if (q.includes('short on time') || q.includes('20 min') || q.includes('30 min') || q.includes('quick workout') || q.includes('rush') || q.includes('busy')) {
    return {
      text: `**25-Minute High-Efficiency Workout Strategy:**

Use **Antagonistic Supersets** (pairing non-competing muscle groups back-to-back). You cut total workout time in half while matching full muscle stimulation:

⚡ **Express Protocol:**
• **Superset 1 (Quads + Upper Back):**
  - Leg Press or Goblet Squats: 3 sets × 10 reps
  - *Immediately pair with:* Lat Pulldowns or Cable Rows: 3 sets × 10 reps
  - Rest 60 seconds, repeat 3 rounds.
• **Superset 2 (Chest + Hamstrings):**
  - Dumbbell Bench Press: 3 sets × 10–12 reps
  - *Immediately pair with:* Lying Leg Curls or Dumbbell RDLs: 3 sets × 10–12 reps
  - Rest 60 seconds, repeat 3 rounds.

Total duration: ~22 minutes. Quick, intense, and highly effective!`,
    };
  }

  // 16. Exhausted / Low Energy / Feeling Tired Today
  if (q.includes('tired') || q.includes('exhausted') || q.includes('low energy') || q.includes('fatigue') || q.includes('no energy') || q.includes('drained')) {
    return {
      text: `**Coaching Advice for Training When Exhausted:**

1. **The "10-Minute Warm-Up Test":**
   • Go to the gym and start your light 5-minute dynamic warm-up and first 2 warm-up sets.
   • **If energy returns:** Proceed with your session, but cap your intensity at RPE 7–8 (stop 2–3 reps before muscle failure).
   • **If you still feel completely drained after 10 minutes:** Listen to your nervous system! Drop all accessory isolation movements, do 2 solid working sets of your main compound lift, and wrap up.
2. **Active Recovery Option:** If you had poor sleep (<5 hours) or excessive work stress, don't force a heavy PR session. Take a brisk 30-minute walk (6,000–8,000 steps), do 10 minutes of hip/spine mobility, and hit your protein target (**${ctx.proteinTarget}g**). You will rebound significantly stronger tomorrow!`,
    };
  }

  // 17. Strength Plateau / Can't Increase Weight
  if (q.includes('plateau') || q.includes('stuck') || q.includes('increase weight') || q.includes('add weight') || q.includes('bench stuck')) {
    return {
      text: `**How to Break Through a Strength Plateau:**

1. **Micro-Loading:** Stop attempting 5kg jumps every week. Use 0.5kg or 1.25kg fractional plates. Adding just 1–2 kg per week equals 50kg in a year.
2. **Introduce Paused Reps:** If you are stuck at the bottom of the bench press or squat, drop weight by 15% and perform a **2-second dead pause** at the chest or parallel. This builds explosive starting power by removing the stretch reflex.
3. **Schedule a Deload Week:** If you have trained hard for 6–8 continuous weeks, your central nervous system and tendons accumulate systemic fatigue. Take 1 week at 50% total volume and 70% intensity. You will come back noticeably stronger!`,
    };
  }

  // 18. When to do Cardio (Before vs After Weights)
  if (q.includes('cardio') && (q.includes('before') || q.includes('after') || q.includes('when') || q.includes('weights') || q.includes('lift'))) {
    return {
      text: `**When Should You Do Cardio? (Scientific Rule):**

• **Lift Weights FIRST, Do Cardio AFTER (or on separate days).**
• **Why?** Heavy resistance training requires full muscle glycogen stores and maximal nervous system motor unit recruitment. Doing 30 minutes of cardio first depletes muscle glycogen and fatigues your stabilizers, reducing lifting performance by 15–20% and raising injury risk.
• **Recommended Protocol:**
  - 5-minute dynamic mobility warm-up
  - Heavy resistance workout (45–60 minutes)
  - Post-workout cardio: 15–25 minutes of low-intensity steady-state (LISS) incline treadmill walking or stationary cycling.`,
    };
  }

  // 19. Pre-Workout & Post-Workout Nutrition
  if ((q.includes('eat') || q.includes('meal') || q.includes('food')) && (q.includes('before workout') || q.includes('after workout') || q.includes('pre workout') || q.includes('post workout'))) {
    return {
      text: `**Pre-Workout & Post-Workout Fuel Guide:**

🍳 **Pre-Workout Fuel (60–90 Minutes Before):**
• **Goal:** Maximize blood glucose and liver/muscle glycogen without stomach fullness.
• **What to Eat:** Easily digestible complex carbs + 20–25g lean protein.
• **Best Combos:**
  - 1 Bowl Oatmeal with 1 Scoop Whey & Banana slices
  - 2 Slices Whole Wheat Toast with 2 Boiled Eggs or Peanut Butter
  - 1 Cup Curd / Greek Yogurt with Berries and Honey

🥤 **Post-Workout Recovery (Within 2 Hours After):**
• **Goal:** Stimulate Muscle Protein Synthesis (MPS) and replenish glycogen.
• **What to Eat:** 25–40g complete protein + recovery carbohydrates.
• **Best Combos:**
  - 1 Scoop Whey Protein + 1 Banana or Rice Cake
  - Grilled Chicken Breast / 150g Paneer with Steamed Rice and Dal`,
    };
  }

  // 20. Bulking vs Cutting
  if (q.includes('bulk') || q.includes('cut') || q.includes('deficit') || q.includes('lose fat') || q.includes('gain muscle')) {
    return {
      text: `**Lean Bulking vs Cutting Principles:**\n\n• **Clean Bulk:** Eat in a modest 250–350 kcal surplus above maintenance. Aim to gain ~0.5–1 kg per month to maximize lean muscle over adipose fat.\n• **Cutting / Fat Loss:** Maintain a 300–500 kcal deficit. Keep protein high (**${ctx.proteinTarget}g**) and lift heavy to preserve existing muscle tissue while burning fat.\n• **Scale Tracking:** Weigh yourself 3–4 mornings per week upon waking up and track the weekly average rather than day-to-day fluctuations.`,
    };
  }

  // 21. Pre-workout & Caffeine
  if (q.includes('pre-workout') || q.includes('preworkout') || q.includes('caffeine')) {
    return {
      text: `**Pre-Workout & Caffeine Optimization:**\n\n• **Effective Caffeine Dose:** 3–6 mg per kg bodyweight taken 30–45 minutes pre-training.\n• **Key Ingredients to look for:**\n  - **L-Citrulline (6–8g):** Nitric oxide booster for vasodilation and muscle pumps.\n  - **Beta-Alanine (3.2g):** Buffers lactic acid (causes the harmless tingling sensation).\n• **Sleep Rule:** Avoid stimulants within 6–8 hours of bedtime to protect deep slow-wave sleep and nighttime recovery.`,
    };
  }

  // 22. Water & Hydration
  if (q.includes('water') || q.includes('hydration') || q.includes('drink')) {
    return {
      text: `**Daily Hydration for Resistance Training:**\n\n• Target **3.5 to 4.5 Liters** of water per day.\n• A 2% drop in body water causes up to a 10–15% drop in lifting strength and muscular endurance.\n• Ensure adequate electrolytes (especially sodium and potassium) around heavy training sessions.`,
    };
  }

  // 23. Vegetarian / Indian Protein Sources
  if (q.includes('veg') || q.includes('vegetarian') || q.includes('vegan') || q.includes('paneer') || q.includes('soya')) {
    return {
      text: `**Top High-Protein Vegetarian & Indian Foods:**\n\n1. **Soya Chunks:** ~52g protein per 100g (one of the highest protein densities in existence).\n2. **Paneer / Cottage Cheese:** ~18g protein per 100g + healthy fats.\n3. **Greek Yogurt / Hung Curd:** ~10g protein per 100g.\n4. **Lentils / Dal + Rice combo:** Complete amino acid profile when eaten together.\n5. **Chickpeas (Chana) & Rajma:** Great sources of complex carbohydrates, fiber, and ~19g protein per cup.\n6. **Whey Protein:** The cleanest way to close any remaining protein gap.`,
    };
  }

  // 24. Rest Days & Frequency
  if (q.includes('rest day') || q.includes('recovery') || q.includes('frequency')) {
    return {
      text: `**Rest Days & Muscular Hypertrophy:**\n\n• Muscle protein synthesis remains elevated for 24–48 hours post-workout. Muscles grow while resting, eating, and sleeping—not in the gym.\n• Aim for **1 to 2 rest days per week** so your Central Nervous System (CNS) and tendons recover.\n• On rest days, maintain your protein target (**${ctx.proteinTarget}g**) and do light walking (8k–10k steps) for active recovery.`,
    };
  }

  // 25. Intelligent Contextual Fallback (Direct Answer, No Robotic Checklist)
  let directAdvice = '';
  if (q.includes('pain') || q.includes('hurt') || q.includes('injur') || q.includes('ache')) {
    directAdvice = `• **Injury Rule:** Never train through sharp, pinching joint pain. Swap barbell compound movements for machine-supported or bodyweight variations to keep blood flowing while protecting joints.`;
  } else if (q.includes('reps') || q.includes('sets') || q.includes('volume') || q.includes('heavy')) {
    directAdvice = `• **Rep Ranges:** Stick to 6–10 reps on heavy compound movements for mechanical tension, and 10–15 reps on isolation accessories. Train within 1–2 reps of failure (RPE 8).`;
  } else if (q.includes('fat') || q.includes('weight loss') || q.includes('diet') || q.includes('food')) {
    directAdvice = `• **Nutrition Strategy:** Stay within a 300–400 kcal deficit while keeping protein high (**${ctx.proteinTarget}g**) to preserve 100% of your muscle mass while shedding body fat.`;
  } else {
    directAdvice = `• **Coaching Principle:** Focus on progressive overload (adding 1 rep or 1kg per week) with controlled 3-second eccentrics for maximum muscle stimulation.`;
  }

  return {
    text: `Here is your direct coaching guidance regarding **${query}**:

${directAdvice}

• **Today's Action:** You have **${ctx.todayWorkoutName}** scheduled. You can launch your live workout tracker below, or ask me for specific exercise substitutions!`,
    cardType: 'WORKOUT_CARD',
    cardData: {
      dayName: ctx.todayWorkoutName,
      exerciseCount: ctx.todayExercises.length,
      durationMin: 55,
      exercises: ctx.todayExercises,
    },
  };
}

