import Swal from "sweetalert2"; // Importar SweetAlert2
import axios from "../../../config/axiosConfig";
import { useCallback } from "react";
import { debounce } from "lodash";

// Custom hook para manejar la lógica de compras
const useCompras = ({ setComprobantes, setProducts, setMonedas, setProveedor, setTipoDocumentos, setEstados }) => {
  

  const buildResponseCompra = (formData, details, proveedor, selectedMoneda, metodoPago) => {
    console.log("metodoPAgop building");
    console.log(metodoPago);
    const addTimeToDate = (dateInput, time = '00:00:00') => {
      const date = dateInput ? new Date(dateInput) : new Date();
    
      // Divide la hora proporcionada y la asigna a la fecha
      const [hours, minutes, seconds] = time.split(':');
      date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
    
      return date.toISOString().slice(0, 19); // Formato 'YYYY-MM-DDTHH:MM:SS'
    };      
  
    const fechaEmision = addTimeToDate(formData.fecha, new Date().toTimeString().slice(0, 8));
    const fechaVencimiento = addTimeToDate(formData.fechaVencimiento, '23:59:59');

    const requestDTO = {
      comprobantesComprasCa: {
        idEmpresa: formData.empresa,
        comprobantesTipos: {
          codigo: formData.comprobante,
          idEmpresa: formData.empresa,
        },
        serie: formData.serie,
        numero: formData.numero,
        idProveedor: proveedor.id,
        idPuntoVenta: formData.puntoVenta,
        fechaEmision: fechaEmision, 
        fechaVencimiento: fechaVencimiento,
        fechaIngreso: formData.fechaIngreso || new Date().toISOString(),
        periodoRegistro: `${formData.periodoRegistro}-01`,
        tipoCambio: formData.tipoCambio || 1,
        comprobanteCompraEstados: {
          codigo: formData.estado,
          idEmpresa: formData.empresa,
        },
        comprobantesComprasDetalle: details.map((detail, index) => ({
          numero: index + 1,
          cantidad: detail.cantidad,
          descripcion: detail.descripcionA,
          idProducto: detail.id,
          idEnvase: detail.idEnvase,
          peso: detail.peso? detail.peso : 0,
          precioUnitario: detail.precioUnitario,
          descuento: detail.descuento? detail.descuento : 0,
          usuarioCreacion: formData.usuarioCreacion,
        })),
        comprobantesComprasCuotas: formData.estado === "CRE" ? [{
          idEmpresa: formData.empresa,
          nroCuota: 1,
          fechaVencimiento: formData.fechaVencimiento || new Date().toISOString(),
          importe: formData.total,
          codigoMoneda: selectedMoneda?.codigo || "SOL",
          usuarioCreacion: formData.usuarioCreacion,
        }] : [],
        observacion: formData.observaciones,
        codigoMoneda: selectedMoneda?.codigo || "SOL",
        usuarioCreacion: formData.usuarioCreacion,
      },
      idAlmacen: formData.almacen,
      codigoEstado: formData.estado,
      generarMovimiento: formData.generarMovimiento || false,
      comprobantesComprasPagos: formData.estado !== "CRE" ? [{
        idEmpresa: formData.empresa,
        formaPagos: metodoPago.value,
        montoCobrado: formData.total,
        fechaCobro: formData.fecha,
        descripcion: "Pagado en el punto de venta",
        moneda: selectedMoneda.value,
        usuarioCreacion: formData.usuarioCreacion,
      }] : [],
    };
    console.log(requestDTO);
    return requestDTO;
  };


  const fetchComprasEstados = async (empresa) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/compras/estados/find-by-empresa/${empresa}`);
      const estados = response.data.map((estado) => ({
        value: estado.codigo,
        label: estado.descripcion,
      }))
      .filter((estado) => ["CRE", "CAN"].includes(estado.value));
      setEstados(estados);
      return estados.find((estado) => estado.value === "CAN")?.value;
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

  const fetchProveedores = async (empresa,documentoTipo, documento) => {
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
      const proveedor = {
        id: response.data.id,
        numeroDocumento: response.data.numeroDocumento,
        nombre: response.data.nombre,
        documento: response.data.documento,
        direccion: response.data.direccion,
      };
      
      setProveedor(proveedor);
    } catch (error) {
      console.error("Error al obtener el proveedor:", error);
      Swal.fire({
        icon: "error",
        title: "Error al cargar proveedores",
        text: "No se encontró el proveedor.",
      });
    }
  };


  const fetchGuardarCompra = async (formData) => {
    try {
      const response = await axios.post(`http://localhost:8080/api/compras/guardar-compra`, formData);
      return response.data;
    } catch (error) {
      console.error("Error al guardar la compra:", error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar la compra",
        text: "No se pudo guardar la compra.",
      });
      throw error;
    }
  };
  const fetchMonedas = async (empresa) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/finanzas/monedas/find-by-empresa/${empresa}`);
      const monedas = response.data.map((moneda) => ({
        value: moneda.id,
        label: moneda.nombre,
        codigo: moneda.codigo,
      }));
      setMonedas(monedas);
      return monedas.find((moneda) => moneda.codigo === "SOL");
    } catch (error) {
      console.error("Error fetching monedas:", error);
      Swal.fire({
        icon: "error",
        title: "Error al cargar monedas",
        text: "No se pudo obtener la lista de monedas.",
      });
    }
  };
  const fetchMetodosPago = async (empresa) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/finanzas/metodos-pagos/find-by-empresa/${empresa}`);
      const paymentMethods = response.data.map((paymentMethod) => ({
        value: paymentMethod.id,
        label: paymentMethod.descripcion,
        codigo: paymentMethod.codigo,
      }));
      return paymentMethods.find((paymentMethod) => paymentMethod.codigo === "EFE");
    } catch (error) {
      console.error("Error al obtener los métodos de pago:", error);
      Swal.fire({
        icon: "error",
        title: "Error al obtener los métodos de pago",
        text: "No se pudo obtener la lista de métodos de pago.",
      });
    }
  };

  // Función para obtener los comprobantes de venta
  const fetchComprobantes = async (empresa) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/compras/get-comprobantes-tipos/${empresa}`);
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
      debouncedFetchProducts,
      fetchMonedas,
      fetchGuardarCompra,
      fetchProveedores,
      fetchTipoDocumentos,
      fetchComprasEstados,
      buildResponseCompra,
      fetchMetodosPago
    };
  };

  export default useCompras;