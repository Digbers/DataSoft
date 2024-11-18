// src/hooks/useFetchData.js
import axios from '../config/axiosConfig';
import Swal from 'sweetalert2';

const useFetchData = ({sesionEmpId, sesionAlmacenId, setComprobantesTipos, setMonedas, setEstados, setPuntosVentas}) => {

    const fetchPuntosVentas = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/inventario/punto-venta/find/almacen/${sesionAlmacenId}`);
        const puntosVentas = response.data.map((puntoVenta) => ({
          value: puntoVenta.id,
          label: puntoVenta.nombre,
        }));
        setPuntosVentas(puntosVentas);
        return puntosVentas[0].value;
      } catch (error) {
        console.error('Error fetching puntos ventas:', error);
        Swal.fire({
          icon: "error",
          title: "Error al buscar puntos ventas",
          text: "No se pudo obtener la lista de puntos ventas.",
        });
      }
    }
    const fetchComprobantesTipos = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/ventas/get-comprobantes-tipos-ventas/${sesionEmpId}`);
        const comprobantes = response.data.map((comprobanteTipo) => ({
          value: comprobanteTipo.codigo,
          label: comprobanteTipo.descripcion,
        }));
        setComprobantesTipos(comprobantes);
        return comprobantes[0].value;
      } catch (error) {
        console.error('Error fetching comprobantes tipos:', error);
        Swal.fire({
          icon: "error",
          title: "Error al buscar comprobantes tipos",
          text: "No se pudo obtener la lista de comprobantes tipos.",
        });
      }
    };

    const fetchMonedas = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/finanzas/monedas/find-by-empresa/${sesionEmpId}`);
        const monedaList = response.data.map((moneda) => ({
          value: moneda.codigo,
          label: moneda.nombre,
        }));
        setMonedas(monedaList);
        return monedaList[0].value;
      } catch (error) {
        console.error('Error fetching monedas:', error);
        Swal.fire({
          icon: "error",
          title: "Error al buscar monedas",
          text: "No se pudo obtener la lista de monedas.",
        });
      }
    };

    const fetchEstados = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/ventas/estados/find-by-empresa/${sesionEmpId}`);
        const estadoList = response.data.map((estado) => ({
          value: estado.codigo,
          label: estado.descripcion,
        }));
        setEstados(estadoList);
        return estadoList[0].value;
      } catch (error) {
        console.error('Error fetching estados:', error);
        Swal.fire({
          icon: "error",
          title: "Error al buscar estados",
          text: "No se pudo obtener la lista de estados.",
        });
      }
    };
  return {
    fetchComprobantesTipos,
    fetchMonedas,
    fetchEstados,
    fetchPuntosVentas
  }
};
export default useFetchData;
