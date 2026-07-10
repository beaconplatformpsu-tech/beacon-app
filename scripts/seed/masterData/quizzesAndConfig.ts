import { Announcement, PlatformSettings, Quiz, QuizAnswerKey } from "../../../src/types/database";

const now = new Date().toISOString();

type SeedQuiz = Quiz & { isActive: boolean };

export const quizzes: Record<string, SeedQuiz> = {
  quiz_javascript_fundamentals: {
    id: "quiz_javascript_fundamentals",
    title: "JavaScript Fundamentals Quiz",
    description:
      "Check understanding of variables, functions, arrays, objects, and asynchronous JavaScript basics.",
    skillIds: ["skill_javascript"],
    difficultyLevel: "beginner",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    questions: {
      q1: {
        id: "q1",
        questionText: "Which JavaScript array method returns a new array by transforming each item?",
        options: ["filter", "map", "reduce", "find"],
      },
      q2: {
        id: "q2",
        questionText: "Which keyword is used to wait for a Promise inside an async function?",
        options: ["wait", "await", "pause", "resolve"],
      },
      q3: {
        id: "q3",
        questionText: "Which method is most suitable for calculating a total value from an array?",
        options: ["map", "find", "reduce", "includes"],
      },
      q4: {
        id: "q4",
        questionText: "What does the const keyword mean in JavaScript?",
        options: [
          "The variable cannot be reassigned",
          "The value can never change internally",
          "The variable is global",
          "The variable is asynchronous",
        ],
      },
    },
  },

  quiz_typescript_data_modeling: {
    id: "quiz_typescript_data_modeling",
    title: "TypeScript Data Modeling Quiz",
    description:
      "Check understanding of interfaces, union types, optional fields, and typed data models.",
    skillIds: ["skill_typescript"],
    difficultyLevel: "beginner",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    questions: {
      q1: {
        id: "q1",
        questionText: "What is a TypeScript interface mainly used for?",
        options: [
          "Defining the shape of an object",
          "Running database migrations",
          "Styling HTML elements",
          "Deploying applications",
        ],
      },
      q2: {
        id: "q2",
        questionText: "Which syntax represents a union type?",
        options: ["string & number", "string | number", "string = number", "string + number"],
      },
      q3: {
        id: "q3",
        questionText: "What does a question mark after a property name mean?",
        options: [
          "The property is optional",
          "The property is encrypted",
          "The property is always required",
          "The property is a database key",
        ],
      },
      q4: {
        id: "q4",
        questionText: "Why is strict typing useful in large projects?",
        options: [
          "It helps catch data-shape mistakes earlier",
          "It removes the need for architecture",
          "It makes all APIs public",
          "It replaces user testing",
        ],
      },
    },
  },

  quiz_react_fundamentals: {
    id: "quiz_react_fundamentals",
    title: "React Fundamentals Quiz",
    description:
      "Check understanding of React components, props, state, rendering lists, and basic hooks.",
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
        options: [
          "Passing data into components",
          "Installing packages",
          "Creating CSS files",
          "Deploying the app",
        ],
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
      q4: {
        id: "q4",
        questionText: "What should a reusable React component usually avoid?",
        options: [
          "Accepting props",
          "Hardcoding all data when props would be better",
          "Returning JSX",
          "Using clear names",
        ],
      },
    },
  },

  quiz_nextjs_routing: {
    id: "quiz_nextjs_routing",
    title: "Next.js Routing Quiz",
    description:
      "Check understanding of route structure, layouts, page organization, and frontend application flow.",
    skillIds: ["skill_nextjs", "skill_react"],
    difficultyLevel: "intermediate",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    questions: {
      q1: {
        id: "q1",
        questionText: "What is a main benefit of organizing routes clearly in a web application?",
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
          "They remove validation",
          "They make code private",
        ],
      },
      q4: {
        id: "q4",
        questionText: "What is a good route name usually like?",
        options: ["Clear and related to the page purpose", "Random and short only", "A password", "A private API key"],
      },
    },
  },

  quiz_backend_data_basics: {
    id: "quiz_backend_data_basics",
    title: "Backend Data Basics Quiz",
    description:
      "Check Python, SQL, API validation, and backend data handling foundations.",
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
          "Combine related rows from multiple tables",
          "Style frontend elements",
          "Deploy a website",
          "Create passwords automatically",
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
      q4: {
        id: "q4",
        questionText: "What should an API return when a request is invalid?",
        options: [
          "A clear error response",
          "A random success response",
          "A hidden password",
          "A blank database",
        ],
      },
    },
  },

  quiz_data_analysis_foundations: {
    id: "quiz_data_analysis_foundations",
    title: "Data Analysis Foundations Quiz",
    description:
      "Check understanding of Pandas, SQL, visualization, and data cleaning.",
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
          "They remove documentation needs",
        ],
      },
      q3: {
        id: "q3",
        questionText: "What makes a chart more useful?",
        options: ["Clear labels and meaningful insight", "No title", "Random colors only", "Hidden axes"],
      },
      q4: {
        id: "q4",
        questionText: "Which SQL clause is commonly used to group rows for aggregate calculations?",
        options: ["GROUP BY", "STYLE BY", "DRAW BY", "ROUTE BY"],
      },
    },
  },

  quiz_ml_basics: {
    id: "quiz_ml_basics",
    title: "Machine Learning Basics Quiz",
    description:
      "Check understanding of training, testing, evaluation, and overfitting.",
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
        questionText: "Which item is commonly used to measure classification performance?",
        options: ["Accuracy", "Font size", "Image width", "Route name"],
      },
      q4: {
        id: "q4",
        questionText: "What should you do after training a model?",
        options: [
          "Evaluate it and explain limitations",
          "Hide all results",
          "Delete the dataset",
          "Skip testing completely",
        ],
      },
    },
  },

  quiz_deep_learning_concepts: {
    id: "quiz_deep_learning_concepts",
    title: "Deep Learning Concepts Quiz",
    description:
      "Check understanding of neural networks, layers, activation functions, and model training concepts.",
    skillIds: ["skill_deep_learning", "skill_machine_learning"],
    difficultyLevel: "intermediate",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    questions: {
      q1: {
        id: "q1",
        questionText: "What is a neural network layer used for?",
        options: [
          "Transforming input data through learned weights",
          "Styling a webpage",
          "Creating database passwords",
          "Compressing images only",
        ],
      },
      q2: {
        id: "q2",
        questionText: "What is the role of a loss function?",
        options: [
          "Measuring how wrong the model prediction is",
          "Creating React components",
          "Deploying code to production",
          "Replacing validation data",
        ],
      },
      q3: {
        id: "q3",
        questionText: "What can happen if a model trains too closely on the training data?",
        options: ["Overfitting", "Responsive design", "Authentication", "Routing"],
      },
      q4: {
        id: "q4",
        questionText: "Why is validation data useful?",
        options: [
          "It helps monitor model performance during training",
          "It stores API secrets",
          "It replaces all testing",
          "It changes CSS automatically",
        ],
      },
    },
  },

  quiz_prompt_engineering_basics: {
    id: "quiz_prompt_engineering_basics",
    title: "Prompt Engineering Basics Quiz",
    description:
      "Check understanding of context, constraints, examples, and structured AI prompting.",
    skillIds: ["skill_prompt_engineering"],
    difficultyLevel: "beginner",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    questions: {
      q1: {
        id: "q1",
        questionText: "What usually makes a prompt more useful?",
        options: [
          "Clear role, context, constraints, and expected output",
          "No context at all",
          "Only one vague word",
          "Private passwords",
        ],
      },
      q2: {
        id: "q2",
        questionText: "Why should prompts avoid unnecessary private information?",
        options: [
          "To protect user privacy",
          "To make the text longer",
          "To reduce frontend styling",
          "To create database indexes",
        ],
      },
      q3: {
        id: "q3",
        questionText: "What is a good way to ask for a structured answer?",
        options: [
          "Specify the desired format",
          "Ask randomly",
          "Hide the task goal",
          "Use unrelated examples only",
        ],
      },
      q4: {
        id: "q4",
        questionText: "What should an AI study assistant recommendation be based on?",
        options: [
          "Student goal, skill gap, and available resources",
          "Random text only",
          "Private secrets",
          "Unrelated colors",
        ],
      },
    },
  },

  quiz_cybersecurity_foundations: {
    id: "quiz_cybersecurity_foundations",
    title: "Cybersecurity Foundations Quiz",
    description:
      "Check defensive security basics for web and network systems.",
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
          "It removes APIs",
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
      q4: {
        id: "q4",
        questionText: "What should a defensive security checklist include?",
        options: [
          "Authentication, authorization, validation, secrets, and logging",
          "Only colors",
          "Only icons",
          "Only marketing slogans",
        ],
      },
    },
  },

  quiz_cloud_docker_basics: {
    id: "quiz_cloud_docker_basics",
    title: "Cloud and Docker Basics Quiz",
    description:
      "Check understanding of cloud services, containers, and deployment basics.",
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
      q4: {
        id: "q4",
        questionText: "What should a cloud deployment blueprint usually include?",
        options: [
          "Architecture, services, monitoring, backup, and security notes",
          "Only a logo",
          "Only a password",
          "Only a random file name",
        ],
      },
    },
  },

  quiz_ci_cd_foundations: {
    id: "quiz_ci_cd_foundations",
    title: "CI/CD Foundations Quiz",
    description:
      "Check understanding of pipeline stages, build checks, deployment triggers, and release safety.",
    skillIds: ["skill_ci_cd", "skill_git"],
    difficultyLevel: "intermediate",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    questions: {
      q1: {
        id: "q1",
        questionText: "What is a common purpose of CI?",
        options: [
          "Running checks automatically when code changes",
          "Designing database logos",
          "Writing passwords into code",
          "Skipping tests",
        ],
      },
      q2: {
        id: "q2",
        questionText: "Which step is commonly included before deployment?",
        options: [
          "Build verification",
          "Deleting source code",
          "Publishing secrets",
          "Disabling errors",
        ],
      },
      q3: {
        id: "q3",
        questionText: "What should happen if a required pipeline stage fails?",
        options: [
          "The deployment should stop",
          "The deployment should always continue",
          "All users should become admins",
          "Secrets should be printed",
        ],
      },
      q4: {
        id: "q4",
        questionText: "Why are clear commit messages useful?",
        options: [
          "They help understand project history",
          "They replace testing",
          "They hide bugs",
          "They remove documentation",
        ],
      },
    },
  },

  quiz_uiux_foundations: {
    id: "quiz_uiux_foundations",
    title: "UI/UX Foundations Quiz",
    description:
      "Check understanding of user research, wireframes, usability, and design communication.",
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
          "They replace testing",
          "They generate API keys",
        ],
      },
      q3: {
        id: "q3",
        questionText: "What is a good usability goal?",
        options: [
          "Users can complete tasks clearly and efficiently",
          "Users must guess every action",
          "The interface hides feedback",
          "The design ignores user goals",
        ],
      },
      q4: {
        id: "q4",
        questionText: "What should a UI/UX case study usually explain?",
        options: [
          "Problem, process, design decisions, and outcomes",
          "Only random images",
          "Only passwords",
          "Only backend routes",
        ],
      },
    },
  },

  quiz_product_agile_basics: {
    id: "quiz_product_agile_basics",
    title: "Product and Agile Basics Quiz",
    description:
      "Check understanding of product planning, user stories, requirements, and Agile basics.",
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
      q4: {
        id: "q4",
        questionText: "Why is prioritization important in product work?",
        options: [
          "It helps focus effort on the highest-value work",
          "It removes user needs",
          "It hides project risks",
          "It replaces communication",
        ],
      },
    },
  },

  quiz_seo_content_basics: {
    id: "quiz_seo_content_basics",
    title: "SEO and Content Basics Quiz",
    description:
      "Check understanding of SEO page structure, content planning, and professional communication.",
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
      q4: {
        id: "q4",
        questionText: "Why should content be written for a clear audience?",
        options: [
          "It makes the message more relevant and useful",
          "It hides the goal",
          "It removes structure",
          "It creates API keys",
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
      q1: { correctOptionIndex: 1, explanation: "map transforms each item and returns a new array." },
      q2: { correctOptionIndex: 1, explanation: "await pauses execution inside an async function until a Promise settles." },
      q3: { correctOptionIndex: 2, explanation: "reduce is commonly used to accumulate one result such as a total." },
      q4: { correctOptionIndex: 0, explanation: "const prevents reassignment of the variable binding." },
    },
  },

  quiz_typescript_data_modeling: {
    quizId: "quiz_typescript_data_modeling",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "Interfaces define the expected shape of objects." },
      q2: { correctOptionIndex: 1, explanation: "The pipe symbol creates a union type." },
      q3: { correctOptionIndex: 0, explanation: "A question mark makes the property optional." },
      q4: { correctOptionIndex: 0, explanation: "Strict typing catches data-shape mistakes early." },
    },
  },

  quiz_react_fundamentals: {
    quizId: "quiz_react_fundamentals",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "useState manages local component state." },
      q2: { correctOptionIndex: 0, explanation: "Props pass data into components." },
      q3: { correctOptionIndex: 0, explanation: "Keys help React identify which list items changed." },
      q4: { correctOptionIndex: 1, explanation: "Reusable components should avoid unnecessary hardcoded data." },
    },
  },

  quiz_nextjs_routing: {
    quizId: "quiz_nextjs_routing",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "Clear routing improves maintainability and navigation structure." },
      q2: { correctOptionIndex: 0, explanation: "Shared layouts commonly contain navigation and page structure." },
      q3: { correctOptionIndex: 0, explanation: "Loading and error states make data-fetching experiences clearer." },
      q4: { correctOptionIndex: 0, explanation: "Route names should clearly describe the page purpose." },
    },
  },

  quiz_backend_data_basics: {
    quizId: "quiz_backend_data_basics",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "JOIN combines related rows from multiple tables." },
      q2: { correctOptionIndex: 0, explanation: "Input validation reduces invalid, unsafe, or unexpected data." },
      q3: { correctOptionIndex: 0, explanation: "CSV cleaning commonly outputs a cleaned data file." },
      q4: { correctOptionIndex: 0, explanation: "Invalid requests should receive clear error responses." },
    },
  },

  quiz_data_analysis_foundations: {
    quizId: "quiz_data_analysis_foundations",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "Pandas is widely used for data analysis in Python." },
      q2: { correctOptionIndex: 0, explanation: "Missing values can distort analysis and model results." },
      q3: { correctOptionIndex: 0, explanation: "Good charts need clear labels and useful insights." },
      q4: { correctOptionIndex: 0, explanation: "GROUP BY groups rows for aggregate calculations." },
    },
  },

  quiz_ml_basics: {
    quizId: "quiz_ml_basics",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "Testing data helps evaluate performance on unseen examples." },
      q2: { correctOptionIndex: 0, explanation: "Overfitting happens when a model memorizes training data too closely." },
      q3: { correctOptionIndex: 0, explanation: "Accuracy is a common classification metric." },
      q4: { correctOptionIndex: 0, explanation: "Models should be evaluated and their limitations explained." },
    },
  },

  quiz_deep_learning_concepts: {
    quizId: "quiz_deep_learning_concepts",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "Layers transform data through learned weights." },
      q2: { correctOptionIndex: 0, explanation: "Loss functions measure prediction error." },
      q3: { correctOptionIndex: 0, explanation: "Training too closely on training data can cause overfitting." },
      q4: { correctOptionIndex: 0, explanation: "Validation data helps monitor model performance during training." },
    },
  },

  quiz_prompt_engineering_basics: {
    quizId: "quiz_prompt_engineering_basics",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "Good prompts include role, context, constraints, and expected output." },
      q2: { correctOptionIndex: 0, explanation: "Avoiding unnecessary private data protects user privacy." },
      q3: { correctOptionIndex: 0, explanation: "Specifying format helps produce structured output." },
      q4: { correctOptionIndex: 0, explanation: "Recommendations should be based on goals, gaps, and available resources." },
    },
  },

  quiz_cybersecurity_foundations: {
    quizId: "quiz_cybersecurity_foundations",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "Least privilege means granting only needed access." },
      q2: { correctOptionIndex: 0, explanation: "Frontend code can be inspected, so secrets do not belong there." },
      q3: { correctOptionIndex: 0, explanation: "MFA adds another verification layer." },
      q4: { correctOptionIndex: 0, explanation: "Security checklists should cover core defensive controls." },
    },
  },

  quiz_cloud_docker_basics: {
    quizId: "quiz_cloud_docker_basics",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "A Dockerfile defines how a container image is built." },
      q2: { correctOptionIndex: 0, explanation: "IAM controls users, roles, and permissions in cloud environments." },
      q3: { correctOptionIndex: 0, explanation: "Monitoring helps detect problems and track system health." },
      q4: { correctOptionIndex: 0, explanation: "Cloud blueprints should describe architecture and operational concerns." },
    },
  },

  quiz_ci_cd_foundations: {
    quizId: "quiz_ci_cd_foundations",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "CI runs checks automatically when code changes." },
      q2: { correctOptionIndex: 0, explanation: "Build verification is commonly required before deployment." },
      q3: { correctOptionIndex: 0, explanation: "Failed required stages should stop deployment." },
      q4: { correctOptionIndex: 0, explanation: "Clear commit messages help understand project history." },
    },
  },

  quiz_uiux_foundations: {
    quizId: "quiz_uiux_foundations",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "Wireframes plan layout and structure before visual polish." },
      q2: { correctOptionIndex: 0, explanation: "Open-ended questions reveal user needs and context." },
      q3: { correctOptionIndex: 0, explanation: "Usability focuses on clear and efficient task completion." },
      q4: { correctOptionIndex: 0, explanation: "Case studies should explain problem, process, decisions, and outcomes." },
    },
  },

  quiz_product_agile_basics: {
    quizId: "quiz_product_agile_basics",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "User stories describe user needs and outcomes." },
      q2: { correctOptionIndex: 0, explanation: "A PRD should include problem, users, requirements, metrics, and risks." },
      q3: { correctOptionIndex: 0, explanation: "Acceptance criteria define when a story is done." },
      q4: { correctOptionIndex: 0, explanation: "Prioritization focuses effort on the highest-value work." },
    },
  },

  quiz_seo_content_basics: {
    quizId: "quiz_seo_content_basics",
    updatedAt: now,
    questions: {
      q1: { correctOptionIndex: 0, explanation: "Meta descriptions summarize pages in search results." },
      q2: { correctOptionIndex: 0, explanation: "Content calendars organize topics, timing, audience, and publishing plans." },
      q3: { correctOptionIndex: 0, explanation: "Useful updates include completed work, blockers, next steps, and requests." },
      q4: { correctOptionIndex: 0, explanation: "Clear audience targeting makes content more relevant and useful." },
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