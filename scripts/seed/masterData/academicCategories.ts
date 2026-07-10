import { Category } from "../../../src/types/database";

const now = new Date().toISOString();

export const academicCategories: Record<string, Category> = {
  cat_academic_cs: {
    id: "cat_academic_cs",
    slug: "computer-science-and-it",
    title: "Computer Science & IT",
    description: "Algorithms, programming, software engineering, databases, networking, and computing systems.",
    sortOrder: 10,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_academic_math: {
    id: "cat_academic_math",
    slug: "mathematics-and-statistics",
    title: "Mathematics & Statistics",
    description: "Discrete math, probability, statistics, linear algebra, and quantitative reasoning.",
    sortOrder: 20,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_academic_engineering: {
    id: "cat_academic_engineering",
    slug: "engineering",
    title: "Engineering",
    description: "Engineering design, systems thinking, infrastructure, electronics, and applied technology.",
    sortOrder: 30,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_academic_business: {
    id: "cat_academic_business",
    slug: "business-administration",
    title: "Business Administration",
    description: "Management, product strategy, marketing, accounting, operations, and business communication.",
    sortOrder: 40,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_academic_design: {
    id: "cat_academic_design",
    slug: "design-and-arts",
    title: "Design & Arts",
    description: "Visual design, product design, interaction design, prototyping, and creative communication.",
    sortOrder: 50,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_academic_science: {
    id: "cat_academic_science",
    slug: "natural-sciences",
    title: "Natural Sciences",
    description: "Physics, biology, chemistry, environmental science, and scientific reasoning.",
    sortOrder: 60,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_academic_humanities: {
    id: "cat_academic_humanities",
    slug: "humanities-and-social-sciences",
    title: "Humanities & Social Sciences",
    description: "Psychology, sociology, communication, history, literature, and critical thinking.",
    sortOrder: 70,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_academic_medicine: {
    id: "cat_academic_medicine",
    slug: "medicine-and-health",
    title: "Medicine & Health",
    description: "Healthcare, medical sciences, public health, nursing, and biomedical studies.",
    sortOrder: 80,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_academic_law: {
    id: "cat_academic_law",
    slug: "law-and-legal-studies",
    title: "Law & Legal Studies",
    description: "Legal reasoning, policy, compliance, governance, and professional ethics.",
    sortOrder: 90,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_academic_education: {
    id: "cat_academic_education",
    slug: "education-and-training",
    title: "Education & Training",
    description: "Learning design, teaching, academic planning, curriculum development, and student support.",
    sortOrder: 100,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
};