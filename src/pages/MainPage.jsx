import Navbar from "../components/navbar/Navbar";
import PropTyes from 'prop-types';
import { useState, useEffect } from 'react';
//import UsersTable from "../features/users/UsersTable";
import ThemeToggleButton from "../components/buttons/ThemeToggleButton";
import { getMenusByUserName, getDatosEmpresa } from "../features/menu/menuService";
import { Route, Routes } from 'react-router-dom';
import ParticlesComponent from "../components/Particles";
import renderRoutes from '../components/routes/RenderRoutes'; 
import Dashboard from "../pages/Dashboard";
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2'
import ConfiguracionMenus from "../app/configuracion/menus";
import ConfiguracionUsuarios from "../app/configuracion/usuarios";
import { useAuth } from '../context/AuthContext';

const MainPage = ({ user, userCode, sesionEmpId, sesionAlmacenId, sesionPuntoVentaId }) => {
  const [menus, setMenus] = useState([]);
  const [datosEmp, setDatosEmp] = useState({
    nombreEmpresa: '',
    nombreAlmacen: '',
    nombrePuntoVenta: ''
  });
  const [navbarKey, setNavbarKey] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { logout, authorities } = useAuth();

  const isAdmin = authorities.includes('ROLE_ADMIN');
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  

  const handleClickLogout = () => {
    logout();
    window.location.href = '/login';      
  };
  
  useEffect(() => {
    getMenusByUserName(userCode)
      .then(response => {
        setMenus(response.data);
      })
      .catch(error => {
        console.error('Error fetching menus:', error);
        Swal.fire({
          icon: 'error',
          title: 'Ocurrió un error',
          text: 'Error al cargar los menús'
        });
      });
  }, [userCode, navbarKey]);
  
  useEffect(() => {
    getDatosEmpresa(sesionEmpId, sesionAlmacenId, sesionPuntoVentaId)
      .then(response => {
        //console.log('Datos recibidos:', response);
        setDatosEmp({
          nombreEmpresa: response.data.nombreEmpresa,
          nombreAlmacen: response.data.nombreAlmacen,
          nombrePuntoVenta: response.data.nombrePuntoVenta
        });
      })
      .catch(error => {
        console.error('Error fetching datos: ', error);
        Swal.fire({
          icon: 'error',
          title: 'Ocurrió un error',
          text: 'Error al cargar los datos de la empresa'
        });
      });
  }, [sesionEmpId, sesionAlmacenId, sesionPuntoVentaId]); // Add dependencies if they are dynamic

  

  const refreshNavbar = () => {
    setNavbarKey((prevKey) => prevKey + 1);
  };
  

  return (
    <div className="absolute top-0 left-0 flex h-full w-full bg-gradient-to-br from-green-200 via-blue-300 to-purple-300 overflow-hidden">
  {/* Fondo de partículas */}
  <ParticlesComponent id="tsparticles" className="absolute top-0 left-0 w-full h-full" />

  {/* Barra de navegación */}
  <Navbar key={navbarKey} menus={menus} user={user} datosEmp={datosEmp} />

  {/* Contenedor principal con efecto de glassmorphism */}
  <div className="relative flex-1 p-2 bg-white bg-opacity-20 backdrop-blur-lg dark:bg-gray-900 dark:bg-opacity-20 overflow-hidden w-full h-full rounded shadow-xl dark:text-gray-200">
    <div className="flex justify-end bg-white dark:bg-gray-900 rounded-md  p-2">
      <p className="mt-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600 text-sm md:text-lg hidden md:block">
        Bienvenido, {user} a {datosEmp.nombreEmpresa}.
      </p>
      <ThemeToggleButton />
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-between p-2 text-gray-800 bg-white rounded-md w-32 shadow-md transition-all duration-300 ease-in-out"
      >
        <div className="flex items-center">
          <i className="fas fa-user mr-2"></i>
          <span className="text-sm">{user}</span>
        </div>
        <i className={`fas ${isDropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'} ml-2`}></i>
      </button>

      {/* Menú desplegable */}
      {isDropdownOpen && (
      <ul className="absolute right-0 top-0 mt-16 w-48 bg-white rounded-md shadow-lg p-3 space-y-2 z-50">
        {/* Enlaces solo visibles para admin */}
        {isAdmin && (
          <>
            <li>
              <Link
                to="/main/configuracion/menus/"
                onClick={toggleDropdown}
                className="flex items-center p-2 text-gray-800 hover:bg-gray-200 rounded-md transition-all duration-300"
              >
                <i className="fas fa-cog mr-2"></i>
                Permisos de Menús
              </Link>
            </li>
            <li>
              <Link
                to="/main/configuracion/usuarios/"
                onClick={toggleDropdown}
                className="flex items-center p-2 text-gray-800 hover:bg-gray-200 rounded-md transition-all duration-300"
              >
                <i className="fas fa-users mr-2"></i>
                Usuarios
              </Link>
            </li>
          </>
        )}
        {/* Botón de cerrar sesión */}
        <li>
          <button
            type="button"
            onClick={() => {
              handleClickLogout();
            }}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white p-2 rounded-md font-semibold transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <i className="fas fa-sign-out"></i>
            Cerrar Sesión
          </button>
        </li>
      </ul>
    )}

    </div>

    {/* Contenedor de rutas */}
    <div className="h-[calc(100%-4rem)] rounded bg-white bg-opacity-20 backdrop-blur-lg shadow-inner dark:bg-gray-800 dark:bg-opacity-20 flex flex-col">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/configuracion/menus/" element={<ConfiguracionMenus onPermisosGuardados={refreshNavbar} />} />
        <Route path="/configuracion/usuarios/" element={<ConfiguracionUsuarios />} />
        {renderRoutes(menus)}
      </Routes>
    </div>
  </div>
</div>

  );
};
MainPage.propTypes = {
  userCode: PropTyes.string.isRequired,
  user: PropTyes.string.isRequired,
  authorities: PropTyes.string.isRequired,
  sesionEmpId: PropTyes.number.isRequired,
  sesionAlmacenId: PropTyes.number.isRequired,
  sesionPuntoVentaId: PropTyes.number.isRequired
};

export default MainPage;