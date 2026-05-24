import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { setProfile, clearProfile } from '../redux/authSlice';
import { useQueryClient } from '@tanstack/react-query';

export type Role = 'SUPERADMIN' | 'ADMIN' | 'HOD' | 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  department?: {
    _id: string;
    name: string;
    college?: {
      _id: string;
      name: string;
    };
  };
}



interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();


  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(parsedUser);
      dispatch(setProfile(parsedUser));
    }

  }, []);

  const login = (newUser: User, newToken: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    dispatch(setProfile(newUser));
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };


  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
