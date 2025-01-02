// src/hooks/useFetchData.js
import axios from '../config/axiosConfig';

const useFetchEntidades = () => {

    const autocompleteNombre = async (value) => {
      try {
        const response = await axios.get(`http://localhost:8080/api/empresas/entidades/autocomplete-nombre/${value}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching nombres:', error);
        throw error;
      }
    };
    
    const autocompleteNroDocumento = async (value) => {
      try {
        const response = await axios.get(`http://localhost:8080/api/empresas/entidades/autocomplete-nro-documento/${value}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching documentos:', error);
        throw error;
      }
    };
  return {
    autocompleteNombre,
    autocompleteNroDocumento
  }
};
export default useFetchEntidades;
