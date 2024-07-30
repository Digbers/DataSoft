import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import PropTypes from 'prop-types';

const Navbar = ({ menus, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navRef = useRef(null);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
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
    <li key={menu.id} className="text-sm lg:text-base py-1">
      <div className="flex justify-items-start w-full">
        {menu.menuUrl === '/' ? (
          <button onClick={() => toggleSubmenu(menu.id)} className="flex items-center text-gray-800 hover:text-blue-600 hover:animate-pulse">
            <i className={`fas ${menu.icon} mr-2`}></i>
            {!isCollapsed && menu.menuName}
            <i className={`fas fa-chevron-${openSubmenus[menu.id] ? 'up' : 'down'} ml-2`}></i>
          </button>
        ) : (
          <Link to={menu.menuUrl} className="flex items-center text-gray-800 hover:text-blue-600 hover:animate-pulse">
            <i className={`fas ${menu.icon} mr-2`}></i>
            {!isCollapsed && menu.menuName}
          </Link>
        )}
      </div>
      {menu.submenus && menu.submenus.length > 0 && openSubmenus[menu.id] && (
        <ul className="pl-4 mt-2 space-y-2">
          {menu.submenus.map(submenu => renderMenu(submenu))}
        </ul>
      )}
    </li>
  );

  return (
    <div className="rounded-lg bg-gradient-to-b relative flex flex-col items-center justify-between" ref={navRef}>
      <button 
        className="absolute top-4 left-4 p-2 text-gray-800 bg-gray-200 rounded-md md:hidden"
        onClick={toggleNavbar}
      >
        <i className="fas fa-bars"></i>
      </button>
      <nav className={`rounded-lg fixed top-0 left-0 h-full flex justify-between flex-col dark:bg-green-300 dark:text-gray-200 bg-green-400 text-white transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-full lg:${isCollapsed ? 'w-16' : 'w-48'} ${isCollapsed ? 'w-16' : 'w-48'}`}>
        <ul className="flex flex-col mt-5 w-full p-4 items-start space-y-4 md:space-y-0">
          {menus.map(menu => renderMenu(menu))}
        </ul>
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          <div className="flex items-center p-2 text-gray-800 bg-white rounded-md w-full">
            <i className="fas fa-user mr-2"></i>
            <h1 className={`text-sm ${isCollapsed ? 'hidden' : 'block'}`}>{user}</h1>
          </div>
          <button className="flex items-center p-2 text-gray-800 bg-white rounded-md w-full">
            <i className="fas fa-sign-out mr-2"></i>
            {!isCollapsed && 'Cerrar Sesión'}
          </button>
          <button className={`flex items-center p-2 text-gray-800 bg-transparent rounded-md w-full ${isCollapsed ? 'bg-white' :'bg-transparent'}`} onClick={toggleCollapse}>
            <i className={`fas ${isCollapsed ? 'fa-chevron-right mr-2' : 'fa-chevron-left'} mr-2`}></i>
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
  user: PropTypes.string
};

export default Navbar;
