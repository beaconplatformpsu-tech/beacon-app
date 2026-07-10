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
