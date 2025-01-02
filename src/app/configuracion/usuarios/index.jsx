import { useState, useEffect } from 'react';
import { Table, Button, message, Popconfirm, Form, Input, Tag } from 'antd';
import axios from "../../../config/axiosConfig"; 
//import { useAuth } from '../../../context/AuthContext';
import UsuarioModal from './UsuarioModal';  // Importar el nuevo componente de modal

const TablaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  //const { sesionEmpId, userCode } = useAuth();
  const [form] = Form.useForm();
  const [roles, setRoles] = useState([]);

    const fetchRoles = async () => {
      try{
        const response = await axios.get(`http://localhost:8080/auth/roles/list`);
        const roles = response.data.map(role => ({
          label: role.roleEnum,
          value: role.id
      }));
        setRoles(roles);
      } catch (error) {
        message.error('Error fetching roles');
      }
    };
  const fetchData = async (pagination, filters = {}, sorter = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:8080/auth/list`, {
        params: {
          page: pagination.current - 1,
          size: pagination.pageSize,
          id: filters.id ? filters.id[0] : null,
          username: filters.username ? filters.username[0] : null,
          isEnabled: filters.isEnabled ? filters.isEnabled[0] : null,
          sort: sorter.field ? `${sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}` : null,
        },
      });
      setUsuarios(data.content);
      setPagination({
        current: data.number + 1,
        pageSize: data.size,
        total: data.totalElements,
      });
    } catch (error) {
      message.error('Error fetching usuarios');
    } finally {
      setLoading(false);
    }
  };
  // Esto asegura que solo se haga una llamada inicial para cargar los datos.
  useEffect(() => {
    fetchData(pagination);
  }, [pagination.current, pagination.pageSize]); // Dependencias específicas para evitar llamadas duplicadas
  //fetch roles
  useEffect(() => {
    fetchRoles();
  }, []);

  
  // Eliminar usuario
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/auth/users/delete/${id}`);
      message.success('Usuario eliminado exitosamente');
      fetchData(pagination); // Refrescar la tabla
    } catch (error) {
      message.error('Error eliminando usuario');
    }
  };
  
  // Abrir el modal de edición
  const handleEdit = (record) => {
    setEditingUsuario(record);
    setModalVisible(true);
  };
  
  // Abrir el modal de agregar
  const handleAdd = () => {
    setEditingUsuario(null);
    form.resetFields();
    setModalVisible(true);
  };
  
  // Guardar cambios en el modal
  const handleSave = async (values) => {
    try {
      const usuarioRequest = {
        id: editingUsuario ? editingUsuario.id : null,
        usercodigo: values.codigo,
        username: values.nombre,
        password: values.password,
        rolesRequest: {
          roleListName: [roles.find(role => role.value === values.rol).label]
        }
      };
      
      if (editingUsuario) {
        await axios.patch(`http://localhost:8080/auth/users/update/${editingUsuario.id}`, usuarioRequest);
        message.success('Usuario actualizado exitosamente');
      } else {
        await axios.post(`http://localhost:8080/auth/users/save`, usuarioRequest);
        message.success('Usuario creado exitosamente');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchData(pagination);
    } catch (error) {
      if (error.response && error.response.status === 500) {
        const errorMessage = error.response.data;
        if (errorMessage.includes("llave duplicada") && errorMessage.includes("usuarios_id_empresa_codigo_key")) {
          message.error("El código de usuario ya existe para esta empresa. Por favor, elija otro código.");
        } else {
          message.error(editingUsuario ? 'Error actualizando usuario' : 'Error creando usuario');
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
      title: 'Codigo',
      dataIndex: 'usercodigo',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Buscar código"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => {
              confirm();
              handleSearch(selectedKeys[0], 'usercodigo');
            }}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="link"
            onClick={() => {
              clearFilters && clearFilters();
              setSelectedKeys([]);
              handleSearch('', 'usercodigo');
              confirm();
            }}
            icon={<i className="fas fa-eraser" />}
            style={{ padding: 0 }}
          >
            Limpiar
          </Button>
        </div>
      )
    },
    {
      title: 'Usuario',
      dataIndex: 'username',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Buscar descripción"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => {
              confirm();
              handleSearch(selectedKeys[0], 'username');
            }}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="link"
            onClick={() => {
              clearFilters && clearFilters();
              setSelectedKeys([]);
              handleSearch('', 'username');
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
      title: 'Activo',
      dataIndex: 'isEnabled',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
      render: (isEnabled) => (isEnabled ? "Sí" : "No")
    },
    {
      title: 'Rol',
      dataIndex: 'roles',
      sorter: true,
      filterSearch: true,
      render: (roles) => (
        <>
          {roles.map((role) => (
            <Tag color={role.roleEnum === 'ADMIN' ? 'blue' : 'green'} key={role.id}>
              {role.roleEnum}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Acciones',
      fixed: 'right',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button onClick={() => handleEdit(record)} icon={<i className="fas fa-edit" />} />
          <Popconfirm
            title="¿Estás seguro de eliminar este usuario?"
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
        <h3 className="text-2xl font-bold">Usuarios</h3>
        <Button type="primary" icon={<i className="fas fa-plus" />} onClick={() => handleAdd()}>
          Nuevo
        </Button>
      </div>
  
      {/* Contenedor de la tabla con overflow */}
      
      <Table
        columns={columns}
        dataSource={usuarios}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: usuarios.length,
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
      {roles.length > 0 && (
        <UsuarioModal
          visible={modalVisible}
          form={form}
          onClose={() => setModalVisible(false)}
          onSave={handleSave}
          usuario={editingUsuario}
          roles={roles}  // Pass roles to modal
        />
      )}
    </div>
  );
  
};

export default TablaUsuarios;
