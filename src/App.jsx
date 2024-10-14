
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css'
import HomePage from './pages/HomePage';
import MainPage from './pages/MainPage';
import Login from './features/login/Login';
import { useAuth } from './context/AuthContext';
import NotFoundPage from './pages/NotFoundPage';
import { ThemeProvider } from './context/ThemeContext';
import EmpresaAlmacen from './features/login/EmpresaAlmacen';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  const { isAuthenticated, user, authorities, sesionPuntoVentaId,sesionEmpId, sesionAlmacenId, userCode } = useAuth();
  let isDatosEmpresa = false;
  if(sesionPuntoVentaId !== null && sesionPuntoVentaId !== undefined && isAuthenticated){
    isDatosEmpresa = true;
  }
  return (
    <ThemeProvider>
      <Router>        
        <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              isDatosEmpresa ? (
                <Navigate to="/main" replace />
              ) : (
                <Navigate to="/empresa" replace />
              )
            ) : (
              <Login />
            )
          }
        />
        
        <Route
          path="/empresa"
          element={
            isAuthenticated ? (
              <EmpresaAlmacen user={user} userCode={userCode} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              isDatosEmpresa ? (
                <Navigate to="/main" replace />
              ) : (
                <Navigate to="/empresa" replace />
              )
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/main/*"
          element={
            isAuthenticated ? (
              <MainPage user={user} sesionAlmacenId={sesionAlmacenId} sesionEmpId={sesionEmpId} sesionPuntoVentaId={sesionPuntoVentaId} authorities={authorities} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        <Route
          path="/home"
          element={
            isAuthenticated ? (
              <HomePage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="*" element={<NotFoundPage />} />
          
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App
