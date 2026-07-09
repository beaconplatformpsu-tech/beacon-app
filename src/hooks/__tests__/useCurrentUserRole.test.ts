// @ts-ignore
import { renderHook, waitFor } from '@testing-library/react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { get, ref } from 'firebase/database';

const { useCurrentUserRole } = jest.requireActual('../use-current-user-role');

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn()
}));

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(),
  ref: jest.fn((db, path) => path),
  get: jest.fn()
}));

jest.mock('@/lib/firebase/config', () => ({
  auth: {},
  db: {}
}));

describe('useCurrentUserRole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns loading true initially and handles no user', async () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(null);
      return jest.fn(); // unsubscribe
    });

    const { result } = renderHook(() => useCurrentUserRole());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('fetches role for authenticated user', async () => {
    const mockUser = { uid: 'u1', email: 'test@test.com' };
    
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(mockUser);
      return jest.fn();
    });

    (get as jest.Mock).mockResolvedValue({
      exists: () => true,
      val: () => 'admin'
    });

    const { result } = renderHook(() => useCurrentUserRole());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.role).toBe('admin');
  });
  
  it('defaults to student if role does not exist', async () => {
    const mockUser = { uid: 'u1', email: 'test@test.com' };
    
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(mockUser);
      return jest.fn();
    });

    (get as jest.Mock).mockResolvedValue({
      exists: () => false,
      val: () => null
    });

    const { result } = renderHook(() => useCurrentUserRole());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.role).toBe('student');
  });
});
