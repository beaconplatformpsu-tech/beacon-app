const fs = require('fs');
const path = require('path');

const resourcesPath = path.join(__dirname, 'masterData', 'resources.ts');
let content = fs.readFileSync(resourcesPath, 'utf8');

const replacements = {
  'ac_computer_science': 'cat_academic_cs',
  'cp_devops': 'path_cloud_architect',
  'cp_frontend': 'path_frontend_dev',
  'skill_architecture': 'skill_python',
  'cp_backend': 'path_backend_dev',
  'cp_fullstack': 'path_fullstack_dev',
  'cp_cloud': 'path_cloud_architect',
  'ac_software_engineering': 'cat_academic_cs'
};

for (const [key, value] of Object.entries(replacements)) {
  content = content.replace(new RegExp(key, 'g'), value);
}

fs.writeFileSync(resourcesPath, content, 'utf8');
console.log('Fixed IDs in resources.ts');
