declare module '@testing-library/react' {
  export function render(ui: React.ReactElement, options?: any): any;
  export const screen: any;
  export const fireEvent: any;
  export const waitFor: any;
}

declare module '@testing-library/jest-dom' {
  export {};
}

declare var describe: (name: string, fn: () => void) => void;
declare var it: (name: string, fn: () => void | Promise<void>) => void;
declare var expect: (actual: any) => any;
declare var beforeEach: (fn: () => void | Promise<void>) => void;
declare var afterEach: (fn: () => void | Promise<void>) => void;
declare var beforeAll: (fn: () => void | Promise<void>) => void;
declare var afterAll: (fn: () => void | Promise<void>) => void;

declare namespace jest {
  function fn(impl?: (...args: any[]) => any): any;
  function mock(moduleName: string, factory?: () => any): typeof jest;
  function clearAllMocks(): typeof jest;
}
