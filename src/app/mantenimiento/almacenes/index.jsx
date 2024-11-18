import { useState, useEffect } from 'react';
import { Table, Button, message, Popconfirm, Form} from 'antd';
import axios from "../../../config/axiosConfig"; 
import { useAuth } from '../../../context/AuthContext';
import ModalAlmacen from './ModalAlmacenes';

const Almacenes = () => {
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [editingAlmacen, setEditingAlmacen] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { sesionEmpId, userCode } = useAuth();
  const [form] = Form.useForm();
  const [almacenesTipos, setAlmacenesTipos] = useState([]);

  const fetchData = async (pagination, sorter = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:8080/api/inventario/almacenes/findAll/${sesionEmpId}`, {
        params: {
          page: pagination.current - 1,
          size: pagination.pageSize,
          sort: sorter.field ? `${sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}` : null,
        },
      });
      setAlmacenes(data.content);
      setPagination({
        current: data.number + 1,
        pageSize: data.size,
        total: data.totalElements,
      });
    } catch (error) {
      message.error('Error fetching almacenes');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchAlmacenesTipos = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/inventario/almacenes/findTipos/' + sesionEmpId);
        const tipos = response.data.map(tipo => ({
          value: tipo.codigo,
          label: tipo.descripcion
        }));
        setAlmacenesTipos(tipos);
      } catch (error) {
        console.error('Error fetching almacenes tipos:', error);
        message.error('Error fetching almacenes tipos');
      }
    };
    fetchAlmacenesTipos();
  }, []);
  // Esto asegura que solo se haga una llamada inicial para cargar los datos.
  useEffect(() => {
    fetchData(pagination);
  }, [pagination.current, pagination.pageSize]); // Dependencias específicas para evitar llamadas duplicadas
  
  // Eliminar almacen
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/inventario/almacenes/delete/${id}`);
      message.success('Almacén eliminado exitosamente');
      fetchData(pagination); // Refrescar la tabla
    } catch (error) {
      message.error('Error eliminando almacén');
    }
  };
  
  // Abrir el modal de edición
  const handleEdit = (record) => {
    setEditingAlmacen(record);
    setModalVisible(true);
  };
  
  // Abrir el modal de agregar
  const handleAdd = () => {
    setEditingAlmacen(null);
    form.resetFields();
    setModalVisible(true);
  };
  
  // Guardar cambios en el modal
  const handleSave = async (values) => {
    try {
      const almacenRequest = {
        id: editingAlmacen ? editingAlmacen.id : null,
        codigo: values.codigo,
        nombre: values.nombre,
        simbolo: values.simbolo,
        idEmpresa: sesionEmpId,
        usuarioCreacion: userCode,
        usuarioActualizacion: editingAlmacen ? userCode : null
      };
      
      if (editingAlmacen) {
        await axios.patch(`http://localhost:8080/api/inventario/almacenes/update/${editingAlmacen.id}`, almacenRequest);
        message.success('Almacén actualizado exitosamente');
      } else {
        await axios.post(`http://localhost:8080/api/inventario/almacenes/save`, almacenRequest);
        message.success('Almacén creado exitosamente');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchData(pagination);
    } catch (error) {
      if (error.response && error.response.status === 500) {
        const errorMessage = error.response.data;
        if (errorMessage.includes("llave duplicada") || errorMessage.includes("almacenes_id_empresa_codigo_key")) {
          message.error("El código de almacén ya existe para esta empresa. Por favor, elija otro código.");
        } else {
          message.error(editingAlmacen ? 'Error actualizando almacén' : 'Error creando almacén');
        }
      } else {
        message.error('Error de conexión o problema desconocido');
      }
    }
  };
  const columns = [
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Descripción',
      dataIndex: 'nombre',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Padre',
      dataIndex: 'simbolo',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Acciones',
      fixed: 'right',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button onClick={() => handleEdit(record)} icon={<i className="fas fa-edit" />} />
          <Popconfirm
            title="¿Estás seguro de eliminar esta moneda?"
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
        <h3 className="text-2xl font-bold">Almacenes</h3>
        <Button type="primary" icon={<i className="fas fa-plus" />} onClick={() => handleAdd()}>
          Nuevo
        </Button>
      </div>
  
      {/* Contenedor de la tabla con overflow */}
      
      <Table
        columns={columns}
        dataSource={almacenes}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: almacenes.length,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, pageSize) => {
            setPagination({
              current: page,
              pageSize: pageSize,
            });
          },
        }}
        loading={loading}
        rowKey="id"
        scroll={{
          x: 'max-content',
          y: 400,
        }}
        className="w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-400"
        onChange={(pagination, filters, sorter) => fetchData(pagination, filters, sorter)}
        sticky
      />
      {/* Modal para Moneda */}
      {almacenesTipos.length > 0 && (
        <ModalAlmacen
          visible={modalVisible}
          form={form}
          onClose={() => setModalVisible(false)}
          onSave={handleSave}
          almacen={editingAlmacen}
          tipos={almacenesTipos}
        />
      )}
    </div>
  )
}

export default Almacenes;
