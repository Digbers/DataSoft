import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm } from 'antd';
import axios from "../../config/axiosConfig"; 

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [editingUser, setEditingUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Cargar datos desde el backend
  const fetchData = async (pagination, filters = {}, sorter = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:8080/auth/list', {
        params: {
          page: pagination.current - 1, // El backend empieza en 0
          size: pagination.pageSize,
          id: filters.id ? filters.id[0] : null,
          username: filters.username ? filters.username[0] : null,
          isEnabled: filters.isEnabled ? filters.isEnabled[0] : null,
          sort: sorter.field ? `${sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}` : null,
        },
      });
      setUsers(data.content);
      setPagination({
        current: data.number + 1,
        pageSize: data.size,
        total: data.totalElements,
      });
    } catch (error) {
      message.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination);
  }, []);

  // Eliminar usuario
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/auth/users/delete/${id}`);
      message.success('User deleted successfully');
      fetchData(pagination); // Refrescar la tabla
    } catch (error) {
      message.error('Error deleting user');
    }
  };

  // Abrir modal para ver/editar
  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user); // Rellenar el formulario con los datos del usuario
    setModalVisible(true);
  };

  // Guardar cambios de edición
  const handleSave = async () => {
    try {
      const values = form.getFieldsValue();
      await axios.put(`http://localhost:8080/auth/users/update/${editingUser.id}`, values);
      message.success('User updated successfully');
      setModalVisible(false);
      fetchData(pagination);
    } catch (error) {
      message.error('Error updating user');
    }
  };

  // Columnas de la tabla
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      sorter: true,
      className: 'text-gray-500 dark:text-gray-400 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      sorter: true,
      filterSearch: true,
      filters: users.map((user) => ({ text: user.username, value: user.username })),
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Enabled',
      dataIndex: 'isEnabled',
      sorter: true,
      filters: [
        { text: 'Enabled', value: true },
        { text: 'Disabled', value: false },
      ],
      render: (isEnabled) => (isEnabled ? 'Yes' : 'No'),
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Actions',
      render: (text, record) => (
        <>
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger style={{ marginLeft: 8 }}>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
  ];

  return (
    <>
      {/* Tabla de Ant Design */}
      <Table
        columns={columns}
        dataSource={users}
        pagination={pagination}
        loading={loading}
        rowKey="id"
        className='w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-400'
        onChange={(pagination, filters, sorter) => fetchData(pagination, filters, sorter)}
      />

      {/* Modal para ver/editar usuarios */}
      <Modal
        title="Edit User"
        visible={modalVisible}
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
    </>
  );
};

export default UserTable;

