import { Skill, ID } from "../../../src/types/database";

const now = new Date().toISOString();

export const skills: Record<ID, Skill> = {
  // Programming
  skill_javascript: {
    id: "skill_javascript",
    slug: "javascript",
    title: "JavaScript",
    description:
      "The core programming language of the web, used for frontend, backend, and full stack development.",
    categoryId: "cat_skill_programming",
    difficultyLevel: "intermediate",
    tags: ["programming", "web", "frontend", "backend", "fullstack"],
    sortOrder: 10,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  skill_typescript: {
    id: "skill_typescript",
    slug: "typescript",
    title: "TypeScript",
    description:
      "A typed programming language that builds on JavaScript and improves code safety in large applications.",
    categoryId: "cat_skill_programming",
    difficultyLevel: "intermediate",
    tags: ["programming", "typing", "javascript", "frontend", "fullstack"],
    sortOrder: 20,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  skill_python: {
    id: "skill_python",
    slug: "python",
    title: "Python",
    description:
      "A versatile programming language used in backend development, automation, data analysis, and AI.",
    categoryId: "cat_skill_programming",
    difficultyLevel: "beginner",
    tags: ["programming", "backend", "data", "automation", "ai"],
    sortOrder: 30,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  // Web Frontend
  skill_react: {
    id: "skill_react",
    slug: "react",
    title: "React",
    description:
      "A JavaScript library for building component-based user interfaces and interactive web applications.",
    categoryId: "cat_skill_web_frontend",
    difficultyLevel: "intermediate",
    tags: ["frontend", "ui", "components", "javascript"],
    sortOrder: 40,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  skill_nextjs: {
    id: "skill_nextjs",
    slug: "next-js",
    title: "Next.js",
    description:
      "A React framework for building production web applications with routing, layouts, rendering strategies, and deployment support.",
    categoryId: "cat_skill_web_frontend",
    difficultyLevel: "advanced",
    tags: ["frontend", "react", "framework", "routing", "fullstack"],
    sortOrder: 50,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  // Backend Development
  skill_sql: {
    id: "skill_sql",
    slug: "sql",
    title: "SQL",
    description:
      "The standard language for querying, analyzing, and managing relational databases.",
    categoryId: "cat_skill_backend",
    difficultyLevel: "intermediate",
    tags: ["database", "backend", "analytics", "data"],
    sortOrder: 60,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  // Data Analysis
  skill_pandas: {
    id: "skill_pandas",
    slug: "pandas",
    title: "Pandas",
    description:
      "A Python library for cleaning, transforming, analyzing, and preparing structured data.",
    categoryId: "cat_skill_data",
    difficultyLevel: "intermediate",
    tags: ["data", "python", "analysis", "dataframe"],
    sortOrder: 70,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  skill_data_visualization: {
    id: "skill_data_visualization",
    slug: "data-visualization",
    title: "Data Visualization",
    description:
      "Creating charts, dashboards, and visual explanations that communicate data insights clearly.",
    categoryId: "cat_skill_data",
    difficultyLevel: "intermediate",
    tags: ["data", "analytics", "charts", "dashboard", "reporting"],
    sortOrder: 80,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  // AI & Machine Learning
  skill_machine_learning: {
    id: "skill_machine_learning",
    slug: "machine-learning",
    title: "Machine Learning",
    description:
      "Core concepts of supervised learning, unsupervised learning, model training, evaluation, and overfitting.",
    categoryId: "cat_skill_ai",
    difficultyLevel: "advanced",
    tags: ["ai", "machine-learning", "data-science", "modeling"],
    sortOrder: 90,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  skill_deep_learning: {
    id: "skill_deep_learning",
    slug: "deep-learning",
    title: "Deep Learning",
    description:
      "Advanced machine learning concepts based on neural networks, layers, activation functions, and model training.",
    categoryId: "cat_skill_ai",
    difficultyLevel: "advanced",
    tags: ["ai", "deep-learning", "neural-networks", "advanced"],
    sortOrder: 100,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  skill_prompt_engineering: {
    id: "skill_prompt_engineering",
    slug: "prompt-engineering",
    title: "Prompt Engineering",
    description:
      "Designing clear prompts with context, constraints, examples, and structured output expectations for AI-assisted workflows.",
    categoryId: "cat_skill_ai",
    difficultyLevel: "intermediate",
    tags: ["ai", "generative-ai", "communication", "productivity"],
    sortOrder: 110,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  // Cloud & DevOps
  skill_git: {
    id: "skill_git",
    slug: "git",
    title: "Git Version Control",
    description:
      "Tracking source code changes, managing branches, collaborating with teams, and maintaining project history.",
    categoryId: "cat_skill_cloud",
    difficultyLevel: "beginner",
    tags: ["devops", "collaboration", "version-control", "tooling"],
    sortOrder: 120,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  skill_docker: {
    id: "skill_docker",
    slug: "docker",
    title: "Docker",
    description:
      "Packaging applications into containers for consistent development, testing, and deployment environments.",
    categoryId: "cat_skill_cloud",
    difficultyLevel: "intermediate",
    tags: ["devops", "containers", "deployment", "backend"],
    sortOrder: 130,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  skill_aws: {
    id: "skill_aws",
    slug: "aws",
    title: "Amazon Web Services",
    description:
      "Cloud computing services for hosting, storage, databases, networking, monitoring, and application deployment.",
    categoryId: "cat_skill_cloud",
    difficultyLevel: "advanced",
    tags: ["cloud", "infrastructure", "deployment", "devops"],
    sortOrder: 140,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  skill_ci_cd: {
    id: "skill_ci_cd",
    slug: "ci-cd",
    title: "CI/CD Pipelines",
    description:
      "Automating code checks, builds, tests, and deployments through continuous integration and delivery workflows.",
    categoryId: "cat_skill_cloud",
    difficultyLevel: "intermediate",
    tags: ["devops", "automation", "deployment", "github-actions"],
    sortOrder: 150,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  // Cybersecurity
  skill_web_security: {
    id: "skill_web_security",
    slug: "web-security",
    title: "Web Security Fundamentals",
    description:
      "Defensive web security concepts covering authentication, authorization, validation, secret handling, and secure configuration.",
    categoryId: "cat_skill_security",
    difficultyLevel: "intermediate",
    tags: ["security", "web", "defensive-security", "secure-development"],
    sortOrder: 160,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  skill_network_security: {
    id: "skill_network_security",
    slug: "network-security",
    title: "Network Security",
    description:
      "Defensive network security concepts including firewalls, VPNs, MFA, monitoring, and least privilege.",
    categoryId: "cat_skill_security",
    difficultyLevel: "intermediate",
    tags: ["security", "networking", "infrastructure", "defensive-security"],
    sortOrder: 170,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  // UI/UX Design
  skill_figma: {
    id: "skill_figma",
    slug: "figma",
    title: "Figma",
    description:
      "A collaborative interface design tool used for wireframes, prototypes, components, and design systems.",
    categoryId: "cat_skill_design",
    difficultyLevel: "beginner",
    tags: ["design", "ui", "ux", "prototyping"],
    sortOrder: 180,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  skill_wireframing: {
    id: "skill_wireframing",
    slug: "wireframing",
    title: "Wireframing",
    description:
      "Creating low-fidelity layouts that define page structure, content hierarchy, and user flow before visual design.",
    categoryId: "cat_skill_design",
    difficultyLevel: "beginner",
    tags: ["ui", "ux", "design", "planning"],
    sortOrder: 190,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  skill_user_research: {
    id: "skill_user_research",
    slug: "user-research",
    title: "User Research",
    description:
      "Understanding user goals, needs, behaviors, and problems through interviews, observation, and structured research.",
    categoryId: "cat_skill_design",
    difficultyLevel: "intermediate",
    tags: ["ux", "research", "interviews", "product"],
    sortOrder: 200,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  // Product & Project Management
  skill_agile: {
    id: "skill_agile",
    slug: "agile-methodologies",
    title: "Agile Methodologies",
    description:
      "Iterative software delivery practices focused on collaboration, feedback, prioritization, and continuous improvement.",
    categoryId: "cat_skill_product",
    difficultyLevel: "beginner",
    tags: ["agile", "scrum", "product", "project-management"],
    sortOrder: 210,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  skill_product_strategy: {
    id: "skill_product_strategy",
    slug: "product-strategy",
    title: "Product Strategy",
    description:
      "Defining product goals, target users, value proposition, roadmap direction, and success metrics.",
    categoryId: "cat_skill_product",
    difficultyLevel: "advanced",
    tags: ["product", "strategy", "business", "planning"],
    sortOrder: 220,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  skill_project_management: {
    id: "skill_project_management",
    slug: "project-management",
    title: "Project Management",
    description:
      "Planning, organizing, tracking, and delivering project work within scope, time, and resource constraints.",
    categoryId: "cat_skill_product",
    difficultyLevel: "intermediate",
    tags: ["management", "planning", "delivery", "teamwork"],
    sortOrder: 230,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  skill_financial_analysis: {
    id: "skill_financial_analysis",
    slug: "financial-analysis",
    title: "Financial Analysis",
    description:
      "Evaluating budgets, costs, business performance, and project feasibility using structured financial thinking.",
    categoryId: "cat_skill_product",
    difficultyLevel: "advanced",
    tags: ["finance", "business", "analysis", "reporting"],
    sortOrder: 240,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  // Digital Marketing
  skill_seo: {
    id: "skill_seo",
    slug: "seo",
    title: "Search Engine Optimization",
    description:
      "Improving page structure, content quality, metadata, links, and search visibility for websites.",
    categoryId: "cat_skill_marketing",
    difficultyLevel: "intermediate",
    tags: ["marketing", "web", "growth", "content"],
    sortOrder: 250,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  skill_content_marketing: {
    id: "skill_content_marketing",
    slug: "content-marketing",
    title: "Content Marketing",
    description:
      "Planning and creating useful content for a clear audience with goals, channels, and success metrics.",
    categoryId: "cat_skill_marketing",
    difficultyLevel: "beginner",
    tags: ["marketing", "writing", "content", "communication"],
    sortOrder: 260,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  // Professional Skills
  skill_communication: {
    id: "skill_communication",
    slug: "effective-communication",
    title: "Effective Communication",
    description:
      "Explaining ideas clearly, listening actively, writing useful updates, and communicating professionally in teams.",
    categoryId: "cat_skill_soft",
    difficultyLevel: "all_levels",
    tags: ["professional", "soft-skill", "teamwork", "writing"],
    sortOrder: 270,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  skill_leadership: {
    id: "skill_leadership",
    slug: "leadership",
    title: "Leadership",
    description:
      "Guiding people toward a shared goal through responsibility, communication, decision-making, and accountability.",
    categoryId: "cat_skill_soft",
    difficultyLevel: "advanced",
    tags: ["professional", "leadership", "management", "teamwork"],
    sortOrder: 280,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
};