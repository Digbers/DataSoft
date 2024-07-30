import axios from '../../config/axiosConfig';
const API_URL = 'http://localhost:8080/auth/menus'; 

export const getMenusByUserName = (userName) => {
  return axios.get(`${API_URL}/${userName}`);
};