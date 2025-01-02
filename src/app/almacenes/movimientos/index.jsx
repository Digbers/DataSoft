import { useState, useEffect } from 'react';
import { Table, Button, Form, message, Tag } from 'antd';
import axios from "../../../config/axiosConfig"; 
import * as XLSX from 'xlsx';  // Para exportar a Excel
import jsPDF from 'jspdf';     // Para exportar a PDF
import 'jspdf-autotable'; 
import MovimientoModal from './MovimientoModal.jsx';
import { useAuth } from '../../../context/AuthContext';

const MovimientosTable = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { sesionEmpId} = useAuth();
  const [almacenes, setAlmacenes] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [motivos, setMotivos] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (sesionEmpId) {
        console.log(sesionEmpId);
      }
    };
    fetchInitialData();
  }, [sesionEmpId]);


  const fetchData = async (pagination, filters = {}, sorter = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:8080/api/inventario/movimientos/list', {
        params: {
          page: pagination.current - 1, // El backend comienza en 0
          size: pagination.pageSize,
          idEmpresa: sesionEmpId,
          numero: filters.numero ? filters.numero[0] : null,
          fechaEmision: filters.fechaEmision ? filters.fechaEmision[0] : null,
          total: filters.total ? filters.total[0] : null,
          motivoCodigo: filters.motivoCodigo ? filters.motivoCodigo[0] : null,
          idUsuario: filters.idUsuario ? filters.idUsuario[0] : null,
          monedaCodigo: filters.monedaCodigo ? filters.monedaCodigo[0] : null,
          sort: sorter.field ? `${sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}` : null,
        },
      });
      setMovimientos(data.content);
      setPagination({
        current: data.number + 1,
        pageSize: data.size,
        total: data.totalElements,
      });
    } catch (error) {
      message.error('Error fetching movimientos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination);
  }, []);
  useEffect(() => {
    fetchAlmacenes();
    fetchMonedas();
    fetchEstados();
    fetchMotivos();
  }, [sesionEmpId]);

  const fetchAlmacenes= async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/inventario/almacenes/find/empresa/' + sesionEmpId);
      const padres = response.data.map(padre => ({
        value: padre.id,
        label: padre.nombre
      }));
      //padres.unshift({ value: 0, label: 'Ninguno' });
      setAlmacenes(padres);
    } catch (error) {
      console.error('Error fetching almacenes:', error);
      message.error('Error fetching almacenes');
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
      message.error('Error fetching monedas');
    }
  };
  const fetchEstados = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/inventario/movimientos/estados/find`);
      const estadosList = response.data.map((estado) => ({
        value: estado.codigo,
        label: estado.nombre,
      }));
      setEstados(estadosList);
    } catch (error) {
      console.error('Error fetching estados:', error);
      message.error('Error fetching estados');
    }
  };
  const fetchMotivos = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/inventario/movimientos/motivos/find`);
      const motivosList = response.data.map((motivo) => ({
        value: motivo.codigo,
        label: motivo.descripcion,
      }));
      setMotivos(motivosList);
    } catch (error) {
      console.error('Error fetching motivos:', error);
      message.error('Error fetching motivos');
    }
  };
  // Obtener todos los datos para exportar (sin paginación)
  const fetchAllData = async () => {
    try {
      const { data } = await axios.get('http://localhost:8080/api/inventario/movimientos/list', {
        params: {
          page: 0,
          size: 1000,  // Ajustar según el tamaño esperado de los datos
        },
      });
      return data.content;
    } catch (error) {
      message.error('Error fetching all movimientos for export');
      return [];
    }
  };

  // Exportar a Excel
  const exportToExcel = async () => {
    const allData = await fetchAllData();
    const worksheet = XLSX.utils.json_to_sheet(allData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Movimientos");
    XLSX.writeFile(workbook, "movimientos.xlsx");
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
    doc.save('movimientos.pdf');
  };
  
  const handleView = (record) => {
    console.log(record);
    setSelectedMovimiento(record);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Fecha de Emisión',
      dataIndex: 'fechaEmision',
      sorter: true,
      width: '10%',
      filterSearch: true,
      render: (fechaEmision) => {
        if (!fechaEmision) return 'N/A';
        const fecha = new Date(fechaEmision);
        return fecha.toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
      },
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Serie',
      dataIndex: 'serie',
      sorter: true,
      width: '10%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
        title: 'Número',
        dataIndex: 'numero',
        sorter: true,
        width: '10%',
        filterSearch: true,
        className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Documento',
      dataIndex: 'documentoReferencia',
      sorter: true,
      width: '10%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Motivo',
      dataIndex: 'motivoCodigo',
      sorter: true,
      width: '5%',
      filterSearch: true,
      render: (text) => {
        const motivo = motivos.find(motivo => motivo.value === text);
        return motivo ? motivo.label : text;
      },
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      sorter: true,
      width: '5%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Usuario',
      dataIndex: 'idUsuario',
      sorter: true,
      width: '5%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Moneda',
      dataIndex: 'monedaCodigo',
      sorter: true,
      width: '10%',
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
      title: 'Almacén',
      dataIndex: 'idAlmacen',
      sorter: true,
      width: '20%',
      filterSearch: true,
      render: (almacen) => {
        const almacenLabel = almacenes.find(a => a.value === almacen)?.label || 'Sin almacén';
        return almacenLabel;
      },
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Estado',
      dataIndex: 'estadoCodigo',
      sorter: true,
      width: '5%',
      filterSearch: true,
      render: (estado) => {
        const estadoLabel = estados.find(e => e.value === estado)?.label || 'Sin estado';
        return estadoLabel;
      },
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    
    {
      title: 'Acciones',
      fixed: 'right',
      width: '5%',
      key: 'actionView',
      render: (text, record) => (
        <Button onClick={() => handleView(record)} icon={<i className="fas fa-eye" />} />
      ),
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
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
            <h3 className="text-2xl font-bold">Movimientos</h3>
          </div>
      </div>
      <Table
        columns={columns}
        dataSource={movimientos}
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
        <MovimientoModal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          form={form}
          movimiento={selectedMovimiento}
          almacenes={almacenes}
          monedas={monedas}
          estados={estados}
          motivos={motivos}
        />
      
    </div>
  );
};

export default MovimientosTable;

