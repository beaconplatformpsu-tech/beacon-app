const fs = require('fs');
const path = require('path');

const ppPath = path.join(__dirname, 'masterData', 'practiceAndProjects.ts');
let content = fs.readFileSync(ppPath, 'utf8');

const replacements = {
  'cp_fullstack': 'path_fullstack_dev',
  'skill_nodejs': 'skill_javascript'
};

for (const [key, value] of Object.entries(replacements)) {
  content = content.replace(new RegExp(key, 'g'), value);
}

fs.writeFileSync(ppPath, content, 'utf8');
console.log('Fixed IDs in practiceAndProjects.ts');
