import { useState, useEffect } from 'react';
import { Table, Button, message, Popconfirm, Form, Input } from 'antd';
import axios from "../../../config/axiosConfig"; 
import { useAuth } from '../../../context/AuthContext';
import ModalEmpresas from './ModalEmpresas';

const TablaEmpresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [editingEmpresa, setEditingEmpresa] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { sesionEmpId, userCode } = useAuth();
  const [form] = Form.useForm();
  
  
  const fetchData = async (pagination, filters = {}, sorter = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:8080/api/empresas/findAll/${sesionEmpId}`, {
        params: {
          page: pagination.current - 1,
          size: pagination.pageSize,
          razonSocial: filters.razonSocial ? filters.razonSocial[0] : null,
          empresaCodigo: filters.empresaCodigo ? filters.empresaCodigo[0] : null,
          ruc: filters.ruc ? filters.ruc[0] : null,
          direccion: filters.direccion ? filters.direccion[0] : null,
          departamento: filters.departamento ? filters.departamento[0] : null,
          provincia: filters.provincia ? filters.provincia[0] : null,
          distrito: filters.distrito ? filters.distrito[0] : null,
          ubigeo: filters.ubigeo ? filters.ubigeo[0] : null,
          telefono: filters.telefono ? filters.telefono[0] : null,
          celular: filters.celular ? filters.celular[0] : null,
          correo: filters.correo ? filters.correo[0] : null,
          web: filters.web ? filters.web[0] : null,
          logo: filters.logo ? filters.logo[0] : null,
          estado: filters.estado ? filters.estado[0] : null,
          sort: sorter.field ? `${sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}` : null,
        },
      });
      setEmpresas(data.content);
      setPagination({
        current: data.number + 1,
        pageSize: data.size,
        total: data.totalElements,
      });
    } catch (error) {
      message.error('Error fetching empresas');
    } finally {
      setLoading(false);
    }
  };
  // Esto asegura que solo se haga una llamada inicial para cargar los datos.
  useEffect(() => {
    fetchData(pagination);
  }, [pagination.current, pagination.pageSize]); // Dependencias específicas para evitar llamadas duplicadas
  
  // Eliminar moneda
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/empresas/delete/${id}`);
      message.success('Empresa eliminada exitosamente');
      fetchData(pagination); // Refrescar la tabla
    } catch (error) {
      message.error('Error eliminando empresa');
    }
  };
  
  // Abrir el modal de edición
  const handleEdit = (record) => {
    setEditingEmpresa(record);
    setModalVisible(true);
  };
  
  // Abrir el modal de agregar
  const handleAdd = () => {
    setEditingEmpresa(null);
    form.resetFields();
    setModalVisible(true);
  };
  
  // Guardar cambios en el modal
  const handleSave = async (values) => {
    try {
      const empresaRequest = {
        id: editingEmpresa ? editingEmpresa.id : null,
        razonSocial: values.razonSocial,
        empresaCodigo: values.empresaCodigo,
        ruc: values.ruc,
        direccion: values.direccion,
        departamento: values.departamento,
        provincia: values.provincia,
        distrito: values.distrito,
        ubigeo: values.ubigeo,
        telefono: values.telefono,
        celular: values.celular,
        correo: values.correo,
        web: values.web,
        logo: values.logo,
        estado: values.estado,
        idEmpresa: sesionEmpId,
        usuarioCreacion: userCode,
        usuarioActualizacion: editingEmpresa ? userCode : null
      };
      
      if (editingEmpresa) {
        await axios.patch(`http://localhost:8080/api/empresas/update/${editingEmpresa.id}`, empresaRequest);
        message.success('Empresa actualizada exitosamente');
      } else {
        await axios.post(`http://localhost:8080/api/empresas/save`, empresaRequest);
        message.success('Empresa creada exitosamente');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchData(pagination);
    } catch (error) {
      if (error.response && error.response.status === 500) {
        const errorMessage = error.response.data;
        if (errorMessage.includes("llave duplicada") && errorMessage.includes("empresas_id_empresa_codigo_key")) {
            message.error("El código de empresa ya existe. Por favor, elija otro código.");
        } else {
            message.error(editingEmpresa ? 'Error actualizando empresa' : 'Error creando empresa');
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
      title: 'Código',
      dataIndex: 'empresaCodigo',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
      filterDropdown: ({
        setSelectedKeys, selectedKeys, confirm, clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Buscar código"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => {
              confirm();
              handleSearch(selectedKeys[0], 'empresaCodigo');
            }}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="link"
            onClick={() => {
              clearFilters && clearFilters();
              setSelectedKeys([]); // Limpia el estado del filtro
              handleSearch('', 'empresaCodigo'); // Recarga los datos sin filtro
              confirm(); // Cierra el filtro
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
      title: 'Razón Social',
      dataIndex: 'razonSocial',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
      filterDropdown: ({
        setSelectedKeys, selectedKeys, confirm, clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Buscar razón social"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => {
              confirm();
              handleSearch(selectedKeys[0], 'razonSocial');
            }}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="link"
            onClick={() => {
              clearFilters && clearFilters();
              setSelectedKeys([]); // Limpia el estado del filtro
              // Limpiar el filtro y recargar la tabla con los datos sin filtro
              handleSearch('', 'razonSocial'); // Pasamos un valor vacío para cargar todos los datos
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
        title: 'Documento',
        dataIndex: 'ruc',
        sorter: true,
        filterSearch: true,
        className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
        filterDropdown: ({
          setSelectedKeys, selectedKeys, confirm, clearFilters,
        }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Buscar documento"
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => {
                confirm();
                handleSearch(selectedKeys[0], 'ruc');
              }}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <Button
              type="link"
              onClick={() => {
                clearFilters && clearFilters();
                setSelectedKeys([]); // Limpia el estado del filtro
                // Limpiar el filtro y recargar la tabla con los datos sin filtro
                handleSearch('', 'ruc'); // Pasamos un valor vacío para cargar todos los datos
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
                // Limpiar el filtro y recargar la tabla con los datos sin filtro
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
        title: 'Departamento',
        dataIndex: 'departamento',
        sorter: true,
        filterSearch: true,
        className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
        filterDropdown: ({
          setSelectedKeys, selectedKeys, confirm, clearFilters,
        }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Buscar departamento"
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => {
                confirm();
                handleSearch(selectedKeys[0], 'departamento');
              }}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <Button
              type="link"
              onClick={() => {
                clearFilters && clearFilters();
                setSelectedKeys([]); // Limpia el estado del filtro
                // Limpiar el filtro y recargar la tabla con los datos sin filtro
                handleSearch('', 'departamento'); // Pasamos un valor vacío para cargar todos los datos
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
        title: 'Provincia',
        dataIndex: 'provincia',
        sorter: true,
        filterSearch: true,
        className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
        filterDropdown: ({
          setSelectedKeys, selectedKeys, confirm, clearFilters,
        }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Buscar provincia"
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => {
                confirm();
                handleSearch(selectedKeys[0], 'provincia');
              }}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <Button
              type="link"
              onClick={() => {
                clearFilters && clearFilters();
                setSelectedKeys([]); // Limpia el estado del filtro
                // Limpiar el filtro y recargar la tabla con los datos sin filtro
                handleSearch('', 'provincia'); // Pasamos un valor vacío para cargar todos los datos
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
        title: 'Distrito',
        dataIndex: 'distrito',
        sorter: true,
        filterSearch: true,
        className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
        filterDropdown: ({
          setSelectedKeys, selectedKeys, confirm, clearFilters,
        }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Buscar distrito"
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => {
                confirm();
                handleSearch(selectedKeys[0], 'distrito');
              }}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <Button
              type="link"
              onClick={() => {
                clearFilters && clearFilters();
                setSelectedKeys([]); // Limpia el estado del filtro
                // Limpiar el filtro y recargar la tabla con los datos sin filtro
                handleSearch('', 'distrito'); // Pasamos un valor vacío para cargar todos los datos
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
        title: 'Ubigeo',
        dataIndex: 'ubigeo',
        sorter: true,
        filterSearch: true,
        className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
        filterDropdown: ({
          setSelectedKeys, selectedKeys, confirm, clearFilters,
        }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Buscar ubigeo"
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => {
                confirm();
                handleSearch(selectedKeys[0], 'ubigeo');
              }}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <Button
              type="link"
              onClick={() => {
                clearFilters && clearFilters();
                setSelectedKeys([]); // Limpia el estado del filtro
                // Limpiar el filtro y recargar la tabla con los datos sin filtro
                handleSearch('', 'ubigeo'); // Pasamos un valor vacío para cargar todos los datos
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
        title: 'Telefono',
        dataIndex: 'telefono',
        sorter: true,
        filterSearch: true,
        className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
        filterDropdown: ({
          setSelectedKeys, selectedKeys, confirm, clearFilters,
        }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Buscar telefono"
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => {
                confirm();
                handleSearch(selectedKeys[0], 'telefono');
              }}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <Button
              type="link"
              onClick={() => {
                clearFilters && clearFilters();
                setSelectedKeys([]); // Limpia el estado del filtro
                // Limpiar el filtro y recargar la tabla con los datos sin filtro
                handleSearch('', 'telefono'); // Pasamos un valor vacío para cargar todos los datos
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
        title: 'Celular',
        dataIndex: 'celular',
        sorter: true,
        filterSearch: true,
        className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
        filterDropdown: ({
          setSelectedKeys, selectedKeys, confirm, clearFilters,
        }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Buscar celular"
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => {
                confirm();
                handleSearch(selectedKeys[0], 'celular');
              }}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <Button
              type="link"
              onClick={() => {
                clearFilters && clearFilters();
                setSelectedKeys([]); // Limpia el estado del filtro
                // Limpiar el filtro y recargar la tabla con los datos sin filtro
                handleSearch('', 'celular'); // Pasamos un valor vacío para cargar todos los datos
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
        title: 'Correo',
        dataIndex: 'correo',
        sorter: true,
        filterSearch: true,
        className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
        filterDropdown: ({
          setSelectedKeys, selectedKeys, confirm, clearFilters,
        }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Buscar correo"
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => {
                confirm();
                handleSearch(selectedKeys[0], 'correo');
              }}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <Button
              type="link"
              onClick={() => {
                clearFilters && clearFilters();
                setSelectedKeys([]); // Limpia el estado del filtro
                // Limpiar el filtro y recargar la tabla con los datos sin filtro
                handleSearch('', 'correo'); // Pasamos un valor vacío para cargar todos los datos
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
        title: 'Web',
        dataIndex: 'web',
        sorter: true,
        filterSearch: true,
        className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
        filterDropdown: ({
          setSelectedKeys, selectedKeys, confirm, clearFilters,
        }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Buscar web"
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => {
                confirm();
                handleSearch(selectedKeys[0], 'web');
              }}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <Button
              type="link"
              onClick={() => {
                clearFilters && clearFilters();
                setSelectedKeys([]); // Limpia el estado del filtro
                // Limpiar el filtro y recargar la tabla con los datos sin filtro
                handleSearch('', 'web'); // Pasamos un valor vacío para cargar todos los datos
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
        title: 'Estado',
        dataIndex: 'estado',
        sorter: true,
        filterSearch: true,
        className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
        filterDropdown: ({
          setSelectedKeys, selectedKeys, confirm, clearFilters,
        }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Buscar estado"
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => {
                confirm();
                handleSearch(selectedKeys[0], 'estado');
              }}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <Button
              type="link"
              onClick={() => {
                clearFilters && clearFilters();
                setSelectedKeys([]); // Limpia el estado del filtro
                // Limpiar el filtro y recargar la tabla con los datos sin filtro
                handleSearch('', 'estado'); // Pasamos un valor vacío para cargar todos los datos
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
      title: 'Acciones',
      fixed: 'right',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button onClick={() => handleEdit(record)} icon={<i className="fas fa-edit" />} />
          <Popconfirm
            title="¿Estás seguro de eliminar esta empresa?"
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
        <h3 className="text-2xl font-bold">Empresas</h3>
        <Button type="primary" icon={<i className="fas fa-plus" />} onClick={() => handleAdd()}>
          Nuevo
        </Button>
      </div>
  
      {/* Contenedor de la tabla con overflow */}
      
      <Table
        columns={columns}
        dataSource={empresas}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: empresas.length,
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
        <ModalEmpresas
        visible={modalVisible}
        form={form}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        empresa={editingEmpresa}
      />
    </div>
  );
  
};

export default TablaEmpresas;
