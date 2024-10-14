import axios from '../../config/axiosConfig';
const API_URL = 'http://localhost:8080/auth/menus'; 
const API_URLS = 'http://localhost:8080/auth/menus/id';
const API_DATOS_EMP ='http://localhost:8080/api/inventario/punto-venta/find'
export const getMenusByUserName = (userName) => {
  return axios.get(`${API_URL}/${userName}`);
};
export const getDatosEmpresa =(empresaId, almacenId, puntoVId) =>  {
  return axios.get(`${API_DATOS_EMP}/${empresaId}/${almacenId}/${puntoVId}`)
}
export const getMenusById = (userId) => {
  return axios.get(`${API_URLS}/${userId}`);
};