import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm } from 'antd';
import axios from "../../../config/axiosConfig"; 
import * as XLSX from 'xlsx';  // Para exportar a Excel
import jsPDF from 'jspdf';     // Para exportar a PDF
import 'jspdf-autotable';      // AutoTable para jsPDF


const UserTable = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [editingProducto, setEditingProducto] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

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
          size: 1000,  // Ajustar según el tamaño esperado de los datos
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

  // Abrir modal para ver/editar
  const handleEdit = (user) => {
    setEditingProducto(user);
    form.setFieldsValue(user); 
    setModalVisible(true);
  };

  // Guardar cambios de edición
  const handleSave = async () => {
    try {
      const values = form.getFieldsValue();
      await axios.put(`http://localhost:8080/api/inventario/productos/update/${editingProducto.id}`, values);
      message.success('Producto actualizado exitosamente');
      setModalVisible(false);
      fetchData(pagination);
    } catch (error) {
      message.error('Error actualizando producto');
    }
  };

  // Columnas de la tabla
  const columns = [
    {
      title: 'Empresa',
      dataIndex: ['empresa', 'razonSocial'], // Accede al campo de la razón social
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
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
      dataIndex: ['tipo', 'nombre'], // Accede al nombre del tipo
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidadProducto',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Almacén',
      dataIndex: 'almacen',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Envase',
      dataIndex: 'envase',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Precio Unitario',
      dataIndex: 'precioSugerido',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Acciones',
      fixed: 'right',
      key: 'actionEdit',
      render: (text, record) => (
        <Button onClick={() => handleEdit(record)} icon={<i className="fas fa-edit" />} />
      ),
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Acciones',
      fixed: 'right',
      key: 'actionDelete',
      render: (text, record) => (
        <Popconfirm
          title="¿Estás seguro de eliminar este producto?"
          onConfirm={() => handleDelete(record.id)}
          okText="Sí"
          cancelText="No"
        >
          <Button danger icon={<i className="fas fa-trash" />} />
        </Popconfirm>
      ),
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
  ];
  

  return (
    <div className='p-6 bg-gray-100 overflow-auto h-full relative'>
      <div className="mb-2">
        <h3 className="text-2xl font-bold">Productos</h3>
      </div>
      {/* Botones de exportación */}
      <div className="mb-2 flex flex-row justify-end">
        <Button onClick={exportToExcel} icon={<i className="fas fa-file-excel" />} className="mr-2">
          Exportar a Excel
        </Button>
        <Button onClick={exportToPDF} icon={<i className="fas fa-file-pdf" />} className="mr-2">
          Exportar a PDF
        </Button>
      </div>
      {/* Tabla de Ant Design */}
      <Table
        columns={columns}
        dataSource={productos}
        pagination={pagination}
        loading={loading}
        rowKey="id"
        scroll={{
          x: 'max-content',
        }}
        className='w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-400'
        onChange={(pagination, filters, sorter) => fetchData(pagination, filters, sorter)}
      />

      {/* Modal para ver/editar usuarios */}
      <Modal
        title="Editar Producto"
        open={modalVisible}  // Cambiar 'visible' por 'open'
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Please enter username' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="isEnabled" label="Enabled" valuePropName="checked">
            <Input type="checkbox" />
          </Form.Item>
          {/* Agregar otros campos del usuario aquí */}
        </Form>
      </Modal>
    </div>
  );
};

export default UserTable;

