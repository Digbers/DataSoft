import { Route } from 'react-router-dom';

const importComponent = (path) => {
  switch (path) {
    case 'mantenimiento/usuarios/':
      return import('../../app/mantenimiento/usuarios');
    case 'mantenimiento/empresas/':
      return import('../../app/mantenimiento/empresas');
    case 'ventas/nuevo/':
      return import('../../app/ventas/nuevo');
    case 'ventas/comprobantes/':
      return import('../../app/ventas/comprobantes');
    default:
      return import('../../pages/NotFoundPage'); 
  }
};

const renderRoutes = (menuItems) => {
  const routes = [];

  const createRoutes = (menus) => {
    menus.forEach(menu => {
      if (menu.menuUrl !== "/") {
        importComponent(menu.menuUrl).then(module => {
          const Component = module.default;

          routes.push(
            <Route
              key={menu.id}
              path={menu.menuUrl}
              element={<Component />}
            />
          );
        }).catch(error => {
          console.error(`Error loading component for ${menu.menuUrl}:`, error);
        });
      }

      if (menu.submenus && menu.submenus.length > 0) {
        createRoutes(menu.submenus);
      }
    });
  };

  createRoutes(menuItems);
  return routes;
};

export default renderRoutes;