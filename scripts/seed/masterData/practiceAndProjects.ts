import { PracticeTask, Project } from "../../../src/types/database";

const now = new Date().toISOString();

type SeedPracticeTask = PracticeTask & { isActive: boolean };
type SeedProject = Project & { isActive: boolean };

export const practiceTasks: Record<string, SeedPracticeTask> = {
  task_js_array_methods: {
    id: "task_js_array_methods",
    title: "JavaScript Array Methods Practice",
    description: "Practice map, filter, reduce, find, and some using real student/course data examples.",
    instructions:
      "Create an array of student objects with name, grade, major, and status. Use map to extract names, filter to find passed students, reduce to calculate the average grade, find to locate a specific student, and some to check if any student is at risk.",
    skillIds: ["skill_javascript"],
    difficultyLevel: "beginner",
    estimatedTimeMinutes: 45,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_js_async_fetch: {
    id: "task_js_async_fetch",
    title: "Fetch API and Async/Await Practice",
    description: "Practice calling an API, handling loading state, and managing errors clearly.",
    instructions:
      "Build a small JavaScript module that fetches posts from a public API, displays titles, handles loading state, catches network errors, and shows a clean error message.",
    skillIds: ["skill_javascript"],
    difficultyLevel: "intermediate",
    estimatedTimeMinutes: 60,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_ts_interface_modeling: {
    id: "task_ts_interface_modeling",
    title: "TypeScript Interface Modeling",
    description: "Model clean TypeScript interfaces for a student learning platform.",
    instructions:
      "Create TypeScript interfaces for Student, Course, Skill, Resource, and Task. Add union types for task status and priority. Write sample objects and make sure TypeScript catches invalid values.",
    skillIds: ["skill_typescript"],
    difficultyLevel: "beginner",
    estimatedTimeMinutes: 60,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_react_component_props: {
    id: "task_react_component_props",
    title: "React Components and Props Practice",
    description: "Build reusable React components using props and clean component structure.",
    instructions:
      "Create a CourseCard component that receives title, description, level, duration, and progress props. Render at least five cards from an array and keep the component reusable.",
    skillIds: ["skill_react", "skill_javascript"],
    difficultyLevel: "beginner",
    estimatedTimeMinutes: 60,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_react_state_filtering: {
    id: "task_react_state_filtering",
    title: "React State and Filtering Practice",
    description: "Practice useState by building an interactive list filter.",
    instructions:
      "Build a skills list with a search input and category filter. The UI should update immediately when the user types or changes category. Add an empty state when no skills match.",
    skillIds: ["skill_react", "skill_javascript"],
    difficultyLevel: "intermediate",
    estimatedTimeMinutes: 75,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_nextjs_route_structure: {
    id: "task_nextjs_route_structure",
    title: "Next.js Route Structure Practice",
    description: "Practice building a clean route structure in Next.js.",
    instructions:
      "Create routes for dashboard, resources, skills, career paths, and profile. Add a shared layout and navigation. Keep route names clear and consistent.",
    skillIds: ["skill_nextjs", "skill_react"],
    difficultyLevel: "intermediate",
    estimatedTimeMinutes: 90,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_git_branch_workflow: {
    id: "task_git_branch_workflow",
    title: "Git Branch Workflow Practice",
    description: "Practice a professional Git workflow with branches and meaningful commits.",
    instructions:
      "Create a new branch, make three meaningful commits, merge into main, and write a short changelog explaining what changed and why.",
    skillIds: ["skill_git"],
    difficultyLevel: "beginner",
    estimatedTimeMinutes: 45,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_sql_joins_grouping: {
    id: "task_sql_joins_grouping",
    title: "SQL JOIN and GROUP BY Practice",
    description: "Practice extracting insights from relational tables.",
    instructions:
      "Given students, courses, and enrollments tables, write queries for enrolled students per course, average grade per course, top-performing students, and students with no enrollments.",
    skillIds: ["skill_sql"],
    difficultyLevel: "intermediate",
    estimatedTimeMinutes: 75,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_python_file_processing: {
    id: "task_python_file_processing",
    title: "Python CSV Processing Practice",
    description: "Read, clean, and summarize CSV data using Python.",
    instructions:
      "Load a CSV file, remove empty rows, validate numeric fields, calculate summary statistics, and export a cleaned CSV file.",
    skillIds: ["skill_python"],
    difficultyLevel: "beginner",
    estimatedTimeMinutes: 60,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_pandas_dataframe_cleaning: {
    id: "task_pandas_dataframe_cleaning",
    title: "Pandas Data Cleaning Practice",
    description: "Use Pandas to clean missing values and prepare data for analysis.",
    instructions:
      "Load a dataset, inspect missing values, fill or remove invalid records, rename columns, create summary statistics, and export the cleaned result.",
    skillIds: ["skill_pandas", "skill_python"],
    difficultyLevel: "intermediate",
    estimatedTimeMinutes: 90,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_data_visualization_chart: {
    id: "task_data_visualization_chart",
    title: "Data Visualization Chart Practice",
    description: "Create clear charts and write insights from a dataset.",
    instructions:
      "Choose a dataset, create one bar chart and one line chart, label axes clearly, and write three useful insights from the visualization.",
    skillIds: ["skill_data_visualization"],
    difficultyLevel: "beginner",
    estimatedTimeMinutes: 60,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_ml_train_test_split: {
    id: "task_ml_train_test_split",
    title: "Machine Learning Train/Test Split Practice",
    description: "Practice preparing data for a basic machine learning model.",
    instructions:
      "Load a small dataset, split it into training and testing sets, train a simple model, evaluate performance, and explain limitations.",
    skillIds: ["skill_machine_learning", "skill_python"],
    difficultyLevel: "intermediate",
    estimatedTimeMinutes: 90,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_deep_learning_concepts: {
    id: "task_deep_learning_concepts",
    title: "Deep Learning Concept Map",
    description: "Create a concept map explaining core deep learning terms.",
    instructions:
      "Create a diagram or written map explaining neurons, layers, activation functions, loss, epochs, overfitting, and validation data.",
    skillIds: ["skill_deep_learning"],
    difficultyLevel: "intermediate",
    estimatedTimeMinutes: 75,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_prompt_engineering_compare: {
    id: "task_prompt_engineering_compare",
    title: "Prompt Engineering Comparison Practice",
    description: "Compare weak and strong prompts for technical learning.",
    instructions:
      "Write three weak prompts and improve each one by adding role, context, constraints, examples, and expected output format.",
    skillIds: ["skill_prompt_engineering"],
    difficultyLevel: "beginner",
    estimatedTimeMinutes: 45,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_docker_basic_container: {
    id: "task_docker_basic_container",
    title: "Docker Container Practice",
    description: "Containerize a simple web application.",
    instructions:
      "Create a Dockerfile for a small Node or Python app. Build the image, run the container, expose a port, and document the commands in a README.",
    skillIds: ["skill_docker"],
    difficultyLevel: "intermediate",
    estimatedTimeMinutes: 90,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_ci_cd_pipeline_plan: {
    id: "task_ci_cd_pipeline_plan",
    title: "CI/CD Pipeline Plan",
    description: "Design a basic CI/CD workflow for a web application.",
    instructions:
      "Write a CI/CD plan that includes install, lint, typecheck, test, build, and deploy stages. Explain what should happen if any stage fails.",
    skillIds: ["skill_ci_cd", "skill_git"],
    difficultyLevel: "intermediate",
    estimatedTimeMinutes: 75,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_aws_architecture_notes: {
    id: "task_aws_architecture_notes",
    title: "AWS Architecture Notes",
    description: "Summarize the main AWS services used in a basic web app deployment.",
    instructions:
      "Write short notes explaining compute, storage, database, CDN, monitoring, and IAM. Include one example service for each category.",
    skillIds: ["skill_aws"],
    difficultyLevel: "beginner",
    estimatedTimeMinutes: 60,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_web_security_checklist: {
    id: "task_web_security_checklist",
    title: "Web Security Checklist Practice",
    description: "Review a web app against common defensive security checks.",
    instructions:
      "Create a defensive checklist covering authentication, authorization, input validation, secrets handling, HTTPS, error messages, and dependency updates.",
    skillIds: ["skill_web_security"],
    difficultyLevel: "intermediate",
    estimatedTimeMinutes: 75,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_network_security_basics: {
    id: "task_network_security_basics",
    title: "Network Security Basics Report",
    description: "Explain basic network security controls in a short report.",
    instructions:
      "Write a one-page report explaining firewall, IDS/IPS, VPN, MFA, least privilege, and logging with one practical example for each.",
    skillIds: ["skill_network_security"],
    difficultyLevel: "beginner",
    estimatedTimeMinutes: 60,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_figma_wireframe: {
    id: "task_figma_wireframe",
    title: "Figma Low-Fidelity Wireframe",
    description: "Design a simple dashboard wireframe in Figma.",
    instructions:
      "Create low-fidelity wireframes for login, dashboard, resources, and skill details pages. Use consistent spacing and clear labels.",
    skillIds: ["skill_figma", "skill_wireframing"],
    difficultyLevel: "beginner",
    estimatedTimeMinutes: 90,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_user_research_questions: {
    id: "task_user_research_questions",
    title: "User Research Interview Questions",
    description: "Prepare interview questions for understanding student learning needs.",
    instructions:
      "Write 10 open-ended interview questions. Group them into goals, pain points, current tools, and improvement ideas.",
    skillIds: ["skill_user_research"],
    difficultyLevel: "beginner",
    estimatedTimeMinutes: 45,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_product_management_plan: {
    id: "task_product_management_plan",
    title: "Product Management Mini Plan",
    description: "Create a simple product plan for a student software feature.",
    instructions:
      "Define the problem, target users, user stories, success metrics, risks, and a four-week delivery timeline.",
    skillIds: ["skill_product_strategy", "skill_project_management"],
    difficultyLevel: "beginner",
    estimatedTimeMinutes: 60,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_agile_sprint_breakdown: {
    id: "task_agile_sprint_breakdown",
    title: "Agile Sprint Breakdown",
    description: "Break a software feature into sprint-ready tasks.",
    instructions:
      "Choose a simple feature, write user stories, acceptance criteria, sprint tasks, and a basic definition of done.",
    skillIds: ["skill_agile", "skill_project_management"],
    difficultyLevel: "beginner",
    estimatedTimeMinutes: 60,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_financial_analysis_budget_review: {
    id: "task_financial_analysis_budget_review",
    title: "Budget Review and Financial Analysis Practice",
    description: "Practice reviewing a simple project budget and identifying financial risks.",
    instructions:
      "Create a simple project budget with expected costs, actual costs, variance, and notes. Calculate total budget, total actual cost, variance percentage, and write three recommendations for improving cost control.",
    skillIds: ["skill_financial_analysis"],
    difficultyLevel: "intermediate",
    estimatedTimeMinutes: 75,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_leadership_team_reflection: {
    id: "task_leadership_team_reflection",
    title: "Leadership Team Reflection",
    description: "Practice reflecting on team leadership, decision-making, and communication.",
    instructions:
      "Write a short reflection about a team situation. Include the goal, team roles, challenge, decision made, communication approach, result, and what could be improved next time.",
    skillIds: ["skill_leadership", "skill_communication"],
    difficultyLevel: "intermediate",
    estimatedTimeMinutes: 45,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_seo_page_audit: {
    id: "task_seo_page_audit",
    title: "SEO Page Audit Practice",
    description: "Review a webpage for basic SEO improvements.",
    instructions:
      "Audit title, meta description, headings, internal links, image alt text, and page content. Write five improvement recommendations.",
    skillIds: ["skill_seo", "skill_content_marketing"],
    difficultyLevel: "beginner",
    estimatedTimeMinutes: 50,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  task_communication_status_update: {
    id: "task_communication_status_update",
    title: "Professional Status Update",
    description: "Practice writing a clear project status update.",
    instructions:
      "Write a short update containing completed work, current blockers, next steps, and a clear request for support if needed.",
    skillIds: ["skill_communication"],
    difficultyLevel: "beginner",
    estimatedTimeMinutes: 30,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
};

export const projects: Record<string, SeedProject> = {
  proj_react_weather_dashboard: {
    id: "proj_react_weather_dashboard",
    title: "React Weather Dashboard",
    description:
      "Build a responsive weather dashboard that searches cities and displays current weather and a multi-day forecast.",
    requirements: [
      "Use React or Next.js",
      "Create reusable weather cards",
      "Handle loading, empty, and error states",
      "Use a real weather API",
      "Deploy the project and document setup steps",
    ],
    skillIds: ["skill_react", "skill_javascript", "skill_nextjs"],
    careerPathIds: ["path_frontend_dev", "path_fullstack_dev"],
    difficultyLevel: "intermediate",
    estimatedHours: 15,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  proj_nextjs_portfolio: {
    id: "proj_nextjs_portfolio",
    title: "Next.js Developer Portfolio",
    description:
      "Create a personal portfolio that showcases skills, projects, contact links, and a clean responsive layout.",
    requirements: [
      "Use Next.js routing",
      "Create sections for about, skills, projects, and contact",
      "Add project detail pages",
      "Use responsive layout",
      "Deploy and add README documentation",
    ],
    skillIds: ["skill_nextjs", "skill_react", "skill_javascript"],
    careerPathIds: ["path_frontend_dev", "path_fullstack_dev"],
    difficultyLevel: "intermediate",
    estimatedHours: 18,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  proj_fullstack_task_manager: {
    id: "proj_fullstack_task_manager",
    title: "Full Stack Task Manager",
    description:
      "Build a task management app with authentication, task CRUD, filters, and user-specific data.",
    requirements: [
      "Implement authentication",
      "Create task CRUD operations",
      "Add status and priority filters",
      "Protect user-specific data",
      "Write a clear README and deployment guide",
    ],
    skillIds: ["skill_react", "skill_javascript", "skill_sql", "skill_git"],
    careerPathIds: ["path_fullstack_dev", "path_backend_dev"],
    difficultyLevel: "advanced",
    estimatedHours: 28,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  proj_rest_api_service: {
    id: "proj_rest_api_service",
    title: "REST API Service",
    description: "Create a backend API for managing students, courses, and enrollments.",
    requirements: [
      "Design REST endpoints",
      "Validate request input",
      "Use a database",
      "Add structured error handling",
      "Document endpoints with examples",
    ],
    skillIds: ["skill_python", "skill_sql"],
    careerPathIds: ["path_backend_dev", "path_fullstack_dev"],
    difficultyLevel: "intermediate",
    estimatedHours: 20,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  proj_sql_student_records: {
    id: "proj_sql_student_records",
    title: "SQL Student Records System",
    description: "Design a relational schema and write queries for a student records system.",
    requirements: [
      "Create tables for students, courses, and enrollments",
      "Add primary and foreign keys",
      "Write JOIN queries",
      "Write aggregate reports",
      "Export schema and sample queries",
    ],
    skillIds: ["skill_sql"],
    careerPathIds: ["path_backend_dev", "path_data_scientist"],
    difficultyLevel: "intermediate",
    estimatedHours: 12,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  proj_data_cleaning_pipeline: {
    id: "proj_data_cleaning_pipeline",
    title: "Data Cleaning Pipeline",
    description: "Build a Python and Pandas pipeline that cleans, validates, and summarizes raw CSV data.",
    requirements: [
      "Load raw CSV data",
      "Clean missing and invalid values",
      "Create summary statistics",
      "Export cleaned data",
      "Document assumptions and limitations",
    ],
    skillIds: ["skill_python", "skill_pandas", "skill_sql"],
    careerPathIds: ["path_data_scientist"],
    difficultyLevel: "intermediate",
    estimatedHours: 14,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  proj_ml_prediction_model: {
    id: "proj_ml_prediction_model",
    title: "Machine Learning Prediction Model",
    description: "Train and evaluate a basic machine learning model on a structured dataset.",
    requirements: [
      "Prepare dataset",
      "Split train and test data",
      "Train a model",
      "Evaluate model performance",
      "Explain model limitations",
    ],
    skillIds: ["skill_python", "skill_machine_learning", "skill_pandas"],
    careerPathIds: ["path_data_scientist", "path_ai_engineer"],
    difficultyLevel: "advanced",
    estimatedHours: 22,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  proj_ai_prompted_study_assistant: {
    id: "proj_ai_prompted_study_assistant",
    title: "AI-Prompted Study Assistant",
    description:
      "Design a small assistant concept that generates study plans and resource suggestions from structured student inputs.",
    requirements: [
      "Define required student inputs",
      "Write prompt templates",
      "Create sample outputs",
      "Add privacy and safety notes",
      "Document how recommendations should be stored",
    ],
    skillIds: ["skill_prompt_engineering", "skill_python"],
    careerPathIds: ["path_ai_engineer", "path_product_manager"],
    difficultyLevel: "intermediate",
    estimatedHours: 12,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  proj_cybersecurity_audit_report: {
    id: "proj_cybersecurity_audit_report",
    title: "Cybersecurity Audit Report",
    description:
      "Review a sample web application and write a structured defensive security audit report.",
    requirements: [
      "Check authentication and authorization risks",
      "Review input validation",
      "Identify exposed secrets or unsafe configuration",
      "Recommend mitigations",
      "Write an executive summary",
    ],
    skillIds: ["skill_web_security", "skill_network_security"],
    careerPathIds: ["path_cybersec_analyst"],
    difficultyLevel: "intermediate",
    estimatedHours: 16,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  proj_dockerized_web_app: {
    id: "proj_dockerized_web_app",
    title: "Dockerized Web Application",
    description: "Containerize a simple web application and document the development workflow.",
    requirements: [
      "Write a Dockerfile",
      "Add environment variable handling",
      "Build and run the image",
      "Document commands",
      "Explain common troubleshooting steps",
    ],
    skillIds: ["skill_docker", "skill_git"],
    careerPathIds: ["path_cloud_architect", "path_backend_dev"],
    difficultyLevel: "intermediate",
    estimatedHours: 12,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  proj_cloud_deployment_blueprint: {
    id: "proj_cloud_deployment_blueprint",
    title: "Cloud Deployment Blueprint",
    description: "Design a deployment plan for a scalable web application on a cloud provider.",
    requirements: [
      "Draw architecture diagram",
      "Define compute, storage, and database services",
      "Explain monitoring and backup plan",
      "Identify security controls",
      "Estimate basic cost factors",
    ],
    skillIds: ["skill_aws", "skill_docker"],
    careerPathIds: ["path_cloud_architect"],
    difficultyLevel: "advanced",
    estimatedHours: 18,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  proj_ci_cd_release_pipeline: {
    id: "proj_ci_cd_release_pipeline",
    title: "CI/CD Release Pipeline",
    description: "Design and document a CI/CD pipeline for a frontend or full stack project.",
    requirements: [
      "Define pipeline stages",
      "Add lint, typecheck, test, and build steps",
      "Explain deployment trigger",
      "Add rollback notes",
      "Document required environment variables",
    ],
    skillIds: ["skill_ci_cd", "skill_git"],
    careerPathIds: ["path_cloud_architect", "path_fullstack_dev"],
    difficultyLevel: "intermediate",
    estimatedHours: 14,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  proj_uiux_mobile_wireframe: {
    id: "proj_uiux_mobile_wireframe",
    title: "Mobile App Wireframe Case Study",
    description: "Design and document a mobile app wireframe for a student productivity product.",
    requirements: [
      "Create user persona",
      "Create user flow",
      "Design at least five mobile screens",
      "Explain layout decisions",
      "Prepare a short case study",
    ],
    skillIds: ["skill_figma", "skill_wireframing", "skill_user_research"],
    careerPathIds: ["path_ui_ux_designer"],
    difficultyLevel: "intermediate",
    estimatedHours: 14,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  proj_product_requirements_doc: {
    id: "proj_product_requirements_doc",
    title: "Product Requirements Document",
    description: "Write a professional PRD for a student-focused software feature.",
    requirements: [
      "Define problem statement",
      "Define target users",
      "Write user stories",
      "Define functional requirements",
      "Add success metrics and launch risks",
    ],
    skillIds: ["skill_product_strategy", "skill_project_management", "skill_communication"],
    careerPathIds: ["path_product_manager"],
    difficultyLevel: "intermediate",
    estimatedHours: 10,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  proj_budget_analysis_report: {
    id: "proj_budget_analysis_report",
    title: "Budget Analysis Report",
    description: "Create a simple budget analysis report for a software project or student club initiative.",
    requirements: [
      "Define planned and actual costs",
      "Calculate variance and variance percentage",
      "Create a simple cost summary table",
      "Identify at least three financial risks",
      "Write recommendations for better budget control",
    ],
    skillIds: ["skill_financial_analysis", "skill_data_visualization", "skill_communication"],
    careerPathIds: ["path_product_manager"],
    difficultyLevel: "intermediate",
    estimatedHours: 10,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  proj_team_leadership_retrospective: {
    id: "proj_team_leadership_retrospective",
    title: "Team Leadership Retrospective",
    description: "Prepare a professional retrospective report for a small software team or class project.",
    requirements: [
      "Define the project goal and team roles",
      "Explain the main challenge faced by the team",
      "Describe the leadership and communication approach used",
      "Identify what worked well and what did not",
      "Write three action items for the next project",
    ],
    skillIds: ["skill_leadership", "skill_communication", "skill_project_management"],
    careerPathIds: ["path_product_manager"],
    difficultyLevel: "intermediate",
    estimatedHours: 8,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  proj_digital_marketing_content_plan: {
    id: "proj_digital_marketing_content_plan",
    title: "Digital Marketing Content Plan",
    description: "Create a practical content and SEO plan for a small educational platform.",
    requirements: [
      "Define audience segments",
      "Research content topics",
      "Create a one-month content calendar",
      "Add SEO keyword targets",
      "Define success metrics",
    ],
    skillIds: ["skill_seo", "skill_content_marketing", "skill_communication"],
    careerPathIds: ["path_digital_marketer"],
    difficultyLevel: "beginner",
    estimatedHours: 10,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
};