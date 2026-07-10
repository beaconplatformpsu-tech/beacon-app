import { Category } from "../../../src/types/database";

const now = new Date().toISOString();

export const skillCategories: Record<string, Category> = {
  cat_skill_programming: {
    id: "cat_skill_programming",
    slug: "programming",
    title: "Programming",
    description: "Core programming languages, logic, syntax, and software development foundations.",
    sortOrder: 10,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_skill_web_frontend: {
    id: "cat_skill_web_frontend",
    slug: "web-frontend",
    title: "Web Frontend",
    description: "Frontend development skills for building interactive, responsive user interfaces.",
    sortOrder: 20,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_skill_backend: {
    id: "cat_skill_backend",
    slug: "backend-development",
    title: "Backend Development",
    description: "Server-side development, APIs, databases, and application architecture.",
    sortOrder: 30,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_skill_data: {
    id: "cat_skill_data",
    slug: "data-analysis",
    title: "Data Analysis",
    description: "Skills for cleaning, analyzing, querying, and visualizing data.",
    sortOrder: 40,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_skill_ai: {
    id: "cat_skill_ai",
    slug: "ai-and-machine-learning",
    title: "AI & Machine Learning",
    description: "Machine learning, deep learning, model evaluation, and AI-assisted workflows.",
    sortOrder: 50,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_skill_cloud: {
    id: "cat_skill_cloud",
    slug: "cloud-and-devops",
    title: "Cloud & DevOps",
    description: "Cloud platforms, containers, deployment pipelines, and infrastructure practices.",
    sortOrder: 60,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_skill_security: {
    id: "cat_skill_security",
    slug: "cybersecurity",
    title: "Cybersecurity",
    description: "Defensive security, web security, network security, and secure development basics.",
    sortOrder: 70,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_skill_design: {
    id: "cat_skill_design",
    slug: "ui-ux-design",
    title: "UI/UX Design",
    description: "User research, wireframing, prototyping, interface design, and usability thinking.",
    sortOrder: 80,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_skill_product: {
    id: "cat_skill_product",
    slug: "product-and-project-management",
    title: "Product & Project Management",
    description: "Product strategy, Agile planning, requirements writing, and project delivery skills.",
    sortOrder: 90,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_skill_marketing: {
    id: "cat_skill_marketing",
    slug: "digital-marketing",
    title: "Digital Marketing",
    description: "SEO, content planning, digital campaigns, and marketing communication basics.",
    sortOrder: 100,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_skill_soft: {
    id: "cat_skill_soft",
    slug: "professional-skills",
    title: "Professional Skills",
    description: "Communication, teamwork, leadership, reporting, and workplace readiness skills.",
    sortOrder: 110,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
};