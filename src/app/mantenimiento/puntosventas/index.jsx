import { useState, useEffect } from 'react';
import { Table, Button, message, Popconfirm, Form, Input, Tag } from 'antd';
import axios from "../../../config/axiosConfig"; 
import { useAuth } from '../../../context/AuthContext';
import ModalPuntoVenta from './ModalPuntoVenta';

const TablaPuntosVentas = () => {
  const [puntosVentas, setPuntosVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [editingPuntoVenta, setEditingPuntoVenta] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { sesionEmpId, userCode } = useAuth();
  const [almacenes, setAlmacenes] = useState([]);
  const [form] = Form.useForm();
  
  const fetchData = async (pagination, filters = {}, sorter = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:8080/api/inventario/punto-venta/findAll/${sesionEmpId}`, {
        params: {
          page: pagination.current - 1,
          size: pagination.pageSize,
          direccion: filters.direccion ? filters.direccion[0] : null,
          nombre: filters.nombre ? filters.nombre[0] : null,
          sort: sorter.field ? `${sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}` : null,
        },
      });
      setPuntosVentas(data.content);
      setPagination({
        current: data.number + 1,
        pageSize: data.size,
        total: data.totalElements,
      });
    } catch (error) {
      message.error('Error fetching puntos de venta');
    } finally {
      setLoading(false);
    }
  };
  // Esto asegura que solo se haga una llamada inicial para cargar los datos.
  useEffect(() => {
    fetchData(pagination);
  }, [pagination.current, pagination.pageSize]); // Dependencias específicas para evitar llamadas duplicadas
  
  useEffect(() => {
    const fetchAlmacenes = async () => {
      const response = await axios.get(`http://localhost:8080/api/inventario/almacenes/findByEmpresa/${sesionEmpId}`);
      const almacenes = response.data.map(almacen => ({
        value: almacen.id,
        label: almacen.nombre
      }));
      setAlmacenes(almacenes);
    };
    fetchAlmacenes();
  }, []);
  
  // Eliminar punto de venta
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/inventario/punto-venta/delete/${id}`);
      message.success('Punto de venta eliminado exitosamente');
      fetchData(pagination); // Refrescar la tabla
    } catch (error) {
      message.error('Error eliminando punto de venta');
    }
  };
  
  // Abrir el modal de edición
  const handleEdit = (record) => {
    setEditingPuntoVenta(record);
    setModalVisible(true);
  };
  
  // Abrir el modal de agregar
  const handleAdd = () => {
    setEditingPuntoVenta(null);
    form.resetFields();
    setModalVisible(true);
  };
  
  // Guardar cambios en el modal
  const handleSave = async (values) => {
    try {
      const puntoVentaRequest = {
        id: editingPuntoVenta ? editingPuntoVenta.id : null,
        nombre: values.nombre,
        direccion: values.direccion,
        idEmpresa: sesionEmpId,
        almacen: values.almacen,
        usuarioCreacion: userCode,
        usuarioActualizacion: editingPuntoVenta ? userCode : null
      };
      
      if (editingPuntoVenta) {
        await axios.patch(`http://localhost:8080/api/inventario/punto-venta/update/${editingPuntoVenta.id}`, puntoVentaRequest);
        message.success('Punto de venta actualizado exitosamente');
      } else {
        await axios.post(`http://localhost:8080/api/inventario/punto-venta/save`, puntoVentaRequest);
        message.success('Punto de venta creado exitosamente');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchData(pagination);
    } catch (error) {
      if (error.response && error.response.status === 500) {
        const errorMessage = error.response.data;
        if (errorMessage.includes("llave duplicada") && errorMessage.includes("monedas_id_empresa_codigo_key")) {
          message.error("El código de moneda ya existe para esta empresa. Por favor, elija otro código.");
        } else {
            message.error(editingPuntoVenta ? 'Error actualizando punto de venta' : 'Error creando punto de venta');
        }
      } else {
        message.error('Error de conexión o problema desconocido');
      }
    }
  };
  const handleSearch = (value, key) => {
    const filters = {};
    if (value) {
      filters[key] = value;
    }
    fetchData(pagination, filters);
  };
  
  // Columnas de la tabla
  const columns = [
    {
      title: 'Descripción',
      dataIndex: 'nombre',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
      filterDropdown: ({
        setSelectedKeys, selectedKeys, confirm, clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Buscar descripción"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => {
              confirm();
              handleSearch(selectedKeys[0], 'nombre');
            }}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="link"
            onClick={() => {
              clearFilters && clearFilters();
              setSelectedKeys([]); // Limpia el estado del filtro
              // Limpiar el filtro y recargar la tabla con los datos sin filtro
              handleSearch('', 'nombre'); // Pasamos un valor vacío para cargar todos los datos
              confirm();
            }}
            icon={<i className="fas fa-eraser" />}
            style={{ padding: 0 }}
          >
            Limpiar
          </Button>
        </div>
      ),
    },
    {
      title: 'Dirección',
      dataIndex: 'direccion',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
      filterDropdown: ({
        setSelectedKeys, selectedKeys, confirm, clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Buscar dirección"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => {
              confirm();
              handleSearch(selectedKeys[0], 'direccion');
            }}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="link"
              onClick={() => {
                clearFilters && clearFilters();
                setSelectedKeys([]); // Limpia el estado del filtro
                handleSearch('', 'direccion'); // Pasamos un valor vacío para cargar todos los datos
                confirm();
              }}
              icon={<i className="fas fa-eraser" />}
              style={{ padding: 0 }}
            >
              Limpiar
          </Button>
        </div>
      ),
    },
    {
        title: 'Almacén',
        dataIndex: 'almacen',
        sorter: true,
        filterSearch: true,
        render: (almacen) => {
            const almacenE = almacenes.find(a => a.value === almacen);
            return <Tag color="default">{almacenE.label}</Tag>;
        },
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
            title="¿Estás seguro de eliminar este punto de venta?"
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
        <h3 className="text-2xl font-bold">Puntos de venta</h3>
        <Button type="primary" icon={<i className="fas fa-plus" />} onClick={() => handleAdd()}>
          Nuevo
        </Button>
      </div>
  
      {/* Contenedor de la tabla con overflow */}
      
      <Table
        columns={columns}
        dataSource={puntosVentas}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: puntosVentas.length,
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
      {/* Modal para Punto de venta */}
      {almacenes.length > 0 && (
        <ModalPuntoVenta
          visible={modalVisible}
          form={form}
          onClose={() => setModalVisible(false)}
          onSave={handleSave}
          puntoVenta={editingPuntoVenta}
          almacenes={almacenes}
        />
      )}
    </div>
  );
  
};

export default TablaPuntosVentas;
