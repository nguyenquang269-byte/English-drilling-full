const fs = require('fs');
const appJs = fs.readFileSync('app.js', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');

const idRegex = /document\.getElementById\(["']([^"']+)["']\)/g;
let match;
const foundIds = new Set();
const missingIds = [];

while ((match = idRegex.exec(appJs)) !== null) {
  const id = match[1];
  foundIds.add(id);
  const regex = new RegExp(`id=["']${id}["']`);
  if (!regex.test(indexHtml)) {
    missingIds.push(id);
  }
}

console.log('Total unique IDs checked:', foundIds.size);
console.log('Missing IDs:', missingIds);
