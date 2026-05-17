import React from 'react';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Cards from '../cards/Cards';
import { MemoryRouter } from 'react-router-dom';
import * as authModule from '../AuthContext.tsx';

const navigateMock = jest.fn();

jest.mock('react-router-dom', () => ({
  ...(require('react-router-dom') as object),
  useNavigate: () => navigateMock,
  useLocation: () => ({ pathname: '/cards' }),
}));

describe('Cards component', () => {
  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    role: 'user',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (window.fetch as jest.Mock) = jest.fn();
    jest.spyOn(authModule, 'useAuth').mockImplementation(() => ({
      user: mockUser,
      isGuest: false,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      createGuestSession: jest.fn(),
    }));
  });

  it('redirects unauthenticated users to login', () => {
    jest.spyOn(authModule, 'useAuth').mockImplementation(() => ({
      user: null,
      isGuest: false,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      createGuestSession: jest.fn(),
    }));

    render(
      <MemoryRouter>
        <Cards />
      </MemoryRouter>
    );

    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  it('renders cards container for authenticated user', () => {
    (window.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });

    render(
      <MemoryRouter>
        <Cards />
      </MemoryRouter>
    );

    // Component should render without redirecting
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('handles API errors when fetching cards', async () => {
    (window.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ detail: 'Server error' }),
    });

    window.alert = jest.fn();

    render(
      <MemoryRouter>
        <Cards />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled();
    });
  });
});
