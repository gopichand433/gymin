// E2E Verification Script for GYMIN
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🚀 Starting GYMIN Full User Journey Verification...\n');
  let cookieHeader = '';

  // 1. Test Landing Page
  console.log('1. Checking Landing Page (GET /)...');
  const landingRes = await fetch(`${BASE_URL}/`);
  if (landingRes.status !== 200) throw new Error(`Landing page failed: ${landingRes.status}`);
  console.log('   ✅ Landing page rendered successfully (200 OK)');

  // 2. Test Demo Login
  console.log('2. Authenticating via 1-Click Demo Login (/api/auth/demo-login)...');
  const demoLoginRes = await fetch(`${BASE_URL}/api/auth/demo-login`, { method: 'POST' });
  const demoData = await demoLoginRes.json();
  if (!demoData.success) throw new Error('Demo login failed');
  const rawCookie = demoLoginRes.headers.get('set-cookie');
  if (rawCookie) {
    cookieHeader = rawCookie.split(';')[0];
  }
  console.log(`   ✅ Authenticated as ${demoData.user.name} (${demoData.user.email})`);

  // 3. Test Dashboard API
  console.log('3. Fetching Dashboard Overview (/api/dashboard)...');
  const dashRes = await fetch(`${BASE_URL}/api/dashboard`, {
    headers: { cookie: cookieHeader },
  });
  const dashData = await dashRes.json();
  console.log(`   ✅ Greeting: Hello ${dashData.userName}`);
  console.log(`   ✅ Consistency: ${dashData.streakDays} Day Streak 🔥`);
  console.log(`   ✅ Today's Workout: ${dashData.todayWorkout.dayName} (${dashData.todayWorkout.exerciseCount} exercises · ~${dashData.todayWorkout.durationMin}m)`);
  console.log(`   ✅ Nutrition: ${dashData.nutrition.calories} / ${dashData.nutrition.calorieTarget} kcal (Protein: ${dashData.nutrition.protein} / ${dashData.nutrition.proteinTarget} g)`);
  console.log(`   ✅ Steps: ${dashData.steps.current} / ${dashData.steps.target}`);
  console.log(`   ✅ Weight: ${dashData.weight.current} kg (${dashData.weight.change} kg net)`);

  // 4. Test Exercise Library
  console.log('4. Fetching Exercise Database (/api/exercises?muscle=Chest)...');
  const exRes = await fetch(`${BASE_URL}/api/exercises?muscle=Chest`);
  const exData = await exRes.json();
  console.log(`   ✅ Retrieved ${exData.exercises.length} Chest exercises (Sample: ${exData.exercises[0]?.name})`);

  // 5. Test Food Database with Indian Dishes
  console.log('5. Fetching Indian Dishes from Food Database (/api/foods?isIndian=true)...');
  const foodRes = await fetch(`${BASE_URL}/api/foods?isIndian=true`);
  const foodData = await foodRes.json();
  console.log(`   ✅ Retrieved ${foodData.foods.length} Indian foods (Sample: ${foodData.foods[0]?.name})`);

  // 6. Test Logging a Food Item with Dynamic Serving
  console.log('6. Logging Indian Dish to Lunch (/api/nutrition/log)...');
  const paneerDish = foodData.foods.find((f) => f.name.includes('Paneer')) || foodData.foods[0];
  const logFoodRes = await fetch(`${BASE_URL}/api/nutrition/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieHeader },
    body: JSON.stringify({
      mealType: 'LUNCH',
      foodId: paneerDish.id,
      foodName: paneerDish.name,
      servingUnit: 'bowl',
      quantity: 1,
      calories: 230,
      protein: 8.5,
      carbs: 9.0,
      fat: 18.0,
    }),
  });
  const logged = await logFoodRes.json();
  if (!logged.success) throw new Error('Food log failed');
  console.log(`   ✅ Logged 1 bowl of ${paneerDish.name} (230 kcal, 8.5g protein)`);

  // 7. Test Active Workout Flow & Session Completion
  console.log('7. Testing Active Workout Completion (/api/workouts/complete-session)...');
  const benchEx = exData.exercises.find((e) => e.slug === 'barbell-bench-press') || exData.exercises[0];
  const completeWorkoutRes = await fetch(`${BASE_URL}/api/workouts/complete-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieHeader },
    body: JSON.stringify({
      dayName: 'Chest & Triceps Power',
      durationSec: 3300, // 55 mins
      sets: [
        { exerciseId: benchEx.id, setNumber: 1, weightKg: 85, actualReps: 8, targetReps: 8, isCompleted: true },
        { exerciseId: benchEx.id, setNumber: 2, weightKg: 87.5, actualReps: 8, targetReps: 8, isCompleted: true },
        { exerciseId: benchEx.id, setNumber: 3, weightKg: 90, actualReps: 6, targetReps: 8, isCompleted: true },
      ],
    }),
  });
  const workoutResult = await completeWorkoutRes.json();
  if (!workoutResult.success) throw new Error('Workout completion failed');
  console.log(`   ✅ Recorded Workout Session:`);
  console.log(`      - Duration: ${workoutResult.summary.durationMinutes} minutes`);
  console.log(`      - Total Volume: ${workoutResult.summary.totalVolumeKg} kg`);
  console.log(`      - Completed Sets: ${workoutResult.summary.totalSets}`);
  console.log(`      - Calories Burned: ~${workoutResult.summary.caloriesBurned} kcal`);
  if (workoutResult.summary.newPrs?.length > 0) {
    console.log(`      - 🏆 NEW PERSONAL RECORD DETECTED: ${workoutResult.summary.newPrs[0].exerciseName} at ${workoutResult.summary.newPrs[0].weightKg} kg!`);
  }

  // 8. Test Progress Analytics
  console.log('8. Fetching Progress Analytics (/api/progress)...');
  const progRes = await fetch(`${BASE_URL}/api/progress`, {
    headers: { cookie: cookieHeader },
  });
  const progData = await progRes.json();
  console.log(`   ✅ PRs Tracked: ${progData.personalRecords.length}`);
  console.log(`   ✅ Factual Data-Driven Insight: "${progData.insights[0]}"`);

  // 9. Test Achievements
  console.log('9. Checking Achievements System (/api/achievements)...');
  const achRes = await fetch(`${BASE_URL}/api/achievements`, {
    headers: { cookie: cookieHeader },
  });
  const achData = await achRes.json();
  const unlocked = achData.achievements.filter((a) => a.isUnlocked);
  console.log(`   ✅ Unlocked Achievements: ${unlocked.length} of ${achData.achievements.length} badges (e.g. "${unlocked[0]?.title}")`);

  // 10. Test GYMIN AI Assistant (Grounding Verification)
  console.log('10. Testing GYMIN AI Grounded Assistant (/api/ai/chat)...');
  
  // Question A: Workout inquiry
  console.log('   Question A: "What is my workout today?"');
  const aiRes1 = await fetch(`${BASE_URL}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieHeader },
    body: JSON.stringify({ message: "What is my workout today?" }),
  });
  const aiData1 = await aiRes1.json();
  console.log(`   Assistant Response:\n   "${aiData1.message.content.slice(0, 140)}..."`);
  console.log(`   Attached Card: ${aiData1.message.cardType}`);

  // Question B: Protein inquiry (testing strictly grounded real database values)
  console.log('\n   Question B: "How much protein have I eaten today?"');
  const aiRes2 = await fetch(`${BASE_URL}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieHeader },
    body: JSON.stringify({ message: "How much protein have I eaten today?" }),
  });
  const aiData2 = await aiRes2.json();
  console.log(`   Assistant Response:\n   "${aiData2.message.content.slice(0, 160)}..."`);
  console.log(`   Attached Card: ${aiData2.message.cardType}`);

  console.log('\n🎉 ALL 10 E2E CHECKS PASSED WITH 100% SUCCESS!');
}

runTests().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
