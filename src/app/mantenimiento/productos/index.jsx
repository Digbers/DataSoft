import { useState, useEffect } from 'react';
import { Table, Button, Form, message, Popconfirm, Checkbox } from 'antd';
import axios from "../../../config/axiosConfig"; 
import * as XLSX from 'xlsx';  // Para exportar a Excel
import jsPDF from 'jspdf';     // Para exportar a PDF
import 'jspdf-autotable'; 
import ProductoModal from './ProductoModal';
import { useAuth } from '../../../context/AuthContext';

const UserTable = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [editingProducto, setEditingProducto] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [envases, setEnvases] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [tipos, setTipos] = useState([]);
  const { sesionEmpId, userCode, sesionAlmacenId} = useAuth();
  useEffect(() => {
    const fetchEnvases = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/inventario/envases/all/' + sesionEmpId);
        const envases = response.data.map(envase => ({
          value: envase.idEnvase,
          label: envase.descripcion
        }));
        setEnvases(envases);
      } catch (error) {
        console.error('Error fetching envases:', error);
        message.error('Error fetching envases');
      }
    };
    fetchEnvases();
    const fetchTipos = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/inventario/productosTipos/all/' + sesionEmpId);
        const tipos = response.data.map(tipo => ({
          value: tipo.codigo,
          label: tipo.nombre
        }));
        setTipos(tipos);
      } catch (error) {
        console.error('Error fetching tipos:', error);
        message.error('Error fetching tipos');
      }
    };
    fetchTipos();
    const fetchUnidades = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/inventario/unidades/find-by-id-empresa/' + sesionEmpId);
        const unidades = response.data.map(unidad => ({
          value: unidad.codigo,
          label: unidad.nombre
        }));
        setUnidades(unidades);
      } catch (error) {
        console.error('Error fetching unidades:', error);
        message.error('Error fetching unidades');
      }
    };
    fetchUnidades();
  }, []);

  // Cargar datos desde el backend
  const fetchData = async (pagination, filters = {}, sorter = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:8080/api/inventario/productos/list', {
        params: {
          page: pagination.current - 1, // El backend empieza en 0
          size: pagination.pageSize,
          id: filters.id ? filters.id[0] : null,
          idEmpresa: filters.idEmpresa ? filters.idEmpresa[0] : null,
          codigo: filters.codigo ? filters.codigo[0] : null,
          nombre: filters.nombre ? filters.nombre[0] : null,
          codigoTipo: filters.codigoTipo ? filters.codigoTipo[0] : null,
          sort: sorter.field ? `${sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}` : null,
        },
      });
      setProductos(data.content);
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
      const { data } = await axios.get('http://localhost:8080/api/inventario/productos/list', {
        params: {
          page: 0,
          size: 20000,  // Ajustar según el tamaño esperado de los datos
        },
      });
      return data.content;
    } catch (error) {
      message.error('Error fetching all productos for export');
      return [];
    }
  };

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

  // Eliminar usuario
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/inventario/productos/${id}`);
      message.success('User deleted successfully');
      fetchData(pagination); // Refrescar la tabla
    } catch (error) {
      message.error('Error deleting user');
    }
  };

  // Abrir el modal de edición
  const handleEdit = (record) => {
    const tipo = tipos.find(t => t.value === record.tipo); // Mapea el tipo al valor correcto
    const envase = envases.find(e => e.value === record.envaseId); // Mapea el envase al valor correcto
    setEditingProducto(record);
    //form.setFieldsValue(record); 
    console.log(record);
    form.setFieldsValue({
      ...record,  // Mantiene los valores actuales del resto de los campos
      tipo: tipo ? tipo.value : null,  // Asigna el value del tipo encontrado
      envase: envase ? envase.value : null,  // Asigna el value del envase encontrado
    });
    setModalVisible(true);
  };
  // Abrir el modal de agregar
  const handleAdd = () => {
    setEditingProducto(null);
    form.resetFields();
    setModalVisible(true);
  };
  // Guardar cambios de edición
  const handleSave = async () => {
    try {
      // Validar los campos antes de guardar
      const values = await form.validateFields();
      //console.log(values);
      const productoRequest = {
        idProducto: editingProducto ? editingProducto.idProducto : null,  // Si estamos editando, usamos el id existente
        codigo: values.codigo,
        nombre: values.nombre,
        tipo: values.tipo,
        unidad: values.unidad,
        empresa: sesionEmpId, 
        stockAlmacenId: editingProducto ? editingProducto.stockAlmacenId : null,
        almacenId: editingProducto ? editingProducto.almacenId : sesionAlmacenId,
        envaseId: values.envase,
        empresaId: sesionEmpId,
        cantidadEnvase: values.cantidadEnvase,
        cantidadProducto: values.cantidadProducto,
        pesoTotal: values.pesoTotal,
        fechaRegistro: null, //el backend lo setea
        generarStock: values.generarStock,
        estado: values.estado,
        precioVenta: values.precioVenta,
        precioCompra: values.precioCompra,
        usuarioCreacion: userCode, 
        usuarioActualizacion: editingProducto ? userCode : null  
      };
      console.log(productoRequest);
  
      if (editingProducto) {
        // Si editingProducto tiene valor, es una edición
        await axios.patch(`http://localhost:8080/api/inventario/productos/update/${editingProducto.idProducto}`, productoRequest);
        message.success('Producto actualizado exitosamente');
      } else {
        // Si no hay producto, es un nuevo producto
        await axios.post(`http://localhost:8080/api/inventario/productos/save`, productoRequest);
        message.success('Producto creado exitosamente');
      }
  
      setModalVisible(false);
      form.resetFields();
      fetchData(pagination);  // Recargar datos de la tabla
    } catch (error) {
      if (error.name === 'ValidationError') {
        message.error('Por favor complete todos los campos requeridos');
      } else {
        message.error(editingProducto ? 'Error actualizando producto' : 'Error creando producto');
      }
    }
  };
  // Columnas de la tabla
  const columns = [
    {
      title: 'Código',
      dataIndex: 'codigo',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      sorter: true,
      filterSearch: true,
      render: (tipo) => {
        // Buscar el tipo por el ID
        const tipoProducto = tipos.find(t => t.value === tipo);
        return tipoProducto ? tipoProducto.label : 'Sin tipo';  // Mostrar el nombre o un valor por defecto
      },
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Unidad',
      dataIndex: 'unidad',
      sorter: true,
      filterSearch: true,
      render: (unidad) => {
        // Buscar el tipo por el ID
        const unidadProducto = unidades.find(u => u.value === unidad);
        return unidadProducto ? unidadProducto.label : 'Sin unidad';  // Mostrar el nombre o un valor por defecto
      },
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Envase',
      dataIndex: 'envaseId',
      sorter: true,
      filterSearch: true,
      render: (envaseId) => {
        // Buscar el envase por el ID
        const envase = envases.find(e => e.value === envaseId);
        return envase ? envase.label : 'Sin envase';  // Mostrar el nombre o un valor por defecto
      },
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Cantidad de envases',
      dataIndex: 'cantidadEnvase',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Peso',
      dataIndex: 'pesoTotal',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Generar Stock',
      dataIndex: 'generarStock',
      sorter: true,
      filterSearch: true,
      render: (generarStock) => (
        <Checkbox checked={generarStock === 'true' || generarStock === true} disabled />
      ),
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      sorter: true,
      filterSearch: true,
      render: (estado) => (
        <Checkbox checked={estado === 'true' || estado === true} disabled />
      ),
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Precio Venta',
      dataIndex: 'precioVenta',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Precio Compra',
      dataIndex: 'precioCompra',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Stock',
      dataIndex: 'cantidadProducto',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Acciones',
      fixed: 'right',
      key: 'actionDelete',
      render: (text, record) => (
        <>
          <Button onClick={() => handleEdit(record)} icon={<i className="fas fa-edit" />} />
          <Popconfirm
            title="¿Estás seguro de eliminar este producto?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button danger icon={<i className="fas fa-trash" />} />
            </Popconfirm>
        </>
      ),
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
  ];
  

  return (
    <div className="rounded-lg dark:bg-transparent bg-transparent border shadow-md p-0 z-10 h-full relative">
  
      {/* Título y botón "Nuevo" */}
      <div className="mb-2 flex justify-between border rounded-lg dark:bg-gray-800 bg-white text-gray-500 dark:text-gray-300 p-2">
        <h3 className="text-2xl font-bold">Productos</h3>
        <div className="flex flex-row justify-end">
          <Button onClick={exportToExcel} icon={<i className="fas fa-file-excel" />} className="mr-2">
            Exportar a Excel
          </Button>
          <Button onClick={exportToPDF} icon={<i className="fas fa-file-pdf" />} className="mr-2">
            Exportar a PDF
          </Button>
          <Button type="primary" icon={<i className="fas fa-plus" />} onClick={() => handleAdd()}>
            Nuevo
          </Button>
        </div>
      </div>
  
      {/* Contenedor de la tabla con overflow */}
    
        <Table
          columns={columns}
          dataSource={productos}
          pagination={pagination}
          loading={loading}
          rowKey={(record) => `${record.idProducto}-${record.stockAlmacenId}`}
          scroll={{
            x: 'max-content',
            y: 400,
          }}
          className="w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-400"
          onChange={(pagination, filters, sorter) => fetchData(pagination, filters, sorter)}
          sticky // Hace que los encabezados de la tabla se mantengan fijos
        />

  
      {/* Renderizar ProductoModal solo cuando envases y tipos están cargados */}
      {envases.length > 0 && tipos.length > 0 && (
        <ProductoModal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={handleSave}
          form={form}
          producto={editingProducto}
          envases={envases}
          tipos={tipos}
          unidades={unidades}
        />
      )}
    </div>
  );
  
};

export default UserTable;

