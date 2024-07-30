import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import  { jwtDecode } from 'jwt-decode'; 
import axios from 'axios';
import PropTyes from 'prop-types';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); 
  const [authorities, setAuthorities] = useState(null);

  const fetchDataCallback = useCallback(() => {
    const token = localStorage.getItem('token');
    console.log(token);
    if (token) {

      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 > Date.now()) {
        setIsAuthenticated(true);
        setUser(decodedToken.sub);
        setAuthorities(decodedToken.authorities);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        localStorage.removeItem('token');
      }
    }
  }, []);

  useEffect(() => {
    fetchDataCallback();
  }, [fetchDataCallback]);

  const login = (token) => {
    localStorage.setItem('token', token);
    const decodedToken = jwtDecode(token);
    setIsAuthenticated(true);
    setUser(decodedToken);
    setAuthorities(decodedToken.authorities);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setAuthorities(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, authorities }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTyes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
