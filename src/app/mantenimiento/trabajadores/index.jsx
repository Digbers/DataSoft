import { useState, useEffect } from 'react';
import { Table, Button, message, Popconfirm, Form, Tag, Checkbox } from 'antd';
import axios from "../../../config/axiosConfig"; 
import { useAuth } from '../../../context/AuthContext';
import ModalTrabajadores from './ModalTrabajadores';  // Importar el nuevo componente de modal

const TablaTrabajadores = () => {
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [editingTrabajador, setEditingTrabajador] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { sesionEmpId, userCode } = useAuth();
  const [documentosTipos, setDocumentosTipos] = useState([]);
  const [form] = Form.useForm();
  
  useEffect(() => {
    const fetchDocumentosTipos = async () => {
      try{
        const response = await axios.get(`http://localhost:8080/api/empresas/documentos/find-by-empresa/${sesionEmpId}`);
        const documentosTipos = response.data.map(documento => ({
          id: documento.docCodigo,
          codigo: documento.docCodigo
        }));
        setDocumentosTipos(documentosTipos);
      } catch (error) {
        message.error('Error fetching documentos tipos');
      }
    };
    fetchDocumentosTipos();
  }, [sesionEmpId]);
  
  const fetchData = async (pagination, sorter = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:8080/api/empresas/entidades/trabajadores/findAll/${sesionEmpId}`, {
        params: {
          page: pagination.current - 1,
          size: pagination.pageSize,
          sort: sorter.field ? `${sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}` : null,
        },
      });
      setTrabajadores(data.content);
      setPagination({
        current: data.number + 1,
        pageSize: data.size,
        total: data.totalElements,
      });
    } catch (error) {
      message.error('Error fetching trabajadores');
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
      await axios.delete(`http://localhost:8080/api/mantenimiento/trabajadores/delete/${id}`);
      message.success('Trabajador eliminado exitosamente');
      fetchData(pagination); // Refrescar la tabla
    } catch (error) {
      message.error('Error eliminando trabajador');
    }
  };
  
  // Abrir el modal de edición
  const handleEdit = (record) => {
    setEditingTrabajador(record);
    setModalVisible(true);
  };
  
  // Abrir el modal de agregar
  //const handleAdd = () => {
  //  setEditingTrabajador(null);
  //  form.resetFields();
  //  setModalVisible(true);
  //};
  
  // Guardar cambios en el modal
  const handleSave = async (values) => {
    try {
      const trabajadorRequest = {
        id: editingTrabajador ? editingTrabajador.id : null,
        nombre: values.nombre,
        apellidoPaterno: values.apellidoPaterno,
        apellidoMaterno: values.apellidoMaterno,
        documentoTipo: values.documentoTipo,
        nroDocumento: values.nroDocumento,
        direccion: values.direccion,
        email: values.email,
        celular: values.celular,
        estado: values.estado,
        sueldo: values.sueldo,
        idEmpresa: sesionEmpId,
        usuarioActualizacion: editingTrabajador ? userCode : null
      };
      
      if (editingTrabajador) {
        await axios.patch(`http://localhost:8080/api/empresas/entidades/update/${editingTrabajador.id}`, trabajadorRequest);
        message.success('Trabajador actualizado exitosamente');
      } else {
        await axios.post(`http://localhost:8080/api/empresas/entidades/save`, trabajadorRequest);
        message.success('Trabajador creado exitosamente');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchData(pagination);
    } catch (error) {
      if (error.response && error.response.status === 500) {
        const errorMessage = error.response.data;
        if (errorMessage.includes("llave duplicada") && errorMessage.includes("trabajadores_id_empresa_codigo_key")) {
          message.error("El código de trabajador ya existe para esta empresa. Por favor, elija otro código.");
        } else {
          message.error(editingTrabajador ? 'Error actualizando trabajador' : 'Error creando trabajador');
        }
      } else {
        message.error('Error de conexión o problema desconocido');
      }
    }
  };

  
  // Columnas de la tabla
  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
      
    },
    {
      title: 'Apellido Paterno',
      dataIndex: 'apellidoPaterno',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400'
    },
    {
      title: 'Apellido Materno',
      dataIndex: 'apellidoMaterno',
      sorter: true,
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400'
      
    },
    {
        title: 'Documento',
        dataIndex: 'documentoTipo',
        sorter: true,
        filterSearch: true,
        className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
        render: (documentoTipo) => {
          // Buscar el tipo por el ID y definir el color
          const documentoTipoAC = documentosTipos.find(tipo => tipo.codigo === documentoTipo);
          let color = '';
          if (documentoTipoAC?.value === 'DNI') {
            color = 'green';
          } else if (documentoTipoAC?.value === 'RUC') {
            color = 'blue';
          } 
          return documentoTipoAC ? (
            <Tag color={color}>{documentoTipoAC.codigo}</Tag>
          ) : 'Sin tipo';
        },
    },
    {
        title: 'Número',
        dataIndex: 'nroDocumento',
        sorter: true,
        filterSearch: true,
        className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400'
        
    },
    {
        title: 'Email',
        dataIndex: 'email',
        sorter: true,
        filterSearch: true,
        className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400'
        
    },
    {
        title: 'Celular',
        dataIndex: 'celular',
        sorter: true,
        filterSearch: true,
        className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400'
        
    },
    {
        title: 'Dirección',
        dataIndex: 'direccion',
        sorter: true,
        filterSearch: true,
        className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400'
        
    },
    {
        title: 'Estado',
        dataIndex: 'estado',
        sorter: true,
        filterSearch: true,
        className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
        render: (estado) => {
          if (estado === true) {
            return <Checkbox checked={estado} />;
          } else {
            return <Checkbox />;
          }
        },
    },
    {
        title: 'Sueldo',
        dataIndex: 'sueldo',
        sorter: true,
        filterSearch: true,
        className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
        render: (sueldo) => {
          return sueldo ? sueldo : '0.00';
        },
    },
    {
      title: 'Acciones',
      fixed: 'right',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button onClick={() => handleEdit(record)} icon={<i className="fas fa-edit" />} />
          <Popconfirm
            title="¿Estás seguro de eliminar este trabajador?"
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
        <h3 className="text-2xl font-bold">Trabajadores</h3>
        {/*<Button type="primary" icon={<i className="fas fa-plus" />} onClick={() => handleAdd()}>
          Nuevo
        </Button>*/}
      </div>
  
      {/* Contenedor de la tabla con overflow */}
      
      <Table
        columns={columns}
        dataSource={trabajadores}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: trabajadores.length,
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
        onChange={(pagination, sorter) => fetchData(pagination,sorter)}
        sticky
      />
      {/* Modal para Trabajador */}
      <ModalTrabajadores
        visible={modalVisible}
        form={form}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        trabajador={editingTrabajador}
        documentosTipos={documentosTipos}
      />
    </div>
  );
  
};

export default TablaTrabajadores;
