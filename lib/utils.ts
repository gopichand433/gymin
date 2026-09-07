import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  let timeGreeting = 'Good morning';
  if (hour >= 12 && hour < 17) {
    timeGreeting = 'Good afternoon';
  } else if (hour >= 17) {
    timeGreeting = 'Good evening';
  }
  return `${timeGreeting}, ${name} 👋`;
}

export interface CalorieCalculationInput {
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  heightCm: number;
  weightKg: number;
  activityLevel: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'VERY_ACTIVE' | 'EXTRA_ACTIVE';
  goal: 'BUILD_MUSCLE' | 'IMPROVE_STRENGTH' | 'IMPROVE_FITNESS' | 'MAINTAIN_WEIGHT' | 'LOSE_WEIGHT' | 'GENERAL_HEALTH';
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Calculates estimated daily calorie & macronutrient targets using Mifflin-St Jeor formula.
 * Clear note: Targets are approximations and should be adjusted based on individual response.
 */
export function calculateMifflinStJeorTargets(input: CalorieCalculationInput): MacroTargets {
  const { age, gender, heightCm, weightKg, activityLevel, goal } = input;

  // 1. Calculate Basal Metabolic Rate (BMR)
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'FEMALE') {
    bmr -= 161;
  } else {
    bmr += 5;
  }

  // 2. Activity Multiplier
  const activityMultipliers: Record<string, number> = {
    SEDENTARY: 1.2,
    LIGHT: 1.375,
    MODERATE: 1.55,
    VERY_ACTIVE: 1.725,
    EXTRA_ACTIVE: 1.9,
  };
  const multiplier = activityMultipliers[activityLevel] || 1.55;
  const tdee = Math.round(bmr * multiplier);

  // 3. Goal Adjustment
  let targetCalories = tdee;
  let proteinPerKg = 1.8;

  switch (goal) {
    case 'BUILD_MUSCLE':
      targetCalories = tdee + 300;
      proteinPerKg = 2.0;
      break;
    case 'IMPROVE_STRENGTH':
      targetCalories = tdee + 200;
      proteinPerKg = 2.0;
      break;
    case 'LOSE_WEIGHT':
      targetCalories = Math.max(1400, tdee - 400);
      proteinPerKg = 2.2;
      break;
    case 'IMPROVE_FITNESS':
      targetCalories = tdee;
      proteinPerKg = 1.8;
      break;
    case 'MAINTAIN_WEIGHT':
    case 'GENERAL_HEALTH':
    default:
      targetCalories = tdee;
      proteinPerKg = 1.6;
      break;
  }

  // 4. Calculate Macros
  const proteinGrams = Math.round(weightKg * proteinPerKg);
  const proteinCalories = proteinGrams * 4;

  // Fat: 25% of total calories (9 kcal/g)
  const fatCalories = targetCalories * 0.25;
  const fatGrams = Math.round(fatCalories / 9);

  // Carbs: Remaining calories (4 kcal/g)
  const remainingCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
  const carbsGrams = Math.round(remainingCalories / 4);

  return {
    calories: Math.round(targetCalories),
    protein: proteinGrams,
    carbs: carbsGrams,
    fat: fatGrams,
  };
}
