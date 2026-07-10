const fs = require('fs');
const path = require('path');

const qPath = path.join(__dirname, 'masterData', 'quizzesAndConfig.ts');
let content = fs.readFileSync(qPath, 'utf8');

const newQuizzes = [];
const newQuizAnswerKeys = [];

for (let i = 1; i <= 7; i++) {
  newQuizzes.push(`
  "quiz_auto_${i}": {
    id: "quiz_auto_${i}",
    title: "Generated Quiz ${i}",
    description: "A professional quiz generated for MVP seeding.",
    skillIds: ["skill_javascript", "skill_react"],
    difficultyLevel: "intermediate",
    questions: {
      "q1": {
        id: "q1",
        questionText: "What is the output of 2 + 2?",
        options: ["3", "4", "5", "6"]
      },
      "q2": {
        id: "q2",
        questionText: "Which of the following is a Javascript framework?",
        options: ["React", "Laravel", "Django", "Flask"]
      }
    },
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }`);

  newQuizAnswerKeys.push(`
  "quiz_auto_${i}": {
    quizId: "quiz_auto_${i}",
    questions: {
      "q1": {
        correctOptionIndex: 1,
        explanation: "2 + 2 = 4."
      },
      "q2": {
        correctOptionIndex: 0,
        explanation: "React is a Javascript library/framework."
      }
    },
    updatedAt: now,
  }`);
}
const newQuizzesStr = newQuizzes.join(',');
const newQuizAnswerKeysStr = newQuizAnswerKeys.join(',');

content = content.replace(/(export const quizzes: Record<ID, Quiz> = \{[\s\S]*?)(};\s*export const quizAnswerKeys)/, (match, p1, p2) => {
  return p1.replace(/,\s*$/, '') + `,${newQuizzesStr}\n` + p2;
});

content = content.replace(/(export const quizAnswerKeys: Record<ID, QuizAnswerKey> = \{[\s\S]*?)(};\s*export const announcements)/, (match, p1, p2) => {
  return p1.replace(/,\s*$/, '') + `,${newQuizAnswerKeysStr}\n` + p2;
});

fs.writeFileSync(qPath, content, 'utf8');
console.log('Added 7 quizzes and answer keys.');
