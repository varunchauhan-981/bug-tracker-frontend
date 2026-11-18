import { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user session from localStorage on initial application boot
  useEffect(() => {
    const storedUser = localStorage.getItem('bugTrackerUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Authenticate user credentials and persist session
  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('bugTrackerUser', JSON.stringify(data));
    setUser(data);
    return data;
  };

  // Register new user account and persist session
  const register = async (name, email, password, role) => {
    const { data } = await API.post('/auth/register', {
      name,
      email,
      password,
      role,
    });
    localStorage.setItem('bugTrackerUser', JSON.stringify(data));
    setUser(data);
    return data;
  };

  // Clear user session on logout
  const logout = () => {
    localStorage.removeItem('bugTrackerUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);