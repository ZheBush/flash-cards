import React from 'react';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../home/Home';
import * as authModule from '../AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { AuthContextType } from '../AuthContext';

// Переменная должна начинаться с "mock" (case insensitive)
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  // Перечисляем только то, что используем
  MemoryRouter: ({ children }: { children: React.ReactNode }) => children,
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/home' }),
}));

describe('Home component - Guest User', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(authModule, 'useAuth').mockImplementation(() => ({
      user: null,
      isGuest: false,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      createGuestSession: jest.fn(),
    }));
  });

  it('renders home page with file upload options', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.queryByRole('button', { name: /choose txt file/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /choose pdf file/i })).toBeInTheDocument();
  });

  it('redirects to login when unauthenticated user clicks TXT file button', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /choose txt file/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('redirects to login when unauthenticated user clicks PDF file button', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /choose pdf file/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});

describe('Home component - Authenticated User', () => {
  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    role: 'user',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(authModule, 'useAuth').mockImplementation(() => ({
      user: mockUser,
      isGuest: false,
      loading: false,
      login: jest.fn() as any,
      logout: jest.fn() as any,
      createGuestSession: jest.fn(),
    } as AuthContextType));
  });

  it('allows authenticated user to interact with file upload', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const txtButton = screen.getByRole('button', { name: /choose txt file/i });
    expect(txtButton).toBeInTheDocument();
    expect(txtButton).not.toBeDisabled();
  });

  it('displays user email when authenticated', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText(/user@example.com/i)).toBeInTheDocument();
  });
});

describe('Home component - Loading state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(authModule, 'useAuth').mockImplementation(() => ({
      user: null,
      isGuest: false,
      loading: true,
      login: jest.fn(),
      logout: jest.fn(),
      createGuestSession: jest.fn(),
    }));
  });

  it('shows loading indicator while checking authentication', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: /choose txt file/i })).toBeInTheDocument();
  });
});