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
import Swal from 'sweetalert2'
import ConfiguracionMenus from "../app/configuracion/menus";
import ConfiguracionUsuarios from "../app/configuracion/usuarios";

const MainPage = ({ user, userCode, sesionEmpId, sesionAlmacenId, sesionPuntoVentaId }) => {
  const [menus, setMenus] = useState([]);
  const [datosEmp, setDatosEmp] = useState({
    nombreEmpresa: '',
    nombreAlmacen: '',
    nombrePuntoVenta: ''
  });
  
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
  }, [userCode]);
  
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
  

  return (
    <div className="absolute top-0 left-0 flex h-full w-full bg-gradient-to-br from-green-200 via-blue-300 to-purple-300 overflow-hidden">
  {/* Fondo de partículas */}
  <ParticlesComponent id="tsparticles" className="absolute top-0 left-0 w-full h-full" />

  {/* Barra de navegación */}
  <Navbar menus={menus} user={user} datosEmp={datosEmp} />

  {/* Contenedor principal con efecto de glassmorphism */}
  <div className="relative flex-1 p-2 bg-white bg-opacity-20 backdrop-blur-lg dark:bg-gray-900 dark:bg-opacity-20 overflow-hidden w-full h-full rounded shadow-xl dark:text-gray-200">
    <div className="flex justify-end bg-white dark:bg-gray-900 rounded-md  p-2">
      <p className="mt-4 text-lg text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600">
        Bienvenido, {user} a {datosEmp.nombreEmpresa}.
      </p>
      <ThemeToggleButton />
    </div>

    {/* Contenedor de rutas */}
    <div className="h-[calc(100%-4rem)] rounded bg-white bg-opacity-20 backdrop-blur-lg shadow-inner dark:bg-gray-800 dark:bg-opacity-20 flex flex-col">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/configuracion/menus/" element={<ConfiguracionMenus />} />
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