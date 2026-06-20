import { useState } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContextDefinition';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    setUser(response.data.user);
  };

  const register = async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    setUser(response.data.user);
  };

  const loginWithToken = async (token) => {
    localStorage.setItem('token', token);
    const response = await api.get('/auth/me');
    localStorage.setItem('user', JSON.stringify(response.data));
    setUser(response.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUsername = async (username) => {
    const response = await api.put('/auth/username', { username });
    localStorage.setItem('user', JSON.stringify(response.data));
    setUser(response.data);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loginWithToken, updateUsername }}>
      {children}
    </AuthContext.Provider>
  );
}