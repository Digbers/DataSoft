import Swal from "sweetalert2"; // Importar SweetAlert2
import axios from "../../../config/axiosConfig";
import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";

// Custom hook para manejar la lógica de VentasFast
const useVentasFast = ({ setComprobantes, setSeries, setNumero, setProducts, setMonedas, setPaymentMethods, setCliente, setTipoDocumentos, setEstados, setStockPollo }) => {
  const [stockPolloEventSource, setStockPolloEventSource] = useState(null);
  const [numeroEventSource, setNumeroEventSource] = useState(null);

  const buildRequestVenta = (formData, details, cliente, selectedMoneda, selectedsPaymentMethod, numero) => {
      const requestDTO = {
        comprobantesVentasCabDTO: {
          idEmpresa: formData.empresa,
          comprobantesTipos: {
              codigo: formData.comprobante,
              idEmpresa: formData.empresa,
          },
          serie: formData.serie,
          numero: numero,
          idCliente: cliente.id,
          idPuntoVenta: formData.puntoVenta,
          fechaEmision: formData.fecha, // Asegúrate de que sea un `LocalDate`
          fechaVencimiento: formData.fechaVencimiento || new Date().toISOString(),
          comprobantesVentaEstado: {
              codigo: formData.estado,
              idEmpresa: formData.empresa,
          },
          comprobantesVentaDet: details.map((detail, index) => ({
              numero: index + 1, // Número del detalle
              descripcion: detail.descripcionA,
              cantidad: detail.cantidad,
              idProducto: detail.id,
              idEnvase: detail.idEnvase,
              peso: detail.peso,
              precioUnitario: detail.precioUnitario,
              descuento: detail.descuento,
              tara: detail.tara,// se agrego este campo
              usuarioCreacion: formData.usuarioCreacion,
          })),
          comprobantesVentasCuotas: formData.estado === "CRE" ? [{
              idEmpresa: formData.empresa,
              nroCuota: 1, // Para una sola cuota
              fechaVencimiento: formData.fechaVencimiento || new Date().toISOString(),
              importe: formData.total,
              codigoMoneda: selectedMoneda?.codigo || "SOL", // Código de la moneda
              susuarioCreacion: formData.usuarioCreacion,
          }] : [],
          observacion: formData.observaciones,
          codigoMoneda: selectedMoneda?.codigo || "SOL", // Moneda
          tipoCambio: formData.tipoCambio,
          usuarioCreacion: formData.usuarioCreacion,
        },
        idAlmacen: formData.almacen,
        codigoEstado: formData.estado,
        comprobantesVentasCobrosDTO: formData.estado !== "CRE" ? selectedsPaymentMethod.map((payment) => ({
          idEmpresa: formData.empresa,
          formasDeCobros: payment.value,
          montoCobrado: payment.cantidad,
          fechaCobro: formData.fecha,
          descripcion: payment.descripcion,
          moneda: selectedMoneda?.codigo || "SOL",
          usuarioCreacion: formData.usuarioCreacion,
        })) : [],
        codigoProductoVenta: "POLLOSAC" // por ahora asi // de prueba
      };

      return requestDTO;
  };


  const fetchComprobante = async (idComprobante) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/ventas/get-comprobante/${idComprobante}`, {
        responseType: 'text' // Ensures Base64 string is received as plain text
      });
      return response.data; // Return Base64 content for setting state
    } catch (error) {
      console.error("Error fetching comprobante:", error);
      throw error;
    }
  };

  const fetchVentasEstados = async (empresa) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/ventas/estados/find-by-empresa/${empresa}`);
      const estados = response.data.map((estado) => ({
        value: estado.codigo,
        label: estado.descripcion,
      }))
      .filter((estado) => ["CRE", "PRO", "CON"].includes(estado.value));
      console.log(estados);
      setEstados(estados);
      return estados.find((estado) => estado.value === "CON")?.value;
    } catch (error) {
      console.error("Error fetching estados:", error);
      Swal.fire({
        icon: "error",
        title: "Error al cargar estados",
        text: "No se pudo obtener la lista de estados.",
      });
    }
  }

  const fetchTipoDocumentos = async (empresa) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/empresas/documentos/find-by-empresa/${empresa}`);
      const tipoDocumentos = response.data.map((tipoDocumento) => ({
        value: tipoDocumento.docCodigo,
        label: tipoDocumento.docCodigo,
      }));
      setTipoDocumentos(tipoDocumentos);
      return tipoDocumentos[0].value;
    } catch (error) {
      console.error("Error fetching tipo documentos:", error);
      Swal.fire({
        icon: "error",
        title: "Error al cargar tipos de documentos",
        text: "No se pudo obtener la lista de tipos de documentos.",
      });
    }
  };

  const fetchClientes = async (empresa,documentoTipo, documento) => {
    try {
      const request = {dni: documento};
      let response;
      if (documentoTipo === "DNI") {
        response = await axios.post(`http://localhost:8080/api/empresas/entidades/find-entidad/${empresa}`, request);
      } else if (documentoTipo === "RUC") {
        response = await axios.get(`http://localhost:8080/api/empresas/entidades/find-sunat/${documentoTipo}/${documento}/${empresa}`);
      }else{
        return;
      }
      const cliente = {
        id: response.data.id,
        documento: response.data.numeroDocumento,
        nombre: response.data.nombre,
        tipoDocumento: response.data.documento,
        direccion: response.data.direccion,
      };
      
      setCliente(cliente);
    } catch (error) {
      console.error("Error al obtener el cliente:", error);
    }
  };

  const fetchPaymentMethods = async (empresa) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/finanzas/metodos-cobros/find-by-empresa/${empresa}`);
      const paymentMethods = response.data.map((paymentMethod) => ({
        value: paymentMethod.codigo,
        label: paymentMethod.descripcion,
      }));
      setPaymentMethods(paymentMethods);
    } catch (error) {
      console.error("Error al obtener los métodos de pago:", error);
      Swal.fire({
        icon: "error",
        title: "Error al obtener los métodos de pago",
        text: "No se pudo obtener la lista de métodos de pago.",
      });
    }
  };

  const fetchGuardarVenta = async (formData) => {
    try {
      const response = await axios.post(`http://localhost:8080/api/ventas/guardar-venta`, formData);
      return response.data;
    } catch (error) {
      console.error("Error al guardar la venta:", error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar la venta",
        text: "No se pudo guardar la venta.",
      });
      throw error;
    }
  };
  const fetchMonedas = async (empresa) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/finanzas/monedas/find-by-empresa/${empresa}`);
      const monedas = response.data.map((moneda) => ({
        value: moneda.codigo,
        label: moneda.nombre,
      }));
      setMonedas(monedas);
      return monedas.find((moneda) => moneda.value === "SOL")?.value;
    } catch (error) {
      console.error("Error fetching monedas:", error);
      Swal.fire({
        icon: "error",
        title: "Error al cargar monedas",
        text: "No se pudo obtener la lista de monedas.",
      });
    }
  };

  // Función para obtener los comprobantes de venta
  const fetchComprobantes = async (empresa) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/ventas/get-comprobantes-tipos-ventas/${empresa}`);
      const comprobantes = response.data.map((comprobante) => ({
        value: comprobante.codigo,
        label: comprobante.descripcion,
      }));
      setComprobantes(comprobantes);
      if (response.data.length > 0) {
        return comprobantes[0].value;
      }
    } catch (error) {
      console.error("Error fetching comprobantes:", error);
      Swal.fire({
        icon: "error",
        title: "Error al cargar comprobantes",
        text: "No se pudo obtener la lista de comprobantes.",
      });
    }
  };

  // Función para obtener las series de los comprobantes
  const fetchSeries = async (comprobante, puntoVenta) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/ventas/get-series/comprobantes/${comprobante}/${puntoVenta}`
      );
      const series = response.data.map((serie) => ({
        value: serie.codigoSerie,
        label: serie.codigoSerie,
      }));
      setSeries(series);
      if (series.length > 0) {
        return series[0].value;
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al cargar series",
        text: "No se pudo obtener la lista de series.",
      });
    }
  };

  // Manejo de SSE (Server-Sent Events) para obtener el número de serie
  const handleSerieChange = (serie, puntoVenta) => {
    if (numeroEventSource) {
      numeroEventSource.close();
    }
    const newNumeroEventSource = new EventSource(`http://localhost:8080/api/free-pass/stream-numero/${serie}/${puntoVenta}`);
    newNumeroEventSource.onmessage = (event) => {
      setNumero(event.data);
    };
    newNumeroEventSource.onerror = (error) => {
      console.error("Error en la conexión SSE para el número de serie", error);
      newNumeroEventSource.close();
    };
    setNumeroEventSource(newNumeroEventSource);
  };

  const handleStockPollo = (codigoProducto) => {
    if (stockPolloEventSource) {
      stockPolloEventSource.close();
    }
    const newStockPolloEventSource = new EventSource(`http://localhost:8080/api/product-free-pass/stream-stock-product-venta/${codigoProducto}`);
    newStockPolloEventSource.onmessage = (event) => {
      setStockPollo(event.data);
    };
    newStockPolloEventSource.onerror = (error) => {
      console.error("Error en la conexión SSE para el stock de pollo", error);
      newStockPolloEventSource.close();
    };
    setStockPolloEventSource(newStockPolloEventSource);
  };

  // Cleanup de EventSources cuando el componente es desmontado
  useEffect(() => {
    return () => {
      if (numeroEventSource) {
        numeroEventSource.close();
      }
      if (stockPolloEventSource) {
        stockPolloEventSource.close();
      }
    };
  }, [numeroEventSource, stockPolloEventSource]);


    // Función para obtener productos en base a la descripción
    const fetchProducts = async (descripcion) => {
      try {
        const response = await axios.get(`http://localhost:8080/api/inventario/productos/find-autocomplete/${descripcion}`);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        Swal.fire({
          icon: "error",
          title: "Error al buscar productos",
          text: "No se pudo obtener la lista de productos.",
        });
      }
    };

    // Crear una versión debounced de fetchProducts
    const debouncedFetchProducts = useCallback(debounce(fetchProducts, 300), []);

    return {
      fetchComprobantes,
      fetchSeries,
      handleSerieChange,
      debouncedFetchProducts,
      fetchMonedas,
      fetchGuardarVenta,
      fetchPaymentMethods,
      fetchClientes,
      fetchTipoDocumentos,
      fetchVentasEstados,
      fetchComprobante,
      buildRequestVenta,
      handleStockPollo,
    };
  };

  export default useVentasFast;