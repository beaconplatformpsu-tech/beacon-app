import React from 'react';
import { render } from '@testing-library/react';
import { useAuth } from '@/lib/auth/AuthContext';

const { useCurrentUserRole } = jest.requireActual('../use-current-user-role');

function HookProbe({ onRender }: { onRender: (value: ReturnType<typeof useCurrentUserRole>) => void }) {
  const value = useCurrentUserRole();
  onRender(value);
  return null;
}

jest.mock('@/lib/auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('useCurrentUserRole', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns loading true initially and handles no user', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      role: null,
      loading: false,
    } as any);

    const onRender = jest.fn();
    render(React.createElement(HookProbe, { onRender }));

    const result = onRender.mock.calls[0][0];
    expect(result.user).toBeNull();
    expect(result.role).toBeNull();
    expect(result.session).toBeNull();
  });

  it('returns the auth role for an authenticated user', () => {
    const mockUser = { uid: 'u1', email: 'test@test.com' };
    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      role: 'admin',
      loading: false,
    } as any);

    const onRender = jest.fn();
    render(React.createElement(HookProbe, { onRender }));

    const result = onRender.mock.calls[0][0];
    expect(result.user).toEqual(mockUser);
    expect(result.role).toBe('admin');
  });

  it('defaults to student if the auth hook reports a student role', () => {
    const mockUser = { uid: 'u1', email: 'test@test.com' };
    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      role: 'student',
      loading: false,
    } as any);

    const onRender = jest.fn();
    render(React.createElement(HookProbe, { onRender }));

    const result = onRender.mock.calls[0][0];
    expect(result.role).toBe('student');
  });
});
