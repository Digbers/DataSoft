import { useState, useEffect } from 'react';
import { Table, Button, message, Popconfirm, Form, Input, Tag, Checkbox } from 'antd';
import axios from "../../../config/axiosConfig"; 
import { useAuth } from '../../../context/AuthContext';
import ModalEnvaces from './ModalEnvaces';  // Importar el nuevo componente de modal

const TablaEnvaces = () => {
  const [envaces, setEnvaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [editingEnvace, setEditingEnvace] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { sesionEmpId, userCode } = useAuth();
  const [form] = Form.useForm();
  const [almacenes, setAlmacenes] = useState([]);
  
  const tiposEnvases = [{value: 'TINA', label: 'TINA'}, {value: 'JAVA', label: 'JAVA'}, {value: 'NA', label: 'NA'}];

  const fetchData = async (pagination, filters = {}, sorter = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:8080/api/inventario/envases/findAll/${sesionEmpId}`, {
        params: {
          page: pagination.current - 1,
          size: pagination.pageSize,
          tipoEnvase: filters.tipoEnvase ? filters.tipoEnvase[0] : null,
          descripcion: filters.descripcion ? filters.descripcion[0] : null,
          capacidad: filters.capacidad ? filters.capacidad[0] : null,
          pesoReferencia: filters.pesoReferencia ? filters.pesoReferencia[0] : null,
          estado: filters.estado ? filters.estado[0] : null,
          sort: sorter.field ? `${sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}` : null,
        },
      });
      setEnvaces(data.content);
      setPagination({
        current: data.number + 1,
        pageSize: data.size,
        total: data.totalElements,
      });
    } catch (error) {
      message.error('Error fetching envaces');
    } finally {
      setLoading(false);
    }
  };
  // Esto asegura que solo se haga una llamada inicial para cargar los datos.
  useEffect(() => {
    fetchData(pagination);
  }, [pagination.current, pagination.pageSize]); // Dependencias específicas para evitar llamadas duplicadas
  useEffect(() => {
    fetchAlmacenes();
  }, []);

  const fetchAlmacenes = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/inventario/almacenes/find/empresa/' + sesionEmpId);
      const almacenes = response.data.map(almacen => ({
        value: almacen.id,
        label: almacen.nombre
      }));
      setAlmacenes(almacenes);
    } catch (error) {
      console.error('Error fetching almacenes padres:', error);
      message.error('Error fetching almacenes padres');
    }
  };
  
  
  // Eliminar moneda
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/inventario/envases/delete/${id}`);
      message.success('Envace eliminado exitosamente');
      fetchData(pagination); // Refrescar la tabla
    } catch (error) {
      message.error('Error eliminando envace');
    }
  };
  
  // Abrir el modal de edición
  const handleEdit = (record) => {
    setEditingEnvace(record);
    setModalVisible(true);
  };
  
  // Abrir el modal de agregar
  const handleAdd = () => {
    setEditingEnvace(null);
    form.resetFields();
    setModalVisible(true);
  };
  
  // Guardar cambios en el modal
  const handleSave = async (values) => {
    try {
      const envaceRequest = {
        idEnvase: editingEnvace ? editingEnvace.idEnvase : null,
        tipoEnvase: values.tipoEnvase,
        descripcion: values.descripcion,
        capacidad: values.capacidad,
        pesoReferencia: values.pesoReferencia,
        estado: values.estado,
        idEmpresa: sesionEmpId,
        usuarioCreacion: userCode,
        usuarioActualizacion: editingEnvace ? userCode : null
      };
      
      if (editingEnvace) {
        await axios.patch(`http://localhost:8080/api/inventario/envases/update/${editingEnvace.idEnvase}`, envaceRequest);
        message.success('Envace actualizado exitosamente');
      } else {
        await axios.post(`http://localhost:8080/api/inventario/envases/save`, envaceRequest);
        message.success('Envace creado exitosamente');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchData(pagination);
    } catch (error) {
      if (error.response && error.response.status === 500) {
        const errorMessage = error.response.data;
        if (errorMessage.includes("llave duplicada") && errorMessage.includes("envases_id_empresa_codigo_key")) {
          message.error("El código de envace ya existe para esta empresa. Por favor, elija otro código.");
        } else {
          message.error(editingEnvace ? 'Error actualizando envace' : 'Error creando envace');
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
      title: 'Tipo de envase',
      dataIndex: 'tipoEnvase',
      sorter: true,
      filterSearch: true,
      render: (record) => {
        const tipo = tiposEnvases.find(tipo => tipo.value === record);
        if(tipo.value === 'NA') {
          return <Tag color="yellow">{tipo.label}</Tag>;
        }else if(tipo.value === 'JAVA') {
          return <Tag color="warning">{tipo.label}</Tag>;
        }else if(tipo.value === 'TINA') {
          return <Tag color="success">{tipo.label}</Tag>;
        } else {
          return <Tag color="default">{tipo.label}</Tag>;
        }
      },
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
      filterDropdown: ({
        setSelectedKeys, selectedKeys, confirm, clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Buscar tipo de envase"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => {
              confirm();
              handleSearch(selectedKeys[0], 'tipoEnvase');
            }}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="link"
            onClick={() => {
              clearFilters && clearFilters();
              setSelectedKeys([]); // Limpia el estado del filtro
              handleSearch('', 'tipoEnvase'); // Recarga los datos sin filtro
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
      title: 'Descripción',
      dataIndex: 'descripcion',
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
              handleSearch(selectedKeys[0], 'descripcion');
            }}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="link"
            onClick={() => {
              clearFilters && clearFilters();
              setSelectedKeys([]); // Limpia el estado del filtro
              // Limpiar el filtro y recargar la tabla con los datos sin filtro
                handleSearch('', 'descripcion'); // Pasamos un valor vacío para cargar todos los datos
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
      title: 'Capacidad',
      dataIndex: 'capacidad',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
      filterDropdown: ({
        setSelectedKeys, selectedKeys, confirm, clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Buscar capacidad"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => {
              confirm();
              handleSearch(selectedKeys[0], 'capacidad');
            }}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="link"
              onClick={() => {
                clearFilters && clearFilters();
                setSelectedKeys([]); // Limpia el estado del filtro
                handleSearch('', 'capacidad'); // Pasamos un valor vacío para cargar todos los datos
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
        title: 'Peso referencia',
        dataIndex: 'pesoReferencia',
        sorter: true,
        filterSearch: true,
        className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
        filterDropdown: ({
          setSelectedKeys, selectedKeys, confirm, clearFilters,
        }) => (
          <div style={{ padding: 8 }}>
            <Input
                placeholder="Buscar peso referencia"
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => {
                confirm();
                handleSearch(selectedKeys[0], 'pesoReferencia');
              }}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <Button
              type="link"
                onClick={() => {
                  clearFilters && clearFilters();
                  setSelectedKeys([]); // Limpia el estado del filtro
                  handleSearch('', 'pesoReferencia'); // Pasamos un valor vacío para cargar todos los datos
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
        render: (estado) => {
          if (estado === true) {
            return <Checkbox checked={estado} />;
          } else {
            return <Checkbox />;
          }
        },
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
      title: 'Cantidad',
      dataIndex: 'stockAlmacenList',
      sorter: true,
      width: '10%',
      filterSearch: true,
      render: (stockAlmacenList) => {
        return stockAlmacenList?.map((stock, index) => {
          const almacen = almacenes.find(
            (almacen) => almacen.value === stock.idAlmacen && stock.idEmpresa === sesionEmpId
          );
          if (!almacen) {
            //debe de generar la key por que no esta disponible en el stock
            return <Tag key={index} color="default">Sin Stock</Tag>;
          }
    
          return (
            <Tag key={stock.idStock} color="blue">
              {stock.cantidadEnvase + ' : ' + `${almacen.label.slice(0, 1)}...${almacen.label.slice(-9)}`}
            </Tag>

          );
        });
      },
      className:
        'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Acciones',
      fixed: 'right',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button onClick={() => handleEdit(record)} icon={<i className="fas fa-edit" />} />
          <Popconfirm
            title="¿Estás seguro de eliminar este envace?"
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
        <h3 className="text-2xl font-bold">Envaces</h3>
        <Button type="primary" icon={<i className="fas fa-plus" />} onClick={() => handleAdd()}>
          Nuevo
        </Button>
      </div>
  
      {/* Contenedor de la tabla con overflow */}
      
      <Table
        columns={columns}
        dataSource={envaces}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: envaces.length,
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
        rowKey="idEnvase"
        scroll={{
          x: 'max-content',
          y: 400,
        }}
        className="w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-400"
        onChange={(pagination, filters, sorter) => fetchData(pagination, filters, sorter)}
        sticky
      />
      {/* Modal para Envace */}
      <ModalEnvaces
        visible={modalVisible}
        form={form}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        envace={editingEnvace}
        tiposEnvases={tiposEnvases}
      />
    </div>
  );
  
};

export default TablaEnvaces;
