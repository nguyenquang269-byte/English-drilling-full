const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const exercisesDir = path.join(dataDir, 'exercises');

const allLessons = {};
const allExercises = {};

for (let i = 1; i <= 100; i++) {
  const pad = String(i).padStart(3, '0');
  const lessonFileName = `lesson-${pad}.json`;
  const lessonPath = path.join(dataDir, lessonFileName);
  if (fs.existsSync(lessonPath)) {
    allLessons[lessonFileName] = JSON.parse(fs.readFileSync(lessonPath, 'utf8'));
  }

  const exFileName = `exercise-${pad}.json`;
  const exPath = path.join(exercisesDir, exFileName);
  if (fs.existsSync(exPath)) {
    allExercises[exFileName] = JSON.parse(fs.readFileSync(exPath, 'utf8'));
  }
}

const bundleContent = `// Auto-generated lesson and exercise bundle for 100% offline & CORS-free execution
window.HOCDRILL_LESSONS = ${JSON.stringify(allLessons)};
window.HOCDRILL_EXERCISES = ${JSON.stringify(allExercises)};
`;

const bundlePath = path.join(dataDir, 'lessons-bundle.js');
fs.writeFileSync(bundlePath, bundleContent, 'utf8');

console.log(`Successfully generated lessons-bundle.js: ${Object.keys(allLessons).length} lessons, ${Object.keys(allExercises).length} exercises bundled!`);
