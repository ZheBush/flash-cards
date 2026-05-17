const API_BASE = 'http://localhost:3001';

interface AuthResponse {
  access_token: string;
  token_type: string;
  role: string;
  user_id: string;
}

export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;

  const token = localStorage.getItem('access_token');
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const response = await fetch(fullUrl, { 
    ...options, 
    headers,
    credentials: 'include' 
  });

  if (response.status === 401) {
    try {
      const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', 
      });

      if (refreshResponse.ok) {
        const data: AuthResponse = await refreshResponse.json();

        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token_type', data.token_type);
        localStorage.setItem('user_role', data.role);
        localStorage.setItem('user_id', data.user_id);

        const newHeaders = {
          ...options.headers,
          'Authorization': `Bearer ${data.access_token}`,
        };
        return fetch(fullUrl, { ...options, headers: newHeaders, credentials: 'include' });
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_id');
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    } catch (error) {
      console.error('Refresh failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_id');
      window.location.href = '/login';
      throw error;
    }
  }

  return response;
};

export const logout = async (): Promise<void> => {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include', 
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    window.location.href = '/login';
  }
};