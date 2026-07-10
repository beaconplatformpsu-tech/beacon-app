import { PracticeTask, Project, ID } from "../../../src/types/database";

const now = new Date().toISOString();

export const practiceTasks: Record<ID, PracticeTask> = {
  "task_js_functions": {
    id: "task_js_functions",
    title: "JavaScript Functions Practice",
    description: "Write 5 common utility functions.",
    instructions: "1. Write a function that reverses a string.\n2. Write a function that checks for a palindrome.\n3. Write a function to fetch API data.",
    skillIds: ["skill_javascript"],
    difficultyLevel: "beginner",
    estimatedTimeMinutes: 45,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  "task_sql_queries": {
    id: "task_sql_queries",
    title: "SQL Data Extraction",
    description: "Write 3 complex SQL JOIN queries.",
    instructions: "Given a schema with Users and Orders, write queries to find the top 5 spenders, the average order value, and inactive users.",
    skillIds: ["skill_sql"],
    difficultyLevel: "intermediate",
    estimatedTimeMinutes: 60,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }
};

export const projects: Record<ID, Project> = {
  "proj_weather_app": {
    id: "proj_weather_app",
    title: "React Weather Application",
    description: "Build a responsive weather dashboard using a public weather API.",
    requirements: [
      "Use React or Next.js",
      "Fetch data from OpenWeatherMap or similar",
      "Display a 5-day forecast",
      "Include a search bar for cities",
      "Deploy to Vercel or Netlify"
    ],
    skillIds: ["skill_react", "skill_javascript", "skill_nextjs"],
    careerPathIds: ["path_frontend_dev", "path_fullstack_dev"],
    difficultyLevel: "intermediate",
    estimatedHours: 15,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  "proj_data_pipeline": {
    id: "proj_data_pipeline",
    title: "Python Data Pipeline",
    description: "Build a Python script that extracts, transforms, and loads CSV data into a SQLite database.",
    requirements: [
      "Use Pandas for transformations",
      "Clean missing values",
      "Load into an SQLite database via SQLAlchemy",
      "Document the code"
    ],
    skillIds: ["skill_python", "skill_pandas", "skill_sql"],
    careerPathIds: ["path_data_scientist"],
    difficultyLevel: "intermediate",
    estimatedHours: 10,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }
};
