
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css'
import HomePage from './pages/HomePage';
import MainPage from './pages/MainPage';
import Login from './features/login/Login';
import { useAuth } from './context/AuthContext';
import NotFoundPage from './pages/NotFoundPage';
import { ThemeProvider } from './context/ThemeContext';
function App() {
  const { isAuthenticated, user, authorities } = useAuth();

  return (
    <ThemeProvider>
      <Router>
        {/* {isAuthenticated && <Navbar />} */}
        
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/main" /> : <Login />} />
          <Route path="/" element={isAuthenticated ? <Navigate to="/main" /> : <Navigate to="/login" />} />
          <Route path="/main/*" element={isAuthenticated ? <MainPage user= {user} authorities={authorities} /> : <Navigate to="/login" />} />
          <Route path="/home" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="*" element={<NotFoundPage />} /> {/* Ruta 404 */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App
