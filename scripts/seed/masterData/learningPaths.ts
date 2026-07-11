import { LearningPath, LearningPathStep } from "../../../src/types/database";

const now = new Date().toISOString();

export const learningPaths: Record<string, LearningPath> = {
  lp_frontend_basics: {
    id: "lp_frontend_basics",
    title: "Frontend Development Foundations",
    description: "A structured path for learning JavaScript, React, Next.js, Git, and a portfolio-ready frontend project.",
    careerPathId: "path_frontend_dev",
    difficultyLevel: "beginner",
    estimatedDuration: "45 hours",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  lp_backend_api_development: {
    id: "lp_backend_api_development",
    title: "Backend API Development",
    description: "Learn backend fundamentals through Python, SQL, API design, security basics, and a REST API project.",
    careerPathId: "path_backend_dev",
    difficultyLevel: "intermediate",
    estimatedDuration: "50 hours",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  lp_fullstack_portfolio_path: {
    id: "lp_fullstack_portfolio_path",
    title: "Full Stack Portfolio Path",
    description: "Build end-to-end skills using frontend, backend, SQL, Git, security, and a full stack project.",
    careerPathId: "path_fullstack_dev",
    difficultyLevel: "intermediate",
    estimatedDuration: "70 hours",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  lp_data_science_intro: {
    id: "lp_data_science_intro",
    title: "Data Science Foundations",
    description: "Learn Python, Pandas, SQL, visualization, and basic machine learning through practical tasks and projects.",
    careerPathId: "path_data_scientist",
    difficultyLevel: "beginner",
    estimatedDuration: "60 hours",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  lp_ai_ml_foundations: {
    id: "lp_ai_ml_foundations",
    title: "AI & Machine Learning Foundations",
    description: "Build a foundation in Python, machine learning, deep learning concepts, and AI-assisted study workflows.",
    careerPathId: "path_ai_engineer",
    difficultyLevel: "intermediate",
    estimatedDuration: "65 hours",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  lp_cybersecurity_foundations: {
    id: "lp_cybersecurity_foundations",
    title: "Cybersecurity Foundations",
    description: "Learn defensive cybersecurity fundamentals, web security checks, network security basics, and audit reporting.",
    careerPathId: "path_cybersec_analyst",
    difficultyLevel: "beginner",
    estimatedDuration: "45 hours",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  lp_cloud_architecture: {
    id: "lp_cloud_architecture",
    title: "Cloud Architecture Foundations",
    description: "Understand cloud services, containers, CI/CD, deployment planning, and scalable architecture basics.",
    careerPathId: "path_cloud_architect",
    difficultyLevel: "intermediate",
    estimatedDuration: "60 hours",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  lp_uiux_product_design: {
    id: "lp_uiux_product_design",
    title: "UI/UX Product Design Foundations",
    description: "Learn user research, wireframing, Figma basics, communication, and design case study creation.",
    careerPathId: "path_ui_ux_designer",
    difficultyLevel: "beginner",
    estimatedDuration: "45 hours",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  lp_product_management_foundations: {
    id: "lp_product_management_foundations",
    title: "Product Management Foundations",
    description: "Learn product strategy, Agile planning, requirements writing, communication, and PRD creation.",
    careerPathId: "path_product_manager",
    difficultyLevel: "beginner",
    estimatedDuration: "40 hours",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  lp_digital_marketing_foundations: {
    id: "lp_digital_marketing_foundations",
    title: "Digital Marketing Foundations",
    description: "Learn SEO, content planning, communication, page auditing, and campaign planning basics.",
    careerPathId: "path_digital_marketer",
    difficultyLevel: "beginner",
    estimatedDuration: "35 hours",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
};

function step(
  learningPathId: string,
  id: string,
  sortOrder: number,
  type: LearningPathStep["type"],
  title: string,
  description: string,
  refs: Partial<Pick<LearningPathStep, "resourceId" | "practiceTaskId" | "quizId" | "projectId" | "minimumScore">>,
  isRequired = true
): LearningPathStep {
  return {
    id,
    learningPathId,
    type,
    title,
    description,
    sortOrder,
    isRequired,
    createdAt: now,
    updatedAt: now,
    ...refs,
  };
}

export const learningPathSteps: Record<string, Record<string, LearningPathStep>> = {
  lp_frontend_basics: {
    step_frontend_01: step(
      "lp_frontend_basics",
      "step_frontend_01",
      1,
      "resource",
      "Learn JavaScript fundamentals",
      "Start with JavaScript syntax, functions, arrays, objects, and browser basics.",
      { resourceId: "res_mdn_js" }
    ),
    step_frontend_02: step(
      "lp_frontend_basics",
      "step_frontend_02",
      2,
      "practice_task",
      "Practice JavaScript arrays",
      "Apply array methods to realistic student and course data.",
      { practiceTaskId: "task_js_array_methods" }
    ),
    step_frontend_03: step(
      "lp_frontend_basics",
      "step_frontend_03",
      3,
      "resource",
      "Learn React fundamentals",
      "Study components, props, state, and common React patterns.",
      { resourceId: "res_react_docs" }
    ),
    step_frontend_04: step(
      "lp_frontend_basics",
      "step_frontend_04",
      4,
      "practice_task",
      "Build reusable React components",
      "Practice props and component composition through CourseCard components.",
      { practiceTaskId: "task_react_component_props" }
    ),
    step_frontend_05: step(
      "lp_frontend_basics",
      "step_frontend_05",
      5,
      "quiz",
      "Pass the React fundamentals quiz",
      "Verify your understanding of React state, props, and list rendering.",
      { quizId: "quiz_react_fundamentals", minimumScore: 70 }
    ),
    step_frontend_06: step(
      "lp_frontend_basics",
      "step_frontend_06",
      6,
      "project",
      "Build a React weather dashboard",
      "Create a portfolio-ready frontend project using React or Next.js.",
      { projectId: "proj_react_weather_dashboard" }
    ),
  },

  lp_backend_api_development: {
    step_backend_01: step(
      "lp_backend_api_development",
      "step_backend_01",
      1,
      "resource",
      "Learn Python programming",
      "Review Python syntax, functions, files, and data structures.",
      { resourceId: "res_python_crash" }
    ),
    step_backend_02: step(
      "lp_backend_api_development",
      "step_backend_02",
      2,
      "practice_task",
      "Process CSV files with Python",
      "Practice reading, cleaning, validating, and exporting CSV data.",
      { practiceTaskId: "task_python_file_processing" }
    ),
    step_backend_03: step(
      "lp_backend_api_development",
      "step_backend_03",
      3,
      "resource",
      "Practice SQL fundamentals",
      "Learn SELECT, JOIN, GROUP BY, filtering, and query logic.",
      { resourceId: "res_sql_bolt" }
    ),
    step_backend_04: step(
      "lp_backend_api_development",
      "step_backend_04",
      4,
      "practice_task",
      "Write SQL JOIN queries",
      "Practice relational queries using students, courses, and enrollments.",
      { practiceTaskId: "task_sql_joins_grouping" }
    ),
    step_backend_05: step(
      "lp_backend_api_development",
      "step_backend_05",
      5,
      "quiz",
      "Pass backend data basics quiz",
      "Verify Python and SQL foundations before building an API.",
      { quizId: "quiz_backend_data_basics", minimumScore: 70 }
    ),
    step_backend_06: step(
      "lp_backend_api_development",
      "step_backend_06",
      6,
      "project",
      "Build a REST API service",
      "Create a backend API with validation, database use, and documentation.",
      { projectId: "proj_rest_api_service" }
    ),
  },

  lp_fullstack_portfolio_path: {
    step_fullstack_01: step(
      "lp_fullstack_portfolio_path",
      "step_fullstack_01",
      1,
      "resource",
      "Learn TypeScript basics",
      "Understand typed interfaces, type safety, and practical frontend models.",
      { resourceId: "res_ts_handbook" }
    ),
    step_fullstack_02: step(
      "lp_fullstack_portfolio_path",
      "step_fullstack_02",
      2,
      "practice_task",
      "Model TypeScript interfaces",
      "Create clean interfaces for student, course, skill, resource, and task data.",
      { practiceTaskId: "task_ts_interface_modeling" }
    ),
    step_fullstack_03: step(
      "lp_fullstack_portfolio_path",
      "step_fullstack_03",
      3,
      "resource",
      "Learn Next.js fundamentals",
      "Study routes, layouts, pages, and modern React application structure.",
      { resourceId: "res_nextjs_learn" }
    ),
    step_fullstack_04: step(
      "lp_fullstack_portfolio_path",
      "step_fullstack_04",
      4,
      "practice_task",
      "Practice Next.js route structure",
      "Build clean routes for dashboard, resources, skills, and profile pages.",
      { practiceTaskId: "task_nextjs_route_structure" }
    ),
    step_fullstack_05: step(
      "lp_fullstack_portfolio_path",
      "step_fullstack_05",
      5,
      "resource",
      "Study secure web development",
      "Review common web security risks and secure application practices.",
      { resourceId: "res_owasp_top_10" }
    ),
    step_fullstack_06: step(
      "lp_fullstack_portfolio_path",
      "step_fullstack_06",
      6,
      "quiz",
      "Pass the React and Next.js quiz",
      "Verify your understanding of React and Next.js routing.",
      { quizId: "quiz_nextjs_routing", minimumScore: 70 }
    ),
    step_fullstack_07: step(
      "lp_fullstack_portfolio_path",
      "step_fullstack_07",
      7,
      "project",
      "Build a full stack task manager",
      "Create a portfolio project with authentication, task CRUD, filters, and protected data.",
      { projectId: "proj_fullstack_task_manager" }
    ),
  },

  lp_data_science_intro: {
    step_data_01: step(
      "lp_data_science_intro",
      "step_data_01",
      1,
      "resource",
      "Learn Python for data work",
      "Review Python basics used in data preparation and analysis.",
      { resourceId: "res_python_crash" }
    ),
    step_data_02: step(
      "lp_data_science_intro",
      "step_data_02",
      2,
      "resource",
      "Learn Pandas",
      "Study DataFrames, cleaning, filtering, and basic transformations.",
      { resourceId: "res_pandas_docs" }
    ),
    step_data_03: step(
      "lp_data_science_intro",
      "step_data_03",
      3,
      "practice_task",
      "Clean a dataset with Pandas",
      "Prepare messy data for analysis using Pandas cleaning methods.",
      { practiceTaskId: "task_pandas_dataframe_cleaning" }
    ),
    step_data_04: step(
      "lp_data_science_intro",
      "step_data_04",
      4,
      "practice_task",
      "Create data visualizations",
      "Build charts and write useful insights from the data.",
      { practiceTaskId: "task_data_visualization_chart" }
    ),
    step_data_05: step(
      "lp_data_science_intro",
      "step_data_05",
      5,
      "quiz",
      "Pass the data analysis foundations quiz",
      "Verify understanding of Python, Pandas, SQL, and visualization basics.",
      { quizId: "quiz_data_analysis_foundations", minimumScore: 70 }
    ),
    step_data_06: step(
      "lp_data_science_intro",
      "step_data_06",
      6,
      "project",
      "Build a data cleaning pipeline",
      "Create a data project with cleaning, validation, summaries, and documented assumptions.",
      { projectId: "proj_data_cleaning_pipeline" }
    ),
  },

  lp_ai_ml_foundations: {
    step_ai_01: step(
      "lp_ai_ml_foundations",
      "step_ai_01",
      1,
      "resource",
      "Learn machine learning basics",
      "Study supervised learning, evaluation, overfitting, and common model workflows.",
      { resourceId: "res_ml_crash_course" }
    ),
    step_ai_02: step(
      "lp_ai_ml_foundations",
      "step_ai_02",
      2,
      "practice_task",
      "Train/test split practice",
      "Prepare data, train a simple model, and evaluate performance.",
      { practiceTaskId: "task_ml_train_test_split" }
    ),
    step_ai_03: step(
      "lp_ai_ml_foundations",
      "step_ai_03",
      3,
      "resource",
      "Explore deep learning concepts",
      "Understand core concepts behind neural networks and model training.",
      { resourceId: "res_deep_learning_book" }
    ),
    step_ai_04: step(
      "lp_ai_ml_foundations",
      "step_ai_04",
      4,
      "practice_task",
      "Create a deep learning concept map",
      "Explain neurons, layers, activation, loss, epochs, and overfitting.",
      { practiceTaskId: "task_deep_learning_concepts" }
    ),
    step_ai_05: step(
      "lp_ai_ml_foundations",
      "step_ai_05",
      5,
      "quiz",
      "Pass the machine learning basics quiz",
      "Verify understanding of model training and evaluation.",
      { quizId: "quiz_ml_basics", minimumScore: 70 }
    ),
    step_ai_06: step(
      "lp_ai_ml_foundations",
      "step_ai_06",
      6,
      "project",
      "Build a machine learning prediction model",
      "Train and evaluate a basic model and explain its limitations.",
      { projectId: "proj_ml_prediction_model" }
    ),
  },

  lp_cybersecurity_foundations: {
    step_security_01: step(
      "lp_cybersecurity_foundations",
      "step_security_01",
      1,
      "resource",
      "Study web security fundamentals",
      "Learn common web risks and defensive practices.",
      { resourceId: "res_owasp_top_10" }
    ),
    step_security_02: step(
      "lp_cybersecurity_foundations",
      "step_security_02",
      2,
      "practice_task",
      "Create a web security checklist",
      "Review authentication, authorization, secrets, validation, and HTTPS practices.",
      { practiceTaskId: "task_web_security_checklist" }
    ),
    step_security_03: step(
      "lp_cybersecurity_foundations",
      "step_security_03",
      3,
      "resource",
      "Learn network security basics",
      "Review firewalls, IDS/IPS, VPN, MFA, and least privilege.",
      { resourceId: "res_network_sec_intro" }
    ),
    step_security_04: step(
      "lp_cybersecurity_foundations",
      "step_security_04",
      4,
      "practice_task",
      "Write a network security basics report",
      "Explain key defensive controls with examples.",
      { practiceTaskId: "task_network_security_basics" }
    ),
    step_security_05: step(
      "lp_cybersecurity_foundations",
      "step_security_05",
      5,
      "quiz",
      "Pass the cybersecurity fundamentals quiz",
      "Verify understanding of basic defensive security concepts.",
      { quizId: "quiz_cybersecurity_foundations", minimumScore: 70 }
    ),
    step_security_06: step(
      "lp_cybersecurity_foundations",
      "step_security_06",
      6,
      "project",
      "Write a cybersecurity audit report",
      "Review a sample app and prepare a structured security audit report.",
      { projectId: "proj_cybersecurity_audit_report" }
    ),
  },

  lp_cloud_architecture: {
    step_cloud_01: step(
      "lp_cloud_architecture",
      "step_cloud_01",
      1,
      "resource",
      "Learn AWS cloud fundamentals",
      "Study basic cloud concepts, compute, storage, networking, and IAM.",
      { resourceId: "res_aws_fundamentals" }
    ),
    step_cloud_02: step(
      "lp_cloud_architecture",
      "step_cloud_02",
      2,
      "practice_task",
      "Write AWS architecture notes",
      "Summarize the services needed for a basic web application deployment.",
      { practiceTaskId: "task_aws_architecture_notes" }
    ),
    step_cloud_03: step(
      "lp_cloud_architecture",
      "step_cloud_03",
      3,
      "resource",
      "Learn Docker fundamentals",
      "Understand containers, images, Dockerfiles, and local container workflows.",
      { resourceId: "res_docker_curriculum" }
    ),
    step_cloud_04: step(
      "lp_cloud_architecture",
      "step_cloud_04",
      4,
      "practice_task",
      "Containerize a simple app",
      "Write a Dockerfile, build an image, run a container, and document commands.",
      { practiceTaskId: "task_docker_basic_container" }
    ),
    step_cloud_05: step(
      "lp_cloud_architecture",
      "step_cloud_05",
      5,
      "quiz",
      "Pass the cloud and Docker basics quiz",
      "Verify cloud architecture and container basics.",
      { quizId: "quiz_cloud_docker_basics", minimumScore: 70 }
    ),
    step_cloud_06: step(
      "lp_cloud_architecture",
      "step_cloud_06",
      6,
      "project",
      "Create a cloud deployment blueprint",
      "Design a cloud deployment plan with architecture, monitoring, backup, and security notes.",
      { projectId: "proj_cloud_deployment_blueprint" }
    ),
  },

  lp_uiux_product_design: {
    step_uiux_01: step(
      "lp_uiux_product_design",
      "step_uiux_01",
      1,
      "resource",
      "Learn Figma basics",
      "Understand frames, components, spacing, and simple design structure.",
      { resourceId: "res_figma_basics" }
    ),
    step_uiux_02: step(
      "lp_uiux_product_design",
      "step_uiux_02",
      2,
      "practice_task",
      "Create low-fidelity wireframes",
      "Design wireframes for login, dashboard, resources, and skill details pages.",
      { practiceTaskId: "task_figma_wireframe" }
    ),
    step_uiux_03: step(
      "lp_uiux_product_design",
      "step_uiux_03",
      3,
      "resource",
      "Study user research basics",
      "Learn how to understand user needs, problems, and behavior.",
      { resourceId: "res_nngroup_research" }
    ),
    step_uiux_04: step(
      "lp_uiux_product_design",
      "step_uiux_04",
      4,
      "practice_task",
      "Prepare user research questions",
      "Write interview questions for understanding student learning needs.",
      { practiceTaskId: "task_user_research_questions" }
    ),
    step_uiux_05: step(
      "lp_uiux_product_design",
      "step_uiux_05",
      5,
      "quiz",
      "Pass the UI/UX basics quiz",
      "Verify user research and wireframing concepts.",
      { quizId: "quiz_uiux_foundations", minimumScore: 70 }
    ),
    step_uiux_06: step(
      "lp_uiux_product_design",
      "step_uiux_06",
      6,
      "project",
      "Build a mobile wireframe case study",
      "Create a student productivity app wireframe with persona, flow, and case study notes.",
      { projectId: "proj_uiux_mobile_wireframe" }
    ),
  },

  lp_product_management_foundations: {
    step_pm_01: step(
      "lp_product_management_foundations",
      "step_pm_01",
      1,
      "resource",
      "Learn product management basics",
      "Study product discovery, prioritization, requirements, and success metrics.",
      { resourceId: "res_pm_guide" }
    ),
    step_pm_02: step(
      "lp_product_management_foundations",
      "step_pm_02",
      2,
      "practice_task",
      "Create a product mini plan",
      "Define a problem, target users, user stories, success metrics, and risks.",
      { practiceTaskId: "task_product_management_plan" }
    ),
    step_pm_03: step(
      "lp_product_management_foundations",
      "step_pm_03",
      3,
      "resource",
      "Study Agile principles",
      "Understand values and principles behind Agile software development.",
      { resourceId: "res_agile_manifesto" }
    ),
    step_pm_04: step(
      "lp_product_management_foundations",
      "step_pm_04",
      4,
      "practice_task",
      "Break a feature into sprint tasks",
      "Write user stories, acceptance criteria, sprint tasks, and definition of done.",
      { practiceTaskId: "task_agile_sprint_breakdown" }
    ),
    step_pm_05: step(
      "lp_product_management_foundations",
      "step_pm_05",
      5,
      "quiz",
      "Pass the product and Agile basics quiz",
      "Verify product planning and Agile concepts.",
      { quizId: "quiz_product_agile_basics", minimumScore: 70 }
    ),
    step_pm_06: step(
      "lp_product_management_foundations",
      "step_pm_06",
      6,
      "project",
      "Write a product requirements document",
      "Create a professional PRD for a student-focused software feature.",
      { projectId: "proj_product_requirements_doc" }
    ),
  },

  lp_digital_marketing_foundations: {
    step_marketing_01: step(
      "lp_digital_marketing_foundations",
      "step_marketing_01",
      1,
      "resource",
      "Learn SEO fundamentals",
      "Study page titles, descriptions, headings, links, and content quality.",
      { resourceId: "res_seo_starter" }
    ),
    step_marketing_02: step(
      "lp_digital_marketing_foundations",
      "step_marketing_02",
      2,
      "practice_task",
      "Audit a page for SEO",
      "Review a webpage and write five improvement recommendations.",
      { practiceTaskId: "task_seo_page_audit" }
    ),
    step_marketing_03: step(
      "lp_digital_marketing_foundations",
      "step_marketing_03",
      3,
      "resource",
      "Improve communication skills",
      "Learn how to communicate clearly in professional and academic contexts.",
      { resourceId: "res_effective_comm" }
    ),
    step_marketing_04: step(
      "lp_digital_marketing_foundations",
      "step_marketing_04",
      4,
      "practice_task",
      "Write a professional status update",
      "Practice clear communication using completed work, blockers, next steps, and requests.",
      { practiceTaskId: "task_communication_status_update" }
    ),
    step_marketing_05: step(
      "lp_digital_marketing_foundations",
      "step_marketing_05",
      5,
      "quiz",
      "Pass the SEO and content basics quiz",
      "Verify basic SEO and content planning understanding.",
      { quizId: "quiz_seo_content_basics", minimumScore: 70 }
    ),
    step_marketing_06: step(
      "lp_digital_marketing_foundations",
      "step_marketing_06",
      6,
      "project",
      "Create a digital marketing content plan",
      "Build a one-month content and SEO plan for an educational platform.",
      { projectId: "proj_digital_marketing_content_plan" }
    ),
  },
};