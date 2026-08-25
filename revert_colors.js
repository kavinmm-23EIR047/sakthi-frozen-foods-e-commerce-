const fs = require('fs');
const path = require('path');

const directories = ['app', 'components'];

const colorMap = {
  '#D84315': '#4D583F',
  '#FFF3E0': '#EAF0E5',
  '#2C3E50': '#1E201D',
  '#bf3a11': '#414b35',
  'border-[#D84315]': 'border-[#4D583F]',
  'bg-[#D84315]': 'bg-[#4D583F]',
  'text-[#D84315]': 'text-[#4D583F]',
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const [find, replace] of Object.entries(colorMap)) {
        if (content.includes(find)) {
          content = content.split(find).join(replace);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated colors in ${fullPath}`);
      }
    }
  }
}

for (const dir of directories) {
  const fullDirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullDirPath)) {
    processDirectory(fullDirPath);
  }
}
console.log('Done!');
