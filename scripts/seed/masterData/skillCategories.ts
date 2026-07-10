export const getSkillCategories = (timestamp: string): Record<string, any> => {
  const categories = [
    { id: "cat_programming", title: "Programming", slug: "programming-skills", description: "Core programming languages and paradigms.", sortOrder: 1 },
    { id: "cat_web_dev", title: "Web Development", slug: "web-development-skills", description: "Frontend and backend web technologies.", sortOrder: 2 },
    { id: "cat_mobile", title: "Mobile Development", slug: "mobile-development-skills", description: "iOS and Android app development.", sortOrder: 3 },
    { id: "cat_databases", title: "Databases", slug: "databases-skills", description: "Relational and non-relational database management.", sortOrder: 4 },
    { id: "cat_data_science", title: "Data Science", slug: "data-science-skills", description: "Data analysis, statistics, and visualization.", sortOrder: 5 },
    { id: "cat_ai", title: "Artificial Intelligence", slug: "artificial-intelligence-skills", description: "Machine learning, deep learning, and AI systems.", sortOrder: 6 },
    { id: "cat_cybersecurity", title: "Cybersecurity", slug: "cybersecurity-skills", description: "Network security, ethical hacking, and threat defense.", sortOrder: 7 },
    { id: "cat_cloud", title: "Cloud & DevOps", slug: "cloud-devops-skills", description: "Cloud platforms, containers, and DevOps practices.", sortOrder: 8 },
    { id: "cat_se", title: "Software Engineering", slug: "software-engineering-skills", description: "Engineering principles, testing, and version control.", sortOrder: 9 },
    { id: "cat_professional", title: "Professional Skills", slug: "professional-skills-cat", description: "Career and professional development skills.", sortOrder: 10 }
  ];

  const updates: Record<string, any> = {};
  categories.forEach(cat => {
    updates[`public_content/skill_categories/${cat.id}`] = {
      ...cat,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp
    };
  });
  return updates;
};
