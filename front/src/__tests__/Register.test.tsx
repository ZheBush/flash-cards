import '@testing-library/jest-dom';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../register/Register';
import { MemoryRouter } from 'react-router-dom';

const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...(require('react-router-dom') as object),
  useNavigate: () => mockNavigate,
}));

jest.mock('../AuthContext.tsx', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

describe('Register component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (window.fetch as any) = jest.fn();
    window.alert = jest.fn() as any;
  });

  it('renders registration form with required fields', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/••••••••/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('shows password confirmation error when passwords do not match', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'firstpass' },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[1], {
      target: { value: 'secondpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('validates email format before submitting', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'password' },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[1], {
      target: { value: 'password' },
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText(/Incorrect email/i)).toBeInTheDocument();
  });

  it('shows user already exists error when server returns 400', async () => {
    (window.fetch as any)
      .mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ detail: 'User already exists' }) });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'exists@example.com' },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[0], {
      target: { value: 'password' },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[1], {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => expect(window.alert).toHaveBeenCalled());
  });

  it('successfully registers and calls login with server response', async () => {
    (window.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'token-456',
        token_type: 'bearer',
        role: 'user',
        user_id: 'new-user-id',
      }),
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'newuser@example.com' },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[0], {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[1], {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('handles network errors during registration', async () => {
    (window.fetch as any).mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[0], {
      target: { value: 'password' },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[1], {
      target: { value: 'password' },
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => expect(window.alert).toHaveBeenCalled());
  });

  it('disables register button while submitting', async () => {
    let resolveRequest: any;
    const promise = new Promise(resolve => {
      resolveRequest = resolve;
    });
    (window.fetch as any).mockReturnValue(promise);

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[0], {
      target: { value: 'password' },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[1], {
      target: { value: 'password' },
    });

    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(registerButton).toBeDisabled();
    });
  });
});
