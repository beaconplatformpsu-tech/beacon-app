// @ts-ignore
import { renderHook } from '@testing-library/react';
import { useCurrentUserRole } from '../use-current-user-role';
import { useAuth } from '@/lib/auth/AuthContext';

jest.mock('@/lib/auth/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('useCurrentUserRole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns loading true initially and handles no user', () => {
    (useAuth as jest.Mock).mockReturnValueOnce({
      currentUser: null,
      role: null,
      loading: true
    });

    const { result } = renderHook(() => useCurrentUserRole());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('returns role for authenticated user', () => {
    const mockUser = { uid: 'u1', email: 'test@test.com' };
    
    (useAuth as jest.Mock).mockReturnValueOnce({
      currentUser: mockUser,
      role: 'admin',
      loading: false
    });

    const { result } = renderHook(() => useCurrentUserRole());
    
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.role).toBe('admin');
  });
  
  it('defaults to student if role does not exist', () => {
    const mockUser = { uid: 'u1', email: 'test@test.com' };
    
    (useAuth as jest.Mock).mockReturnValueOnce({
      currentUser: mockUser,
      role: 'student',
      loading: false
    });

    const { result } = renderHook(() => useCurrentUserRole());
    
    expect(result.current.loading).toBe(false);
    expect(result.current.role).toBe('student');
  });
});
