import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedFiles = 0;
const componentsDir = path.join(process.cwd(), 'src', 'components');

walkDir(componentsDir, (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Replace basic hex values
    content = content.replace(/#2D151F/gi, 'accounting-text');
    content = content.replace(/#F4F3DC/gi, 'accounting-bg');
    
    // Fix Tailwind arbitrary values like bg-[#2D151F] which incorrectly become bg-[accounting-text]
    content = content.replace(/([a-z]+)-\[accounting-text\]/gi, '$1-accounting-text');
    content = content.replace(/([a-z]+)-\[accounting-bg\]/gi, '$1-accounting-bg');

    // Edge case for text-[#2D151F]/40 replacing alpha
    content = content.replace(/-accounting-text\/([0-9]+)/gi, '-accounting-text/$1');

    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedFiles++;
    }
  }
});

console.log(`Replaced colors in ${modifiedFiles} files.`);
