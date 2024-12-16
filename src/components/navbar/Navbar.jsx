import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import PropTypes from 'prop-types';

import avicola from '../../assets/avicola.png';
const Navbar = ({ menus, datosEmp }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navRef = useRef(null);
  

  const toggleNavbar = () => {
    setIsOpen(prevState => !prevState);
  };

  

  const toggleSubmenu = (menuId) => {
    setOpenSubmenus(prevState => ({
      ...prevState,
      [menuId]: !prevState[menuId]
    }));
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderMenu = (menu) => (
    <li key={menu.id} className={`text-sm ${isCollapsed ? 'p-0' : 'py-1'} transition-all flex-center cursor-pointer p-16-semibold w-full whitespace-nowrap`}>
      <div className={`flex justify-evenly w-full ${isCollapsed ? 'justify-center' : 'justify-evenly'} rounded-md`}>
        {menu.menuUrl === '/' ? (
          <button
            onClick={() => toggleSubmenu(menu.id)}
            className={`${
              openSubmenus[menu.id] ? 'bg-slate-300 dark:bg-slate-100' : 'bg-transparent'
            } w-full py-3 justify-evenly text-left  p-16-semibold flex size-full gap-4 p-4 group font-semibold rounded-full bg-cover hover:bg-purple-100 hover:shadow-inner focus:bg-gradient-to-r from-purple-400 to-purple-600 focus:text-white text-gray-700 transition-all ease-linear`}
          >
            <i className={`fas ${menu.icon} ${isCollapsed ? '' : 'mr-2'}`}></i>
            {!isCollapsed && menu.menuName}
            <i className={`fas fa-chevron-${openSubmenus[menu.id] ? 'up' : 'down'}`}></i>
          </button>
        ) : (
          <Link
            to={menu.menuUrl}
            className={`flex w-full items-center ${isCollapsed ? 'justify-center' : 'justify-center'} w-full py-3  text-left  p-16-semibold flex size-full gap-4 p-4 group font-semibold rounded-full bg-cover hover:bg-purple-100 hover:shadow-inner focus:bg-gradient-to-r from-purple-400 to-purple-600 focus:text-white text-gray-700 transition-all ease-linear`}
          >
            <i className={`fas ${menu.icon} ${isCollapsed ? '' : 'mr-2'} dark:text-gray-100`}></i>
            {!isCollapsed && menu.menuName}
          </Link>
        )}
      </div>
      {menu.submenus && menu.submenus.length > 0 && openSubmenus[menu.id] && (
        <ul
          className={`${isCollapsed ? 'p-0' : ''}`} 
        >
          {menu.submenus.map((submenu) => renderMenu(submenu))}
        </ul>
      )}

    </li>
  );

  return (
    <div className="bg-white dark:bg-gray-900 relative flex flex-col items-center justify-between" ref={navRef}>
      {!isOpen && (
        <button
          className="absolute top-4 left-4 p-2 text-gray-800 bg-gray-200 rounded-md md:hidden z-10 transition-all duration-300 ease-in-out"
          onClick={toggleNavbar}
        >
          <i className="fas fa-bars"></i>
        </button>
      )}
      
      <nav
        className={` shadow-md fixed top-0 left-0 h-full flex justify-between flex-col bg-opacity-85 text-white transition-transform transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:h-full lg:${isCollapsed ? 'w-16' : 'w-48'} ${
          isCollapsed ? 'w-16' : 'w-48'
        } glassmorphism-effect`}
        style={{ zIndex: 1000 }}
      >
        <ul className="flex flex-col w-full items-start">
          <div className={` bg-opacity-20 w-full rounded-b-lg  duration-400 text-gray-100 rounded-sm bg-cover hover:bg-purple-100 hover:shadow-inner bg-gradient-to-r from-purple-400 to-purple-600 focus:text-white transition-all ease-linear pb-2`}>
            <div className="items-center justify-center mb-4 md:mb-0  md:flex">
              <img className={`w-15 h-15 md:w-28 md:h-28 object-contain animate-pulse`} src={avicola} alt="Avicola Logo" />
            </div>
              <h3 className={`text-lg font-bold ${isCollapsed ? 'text-base' : 'text-xl'}`}>{datosEmp.nombreEmpresa}</h3>
              <h3 className={`text-sm ${isCollapsed ? 'hidden' : 'block'}`}>{datosEmp.nombreAlmacen}</h3>
              <h3 className={`text-sm ${isCollapsed ? 'hidden' : 'block'}`}>{datosEmp.nombrePuntoVenta}</h3>
          </div>
          <div className="flex flex-col w-full items-start overflow-y-auto max-h-96 rounded-md">
            {menus.map((menu) => renderMenu(menu))}
          </div>
        </ul>
        <div className="flex flex-col items-center justify-end space-y-0 h-full py-0">

              {/* Botón para colapsar */}
              <button
                type="button"
                className={`flex items-center justify-center p-2 text-gray-800 rounded-md w-full ${
                  isCollapsed ? 'bg-white' : 'bg-transparent'
                } glassmorphism-effect transition-all duration-300 ease-in-out`}
                onClick={toggleCollapse}
              >
                <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} mr-2`}></i>
              </button>
        </div>
      </nav>
    </div>
  );
};

Navbar.propTypes = {
  menus: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    menuName: PropTypes.string.isRequired,
    menuUrl: PropTypes.string.isRequired,
    nivel: PropTypes.number,
    padre: PropTypes.number,
    icon: PropTypes.string,
    submenus: PropTypes.arrayOf(PropTypes.object)
  })).isRequired,
  datosEmp: PropTypes.object
};

export default Navbar;
