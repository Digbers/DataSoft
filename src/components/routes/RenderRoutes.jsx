import { Route } from 'react-router-dom';

const importComponent = (path) => {
  switch (path) {
    case 'mantenimiento/empresas/':
      return import('../../app/mantenimiento/empresas');
    case 'mantenimiento/productos/':
      return import('../../app/mantenimiento/productos');
    case 'mantenimiento/envaces/':
      return import('../../app/mantenimiento/envaces');
    case 'mantenimiento/estadoccompras/':
      return import('../../app/mantenimiento/estadoccompras');
    case 'mantenimiento/estadocventas/':
      return import('../../app/mantenimiento/estadocventas');
    case 'mantenimiento/monedas/':
      return import('../../app/mantenimiento/monedas');
    case 'mantenimiento/puntosventas/':
      return import('../../app/mantenimiento/puntosventas');
    case 'mantenimiento/tipocventas/':
      return import('../../app/mantenimiento/tipocventas');
    case 'mantenimiento/tipodocumentos/':
      return import('../../app/mantenimiento/tipodocumentos');
    case 'mantenimiento/tipoentidades/':
      return import('../../app/mantenimiento/tipoentidades');
    case 'mantenimiento/tipoproductos/':
      return import('../../app/mantenimiento/tipoproductos');
    case 'mantenimiento/tipoccompras/':
      return import('../../app/mantenimiento/tipoccompras');
    case 'mantenimiento/unidades/':
      return import('../../app/mantenimiento/unidades');
    case 'mantenimiento/almacenes/':
      return import('../../app/mantenimiento/almacenes');
    case 'mantenimiento/entidades/':
      return import('../../app/mantenimiento/entidades');
    case 'ventas/nuevo/':
      return import('../../app/ventas/nuevo');
    case 'ventas/comprobantes/':
      return import('../../app/ventas/comprobantes');
    case 'compras/comprobantes/':
      return import('../../app/compras/comprobantes');
    case 'compras/nuevo/':
      return import('../../app/compras/nuevo');
    case 'caja/cuentasxcobrar/':
      return import('../../app/caja/cuentasxcobrar');
    case 'caja/cuentasxpagar/':
      return import('../../app/caja/cuentasxpagar');
    case 'asistencias/nueva/':
      return import('../../app/asistencias/nueva');
    case 'mantenimiento/trabajadores/':
      return import('../../app/mantenimiento/trabajadores');
    case 'caja/ingresargastos/':
      return import('../../app/caja/ingresargastos');
    case 'almacenes/movimientos/':
      return import('../../app/almacenes/movimientos');
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