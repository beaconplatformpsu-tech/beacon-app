import { Category } from "../../../src/types/database";

const now = new Date().toISOString();

export const careerCategories: Record<string, Category> = {
  cat_career_tech: {
    id: "cat_career_tech",
    slug: "technology-and-software",
    title: "Technology & Software",
    description: "Software engineering, web development, backend systems, and application development careers.",
    sortOrder: 10,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_career_data: {
    id: "cat_career_data",
    slug: "data-and-ai",
    title: "Data & AI",
    description: "Data science, analytics, machine learning, and artificial intelligence careers.",
    sortOrder: 20,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_career_cloud: {
    id: "cat_career_cloud",
    slug: "cloud-and-infrastructure",
    title: "Cloud & Infrastructure",
    description: "Cloud engineering, DevOps, infrastructure design, and deployment careers.",
    sortOrder: 30,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_career_security: {
    id: "cat_career_security",
    slug: "security-and-compliance",
    title: "Security & Compliance",
    description: "Cybersecurity, risk management, secure systems, and compliance-focused careers.",
    sortOrder: 40,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_career_design: {
    id: "cat_career_design",
    slug: "design-and-creative",
    title: "Design & Creative",
    description: "UI/UX design, product design, user research, and digital product experience careers.",
    sortOrder: 50,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_career_business: {
    id: "cat_career_business",
    slug: "business-and-product",
    title: "Business & Product",
    description: "Product management, business operations, strategy, and project leadership careers.",
    sortOrder: 60,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_career_marketing: {
    id: "cat_career_marketing",
    slug: "marketing-and-growth",
    title: "Marketing & Growth",
    description: "Digital marketing, SEO, content strategy, brand growth, and campaign management careers.",
    sortOrder: 70,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_career_finance: {
    id: "cat_career_finance",
    slug: "finance-and-accounting",
    title: "Finance & Accounting",
    description: "Financial analysis, accounting, budgeting, and business reporting careers.",
    sortOrder: 80,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_career_education: {
    id: "cat_career_education",
    slug: "education-and-training",
    title: "Education & Training",
    description: "Teaching, instructional design, academic support, and training careers.",
    sortOrder: 90,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },

  cat_career_healthcare: {
    id: "cat_career_healthcare",
    slug: "healthcare-and-medicine",
    title: "Healthcare & Medicine",
    description: "Healthcare, medical administration, public health, and health technology careers.",
    sortOrder: 100,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
};