import React from 'react';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../login/Login';
import { MemoryRouter } from 'react-router-dom';

const mockLogin = jest.fn();
const createGuestSessionMock = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...(require('react-router-dom') as object),
  useNavigate: () => mockNavigate,
}));

jest.mock('../AuthContext.tsx', () => ({
  useAuth: () => ({
    login: mockLogin,
    createGuestSession: createGuestSessionMock,
  }),
}));

describe('Login component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (window.fetch as jest.Mock) = jest.fn();
    window.alert = jest.fn();
  });

  it('renders login form with email and password inputs', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('validates email format and shows error message', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'invalid-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/Incorrect email/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login and stores access token on successful submit', async () => {
    (window.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'token-123',
        token_type: 'bearer',
        role: 'user',
        user_id: 'user-1',
      }),
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
        token: 'token-123',
      })
    ));
  });

  it('handles login API error and shows error message', async () => {
    (window.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Invalid credentials' }),
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => expect(window.alert).toHaveBeenCalled());
  });

  it('handles network errors gracefully', async () => {
    (window.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => expect(window.alert).toHaveBeenCalled());
  });

  it('calls guest session when Continue as Guest button is clicked', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /continue as guest/i }));
    expect(createGuestSessionMock).toHaveBeenCalled();
  });

  it('disables login button while loading', async () => {
    let resolveRequest: any;
    const promise = new Promise(resolve => {
      resolveRequest = resolve;
    });
    (window.fetch as jest.Mock).mockReturnValue(promise);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'password' },
    });

    const loginButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(loginButton).toBeDisabled();
    });

    resolveRequest({
      ok: true,
      json: async () => ({
        access_token: 'token-123',
        token_type: 'bearer',
      }),
    });
  });
});
