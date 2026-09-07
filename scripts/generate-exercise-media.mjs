import fs from 'fs';
import path from 'path';
import https from 'https';

const exercisesDatasetUrl = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/data/exercises.json';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(destPath);
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching hasaneyldrm/exercises-dataset exercises.json...');
  const dataset = await fetchJson(exercisesDatasetUrl);
  console.log(`Loaded ${dataset.length} exercises from dataset.`);

  // Load our seed.ts file to get all exercise slugs & names
  const seedContent = fs.readFileSync('prisma/seed.ts', 'utf8');
  const nameRegex = /name:\s*['"]([^'"]+)['"],\s*slug:\s*['"]([^'"]+)['"]/g;
  const exercises = [];
  let match;
  while ((match = nameRegex.exec(seedContent)) !== null) {
    exercises.push({ name: match[1], slug: match[2] });
  }
  console.log(`Extracted ${exercises.length} exercises from seed.ts.`);

  const mappings = {};
  const publicDir = path.resolve('public/animations');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Pre-defined high accuracy matches
  const customQueryMap = {
    'barbell-bench-press': 'barbell bench press',
    'incline-dumbbell-press': 'dumbbell incline bench press',
    'push-ups': 'push-up',
    'cable-chest-flyes': 'cable bench press',
    'chest-dips': 'chest dip',
    'dumbbell-pullover': 'dumbbell pullover',
    'conventional-deadlift': 'barbell deadlift',
    'lat-pulldown': 'cable pulldown',
    'pull-ups': 'pull-up',
    'barbell-bent-over-row': 'barbell bent over row',
    'one-arm-dumbbell-row': 'dumbbell one arm bent-over row',
    'seated-cable-row': 'cable seated row',
    'face-pulls': 'cable rear delt row (with rope)',
    'overhead-barbell-press': 'barbell seated overhead press',
    'dumbbell-lateral-raise': 'dumbbell lateral raise',
    'seated-dumbbell-shoulder-press': 'dumbbell seated shoulder press',
    'arnold-press': 'arnold press',
    'reverse-pec-deck-fly': 'lever seated reverse fly',
    'barbell-shrugs': 'barbell shrug',
    'barbell-back-squat': 'barbell full squat',
    'leg-press': 'sled 45° leg press (side pov)',
    'romanian-deadlift': 'barbell romanian deadlift',
    'bulgarian-split-squat': 'dumbbell single leg split squat',
    'barbell-hip-thrust': 'barbell glute bridge',
    'leg-extension': 'lever leg extension',
    'lying-leg-curl': 'lever lying leg curl',
    'standing-calf-raise': 'barbell standing calf raise',
    'seated-calf-raise': 'lever seated calf raise',
    'barbell-bicep-curl': 'barbell curl',
    'incline-dumbbell-curl': 'dumbbell incline biceps curl',
    'hammer-curls': 'dumbbell alternate hammer preacher curl',
    'preacher-curl': 'barbell lying preacher curl',
    'cable-tricep-pushdown': 'cable pushdown',
    'skull-crushers': 'barbell decline close grip to skull press',
    'overhead-dumbbell-tricep-extension': 'dumbbell standing triceps extension',
    'diamond-push-ups': 'diamond push-up',
    'hanging-leg-raises': 'hanging leg raise',
    'plank': 'front plank with twist',
    'cable-woodchopper': 'cable twist (up-down)',
    'ab-wheel-rollout': 'wheel rollerout',
    'crunches': '3/4 sit-up',
    'russian-twists': 'weighted russian twist',
    'burpees': 'burpee',
    'kettlebell-swing': 'kettlebell swing',
    'rowing-machine': 'cable seated row',
    'jump-rope': 'jump rope'
  };

  for (const ex of exercises) {
    const query = customQueryMap[ex.slug] || ex.name.toLowerCase();
    
    // Find best match in dataset
    let found = dataset.find(item => item.name.toLowerCase() === query);
    if (!found) {
      found = dataset.find(item => item.name.toLowerCase().includes(query) || query.includes(item.name.toLowerCase()));
    }
    if (!found) {
      // Fuzzy keywords
      const words = query.split(' ');
      found = dataset.find(item => words.filter(w => w.length > 3).every(w => item.name.toLowerCase().includes(w)));
    }

    if (found) {
      const cdnGifUrl = `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/${found.gif_url}`;
      const cdnImgUrl = `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/${found.image}`;
      const localGifPath = `/animations/${ex.slug}.gif`;
      const localDiskPath = path.join(publicDir, `${ex.slug}.gif`);

      mappings[ex.slug] = {
        name: ex.name,
        datasetName: found.name,
        target: found.target,
        bodyPart: found.body_part,
        localGif: localGifPath,
        cdnGif: cdnGifUrl,
        cdnImage: cdnImgUrl,
      };

      // Download file if not exists
      if (!fs.existsSync(localDiskPath)) {
        try {
          console.log(`Downloading ${ex.slug}... (${found.name})`);
          await downloadFile(cdnGifUrl, localDiskPath);
        } catch (err) {
          console.warn(`Could not download ${ex.slug}:`, err.message);
        }
      }
    } else {
      console.warn(`No match found for: ${ex.name} (${ex.slug})`);
    }
  }

  // Write TypeScript mapping file
  const tsContent = `// Auto-generated GymVisual Real Human Anatomy Exercise Media Mappings
export interface ExerciseMedia {
  name: string;
  datasetName: string;
  target: string;
  bodyPart: string;
  localGif: string;
  cdnGif: string;
  cdnImage: string;
}

export const EXERCISE_MEDIA_MAP: Record<string, ExerciseMedia> = ${JSON.stringify(mappings, null, 2)};

export function getExerciseMedia(slugOrName: string): ExerciseMedia | null {
  const clean = slugOrName.toLowerCase().trim().replace(/\\s+/g, '-');
  if (EXERCISE_MEDIA_MAP[clean]) return EXERCISE_MEDIA_MAP[clean];

  for (const [key, val] of Object.entries(EXERCISE_MEDIA_MAP)) {
    if (key.includes(clean) || clean.includes(key) || val.name.toLowerCase().includes(slugOrName.toLowerCase())) {
      return val;
    }
  }
  return null;
}
`;

  fs.writeFileSync('lib/exercises/exercise-media.ts', tsContent, 'utf8');
  console.log(`Successfully mapped and saved ${Object.keys(mappings).length} exercises to lib/exercises/exercise-media.ts`);
}

main().catch(console.error);
