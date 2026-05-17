import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserRole } from './types';

export interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  loading: boolean;
  isGuest: boolean;
  createGuestSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role') as UserRole | null;
    const email = localStorage.getItem('user_email');
    const userId = localStorage.getItem('user_id');
    
    if (token && role) {
      setUser({ 
        token, 
        email: email || undefined, 
        role,
        id: userId || undefined
      });
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    if (userData.token) {
      localStorage.setItem('access_token', userData.token);
    }
    if (userData.tokenType) {
      localStorage.setItem('token_type', userData.tokenType);
    }
    localStorage.setItem('user_role', userData.role);
    if (userData.email) {
      localStorage.setItem('user_email', userData.email);
    }
    if (userData.id) {
      localStorage.setItem('user_id', userData.id);
    }
  };

  const logout = async () => {
    try {
      // Отправляем запрос на сервер для удаления refresh token из cookies
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Очищаем localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_id');
      setUser(null);
    }
  };

  const createGuestSession = () => {
    const guestId = `guest_${Date.now()}`;
    const guestUser: User = {
      id: guestId,
      role: 'guest',
    };
    setUser(guestUser);
    localStorage.setItem('user_role', 'guest');
    localStorage.setItem('user_id', guestId);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      isGuest: user?.role === 'guest',
      createGuestSession 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};