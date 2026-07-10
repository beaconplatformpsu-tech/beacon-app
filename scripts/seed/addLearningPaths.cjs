const fs = require('fs');
const path = require('path');

const lpPath = path.join(__dirname, 'masterData', 'learningPaths.ts');
let content = fs.readFileSync(lpPath, 'utf8');

const newLps = `
  "lp_devops_mastery": {
    id: "lp_devops_mastery",
    title: "DevOps Engineering Mastery",
    description: "Go from basics to advanced DevOps practices including Docker, Kubernetes, and CI/CD.",
    careerPathId: "cp_devops",
    difficultyLevel: "advanced",
    estimatedDuration: "60 hours",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  "lp_data_science_intro": {
    id: "lp_data_science_intro",
    title: "Introduction to Data Science",
    description: "Learn Python, Pandas, and basic Machine Learning algorithms.",
    careerPathId: "cp_data_science",
    difficultyLevel: "beginner",
    estimatedDuration: "40 hours",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  "lp_cloud_architecture": {
    id: "lp_cloud_architecture",
    title: "Cloud Architecture Foundations",
    description: "Understand scalable cloud design using AWS.",
    careerPathId: "cp_cloud",
    difficultyLevel: "intermediate",
    estimatedDuration: "50 hours",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }`;

// Replace learningPaths
content = content.replace(/(export const learningPaths: Record<ID, LearningPath> = \{[\s\S]*?)(};\s*export const learningPathSteps)/, (match, p1, p2) => {
  return p1.replace(/,\s*$/, '') + `,${newLps}\n` + p2;
});

const newSteps = `
  // DevOps Steps
  "lps_devops_1": {
    id: "lps_devops_1",
    learningPathId: "lp_devops_mastery",
    type: "resource",
    title: "Docker Deep Dive",
    description: "Understand containerization basics.",
    resourceId: "res_docker_deep_dive",
    sortOrder: 1,
    isRequired: true,
    createdAt: now,
    updatedAt: now,
  },
  "lps_devops_2": {
    id: "lps_devops_2",
    learningPathId: "lp_devops_mastery",
    type: "resource",
    title: "Kubernetes Up and Running",
    description: "Learn orchestration.",
    resourceId: "res_k8s_up_and_running",
    sortOrder: 2,
    isRequired: true,
    createdAt: now,
    updatedAt: now,
  },
  // Data Science Steps
  "lps_ds_1": {
    id: "lps_ds_1",
    learningPathId: "lp_data_science_intro",
    type: "resource",
    title: "Practical Machine Learning",
    description: "Learn Scikit-Learn and ML basics.",
    resourceId: "res_practical_ml",
    sortOrder: 1,
    isRequired: true,
    createdAt: now,
    updatedAt: now,
  },
  // Cloud Steps
  "lps_cloud_1": {
    id: "lps_cloud_1",
    learningPathId: "lp_cloud_architecture",
    type: "resource",
    title: "AWS Certified Solutions Architect",
    description: "Start studying for the CSA.",
    resourceId: "res_aws_certified_solutions",
    sortOrder: 1,
    isRequired: true,
    createdAt: now,
    updatedAt: now,
  }`;

content = content.replace(/(export const learningPathSteps: Record<ID, LearningPathStep> = \{[\s\S]*?)(};\s*)/, (match, p1, p2) => {
  return p1.replace(/,\s*$/, '') + `,${newSteps}\n` + p2;
});

fs.writeFileSync(lpPath, content, 'utf8');
console.log('Added 3 learning paths.');
