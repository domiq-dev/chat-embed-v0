const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const unprocessedDirectives = ['@tailwind base;', '@tailwind components;', '@tailwind utilities;'];

function findCssFiles(dir) {
  let cssFiles = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      cssFiles = cssFiles.concat(findCssFiles(filePath));
    } else if (filePath.endsWith('.css')) {
      cssFiles.push(filePath);
    }
  }
  return cssFiles;
}

console.log('Starting Tailwind CSS build check...');

try {
  console.log('Running production build (npm run build)...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Production build finished.');

  const cssDir = path.join(__dirname, '..', '.next', 'static', 'css');
  if (!fs.existsSync(cssDir)) {
    console.error('Error: .next/static/css directory not found after build.');
    process.exit(1);
  }

  const cssFiles = findCssFiles(cssDir);
  if (cssFiles.length === 0) {
    console.error('Error: No CSS files found in .next/static/css.');
    process.exit(1);
  }

  console.log(`Found CSS files: ${cssFiles.join(', ')}`);

  let issuesFound = false;
  for (const cssFile of cssFiles) {
    const content = fs.readFileSync(cssFile, 'utf-8');
    for (const directive of unprocessedDirectives) {
      if (content.includes(directive)) {
        console.error(`Error: Found unprocessed directive "${directive}" in ${cssFile}`);
        issuesFound = true;
      }
    }
  }

  if (issuesFound) {
    console.error('Tailwind CSS directives were not processed correctly.');
    process.exit(1);
  }

  console.log('Tailwind CSS build check passed! Directives seem processed.');
  process.exit(0);
} catch (error) {
  console.error('An error occurred during the build or check process:', error);
  process.exit(1);
}
