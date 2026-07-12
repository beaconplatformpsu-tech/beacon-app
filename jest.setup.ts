import '@testing-library/jest-dom';

// Mock matchMedia for jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
global.fetch = jest.fn();
global.Response = class Response {} as any;
global.Request = class Request {} as any;
global.Headers = class Headers {} as any;

jest.mock('firebase/app', () => ({
  __esModule: true,
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  __esModule: true,
  getAuth: jest.fn(() => ({ currentUser: null })),
  GoogleAuthProvider: class {},
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/database', () => ({
  __esModule: true,
  getDatabase: jest.fn(),
  ref: jest.fn(),
  child: jest.fn(),
  get: jest.fn(),
  query: jest.fn((ref) => ref),
  orderByChild: jest.fn(),
  equalTo: jest.fn(),
  limitToFirst: jest.fn(),
  limitToLast: jest.fn(),
  onValue: jest.fn((ref, callback) => {
    callback({ 
      val: () => null,
      exists: () => false
    });
    return jest.fn();
  }),
  push: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  set: jest.fn(),
}));

jest.mock('@/lib/firebase/config', () => ({
  __esModule: true,
  db: {},
  auth: { currentUser: null },
  storage: {},
  default: {}
}));

jest.mock('@/hooks/use-current-user-role', () => ({
  useCurrentUserRole: jest.fn(() => ({
    role: "student",
    session: { uid: "test-student-uid", email: "student@test.com" },
    loading: false
  }))
}));

jest.mock('@/i18n/LanguageProvider', () => {
  // We require the real English translations so that tests expecting English text pass
  const translations = require(process.cwd() + '/src/i18n/translations.ts').translations;
  const enTranslations = translations.en;
  
  return {
    __esModule: true,
    useLanguage: jest.fn(() => ({
      language: 'en',
      setLanguage: jest.fn(),
    })),
    useT: jest.fn(() => enTranslations),
  };
});

jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => {
      const React = require('react');
      return React.createElement(
        OriginalModule.ResponsiveContainer,
        { width: 800, height: 800 },
        children
      );
    },
  };
});

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: jest.fn() }
  }))
}));