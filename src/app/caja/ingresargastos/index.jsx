import { useEffect, useState, useRef } from "react";
import TextInput from "../../../components/inputs/TextInput";
import SelectInput from "../../../components/inputs/SelectInput";
import TextAreaInput from "../../../components/inputs/TextAreaInput";
//import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";
import useGastos  from "./useGastos";
import CustomButton from "../../../components/inputs/CustomButton";
import ClipLoader from 'react-spinners/ClipLoader';

const IngresarGastos = () => {
  //loader
  const [loading, setLoading] = useState(false);
  const { userCode, sesionEmpId, sesionPuntoVentaId, sesionAlmacenId } = useAuth();
  const [products, setProducts] = useState([]);
  const [descripcionProducto, setDescripcionProducto] = useState("");
  const [monedas, setMonedas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [comprobantes, setComprobantes] = useState([]);
  const [details, setDetails] = useState([]);
  const [selectedMoneda, setSelectedMoneda] = useState("");
  const [tipoDocumentos, setTipoDocumentos] = useState([]);
  const [selectedTipoDocumento, setSelectedTipoDocumento] = useState({});
  const [proveedor, setProveedor] = useState({
    id: 0,
    documento: "",
    numeroDocumento: "",
    nombre: "",
    estado: "",
    condicion: "",
    direccion: "",
  });
  const [selectedProduct, setSelectedProduct] = useState({
    id: 0,
    idEnvase: 0, 
    codigo: "",
    descripcionA: "",
    nombre: "",
    unidad: "", // Estableces manualmente lo que necesites
    cantidad: 1, // Cantidad inicial
    precioUnitario: 0, // Puedes dejarlo en 0 o calcularlo según sea necesario
    descuento: 0, // Descuento inicial
    totalProducto: 0,
  });
  const [formData, setFormData] = useState({
    comprobante: "",
    serie: "",
    numero: "",
    fecha: "",
    fechaIngreso: "",
    periodoRegistro: "",
    fechaVencimiento: "",
    generarMovimiento: true,
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
  const [tooltips, setTooltips] = useState({
    serie: false,
    numero: false,
  });

  useEffect(() => {
    if (userCode) {
      setFormData((prev) => ({ ...prev, vendedor: userCode }));
    }
  }, [userCode, sesionEmpId, sesionPuntoVentaId]);

  const { fetchComprobantes, debouncedFetchProducts, fetchMonedas, fetchTipoDocumentos, fetchProveedores, fetchComprasEstados, buildResponseCompra, fetchGuardarCompra } = useGastos({
    setComprobantes,
    setProducts,
    setMonedas,
    setProveedor,
    setTipoDocumentos,
    setEstados
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
        }
        // Cargar las monedas, métodos de pago y tipos de documentos
        const moneda = await fetchMonedas(sesionEmpId);
        setSelectedMoneda(moneda);
        const tipoDocumento = await fetchTipoDocumentos(sesionEmpId);
        setSelectedTipoDocumento(tipoDocumento);
        const estado = await fetchComprasEstados(sesionEmpId);
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
}, []);

  //date
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const formattedMonth = today.toISOString().slice(0, 7); // YYYY-MM

    setFormData((prev) => ({
      ...prev,
      fecha: formattedDate,
      fechaIngreso: formattedDate,
      periodoRegistro: formattedMonth, // Set only the year and month
      fechaVencimiento: formattedDate
    }));
  }, []);


    // Maneja el cambio de comprobante
  const handleComprobanteChange = async (value) => {
    setFormData((prev) => ({ ...prev, comprobante: value }));
  };
  const handleSave = async () => {
    try {
      if (!validateFields()) {
        console.log("no paso");
        return; // Detener la ejecución si falta algún campo
      } 
      // Puedes agregar más validaciones si es necesario antes de guardar
      const requestDTO = buildResponseCompra(formData,details,proveedor,selectedMoneda);
      const ventaGuardadaId = await fetchGuardarCompra(requestDTO);
      if (ventaGuardadaId) {
        Swal.fire({
          icon: "success",
          title: "Compra guardada con éxito",
          text: "La compra ha sido guardada correctamente.",
        })
        resetForm();
      }
    } catch (error) {
      console.error("Error al guardar la compra:", error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar la compra",
        text: "No se pudo guardar la compra.",
      });
    }
  };

  const handleInputChange = (value, name) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
    setTooltips((prev) => ({ ...prev, [name]: false }));
  };
  const handleCheckboxChange = (checked) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      generarMovimiento: checked,
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

  const handleProductSelect = (product) => {
    console.log(product);
    setDescripcionProducto(product.descripcionA);
    let total = product.precioCompra * 1;
    setSelectedProduct({
      id: product.id, 
      idEnvase: product.envaseId,
      codigo: product.codigo,//sera reemplazado por el codigo del pollo stock
      descripcionA: product.descripcionA,
      peso: product.peso,
      nombre: product.nombre,
      unidad: product.unidad, // Estableces manualmente lo que necesites
      cantidad: 1, // Cantidad inicial
      precioUnitario: product.precioCompra, // Puedes dejarlo en 0 o calcularlo según sea necesario
      totalProducto: total,
    });

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
  //agregar detalle
  const handleAddDetail = () => {
    setDescripcionProducto("");
    setDetails((prev) => [...prev, selectedProduct]);
    setSelectedProduct({
      id: 0, 
      idEnvase: 0,
      codigo: "",
      descripcionA: "",
      nombre: "",
      unidad: "", // Estableces manualmente lo que necesites
      cantidad: 1, // Cantidad inicial
      precioUnitario: 0, // Puedes dejarlo en 0 o calcularlo según sea necesario
      descuento: 0, // Descuento inicial
      totalProducto: 0,
    });
  };
  const handleDetailChange = (value, name) => {
    // Actualizamos el campo que cambió
    setSelectedProduct((prev) => {
      
      const updatedProduct = { ...prev, [name]: value };
      // Si el campo cambiado es 'cantidad', 'precioUnitario' o 'descuento', recalculamos el total
      if (name === "cantidad" || name === "precioUnitario" || name === "descuento") {
        const total = (parseFloat(updatedProduct.cantidad) || 0) * (parseFloat(updatedProduct.precioUnitario) || 0) - (parseFloat(updatedProduct.descuento) || 0);
        let totalProducto = Math.round(total * 100) / 100;
        updatedProduct.totalProducto = totalProducto;
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
      await fetchProveedores(sesionEmpId, selectedTipoDocumento, value);
      setLoading(false);
    };
    // Maneja el cambio en el input de número de documento
    const handleInputChangeCliente = (value,name) => {
      setProveedor((prev) => ({
        ...prev,
        [name]: value
      }));
    };
    // Maneja la presión de teclas para el input del documento
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleClienteChange(proveedor.documento);
      }
    };
    const resetForm = () => {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
      const formattedMonth = today.toISOString().slice(0, 7); // YYYY-MM

      setFormData({
        comprobante: "",
        serie: "",
        numero: "",
        fecha: formattedDate, // Fecha actual
        fechaIngreso: formattedDate,
        periodoRegistro: formattedMonth,
        fechaVencimiento: formattedDate,
        generarMovimiento: true,
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
      });
      setDetails([]);
      setProveedor({
        id: 0,
        documento: "",
        nombre: "",
        tipoDocumento: "",
        direccion: "",
      });
      setSelectedMoneda(null);
      setSelectedTipoDocumento(null);
      setSelectedProduct({
        id: 0, 
        idEnvase: 0,
        codigo: "",
        descripcionA: "",
        nombre: "",
        unidad: "", // Estableces manualmente lo que necesites
        cantidad: 1, // Cantidad inicial
        precioUnitario: 0, // Puedes dejarlo en 0 o calcularlo según sea necesario
        descuento: 0, // Descuento inicial
        totalProducto: 0,
      });
    };
    // Crear refs para cada campo importante
    const serieRef = useRef(null);
    const numeroRef = useRef(null);
    const fechaRef = useRef(null);
    const fechaIngresoRef = useRef(null);
    const periodoRegistroRef = useRef(null);
    const fechaVencimientoRef = useRef(null);
    const totalRef = useRef(null);

    const validateFields = () => {
      const missingFields = [];
      let isValid = true;
      const newTooltips = { serie: false, numero: false };

      if (!formData.serie || formData.serie === "") {
        missingFields.push("Serie");
        serieRef.current?.focus();
        isValid = false; 
      }
      if (!formData.numero || formData.numero === "") {
        missingFields.push("Número");
        numeroRef.current?.focus();
        isValid = false; 
      }
      if (!formData.fecha || formData.fecha === "") {
        missingFields.push("Fecha de Emisión");
        fechaRef.current?.focus();
        isValid = false; 
      }
      if(!details.length > 0){
        missingFields.push("Detalles");
        isValid = false; 
      }
      if(!formData.fechaIngreso || formData.fechaIngreso === ""){
        missingFields.push("Fecha de Ingreso");
        fechaIngresoRef.current?.focus();
        isValid = false; 
      }
      if(!formData.periodoRegistro || formData.periodoRegistro === ""){
        missingFields.push("Periodo de Registro");
        periodoRegistroRef.current?.focus();
        isValid = false; 
      }
      if(!formData.fechaVencimiento || formData.fechaVencimiento === ""){
        missingFields.push("Fecha de Vencimiento");
        fechaVencimientoRef.current?.focus();
        isValid = false; 
      }
      if (!formData.total || formData.total === 0) {
        missingFields.push("Total");
        totalRef.current?.focus();
        isValid = false; 
      }
      if (!proveedor.id || proveedor.id === 0) {
        missingFields.push("ID del Proveedor");
        isValid = false; 
      }
      if (!selectedMoneda || !selectedMoneda || selectedMoneda === "") {
        missingFields.push("Código de Moneda");
        isValid = false; 
      }

      setTooltips(newTooltips);

      setTimeout(() => {
        setTooltips({ serie: false, numero: false });
      }, 3000); // Esconde los tooltips después de 3 segundos

      return isValid;
    }
      

  return (
    <div className="relative grid grid-cols-1 gap-1 rounded-lg dark:bg-transparent bg-transparent border  shadow-md  p-0 z-10 overflow-auto h-full text-sm">
      {/* segundo div */}
      {/* Loader */}
      {loading && (
        <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-70 z-20">
          <ClipLoader color="#36D7B7" loading={loading} size={50} />
        </div>
      )}
      <div className="relative font-semibold bg-white dark:bg-gray-900 dark:bg-opacity-85 bg-opacity-85 p-4 rounded-lg md:overflow-auto md:max-h-screen h-auto">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">
          Ingresar Gasto
        </h1>
        {/* Información del Comprobante */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:grid-cols-6 md:gap-6 mb-4 mt-2">
          <div>
            <SelectInput
              value={formData.comprobante}
              setValue={handleComprobanteChange}
              options={comprobantes}
              placeholder="Comprobante"
            />
          </div>
          <div>
            <TextInput
              ref={serieRef}
              text={formData.serie}
              setText={(value) => handleInputChange(value, "serie")}
              placeholder="Serie"
              typeInput="text"
            />
            {tooltips.serie && (
              <div className="absolute -top-8 left-0 bg-red-500 text-white text-sm px-2 py-1 rounded shadow-lg animate-fade">
                Ingrese la serie
              </div>
            )}
          </div>
          <div>
            <TextInput
              ref={numeroRef}
              text={formData.numero} // Aquí se muestra el número de serie obtenido
              setText={(value) => handleInputChange(value, "numero")}
              placeholder="Número"
              typeInput="text"
            />
            {tooltips.numero && (
              <div className="absolute -top-8 left-0 bg-red-500 text-white text-sm px-2 py-1 rounded shadow-lg animate-fade">
                Ingrese el número
              </div>
            )}
          </div>
          <div>
            <TextInput
              ref={fechaRef}
              text={formData.fecha}
              setText={(value) => handleInputChange(value, "fecha")}
              placeholder="Fecha Emisión"
              typeInput="date"
            />
          </div>
          <div>
            <SelectInput
              value={selectedMoneda} // Valor seleccionado
              setValue={handleMonedaChange} // Manejador del cambio
              options={monedas} // Lista de opciones de monedas
              placeholder="Moneda"
              disabled={true}
            />
          </div>
          <div>
            <TextInput
              text={formData.tipoCambio}
              setText={(value) => handleInputChange(value, "tipoCambio")}
              placeholder="T.C"
              typeInput="number"
              disabled={true}
            />
          </div>
        </div>
        {/* Información del proveedor */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:grid-cols-6 md:gap-6 mb-4">
          <div>
            <SelectInput
              value={selectedTipoDocumento}
              setValue={handleTipoDocumentoChange}
              options={tipoDocumentos}
              placeholder="Tipo DOC"
            />
          </div>
          <div>
            <TextInput
              name="documento" // Add name attribute
              text={proveedor.documento}
              setText={(value) => handleInputChangeCliente(value, "documento")}
              placeholder="N° Doc"
              typeInput="text"
              onKeyDown={handleKeyDown} // Add onKeyDown handler
            />
          </div>

          <div className="col-span-2">
            <TextInput
              name="nombre" // Add name attribute
              text={proveedor.nombre}
              setText={(value) => handleInputChangeCliente(value, "nombre")}
              placeholder="Nombre"
              typeInput="text"
            />
          </div>
          {/* Separate div for the checkbox input */}
          <div className="col-span-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.generarMovimiento} // Checked by default
                onChange={(e) => handleCheckboxChange(e.target.checked)}
              />
              <span>Generar Movimiento</span>
            </label>
          </div>
        </div>
        {/* estado y fechas*/}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:grid-cols-6 md:gap-6 mb-4">
          <div className="">
            <SelectInput
                value={formData.estado}
                setValue={(value) => handleInputChange(value, "estado")}
                options={estados}
                placeholder="Estado"
              />
          </div>
          <div>
            <TextInput
              ref={fechaIngresoRef}
              text={formData.fechaIngreso}
              setText={(value) => handleInputChange(value, "fechaIngreso")}
              placeholder="Fecha Ingreso"
              typeInput="date"
            />
          </div>
          <div>
            <TextInput
              ref={periodoRegistroRef}
              text={formData.periodoRegistro}
              setText={(value) => handleInputChange(value, "periodoRegistro")}
              placeholder="Periodo Registro"
              typeInput="month"
            />
          </div>
          <div>
            <TextInput
              ref={fechaVencimientoRef}
              text={formData.fechaVencimiento}
              setText={(value) => handleInputChange(value, "fechaVencimiento")}
              placeholder="Fecha Vencimiento"
              typeInput="date"
            />
          </div>
          <div className="col-span-2">
            <TextInput
              text={formData.observaciones}
              setText={(value) => handleInputChange(value, "observaciones")}
              placeholder="Observaciones"
              typeInput="text"
            />
          </div>
        </div>
      </div>
      <div className="relative font-semibold bg-white dark:bg-gray-900 dark:bg-opacity-85 bg-opacity-85 p-4 rounded-lg md:overflow-auto md:max-h-screen h-auto">
        {/* Detalles del Producto */}
        <h1 className="text-2xl font-bold mb-4 dark:text-white">
          Detalles
        </h1>
        {/* Producto */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:grid-cols-8 md:gap-6 mb-4">
          <div className="">
            <TextInput
                text={selectedProduct.codigo}
                setText={(value) => handleDetailChange(value, "codigo")}
                placeholder="Código"
                typeInput="text"
                disabled={true}
              />
          </div>
          <div className="col-span-2 relative">
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
          <div>
            <TextInput
              text={selectedProduct.unidad}
              setText={(value) => handleDetailChange(value, "unidad")}
              placeholder="Unidad"
              typeInput="text"
              disabled
            />
          </div>
          <div>
            <TextInput
              text={selectedProduct.cantidad}
              setText={(value) => handleDetailChange(value, "cantidad")}
              placeholder="Cantidad"
              typeInput="number"
            />
          </div>
          <div>
            <TextInput
              text={selectedProduct.precioUnitario}
              setText={(value) => handleDetailChange(value, "precioUnitario")}
              placeholder="Precio U."
              typeInput="number"
            />
          </div>
          <div>
            <TextInput
              text={selectedProduct.totalProducto}
              setText={(value) => handleDetailChange(value, "totalProducto")}
              placeholder="Total"
              typeInput="number"
              disabled
            />
          </div>
          <div>
            <CustomButton 
              placeholder="Agregar" 
              onClick={handleAddDetail} 
              sizeClass=" py-2"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-6 md:gap-2 mb-2">
          {/* Tabla de Productos Agregados */}
          <div className=" col-span-1 md:col-span-5 relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-2 py-2 border-b">Código</th>
                  <th className="px-2 py-2 border-b">Descripción</th>
                  <th className="px-2 py-2 border-b">Unidad</th>
                  <th className="px-2 py-2 border-b">Cantidad</th>
                  <th className="px-2 py-2 border-b">Precio Unit</th>
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
                    <td className="px-2 py-2 border-b">{detail.cantidad}</td>
                    <td className="px-2 py-2 border-b">{detail.precioUnitario}</td>
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
          <div className="col-span-1 flex flex-col justify-end">
            {/* Subtotal, Impuesto y Total */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 mb-2">
              <div className="flex flex-col space-y-3">
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
                    ref={totalRef}
                    text={formData.total}
                    setText={(value) => handleInputChange(value, "total")}
                    placeholder="Total"
                    typeInput="number"
                    disabled={true}
                  />
                </div>
              </div>
            </div>
            {/* Botón de Guardar */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 mb-2">
              <CustomButton 
                placeholder="Guardar" 
                onClick={handleSave} 
                sizeClass="px-4 py-2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngresarGastos;
