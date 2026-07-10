/**
 * Master Resources for the Beacon Platform.
 * - All resources live under public_content/resources (single source of truth).
 * - IDs are explicit and stable (not auto-generated counters) for referential integrity.
 * - sourceType: "external" requires a real HTTPS url.
 * - sourceType: "internal" must NOT have a url field.
 * - resourceType must be one of the allowed enum values.
 * - difficultyLevel must match the schema enum.
 */

type ResourceEntry = {
  id: string;
  slug: string;
  title: string;
  description: string;
  provider: string;
  url?: string;
  sourceType: "internal" | "external";
  resourceType: "Course" | "Guide" | "Documentation" | "Practice" | "Tool" | "Roadmap" | "Template" | "Checklist" | "Article";
  language: "en" | "ar";
  difficultyLevel: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  estimatedDuration?: string;
  isFree: boolean;
  qualityScore: number;
  skillIds: string[];
  careerPathIds: string[];
  academicCategoryIds: string[];
  tags: string[];
};

const RESOURCES: ResourceEntry[] = [
  // ───────────────────────────────────────────────
  // Web Fundamentals
  // ───────────────────────────────────────────────
  {
    id: "res_mdn_html",
    slug: "mdn-web-docs-html",
    title: "MDN Web Docs: HTML",
    description: "The definitive reference and learning guide for HTML — the backbone of every web page.",
    provider: "Mozilla",
    url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
    sourceType: "external",
    resourceType: "Documentation",
    language: "en",
    difficultyLevel: "All Levels",
    estimatedDuration: "Self-paced",
    isFree: true,
    qualityScore: 98,
    skillIds: ["skill_html"],
    careerPathIds: ["path_frontend_developer", "path_fullstack_developer"],
    academicCategoryIds: [],
    tags: ["HTML", "Web", "Documentation", "Mozilla"]
  },
  {
    id: "res_mdn_css",
    slug: "mdn-web-docs-css",
    title: "MDN Web Docs: CSS",
    description: "Comprehensive documentation and learning resource for CSS styling and layout.",
    provider: "Mozilla",
    url: "https://developer.mozilla.org/en-US/docs/Web/CSS",
    sourceType: "external",
    resourceType: "Documentation",
    language: "en",
    difficultyLevel: "All Levels",
    estimatedDuration: "Self-paced",
    isFree: true,
    qualityScore: 98,
    skillIds: ["skill_css"],
    careerPathIds: ["path_frontend_developer", "path_fullstack_developer"],
    academicCategoryIds: [],
    tags: ["CSS", "Web", "Styling", "Documentation"]
  },
  {
    id: "res_javascript_info",
    slug: "javascript-info-modern-tutorial",
    title: "The Modern JavaScript Tutorial",
    description: "From basics to advanced JavaScript topics with concise, yet detailed explanations.",
    provider: "javascript.info",
    url: "https://javascript.info/",
    sourceType: "external",
    resourceType: "Guide",
    language: "en",
    difficultyLevel: "All Levels",
    estimatedDuration: "40+ hours",
    isFree: true,
    qualityScore: 97,
    skillIds: ["skill_javascript"],
    careerPathIds: ["path_frontend_developer", "path_fullstack_developer", "path_backend_developer"],
    academicCategoryIds: [],
    tags: ["JavaScript", "Tutorial", "Programming"]
  },
  {
    id: "res_react_docs",
    slug: "react-official-documentation",
    title: "React Official Documentation",
    description: "Learn how to build user interfaces with React — the official guide from Meta.",
    provider: "Meta",
    url: "https://react.dev/learn",
    sourceType: "external",
    resourceType: "Documentation",
    language: "en",
    difficultyLevel: "All Levels",
    estimatedDuration: "Self-paced",
    isFree: true,
    qualityScore: 97,
    skillIds: ["skill_react"],
    careerPathIds: ["path_frontend_developer", "path_fullstack_developer"],
    academicCategoryIds: [],
    tags: ["React", "UI", "Frontend", "Meta"]
  },
  {
    id: "res_nextjs_learn",
    slug: "nextjs-official-learn-course",
    title: "Next.js Official Learn Course",
    description: "The official interactive course for learning Next.js fundamentals — from routing to deployment.",
    provider: "Vercel",
    url: "https://nextjs.org/learn",
    sourceType: "external",
    resourceType: "Course",
    language: "en",
    difficultyLevel: "Intermediate",
    estimatedDuration: "10 hours",
    isFree: true,
    qualityScore: 96,
    skillIds: ["skill_nextjs", "skill_react"],
    careerPathIds: ["path_fullstack_developer", "path_frontend_developer"],
    academicCategoryIds: [],
    tags: ["Next.js", "SSR", "React", "Vercel"]
  },
  {
    id: "res_nodejs_guides",
    slug: "nodejs-official-guides",
    title: "Node.js Official Guides",
    description: "Official Node.js guides and documentation for backend JavaScript development.",
    provider: "OpenJS Foundation",
    url: "https://nodejs.org/en/docs/guides/",
    sourceType: "external",
    resourceType: "Documentation",
    language: "en",
    difficultyLevel: "Intermediate",
    estimatedDuration: "Self-paced",
    isFree: true,
    qualityScore: 95,
    skillIds: ["skill_nodejs", "skill_rest_apis"],
    careerPathIds: ["path_backend_developer", "path_fullstack_developer"],
    academicCategoryIds: [],
    tags: ["Node.js", "Backend", "JavaScript"]
  },

  // ───────────────────────────────────────────────
  // Programming Languages
  // ───────────────────────────────────────────────
  {
    id: "res_python_tutorial",
    slug: "python-official-tutorial",
    title: "Python Official Tutorial",
    description: "The standard tutorial for learning Python — from the creators of the language.",
    provider: "Python Software Foundation",
    url: "https://docs.python.org/3/tutorial/",
    sourceType: "external",
    resourceType: "Guide",
    language: "en",
    difficultyLevel: "All Levels",
    estimatedDuration: "20 hours",
    isFree: true,
    qualityScore: 96,
    skillIds: ["skill_python"],
    careerPathIds: ["path_data_scientist", "path_data_analyst", "path_ai_engineer"],
    academicCategoryIds: [],
    tags: ["Python", "Programming", "Official"]
  },
  {
    id: "res_java_learn",
    slug: "java-programming-basics",
    title: "Java Programming — dev.java",
    description: "A comprehensive guide to learning Java from scratch, hosted by Oracle's official Java portal.",
    provider: "Oracle",
    url: "https://dev.java/learn/",
    sourceType: "external",
    resourceType: "Guide",
    language: "en",
    difficultyLevel: "Beginner",
    estimatedDuration: "20 hours",
    isFree: true,
    qualityScore: 93,
    skillIds: ["skill_java"],
    careerPathIds: ["path_backend_developer", "path_mobile_developer"],
    academicCategoryIds: [],
    tags: ["Java", "Programming", "OOP", "Oracle"]
  },

  // ───────────────────────────────────────────────
  // Databases
  // ───────────────────────────────────────────────
  {
    id: "res_postgresql_tutorial",
    slug: "postgresql-tutorial",
    title: "PostgreSQL Tutorial",
    description: "Learn PostgreSQL with practical examples covering everything from basics to advanced queries.",
    provider: "PostgreSQL Tutorial",
    url: "https://www.postgresqltutorial.com/",
    sourceType: "external",
    resourceType: "Course",
    language: "en",
    difficultyLevel: "Beginner",
    estimatedDuration: "15 hours",
    isFree: true,
    qualityScore: 92,
    skillIds: ["skill_postgresql", "skill_sql"],
    careerPathIds: ["path_backend_developer", "path_data_analyst", "path_fullstack_developer"],
    academicCategoryIds: [],
    tags: ["SQL", "Database", "PostgreSQL"]
  },
  {
    id: "res_supabase_docs",
    slug: "supabase-documentation",
    title: "Supabase Documentation",
    description: "Official guides to building apps with Supabase — the open-source Firebase alternative.",
    provider: "Supabase",
    url: "https://supabase.com/docs",
    sourceType: "external",
    resourceType: "Documentation",
    language: "en",
    difficultyLevel: "Intermediate",
    estimatedDuration: "Self-paced",
    isFree: true,
    qualityScore: 94,
    skillIds: ["skill_supabase"],
    careerPathIds: ["path_fullstack_developer", "path_frontend_developer"],
    academicCategoryIds: [],
    tags: ["Supabase", "BaaS", "Database"]
  },

  // ───────────────────────────────────────────────
  // Cloud & DevOps
  // ───────────────────────────────────────────────
  {
    id: "res_aws_cloud_practitioner",
    slug: "aws-cloud-practitioner-essentials",
    title: "AWS Cloud Practitioner Essentials",
    description: "Learn the fundamentals of the AWS Cloud — services, pricing, architecture, and support.",
    provider: "Amazon Web Services",
    url: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/",
    sourceType: "external",
    resourceType: "Course",
    language: "en",
    difficultyLevel: "Beginner",
    estimatedDuration: "6 hours",
    isFree: true,
    qualityScore: 95,
    skillIds: ["skill_cloud_fundamentals", "skill_aws"],
    careerPathIds: ["path_cloud_engineer", "path_devops_engineer"],
    academicCategoryIds: [],
    tags: ["Cloud", "AWS", "Certification"]
  },
  {
    id: "res_firebase_docs",
    slug: "firebase-documentation",
    title: "Firebase Documentation",
    description: "Comprehensive official guides on using Firebase products including RTDB, Auth, Firestore, and Storage.",
    provider: "Google",
    url: "https://firebase.google.com/docs",
    sourceType: "external",
    resourceType: "Documentation",
    language: "en",
    difficultyLevel: "All Levels",
    estimatedDuration: "Self-paced",
    isFree: true,
    qualityScore: 95,
    skillIds: ["skill_firebase"],
    careerPathIds: ["path_mobile_developer", "path_fullstack_developer"],
    academicCategoryIds: [],
    tags: ["Firebase", "BaaS", "Google", "Backend"]
  },

  // ───────────────────────────────────────────────
  // Version Control
  // ───────────────────────────────────────────────
  {
    id: "res_pro_git_book",
    slug: "pro-git-book",
    title: "Pro Git Book",
    description: "The complete book on Git version control — everything from basics to advanced branching strategies.",
    provider: "Git",
    url: "https://git-scm.com/book/en/v2",
    sourceType: "external",
    resourceType: "Guide",
    language: "en",
    difficultyLevel: "All Levels",
    estimatedDuration: "Self-paced",
    isFree: true,
    qualityScore: 96,
    skillIds: ["skill_git"],
    careerPathIds: ["path_frontend_developer", "path_backend_developer", "path_devops_engineer", "path_fullstack_developer"],
    academicCategoryIds: [],
    tags: ["Git", "Version Control", "GitHub"]
  },

  // ───────────────────────────────────────────────
  // Roadmaps
  // ───────────────────────────────────────────────
  {
    id: "res_frontend_roadmap",
    slug: "frontend-developer-roadmap",
    title: "Frontend Developer Roadmap",
    description: "Step-by-step guide to becoming a modern frontend developer — maintained by the community.",
    provider: "Roadmap.sh",
    url: "https://roadmap.sh/frontend",
    sourceType: "external",
    resourceType: "Roadmap",
    language: "en",
    difficultyLevel: "All Levels",
    estimatedDuration: "Ongoing",
    isFree: true,
    qualityScore: 94,
    skillIds: ["skill_html", "skill_css", "skill_javascript", "skill_react"],
    careerPathIds: ["path_frontend_developer", "path_fullstack_developer"],
    academicCategoryIds: [],
    tags: ["Roadmap", "Frontend", "Career"]
  },
  {
    id: "res_backend_roadmap",
    slug: "backend-developer-roadmap",
    title: "Backend Developer Roadmap",
    description: "Step-by-step guide to becoming a modern backend developer — servers, APIs, databases, and more.",
    provider: "Roadmap.sh",
    url: "https://roadmap.sh/backend",
    sourceType: "external",
    resourceType: "Roadmap",
    language: "en",
    difficultyLevel: "All Levels",
    estimatedDuration: "Ongoing",
    isFree: true,
    qualityScore: 94,
    skillIds: ["skill_nodejs", "skill_sql", "skill_rest_apis"],
    careerPathIds: ["path_backend_developer", "path_fullstack_developer"],
    academicCategoryIds: [],
    tags: ["Roadmap", "Backend", "Career"]
  },
  {
    id: "res_android_roadmap",
    slug: "android-developer-roadmap",
    title: "Android Developer Roadmap",
    description: "Community-maintained roadmap for becoming an Android developer with Kotlin and Java.",
    provider: "Roadmap.sh",
    url: "https://roadmap.sh/android",
    sourceType: "external",
    resourceType: "Roadmap",
    language: "en",
    difficultyLevel: "All Levels",
    estimatedDuration: "Ongoing",
    isFree: true,
    qualityScore: 92,
    skillIds: ["skill_kotlin", "skill_java"],
    careerPathIds: ["path_mobile_developer"],
    academicCategoryIds: [],
    tags: ["Roadmap", "Android", "Mobile"]
  },

  // ───────────────────────────────────────────────
  // Data Science & AI
  // ───────────────────────────────────────────────
  {
    id: "res_data_analysis_python",
    slug: "data-analysis-with-python",
    title: "Data Analysis with Python",
    description: "Learn how to analyze data using Python, NumPy, Pandas, and Matplotlib — a free certified course.",
    provider: "freeCodeCamp",
    url: "https://www.freecodecamp.org/learn/data-analysis-with-python/",
    sourceType: "external",
    resourceType: "Course",
    language: "en",
    difficultyLevel: "Beginner",
    estimatedDuration: "25 hours",
    isFree: true,
    qualityScore: 93,
    skillIds: ["skill_data_analysis", "skill_python"],
    careerPathIds: ["path_data_analyst", "path_data_scientist"],
    academicCategoryIds: [],
    tags: ["Data Analysis", "Python", "freeCodeCamp"]
  },
  {
    id: "res_ml_crash_course",
    slug: "machine-learning-crash-course",
    title: "Machine Learning Crash Course",
    description: "Google's fast-paced, practical introduction to machine learning — with TensorFlow APIs.",
    provider: "Google",
    url: "https://developers.google.com/machine-learning/crash-course",
    sourceType: "external",
    resourceType: "Course",
    language: "en",
    difficultyLevel: "Beginner",
    estimatedDuration: "15 hours",
    isFree: true,
    qualityScore: 95,
    skillIds: ["skill_ml_basics"],
    careerPathIds: ["path_ai_engineer", "path_data_scientist"],
    academicCategoryIds: [],
    tags: ["Machine Learning", "AI", "TensorFlow", "Google"]
  },

  // ───────────────────────────────────────────────
  // Mobile Development
  // ───────────────────────────────────────────────
  {
    id: "res_android_basics_kotlin",
    slug: "android-basics-in-kotlin",
    title: "Android Basics in Kotlin",
    description: "Take your first steps as an Android developer with Kotlin — an official Google course.",
    provider: "Google",
    url: "https://developer.android.com/courses/android-basics-kotlin/course",
    sourceType: "external",
    resourceType: "Course",
    language: "en",
    difficultyLevel: "Beginner",
    estimatedDuration: "20 hours",
    isFree: true,
    qualityScore: 94,
    skillIds: ["skill_java", "skill_kotlin"],
    careerPathIds: ["path_mobile_developer"],
    academicCategoryIds: [],
    tags: ["Android", "Mobile", "Kotlin", "Google"]
  },

  // ───────────────────────────────────────────────
  // QA & Testing
  // ───────────────────────────────────────────────
  {
    id: "res_testing_guide",
    slug: "practical-test-pyramid-guide",
    title: "The Practical Test Pyramid",
    description: "A comprehensive guide to unit testing, integration testing, and E2E testing strategies.",
    provider: "Martin Fowler",
    url: "https://martinfowler.com/articles/practical-test-pyramid.html",
    sourceType: "external",
    resourceType: "Article",
    language: "en",
    difficultyLevel: "Intermediate",
    estimatedDuration: "2 hours",
    isFree: true,
    qualityScore: 95,
    skillIds: ["skill_testing"],
    careerPathIds: ["path_qa_tester", "path_backend_developer"],
    academicCategoryIds: [],
    tags: ["Testing", "QA", "Unit Testing", "E2E"]
  },
  {
    id: "res_selenium_tutorial",
    slug: "selenium-webdriver-tutorial",
    title: "Selenium WebDriver Tutorial",
    description: "Learn how to automate web application testing with Selenium WebDriver from scratch.",
    provider: "Guru99",
    url: "https://www.guru99.com/selenium-tutorial.html",
    sourceType: "external",
    resourceType: "Guide",
    language: "en",
    difficultyLevel: "Beginner",
    estimatedDuration: "10 hours",
    isFree: true,
    qualityScore: 88,
    skillIds: ["skill_testing"],
    careerPathIds: ["path_qa_tester"],
    academicCategoryIds: [],
    tags: ["Selenium", "QA", "Automation", "Testing"]
  },

  // ───────────────────────────────────────────────
  // Academic Resources (internal — no URL)
  // ───────────────────────────────────────────────
  {
    id: "res_exam_prep_strategy",
    slug: "exam-preparation-strategy-guide",
    title: "CS Exam Preparation Strategy Guide",
    description: "Proven strategies for preparing for computer science exams, including spaced repetition, active recall, and practice problem techniques.",
    provider: "Beacon Platform",
    sourceType: "internal",
    resourceType: "Guide",
    language: "en",
    difficultyLevel: "All Levels",
    estimatedDuration: "1 hour",
    isFree: true,
    qualityScore: 90,
    skillIds: ["skill_problem_solving"],
    careerPathIds: [],
    academicCategoryIds: ["acat_exam", "acat_study"],
    tags: ["Exam", "Strategy", "Study", "Academic"]
  },
  {
    id: "res_github_profile_guide",
    slug: "github-portfolio-guide",
    title: "Building a Professional GitHub Portfolio",
    description: "How to set up a standout GitHub profile: READMEs, pinned repos, contribution graphs, and showcasing projects.",
    provider: "Beacon Platform",
    sourceType: "internal",
    resourceType: "Guide",
    language: "en",
    difficultyLevel: "All Levels",
    estimatedDuration: "1 hour",
    isFree: true,
    qualityScore: 91,
    skillIds: ["skill_git"],
    careerPathIds: [],
    academicCategoryIds: ["acat_github"],
    tags: ["GitHub", "Portfolio", "Branding", "Career"]
  },
  {
    id: "res_linkedin_guide",
    slug: "linkedin-profile-optimization-devs",
    title: "LinkedIn Profile Optimization for CS Students",
    description: "How to craft your headline, summary, skills, and experience section to get noticed by tech recruiters.",
    provider: "Beacon Platform",
    sourceType: "internal",
    resourceType: "Guide",
    language: "en",
    difficultyLevel: "All Levels",
    estimatedDuration: "45 minutes",
    isFree: true,
    qualityScore: 90,
    skillIds: [],
    careerPathIds: [],
    academicCategoryIds: ["acat_linkedin", "acat_internship"],
    tags: ["LinkedIn", "Networking", "Career", "Job Search"]
  },
  {
    id: "res_presentation_checklist",
    slug: "technical-presentation-checklist",
    title: "Technical Presentation Checklist",
    description: "A structured checklist for delivering clear, confident technical presentations to both technical and non-technical audiences.",
    provider: "Beacon Platform",
    sourceType: "internal",
    resourceType: "Checklist",
    language: "en",
    difficultyLevel: "All Levels",
    estimatedDuration: "30 minutes",
    isFree: true,
    qualityScore: 89,
    skillIds: ["skill_technical_writing"],
    careerPathIds: [],
    academicCategoryIds: ["acat_presentation", "acat_report"],
    tags: ["Presentation", "Communication", "Checklist"]
  },
  {
    id: "res_study_planner",
    slug: "ultimate-study-planner-template",
    title: "Ultimate Study Planner Template",
    description: "A comprehensive study planning template to organize courses, assignments, and exam schedules throughout the semester.",
    provider: "Beacon Platform",
    sourceType: "internal",
    resourceType: "Template",
    language: "en",
    difficultyLevel: "All Levels",
    estimatedDuration: "30 minutes",
    isFree: true,
    qualityScore: 91,
    skillIds: ["skill_problem_solving"],
    careerPathIds: [],
    academicCategoryIds: ["acat_study", "acat_time"],
    tags: ["Study", "Planning", "Template", "Time Management"]
  },
  {
    id: "res_cv_template",
    slug: "technical-resume-template",
    title: "Technical Resume Template for CS Students",
    description: "A clean, ATS-optimized resume template tailored specifically for computer science graduates and students.",
    provider: "Beacon Platform",
    sourceType: "internal",
    resourceType: "Template",
    language: "en",
    difficultyLevel: "All Levels",
    estimatedDuration: "1 hour",
    isFree: true,
    qualityScore: 93,
    skillIds: [],
    careerPathIds: [],
    academicCategoryIds: ["acat_cv", "acat_internship"],
    tags: ["Resume", "CV", "Jobs", "Template"]
  },
  {
    id: "res_graduation_proposal",
    slug: "graduation-project-proposal-template",
    title: "Graduation Project Proposal Template",
    description: "A standard template for drafting your graduation project proposal, including problem statement, objectives, and methodology.",
    provider: "Beacon Platform",
    sourceType: "internal",
    resourceType: "Template",
    language: "en",
    difficultyLevel: "Advanced",
    estimatedDuration: "3 hours",
    isFree: true,
    qualityScore: 92,
    skillIds: ["skill_technical_writing"],
    careerPathIds: [],
    academicCategoryIds: ["acat_graduation", "acat_report"],
    tags: ["Project", "Proposal", "Graduation", "Template"]
  }
];

export const getResources = (timestamp: string): Record<string, any> => {
  const updates: Record<string, any> = {};

  RESOURCES.forEach((resource) => {
    const node: Record<string, any> = {
      id: resource.id,
      slug: resource.slug,
      title: resource.title,
      description: resource.description,
      provider: resource.provider,
      sourceType: resource.sourceType,
      resourceType: resource.resourceType,
      language: resource.language,
      difficultyLevel: resource.difficultyLevel,
      isFree: resource.isFree,
      isActive: true,
      qualityScore: resource.qualityScore,
      skillIds: resource.skillIds,
      careerPathIds: resource.careerPathIds,
      academicCategoryIds: resource.academicCategoryIds,
      tags: resource.tags,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Only add url for external resources with a real URL
    if (resource.sourceType === "external" && resource.url) {
      node.url = resource.url;
    }

    if (resource.estimatedDuration) {
      node.estimatedDuration = resource.estimatedDuration;
    }

    updates[`public_content/resources/${resource.id}`] = node;
  });

  console.log(`Generated ${RESOURCES.length} professional resources in memory.`);
  return updates;
};

// Export for use in index builders
export { RESOURCES };
