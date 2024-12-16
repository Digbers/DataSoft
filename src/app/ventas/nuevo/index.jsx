import { useEffect, useState } from "react";
import TextInput from "../../../components/inputs/TextInput";
import SelectInput from "../../../components/inputs/SelectInput";
import TextAreaInput from "../../../components/inputs/TextAreaInput";
//import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";
import useVentasFast from "./useVentasFast";
import CustomButton from "../../../components/inputs/CustomButton";
import ClipLoader from 'react-spinners/ClipLoader';
import MetodosPagos from "./MetodosPagos";
import ClienteModal from "./ClienteModal";


const VentasFast = () => {
  //loader
  const [loading, setLoading] = useState(false);
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const [comprobanteBase64, setComprobanteBase64] = useState(""); // Estado para el comprobante
  const { userCode, sesionEmpId, sesionPuntoVentaId, sesionAlmacenId } = useAuth();
  const [vendedor, setVendedor] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({});
  const [descripcionProducto, setDescripcionProducto] = useState("");
  const [codigoProducto, setCodigoProducto] = useState("");
  const [monedas, setMonedas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [comprobantes, setComprobantes] = useState([]);
  const [series, setSeries] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [numero, setNumero] = useState("");
  const [details, setDetails] = useState([]);
  const [selectedMoneda, setSelectedMoneda] = useState("");
  const [selectedsPaymentMethod, setSelectedsPaymentMethod] = useState([]);
  const [tipoDocumentos, setTipoDocumentos] = useState([]);
  const [selectedTipoDocumento, setSelectedTipoDocumento] = useState("");
  const [stockPollo, setStockPollo] = useState(0);
  const [codigoProductoVenta, setCodigoProductoVenta] = useState("POLLOSAC");
  const [tara, setTara] = useState(0);
  const [cliente, setCliente] = useState({
    id: 0,
    documento: "",
    numeroDocumento: "",
    nombre: "",
    estado: "",
    condicion: "",
    direccion: "",
  });
  const [formData, setFormData] = useState({
    comprobante: "",
    serie: "",
    fecha: "",
    tipoCambio: 1,
    subtotal: 0,
    impuesto: 0,
    total: 0,
    estado: "",
    vendedor: "",
    observaciones: "",
    descuento: 0,
    almacen: sesionAlmacenId,
    empresa: sesionEmpId,
    puntoVenta: sesionPuntoVentaId,
    usuarioCreacion: userCode,
  });

  useEffect(() => {
    if (userCode) {
      setVendedor([{ value: userCode, label: userCode }]);
      setFormData((prev) => ({ ...prev, vendedor: userCode }));
    }
  }, [userCode, sesionEmpId, sesionPuntoVentaId]);
  
  //console.log(selectedsPaymentMethod);
  const { fetchComprobantes, fetchSeries, handleSerieChange, debouncedFetchProducts, fetchMonedas, fetchGuardarVenta, fetchPaymentMethods, fetchTipoDocumentos, fetchClientes, fetchVentasEstados, fetchComprobante, buildRequestVenta, handleStockPollo } = useVentasFast({
    setComprobantes,
    setSeries,
    setNumero,
    setProducts,
    setMonedas,
    setPaymentMethods,
    setCliente,
    setTipoDocumentos,
    setEstados,
    setStockPollo
  });
  // Optimiza el useEffect
useEffect(() => {
  if (sesionEmpId) {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Cargar comprobantes y seleccionar el primero
        const comprobante = await fetchComprobantes(sesionEmpId);
        if (comprobante !== null) {
            // Asigna el código del primer comprobante a formData.comprobante
            setFormData((prev) => ({ ...prev, comprobante }));
          
          // Cargar las series del comprobante seleccionado
          const serie = await fetchSeries(comprobante, sesionPuntoVentaId);
          setFormData((prev) => ({ ...prev, serie }));
        }

        // Cargar las monedas, métodos de pago y tipos de documentos
        const moneda = await fetchMonedas(sesionEmpId);
        setSelectedMoneda(moneda);
        await fetchPaymentMethods(sesionEmpId);
        const tipoDocumento = await fetchTipoDocumentos(sesionEmpId);
        setSelectedTipoDocumento(tipoDocumento);
        const estado = await fetchVentasEstados(sesionEmpId);
        setFormData((prev) => ({ ...prev, estado }));

      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        Swal.fire({
          icon: "error",
          title: "Error al cargar datos",
          text: "Ocurrió un error al cargar la información inicial.",
        });
      } finally {
        setLoading(false); // Finalizar carga
      }
    };
    fetchInitialData();
  }
}, [sesionEmpId, sesionPuntoVentaId]);
  //Manejar cambios en series basado en comprobante y punto de venta
  useEffect(() => {
    if (formData.comprobante && sesionPuntoVentaId) {
      handleSerieChange(formData.serie, sesionPuntoVentaId);
    }
  }, [formData.serie, sesionPuntoVentaId]);
  
  //date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData((prev) => ({
      ...prev,
      fecha: today
    }));
    handleStockPollo(codigoProductoVenta);
    console.log(stockPollo);
  }, []);
  
  // Manejador para guardar la venta
  const handleSave = async () => {
    try {
      // Puedes agregar más validaciones si es necesario antes de guardar
      if(cliente.id === 0){
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se ha seleccionado ningún cliente.",
        });
        return;
      }
      const requestDTO = buildRequestVenta(formData,details,cliente,selectedMoneda,selectedsPaymentMethod, numero);
      const ventaGuardadaId = await fetchGuardarVenta(requestDTO);
      if (ventaGuardadaId) {
        Swal.fire({
          icon: "success",
          title: "Venta guardada con éxito",
          text: "La venta ha sido guardada correctamente.",
          showCancelButton: true,
          confirmButtonText: 'Imprimir Comprobante',
          cancelButtonText: 'Finalizar'
        }).then(async (result) => {
          if (result.isConfirmed) {
            // El usuario desea imprimir el comprobante
            try {
              const comprobanteBase64 = await fetchComprobante(ventaGuardadaId);
              setComprobanteBase64(comprobanteBase64); // Almacenar el comprobante en Base64 para mostrar
            } catch (error) {
              console.error("Error al obtener el comprobante:", error);
              Swal.fire({
                icon: "error",
                title: "Error al obtener el comprobante",
                text: "No se pudo obtener el comprobante.",
              });
              resetForm();
            }
          } else {
            // El usuario no desea imprimir
            console.log("Venta finalizada sin imprimir.");
            resetForm();

          }
        });
      }
    } catch (error) {
      console.error("Error al guardar la venta:", error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar la venta",
        text: "No se pudo guardar la venta.",
      });
    }
  };

    // Maneja el cambio de comprobante
  const handleComprobanteChange = async (value) => {
    setFormData((prev) => ({ ...prev, comprobante: value }));
    const serie = await fetchSeries(value, sesionPuntoVentaId);
    if (serie) {
      handleSerieChange(serie, sesionPuntoVentaId); // Se obtiene el número después de seleccionar la serie
      setFormData((prev) => ({ ...prev, serie })); // Actualiza el estado de la serie
    }
  };

  // Maneja el cambio de serie
  const handleSerieSelectionChange = async (value) => {
    setFormData((prev) => ({ ...prev, serie: value }));
    handleSerieChange(value, sesionPuntoVentaId); // Actualiza el número cuando cambia la serie
  };
  const handleInputChange = (value, name) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleDescripcionChange = (e) => {
    const newDescripcion = e.target.value;
    setDescripcionProducto(newDescripcion);
    if(newDescripcion.length <1){
      setProducts([]);
    }
    if (newDescripcion.length >= 3) {
      debouncedFetchProducts(newDescripcion);
    }
  };
  // esta paRTE ME FATA VER ESTA MALLL
  const handleProductSelect = (product) => {
    console.log(product);
    setDescripcionProducto(product.descripcionA);
    setCodigoProducto(product.codigo);
    let total = product.precio * product.peso;
    let cantidadPollo  = 1 * product.capacidadEnvase; // cantidad detalle * capacidad Envase

    setSelectedProduct({
      id: product.id, 
      idEnvase: product.envaseId,
      cantidadPollo: cantidadPollo,
      capacidadEnvase: product.capacidadEnvase,
      codigo: product.codigo,
      descripcionA: product.descripcionA,
      peso: product.peso,
      nombre: product.nombre,
      unidad: product.unidad, // Estableces manualmente lo que necesites
      cantidad: 1, // Cantidad inicial
      precioUnitario: product.precioVenta, // Puedes dejarlo en 0 o calcularlo según sea necesario
      descuento: 0, // Descuento inicial
      totalProducto: total,
      tara: product.tara,
    });
    setTara(product.tara);

    setProducts([]); // Limpiar la lista de productos después de seleccionar uno
  };  
  useEffect(() => {
    if(details.length > 0){
      handleCalculateTotal();
    }
  }, [details]);
  //calcular total
  const handleCalculateTotal = () => {
    const total = details.reduce((sum, detail) => sum + detail.totalProducto, 0);
    const impuesto = Math.round(total * 0.18 * 100) / 100; // El 18% del total, redondeado
    const subtotal = Math.round((total - impuesto) * 100) / 100;

    setFormData((prevFormData) => ({
      ...prevFormData,
      total: Math.round(total * 100) / 100,
      impuesto: impuesto,
      subtotal: subtotal,
    }));
};
  const handleAddCliente = () => {
    setIsClienteModalOpen(true);

  };
  //agregar detalle
  const handleAddDetail = () => {
    if(selectedProduct.id === 0 || selectedProduct.id === undefined){
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se ha seleccionado ningún producto.",
      });
      return;
    }
    let cantidadPolloDetalle = details.reduce((sum, detail) => sum + detail.cantidadPollo, 0);
    let cantidadPolloDisponible = stockPollo - cantidadPolloDetalle;

    if(selectedProduct.cantidadPollo > cantidadPolloDisponible){
      Swal.fire({
        icon: "error",
        title: "Error Stock insuficiente : " + (cantidadPolloDisponible - selectedProduct.cantidadPollo),
        text: "La cantidad no puede ser mayor al stock disponible y los detalles ya agregados.",
      });
      return;
    }
    setDescripcionProducto("");
    setCodigoProducto("");
    setDetails((prev) => [...prev, selectedProduct]);
    setSelectedProduct({
      id: 0, 
      idEnvase: 0,
      cantidadPollo: 0,
      capacidadEnvase: 0,
      codigo: "",
      descripcionA: "",
      peso: 0,
      nombre: "",
      unidad: "", // Estableces manualmente lo que necesites
      cantidad: 1, // Cantidad inicial
      precioUnitario: 0, // Puedes dejarlo en 0 o calcularlo según sea necesario
      descuento: 0, // Descuento inicial
      totalProducto: 0,
      tara: 0,
    });
    setTara(0);
  };
  const handleDetailChange = (e, name) => {
    e.preventDefault();
    const { value } = e.target;
    let detailCantidadPollo = 0;
    if(details.length > 0){
      detailCantidadPollo = details.reduce((sum, detail) => sum + detail.cantidadPollo, 0);
    }
    let stock = stockPollo - detailCantidadPollo;
    if(name === "cantidad"){
      if(value > stock){
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "La cantidad no puede ser mayor al stock de pollos.",
        }).then(() => {
          document.getElementsByName("cantidad")[0].focus(); // Enfoca el input cantidad
        });
        return;
      }
    }
    // Actualizamos el campo que cambió
    setSelectedProduct((prev) => {
      
      const updatedProduct = { ...prev, [name]: value };
      // Si el campo cambiado es 'cantidad', 'precioUnitario' o 'descuento', recalculamos el total
      if (name === "peso" || name === "precioUnitario" || name === "descuento" || name === "cantidad") {

        let cantidad = parseInt(updatedProduct.cantidad);   
        updatedProduct.cantidadPollo = cantidad * updatedProduct.capacidadEnvase;
        updatedProduct.tara = cantidad * tara;
        
        let pesoFinal = (parseFloat(updatedProduct.peso) || 0) - (parseFloat(updatedProduct.tara) || 0);
        const total = (pesoFinal * (parseFloat(updatedProduct.precioUnitario) || 0)) - (parseFloat(updatedProduct.descuento) || 0);
        updatedProduct.totalProducto = Math.round(total * 100) / 100;
      }
      return updatedProduct;
    });
  };
  // Manejador para el cambio de moneda
  const handleMonedaChange = (moneda) => {
    setSelectedMoneda(moneda);
  };
  // Manejador para los tipos de documentos
  const handleTipoDocumentoChange = (tipoDocumento) => {
    setSelectedTipoDocumento(tipoDocumento);
  };
    //manejador para clientes
    const handleClienteChange = async (value) => {
      setLoading(true);
      try{
        await fetchClientes(sesionEmpId, selectedTipoDocumento, value);
      }catch(error){
        setCliente({
          id: 0,
          documento: "",
          numeroDocumento: "",
          nombre: "",
          estado: "",
          condicion: "",
          direccion: "",
        });
        Swal.fire({
          icon: "error",
          title: "Error al cargar clientes",
          text: "No se encontró el cliente.",
        });
        
      }finally{
        setLoading(false);
      }
    };
    // Maneja el cambio en el input de número de documento 
    const handleInputChangeCliente = (value,name) => {
      if (name === 'numeroDocumento') {
        // Validar si el tipoDocumento en el estado actual es 'DNI'
        if(selectedTipoDocumento === 'DNI' && value.length > 8){
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "El número de documento no puede tener más de 8 caracteres para DNI.",
          });
          return;
        }
        if(selectedTipoDocumento === 'RUC' && value.length > 11){
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "El número de documento no puede tener más de 11 caracteres para RUC.",
          });
          return;
        }
      }
      setCliente((prev) => ({
        ...prev,
        [name]: value
      }));
    };
    // Maneja la presión de teclas para el input del documento
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleClienteChange(cliente.numeroDocumento);
      }
    };
    const resetForm = () => {
      setComprobanteBase64(null);
      setSelectedProduct(null);
      setDescripcionProducto("");
      setCodigoProducto("");
      //setNumero("");
      setDetails([]);
      //setSelectedMoneda(null);
      setSelectedsPaymentMethod([]);
      //setSelectedTipoDocumento(null);
      setStockPollo(0);
      setCodigoProductoVenta("POLLOSAC");
      setCliente({
        id: 0,
        documento: "",
        numeroDocumento: "",
        nombre: "",
        estado: "",
        condicion: "",
        direccion: "",
      });
      setFormData((prevFormData) => ({
        ...prevFormData,
        fecha: new Date().toISOString().split('T')[0], // Fecha actual
        tipoCambio: 1,
        subtotal: 0,
        impuesto: 0,
        total: 0,
        estado: "",
        vendedor: userCode,
        observaciones: "",
        descuento: 0,
        almacen: sesionAlmacenId,
        empresa: sesionEmpId,
        puntoVenta: sesionPuntoVentaId,
        usuarioCreacion: userCode,
      }));
    };
  

  return (
    <div className="relative grid grid-cols-1 gap-2 md:grid-cols-5 rounded-lg dark:bg-transparent bg-transparent border  shadow-md  p-0 z-10 overflow-auto h-full text-sm">
      {/* segundo div */}
      {/* Loader */}
      {loading && (
        <div className="absolute top-0 left-0 w-full min-h-screen flex justify-center items-center bg-white bg-opacity-70 z-20">
          <ClipLoader color="#36D7B7" loading={loading} size={50} />
        </div>
      )}
      {/* Modal para mostrar el PDF */}
      {comprobanteBase64 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 h-full">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-4 relative h-[calc(100%-4rem)]">
            <iframe
              src={`data:application/pdf;base64,${comprobanteBase64}`}
              title="Comprobante PDF"
              className="w-full h-[calc(100%-1rem)] rounded-lg bottom-0"
            />
            <button
              onClick={resetForm}
              className="absolute bottom-1 right-1 bg-red-500 text-white rounded-full px-4 py-2 hover:bg-red-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      <div className="relative col-span-3 font-semibold bg-white dark:bg-gray-900 dark:bg-opacity-85 bg-opacity-85 p-4 rounded-lg md:overflow-auto md:max-h-screen h-auto">
        {/* Detalles del Producto */}
        <h1 className="text-2xl font-bold mb-4 dark:text-white">
          Punto de Venta
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
          <div className="col-span-1">
            <TextInput
              text={stockPollo}
              setText={(value) => setStockPollo(value)}
              placeholder="Stock Pollo"
              typeInput="number"
              disabled={true}
            />
          </div>
          <div className="col-span-1">
            <TextAreaInput
              text={codigoProductoVenta}
              setText={(value) => setCodigoProductoVenta(value)}
              placeholder="Código Producto"
              typeInput="text"
              disabled={true}
            />
          </div>
          <div className="col-span-1">
            <SelectInput
                value={formData.estado}
                setValue={(value) => handleInputChange(value, "estado")}
                options={estados}
                placeholder="Estado"
              />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
          <div className="col-span-1">
            <SelectInput
                value={formData.vendedor}
                setValue={(value) => handleInputChange(value, "vendedor")}
                options={vendedor}
                placeholder="Vendedor"
              />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <TextInput
              text={formData.observaciones}
              setText={(value) => handleInputChange(value, "observaciones")}
              placeholder="Observaciones"
              typeInput="text"
            />
          </div>
        </div>
        {/* Producto */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="col-span-1">
            <TextInput
                text={codigoProducto}
                setText={(value) => setCodigoProducto(value)}
                placeholder="Código"
                typeInput="text"
                disabled={true}
              />
          </div>
          <div className="col-span-1 sm:col-span-2 relative">
            <TextAreaInput
              text={descripcionProducto}
              setText={handleDescripcionChange}
              placeholder="Descripción"
              typeInput="text"
            />
            {products.length > 0 && (
              <ul className="absolute border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto z-10 bg-white w-full">
                {products.map((product, index) => (
                  <li
                  key={`${product.idProducto}-${index}`} 
                    onClick={() => handleProductSelect(product)}
                    className="cursor-pointer p-2 hover:bg-gray-200 text-sm md:text-base"
                  >
                    {product.descripcionA}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* Tabla con el producto seleccionado temporalmente */}
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg mb-6">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-2 py-2 border-b">Unidad</th>
                <th className="px-2 py-2 border-b">Cant. Pollo</th>
                <th className="px-2 py-2 border-b">Cantidad</th>
                <th className="px-2 py-2 border-b">Peso Total</th>
                <th className="px-2 py-2 border-b">Tara Total</th>
                <th className="px-2 py-2 border-b">Precio Unit</th>
                <th className="px-2 py-2 border-b">Desc</th>
                <th className="px-2 py-2 border-b">Importe Total</th>
                <th className="px-2 py-2 border-b">Accion</th>
              </tr>
            </thead>
            <tbody>
              {selectedProduct && (
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-1 py-2 border-b">
                    <input
                      type="text"
                      name="unidad"
                      value={selectedProduct.unidad}
                      onChange={(value) => handleDetailChange(value, "unidad")}
                      className="w-14 h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md"
                      disabled
                    />
                  </td>
                  <td className="px-1 py-2 border-b">
                    <input
                      type="number"
                      name="cantidad Pollo"
                      value={selectedProduct.cantidadPollo}
                      onChange={(value) => handleDetailChange(value, "cantidadPollo")}
                      className="w-16 h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md"
                      disabled
                    />
                  </td>
                  <td className="px-1 py-2 border-b">
                    <input
                      type="number"
                      name="cantidad"
                      value={selectedProduct.cantidad}
                      onChange={(value) => handleDetailChange(value, "cantidad")}
                      className="w-16 h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md"
                    />
                  </td>

                  <td className="px-1 py-2 border-b">
                    <input
                      type="number"
                      name="peso"
                      value={selectedProduct.peso}
                      onChange={(value) => handleDetailChange(value, "peso")}
                      className="w-16 h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md"
                    />
                  </td>
                  <td className="px-1 py-2 border-b">
                    <input
                      type="number"
                      name="tara"
                      value={selectedProduct.tara}
                      onChange={(value) => handleDetailChange(value, "tara")}
                      className="w-14 h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md"
                      disabled
                    />
                  </td>
                  <td className="px-1 py-2 border-b">
                    <input
                      type="number"
                      name="precioUnitario"
                      value={selectedProduct.precioUnitario}
                      onChange={(value) => handleDetailChange(value, "precioUnitario")}
                      className="w-16 h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md"
                    />
                  </td>
                  <td className="px-1 py-2 border-b">
                    <input
                      type="number"
                      name="descuento"
                      value={selectedProduct.descuento}
                      onChange={(value) => handleDetailChange(value, "descuento")}
                      className="w-16 h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md"
                    />
                  </td>
                  <td className="px-1 py-2 border-b">
                    <input
                      type="number"
                      name="totalProducto"
                      value={selectedProduct.totalProducto}
                      onChange={(value) => handleDetailChange(value, "totalProducto")}
                      className="w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md"
                      disabled
                    />
                  </td>
                  <td className="px-2 py-2 border-b">
                    <CustomButton 
                      placeholder="Agregar" 
                      onClick={handleAddDetail} 
                      sizeClass=" py-2"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Tabla de Productos Agregados */}
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-2 py-2 border-b">Código</th>
                <th className="px-2 py-2 border-b">Descripción</th>
                <th className="px-2 py-2 border-b">Unidad</th>
                <th className="px-2 py-2 border-b">Cantidad Pollo</th>
                <th className="px-2 py-2 border-b">Cantidad</th>
                <th className="px-2 py-2 border-b">Peso</th>
                <th className="px-2 py-2 border-b">Tara</th>
                <th className="px-2 py-2 border-b">Precio Unit</th>
                <th className="px-2 py-2 border-b">Descuento</th>
                <th className="px-2 py-2 border-b">Total</th>
                <th className="px-2 py-2 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {details.map((detail, index) => (
                <tr
                  key={index}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="px-2 py-2 border-b">{detail.codigo}</td>
                  <td className="px-2 py-2 border-b">{detail.descripcionA}</td>
                  <td className="px-2 py-2 border-b">{detail.unidad}</td>
                  <td className="px-2 py-2 border-b">{detail.cantidadPollo}</td>
                  <td className="px-2 py-2 border-b">{detail.cantidad}</td>
                  <td className="px-2 py-2 border-b">{detail.peso}</td>
                  <td className="px-2 py-2 border-b">{detail.tara}</td>
                  <td className="px-2 py-2 border-b">{detail.precioUnitario}</td>
                  <td className="px-2 py-2 border-b">{detail.descuento}</td>
                  <td className="px-2 py-2 border-b">{detail.totalProducto}</td>
                  <td className="px-2 py-2 border-b">
                    <button
                      type="button"
                      onClick={() =>
                        setDetails(details.filter((_, i) => i !== index))
                      }
                      className="px-2 py-2 bg-red-500 text-white rounded-md"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="relative col-span-2 font-semibold bg-white dark:bg-gray-900 dark:bg-opacity-85 bg-opacity-85 p-4 rounded-lg md:overflow-auto md:max-h-screen h-auto">
        {/* Información del Comprobante */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-4 mt-2">
          <div>
            <SelectInput
              value={formData.comprobante}
              setValue={handleComprobanteChange}
              options={comprobantes}
              placeholder="Comprobante"
            />
          </div>
          <div>
            <SelectInput
              value={formData.serie}
              setValue={handleSerieSelectionChange}
              options={series}
              placeholder="Serie"
            />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <TextInput
              text={formData.fecha}
              setText={(value) => handleInputChange(value, "fecha")}
              placeholder="Fecha"
              typeInput="date"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
          <div className="col-span-1">
            <TextInput
              text={numero} // Aquí se muestra el número de serie obtenido
              setText={(value) => handleInputChange(value, "numero")}
              placeholder="Número"
              typeInput="text"
              disabled={true} // Este campo puede estar deshabilitado si el número no debe ser editado manualmente
            />
          </div>
          <div className="col-span-1">
            <SelectInput
              value={selectedMoneda} // Valor seleccionado
              setValue={handleMonedaChange} // Manejador del cambio
              options={monedas} // Lista de opciones de monedas
              placeholder="Moneda"
            />
          </div>
          <div className="col-span-1">
            <TextInput
              text={formData.tipoCambio}
              setText={(value) => handleInputChange(value, "tipoCambio")}
              placeholder="T.C"
              typeInput="number"
              disabled={true}
            />
          </div>
        </div>
        {/* Información del Cliente */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
          <div className="col-span-1">
            <SelectInput
              value={selectedTipoDocumento}
              setValue={handleTipoDocumentoChange}
              options={tipoDocumentos}
              placeholder="Tipo DOC"
            />
          </div>
          <div className="flex flex-row items-center space-x-2 col-span-1 sm:col-span-2">
            <div className="flex-grow"> {/* El TextInput ocupa 3/4 del espacio */}
              <TextInput
                name="documento" // Add name attribute
                text={cliente.numeroDocumento}
                setText={(value) => handleInputChangeCliente(value, "numeroDocumento")}
                placeholder="N° Doc"
                typeInput="text"
                onKeyDown={handleKeyDown} // Add onKeyDown handler
              />
            </div>
            <div className="basis-1/4"> {/* El botón ocupa 1/4 del espacio */}
              <CustomButton 
                placeholder="" 
                onClick={handleAddCliente} 
                sizeClass="py-2"
                icon="fa-solid fa-plus"
              />
            </div>
            {isClienteModalOpen && (
              <ClienteModal 
                isOpen={isClienteModalOpen} 
                onClose={() => setIsClienteModalOpen(false)}
                tipoDocumento={tipoDocumentos}
                setEntidad={setCliente}
                sesionEmpId={sesionEmpId}
                setSelectedTipoDocumento={setSelectedTipoDocumento}
              />
            )}
          </div>

          <div className="col-span-1 sm:col-span-3">
            <TextInput
              name="nombre" // Add name attribute
              text={cliente.nombre}
              setText={(value) => handleInputChangeCliente(value, "nombre")}
              placeholder="Nombre"
              typeInput="text"
            />
          </div>

          <div className="col-span-1 sm:col-span-3">
            <TextInput
              name="direccion" // Add name attribute
              text={cliente.direccion}
              setText={(value) => handleInputChangeCliente(value, "direccion")}
              placeholder="Dirección"
              typeInput="text"
            />
          </div>
        </div>
        {/* Subtotal, Impuesto y Total */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
          <div className="flex flex-row">
            <span className="mr-2">{selectedMoneda === "DOL" ? "$" : "S/"}</span>
            <TextInput
              text={formData.subtotal}
              setText={(value) => handleInputChange(value, "subtotal")}
              placeholder="Subtotal"
              typeInput="number"
              disabled={true}
            />
          </div>
          <div className="flex flex-row">
            <span className="mr-2">{selectedMoneda === "DOL" ? "$" : "S/"}</span>
            <TextInput
              text={formData.impuesto}
              setText={(value) => handleInputChange(value, "impuesto")}
              placeholder="Impuesto"
              typeInput="number"
              disabled={true}
            />
          </div>
          <div className="flex flex-row">
            <span className="mr-2">{selectedMoneda === "DOL" ? "$" : "S/"}</span>
            <TextInput
              text={formData.total}
              setText={(value) => handleInputChange(value, "total")}
              placeholder="Total"
              typeInput="number"
              disabled ={true}
            />
          </div>
        </div>
        {/* Forma de Pago */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
            {paymentMethods.length > 0 ? (
              <MetodosPagos 
                formData={formData} 
                availablePaymentMethods={paymentMethods} 
                selectedsPaymentMethod={selectedsPaymentMethod}
                setSelectedsPaymentMethod={setSelectedsPaymentMethod} 
              />
            ) : (
              <p>Cargando métodos de pago...</p>
            )}
          <div className="col-span-1">
            <div className="flex flex-row">
              <span className="mr-2">{selectedMoneda === "DOL" ? "$" : "S/"}</span>
              <TextInput
                text={formData.total}
                setText={(value) => handleInputChange(value, "total")}
                placeholder="Suma Total"
                typeInput="number"
                disabled={true}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-2">
          <CustomButton 
            placeholder="Guardar" 
            onClick={handleSave} 
            sizeClass="px-4 py-2"
          />
        </div>
      </div>
    </div>
  );
};

export default VentasFast;
