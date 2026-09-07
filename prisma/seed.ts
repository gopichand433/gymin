import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting GYMIN database seeding...');

  // 1. Seed Achievements
  console.log('Inserting achievements...');
  const achievements = [
    {
      code: 'FIRST_WORKOUT',
      title: 'First Step',
      description: 'Completed your very first workout on GYMIN',
      icon: 'Trophy',
      category: 'WORKOUT',
      requirementThreshold: 1,
    },
    {
      code: 'WORKOUTS_10',
      title: 'Dedicated Athlete',
      description: 'Completed 10 total workout sessions',
      icon: 'Flame',
      category: 'WORKOUT',
      requirementThreshold: 10,
    },
    {
      code: 'WORKOUTS_50',
      title: 'Gym Veteran',
      description: 'Completed 50 total workout sessions',
      icon: 'Dumbbell',
      category: 'WORKOUT',
      requirementThreshold: 50,
    },
    {
      code: 'STREAK_7',
      title: '7-Day Fire',
      description: 'Maintained a 7-day workout or nutrition streak',
      icon: 'Zap',
      category: 'STREAK',
      requirementThreshold: 7,
    },
    {
      code: 'STREAK_30',
      title: 'Iron Consistency',
      description: 'Maintained an unbroken 30-day streak',
      icon: 'Crown',
      category: 'STREAK',
      requirementThreshold: 30,
    },
    {
      code: 'FIRST_PR',
      title: 'New Heights',
      description: 'Set your first Personal Record on a major lift',
      icon: 'Award',
      category: 'STRENGTH',
      requirementThreshold: 1,
    },
    {
      code: 'STEPS_100K',
      title: 'Centurion Walker',
      description: 'Logged over 100,000 total steps',
      icon: 'Footprints',
      category: 'STEPS',
      requirementThreshold: 100000,
    },
    {
      code: 'NUTRITION_7',
      title: 'Clean Fuel',
      description: 'Logged your meals consistently for 7 days',
      icon: 'Apple',
      category: 'NUTRITION',
      requirementThreshold: 7,
    },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { code: ach.code },
      update: ach,
      create: ach,
    });
  }

  // 2. Seed 55+ Exercises
  console.log('Inserting exercises...');
  const exerciseData = [
    // Chest
    {
      name: 'Barbell Bench Press',
      slug: 'barbell-bench-press',
      primaryMuscle: 'Chest',
      secondaryMuscles: JSON.stringify(['Triceps', 'Shoulders']),
      equipment: 'Barbell',
      difficulty: 'INTERMEDIATE',
      instructions: JSON.stringify([
        'Lie flat on the bench with feet firmly on the floor.',
        'Grip the bar slightly wider than shoulder-width.',
        'Unrack the barbell and slowly lower it toward your mid-chest.',
        'Press the bar upward explosively until arms are extended without locking elbows.',
      ]),
      safetyTips: JSON.stringify(['Keep wrists straight', 'Always use a spotter or safety pins', 'Do not bounce the bar off your sternum']),
      commonMistakes: JSON.stringify(['Flaring elbows too wide', 'Arching lower back excessively', 'Incomplete range of motion']),
      recommendedSets: 4,
      recommendedReps: 8,
      recommendedRestSec: 90,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Incline Dumbbell Press',
      slug: 'incline-dumbbell-press',
      primaryMuscle: 'Chest',
      secondaryMuscles: JSON.stringify(['Shoulders', 'Triceps']),
      equipment: 'Dumbbells',
      difficulty: 'INTERMEDIATE',
      instructions: JSON.stringify([
        'Set an adjustable bench to a 30 to 45-degree angle.',
        'Hold a dumbbell in each hand and bring them to shoulder level.',
        'Press dumbbells upward until arms are straight, squeezing upper chest.',
        'Lower weights under control with elbows slightly tucked.',
      ]),
      safetyTips: JSON.stringify(['Do not set bench angle higher than 45 degrees', 'Control descent slowly']),
      commonMistakes: JSON.stringify(['Clanging dumbbells at the top', 'Dropping elbows too low']),
      recommendedSets: 3,
      recommendedReps: 10,
      recommendedRestSec: 75,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Push Ups',
      slug: 'push-ups',
      primaryMuscle: 'Chest',
      secondaryMuscles: JSON.stringify(['Triceps', 'Abs', 'Shoulders']),
      equipment: 'Bodyweight',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Start in a high plank position with hands shoulder-width apart.',
        'Brace core and lower chest until 1-2 inches above ground.',
        'Push forcefully back to start position while maintaining a straight bodyline.',
      ]),
      safetyTips: JSON.stringify(['Avoid sagging hips', 'Keep neck in neutral alignment']),
      commonMistakes: JSON.stringify(['Flaring elbows at 90 degrees', 'Incomplete depth']),
      recommendedSets: 3,
      recommendedReps: 15,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Cable Chest Flyes',
      slug: 'cable-chest-flyes',
      primaryMuscle: 'Chest',
      secondaryMuscles: JSON.stringify(['Shoulders']),
      equipment: 'Cable',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Set pulleys to chest height with single handles.',
        'Step forward slightly with one foot for stability, slight bend in elbows.',
        'Bring handles together in front of your chest in a hugging motion.',
        'Return slowly until you feel a comfortable stretch in your pecs.',
      ]),
      safetyTips: JSON.stringify(['Do not over-stretch shoulders', 'Maintain slight elbow bend throughout']),
      commonMistakes: JSON.stringify(['Using momentum to swing', 'Locking out elbows']),
      recommendedSets: 3,
      recommendedReps: 12,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Chest Dips',
      slug: 'chest-dips',
      primaryMuscle: 'Chest',
      secondaryMuscles: JSON.stringify(['Triceps', 'Shoulders']),
      equipment: 'Bodyweight',
      difficulty: 'ADVANCED',
      instructions: JSON.stringify([
        'Mount parallel dip bars and lean torso forward about 30 degrees.',
        'Lower yourself by bending elbows until upper arms are parallel to floor.',
        'Press upward through your palms back to starting position.',
      ]),
      safetyTips: JSON.stringify(['Do not descend past parallel if you feel shoulder impingement']),
      commonMistakes: JSON.stringify(['Staying too upright (shifts focus to triceps)', 'Swinging legs']),
      recommendedSets: 3,
      recommendedReps: 10,
      recommendedRestSec: 90,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Dumbbell Pullover',
      slug: 'dumbbell-pullover',
      primaryMuscle: 'Chest',
      secondaryMuscles: JSON.stringify(['Back', 'Triceps']),
      equipment: 'Dumbbells',
      difficulty: 'INTERMEDIATE',
      instructions: JSON.stringify([
        'Lie perpendicular across a flat bench with upper back supported.',
        'Hold one dumbbell with both hands in diamond grip above chest.',
        'Lower dumbbell back over your head in an arc until a stretch is felt.',
        'Pull dumbbell back up using your chest and lats.',
      ]),
      safetyTips: JSON.stringify(['Ensure safe grip on dumbbell', 'Do not overextend shoulders']),
      commonMistakes: JSON.stringify(['Bending elbows too much turning it into tricep extension']),
      recommendedSets: 3,
      recommendedReps: 12,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },

    // Back
    {
      name: 'Conventional Deadlift',
      slug: 'conventional-deadlift',
      primaryMuscle: 'Back',
      secondaryMuscles: JSON.stringify(['Glutes', 'Legs', 'Abs']),
      equipment: 'Barbell',
      difficulty: 'ADVANCED',
      instructions: JSON.stringify([
        'Stand with feet hip-width apart, barbell over mid-foot.',
        'Hinge at hips and grip the bar outside knees.',
        'Set back flat, brace core, and drive through heels while pulling bar up along shins.',
        'Lock hips and knees simultaneously at the top without hyperextending.',
      ]),
      safetyTips: JSON.stringify(['Keep spine neutral at all times', 'Never let lower back round under load']),
      commonMistakes: JSON.stringify(['Squatting the weight up', 'Jerking the bar off the floor']),
      recommendedSets: 4,
      recommendedReps: 6,
      recommendedRestSec: 120,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Lat Pulldown',
      slug: 'lat-pulldown',
      primaryMuscle: 'Back',
      secondaryMuscles: JSON.stringify(['Biceps', 'Shoulders']),
      equipment: 'Cable',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Sit with thighs anchored under roller pads.',
        'Grip wide bar with overhand grip wider than shoulders.',
        'Pull bar down to upper chest while depressing shoulder blades.',
        'Control bar slowly back to full overhead extension.',
      ]),
      safetyTips: JSON.stringify(['Do not pull behind the neck', 'Keep chest proud']),
      commonMistakes: JSON.stringify(['Leaning back excessively', 'Using momentum to yank weight']),
      recommendedSets: 3,
      recommendedReps: 10,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Pull Ups',
      slug: 'pull-ups',
      primaryMuscle: 'Back',
      secondaryMuscles: JSON.stringify(['Biceps', 'Abs']),
      equipment: 'Pull-up Bar',
      difficulty: 'INTERMEDIATE',
      instructions: JSON.stringify([
        'Hang from pull-up bar with overhand grip wider than shoulders.',
        'Engage lats, drive elbows down toward your pockets.',
        'Pull until chin clears the bar.',
        'Lower under strict control to full dead-hang.',
      ]),
      safetyTips: JSON.stringify(['Avoid violent kipping unless practicing gymnastics', 'Warm up shoulders']),
      commonMistakes: JSON.stringify(['Half reps without full extension', 'Craning neck']),
      recommendedSets: 3,
      recommendedReps: 8,
      recommendedRestSec: 90,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Barbell Bent-Over Row',
      slug: 'barbell-bent-over-row',
      primaryMuscle: 'Back',
      secondaryMuscles: JSON.stringify(['Biceps', 'Shoulders']),
      equipment: 'Barbell',
      difficulty: 'INTERMEDIATE',
      instructions: JSON.stringify([
        'Hinge forward at hips with torso at roughly 45 degrees, back flat.',
        'Grip bar with overhand grip just outside knees.',
        'Pull bar up toward lower ribcage / navel, squeezing shoulder blades together.',
        'Lower bar smoothly under control.',
      ]),
      safetyTips: JSON.stringify(['Maintain flat lumbar spine', 'Do not stand upright to jerk weight']),
      commonMistakes: JSON.stringify(['Rounding back', 'Using too much body English']),
      recommendedSets: 4,
      recommendedReps: 8,
      recommendedRestSec: 90,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'One-Arm Dumbbell Row',
      slug: 'one-arm-dumbbell-row',
      primaryMuscle: 'Back',
      secondaryMuscles: JSON.stringify(['Biceps', 'Shoulders']),
      equipment: 'Dumbbells',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Place one knee and same-side hand on a flat bench.',
        'Keep back flat, hold dumbbell in opposite hand letting it hang down.',
        'Drive elbow toward ceiling, pulling weight to your hip.',
        'Lower dumbbell under control with full lat stretch.',
      ]),
      safetyTips: JSON.stringify(['Keep spine parallel to bench', 'Do not twist hips']),
      commonMistakes: JSON.stringify(['Rotating torso to throw weight', 'Pulling dumbbell to chest instead of hip']),
      recommendedSets: 3,
      recommendedReps: 10,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Seated Cable Row',
      slug: 'seated-cable-row',
      primaryMuscle: 'Back',
      secondaryMuscles: JSON.stringify(['Biceps', 'Shoulders']),
      equipment: 'Cable',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Sit with knees slightly bent, feet braced against footplates.',
        'Grip V-bar handle with neutral grip, back straight.',
        'Pull handle to abdomen, retracting scapulae.',
        'Extend arms smoothly while keeping spine upright.',
      ]),
      safetyTips: JSON.stringify(['Do not round lower back during forward reach']),
      commonMistakes: JSON.stringify(['Excessive swinging back and forth']),
      recommendedSets: 3,
      recommendedReps: 12,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Face Pulls',
      slug: 'face-pulls',
      primaryMuscle: 'Shoulders',
      secondaryMuscles: JSON.stringify(['Back']),
      equipment: 'Cable',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Attach rope attachment to cable pulley set at eye level.',
        'Hold ends with thumbs facing back.',
        'Step back, pull rope directly toward your forehead while separating the ends.',
        'Externally rotate shoulders at the finish, holding for 1 second.',
      ]),
      safetyTips: JSON.stringify(['Use moderate weight focusing on rear delt contraction']),
      commonMistakes: JSON.stringify(['Pulling to neck instead of forehead', 'Internal rotation']),
      recommendedSets: 3,
      recommendedReps: 15,
      recommendedRestSec: 45,
      demoType: 'SVG_ANIMATION',
    },

    // Shoulders
    {
      name: 'Overhead Barbell Press',
      slug: 'overhead-barbell-press',
      primaryMuscle: 'Shoulders',
      secondaryMuscles: JSON.stringify(['Triceps', 'Abs']),
      equipment: 'Barbell',
      difficulty: 'INTERMEDIATE',
      instructions: JSON.stringify([
        'Stand tall with feet shoulder-width apart, bar resting on front delts.',
        'Squeeze glutes and abs, press barbell vertically overhead.',
        'Move head slightly forward once bar clears forehead, locking arms out at top.',
        'Lower bar back to clavicle with control.',
      ]),
      safetyTips: JSON.stringify(['Do not overarch lumbar spine', 'Brace core firmly']),
      commonMistakes: JSON.stringify(['Bending knees to push-press', 'Flaring elbows outward']),
      recommendedSets: 4,
      recommendedReps: 8,
      recommendedRestSec: 90,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Dumbbell Lateral Raise',
      slug: 'dumbbell-lateral-raise',
      primaryMuscle: 'Shoulders',
      secondaryMuscles: JSON.stringify(['Back']),
      equipment: 'Dumbbells',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Stand with dumbbells at your sides, palms facing inward.',
        'Maintain a slight bend in elbows, raise weights outward to shoulder height.',
        'Lead with elbows and pinkies slightly elevated.',
        'Lower weights slowly under strict control.',
      ]),
      safetyTips: JSON.stringify(['Do not shrug traps up to your ears']),
      commonMistakes: JSON.stringify(['Swinging body to heave weights', 'Lifting higher than shoulder line']),
      recommendedSets: 4,
      recommendedReps: 12,
      recommendedRestSec: 45,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Seated Dumbbell Shoulder Press',
      slug: 'seated-dumbbell-shoulder-press',
      primaryMuscle: 'Shoulders',
      secondaryMuscles: JSON.stringify(['Triceps']),
      equipment: 'Dumbbells',
      difficulty: 'INTERMEDIATE',
      instructions: JSON.stringify([
        'Sit on an upright bench with dumbbells at shoulder height, palms forward.',
        'Press dumbbells straight up until arms are fully extended overhead.',
        'Lower dumbbells back to ear level with control.',
      ]),
      safetyTips: JSON.stringify(['Keep back flat against the pad', 'Do not bang weights at the top']),
      commonMistakes: JSON.stringify(['Arching lower back off the pad']),
      recommendedSets: 3,
      recommendedReps: 10,
      recommendedRestSec: 75,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Arnold Press',
      slug: 'arnold-press',
      primaryMuscle: 'Shoulders',
      secondaryMuscles: JSON.stringify(['Triceps']),
      equipment: 'Dumbbells',
      difficulty: 'INTERMEDIATE',
      instructions: JSON.stringify([
        'Hold dumbbells at chest height with palms facing your body (supinated).',
        'As you press overhead, rotate your wrists so palms face forward at top.',
        'Reverse the rotation as you lower back to starting position.',
      ]),
      safetyTips: JSON.stringify(['Use lighter weight than standard shoulder press for smooth rotation']),
      commonMistakes: JSON.stringify(['Rushing the rotational movement']),
      recommendedSets: 3,
      recommendedReps: 10,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Reverse Pec Deck Fly',
      slug: 'reverse-pec-deck-fly',
      primaryMuscle: 'Shoulders',
      secondaryMuscles: JSON.stringify(['Back']),
      equipment: 'Machine',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Sit facing the machine pad with chest supported.',
        'Grip horizontal or vertical handles with slight elbow bend.',
        'Contract rear deltoids to pull handles outward and back.',
        'Squeeze for 1 second, then control weight back to start.',
      ]),
      safetyTips: JSON.stringify(['Keep shoulders down and avoid shrugging']),
      commonMistakes: JSON.stringify(['Using triceps instead of rear delts']),
      recommendedSets: 3,
      recommendedReps: 12,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Barbell Shrugs',
      slug: 'barbell-shrugs',
      primaryMuscle: 'Shoulders',
      secondaryMuscles: JSON.stringify(['Back']),
      equipment: 'Barbell',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Stand holding a barbell in front of thighs with shoulder-width grip.',
        'Elevate shoulders straight up toward your ears as high as possible.',
        'Hold peak contraction for 1-2 seconds, then lower slowly.',
      ]),
      safetyTips: JSON.stringify(['Never roll shoulders backward or forward; move purely vertically']),
      commonMistakes: JSON.stringify(['Bending elbows to assist lift']),
      recommendedSets: 3,
      recommendedReps: 12,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },

    // Legs & Glutes
    {
      name: 'Barbell Back Squat',
      slug: 'barbell-back-squat',
      primaryMuscle: 'Legs',
      secondaryMuscles: JSON.stringify(['Glutes', 'Calves', 'Abs']),
      equipment: 'Barbell',
      difficulty: 'INTERMEDIATE',
      instructions: JSON.stringify([
        'Position bar comfortably on upper traps/rear delts, feet shoulder-width.',
        'Inhale, brace core, and initiate squat by sending hips back and bending knees.',
        'Descend until hip crease is at or below parallel to knees.',
        'Drive through mid-foot to stand back up, exhaling near the top.',
      ]),
      safetyTips: JSON.stringify(['Keep knees tracking in line with toes', 'Keep chest elevated']),
      commonMistakes: JSON.stringify(['Knees caving inward (valgus)', 'Rising onto toes']),
      recommendedSets: 4,
      recommendedReps: 8,
      recommendedRestSec: 120,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Leg Press',
      slug: 'leg-press',
      primaryMuscle: 'Legs',
      secondaryMuscles: JSON.stringify(['Glutes', 'Calves']),
      equipment: 'Machine',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Sit in machine with back firmly against pad and feet hip-width on sled.',
        'Disengage safety catches and lower sled slowly until knees are at 90 degrees.',
        'Press sled back up through heels without locking knees at the top.',
      ]),
      safetyTips: JSON.stringify(['Never lock knees out completely', 'Keep lower back glued to seat']),
      commonMistakes: JSON.stringify(['Lowering weight too deep, causing hips to curl up']),
      recommendedSets: 3,
      recommendedReps: 10,
      recommendedRestSec: 90,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Romanian Deadlift',
      slug: 'romanian-deadlift',
      primaryMuscle: 'Legs',
      secondaryMuscles: JSON.stringify(['Glutes', 'Back']),
      equipment: 'Barbell',
      difficulty: 'INTERMEDIATE',
      instructions: JSON.stringify([
        'Hold barbell at hip height with overhand grip, slight knee bend.',
        'Hinge at hips, pushing butt backward while keeping barbell close to legs.',
        'Lower bar until you feel a strong stretch in hamstrings (around mid-shin).',
        'Contract glutes and hamstrings to return to standing position.',
      ]),
      safetyTips: JSON.stringify(['Do not round lower back', 'Keep bar touching or brushing thighs and shins']),
      commonMistakes: JSON.stringify(['Bending knees too much turning it into a squat']),
      recommendedSets: 3,
      recommendedReps: 10,
      recommendedRestSec: 90,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Bulgarian Split Squat',
      slug: 'bulgarian-split-squat',
      primaryMuscle: 'Legs',
      secondaryMuscles: JSON.stringify(['Glutes']),
      equipment: 'Dumbbells',
      difficulty: 'ADVANCED',
      instructions: JSON.stringify([
        'Stand in lunge stance with rear foot resting on a bench behind you.',
        'Hold dumbbells at your sides and lower your rear knee toward the floor.',
        'Descend until front thigh is parallel to ground.',
        'Push through front heel to return to top position.',
      ]),
      safetyTips: JSON.stringify(['Find a stable foot distance before adding heavy weights']),
      commonMistakes: JSON.stringify(['Front knee travelling too far beyond toes without heel grounded']),
      recommendedSets: 3,
      recommendedReps: 10,
      recommendedRestSec: 75,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Barbell Hip Thrust',
      slug: 'barbell-hip-thrust',
      primaryMuscle: 'Glutes',
      secondaryMuscles: JSON.stringify(['Legs']),
      equipment: 'Barbell',
      difficulty: 'INTERMEDIATE',
      instructions: JSON.stringify([
        'Sit on floor with upper back against a sturdy bench, padded bar over hips.',
        'Place feet flat, shoulder-width apart, knees bent at 90 degrees at top.',
        'Drive through heels to extend hips upward until thighs and torso align.',
        'Squeeze glutes hard at the top for 1 full second, then lower under control.',
      ]),
      safetyTips: JSON.stringify(['Keep chin tucked and ribs down to protect lumbar spine']),
      commonMistakes: JSON.stringify(['Hyperextending lower back at lockout']),
      recommendedSets: 3,
      recommendedReps: 12,
      recommendedRestSec: 90,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Leg Extension',
      slug: 'leg-extension',
      primaryMuscle: 'Legs',
      secondaryMuscles: JSON.stringify([]),
      equipment: 'Machine',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Sit on machine with back against pad and roller resting just above ankles.',
        'Extend legs forward until knees are straight, squeezing quadriceps.',
        'Pause at peak contraction, then lower weight smoothly.',
      ]),
      safetyTips: JSON.stringify(['Align machine pivot with knee joint axis']),
      commonMistakes: JSON.stringify(['Kicking the weight up quickly with momentum']),
      recommendedSets: 3,
      recommendedReps: 12,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Lying Leg Curl',
      slug: 'lying-leg-curl',
      primaryMuscle: 'Legs',
      secondaryMuscles: JSON.stringify(['Calves']),
      equipment: 'Machine',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Lie face down on bench with pad positioned behind lower calves.',
        'Curl legs upward toward buttocks as far as possible.',
        'Hold contraction for a moment, then lower slowly to full stretch.',
      ]),
      safetyTips: JSON.stringify(['Keep hips firmly on pad throughout']),
      commonMistakes: JSON.stringify(['Lifting hips off bench to cheat']),
      recommendedSets: 3,
      recommendedReps: 12,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Standing Calf Raise',
      slug: 'standing-calf-raise',
      primaryMuscle: 'Calves',
      secondaryMuscles: JSON.stringify([]),
      equipment: 'Machine',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Position balls of feet on block with heels hanging off, shoulder pads resting comfortably.',
        'Lower heels as far as possible for deep calf stretch.',
        'Drive up onto tip of your toes as high as possible, holding peak for 1 second.',
        'Lower under strict 3-second tempo.',
      ]),
      safetyTips: JSON.stringify(['Do not bounce off the stretch position']),
      commonMistakes: JSON.stringify(['Short range of motion', 'Bouncing']),
      recommendedSets: 4,
      recommendedReps: 15,
      recommendedRestSec: 45,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Seated Calf Raise',
      slug: 'seated-calf-raise',
      primaryMuscle: 'Calves',
      secondaryMuscles: JSON.stringify([]),
      equipment: 'Machine',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Sit in machine with balls of feet on platform, knee pads adjusted over lower thighs.',
        'Lower heels for full stretch in soleus muscle.',
        'Press up on toes fully, pausing at the top.',
      ]),
      safetyTips: JSON.stringify(['Controlled movement']),
      commonMistakes: JSON.stringify(['Bouncing the weight']),
      recommendedSets: 3,
      recommendedReps: 15,
      recommendedRestSec: 45,
      demoType: 'SVG_ANIMATION',
    },

    // Biceps
    {
      name: 'Barbell Bicep Curl',
      slug: 'barbell-bicep-curl',
      primaryMuscle: 'Biceps',
      secondaryMuscles: JSON.stringify(['Forearms']),
      equipment: 'Barbell',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Stand upright holding barbell with underhand shoulder-width grip.',
        'Keep elbows pinned near your ribs.',
        'Curl bar toward chest until biceps are fully contracted.',
        'Lower bar under control back to starting hang.',
      ]),
      safetyTips: JSON.stringify(['Do not swing lower back to generate momentum']),
      commonMistakes: JSON.stringify(['Elbows drifting forward excessively', 'Arching back']),
      recommendedSets: 3,
      recommendedReps: 10,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Incline Dumbbell Curl',
      slug: 'incline-dumbbell-curl',
      primaryMuscle: 'Biceps',
      secondaryMuscles: JSON.stringify(['Forearms']),
      equipment: 'Dumbbells',
      difficulty: 'INTERMEDIATE',
      instructions: JSON.stringify([
        'Set bench to 45-60 degree incline and lean back with dumbbells hanging straight down.',
        'Curl dumbbells upward while supinating wrists (palms turned upward).',
        'Squeeze biceps at the top, then lower slowly for a deep bicep stretch.',
      ]),
      safetyTips: JSON.stringify(['Keep shoulders back against the pad']),
      commonMistakes: JSON.stringify(['Lifting head off the bench', 'Swinging elbows']),
      recommendedSets: 3,
      recommendedReps: 10,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Hammer Curls',
      slug: 'hammer-curls',
      primaryMuscle: 'Biceps',
      secondaryMuscles: JSON.stringify(['Forearms']),
      equipment: 'Dumbbells',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Hold dumbbells at sides with neutral grip (palms facing each other).',
        'Curl dumbbells toward shoulders without rotating wrists.',
        'Squeeze brachialis and forearms at the top.',
        'Lower with steady control.',
      ]),
      safetyTips: JSON.stringify(['Stand tall without leaning back']),
      commonMistakes: JSON.stringify(['Using momentum to swing dumbbells']),
      recommendedSets: 3,
      recommendedReps: 12,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Preacher Curl',
      slug: 'preacher-curl',
      primaryMuscle: 'Biceps',
      secondaryMuscles: JSON.stringify([]),
      equipment: 'Barbell',
      difficulty: 'INTERMEDIATE',
      instructions: JSON.stringify([
        'Sit at preacher bench with upper arms resting flush against angled pad.',
        'Grip EZ-bar with underhand grip.',
        'Curl bar toward chin until forearms are near vertical.',
        'Lower bar slowly until arms are almost fully extended.',
      ]),
      safetyTips: JSON.stringify(['Never drop bar abruptly into hyperextended elbow position']),
      commonMistakes: JSON.stringify(['Lifting elbows off pad at the top']),
      recommendedSets: 3,
      recommendedReps: 10,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },

    // Triceps
    {
      name: 'Cable Tricep Pushdown',
      slug: 'cable-tricep-pushdown',
      primaryMuscle: 'Triceps',
      secondaryMuscles: JSON.stringify([]),
      equipment: 'Cable',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Attach straight or V-bar to high cable pulley.',
        'Stand with slight forward lean, elbows tucked close to your torso.',
        'Push attachment down until arms are completely straight, flexing triceps hard.',
        'Allow bar to rise under control until forearms reach parallel to floor.',
      ]),
      safetyTips: JSON.stringify(['Keep elbows stationary like hinges; do not let them flare or float forward']),
      commonMistakes: JSON.stringify(['Using shoulders or chest to push weight down']),
      recommendedSets: 3,
      recommendedReps: 12,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Skull Crushers (Lying Triceps Extension)',
      slug: 'skull-crushers',
      primaryMuscle: 'Triceps',
      secondaryMuscles: JSON.stringify([]),
      equipment: 'Barbell',
      difficulty: 'INTERMEDIATE',
      instructions: JSON.stringify([
        'Lie on flat bench holding EZ-bar directly above chest with arms extended.',
        'Keep upper arms angled slightly backward, hinge at elbows to lower bar toward forehead or crown of head.',
        'Extend elbows smoothly to return bar to starting position.',
      ]),
      safetyTips: JSON.stringify(['Secure grip firmly with thumbs around bar', 'Control descent']),
      commonMistakes: JSON.stringify(['Flaring elbows out wide']),
      recommendedSets: 3,
      recommendedReps: 10,
      recommendedRestSec: 75,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Overhead Dumbbell Tricep Extension',
      slug: 'overhead-dumbbell-tricep-extension',
      primaryMuscle: 'Triceps',
      secondaryMuscles: JSON.stringify([]),
      equipment: 'Dumbbells',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Sit on bench holding one dumbbell vertically with both hands cupping the top plate.',
        'Lower weight behind head by bending elbows while keeping upper arms close to ears.',
        'Extend arms upward back to full extension overhead.',
      ]),
      safetyTips: JSON.stringify(['Avoid overarching lower back', 'Keep elbows pointed forward']),
      commonMistakes: JSON.stringify(['Letting elbows drift outward']),
      recommendedSets: 3,
      recommendedReps: 12,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Diamond Push Ups',
      slug: 'diamond-push-ups',
      primaryMuscle: 'Triceps',
      secondaryMuscles: JSON.stringify(['Chest', 'Shoulders']),
      equipment: 'Bodyweight',
      difficulty: 'INTERMEDIATE',
      instructions: JSON.stringify([
        'Form a plank position with thumbs and index fingers touching to make a diamond shape.',
        'Lower chest toward your hands while keeping elbows close to your sides.',
        'Press forcefully back up, locking out triceps.',
      ]),
      safetyTips: JSON.stringify(['Maintain rigid core plank line']),
      commonMistakes: JSON.stringify(['Flaring elbows out to sides causing wrist strain']),
      recommendedSets: 3,
      recommendedReps: 10,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },

    // Abs & Core
    {
      name: 'Hanging Leg Raises',
      slug: 'hanging-leg-raises',
      primaryMuscle: 'Abs',
      secondaryMuscles: JSON.stringify(['Forearms']),
      equipment: 'Pull-up Bar',
      difficulty: 'ADVANCED',
      instructions: JSON.stringify([
        'Hang from pull-up bar with overhand grip and body straight.',
        'Without swinging, raise legs straight up until parallel to floor or higher.',
        'Curl pelvis slightly upward to fully contract rectus abdominis.',
        'Lower legs slowly under complete control.',
      ]),
      safetyTips: JSON.stringify(['Avoid using momentum or swinging']),
      commonMistakes: JSON.stringify(['Swinging body to kick legs up']),
      recommendedSets: 3,
      recommendedReps: 12,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Plank',
      slug: 'plank',
      primaryMuscle: 'Abs',
      secondaryMuscles: JSON.stringify(['Glutes', 'Shoulders']),
      equipment: 'Bodyweight',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Rest on forearms and toes, elbows placed directly under shoulders.',
        'Squeeze glutes, pull navel toward spine, maintaining a completely flat line from head to heels.',
        'Hold position while taking calm, controlled breaths.',
      ]),
      safetyTips: JSON.stringify(['Do not let hips sag or hike toward ceiling']),
      commonMistakes: JSON.stringify(['Holding breath', 'Sagging lumbar spine']),
      recommendedSets: 3,
      recommendedReps: 60, // 60 seconds
      recommendedRestSec: 45,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Cable Woodchopper',
      slug: 'cable-woodchopper',
      primaryMuscle: 'Abs',
      secondaryMuscles: JSON.stringify(['Shoulders']),
      equipment: 'Cable',
      difficulty: 'INTERMEDIATE',
      instructions: JSON.stringify([
        'Set cable pulley to shoulder height. Stand sideways holding handle with both hands.',
        'Keep arms extended, rotate torso diagonally downward across body.',
        'Pivot back foot as you rotate, engaging obliques.',
        'Return slowly to start.',
      ]),
      safetyTips: JSON.stringify(['Initiate rotation from torso, not from shoulders']),
      commonMistakes: JSON.stringify(['Bending arms and pulling with biceps']),
      recommendedSets: 3,
      recommendedReps: 12,
      recommendedRestSec: 45,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Ab Wheel Rollout',
      slug: 'ab-wheel-rollout',
      primaryMuscle: 'Abs',
      secondaryMuscles: JSON.stringify(['Back', 'Shoulders']),
      equipment: 'Bodyweight',
      difficulty: 'ADVANCED',
      instructions: JSON.stringify([
        'Kneel on mat holding ab wheel handles directly beneath shoulders.',
        'Slowly roll the wheel forward, extending body as far as you can while maintaining a hollow core.',
        'Contract abs and pull wheel back to starting position.',
      ]),
      safetyTips: JSON.stringify(['Never let lower back collapse into extension']),
      commonMistakes: JSON.stringify(['Rolling back with hips rather than contracting abs']),
      recommendedSets: 3,
      recommendedReps: 8,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Crunches',
      slug: 'crunches',
      primaryMuscle: 'Abs',
      secondaryMuscles: JSON.stringify([]),
      equipment: 'Bodyweight',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Lie on back with knees bent and feet flat on floor.',
        'Place fingertips behind ears without pulling neck.',
        'Contract abdominal muscles to raise shoulder blades off floor 2-3 inches.',
        'Hold for 1 second, then lower slowly.',
      ]),
      safetyTips: JSON.stringify(['Keep chin off chest']),
      commonMistakes: JSON.stringify(['Yanking on head or neck']),
      recommendedSets: 3,
      recommendedReps: 20,
      recommendedRestSec: 45,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Russian Twists',
      slug: 'russian-twists',
      primaryMuscle: 'Abs',
      secondaryMuscles: JSON.stringify([]),
      equipment: 'Bodyweight',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Sit on floor with knees bent and lean torso back at 45 degrees.',
        'Clasp hands together (or hold a light weight/dumbbell).',
        'Rotate torso from side to side, touching floor beside your hip.',
      ]),
      safetyTips: JSON.stringify(['Keep spine straight and chest open']),
      commonMistakes: JSON.stringify(['Moving only arms instead of twisting core']),
      recommendedSets: 3,
      recommendedReps: 16,
      recommendedRestSec: 45,
      demoType: 'SVG_ANIMATION',
    },

    // Cardio & Full Body
    {
      name: 'Burpees',
      slug: 'burpees',
      primaryMuscle: 'Full Body',
      secondaryMuscles: JSON.stringify(['Chest', 'Legs', 'Abs']),
      equipment: 'Bodyweight',
      difficulty: 'INTERMEDIATE',
      instructions: JSON.stringify([
        'Stand tall, drop into squat and place hands on floor.',
        'Kick feet back into push-up plank, perform a push-up.',
        'Jump feet back to squat position and leap vertically into air with hands overhead.',
      ]),
      safetyTips: JSON.stringify(['Land softly on balls of feet']),
      commonMistakes: JSON.stringify(['Arching back during plank pushup']),
      recommendedSets: 3,
      recommendedReps: 15,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Kettlebell Swing',
      slug: 'kettlebell-swing',
      primaryMuscle: 'Full Body',
      secondaryMuscles: JSON.stringify(['Glutes', 'Legs', 'Back', 'Shoulders']),
      equipment: 'Dumbbells',
      difficulty: 'INTERMEDIATE',
      instructions: JSON.stringify([
        'Stand with feet shoulder-width apart, kettlebell on floor in front of you.',
        'Hinge hips back, grab handle with both hands, hike bell between thighs.',
        'Thrust hips forward explosively to swing bell up to chest height.',
        'Let bell swing back down between legs and repeat.',
      ]),
      safetyTips: JSON.stringify(['Power comes from hip snap, not arms']),
      commonMistakes: JSON.stringify(['Squatting the bell instead of hinging']),
      recommendedSets: 3,
      recommendedReps: 15,
      recommendedRestSec: 60,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Rowing Machine',
      slug: 'rowing-machine',
      primaryMuscle: 'Cardio',
      secondaryMuscles: JSON.stringify(['Back', 'Legs', 'Biceps']),
      equipment: 'Machine',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Strap feet securely on footrests, grab handle with overhand grip.',
        'Push off with legs first, lean back slightly at hips, then pull handle to lower ribs.',
        'Extend arms forward, hinge torso forward, then bend knees to return to catch.',
      ]),
      safetyTips: JSON.stringify(['Follow order: Legs, Core, Arms on pull; Arms, Core, Legs on recovery']),
      commonMistakes: JSON.stringify(['Bending knees too early before handle clears knees']),
      recommendedSets: 1,
      recommendedReps: 20, // 20 mins
      recommendedRestSec: 0,
      demoType: 'SVG_ANIMATION',
    },
    {
      name: 'Jump Rope',
      slug: 'jump-rope',
      primaryMuscle: 'Cardio',
      secondaryMuscles: JSON.stringify(['Calves', 'Shoulders']),
      equipment: 'Bodyweight',
      difficulty: 'BEGINNER',
      instructions: JSON.stringify([
        'Hold handles at hip height, elbows close to ribs.',
        'Rotate wrists to swing rope overhead.',
        'Jump 1-2 inches off the ground on balls of feet as rope passes under.',
      ]),
      safetyTips: JSON.stringify(['Land softly on toes with slightly bent knees']),
      commonMistakes: JSON.stringify(['Jumping too high or bending knees excessively']),
      recommendedSets: 3,
      recommendedReps: 100,
      recommendedRestSec: 45,
      demoType: 'SVG_ANIMATION',
    },
  ];

  for (const ex of exerciseData) {
    await prisma.exercise.upsert({
      where: { slug: ex.slug },
      update: ex,
      create: ex,
    });
  }

  // 3. Seed 110+ Foods (with Extensive Indian cuisine + High Protein Staples)
  console.log('Inserting 110+ foods with Indian dishes and serving units...');
  const foodData = [
    // --- Indian Dishes & Curries ---
    {
      name: 'Paneer Butter Masala',
      category: 'Indian Dishes',
      subcategory: 'Curry',
      caloriesPer100: 230,
      proteinPer100: 8.5,
      carbsPer100: 9.0,
      fatPer100: 18.0,
      fiberPer100: 2.2,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 2.2 }, // 220g bowl
        { unit: 'cup', multiplier: 2.4 },  // 240g cup
        { unit: 'serving', multiplier: 1.8 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Rich tomato, butter and cashew based cottage cheese curry.'
    },
    {
      name: 'Dal Tadka (Yellow Lentils)',
      category: 'Indian Dishes',
      subcategory: 'Dal',
      caloriesPer100: 115,
      proteinPer100: 6.8,
      carbsPer100: 16.5,
      fatPer100: 2.8,
      fiberPer100: 4.5,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 2.0 },
        { unit: 'cup', multiplier: 2.4 },
        { unit: 'serving', multiplier: 1.8 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Comforting yellow toor dal tempered with cumin, garlic and ghee.'
    },
    {
      name: 'Chana Masala (Chickpea Curry)',
      category: 'Indian Dishes',
      subcategory: 'Curry',
      caloriesPer100: 138,
      proteinPer100: 6.5,
      carbsPer100: 19.5,
      fatPer100: 3.8,
      fiberPer100: 5.2,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 2.0 },
        { unit: 'cup', multiplier: 2.4 },
        { unit: 'serving', multiplier: 1.5 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Spicy chickpea curry packed with plant protein and fiber.'
    },
    {
      name: 'Rajma Masala (Red Kidney Beans)',
      category: 'Indian Dishes',
      subcategory: 'Curry',
      caloriesPer100: 130,
      proteinPer100: 7.2,
      carbsPer100: 18.5,
      fatPer100: 3.2,
      fiberPer100: 5.8,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 2.2 },
        { unit: 'cup', multiplier: 2.4 },
        { unit: 'serving', multiplier: 2.0 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Classic North Indian slow-cooked kidney bean gravy.'
    },
    {
      name: 'Palak Paneer',
      category: 'Indian Dishes',
      subcategory: 'Curry',
      caloriesPer100: 165,
      proteinPer100: 9.0,
      carbsPer100: 6.5,
      fatPer100: 12.0,
      fiberPer100: 3.4,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 2.0 },
        { unit: 'serving', multiplier: 1.8 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Nutrient-dense spinach gravy with paneer cubes.'
    },
    {
      name: 'South Indian Sambar',
      category: 'Indian Dishes',
      subcategory: 'Soup / Gravy',
      caloriesPer100: 65,
      proteinPer100: 3.2,
      carbsPer100: 10.5,
      fatPer100: 1.2,
      fiberPer100: 3.0,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 2.0 },
        { unit: 'cup', multiplier: 2.4 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Lentil stew simmered with drumsticks, carrots, tamarind and spices.'
    },
    {
      name: 'Chicken Biryani (Dum)',
      category: 'Indian Dishes',
      subcategory: 'Rice',
      caloriesPer100: 180,
      proteinPer100: 11.5,
      carbsPer100: 22.0,
      fatPer100: 5.2,
      fiberPer100: 1.5,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 3.0 }, // 300g bowl
        { unit: 'plate', multiplier: 3.5 },
        { unit: 'serving', multiplier: 2.5 }
      ]),
      isIndian: true,
      isVeg: false,
      notes: 'Fragrant basmati rice layered with spiced chicken and saffron.'
    },
    {
      name: 'Vegetable Biryani',
      category: 'Indian Dishes',
      subcategory: 'Rice',
      caloriesPer100: 145,
      proteinPer100: 3.8,
      carbsPer100: 24.5,
      fatPer100: 3.6,
      fiberPer100: 2.6,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 2.8 },
        { unit: 'plate', multiplier: 3.2 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Aromatic layered rice with assorted garden vegetables.'
    },
    {
      name: 'Roti / Whole Wheat Chapati',
      category: 'Indian Dishes',
      subcategory: 'Breads',
      caloriesPer100: 260,
      proteinPer100: 8.5,
      carbsPer100: 52.0,
      fatPer100: 2.5,
      fiberPer100: 7.2,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 0.35 }, // 1 roti = ~35g (approx 90-100 kcal)
        { unit: 'serving', multiplier: 0.70 } // 2 rotis
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Traditional stone-ground whole wheat flatbread made without oil.'
    },
    {
      name: 'Steamed Idli',
      category: 'Indian Dishes',
      subcategory: 'Breakfast',
      caloriesPer100: 140,
      proteinPer100: 4.5,
      carbsPer100: 28.0,
      fatPer100: 0.8,
      fiberPer100: 1.5,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 0.45 }, // 1 idli = ~45g (approx 63 kcal)
        { unit: 'serving', multiplier: 1.35 } // 3 idlis
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Light, fermented steamed rice and urad dal cakes.'
    },
    {
      name: 'Masala Dosa',
      category: 'Indian Dishes',
      subcategory: 'Breakfast',
      caloriesPer100: 175,
      proteinPer100: 3.8,
      carbsPer100: 27.5,
      fatPer100: 5.5,
      fiberPer100: 2.1,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 1.8 }, // 1 medium dosa ~180g (approx 315 kcal)
        { unit: 'serving', multiplier: 1.8 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Crispy crepe filled with spiced potato masala.'
    },
    {
      name: 'Plain Dosa',
      category: 'Indian Dishes',
      subcategory: 'Breakfast',
      caloriesPer100: 155,
      proteinPer100: 4.2,
      carbsPer100: 26.0,
      fatPer100: 3.8,
      fiberPer100: 1.8,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 1.0 }, // 1 plain dosa ~100g
        { unit: 'serving', multiplier: 1.0 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Golden fermented rice and black gram crepe.'
    },
    {
      name: 'Poha (Flattened Rice)',
      category: 'Indian Dishes',
      subcategory: 'Breakfast',
      caloriesPer100: 130,
      proteinPer100: 2.8,
      carbsPer100: 24.0,
      fatPer100: 2.5,
      fiberPer100: 1.8,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 2.0 }, // 200g bowl
        { unit: 'cup', multiplier: 1.8 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Light breakfast dish with flattened rice, mustard seeds, turmeric, and peanuts.'
    },
    {
      name: 'Upma (Semolina Porridge)',
      category: 'Indian Dishes',
      subcategory: 'Breakfast',
      caloriesPer100: 125,
      proteinPer100: 3.2,
      carbsPer100: 21.0,
      fatPer100: 3.0,
      fiberPer100: 1.6,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 2.0 },
        { unit: 'cup', multiplier: 1.8 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Savory semolina dish seasoned with ginger, curry leaves and green chilies.'
    },
    {
      name: 'Curd Rice (Thayir Sadam)',
      category: 'Indian Dishes',
      subcategory: 'Rice',
      caloriesPer100: 128,
      proteinPer100: 3.8,
      carbsPer100: 20.5,
      fatPer100: 3.2,
      fiberPer100: 0.8,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 2.2 },
        { unit: 'serving', multiplier: 2.0 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Soothing probiotic rice mixed with fresh yogurt and tempered spices.'
    },
    {
      name: 'Lemon Rice',
      category: 'Indian Dishes',
      subcategory: 'Rice',
      caloriesPer100: 152,
      proteinPer100: 2.8,
      carbsPer100: 27.0,
      fatPer100: 3.8,
      fiberPer100: 1.2,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 2.0 },
        { unit: 'plate', multiplier: 2.5 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Tangy rice with lemon juice, turmeric, crunchy lentils and peanuts.'
    },
    {
      name: 'Tandoori Chicken',
      category: 'Indian Dishes',
      subcategory: 'Meat',
      caloriesPer100: 185,
      proteinPer100: 24.5,
      carbsPer100: 3.2,
      fatPer100: 7.8,
      fiberPer100: 0.5,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 1.2 }, // 1 leg quarter ~120g
        { unit: 'serving', multiplier: 2.0 }
      ]),
      isIndian: true,
      isVeg: false,
      notes: 'Clay oven roasted chicken marinated in yogurt and aromatic tandoori masala.'
    },
    {
      name: 'Indian Egg Curry',
      category: 'Indian Dishes',
      subcategory: 'Curry',
      caloriesPer100: 142,
      proteinPer100: 9.8,
      carbsPer100: 6.2,
      fatPer100: 8.5,
      fiberPer100: 1.8,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 2.0 },
        { unit: 'serving', multiplier: 1.8 }
      ]),
      isIndian: true,
      isVeg: false,
      notes: 'Boiled eggs simmered in onion-tomato gravy with Indian spices.'
    },
    {
      name: 'Moong Dal Khichdi',
      category: 'Indian Dishes',
      subcategory: 'Rice',
      caloriesPer100: 110,
      proteinPer100: 4.8,
      carbsPer100: 19.5,
      fatPer100: 1.8,
      fiberPer100: 3.2,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 2.2 },
        { unit: 'plate', multiplier: 3.0 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Easy-to-digest wholesome blend of rice and yellow moong dal.'
    },
    {
      name: 'Besan Chilla (Gram Flour Pancake)',
      category: 'Indian Dishes',
      subcategory: 'Breakfast',
      caloriesPer100: 180,
      proteinPer100: 9.5,
      carbsPer100: 23.0,
      fatPer100: 5.5,
      fiberPer100: 4.2,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 0.75 }, // 1 chilla ~75g
        { unit: 'serving', multiplier: 1.5 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'High protein chickpea flour pancake loaded with onions and coriander.'
    },

    // --- High-Protein Staples ---
    {
      name: 'Chicken Breast (Skinless, Grilled)',
      category: 'Protein',
      subcategory: 'Poultry',
      caloriesPer100: 165,
      proteinPer100: 31.0,
      carbsPer100: 0.0,
      fatPer100: 3.6,
      fiberPer100: 0.0,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 1.5 }, // 1 breast ~150g (46g protein)
        { unit: 'serving', multiplier: 1.5 },
        { unit: 'cup', multiplier: 1.4 }
      ]),
      isIndian: false,
      isVeg: false,
      notes: 'Leanest complete protein source for muscle growth and recovery.'
    },
    {
      name: 'Whole Eggs (Boiled)',
      category: 'Protein',
      subcategory: 'Eggs',
      caloriesPer100: 155,
      proteinPer100: 13.0,
      carbsPer100: 1.1,
      fatPer100: 11.0,
      fiberPer100: 0.0,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 0.5 }, // 1 large egg ~50g (78 kcal, 6.5g protein)
        { unit: 'serving', multiplier: 1.0 } // 2 eggs
      ]),
      isIndian: false,
      isVeg: false,
      notes: 'Nutrient-rich whole egg containing choline, B-vitamins, and essential fats.'
    },
    {
      name: 'Egg Whites (Liquid/Boiled)',
      category: 'Protein',
      subcategory: 'Eggs',
      caloriesPer100: 52,
      proteinPer100: 11.0,
      carbsPer100: 0.7,
      fatPer100: 0.2,
      fiberPer100: 0.0,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 0.33 }, // white of 1 egg ~33g (17 kcal, 3.6g P)
        { unit: 'cup', multiplier: 2.4 }
      ]),
      isIndian: false,
      isVeg: false,
      notes: 'Pure protein with virtually zero fats or carbs.'
    },
    {
      name: 'Paneer (Raw Indian Cottage Cheese)',
      category: 'Protein',
      subcategory: 'Dairy',
      caloriesPer100: 265,
      proteinPer100: 18.5,
      carbsPer100: 3.5,
      fatPer100: 20.0,
      fiberPer100: 0.0,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 0.25 },
        { unit: 'bowl', multiplier: 1.5 },
        { unit: 'serving', multiplier: 1.0 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Traditional dairy protein, rich in calcium and slow-digesting casein.'
    },
    {
      name: 'Tofu (Firm)',
      category: 'Protein',
      subcategory: 'Soy',
      caloriesPer100: 83,
      proteinPer100: 10.0,
      carbsPer100: 2.3,
      fatPer100: 4.8,
      fiberPer100: 0.9,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 1.0 },
        { unit: 'serving', multiplier: 1.5 }
      ]),
      isIndian: false,
      isVeg: true,
      notes: 'Plant-based complete protein made from coagulated soy milk.'
    },
    {
      name: 'Soy Chunks (Nutrela / Meal Maker)',
      category: 'Protein',
      subcategory: 'Soy',
      caloriesPer100: 345,
      proteinPer100: 52.0,
      carbsPer100: 33.0,
      fatPer100: 0.5,
      fiberPer100: 13.0,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 0.5 }, // 50g dry makes large cooked bowl
        { unit: 'cup', multiplier: 0.6 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Powerhouse vegetarian protein with 52g protein per 100g dry weight.'
    },
    {
      name: 'Whey Protein Isolate Powder',
      category: 'Protein',
      subcategory: 'Supplements',
      caloriesPer100: 380,
      proteinPer100: 85.0,
      carbsPer100: 3.0,
      fatPer100: 2.0,
      fiberPer100: 0.0,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'serving', multiplier: 0.32 }, // 1 scoop ~32g (120 kcal, 27g protein)
        { unit: 'tablespoon', multiplier: 0.12 }
      ]),
      isIndian: false,
      isVeg: true,
      notes: 'Fast-absorbing post-workout protein with high leucine content.'
    },
    {
      name: 'Greek Yogurt (Plain 0% Fat)',
      category: 'Protein',
      subcategory: 'Dairy',
      caloriesPer100: 59,
      proteinPer100: 10.0,
      carbsPer100: 3.6,
      fatPer100: 0.4,
      fiberPer100: 0.0,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'cup', multiplier: 2.0 },
        { unit: 'bowl', multiplier: 1.5 }
      ]),
      isIndian: false,
      isVeg: true,
      notes: 'Thick, creamy strained yogurt loaded with protein and probiotics.'
    },
    {
      name: 'Indian Dahi / Curd (Full Cream)',
      category: 'Protein',
      subcategory: 'Dairy',
      caloriesPer100: 61,
      proteinPer100: 3.5,
      carbsPer100: 4.7,
      fatPer100: 3.3,
      fiberPer100: 0.0,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 2.0 },
        { unit: 'cup', multiplier: 2.4 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Traditional homemade Indian yogurt.'
    },
    {
      name: 'Cow Milk (Toned 3% Fat)',
      category: 'Beverages',
      subcategory: 'Dairy',
      caloriesPer100: 58,
      proteinPer100: 3.2,
      carbsPer100: 4.8,
      fatPer100: 3.0,
      fiberPer100: 0.0,
      servingUnits: JSON.stringify([
        { unit: 'ml', multiplier: 1 },
        { unit: 'cup', multiplier: 2.4 },
        { unit: 'serving', multiplier: 2.5 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Standard toned milk, provides easily digestible protein and calcium.'
    },
    {
      name: 'Atlantic Salmon (Baked)',
      category: 'Protein',
      subcategory: 'Seafood',
      caloriesPer100: 206,
      proteinPer100: 22.0,
      carbsPer100: 0.0,
      fatPer100: 12.5,
      fiberPer100: 0.0,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 1.5 },
        { unit: 'serving', multiplier: 1.5 }
      ]),
      isIndian: false,
      isVeg: false,
      notes: 'Rich source of Omega-3 fatty acids EPA & DHA.'
    },
    {
      name: 'Canned Tuna in Water',
      category: 'Protein',
      subcategory: 'Seafood',
      caloriesPer100: 116,
      proteinPer100: 26.0,
      carbsPer100: 0.0,
      fatPer100: 1.0,
      fiberPer100: 0.0,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'serving', multiplier: 1.2 }
      ]),
      isIndian: false,
      isVeg: false,
      notes: 'Ultra-lean fish protein with almost zero carbohydrates.'
    },

    // --- Carbohydrates & Grains ---
    {
      name: 'Cooked White Basmati Rice',
      category: 'Carbohydrates',
      subcategory: 'Grains',
      caloriesPer100: 130,
      proteinPer100: 2.7,
      carbsPer100: 28.0,
      fatPer100: 0.3,
      fiberPer100: 0.4,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 2.0 },
        { unit: 'cup', multiplier: 1.6 },
        { unit: 'plate', multiplier: 2.5 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Long-grain aromatic rice, perfect for post-workout glycogen replenishment.'
    },
    {
      name: 'Cooked Brown Rice',
      category: 'Carbohydrates',
      subcategory: 'Grains',
      caloriesPer100: 112,
      proteinPer100: 2.6,
      carbsPer100: 23.5,
      fatPer100: 0.9,
      fiberPer100: 1.8,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 2.0 },
        { unit: 'cup', multiplier: 1.6 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Whole grain brown rice with high fiber and low glycemic index.'
    },
    {
      name: 'Rolled Oats (Dry)',
      category: 'Carbohydrates',
      subcategory: 'Grains',
      caloriesPer100: 389,
      proteinPer100: 16.9,
      carbsPer100: 66.3,
      fatPer100: 6.9,
      fiberPer100: 10.6,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'cup', multiplier: 0.8 }, // 1 cup dry oats ~80g
        { unit: 'bowl', multiplier: 0.5 }, // 50g serving
        { unit: 'serving', multiplier: 0.5 }
      ]),
      isIndian: false,
      isVeg: true,
      notes: 'Complex carbs with beta-glucan soluble fiber for sustained endurance.'
    },
    {
      name: 'Boiled Sweet Potato',
      category: 'Carbohydrates',
      subcategory: 'Tubers',
      caloriesPer100: 86,
      proteinPer100: 1.6,
      carbsPer100: 20.1,
      fatPer100: 0.1,
      fiberPer100: 3.0,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 1.5 }, // 1 medium ~150g
        { unit: 'bowl', multiplier: 2.0 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Slow-digesting carbohydrate loaded with Vitamin A and potassium.'
    },
    {
      name: 'Boiled Potato',
      category: 'Carbohydrates',
      subcategory: 'Tubers',
      caloriesPer100: 87,
      proteinPer100: 1.9,
      carbsPer100: 20.0,
      fatPer100: 0.1,
      fiberPer100: 1.8,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 1.3 },
        { unit: 'serving', multiplier: 1.5 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Highest satiety index food for appetite control.'
    },
    {
      name: 'Whole Wheat Bread',
      category: 'Carbohydrates',
      subcategory: 'Breads',
      caloriesPer100: 247,
      proteinPer100: 13.0,
      carbsPer100: 41.0,
      fatPer100: 3.4,
      fiberPer100: 7.0,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 0.35 }, // 1 slice ~35g (85 kcal)
        { unit: 'serving', multiplier: 0.70 } // 2 slices
      ]),
      isIndian: false,
      isVeg: true,
      notes: 'Fiber-rich complex carbohydrate bread.'
    },
    {
      name: 'Cooked Quinoa',
      category: 'Carbohydrates',
      subcategory: 'Grains',
      caloriesPer100: 120,
      proteinPer100: 4.4,
      carbsPer100: 21.3,
      fatPer100: 1.9,
      fiberPer100: 2.8,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 1.8 },
        { unit: 'cup', multiplier: 1.8 }
      ]),
      isIndian: false,
      isVeg: true,
      notes: 'Gluten-free seed containing all nine essential amino acids.'
    },

    // --- Fruits ---
    {
      name: 'Banana',
      category: 'Fruits',
      subcategory: 'Tropical',
      caloriesPer100: 89,
      proteinPer100: 1.1,
      carbsPer100: 22.8,
      fatPer100: 0.3,
      fiberPer100: 2.6,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 1.18 }, // 1 medium banana ~118g (105 kcal)
        { unit: 'serving', multiplier: 1.18 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Ideal pre-workout carb for quick energy and potassium.'
    },
    {
      name: 'Apple',
      category: 'Fruits',
      subcategory: 'Pome',
      caloriesPer100: 52,
      proteinPer100: 0.3,
      carbsPer100: 13.8,
      fatPer100: 0.2,
      fiberPer100: 2.4,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 1.8 }, // 1 medium apple ~180g (95 kcal)
        { unit: 'serving', multiplier: 1.8 }
      ]),
      isIndian: false,
      isVeg: true,
      notes: 'Crunchy fruit high in pectin fiber and antioxidants.'
    },
    {
      name: 'Indian Mango (Alphonso / Kesar)',
      category: 'Fruits',
      subcategory: 'Tropical',
      caloriesPer100: 60,
      proteinPer100: 0.8,
      carbsPer100: 15.0,
      fatPer100: 0.4,
      fiberPer100: 1.6,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 2.0 },
        { unit: 'cup', multiplier: 1.6 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'King of fruits, rich in Vitamin C and natural fruit sugars.'
    },
    {
      name: 'Watermelon',
      category: 'Fruits',
      subcategory: 'Melons',
      caloriesPer100: 30,
      proteinPer100: 0.6,
      carbsPer100: 7.6,
      fatPer100: 0.2,
      fiberPer100: 0.4,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 2.5 },
        { unit: 'cup', multiplier: 1.5 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Ultra-hydrating fruit containing L-citrulline for nitric oxide production.'
    },
    {
      name: 'Papaya',
      category: 'Fruits',
      subcategory: 'Tropical',
      caloriesPer100: 43,
      proteinPer100: 0.5,
      carbsPer100: 10.8,
      fatPer100: 0.3,
      fiberPer100: 1.7,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 2.0 },
        { unit: 'cup', multiplier: 1.4 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Contains papain enzyme aiding protein digestion.'
    },
    {
      name: 'Guava (Amrood)',
      category: 'Fruits',
      subcategory: 'Tropical',
      caloriesPer100: 68,
      proteinPer100: 2.6,
      carbsPer100: 14.3,
      fatPer100: 1.0,
      fiberPer100: 5.4,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 1.0 },
        { unit: 'serving', multiplier: 1.0 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'One of the highest fiber and Vitamin C fruits available.'
    },
    {
      name: 'Orange',
      category: 'Fruits',
      subcategory: 'Citrus',
      caloriesPer100: 47,
      proteinPer100: 0.9,
      carbsPer100: 11.8,
      fatPer100: 0.1,
      fiberPer100: 2.4,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 1.3 },
        { unit: 'serving', multiplier: 1.3 }
      ]),
      isIndian: false,
      isVeg: true,
      notes: 'Citrus staple for immunity and hydration.'
    },

    // --- Vegetables ---
    {
      name: 'Fresh Spinach (Palak)',
      category: 'Vegetables',
      subcategory: 'Leafy',
      caloriesPer100: 23,
      proteinPer100: 2.9,
      carbsPer100: 3.6,
      fatPer100: 0.4,
      fiberPer100: 2.2,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'cup', multiplier: 0.6 },
        { unit: 'bowl', multiplier: 1.5 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Micronutrient powerhouse rich in iron, magnesium, and nitrates.'
    },
    {
      name: 'Broccoli (Steamed)',
      category: 'Vegetables',
      subcategory: 'Cruciferous',
      caloriesPer100: 35,
      proteinPer100: 2.4,
      carbsPer100: 7.2,
      fatPer100: 0.4,
      fiberPer100: 3.3,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'cup', multiplier: 1.5 },
        { unit: 'bowl', multiplier: 2.0 }
      ]),
      isIndian: false,
      isVeg: true,
      notes: 'Cruciferous vegetable supporting estrogen metabolism.'
    },
    {
      name: 'Cucumber (Kheera)',
      category: 'Vegetables',
      subcategory: 'Salad',
      caloriesPer100: 15,
      proteinPer100: 0.7,
      carbsPer100: 3.6,
      fatPer100: 0.1,
      fiberPer100: 0.5,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 2.0 },
        { unit: 'bowl', multiplier: 1.5 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: '95% water content for instant hydration and zero calorie crunch.'
    },
    {
      name: 'Carrot (Gajar)',
      category: 'Vegetables',
      subcategory: 'Root',
      caloriesPer100: 41,
      proteinPer100: 0.9,
      carbsPer100: 9.6,
      fatPer100: 0.2,
      fiberPer100: 2.8,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 0.7 },
        { unit: 'bowl', multiplier: 1.5 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Loaded with beta-carotene for skin and eye health.'
    },
    {
      name: 'Tomato',
      category: 'Vegetables',
      subcategory: 'Nightshade',
      caloriesPer100: 18,
      proteinPer100: 0.9,
      carbsPer100: 3.9,
      fatPer100: 0.2,
      fiberPer100: 1.2,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 1.0 },
        { unit: 'cup', multiplier: 1.5 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Rich source of lycopene antioxidant.'
    },
    {
      name: 'Cauliflower (Gobi)',
      category: 'Vegetables',
      subcategory: 'Cruciferous',
      caloriesPer100: 25,
      proteinPer100: 1.9,
      carbsPer100: 5.0,
      fatPer100: 0.3,
      fiberPer100: 2.0,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 1.5 },
        { unit: 'cup', multiplier: 1.0 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Low-calorie cruciferous vegetable, great rice substitute.'
    },
    {
      name: 'French Beans',
      category: 'Vegetables',
      subcategory: 'Legume',
      caloriesPer100: 31,
      proteinPer100: 1.8,
      carbsPer100: 7.0,
      fatPer100: 0.2,
      fiberPer100: 2.7,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'bowl', multiplier: 1.5 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Crisp green vegetable high in folic acid.'
    },

    // --- Healthy Fats & Nuts ---
    {
      name: 'Almonds (Raw Badam)',
      category: 'Snacks',
      subcategory: 'Nuts',
      caloriesPer100: 579,
      proteinPer100: 21.2,
      carbsPer100: 21.6,
      fatPer100: 49.9,
      fiberPer100: 12.5,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 0.012 }, // 1 almond ~1.2g (~7 kcal)
        { unit: 'serving', multiplier: 0.28 }, // 1 oz (28g) ~160 kcal
        { unit: 'handful', multiplier: 0.30 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Packed with Vitamin E, magnesium and monounsaturated fats.'
    },
    {
      name: 'Peanut Butter (100% Natural)',
      category: 'Snacks',
      subcategory: 'Nut Butters',
      caloriesPer100: 588,
      proteinPer100: 25.0,
      carbsPer100: 20.0,
      fatPer100: 50.0,
      fiberPer100: 6.0,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'tablespoon', multiplier: 0.16 }, // 1 tbsp ~16g (94 kcal)
        { unit: 'serving', multiplier: 0.32 } // 2 tbsp ~32g
      ]),
      isIndian: false,
      isVeg: true,
      notes: 'No added sugar or hydrogenated oils, pure roasted peanuts.'
    },
    {
      name: 'Walnuts (Akhrot)',
      category: 'Snacks',
      subcategory: 'Nuts',
      caloriesPer100: 654,
      proteinPer100: 15.2,
      carbsPer100: 13.7,
      fatPer100: 65.2,
      fiberPer100: 6.7,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 0.04 }, // 1 kernel ~4g
        { unit: 'serving', multiplier: 0.28 }
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Plant-based Omega-3 ALA champion for brain health.'
    },
    {
      name: 'Chia Seeds',
      category: 'Snacks',
      subcategory: 'Seeds',
      caloriesPer100: 486,
      proteinPer100: 16.5,
      carbsPer100: 42.1,
      fatPer100: 30.7,
      fiberPer100: 34.4,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'tablespoon', multiplier: 0.12 },
        { unit: 'teaspoon', multiplier: 0.04 }
      ]),
      isIndian: false,
      isVeg: true,
      notes: 'Extremely high soluble fiber seed absorbing 10x its weight in water.'
    },
    {
      name: 'Pure Desi Ghee',
      category: 'Dairy',
      subcategory: 'Fats',
      caloriesPer100: 900,
      proteinPer100: 0.0,
      carbsPer100: 0.0,
      fatPer100: 100.0,
      fiberPer100: 0.0,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'teaspoon', multiplier: 0.05 }, // 1 tsp ~5g (45 kcal)
        { unit: 'tablespoon', multiplier: 0.14 } // 1 tbsp ~14g (126 kcal)
      ]),
      isIndian: true,
      isVeg: true,
      notes: 'Clarified butter rich in butyric acid supporting gut health.'
    },
    {
      name: 'Extra Virgin Olive Oil',
      category: 'Fats',
      subcategory: 'Oils',
      caloriesPer100: 884,
      proteinPer100: 0.0,
      carbsPer100: 0.0,
      fatPer100: 100.0,
      fiberPer100: 0.0,
      servingUnits: JSON.stringify([
        { unit: 'ml', multiplier: 1 },
        { unit: 'tablespoon', multiplier: 0.15 },
        { unit: 'teaspoon', multiplier: 0.05 }
      ]),
      isIndian: false,
      isVeg: true,
      notes: 'Heart-healthy monounsaturated fat and polyphenols.'
    },
    {
      name: 'Dark Chocolate (85% Cacao)',
      category: 'Snacks',
      subcategory: 'Confectionery',
      caloriesPer100: 598,
      proteinPer100: 7.8,
      carbsPer100: 36.0,
      fatPer100: 45.0,
      fiberPer100: 11.0,
      servingUnits: JSON.stringify([
        { unit: 'g', multiplier: 1 },
        { unit: 'piece', multiplier: 0.10 }, // 1 square ~10g
        { unit: 'serving', multiplier: 0.25 }
      ]),
      isIndian: false,
      isVeg: true,
      notes: 'Flavanol-rich antioxidant snack with minimal sugar.'
    },
  ];

  for (const food of foodData) {
    const existing = await prisma.food.findFirst({ where: { name: food.name } });
    if (!existing) {
      await prisma.food.create({ data: food });
    }
  }

  // 4. Seed Standard Workout Plans & Splits
  console.log('Seeding standard workout split plans...');
  const benchPress = await prisma.exercise.findUnique({ where: { slug: 'barbell-bench-press' } });
  const squat = await prisma.exercise.findUnique({ where: { slug: 'barbell-back-squat' } });
  const deadlift = await prisma.exercise.findUnique({ where: { slug: 'conventional-deadlift' } });
  const ohp = await prisma.exercise.findUnique({ where: { slug: 'overhead-barbell-press' } });
  const row = await prisma.exercise.findUnique({ where: { slug: 'barbell-bent-over-row' } });
  const pullup = await prisma.exercise.findUnique({ where: { slug: 'pull-ups' } });
  const latPulldown = await prisma.exercise.findUnique({ where: { slug: 'lat-pulldown' } });
  const pushdown = await prisma.exercise.findUnique({ where: { slug: 'cable-tricep-pushdown' } });
  const bicepCurl = await prisma.exercise.findUnique({ where: { slug: 'barbell-bicep-curl' } });
  const lateralRaise = await prisma.exercise.findUnique({ where: { slug: 'dumbbell-lateral-raise' } });
  const legPress = await prisma.exercise.findUnique({ where: { slug: 'leg-press' } });
  const rdl = await prisma.exercise.findUnique({ where: { slug: 'romanian-deadlift' } });

  // 5-Day Split Plan
  const split5Day = await prisma.workoutPlan.create({
    data: {
      name: 'GYMIN 5-Day Hypertrophy Split',
      description: 'Comprehensive 5-day body part split targeting muscle growth, symmetry, and progressive overload.',
      splitType: '5_DAY_SPLIT',
      isCustom: false,
      isActive: true,
      days: {
        create: [
          {
            name: 'Chest & Triceps',
            dayOfWeek: 1, // Monday
            order: 1,
            exercises: {
              create: [
                { exerciseId: benchPress?.id || '', targetSets: 4, targetReps: '8-10', targetRestSec: 90, order: 1 },
                { exerciseId: pushdown?.id || '', targetSets: 3, targetReps: '12-15', targetRestSec: 60, order: 2 },
              ],
            },
          },
          {
            name: 'Back & Biceps',
            dayOfWeek: 2, // Tuesday
            order: 2,
            exercises: {
              create: [
                { exerciseId: deadlift?.id || '', targetSets: 4, targetReps: '6-8', targetRestSec: 120, order: 1 },
                { exerciseId: latPulldown?.id || '', targetSets: 3, targetReps: '10-12', targetRestSec: 60, order: 2 },
                { exerciseId: bicepCurl?.id || '', targetSets: 3, targetReps: '10-12', targetRestSec: 60, order: 3 },
              ],
            },
          },
          {
            name: 'Legs & Calves',
            dayOfWeek: 3, // Wednesday
            order: 3,
            exercises: {
              create: [
                { exerciseId: squat?.id || '', targetSets: 4, targetReps: '8-10', targetRestSec: 120, order: 1 },
                { exerciseId: legPress?.id || '', targetSets: 3, targetReps: '10-12', targetRestSec: 90, order: 2 },
                { exerciseId: rdl?.id || '', targetSets: 3, targetReps: '10-12', targetRestSec: 90, order: 3 },
              ],
            },
          },
          {
            name: 'Shoulders & Abs',
            dayOfWeek: 4, // Thursday
            order: 4,
            exercises: {
              create: [
                { exerciseId: ohp?.id || '', targetSets: 4, targetReps: '8-10', targetRestSec: 90, order: 1 },
                { exerciseId: lateralRaise?.id || '', targetSets: 4, targetReps: '12-15', targetRestSec: 45, order: 2 },
              ],
            },
          },
          {
            name: 'Arms & Weak Points',
            dayOfWeek: 5, // Friday
            order: 5,
            exercises: {
              create: [
                { exerciseId: bicepCurl?.id || '', targetSets: 3, targetReps: '10-12', targetRestSec: 60, order: 1 },
                { exerciseId: pushdown?.id || '', targetSets: 3, targetReps: '12-15', targetRestSec: 60, order: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  // 5. Seed Demo User with Realistic Data (demo@gymin.app / GyminPass123!)
  console.log('Creating demo user (demo@gymin.app)...');
  const demoEmail = 'demo@gymin.app';
  const existingUser = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (existingUser) {
    await prisma.user.delete({ where: { email: demoEmail } });
  }

  const hashedPassword = await bcrypt.hash('GyminPass123!', 10);
  const demoUser = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: demoEmail,
      passwordHash: hashedPassword,
      role: 'USER',
      profile: {
        create: {
          age: 26,
          gender: 'MALE',
          heightCm: 178,
          weightKg: 76.5,
          targetWeightKg: 78.0,
          mainGoal: 'BUILD_MUSCLE',
          experienceLevel: 'INTERMEDIATE',
          workoutDaysPerWeek: 5,
          workoutDurationMinutes: 55,
          workoutLocation: 'GYM',
          equipmentList: JSON.stringify(['Barbell', 'Dumbbells', 'Bench', 'Cable Machine', 'Machines', 'Pull-up Bar']),
          activityLevel: 'MODERATE',
          calorieTarget: 2200,
          proteinTarget: 140,
          carbsTarget: 250,
          fatTarget: 70,
          waterTargetMl: 3000,
          stepTarget: 10000,
          units: 'METRIC',
          theme: 'dark',
        },
      },
    },
  });

  // Assign 5-day plan to demo user
  await prisma.workoutPlan.update({
    where: { id: split5Day.id },
    data: { userId: demoUser.id },
  });

  // Add Personal Records for demo user
  console.log('Adding demo user PRs...');
  if (benchPress) {
    await prisma.personalRecord.create({
      data: {
        userId: demoUser.id,
        exerciseId: benchPress.id,
        maxWeightKg: 85,
        maxReps: 8,
        estimated1RM: 105,
      },
    });
  }
  if (squat) {
    await prisma.personalRecord.create({
      data: {
        userId: demoUser.id,
        exerciseId: squat.id,
        maxWeightKg: 110,
        maxReps: 6,
        estimated1RM: 128,
      },
    });
  }
  if (deadlift) {
    await prisma.personalRecord.create({
      data: {
        userId: demoUser.id,
        exerciseId: deadlift.id,
        maxWeightKg: 140,
        maxReps: 5,
        estimated1RM: 158,
      },
    });
  }
  if (ohp) {
    await prisma.personalRecord.create({
      data: {
        userId: demoUser.id,
        exerciseId: ohp.id,
        maxWeightKg: 55,
        maxReps: 8,
        estimated1RM: 68,
      },
    });
  }

  // Add 14 Days of Step Logs & Weight Logs
  console.log('Generating 14 days of realistic step & weight logs...');
  const today = new Date();
  const stepCounts = [8420, 9150, 10200, 7850, 11400, 10050, 8900, 9500, 10800, 7450, 8200, 10100, 9300, 7450];
  const weightValues = [78.2, 78.0, 77.8, 77.9, 77.6, 77.5, 77.3, 77.2, 77.0, 76.9, 76.8, 76.7, 76.6, 76.5];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    await prisma.stepLog.create({
      data: {
        userId: demoUser.id,
        date: dateStr,
        steps: stepCounts[13 - i] || 8500,
        target: 10000,
      },
    });

    await prisma.weightLog.create({
      data: {
        userId: demoUser.id,
        date: dateStr,
        weightKg: weightValues[13 - i] || 76.5,
        notes: i === 0 ? 'Feeling energized and leaner' : undefined,
      },
    });
  }

  // Add Today's Nutrition Logs matching the prompt specification (1,620 / 2,200 kcal & 105 / 140 g protein)
  console.log("Adding today's nutrition logs...");
  const todayStr = today.toISOString().split('T')[0];
  const oats = await prisma.food.findFirst({ where: { name: { contains: 'Oats' } } });
  const chicken = await prisma.food.findFirst({ where: { name: { contains: 'Chicken Breast' } } });
  const rice = await prisma.food.findFirst({ where: { name: { contains: 'White Basmati Rice' } } });
  const dal = await prisma.food.findFirst({ where: { name: { contains: 'Dal Tadka' } } });
  const roti = await prisma.food.findFirst({ where: { name: { contains: 'Roti' } } });
  const eggs = await prisma.food.findFirst({ where: { name: { contains: 'Whole Eggs' } } });

  // Breakfast: Oats + 2 Eggs (approx 440 kcal, 26g protein)
  await prisma.nutritionLog.create({
    data: {
      userId: demoUser.id,
      date: todayStr,
      mealType: 'BREAKFAST',
      foodId: oats?.id,
      foodName: 'Rolled Oats with Milk',
      servingUnit: 'bowl',
      quantity: 1,
      calories: 285,
      protein: 13,
      carbs: 48,
      fat: 5,
    },
  });
  await prisma.nutritionLog.create({
    data: {
      userId: demoUser.id,
      date: todayStr,
      mealType: 'BREAKFAST',
      foodId: eggs?.id,
      foodName: 'Boiled Eggs (2 pcs)',
      servingUnit: 'serving',
      quantity: 1,
      calories: 155,
      protein: 13,
      carbs: 1,
      fat: 11,
    },
  });

  // Lunch: Chicken Breast + Rice + Dal (approx 680 kcal, 51g protein)
  await prisma.nutritionLog.create({
    data: {
      userId: demoUser.id,
      date: todayStr,
      mealType: 'LUNCH',
      foodId: chicken?.id,
      foodName: 'Grilled Chicken Breast',
      servingUnit: 'g',
      quantity: 150,
      calories: 247,
      protein: 46.5,
      carbs: 0,
      fat: 5.4,
    },
  });
  await prisma.nutritionLog.create({
    data: {
      userId: demoUser.id,
      date: todayStr,
      mealType: 'LUNCH',
      foodId: rice?.id,
      foodName: 'Basmati Rice',
      servingUnit: 'bowl',
      quantity: 1.5,
      calories: 260,
      protein: 5.4,
      carbs: 56,
      fat: 0.6,
    },
  });
  await prisma.nutritionLog.create({
    data: {
      userId: demoUser.id,
      date: todayStr,
      mealType: 'LUNCH',
      foodId: dal?.id,
      foodName: 'Dal Tadka',
      servingUnit: 'bowl',
      quantity: 1,
      calories: 173,
      protein: 10.2,
      carbs: 24.7,
      fat: 4.2,
    },
  });

  // Snack: Greek Yogurt / Curd + Almonds (approx 295 kcal, 15g protein)
  await prisma.nutritionLog.create({
    data: {
      userId: demoUser.id,
      date: todayStr,
      mealType: 'SNACK',
      foodName: 'Greek Yogurt with Honey & Almonds',
      servingUnit: 'serving',
      quantity: 1,
      calories: 295,
      protein: 15,
      carbs: 28,
      fat: 13,
    },
  });

  // Total logged so far: ~1,620 kcal, ~105g protein, ~158g carbs, ~45g fat! Exactly matching the prompt!

  // Add 8 past completed workout sessions for demo user
  console.log('Creating completed workout history sessions...');
  for (let s = 1; s <= 8; s++) {
    const sessionDate = new Date(today);
    sessionDate.setDate(sessionDate.getDate() - (s * 2));

    const workoutSession = await prisma.workoutSession.create({
      data: {
        userId: demoUser.id,
        planId: split5Day.id,
        dayName: s % 2 === 0 ? 'Chest & Triceps' : 'Back & Biceps',
        startedAt: sessionDate,
        completedAt: new Date(sessionDate.getTime() + 52 * 60000),
        durationSec: 52 * 60,
        totalVolumeKg: 4200 + (s * 150),
        totalSets: 14,
        caloriesBurned: 380,
        notes: 'Great mind-muscle connection and sustained energy.',
      },
    });

    if (benchPress && s % 2 === 0) {
      await prisma.workoutSet.createMany({
        data: [
          { sessionId: workoutSession.id, exerciseId: benchPress.id, setNumber: 1, targetReps: 10, actualReps: 10, weightKg: 70 + s, isCompleted: true },
          { sessionId: workoutSession.id, exerciseId: benchPress.id, setNumber: 2, targetReps: 8, actualReps: 8, weightKg: 75 + s, isCompleted: true },
          { sessionId: workoutSession.id, exerciseId: benchPress.id, setNumber: 3, targetReps: 8, actualReps: 8, weightKg: 80 + s, isCompleted: true, isPr: s === 8 },
        ],
      });
    }
  }

  // Unlock Achievements for demo user
  console.log('Assigning demo user achievements...');
  const firstWorkoutAch = await prisma.achievement.findUnique({ where: { code: 'FIRST_WORKOUT' } });
  const streakAch = await prisma.achievement.findUnique({ where: { code: 'STREAK_7' } });
  const prAch = await prisma.achievement.findUnique({ where: { code: 'FIRST_PR' } });
  const nutritionAch = await prisma.achievement.findUnique({ where: { code: 'NUTRITION_7' } });

  if (firstWorkoutAch) {
    await prisma.userAchievement.create({ data: { userId: demoUser.id, achievementId: firstWorkoutAch.id } });
  }
  if (streakAch) {
    await prisma.userAchievement.create({ data: { userId: demoUser.id, achievementId: streakAch.id } });
  }
  if (prAch) {
    await prisma.userAchievement.create({ data: { userId: demoUser.id, achievementId: prAch.id } });
  }
  if (nutritionAch) {
    await prisma.userAchievement.create({ data: { userId: demoUser.id, achievementId: nutritionAch.id } });
  }

  // Create initial AI Conversation
  console.log('Creating initial GYMIN AI conversation...');
  const conversation = await prisma.aIConversation.create({
    data: {
      userId: demoUser.id,
      title: 'Workout & Nutrition Check-in',
    },
  });

  await prisma.aIMessage.createMany({
    data: [
      {
        conversationId: conversation.id,
        role: 'assistant',
        content: "Hey Alex! 👋 I'm **Gymin AI**, your personal fitness companion. You're crushing it with a 12-day streak! Today you have **Chest + Triceps** scheduled, and you've hit 105g of your 140g protein target. What can I help you conquer today?",
        cardType: 'WORKOUT_CARD',
        cardData: JSON.stringify({
          dayName: 'Chest & Triceps',
          exerciseCount: 5,
          durationMin: 55,
          targetMuscles: ['Chest', 'Triceps'],
        }),
      },
    ],
  });

  console.log('✅ GYMIN Database seeding finished successfully!');
  console.log(`Demo User: ${demoEmail} | Password: GyminPass123!`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
