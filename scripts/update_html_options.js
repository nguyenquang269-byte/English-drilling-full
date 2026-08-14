const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'app.js');
const indexHtmlPath = path.join(__dirname, '..', 'index.html');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const match = appJs.match(/const LESSON_LIST = (\[[\s\S]*?\]);/);

if (!match) {
  console.error("Could not find LESSON_LIST in app.js");
  process.exit(1);
}

const lessons = eval(match[1]);

let optionsHtml = '<option value="">-- Vui lòng chọn bài học (1 - 100) --</option>\n';
lessons.forEach((l, idx) => {
  optionsHtml += `          <option value="${l.file}">[Bài ${idx + 1}] ${l.name}</option>\n`;
});

let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
indexHtml = indexHtml.replace(
  /<select id="lessonSelector">[\s\S]*?<\/select>/,
  `<select id="lessonSelector">\n${optionsHtml}        </select>`
);

fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
console.log('Successfully pre-rendered 100 options in index.html!');
