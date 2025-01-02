import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import  { jwtDecode } from 'jwt-decode'; 
import axios from 'axios';
import PropTyes from 'prop-types';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); 
  const [userCode, setUserCode] = useState(null);
  const [authorities, setAuthorities] = useState(null);
  const [sesionEmpId, setSesionEmpId] = useState(null);
  const [sesionAlmacenId, setSesionAlmacenId] = useState(null);
  const [sesionPuntoVentaId, setSesionPuntoVentaId] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setUserCode(null);
    setAuthorities(null);
    setSesionEmpId(null);
    setSesionAlmacenId(null);
    setSesionPuntoVentaId(null);
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime > decodedToken.exp) {
          logout();
          window.location.href = '/login'; // Redirige al login si el token ha expirado
        }
      }
    }, 300000); // Verifica cada 5 minutos (300000ms)
  
    return () => clearInterval(interval); // Limpia el intervalo cuando el componente se desmonta
  }, [logout]); // Ahora 'logout' está memoizado y no genera advertencias

  const fetchDataCallback = useCallback(() => {
    const token = localStorage.getItem('token');
    console.log(token);
    if (token) {

      const decodedToken = jwtDecode(token);
      const exp = decodedToken.exp;

      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime <= exp) {
        setIsAuthenticated(true);
        if (decodedToken.sesionEmpId !== null){
          console.log("sesionEmpId: "+decodedToken.sesionEmpId);
          setSesionEmpId(decodedToken.sesionEmpId);
          console.log("sesionAlmacenId: "+decodedToken.sesionAlmacenId);
          setSesionAlmacenId(decodedToken.sesionAlmacenId);
          console.log("sesionPuntoVentaId: "+decodedToken.sesionPuntoVentaId);
          setSesionPuntoVentaId(decodedToken.sesionPuntoVentaId);
        }
        console.log("usercodigo: "+decodedToken.usercodigo);
        setUserCode(decodedToken.usercodigo);
        setUser(decodedToken.sub);
        console.log("user: "+ decodedToken.sub);
        setAuthorities(decodedToken.authorities);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        setUserCode(null);
        setAuthorities(null);
        setSesionEmpId(null);
        setSesionAlmacenId(null);
        setSesionPuntoVentaId(null);
        axios.defaults.headers.common['Authorization'] = null;
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
    setUser(decodedToken.sub);
    setUserCode(decodedToken.usercodigo);
    setAuthorities(decodedToken.authorities.split(','));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };
  const loginComplete = (token) => {
    localStorage.setItem('token', token);
    const decodedToken = jwtDecode(token);
    setIsAuthenticated(true);
    setUser(decodedToken.sub);
    setUserCode(decodedToken.usercodigo);
    setAuthorities(decodedToken.authorities.split(','));
    setSesionEmpId(decodedToken.sesionEmpId);
    setSesionAlmacenId(decodedToken.sesionAlmacenId);
    setSesionPuntoVentaId(decodedToken.sesionPuntoVentaId);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }


  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, authorities, sesionEmpId, sesionAlmacenId, sesionPuntoVentaId, loginComplete, userCode }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTyes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
