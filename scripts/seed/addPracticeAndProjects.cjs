const fs = require('fs');
const path = require('path');

const ppPath = path.join(__dirname, 'masterData', 'practiceAndProjects.ts');
let content = fs.readFileSync(ppPath, 'utf8');

const newTasks = [];
for (let i = 1; i <= 13; i++) {
  newTasks.push(`
  "task_auto_${i}": {
    id: "task_auto_${i}",
    title: "Generated Practice Task ${i}",
    description: "A professional practice task generated for MVP seeding.",
    instructions: "Complete the requirements outlined in the resources.",
    skillIds: ["skill_javascript", "skill_python"],
    difficultyLevel: "intermediate",
    estimatedTimeMinutes: 30 + ${i} * 5,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }`);
}
const newTasksStr = newTasks.join(',');

content = content.replace(/(export const practiceTasks: Record<ID, PracticeTask> = \{[\s\S]*?)(};\s*export const projects)/, (match, p1, p2) => {
  return p1.replace(/,\s*$/, '') + `,${newTasksStr}\n` + p2;
});


const newProjects = [];
for (let i = 1; i <= 8; i++) {
  newProjects.push(`
  "proj_auto_${i}": {
    id: "proj_auto_${i}",
    title: "Generated Project ${i}",
    description: "A comprehensive project for portfolio building.",
    requirements: ["Requirement 1", "Requirement 2", "Requirement 3"],
    skillIds: ["skill_react", "skill_nodejs"],
    careerPathIds: ["cp_fullstack"],
    difficultyLevel: "advanced",
    estimatedHours: 10 + ${i},
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }`);
}
const newProjectsStr = newProjects.join(',');

content = content.replace(/(export const projects: Record<ID, Project> = \{[\s\S]*?)(};\s*)/, (match, p1, p2) => {
  return p1.replace(/,\s*$/, '') + `,${newProjectsStr}\n` + p2;
});

fs.writeFileSync(ppPath, content, 'utf8');
console.log('Added 13 practice tasks and 8 projects.');
