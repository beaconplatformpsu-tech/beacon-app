export const getCareerCategories = (timestamp: string): Record<string, any> => {
  const categories = [
    { id: "ccat_frontend", title: "Frontend Development", slug: "frontend-development-careers", description: "Careers building user-facing web applications.", sortOrder: 1 },
    { id: "ccat_backend", title: "Backend Development", slug: "backend-development-careers", description: "Careers building servers, APIs, and databases.", sortOrder: 2 },
    { id: "ccat_fullstack", title: "Full Stack Development", slug: "full-stack-development-careers", description: "Careers spanning both frontend and backend.", sortOrder: 3 },
    { id: "ccat_mobile", title: "Mobile Development", slug: "mobile-development-careers", description: "Careers building iOS and Android applications.", sortOrder: 4 },
    { id: "ccat_data", title: "Data Science", slug: "data-science-careers", description: "Careers in data analysis, science, and engineering.", sortOrder: 5 },
    { id: "ccat_ai", title: "AI and Machine Learning", slug: "ai-and-machine-learning-careers", description: "Careers building intelligent systems and models.", sortOrder: 6 },
    { id: "ccat_cyber", title: "Cybersecurity", slug: "cybersecurity-careers", description: "Careers protecting digital assets and systems.", sortOrder: 7 },
    { id: "ccat_cloud", title: "Cloud and DevOps", slug: "cloud-and-devops-careers", description: "Careers in cloud infrastructure and DevOps engineering.", sortOrder: 8 },
    { id: "ccat_uiux", title: "UI/UX Design", slug: "ui-ux-design-careers", description: "Careers designing intuitive user interfaces and experiences.", sortOrder: 9 },
    { id: "ccat_product", title: "Product and Project Management", slug: "product-and-project-management-careers", description: "Careers managing software products and teams.", sortOrder: 10 }
  ];

  const updates: Record<string, any> = {};
  categories.forEach(cat => {
    updates[`public_content/career_categories/${cat.id}`] = {
      ...cat,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp
    };
  });
  return updates;
};
