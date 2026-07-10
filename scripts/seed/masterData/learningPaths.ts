import { LearningPath, LearningPathStep, ID } from "../../../src/types/database";

const now = new Date().toISOString();

export const learningPaths: Record<ID, LearningPath> = {
  "lp_frontend_basics": {
    id: "lp_frontend_basics",
    title: "Frontend Development Basics",
    description: "A structured path to learning the fundamentals of frontend development, from JS to React.",
    careerPathId: "path_frontend_dev",
    difficultyLevel: "beginner",
    estimatedDuration: "40 hours",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  "lp_data_science_intro": {
    id: "lp_data_science_intro",
    title: "Introduction to Data Science",
    description: "Start your journey in data science with Python, SQL, and Machine Learning basics.",
    careerPathId: "path_data_scientist",
    difficultyLevel: "beginner",
    estimatedDuration: "35 hours",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }
,
  "lp_devops_mastery": {
    id: "lp_devops_mastery",
    title: "DevOps Engineering Mastery",
    description: "Go from basics to advanced DevOps practices including Docker, Kubernetes, and CI/CD.",
    careerPathId: "path_cloud_architect",
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
    careerPathId: "path_data_scientist",
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
    careerPathId: "path_cloud_architect",
    difficultyLevel: "intermediate",
    estimatedDuration: "50 hours",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }
};

export const learningPathSteps: Record<ID, Record<ID, LearningPathStep>> = {
  "lp_frontend_basics": {
    "step_1": {
      id: "step_1",
      learningPathId: "lp_frontend_basics",
      type: "resource",
      title: "Master JavaScript Fundamentals",
      description: "Read the MDN JavaScript Guide.",
      resourceId: "res_mdn_js",
      sortOrder: 10,
      isRequired: true,
      createdAt: now,
      updatedAt: now,
    },
    "step_2": {
      id: "step_2",
      learningPathId: "lp_frontend_basics",
      type: "resource",
      title: "Introduction to React",
      description: "Complete the official React documentation tutorial.",
      resourceId: "res_react_docs",
      sortOrder: 20,
      isRequired: true,
      createdAt: now,
      updatedAt: now,
    },
    "step_3": {
      id: "step_3",
      learningPathId: "lp_frontend_basics",
      type: "quiz",
      title: "React Fundamentals Quiz",
      description: "Test your knowledge of React components, state, and props.",
      quizId: "quiz_react_basics", // Will be created
      minimumScore: 80,
      sortOrder: 30,
      isRequired: true,
      createdAt: now,
      updatedAt: now,
    }
  },
  "lp_data_science_intro": {
    "step_1": {
      id: "step_1",
      learningPathId: "lp_data_science_intro",
      type: "resource",
      title: "Python Crash Course",
      description: "Learn Python syntax and basic scripting.",
      resourceId: "res_python_crash",
      sortOrder: 10,
      isRequired: true,
      createdAt: now,
      updatedAt: now,
    },
    "step_2": {
      id: "step_2",
      learningPathId: "lp_data_science_intro",
      type: "resource",
      title: "SQL Practice",
      description: "Complete interactive SQL exercises.",
      resourceId: "res_sql_bolt",
      sortOrder: 20,
      isRequired: true,
      createdAt: now,
      updatedAt: now,
    }
  }
};
