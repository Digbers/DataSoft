import { useEffect, useState, useCallback } from "react";
import TextInput from "../../../components/inputs/TextInput";
import SelectInput from "../../../components/inputs/SelectInput";
import TextAreaInput from "../../../components/inputs/TextAreaInput";
//import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import Swal from "sweetalert2"; // Importar SweetAlert2
import axios from "../../../config/axiosConfig";
import { debounce } from "lodash";


const VentasFast = () => {
  const { user, userCode, sesionEmpId, sesionPuntoVentaId} = useAuth();
  const [vendedor, setVendedor] = useState([]);
  const [empresa, setEmpresa] = useState("");
  const [puntoVenta, setPuntoVenta] = useState("");

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (user && userCode) {
      setVendedor([{ value: userCode, label: user }]);
    }
    if (sesionEmpId) {
      console.log("sesionEmpId: "+sesionEmpId);
      setEmpresa(sesionEmpId);
    }
    if(sesionPuntoVentaId){
      setPuntoVenta(sesionPuntoVentaId);
    }
  }, [user, userCode, sesionEmpId, sesionPuntoVentaId]);
  // Estados para manejar los datos del formulario
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [details, setDetails] = useState([]);
  const [eventSource, setEventSource] = useState(null);
  const [formData, setFormData] = useState({
    comprobante: "",
    serie: "",
    numero: "",
    fecha: "",
    tipoCambio: "",
    documento: "",
    nombre: "",
    direccion: "",
    subtotal: 0,
    impuesto: 0,
    total: 0,
    sumaTotal: 0,
    vuelto: 0,
    estado: "",
    vendedor: "",
    observaciones: "",
    codigoProducto: "",
    descripcionProducto: "",
    unidad: "",
    cantidad: 0,
    precioUnitario: 0,
    descuento: 0,
    totalProducto: 0,
  });
  const [comprobantes, setComprobantes] = useState([]);
  const [series, setSeries] = useState([]);
  const [numero, setNumero] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      if (!empresa) return;
      try {
        const response = await axios.get(`http://localhost:8080/api/ventas/get-comprobantes-tipos-ventas/${empresa}`);
        const comprobantes = response.data.map((comprobante) => ({
          value: comprobante.codigo,
          label: comprobante.descripcion,
        }));
        setComprobantes(comprobantes);
        if (response.data.length > 0) {
          handleComprobanteChange(comprobantes[0].value);
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
    fetchData();
  }, [empresa]);
  const handleComprobanteChange = async (value) => {
    handleInputChange(value, "comprobante");
    try {
      const response = await axios.get(
        `http://localhost:8080/api/ventas/get-series/comprobantes/${value}/${puntoVenta}`
      );
      const series = response.data.map((serie) => ({
        value: serie.codigoSerie,
        label: serie.codigoSerie,
      }));
      setSeries(series);

      if (series.length > 0) {
        handleSerieChange(series[0].value);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al cargar series",
        text: "No se pudo obtener la lista de series.",
      });
    }
  };
  const handleSerieChange = (value) => {
    handleInputChange(value, "serie");
    
    if (eventSource) {
      eventSource.close();
    }

    const newEventSource = new EventSource(`http://localhost:8080/api/free-pass/stream-numero/${value}/${puntoVenta}`);
    newEventSource.onmessage = (event) => {
      setNumero(event.data);
      handleInputChange(event.data, "numero");
    };

    newEventSource.onerror = (error) => {
      console.error("Error en la conexión SSE", error);
      newEventSource.close();
    };

    setEventSource(newEventSource);
  };
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);
  //autocomplete
  // Función debounced para buscar productos
  const fetchProducts = async (descripcion) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/inventario/productos/find-autocomplete/`+descripcion);
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

  // Crear una versión debounced de fetchProducts con 300ms de delay
  const debouncedFetchProducts = useCallback(debounce(fetchProducts, 300), []);

  // Efecto para llamar a la función debounced cuando cambia el searchTerm
  useEffect(() => {
    if (formData.descripcionProducto.length > 2) {
      debouncedFetchProducts(formData.descripcionProducto);
    } else {
      setProducts([]); // Limpiar la lista si el input tiene menos de 3 caracteres
    }
  }, [formData.descripcionProducto, debouncedFetchProducts]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setFormData((prevFormData) => ({
      ...prevFormData,
      descripcionProducto: product.descripcion,
    }));
    setProducts([]); // Limpia la lista
  };
  const handleChange = (e) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [e.target.name]: e.target.value,
    }));
    //setFormData({
    //  ...formData,
    //  [e.target.name]: e.target.value,
    //});
  };

  const handleInputChange = (value, name) => {
    console.log(`Changing ${name} to ${value}`); // Log para depuración
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  };

  const handleAddPaymentMethod = () => {
    setPaymentMethods([...paymentMethods, { formaPago: "", cantidad: 0 }]);
  };

  const handleAddDetail = () => {
    setDetails([...details, { ...formData }]);
    // Resetear los campos del producto
    setFormData({
      ...formData,
      codigoProducto: "",
      descripcionProducto: "",
      unidad: "",
      cantidad: 0,
      precioUnitario: 0,
      descuento: 0,
      totalProducto: 0,
    });
  };
  const estados = [
    { value: "CON", label: "CONTADO" },
    { value: "CRE", label: "CREDITO" },
  ];

  return (
    <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2 rounded-lg dark:bg-opacity-70 bg-opacity-70 border  shadow-md  p-0 z-10 overflow-auto h-full text-sm">
      {/* segundo div */}
      <div className="relative font-semibold bg-white dark:bg-gray-900 dark:bg-opacity-85 bg-opacity-85 p-4 rounded-lg overflow-auto max-h-screen">
        {/* Detalles del Producto */}
        <h1 className="text-2xl font-bold mb-4 dark:text-white">
          Punto de Venta
        </h1>
        <div className="grid grid-cols-3 gap-6 mb-4">
          <div className="col-span-2">
            <SelectInput
                value={formData.estado}
                setValue={(value) => handleInputChange(value, "estado")}
                options={estados}
                placeholder="Estado"
              />
          </div>

          <div className="col-span-1">
            <SelectInput
                value={formData.vendedor}
                setValue={(value) => handleInputChange(value, "vendedor")}
                options={vendedor}
                placeholder="Vendedor"
              />
          </div>

          <div className="col-span-3">
            <label className="block text-sm text-left font-medium text-gray-700 dark:text-white">
              Observaciones
            </label>
            <input
              type="text"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              className="mt-1 block w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            />
          </div>
        </div>
        {/* Producto */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="">
            <label className="block text-sm text-left font-medium text-gray-700 dark:text-white">
              Código
            </label>
            <input
              type="text"
              name="codigoProducto"
              value={formData.codigoProducto}
              onChange={handleChange}
              className="mt-1 block w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            />
          </div>

          <div className="col-span-2">
            <TextAreaInput
              text={formData.descripcionProducto}
              setText={(value) => handleInputChange(value, "descripcionProducto")}
              placeholder="Descripción"
              typeInput="text"
            />
            {products.length > 0 && (
              <ul className="border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto">
                {products.map((product) => (
                  <li
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="cursor-pointer p-2 hover:bg-gray-200"
                  >
                    {product.descripcion}
                  </li>
                ))}
              </ul>
            )}
            {selectedProduct && (
              <div className="mt-4">
                <h4>Producto seleccionado:</h4>
                <p>{selectedProduct.descripcion}</p>
              </div>
            )}
          </div>
        </div>
        {/* Tabla de Detalles del Producto */}
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg mb-6">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-4 py-2 border-b">Unidad</th>
                <th className="px-4 py-2 border-b">Cantidad</th>
                <th className="px-4 py-2 border-b">Precio Unitario</th>
                <th className="px-4 py-2 border-b">Descuento</th>
                <th className="px-4 py-2 border-b">Total</th>
                <th className="px-4 py-2 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-4 py-2 border-b">
                  <input
                    type="text"
                    name="unidad"
                    value={formData.unidad}
                    onChange={handleChange}
                    className="w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md"
                  />
                </td>
                <td className="px-4 py-2 border-b">
                  <input
                    type="number"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleChange}
                    className="w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md"
                  />
                </td>
                <td className="px-4 py-2 border-b">
                  <input
                    type="number"
                    name="precioUnitario"
                    value={formData.precioUnitario}
                    onChange={handleChange}
                    className="w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md"
                  />
                </td>
                <td className="px-4 py-2 border-b">
                  <input
                    type="number"
                    name="descuento"
                    value={formData.descuento}
                    onChange={handleChange}
                    className="w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md"
                  />
                </td>
                <td className="px-4 py-2 border-b">
                  <input
                    type="number"
                    name="totalProducto"
                    value={formData.totalProducto}
                    onChange={handleChange}
                    className="w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md"
                  />
                </td>
                <td className="px-4 py-2 border-b">
                  <button
                    type="button"
                    onClick={handleAddDetail}
                    className="px-4 py-2 bg-green-500 text-white rounded-md"
                  >
                    Agregar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Tabla de Productos Agregados */}
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-4 py-2 border-b">Unidad</th>
                <th className="px-4 py-2 border-b">Cantidad</th>
                <th className="px-4 py-2 border-b">Precio Unitario</th>
                <th className="px-4 py-2 border-b">Descuento</th>
                <th className="px-4 py-2 border-b">Total</th>
                <th className="px-4 py-2 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {details.map((detail, index) => (
                <tr
                  key={index}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="px-4 py-2 border-b">{detail.unidad}</td>
                  <td className="px-4 py-2 border-b">{detail.cantidad}</td>
                  <td className="px-4 py-2 border-b">
                    {detail.precioUnitario}
                  </td>
                  <td className="px-4 py-2 border-b">{detail.descuento}</td>
                  <td className="px-4 py-2 border-b">{detail.totalProducto}</td>
                  <td className="px-4 py-2 border-b">
                    <button
                      type="button"
                      onClick={() =>
                        setDetails(details.filter((_, i) => i !== index))
                      }
                      className="px-4 py-2 bg-red-500 text-white rounded-md"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="relative font-semibold bg-white dark:bg-gray-900 dark:bg-opacity-85 bg-opacity-85 p-4 rounded-lg overflow-auto max-h-screen">
        
        {/* Información del Comprobante */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="">
            <SelectInput
              value={formData.comprobante}
              setValue={(value) => handleComprobanteChange(value)}
              options={comprobantes}
              placeholder="Comprobante"
            />
          </div>
          <div>
            <SelectInput
              value={formData.serie}
              setValue={(value) => handleSerieChange(value)}
              options={series}
              placeholder="Serie"
            />
          </div>
          <div className="col-span-2">
            <TextInput
              text={formData.fecha}
              setText={(value) => handleInputChange(value, "fecha")}
              placeholder="Fecha"
              typeInput="date"
            />
          </div>
          <div>
            <TextInput
              text={numero}
              setText={(value) => handleInputChange(value, "numero")}
              placeholder="Numero"
              typeInput="text"
            />
          </div>

          <div>
            <label className="block text-sm text-left font-medium text-gray-700 dark:text-white">
              Moneda
            </label>
            <select
              name="moneda"
              value={formData.serie}
              onChange={handleChange}
              className="mt-1 block w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            >
              <option value="">Selecciona una Moneda</option>
              <option value="SOL">SOLES</option>
              <option value="DOL">DOLARES</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-left font-medium text-gray-700 dark:text-white">
              Tipo de Cambio
            </label>
            <input
              type="number"
              name="tipoCambio"
              value={formData.tipoCambio}
              onChange={handleChange}
              className="mt-1 block w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            />
          </div>
        </div>
        {/* Información del Cliente */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div>
            <label className="block text-sm text-left font-medium text-gray-700 dark:text-white">
              Número de Documento
            </label>
            <input
              type="text"
              name="documento"
              value={formData.documento}
              onChange={handleChange}
              className="mt-1 block w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm text-left font-medium text-gray-700 dark:text-white">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="mt-1 block w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            />
          </div>

          <div className="col-span-3">
            <label className="block text-sm text-left font-medium text-gray-700 dark:text-white">
              Dirección
            </label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="mt-1 block w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Subtotal, Impuesto y Total */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div>
            <label className="block text-sm text-left font-medium text-gray-700 dark:text-white">
              Subtotal
            </label>
            <input
              type="number"
              name="subtotal"
              value={formData.subtotal}
              onChange={handleChange}
              className="mt-1 block w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-left font-medium text-gray-700 dark:text-white">
              Impuesto
            </label>
            <input
              type="number"
              name="impuesto"
              value={formData.impuesto}
              onChange={handleChange}
              className="mt-1 block w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-left font-medium text-gray-700 dark:text-white">
              Total
            </label>
            <input
              type="number"
              name="total"
              value={formData.total}
              onChange={handleChange}
              className="mt-1 block w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Forma de Pago */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="flex">
            <label className="block text-sm text-left font-medium text-gray-700 dark:text-white">
              Forma de Pago
            </label>
            <button
              type="button"
              onClick={handleAddPaymentMethod}
              className="mt-2 px-4 py-2 bg-green-400 text-gray-100 rounded-md dark:text-white"
            >
              Agregar
            </button>
          </div>
          <div className="flex">
            <label className="block text-sm text-left font-medium text-gray-700 dark:text-white">
              Agregar Documento:
            </label>
            <select
              name="documento"
              value={formData.serie}
              onChange={handleChange}
              className="mt-1 block w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            >
              <option value="">Selecciona una Documento</option>
              <option value="cot">cotizacion</option>
              <option value="gui">guias</option>
            </select>
            <button
              type="button"
              onClick={handleAddPaymentMethod}
              className="mt-2 px-4 py-2 bg-green-400 text-gray-100 rounded-md dark:text-white"
            >
              +
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="mt-4 col-span-2">
            <table className="min-w-full bg-white dark:bg-gray-600 border border-gray-300">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b">Forma de Pago</th>
                  <th className="px-4 py-2 border-b">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {paymentMethods.map((pm, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border-b">
                      <input
                        type="text"
                        name={`formaPago-${index}`}
                        value={pm.formaPago}
                        onChange={(e) => {
                          const updatedPayments = [...paymentMethods];
                          updatedPayments[index].formaPago = e.target.value;
                          setPaymentMethods(updatedPayments);
                        }}
                        className="w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2 border-b">
                      <input
                        type="number"
                        name={`cantidad-${index}`}
                        value={pm.cantidad}
                        onChange={(e) => {
                          const updatedPayments = [...paymentMethods];
                          updatedPayments[index].cantidad = e.target.value;
                          setPaymentMethods(updatedPayments);
                        }}
                        className="w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="col-span-1">
            <div>
              <label className="block text-sm text-left font-medium text-gray-700 dark:text-white">
                Suma Total
              </label>
              <input
                type="number"
                name="sumaTotal"
                value={formData.sumaTotal}
                onChange={handleChange}
                className="mt-1 block w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md shadow-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-left font-medium text-gray-700 dark:text-white">
                Vuelto
              </label>
              <input
                type="number"
                name="vuelto"
                value={formData.vuelto}
                onChange={handleChange}
                className="mt-1 block w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md shadow-sm focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-2">
          <button
            type="button"
            onClick={handleAddPaymentMethod}
            className="mt-2 px-4 py-2 bg-green-400 text-gray-100 rounded-md dark:text-white"
          >
            GUARDAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default VentasFast;
