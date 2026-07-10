export const getCareerPathSkills = (timestamp: string): Record<string, any> => {
  const mappings = [
    // Frontend
    { careerPathId: "path_frontend_developer", skillId: "skill_html", importanceLevel: "core", minimumProficiencyLevel: "advanced", learningOrder: 1 },
    { careerPathId: "path_frontend_developer", skillId: "skill_css", importanceLevel: "core", minimumProficiencyLevel: "advanced", learningOrder: 2 },
    { careerPathId: "path_frontend_developer", skillId: "skill_javascript", importanceLevel: "core", minimumProficiencyLevel: "advanced", learningOrder: 3 },
    { careerPathId: "path_frontend_developer", skillId: "skill_react", importanceLevel: "core", minimumProficiencyLevel: "intermediate", learningOrder: 4 },
    { careerPathId: "path_frontend_developer", skillId: "skill_typescript", importanceLevel: "important", minimumProficiencyLevel: "intermediate", learningOrder: 5 },
    { careerPathId: "path_frontend_developer", skillId: "skill_git", importanceLevel: "important", minimumProficiencyLevel: "intermediate", learningOrder: 6 },
    { careerPathId: "path_frontend_developer", skillId: "skill_ui_ux", importanceLevel: "optional", minimumProficiencyLevel: "beginner", learningOrder: 7 },

    // Backend
    { careerPathId: "path_backend_developer", skillId: "skill_nodejs", importanceLevel: "core", minimumProficiencyLevel: "advanced", learningOrder: 1 },
    { careerPathId: "path_backend_developer", skillId: "skill_rest_apis", importanceLevel: "core", minimumProficiencyLevel: "advanced", learningOrder: 2 },
    { careerPathId: "path_backend_developer", skillId: "skill_sql", importanceLevel: "core", minimumProficiencyLevel: "intermediate", learningOrder: 3 },
    { careerPathId: "path_backend_developer", skillId: "skill_postgresql", importanceLevel: "important", minimumProficiencyLevel: "intermediate", learningOrder: 4 },
    { careerPathId: "path_backend_developer", skillId: "skill_git", importanceLevel: "important", minimumProficiencyLevel: "intermediate", learningOrder: 5 },
    { careerPathId: "path_backend_developer", skillId: "skill_docker", importanceLevel: "optional", minimumProficiencyLevel: "beginner", learningOrder: 6 },

    // Fullstack
    { careerPathId: "path_fullstack_dev", skillId: "skill_javascript", importanceLevel: "core", minimumProficiencyLevel: "advanced", learningOrder: 1 },
    { careerPathId: "path_fullstack_dev", skillId: "skill_react", importanceLevel: "core", minimumProficiencyLevel: "intermediate", learningOrder: 2 },
    { careerPathId: "path_fullstack_dev", skillId: "skill_nodejs", importanceLevel: "core", minimumProficiencyLevel: "intermediate", learningOrder: 3 },
    { careerPathId: "path_fullstack_dev", skillId: "skill_sql", importanceLevel: "important", minimumProficiencyLevel: "intermediate", learningOrder: 4 },
    { careerPathId: "path_fullstack_dev", skillId: "skill_nextjs", importanceLevel: "important", minimumProficiencyLevel: "beginner", learningOrder: 5 },
    { careerPathId: "path_fullstack_dev", skillId: "skill_git", importanceLevel: "important", minimumProficiencyLevel: "intermediate", learningOrder: 6 },

    // Mobile
    { careerPathId: "path_mobile_developer", skillId: "skill_javascript", importanceLevel: "core", minimumProficiencyLevel: "intermediate", learningOrder: 1 },
    { careerPathId: "path_mobile_developer", skillId: "skill_react", importanceLevel: "important", minimumProficiencyLevel: "intermediate", learningOrder: 2 },
    { careerPathId: "path_mobile_developer", skillId: "skill_java", importanceLevel: "optional", minimumProficiencyLevel: "beginner", learningOrder: 3 },
    { careerPathId: "path_mobile_developer", skillId: "skill_firebase", importanceLevel: "important", minimumProficiencyLevel: "intermediate", learningOrder: 4 },
    { careerPathId: "path_mobile_developer", skillId: "skill_ui_ux", importanceLevel: "optional", minimumProficiencyLevel: "beginner", learningOrder: 5 },

    // Data Analyst
    { careerPathId: "path_data_analyst", skillId: "skill_data_analysis", importanceLevel: "core", minimumProficiencyLevel: "advanced", learningOrder: 1 },
    { careerPathId: "path_data_analyst", skillId: "skill_sql", importanceLevel: "core", minimumProficiencyLevel: "intermediate", learningOrder: 2 },
    { careerPathId: "path_data_analyst", skillId: "skill_python", importanceLevel: "important", minimumProficiencyLevel: "intermediate", learningOrder: 3 },
    { careerPathId: "path_data_analyst", skillId: "skill_problem_solving", importanceLevel: "optional", minimumProficiencyLevel: "intermediate", learningOrder: 4 },

    // Data Scientist
    { careerPathId: "path_data_scientist", skillId: "skill_python", importanceLevel: "core", minimumProficiencyLevel: "advanced", learningOrder: 1 },
    { careerPathId: "path_data_scientist", skillId: "skill_data_analysis", importanceLevel: "core", minimumProficiencyLevel: "advanced", learningOrder: 2 },
    { careerPathId: "path_data_scientist", skillId: "skill_ml_basics", importanceLevel: "core", minimumProficiencyLevel: "intermediate", learningOrder: 3 },
    { careerPathId: "path_data_scientist", skillId: "skill_sql", importanceLevel: "important", minimumProficiencyLevel: "intermediate", learningOrder: 4 },

    // AI Engineer
    { careerPathId: "path_ai_engineer", skillId: "skill_python", importanceLevel: "core", minimumProficiencyLevel: "advanced", learningOrder: 1 },
    { careerPathId: "path_ai_engineer", skillId: "skill_ml_basics", importanceLevel: "core", minimumProficiencyLevel: "advanced", learningOrder: 2 },
    { careerPathId: "path_ai_engineer", skillId: "skill_cloud_fundamentals", importanceLevel: "important", minimumProficiencyLevel: "intermediate", learningOrder: 3 },
    { careerPathId: "path_ai_engineer", skillId: "skill_docker", importanceLevel: "optional", minimumProficiencyLevel: "beginner", learningOrder: 4 },

    // Cybersecurity
    { careerPathId: "path_cybersecurity_analyst", skillId: "skill_cyber_fundamentals", importanceLevel: "core", minimumProficiencyLevel: "advanced", learningOrder: 1 },
    { careerPathId: "path_cybersecurity_analyst", skillId: "skill_linux", importanceLevel: "core", minimumProficiencyLevel: "intermediate", learningOrder: 2 },
    { careerPathId: "path_cybersecurity_analyst", skillId: "skill_problem_solving", importanceLevel: "important", minimumProficiencyLevel: "advanced", learningOrder: 3 },
    { careerPathId: "path_cybersecurity_analyst", skillId: "skill_python", importanceLevel: "optional", minimumProficiencyLevel: "beginner", learningOrder: 4 },

    // Cloud Engineer
    { careerPathId: "path_cloud_engineer", skillId: "skill_cloud_fundamentals", importanceLevel: "core", minimumProficiencyLevel: "advanced", learningOrder: 1 },
    { careerPathId: "path_cloud_engineer", skillId: "skill_linux", importanceLevel: "core", minimumProficiencyLevel: "intermediate", learningOrder: 2 },
    { careerPathId: "path_cloud_engineer", skillId: "skill_docker", importanceLevel: "important", minimumProficiencyLevel: "intermediate", learningOrder: 3 },
    { careerPathId: "path_cloud_engineer", skillId: "skill_problem_solving", importanceLevel: "optional", minimumProficiencyLevel: "intermediate", learningOrder: 4 },

    // DevOps
    { careerPathId: "path_devops_engineer", skillId: "skill_linux", importanceLevel: "core", minimumProficiencyLevel: "advanced", learningOrder: 1 },
    { careerPathId: "path_devops_engineer", skillId: "skill_cloud_fundamentals", importanceLevel: "core", minimumProficiencyLevel: "intermediate", learningOrder: 2 },
    { careerPathId: "path_devops_engineer", skillId: "skill_docker", importanceLevel: "core", minimumProficiencyLevel: "advanced", learningOrder: 3 },
    { careerPathId: "path_devops_engineer", skillId: "skill_git", importanceLevel: "important", minimumProficiencyLevel: "advanced", learningOrder: 4 },
    { careerPathId: "path_devops_engineer", skillId: "skill_python", importanceLevel: "optional", minimumProficiencyLevel: "intermediate", learningOrder: 5 },

    // UI/UX
    { careerPathId: "path_ui_ux_designer", skillId: "skill_ui_ux", importanceLevel: "core", minimumProficiencyLevel: "advanced", learningOrder: 1 },
    { careerPathId: "path_ui_ux_designer", skillId: "skill_html", importanceLevel: "important", minimumProficiencyLevel: "intermediate", learningOrder: 2 },
    { careerPathId: "path_ui_ux_designer", skillId: "skill_css", importanceLevel: "important", minimumProficiencyLevel: "intermediate", learningOrder: 3 },
    { careerPathId: "path_ui_ux_designer", skillId: "skill_problem_solving", importanceLevel: "optional", minimumProficiencyLevel: "intermediate", learningOrder: 4 },

    // QA
    { careerPathId: "path_qa_tester", skillId: "skill_testing", importanceLevel: "core", minimumProficiencyLevel: "advanced", learningOrder: 1 },
    { careerPathId: "path_qa_tester", skillId: "skill_problem_solving", importanceLevel: "core", minimumProficiencyLevel: "intermediate", learningOrder: 2 },
    { careerPathId: "path_qa_tester", skillId: "skill_javascript", importanceLevel: "important", minimumProficiencyLevel: "beginner", learningOrder: 3 },
    { careerPathId: "path_qa_tester", skillId: "skill_technical_writing", importanceLevel: "optional", minimumProficiencyLevel: "intermediate", learningOrder: 4 }
  ];

  const updates: Record<string, any> = {};
  
  mappings.forEach((mapping) => {
    updates[`relations/career_path_skills/${mapping.careerPathId}/${mapping.skillId}`] = {
      importanceLevel: mapping.importanceLevel,
      minimumProficiencyLevel: mapping.minimumProficiencyLevel,
      learningOrder: mapping.learningOrder,
      createdAt: timestamp,
      updatedAt: timestamp
    };
  });

  return updates;
};
