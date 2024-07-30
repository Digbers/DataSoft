import Navbar from "../components/navbar/Navbar";
import PropTyes from 'prop-types';
import { useState, useEffect } from 'react';
import UsersTable from "../features/users/UsersTable";
import ThemeToggleButton from "../components/buttons/ThemeToggleButton";
import { getMenusByUserName } from "../features/menu/menuService";
import { Route, Routes } from 'react-router-dom';
import ParticlesComponent from "../components/Particles";
import renderRoutes from '../components/routes/RenderRoutes'; 
const MainPage = ({ user }) => {
  const [menus, setMenus] = useState([]);
  //const navigate = useNavigate();

  useEffect(() => {
    getMenusByUserName(user)
      .then(response => {
        setMenus(response.data);
      })
      .catch(error => {
        console.error('Error fetching menus:', error);
      });
  }, [user]);

  return (
    <div className="flex h-screen w-screen dark:bg-gray-900">
      <ParticlesComponent id="tsparticles" className="absolute top-0 left-0 w-full h-full" />
      <Navbar menus={menus} user={ user} />
      <div className="flex-1 p-2 bg-white w-full rounded-lg dark:bg-gray-900 dark:text-gray-200">
        <div className="flex justify-end">
          <p className="mt-4 text-lg">Welcome, {user}</p>
          <ThemeToggleButton />
        </div>
        <Routes>
          <Route path="/" element={<UsersTable />} />
          {renderRoutes(menus)}
        </Routes>
      </div>
    </div>
  );
};
MainPage.propTypes = {
  user: PropTyes.string.isRequired,
  authorities: PropTyes.string.isRequired
};

export default MainPage;