import { Announcement, PlatformSettings, Quiz, QuizAnswerKey } from "../../../src/types/database";

const now = new Date().toISOString();

type SeedQuiz = Quiz & { isActive: boolean };

export const quizzes: Record<string, SeedQuiz> = {
  quiz_javascript_fundamentals: {
    id: "quiz_javascript_fundamentals",
    title: "JavaScript Fundamentals Quiz",
    description: "Check understanding of variables, functions, arrays, and async basics.",
    skillIds: ["skill_javascript"],
    difficultyLevel: "beginner",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    questions: {
      q1: {
        id: "q1",
        questionText: "Which array method creates a new array by transforming every item?",
        options: ["filter", "map", "reduce", "find"],
      },
      q2: {
        id: "q2",
        questionText: "What does async/await help you work with?",
        options: ["CSS layouts", "Promises", "HTML forms only", "Database schemas only"],
      },
      q3: {
        id: "q3",
        questionText: "Which method is best for calculating a total from an array?",
        options: ["map", "find", "reduce", "includes"],
      },
    },
  },

  quiz_react_fundamentals: {
    id: "quiz_react_fundamentals",
    title: "React Fundamentals Quiz",
    description: "Check understanding of components, props, state, and rendering lists.",
    skillIds: ["skill_react", "skill_javascript"],
    difficultyLevel: "beginner",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    questions: {
      q1: {
        id: "q1",
        questionText: "Which hook is commonly used to manage local component state?",
        options: ["useState", "useRouter", "useServer", "useStyle"],
      },
      q2: {
        id: "q2",
        questionText: "What is the main purpose of props in React?",
        options: ["To pass data into components", "To install packages", "To create CSS files", "To deploy apps"],
      },
      q3: {
        id: "q3",
        questionText: "Why should list items usually have a key prop?",
        options: [
          "To help React track changed items",
          "To make HTML valid",
          "To encrypt list data",
          "To replace CSS classes",
        ],
      },
    },
  },

  quiz_nextjs_routing: {
    id: "quiz_nextjs_routing",
    title: "Next.js Routing Quiz",
    description: "Check understanding of route structure, layouts, and page organization.",
    skillIds: ["skill_nextjs", "skill_react"],
    difficultyLevel: "intermediate",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    questions: {
      q1: {
        id: "q1",
        questionText: "What is a main benefit of organizing routes clearly in a web app?",
        options: ["Better maintainability", "Larger bundle size", "Fewer components always", "No need for testing"],
      },
      q2: {
        id: "q2",
        questionText: "What should a shared layout usually contain?",
        options: ["Common navigation and structure", "Only database secrets", "Only test data", "Random scripts"],
      },
      q3: {
        id: "q3",
        questionText: "Why are loading and error states important?",
        options: [
          "They improve user experience during data fetching",
          "They replace authentication",
          "They remove the need for validation",
          "They make code private",
        ],
      },
    },
  },

  quiz_backend_data_basics: {
    id: "quiz_backend_data_basics",
    title: "Backend Data Basics Quiz",
    description: "Check Python, SQL, and backend data handling foundations.",
    skillIds: ["skill_python", "skill_sql"],
    difficultyLevel: "intermediate",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    questions: {
      q1: {
        id: "q1",
        questionText: "What does a SQL JOIN help you do?",
        options: [
          "Combine related rows from tables",
          "Style frontend elements",
          "Deploy a website",
          "Create a password automatically",
        ],
      },
      q2: {
        id: "q2",
        questionText: "Why should backend APIs validate input?",
        options: [
          "To reduce invalid or unsafe data",
          "To make CSS faster",
          "To avoid writing routes",
          "To remove the database",
        ],
      },
      q3: {
        id: "q3",
        questionText: "What is a common output of a CSV cleaning script?",
        options: ["A cleaned data file", "A CSS theme", "A browser extension", "A DNS record"],
      },
    },
  },

  quiz_data_analysis_foundations: {
    id: "quiz_data_analysis_foundations",
    title: "Data Analysis Foundations Quiz",
    description: "Check understanding of Pandas, SQL, visualization, and data cleaning.",
    skillIds: ["skill_python", "skill_pandas", "skill_sql", "skill_data_visualization"],
    difficultyLevel: "beginner",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    questions: {
      q1: {
        id: "q1",
        questionText: "What is Pandas commonly used for?",
        options: ["Data analysis in Python", "Designing icons", "Managing DNS", "Writing CSS animations"],
      },
      q2: {
        id: "q2",
        questionText: "Why should missing values be handled before analysis?",
        options: [
          "They can affect results and model quality",
          "They improve image resolution",
          "They replace database indexes",
          "They remove the need for documentation",
        ],
      },
      q3: {
        id: "q3",
        questionText: "What makes a chart more useful?",
        options: ["Clear labels and meaningful insight", "No title", "Random colors only", "Hidden axes"],
      },
    },
  },

  quiz_ml_basics: {
    id: "quiz_ml_basics",
    title: "Machine Learning Basics Quiz",
    description: "Check understanding of training, testing, evaluation, and overfitting.",
    skillIds: ["skill_machine_learning", "skill_python"],
    difficultyLevel: "intermediate",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    questions: {
      q1: {
        id: "q1",
        questionText: "Why do we split data into training and testing sets?",
        options: [
          "To evaluate model performance on unseen data",
          "To make the dataset smaller only",
          "To remove all errors automatically",
          "To avoid using Python",
        ],
      },
      q2: {
        id: "q2",
        questionText: "What is overfitting?",
        options: [
          "When a model memorizes training data and performs poorly on new data",
          "When code has no functions",
          "When a chart has many colors",
          "When a database has tables",
        ],
      },
      q3: {
        id: "q3",
        questionText: "Which item is usually used to measure classification performance?",
        options: ["Accuracy", "Font size", "Image width", "Route name"],
      },
    },
  },

  quiz_cybersecurity_foundations: {
    id: "quiz_cybersecurity_foundations",
    title: "Cybersecurity Foundations Quiz",
    description: "Check defensive security basics for web and network systems.",
    skillIds: ["skill_web_security", "skill_network_security"],
    difficultyLevel: "beginner",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    questions: {
      q1: {
        id: "q1",
        questionText: "What does least privilege mean?",
        options: [
          "Users get only the access they need",
          "Everyone gets admin access",
          "Passwords are stored in public files",
          "Logs are disabled",
        ],
      },
      q2: {
        id: "q2",
        questionText: "Why should secrets not be stored in frontend code?",
        options: [
          "Users can inspect frontend code",
          "It improves button design",
          "It removes the need for APIs",
          "It makes HTML shorter",
        ],
      },
      q3: {
        id: "q3",
        questionText: "What is MFA used for?",
        options: [
          "Adding another verification layer",
          "Compressing images",
          "Creating CSS layouts",
          "Writing SQL joins",
        ],
      },
    },
  },

  quiz_cloud_docker_basics: {
    id: "quiz_cloud_docker_basics",
    title: "Cloud and Docker Basics Quiz",
    description: "Check understanding of cloud services, containers, and deployment basics.",
    skillIds: ["skill_aws", "skill_docker"],
    difficultyLevel: "beginner",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    questions: {
      q1: {
        id: "q1",
        questionText: "What is a Dockerfile used for?",
        options: [
          "Defining how to build a container image",
          "Writing SQL queries",
          "Designing logos",
          "Creating passwords",
        ],
      },
      q2: {
        id: "q2",
        questionText: "Which cloud concept helps control user permissions?",
        options: ["IAM", "CSS", "HTML", "SVG"],
      },
      q3: {
        id: "q3",
        questionText: "Why is monitoring important in cloud systems?",
        options: [
          "To detect problems and track system health",
          "To make code private",
          "To remove all costs",
          "To replace backups",
        ],
      },
    },
  },

  quiz_uiux_foundations: {
    id: "quiz_uiux_foundations",
    title: "UI/UX Foundations Quiz",
    description: "Check understanding of user research, wireframes, and usability.",
    skillIds: ["skill_figma", "skill_wireframing", "skill_user_research"],
    difficultyLevel: "beginner",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    questions: {
      q1: {
        id: "q1",
        questionText: "What is a wireframe used for?",
        options: [
          "Planning layout and structure before visual design",
          "Encrypting user data",
          "Running database migrations",
          "Deploying cloud services",
        ],
      },
      q2: {
        id: "q2",
        questionText: "Why are open-ended interview questions useful?",
        options: [
          "They help reveal user needs and context",
          "They force yes/no answers only",
          "They replace all testing",
          "They generate API keys",
        ],
      },
      q3: {
        id: "q3",
        questionText: "What is a good usability goal?",
        options: [
          "Users can complete tasks clearly and efficiently",
          "Users must guess every action",
          "The interface hides all feedback",
          "The design ignores user goals",
        ],
      },
    },
  },

  quiz_product_agile_basics: {
    id: "quiz_product_agile_basics",
    title: "Product and Agile Basics Quiz",
    description: "Check understanding of product planning, user stories, and Agile basics.",
    skillIds: ["skill_product_strategy", "skill_project_management", "skill_agile"],
    difficultyLevel: "beginner",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    questions: {
      q1: {
        id: "q1",
        questionText: "What is a user story used for?",
        options: [
          "Describing a user need and desired outcome",
          "Creating database passwords",
          "Styling a button",
          "Compressing images",
        ],
      },
      q2: {
        id: "q2",
        questionText: "What should a PRD usually include?",
        options: [
          "Problem, users, requirements, metrics, and risks",
          "Only random ideas",
          "Only color codes",
          "Only private credentials",
        ],
      },
      q3: {
        id: "q3",
        questionText: "What is an acceptance criterion?",
        options: [
          "A condition that confirms a story is done",
          "A marketing slogan",
          "A cloud server name",
          "A design font",
        ],
      },
    },
  },

  quiz_seo_content_basics: {
    id: "quiz_seo_content_basics",
    title: "SEO and Content Basics Quiz",
    description: "Check understanding of SEO page structure, content planning, and communication.",
    skillIds: ["skill_seo", "skill_content_marketing", "skill_communication"],
    difficultyLevel: "beginner",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    questions: {
      q1: {
        id: "q1",
        questionText: "Which item helps describe a web page in search results?",
        options: ["Meta description", "Private API key", "Database password", "Docker image ID"],
      },
      q2: {
        id: "q2",
        questionText: "What should a content calendar help organize?",
        options: [
          "Topics, timing, audience, and publishing plan",
          "Only passwords",
          "Only database backups",
          "Only code indentation",
        ],
      },
      q3: {
        id: "q3",
        questionText: "What makes a project status update useful?",
        options: [
          "Completed work, blockers, next steps, and clear requests",
          "Only emojis",
          "No context",
          "Hidden problems",
        ],
      },
    },
  },
};

export const quizAnswerKeys: Record<string, QuizAnswerKey> = {
  quiz_javascript_fundamentals: {
    quizId: "quiz_javascript_fundamentals",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 1, explanation: "map transforms every item and returns a new array." },
      q2: { correctOptionIndex: 1, explanation: "async/await is syntax for working with Promises." },
      q3: { correctOptionIndex: 2, explanation: "reduce is commonly used to accumulate a single result such as a total." },
    },
  },

  quiz_react_fundamentals: {
    quizId: "quiz_react_fundamentals",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "useState manages local component state." },
      q2: { correctOptionIndex: 0, explanation: "Props pass data from parent components into child components." },
      q3: { correctOptionIndex: 0, explanation: "Keys help React identify which list items changed." },
    },
  },

  quiz_nextjs_routing: {
    quizId: "quiz_nextjs_routing",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "Clear routing improves maintainability and navigation structure." },
      q2: { correctOptionIndex: 0, explanation: "Shared layouts usually contain navigation and common page structure." },
      q3: { correctOptionIndex: 0, explanation: "Loading and error states make data-fetching experiences clearer." },
    },
  },

  quiz_backend_data_basics: {
    quizId: "quiz_backend_data_basics",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "JOIN combines related rows from multiple tables." },
      q2: { correctOptionIndex: 0, explanation: "Input validation reduces invalid, unsafe, or unexpected data." },
      q3: { correctOptionIndex: 0, explanation: "CSV cleaning usually outputs a cleaned data file." },
    },
  },

  quiz_data_analysis_foundations: {
    quizId: "quiz_data_analysis_foundations",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "Pandas is widely used for data analysis in Python." },
      q2: { correctOptionIndex: 0, explanation: "Missing values can distort analysis and model results." },
      q3: { correctOptionIndex: 0, explanation: "Good charts need clear labels and useful insights." },
    },
  },

  quiz_ml_basics: {
    quizId: "quiz_ml_basics",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "Testing data helps evaluate performance on unseen examples." },
      q2: { correctOptionIndex: 0, explanation: "Overfitting happens when a model memorizes training data too closely." },
      q3: { correctOptionIndex: 0, explanation: "Accuracy is a common classification metric." },
    },
  },

  quiz_cybersecurity_foundations: {
    quizId: "quiz_cybersecurity_foundations",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "Least privilege means granting only needed access." },
      q2: { correctOptionIndex: 0, explanation: "Frontend code can be inspected by users, so secrets do not belong there." },
      q3: { correctOptionIndex: 0, explanation: "MFA adds another verification layer." },
    },
  },

  quiz_cloud_docker_basics: {
    quizId: "quiz_cloud_docker_basics",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "A Dockerfile defines how a container image is built." },
      q2: { correctOptionIndex: 0, explanation: "IAM controls users, roles, and permissions in cloud environments." },
      q3: { correctOptionIndex: 0, explanation: "Monitoring helps detect problems and track system health." },
    },
  },

  quiz_uiux_foundations: {
    quizId: "quiz_uiux_foundations",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "Wireframes plan layout and structure before visual polish." },
      q2: { correctOptionIndex: 0, explanation: "Open-ended questions reveal user needs and context." },
      q3: { correctOptionIndex: 0, explanation: "Usability focuses on clear and efficient task completion." },
    },
  },

  quiz_product_agile_basics: {
    quizId: "quiz_product_agile_basics",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "User stories describe a user need and desired outcome." },
      q2: { correctOptionIndex: 0, explanation: "A PRD should include problem, users, requirements, metrics, and risks." },
      q3: { correctOptionIndex: 0, explanation: "Acceptance criteria define when a story is done." },
    },
  },

  quiz_seo_content_basics: {
    quizId: "quiz_seo_content_basics",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "Meta descriptions help summarize pages in search results." },
      q2: { correctOptionIndex: 0, explanation: "A content calendar organizes topics, timing, audience, and publishing." },
      q3: { correctOptionIndex: 0, explanation: "Useful updates include completed work, blockers, next steps, and requests." },
    },
  },
};

export const announcements: Record<string, Announcement> = {
  ann_welcome_professional_seed: {
    id: "ann_welcome_professional_seed",
    type: "news",
    title: "Welcome to Beacon Professional Learning Paths",
    content:
      "Beacon now includes connected learning paths, skills, resources, quizzes, practice tasks, and portfolio projects to help students prepare for academic and career goals.",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
};

export const platformSettings: PlatformSettings = {
  public: {
    maintenanceMode: false,
    allowRegistration: true,
    defaultUserRole: "student",
    platformVersion: "2.0.0",
    updatedAt: now,
  },
  private: {
    enabledIntegrations: {
      supabase_storage: true,
      openai: false,
    },
    providerProjectIds: {
      firebase: "beacon-platform",
    },
    updatedAt: now,
  },
};