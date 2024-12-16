import { useEffect, useState } from 'react';
import axios from "../../../config/axiosConfig";
import { useAuth } from '../../../context/AuthContext';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';

const ConfiguracionMenus = ({onPermisosGuardados}) => {
  const [usuarios, setUsuarios] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const { userCode} = useAuth();

  // Fetch inicial para cargar los usuarios y seleccionar el usuario por defecto
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get('http://localhost:8080/auth/users/list-users'); // Ajusta la URL de la API
        const usuarios = response.data.map((usuario) => ({
          value: usuario.usercodigo,
          label: usuario.username,
        }));
        setUsuarios(usuarios);
        const usuarioEncontrado = usuarios.find((usuario) => usuario.value === userCode);
        setSelectedUser(usuarioEncontrado.value);

      } catch (error) {
        console.error('Error fetching usuarios:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Hubo un error al cargar los usuarios',
        });
      }
    };
    fetchUsuarios();
  }, [userCode]);

  // Fetch de menús al seleccionar un usuario
  useEffect(() => {
    const fetchMenus = async () => {
      if (selectedUser) {
        try {
          const response = await axios.get(`http://localhost:8080/auth/menus/menus-permisos/${selectedUser}`);
          setMenus(response.data);
          console.log(response.data);
        } catch (error) {
          console.error('Error fetching menus:', error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Hubo un error al cargar los menús',
          });
        }
      }
    };
    fetchMenus();
  }, [selectedUser]);

  // Manejar cambio en el checkbox de disponibilidad de submenús
  const toggleMenuDisponible = (menuId, submenuId) => {
    setMenus((prevMenus) =>
      prevMenus.map((menu) =>
        menu.id === menuId
          ? {
              ...menu,
              submenus: menu.submenus.map((submenu) =>
                submenu.id === submenuId
                  ? { ...submenu, menuDisponible: !submenu.menuDisponible }
                  : submenu
              ),
            }
          : menu
      )
    );
  };
  // Manejar guardar permisos
  const handleSave = async () => {
    const permisosIds = menus
      .filter(menu => menu.menuDisponible || menu.submenus.some(submenu => submenu.menuDisponible)) // Filtra menús y submenús seleccionados
      .flatMap(menu => [
        menu.id, // Incluye el ID del menú si está disponible
        ...menu.submenus
          .filter(submenu => submenu.menuDisponible)
          .map(submenu => submenu.id) // Incluye IDs de submenús seleccionados
      ]);

    try {
      const response = await axios.post(`http://localhost:8080/auth/menus/guardar-menus-permisos/${selectedUser}`, permisosIds);

      if (response.data === true) { // Si la respuesta es true, indica éxito
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Permisos guardados correctamente',
        });
        onPermisosGuardados();
      } else { // Si la respuesta no es true, indica un problema
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron guardar los permisos correctamente',
        });
      }
    } catch (error) {
      console.error('Error guardando permisos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Hubo un error al guardar los permisos',
      });
    }
  };


  return (
    <div className="configuracion-menus flex-1 overflow-y-auto p-4">

      {/* Select de usuarios */}
      <div className="mb-2 flex flex-row justify-between border rounded-lg dark:bg-gray-800 bg-white text-gray-500 dark:text-gray-300 p-2">
        <h3 className="text-2xl font-bold">Configuración de Menús</h3>
        <div className='flex flex-col'>
          <label htmlFor="userSelect">Seleccionar Usuario:</label>
          <select
              id="userSelect"
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              {usuarios.map((usuario) => (
                <option key={usuario.value} value={usuario.value}>
                  {usuario.label}
                </option>
              ))}
          </select>
        </div>
        
      </div>

      {/* Renderizado de menús y submenús */}
      <div className="menu-list mt-4 rounded-lg dark:bg-transparent bg-transparent border shadow-md md:px-10 lg:px-40 px-2">
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-2 lg:gap-8">
          {menus.map((menu) => (
            <div
              key={menu.id}
              data-menu-id={menu.id}
              className="menu-item p-4 rounded-lg shadow-lg bg-gray-100 dark:bg-gray-800"
            >
              <h3 className="menu-name text-lg font-semibold flex items-center">
                <i className={`fa ${menu.icon} mr-2`}></i>
                {menu.menuName}
              </h3>
              <ul className="submenu-list ml-4 mt-2">
                {menu.submenus.map((submenu) => (
                  <li
                    key={submenu.id}
                    data-submenu-id={submenu.id}
                    className="submenu-item flex items-center justify-between p-2"
                  >
                    <div className="flex items-center">
                      <i className={`fa ${submenu.icon} mr-2`}></i>
                      <span>{submenu.menuName}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={submenu.menuDisponible}
                      onChange={() => toggleMenuDisponible(menu.id, submenu.id)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* Botón de guardar */}
        <div className="mt-4 flex justify-end">
          <button
            className="flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white p-2 rounded-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105"
            onClick={handleSave}
          >
            Guardar Cambios
            <i className="fas fa-save"></i>
          </button>
        </div>
      </div>

    </div>
  );
};

ConfiguracionMenus.propTypes = {
  onPermisosGuardados: PropTypes.func.isRequired
};

export default ConfiguracionMenus;
