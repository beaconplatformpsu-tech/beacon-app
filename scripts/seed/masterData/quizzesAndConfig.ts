import { Quiz, QuizAnswerKey, Announcement, PlatformSettings, ID } from "../../../src/types/database";

const now = new Date().toISOString();

export const quizzes: Record<ID, Quiz> = {
  "quiz_react_basics": {
    id: "quiz_react_basics",
    title: "React Fundamentals Quiz",
    description: "Test your understanding of core React concepts like state, props, and hooks.",
    skillIds: ["skill_react"],
    difficultyLevel: "beginner",
    questions: {
      "q1": {
        id: "q1",
        questionText: "Which hook is used to manage local state in a functional component?",
        options: ["useEffect", "useContext", "useState", "useReducer"]
      },
      "q2": {
        id: "q2",
        questionText: "What is the primary purpose of a 'key' prop in React lists?",
        options: [
          "To style the list items uniquely",
          "To help React identify which items have changed, are added, or are removed",
          "To bind the data to the component",
          "It is required by HTML5"
        ]
      }
    },
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }
,
  "quiz_auto_1": {
    id: "quiz_auto_1",
    title: "Generated Quiz 1",
    description: "A professional quiz generated for MVP seeding.",
    skillIds: ["skill_javascript", "skill_react"],
    difficultyLevel: "intermediate",
    questions: {
      "q1": {
        id: "q1",
        questionText: "What is the output of 2 + 2?",
        options: ["3", "4", "5", "6"]
      },
      "q2": {
        id: "q2",
        questionText: "Which of the following is a Javascript framework?",
        options: ["React", "Laravel", "Django", "Flask"]
      }
    },
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  "quiz_auto_2": {
    id: "quiz_auto_2",
    title: "Generated Quiz 2",
    description: "A professional quiz generated for MVP seeding.",
    skillIds: ["skill_javascript", "skill_react"],
    difficultyLevel: "intermediate",
    questions: {
      "q1": {
        id: "q1",
        questionText: "What is the output of 2 + 2?",
        options: ["3", "4", "5", "6"]
      },
      "q2": {
        id: "q2",
        questionText: "Which of the following is a Javascript framework?",
        options: ["React", "Laravel", "Django", "Flask"]
      }
    },
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  "quiz_auto_3": {
    id: "quiz_auto_3",
    title: "Generated Quiz 3",
    description: "A professional quiz generated for MVP seeding.",
    skillIds: ["skill_javascript", "skill_react"],
    difficultyLevel: "intermediate",
    questions: {
      "q1": {
        id: "q1",
        questionText: "What is the output of 2 + 2?",
        options: ["3", "4", "5", "6"]
      },
      "q2": {
        id: "q2",
        questionText: "Which of the following is a Javascript framework?",
        options: ["React", "Laravel", "Django", "Flask"]
      }
    },
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  "quiz_auto_4": {
    id: "quiz_auto_4",
    title: "Generated Quiz 4",
    description: "A professional quiz generated for MVP seeding.",
    skillIds: ["skill_javascript", "skill_react"],
    difficultyLevel: "intermediate",
    questions: {
      "q1": {
        id: "q1",
        questionText: "What is the output of 2 + 2?",
        options: ["3", "4", "5", "6"]
      },
      "q2": {
        id: "q2",
        questionText: "Which of the following is a Javascript framework?",
        options: ["React", "Laravel", "Django", "Flask"]
      }
    },
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  "quiz_auto_5": {
    id: "quiz_auto_5",
    title: "Generated Quiz 5",
    description: "A professional quiz generated for MVP seeding.",
    skillIds: ["skill_javascript", "skill_react"],
    difficultyLevel: "intermediate",
    questions: {
      "q1": {
        id: "q1",
        questionText: "What is the output of 2 + 2?",
        options: ["3", "4", "5", "6"]
      },
      "q2": {
        id: "q2",
        questionText: "Which of the following is a Javascript framework?",
        options: ["React", "Laravel", "Django", "Flask"]
      }
    },
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  "quiz_auto_6": {
    id: "quiz_auto_6",
    title: "Generated Quiz 6",
    description: "A professional quiz generated for MVP seeding.",
    skillIds: ["skill_javascript", "skill_react"],
    difficultyLevel: "intermediate",
    questions: {
      "q1": {
        id: "q1",
        questionText: "What is the output of 2 + 2?",
        options: ["3", "4", "5", "6"]
      },
      "q2": {
        id: "q2",
        questionText: "Which of the following is a Javascript framework?",
        options: ["React", "Laravel", "Django", "Flask"]
      }
    },
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  "quiz_auto_7": {
    id: "quiz_auto_7",
    title: "Generated Quiz 7",
    description: "A professional quiz generated for MVP seeding.",
    skillIds: ["skill_javascript", "skill_react"],
    difficultyLevel: "intermediate",
    questions: {
      "q1": {
        id: "q1",
        questionText: "What is the output of 2 + 2?",
        options: ["3", "4", "5", "6"]
      },
      "q2": {
        id: "q2",
        questionText: "Which of the following is a Javascript framework?",
        options: ["React", "Laravel", "Django", "Flask"]
      }
    },
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }
};

export const quizAnswerKeys: Record<ID, QuizAnswerKey> = {
  "quiz_react_basics": {
    quizId: "quiz_react_basics",
    questions: {
      "q1": {
        correctOptionIndex: 2,
        explanation: "useState is the built-in React hook specifically designed for managing local, component-level state."
      },
      "q2": {
        correctOptionIndex: 1,
        explanation: "Keys help React track list item identity during reconciliation to optimize rendering."
      }
    },
    updatedAt: now,
  }
,
  "quiz_auto_1": {
    quizId: "quiz_auto_1",
    questions: {
      "q1": {
        correctOptionIndex: 1,
        explanation: "2 + 2 = 4."
      },
      "q2": {
        correctOptionIndex: 0,
        explanation: "React is a Javascript library/framework."
      }
    },
    updatedAt: now,
  },
  "quiz_auto_2": {
    quizId: "quiz_auto_2",
    questions: {
      "q1": {
        correctOptionIndex: 1,
        explanation: "2 + 2 = 4."
      },
      "q2": {
        correctOptionIndex: 0,
        explanation: "React is a Javascript library/framework."
      }
    },
    updatedAt: now,
  },
  "quiz_auto_3": {
    quizId: "quiz_auto_3",
    questions: {
      "q1": {
        correctOptionIndex: 1,
        explanation: "2 + 2 = 4."
      },
      "q2": {
        correctOptionIndex: 0,
        explanation: "React is a Javascript library/framework."
      }
    },
    updatedAt: now,
  },
  "quiz_auto_4": {
    quizId: "quiz_auto_4",
    questions: {
      "q1": {
        correctOptionIndex: 1,
        explanation: "2 + 2 = 4."
      },
      "q2": {
        correctOptionIndex: 0,
        explanation: "React is a Javascript library/framework."
      }
    },
    updatedAt: now,
  },
  "quiz_auto_5": {
    quizId: "quiz_auto_5",
    questions: {
      "q1": {
        correctOptionIndex: 1,
        explanation: "2 + 2 = 4."
      },
      "q2": {
        correctOptionIndex: 0,
        explanation: "React is a Javascript library/framework."
      }
    },
    updatedAt: now,
  },
  "quiz_auto_6": {
    quizId: "quiz_auto_6",
    questions: {
      "q1": {
        correctOptionIndex: 1,
        explanation: "2 + 2 = 4."
      },
      "q2": {
        correctOptionIndex: 0,
        explanation: "React is a Javascript library/framework."
      }
    },
    updatedAt: now,
  },
  "quiz_auto_7": {
    quizId: "quiz_auto_7",
    questions: {
      "q1": {
        correctOptionIndex: 1,
        explanation: "2 + 2 = 4."
      },
      "q2": {
        correctOptionIndex: 0,
        explanation: "React is a Javascript library/framework."
      }
    },
    updatedAt: now,
  }
};

export const announcements: Record<ID, Announcement> = {
  "ann_welcome": {
    id: "ann_welcome",
    type: "news",
    title: "Welcome to the new Beacon Platform!",
    content: "We're excited to launch the Professional version of Beacon, featuring specialized career paths and AI-driven recommendations.",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }
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
      "openai": true,
      "supabase_storage": true
    },
    providerProjectIds: {
      "firebase": "beacon-production"
    },
    updatedAt: now,
  }
};
