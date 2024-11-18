import { useState, useEffect } from 'react';
import { Table, Button, Form, message, Tag} from 'antd';
import axios from "../../../config/axiosConfig"; 
import * as XLSX from 'xlsx';  // Para exportar a Excel
import jsPDF from 'jspdf';     // Para exportar a PDF
import 'jspdf-autotable'; 
import ComprobanteModal from './ComprobanteModal';
import { useAuth } from '../../../context/AuthContext';
import useFetchData from '../../../hooks/useFetchData';

const ComprobantesTable = () => {
  const [comprobantes, setComprobantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [editingComprobante, setEditingComprobante] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [comprobantesTipos, setComprobantesTipos] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [comprobanteTiposSelected, setComprobanteTiposSelected] = useState(null);
  const [monedasSelected, setMonedasSelected] = useState(null);
  const [estadosSelected, setEstadosSelected] = useState(null);
  const [puntosVentas, setPuntosVentas] = useState([]);
  const [puntosVentasSelected, setPuntosVentasSelected] = useState(null);
  const { sesionEmpId, userCode, sesionAlmacenId} = useAuth();
  
  useEffect(() => {
    const fetchInitialData = async () => {
      if (sesionEmpId) {
        const comprobanteTipos = await fetchComprobantesTipos();
        setComprobanteTiposSelected(comprobanteTipos);
        const monedas = await fetchMonedas();
        setMonedasSelected(monedas);
        const estados = await fetchEstados();
        setEstadosSelected(estados);
        const puntosVentas = await fetchPuntosVentas(sesionAlmacenId);
        setPuntosVentasSelected(puntosVentas);
      }
    };
    fetchInitialData();
  }, [sesionEmpId]);

  const { fetchComprobantesTipos, fetchMonedas, fetchEstados, fetchPuntosVentas } = useFetchData({
    sesionEmpId,
    sesionAlmacenId,
    setComprobantesTipos,
    setMonedas,
    setEstados,
    setPuntosVentas
  });

  const fetchData = async (pagination, filters = {}, sorter = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:8080/api/ventas/comprobantes/list', {
        params: {
          page: pagination.current - 1, // El backend comienza en 0
          size: pagination.pageSize,
          idEmpresa: sesionEmpId,
          serie: filters.serie ? filters.serie[0] : null,
          numero: filters.numero ? filters.numero[0] : null,
          idPuntoVenta: puntosVentasSelected ? puntosVentasSelected.value : null,
          fechaEmision: filters.fechaEmision ? filters.fechaEmision[0] : null,
          fechaVencimiento: filters.fechaVencimiento ? filters.fechaVencimiento[0] : null,
          codigoTipo: comprobanteTiposSelected,
          nombre: filters.nombre ? filters.nombre[0] : null,
          numeroDoc: filters.numeroDoc ? filters.numeroDoc[0] : null,
          subtotal: filters.subtotal ? filters.subtotal[0] : null,
          impuesto: filters.impuesto ? filters.impuesto[0] : null,
          total: filters.total ? filters.total[0] : null,
          monedaCodigo: monedasSelected,
          estadoCodigo: estadosSelected,
          sunat: filters.sunat ? filters.sunat[0] : null,
          sort: sorter.field ? `${sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}` : null,
        },
      });
      setComprobantes(data.content);
      setPagination({
        current: data.number + 1,
        pageSize: data.size,
        total: data.totalElements,
      });
    } catch (error) {
      message.error('Error fetching productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination);
  }, []);
  // Obtener todos los datos para exportar (sin paginación)
  const fetchAllData = async () => {
    try {
      const { data } = await axios.get('http://localhost:8080/api/ventas/comprobantes/list', {
        params: {
          page: 0,
          size: 1000,  // Ajustar según el tamaño esperado de los datos
        },
      });
      return data.content;
    } catch (error) {
      message.error('Error fetching all productos for export');
      return [];
    }
  };
  console.log(puntosVentas);

  // Exportar a Excel
  const exportToExcel = async () => {
    const allData = await fetchAllData();
    const worksheet = XLSX.utils.json_to_sheet(allData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
    XLSX.writeFile(workbook, "productos.xlsx");
  };

  // Exportar a PDF
  const exportToPDF = async () => {
    const allData = await fetchAllData();
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Empresa', 'Codigo', 'Nombre', 'Tipo', 'Cantidad', 'Marca', 'Presentacion', 'Capacidad', 'Generar Stock', 'Estado', 'Precio Unitario']],
      body: allData.map(item => [
        item.idEmpresa, item.codigo, item.nombre, item.tipo, item.productosXAlmacen, 
        item.marca, item.presentacion, item.capacidadCantidad, item.generarStock, 
        item.estado, item.precioSugerido
      ]),
    });
    doc.save('productos.pdf');
  };
  const handleView = (record) => {
    console.log(record);
    setEditingComprobante(record);
  };
  const handleAnular = (record) => {
    console.log(record);
    console.log(userCode);
  };


  // Abrir el modal de edición
  /*
  const handleEdit = (record) => {
    const tipo = comprobantesTipos.find(t => t.value === record.tipo.codigo); // Mapea el tipo al valor correcto
    const moneda = monedas.find(m => m.value === record.monedaCodigo); // Mapea la moneda al valor correcto
    const estado = estados.find(e => e.value === record.estadoCodigo); // Mapea el estado al valor correcto
    setEditingComprobante(record);
    //form.setFieldsValue(record); 
    console.log(record);
    form.setFieldsValue({
      ...record,  // Mantiene los valores actuales del resto de los campos
      tipo: tipo ? tipo.value : null,  // Asigna el value del tipo encontrado
      moneda: moneda ? moneda.value : null,  // Asigna el value de la moneda encontrada
      estado: estado ? estado.value : null,  // Asigna el value del estado encontrado
    });
    setModalVisible(true);
  };
  // Abrir el modal de agregar
  const handleAdd = () => {
    setEditingComprobante(null);
    form.resetFields();
    setModalVisible(true);
  };*/
  // Guardar cambios de edición
  /*
  const handleSave = async () => {
    try {
      // Validar los campos antes de guardar
      const values = await form.validateFields();
      //console.log(values);
      const comprobanteRequest = {
        idComprobante: editingComprobante ? editingComprobante.idComprobante : null,  // Si estamos editando, usamos el id existente
        codigo: values.codigo,
        nombre: values.nombre,
        tipo: { codigo: values.tipo },  // Asignar el tipo como un objeto con el value
        empresa: {id: sesionEmpId}, 
        stockAlmacenId: editingComprobante ? editingComprobante.stockAlmacenId : null,
        almacenId: editingComprobante ? editingComprobante.almacenId : sesionAlmacenId,
        monedaCodigo: values.moneda,
        estadoCodigo: values.estado,
        fechaRegistro: null, 
        fechaEmision: values.fechaEmision,
        fechaVencimiento: values.fechaVencimiento,
        numeroDoc: values.numeroDoc,
        subtotal: values.subtotal,
        impuesto: values.impuesto,
        total: values.total,
        precioSugerido: values.precioSugerido,
        usuarioCreacion: userCode, 
        usuarioActualizacion: editingComprobante ? userCode : null  
      };
      console.log(comprobanteRequest);
  
      if (editingComprobante) {
        // Si editingProducto tiene valor, es una edición
        await axios.patch(`http://localhost:8080/api/ventas/comprobantes/update/${editingComprobante.idComprobante}`, comprobanteRequest);
        message.success('Comprobante actualizado exitosamente');
      } else {
        // Si no hay comprobante, es un nuevo comprobante
        await axios.post(`http://localhost:8080/api/ventas/comprobantes/save`, comprobanteRequest);
        message.success('Comprobante creado exitosamente');
      }
  
      setModalVisible(false);
      form.resetFields();
      fetchData(pagination);  // Recargar datos de la tabla
    } catch (error) {
      if (error.name === 'ValidationError') {
        message.error('Por favor complete todos los campos requeridos');
      } else {
        message.error(editingComprobante ? 'Error actualizando comprobante' : 'Error creando comprobante');
      }
    }
  };*/
  const columns = [
    {
      title: 'Fecha de Emisión',
      dataIndex: 'fechaEmision',
      sorter: true,
      width: '5%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Fecha de Vencimiento',
      dataIndex: 'fechaVencimiento',
      sorter: true,
      width: '5%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Tipo',
      dataIndex: 'comprobantesTipos',
      sorter: true,
      width: '5%',
      filterSearch: true,
      render: (tipo) => {
        // Buscar el tipo por el ID y definir el color
        const comprobanteTipo = comprobantesTipos.find(t => t.value === tipo.codigo);
        let color = '';
        if (comprobanteTipo?.value === 'FAC') {
          color = 'green';
        } else if (comprobanteTipo?.value === 'BOL') {
          color = 'blue';
        } else if (comprobanteTipo?.value === 'TIK') {
          color = 'volcano';
        }
        return comprobanteTipo ? (
          <Tag color={color}>{comprobanteTipo.label.toUpperCase()}</Tag>
        ) : 'Sin tipo';
      },
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Serie',
      dataIndex: 'serie',
      sorter: true,
      width: '5%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Número',
      dataIndex: 'numero',
      sorter: true,
      width: '5%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Número Doc',
      dataIndex: 'numeroDocumentoCliente',
      sorter: true,
      width: '8%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Nombre/Razón Social',
      dataIndex: 'nombreCliente',
      sorter: true,
      width: '15%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      sorter: true,
      width: '4%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Impuesto',
      dataIndex: 'impuesto',
      sorter: true,
      width: '4%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      sorter: true,
      width: '4%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Moneda',
      dataIndex: 'codigoMoneda',
      sorter: true,
      width: '5%',
      filterSearch: true,
      render: (moneda) => {
        // Definir el color en función del código de moneda
        let color = moneda === 'DOL' ? 'geekblue' : 'gold';
        const monedaLabel = monedas.find(m => m.value === moneda)?.label || 'Sin moneda';
        return (
          <Tag color={color}>{monedaLabel.toUpperCase()}</Tag>
        );
      },
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Código Estado',
      dataIndex: 'comprobantesVentaEstado',
      sorter: true,
      width: '5%',
      filterSearch: true,
      render: (estado) => {
        // Definir el color basado en el estado
        let color = '';
        switch (estado.codigo) {
          case 'ANU': color = 'red'; break;
          case 'CAN': color = 'orange'; break;
          case 'CON': color = 'green'; break;
          case 'CRE': color = 'purple'; break;
          case 'PRO': color = 'blue'; break;
          case 'EMI': color = 'cyan'; break;
          default: color = 'default';
        }
        const estadoLabel = estados.find(e => e.value === estado.codigo)?.label || 'Sin estado';
        return (
          <Tag color={color}>{estadoLabel.toUpperCase()}</Tag>
        );
      },
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Punto de Venta',
      dataIndex: 'idPuntoVenta',
      sorter: true,
      width: '5%',
      filterSearch: true,
      render: (puntoVenta) => {
        return puntosVentas.find(p => p.value === puntoVenta)?.label || 'Sin punto de venta';
      },
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'SUNAT',
      dataIndex: 'sunat',
      sorter: true,
      width: '5%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Acciones',
      fixed: 'right',
      width: '5%',
      key: 'actionAnular',
      render: (text, record) => (
        <>
          <Button onClick={() => handleView(record)} icon={<i className="fas fa-eye" />} />
          <Button onClick={() => handleAnular(record)} icon={<i className="fas fa-ban" />} danger />
        </>
      ),
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    }
  ];

  return (
    <div className='rounded-lg dark:bg-transparent bg-transparent border shadow-md p-0 z-10 h-full relative'>
      {/* Botones de exportación */}
      <div className="mb-2 flex justify-between border rounded-lg dark:bg-gray-800 bg-white text-gray-500 dark:text-gray-300 p-2">
          <div className="mb-2 flex flex-row justify-end">
            <Button onClick={exportToExcel} icon={<i className="fas fa-file-excel" />} className="mr-2">
              Exportar a Excel
            </Button>
            <Button onClick={exportToPDF} icon={<i className="fas fa-file-pdf" />} className="mr-2">
              Exportar a PDF
            </Button>
          </div>
          {/* Tabla de Ant Design */}
          <div className="mb-2 flex justify-between">
            <h3 className="text-2xl font-bold">Comprobantes Ventas</h3>
          </div>
      </div>
      <Table
        columns={columns}
        dataSource={comprobantes}
        pagination={pagination}
        loading={loading}
        rowKey="id"
        scroll={{
          x: 'max-content',
          y: 400,
        }}
        className='w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-400'
        onChange={(pagination, filters, sorter) => fetchData(pagination, filters, sorter)}
      />

      {/* Conditionally render ProductoModal only when envases and tipos are loaded */}
      {monedas.length > 0 && comprobantesTipos.length > 0 && estados.length > 0 &&  (
        <ComprobanteModal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          //onOk={handleSave}
          form={form}
          comprobante={editingComprobante}
          monedas={monedas}
          comprobantesTipos={comprobantesTipos}
          estados={estados}
        />
      )}
    </div>
  );
};

export default ComprobantesTable;

