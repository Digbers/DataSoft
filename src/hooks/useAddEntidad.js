// Hook useAddEntidad.js
import axios from '../config/axiosConfig';

export const useAddEntidad = () => {
    const addEntidad = async (formData) => {
        try {
            const response = await axios.post(`http://localhost:8080/api/empresas/entidades/save`, formData);
            return response.data;
        } catch (error) {
            console.error('Error adding entidad:', error);
            throw error;
        }
    };

    return { addEntidad };
};

