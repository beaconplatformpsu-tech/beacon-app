export const getAcademicCategories = (timestamp: string): Record<string, any> => {
  const categories = [
    { id: "acat_study", title: "Study Planning", slug: "study-planning", description: "Resources for organizing study sessions and academic planning.", sortOrder: 1 },
    { id: "acat_exam", title: "Exam Preparation", slug: "exam-preparation", description: "Strategies and resources for preparing for technical exams.", sortOrder: 2 },
    { id: "acat_research", title: "Research Methodology", slug: "research-methodology", description: "Guides for conducting academic research and literature reviews.", sortOrder: 3 },
    { id: "acat_report", title: "Report Writing", slug: "report-writing", description: "Templates and guidance for academic and technical report writing.", sortOrder: 4 },
    { id: "acat_presentation", title: "Presentation Skills", slug: "presentation-skills", description: "Resources to improve technical and academic presentation skills.", sortOrder: 5 },
    { id: "acat_graduation", title: "Graduation Project", slug: "graduation-project", description: "Guides for planning and executing graduation projects.", sortOrder: 6 },
    { id: "acat_internship", title: "Internship Preparation", slug: "internship-preparation", description: "Resources to prepare for and find internship opportunities.", sortOrder: 7 },
    { id: "acat_cv", title: "CV and Resume", slug: "cv-and-resume", description: "Templates and best practices for computer science CVs.", sortOrder: 8 },
    { id: "acat_linkedin", title: "LinkedIn Profile", slug: "linkedin-profile", description: "Guides for building a strong professional LinkedIn presence.", sortOrder: 9 },
    { id: "acat_github", title: "GitHub Portfolio", slug: "github-portfolio", description: "Resources for creating a standout GitHub developer portfolio.", sortOrder: 10 },
    { id: "acat_time", title: "Time Management", slug: "time-management", description: "Strategies for managing time effectively during studies.", sortOrder: 11 },
    { id: "acat_academic_writing", title: "Academic Writing", slug: "academic-writing", description: "Guides for writing academic papers, theses, and dissertations.", sortOrder: 12 }
  ];

  const updates: Record<string, any> = {};
  categories.forEach(cat => {
    updates[`public_content/academic_categories/${cat.id}`] = {
      ...cat,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp
    };
  });
  return updates;
};
