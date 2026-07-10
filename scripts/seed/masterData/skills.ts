export const getSkills = (timestamp: string): Record<string, any> => {
  const skills = [
    {
      id: "skill_html", slug: "html", title: "HTML", name: "HTML",
      description: "The standard markup language for creating web pages and web applications.",
      categoryId: "cat_web_dev", difficultyLevel: "Beginner", sortOrder: 1,
      tags: ["web", "markup", "frontend"], isActive: true
    },
    {
      id: "skill_css", slug: "css", title: "CSS", name: "CSS",
      description: "The stylesheet language used to style HTML documents for visual presentation.",
      categoryId: "cat_web_dev", difficultyLevel: "Beginner", sortOrder: 2,
      tags: ["web", "styling", "frontend"], isActive: true
    },
    {
      id: "skill_javascript", slug: "javascript", title: "JavaScript", name: "JavaScript",
      description: "The programming language of the web, enabling dynamic and interactive experiences.",
      categoryId: "cat_programming", difficultyLevel: "Intermediate", sortOrder: 3,
      tags: ["programming", "web", "scripting"], isActive: true
    },
    {
      id: "skill_typescript", slug: "typescript", title: "TypeScript", name: "TypeScript",
      description: "A strongly typed superset of JavaScript that compiles to plain JavaScript.",
      categoryId: "cat_programming", difficultyLevel: "Intermediate", sortOrder: 4,
      tags: ["programming", "web", "types"], isActive: true
    },
    {
      id: "skill_react", slug: "react", title: "React", name: "React",
      description: "A JavaScript library for building user interfaces with reusable components.",
      categoryId: "cat_web_dev", difficultyLevel: "Intermediate", sortOrder: 5,
      tags: ["frontend", "ui", "library"], isActive: true
    },
    {
      id: "skill_nextjs", slug: "nextjs", title: "Next.js", name: "Next.js",
      description: "A React framework for production — with hybrid static & server rendering.",
      categoryId: "cat_web_dev", difficultyLevel: "Intermediate", sortOrder: 6,
      tags: ["react", "ssr", "framework"], isActive: true
    },
    {
      id: "skill_nodejs", slug: "nodejs", title: "Node.js", name: "Node.js",
      description: "A JavaScript runtime built on Chrome's V8 engine for building server-side applications.",
      categoryId: "cat_web_dev", difficultyLevel: "Intermediate", sortOrder: 7,
      tags: ["backend", "javascript", "server"], isActive: true
    },
    {
      id: "skill_python", slug: "python", title: "Python", name: "Python",
      description: "A versatile, readable programming language popular in data science, AI, and web development.",
      categoryId: "cat_programming", difficultyLevel: "Beginner", sortOrder: 8,
      tags: ["programming", "data", "ai"], isActive: true
    },
    {
      id: "skill_java", slug: "java", title: "Java", name: "Java",
      description: "A class-based, object-oriented programming language widely used in enterprise and Android.",
      categoryId: "cat_programming", difficultyLevel: "Intermediate", sortOrder: 9,
      tags: ["programming", "enterprise", "oop"], isActive: true
    },
    {
      id: "skill_sql", slug: "sql", title: "SQL", name: "SQL",
      description: "Structured Query Language for managing and querying relational databases.",
      categoryId: "cat_databases", difficultyLevel: "Beginner", sortOrder: 10,
      tags: ["database", "query", "data"], isActive: true
    },
    {
      id: "skill_git", slug: "git-github", title: "Git and GitHub", name: "Git and GitHub",
      description: "Version control with Git and collaborative development using GitHub.",
      categoryId: "cat_se", difficultyLevel: "Beginner", sortOrder: 11,
      tags: ["version-control", "collaboration", "devtools"], isActive: true
    },
    {
      id: "skill_rest_apis", slug: "rest-apis", title: "REST APIs", name: "REST APIs",
      description: "Designing and consuming RESTful APIs for client-server communication.",
      categoryId: "cat_web_dev", difficultyLevel: "Intermediate", sortOrder: 12,
      tags: ["api", "backend", "web"], isActive: true
    },
    {
      id: "skill_firebase", slug: "firebase", title: "Firebase", name: "Firebase",
      description: "Google's platform for building mobile and web applications with a suite of cloud services.",
      categoryId: "cat_cloud", difficultyLevel: "Beginner", sortOrder: 13,
      tags: ["cloud", "backend", "baas"], isActive: true
    },
    {
      id: "skill_supabase", slug: "supabase", title: "Supabase", name: "Supabase",
      description: "An open-source Firebase alternative with PostgreSQL, auth, and real-time subscriptions.",
      categoryId: "cat_databases", difficultyLevel: "Beginner", sortOrder: 14,
      tags: ["database", "baas", "postgres"], isActive: true
    },
    {
      id: "skill_postgresql", slug: "postgresql", title: "PostgreSQL", name: "PostgreSQL",
      description: "A powerful open-source relational database system with robust features.",
      categoryId: "cat_databases", difficultyLevel: "Intermediate", sortOrder: 15,
      tags: ["database", "sql", "relational"], isActive: true
    },
    {
      id: "skill_ui_ux", slug: "ui-ux-basics", title: "UI/UX Basics", name: "UI/UX Basics",
      description: "Principles of user interface and user experience design for digital products.",
      categoryId: "cat_professional", difficultyLevel: "Beginner", sortOrder: 16,
      tags: ["design", "ux", "ui"], isActive: true
    },
    {
      id: "skill_data_analysis", slug: "data-analysis", title: "Data Analysis", name: "Data Analysis",
      description: "The process of inspecting, cleaning, and modeling data to discover insights.",
      categoryId: "cat_data_science", difficultyLevel: "Intermediate", sortOrder: 17,
      tags: ["data", "analysis", "statistics"], isActive: true
    },
    {
      id: "skill_ml_basics", slug: "machine-learning-basics", title: "Machine Learning Basics", name: "Machine Learning Basics",
      description: "Foundational concepts in machine learning including algorithms and model evaluation.",
      categoryId: "cat_ai", difficultyLevel: "Intermediate", sortOrder: 18,
      tags: ["ai", "ml", "data"], isActive: true
    },
    {
      id: "skill_cyber_fundamentals", slug: "cybersecurity-fundamentals", title: "Cybersecurity Fundamentals", name: "Cybersecurity Fundamentals",
      description: "Core concepts of protecting systems, networks, and programs from digital attacks.",
      categoryId: "cat_cybersecurity", difficultyLevel: "Beginner", sortOrder: 19,
      tags: ["security", "networking", "defense"], isActive: true
    },
    {
      id: "skill_linux", slug: "linux-basics", title: "Linux Basics", name: "Linux Basics",
      description: "Operating the Linux command line, file system, and system administration.",
      categoryId: "cat_se", difficultyLevel: "Beginner", sortOrder: 20,
      tags: ["os", "command-line", "server"], isActive: true
    },
    {
      id: "skill_cloud_fundamentals", slug: "cloud-fundamentals", title: "Cloud Fundamentals", name: "Cloud Fundamentals",
      description: "Core concepts of cloud computing including IaaS, PaaS, SaaS, and cloud architecture.",
      categoryId: "cat_cloud", difficultyLevel: "Beginner", sortOrder: 21,
      tags: ["cloud", "aws", "azure", "gcp"], isActive: true
    },
    {
      id: "skill_docker", slug: "docker-basics", title: "Docker Basics", name: "Docker Basics",
      description: "Containerization with Docker for consistent development and deployment environments.",
      categoryId: "cat_cloud", difficultyLevel: "Intermediate", sortOrder: 22,
      tags: ["containers", "devops", "deployment"], isActive: true
    },
    {
      id: "skill_testing", slug: "testing-basics", title: "Software Testing", name: "Testing Basics",
      description: "Principles of software testing including unit, integration, and end-to-end testing.",
      categoryId: "cat_se", difficultyLevel: "Intermediate", sortOrder: 23,
      tags: ["qa", "testing", "quality"], isActive: true
    },
    {
      id: "skill_technical_writing", slug: "technical-writing", title: "Technical Writing", name: "Technical Writing",
      description: "Communicating complex technical information clearly through documentation and reports.",
      categoryId: "cat_professional", difficultyLevel: "Beginner", sortOrder: 24,
      tags: ["communication", "documentation", "writing"], isActive: true
    },
    {
      id: "skill_problem_solving", slug: "problem-solving", title: "Problem Solving", name: "Problem Solving",
      description: "Analytical thinking and systematic approaches to solving technical and logical problems.",
      categoryId: "cat_professional", difficultyLevel: "Beginner", sortOrder: 25,
      tags: ["logic", "algorithms", "thinking"], isActive: true
    },
    {
      id: "skill_aws", slug: "aws", title: "AWS", name: "AWS",
      description: "Amazon Web Services — the world's most comprehensive and broadly adopted cloud platform.",
      categoryId: "cat_cloud", difficultyLevel: "Intermediate", sortOrder: 26,
      tags: ["cloud", "amazon", "infrastructure"], isActive: true
    },
    {
      id: "skill_kotlin", slug: "kotlin", title: "Kotlin", name: "Kotlin",
      description: "A modern, concise programming language that runs on the JVM, officially endorsed for Android.",
      categoryId: "cat_programming", difficultyLevel: "Intermediate", sortOrder: 27,
      tags: ["android", "mobile", "jvm"], isActive: true
    }
  ];

  const updates: Record<string, any> = {};
  skills.forEach((skill) => {
    updates[`public_content/skills/${skill.id}`] = {
      ...skill,
      createdAt: timestamp,
      updatedAt: timestamp
    };
  });
  return updates;
};
