import { useState, useEffect } from 'react';
import { Table, Button, Form, message, Tag} from 'antd';
import axios from "../../../config/axiosConfig"; 
import { useAuth } from '../../../context/AuthContext';
import Swal from 'sweetalert2';
import CobrosModal from './CobrosModal';
import EditModal from './EditModal';

const CuentasXCobrar = () => {
  const [comprobantes, setComprobantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [editingComprobante, setEditingComprobante] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [formEdit] = Form.useForm();
  const [comprobantesTipos, setComprobantesTipos] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const { sesionEmpId, userCode} = useAuth();
  const [inCobrados, setInCobrados] = useState(false);
  const [formasCobros, setFormasCobros] = useState([]);
  const [loadingRows, setLoadingRows] = useState({});
  const [expandedData, setExpandedData] = useState({});
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [cobro, setCobro] = useState(null);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [cobrobanteEdit, setComprobanteEdit] = useState(null);

  useEffect(() => {
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
        Swal.fire({
          icon: "error",
          title: "Error al buscar monedas",
          text: "No se pudo obtener la lista de monedas.",
        });
      }
    };
    const fetchComprobantesTipos = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/ventas/get-comprobantes-tipos-ventas/${sesionEmpId}`);
        const comprobantes = response.data.map((comprobanteTipo) => ({
          value: comprobanteTipo.codigo,
          label: comprobanteTipo.descripcion,
        }));
        setComprobantesTipos(comprobantes);
        return comprobantes[0].value;
      } catch (error) {
        console.error('Error fetching comprobantes tipos:', error);
        Swal.fire({
          icon: "error",
          title: "Error al buscar comprobantes tipos",
          text: "No se pudo obtener la lista de comprobantes tipos.",
        });
      }
    };
    const fetchFormasCobros = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/finanzas/metodos-cobros/find-by-empresa/${sesionEmpId}`);
        const formasCobros = response.data.map((formaCobro) => ({
          value: formaCobro.codigo,
          label: formaCobro.descripcion,
        }));
        setFormasCobros(formasCobros);
      } catch (error) {
        console.error('Error fetching formas de cobros:', error);
        Swal.fire({
          icon: "error",
          title: "Error al buscar formas de cobros",
          text: "No se pudo obtener la lista de formas de cobros.",
        });
      }
    };
    fetchMonedas();
    fetchComprobantesTipos();
    fetchFormasCobros();
  }, [sesionEmpId]);
  const handleSave = async (values) => {
    try{
      values.usuarioCreacion = userCode;
      values.idComprobanteVenta = editingComprobante.idComprobanteVenta;
      values.idEmpresa = sesionEmpId;
      //console.log(values); 
      const response = await axios.post(`http://localhost:8080/api/finanzas/cuentas-cobrar/save-cobro`, values);
      console.log(response.data);
      message.success('Cobro guardado correctamente');
      setModalVisible(false);
      form.resetFields();
      fetchData(pagination);
    } catch (error) {
      console.error('Error al guardar el cobro:', error);
      message.error('No se pudo guardar el cobro');
    }
  };
  const handleUpdate = async (values) => {
    try{
      //console.log(values);
      values.usuarioActualizacion = userCode;

      await axios.patch(`http://localhost:8080/api/finanzas/cuentas-cobrar/update-cobro/${values.id}`, values);
      //console.log(response.data);
      message.success('Cobro actualizado correctamente');
      setModalEditVisible(false);
      formEdit.resetFields();
      fetchData(pagination);
      // Refrescar la fila expandida si corresponde
      const idComprobanteVenta = cobrobanteEdit.idComprobanteVenta; // Asegúrate de que esto contiene la fila relacionada
      if (expandedRowKeys.includes(idComprobanteVenta)) {
        const cobros = await fetchCobros({ idComprobanteVenta });
        setExpandedData((prev) => ({
          ...prev,
          [idComprobanteVenta]: cobros, // Actualiza la fila expandida específica
        }));
      }
      
    } catch (error) {
      console.error('Error al actualizar el cobro:', error);
      message.error('No se pudo actualizar el cobro');
    }
  }
  const fetchCobros = async (comprobante) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/finanzas/cuentas-cobrar/find-cobros-by-comprobante/${comprobante.idComprobanteVenta}`);
      //console.log(response.data);
      return response.data;
      
    } catch (error) {
      console.error('Error fetching cobros:', error);
      message.error('No se pudieron cargar los cobros');
      return [];
    }
  };
  
  const handleExpand = async (expanded, record) => {
    if (expanded) {
      // Mostrar indicador de carga para la fila expandida
      setLoadingRows((prev) => ({ ...prev, [record.idComprobanteVenta]: true }));
      // Obtener datos de cobros
      const cobros = await fetchCobros(record);
      // Almacenar datos en el estado
      setExpandedData((prev) => ({
        ...prev,
        [record.idComprobanteVenta]: cobros,
      }));
      // Finalizar la carga
      setLoadingRows((prev) => ({ ...prev, [record.idComprobanteVenta]: false }));
      // Agregar la clave de la fila expandida
      setExpandedRowKeys((prev) => [...prev, record.idComprobanteVenta]);
    } else {
      // Remover la clave de la fila expandida
      setExpandedRowKeys((prev) =>
        prev.filter((key) => key !== record.idComprobanteVenta)
      );
    }
  };
  const handleEditarCobro = (record, recordC) => {
    console.log(recordC);
    let recordComprobante = {
      idComprobanteVenta: recordC.idComprobanteVenta,
      monedaCodigo: recordC.monedaCodigo,
      saldo: recordC.saldo
    };
    //console.log(record);
    setComprobanteEdit(recordComprobante);
    setCobro(record);
    setModalEditVisible(true);
  };

  const expandedRowRender = (recordC) => {
    //console.log(recordC);
    const cobros = expandedData[recordC.idComprobanteVenta] || [];
    const cobrosColumns = [
      {
        title: 'Fecha',
        dataIndex: 'fechaCobro',
        key: 'fechaCobro',
      },
      {
        title: 'Monto',
        dataIndex: 'montoCobrado',
        key: 'montoCobrado',
      },
      {
        title: 'Formas de Cobro ',
        dataIndex: 'formasDeCobros',
        key: 'formasDeCobros',
      },
      {
        title: 'Descripción',
        dataIndex: 'descripcion',
        key: 'descripcion',
      },
      {
        title: 'Moneda',
        dataIndex: 'monedas',
        key: 'monedas',
      },
      {
        title: 'Usuario Creación',
        dataIndex: 'usuarioCreacion',
        key: 'usuarioCreacion',
      },
      {
        title: 'Fecha Creación',
        dataIndex: 'fechaCreacion',
        render: (fecha) => fecha ? fecha.split('T')[0] : 'N/A',
        key: 'fechaCreacion',
      },
      {
        title: 'Usuario Actualización',
        dataIndex: 'usuarioActualizacion',
        key: 'usuarioActualizacion',
      },
      {
        title: 'Fecha Actualización',
        dataIndex: 'fechaActualizacion',
        render: (fecha) => fecha ? fecha.split('T')[0] : 'N/A',
        key: 'fechaActualizacion',
      },
      {
        title: 'Acciones',
        key: 'action',
        render: (text, record) => (
          console.log(record),
          <Button onClick={() => handleEditarCobro(record, recordC)} icon={<i className="fas fa-edit" />} />
        ),
      },
    ];

    return (
      <>
      <Table
        columns={cobrosColumns}
        dataSource={cobros}
        pagination={false}
        rowKey="id"
        loading={loadingRows[recordC.idComprobanteVenta]}
      />  
      {/* Conditionally render ProductoModal only when envases and tipos are loaded */}
      {monedas.length > 0 && formasCobros.length > 0 && cobro &&  (
        <EditModal
          visible={modalEditVisible}
          onClose={() => setModalEditVisible(false)}
          onSave={handleUpdate}
          form={formEdit}
          comprobante={cobrobanteEdit}
          monedas={monedas}
          formasCobros={formasCobros}
          cobro={cobro}
        />
      )}
      </>
      
    );
  };
  

  const fetchData = async (pagination, filters = {}, sorter = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:8080/api/finanzas/cuentas-cobrar/findAll', {
        params: {
          page: pagination.current - 1, // El backend comienza en 0
          size: pagination.pageSize,
          inCobrados: inCobrados,
          comprobanteTipo: filters.comprobanteTipo ? filters.comprobanteTipo[0] : null,
          fechaEmision: filters.fechaEmision ? filters.fechaEmision[0] : null,
          serie: filters.serie ? filters.serie[0] : null,
          numero: filters.numero ? filters.numero[0] : null,
          numeroDoc: filters.numeroDoc ? filters.numeroDoc[0] : null,
          nombre: filters.nombre ? filters.nombre[0] : null,
          total: filters.total ? filters.total[0] : null,
          pagado: filters.pagado ? filters.pagado[0] : null,
          saldo: filters.saldo ? filters.saldo[0] : null,
          sort: sorter.field ? `${sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}` : null,
        },
      });
      setComprobantes(data.content);
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
  const handleBuscar = () => {
    fetchData(pagination); // Llamada a la función fetchData con la configuración actual
  };
  
  const handleNuevoCobro = (record) => {
    console.log(record);
    if(record.saldo === 0){
      message.error('No se puede crear un cobro con saldo 0');
      return;
    }
    setEditingComprobante(record);
    setModalVisible(true);
  };
  
  const handleInCobrados = () => {
    setInCobrados((prev) => {
      return !prev;
    });
  };
  
  const columns = [
    {
     title: 'Fecha',
     dataIndex: 'fechaEmision',
     sorter: true,
     width: '5%',
     filterSearch: true,
     render: (fecha) => fecha ? fecha.split('T')[0] : 'N/A',
     className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Tipo',
      dataIndex: 'comprobanteTipo',
      sorter: true,
      width: '5%',
      filterSearch: true,
      render: (tipo) => {
        const comprobanteTipoActual = comprobantesTipos.find(t => t.value === tipo);
        let color = '';
        if (comprobanteTipoActual?.value === 'FAC') {
          color = 'green';
        } else if (comprobanteTipoActual?.value === 'BOL') {
          color = 'blue';
        } else if (comprobanteTipoActual?.value === 'TIK') {
          color = 'volcano';
        }
        return comprobanteTipoActual ? (
          <Tag color={color}>{comprobanteTipoActual.label.toUpperCase()}</Tag>
        ) : 'Sin tipo';
      },
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Serie',
      dataIndex: 'serie',
      sorter: true,
      width: '5%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Número',
      dataIndex: 'numero',
      sorter: true,
      width: '5%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Número Doc',
      dataIndex: 'numeroDoc',
      sorter: true,
      width: '8%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Nombre/Razón Social',
      dataIndex: 'nombre',
      sorter: true,
      width: '15%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Moneda',
      dataIndex: 'monedaCodigo',
      sorter: true,
      width: '4%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      sorter: true,
      width: '4%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
        title: 'Cobrado',
        dataIndex: 'cobrado',
        sorter: true,
        width: '4%',
        filterSearch: true,
        className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Saldo',
      dataIndex: 'saldo',
      sorter: true,
      width: '4%',
      filterSearch: true,
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    },
    {
      title: 'Acciones',
      fixed: 'right',
      width: '5%',
      key: 'actiones',
      render: (text, record) => (
        <>
          <Button onClick={() => handleNuevoCobro(record)} icon={<i className="fas fa-plus" />} />
        </>
      ),
      className: 'text-gray-500 dark:text-gray-300 bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400',
    }
  ];

  return (
    <div className='rounded-lg dark:bg-transparent bg-transparent border shadow-md p-0 z-10 h-full relative'>
      {/* Botones de exportación */}
      <div className="mb-2 flex justify-between border rounded-lg dark:bg-gray-800 bg-white text-gray-500 dark:text-gray-300 p-2">
          <div className="mb-2 flex flex-row justify-end">
          <Button
            onClick={handleInCobrados}
            icon={<i className={`fas ${inCobrados ? 'fa-check' : 'fa-times'}`} />}
          >
            {inCobrados ? 'Cobrados' : 'No Cobrados'}
          </Button>
          <Button
            onClick={handleBuscar}
            icon={<i className={`fas fa-search`} />}
          >
            Buscar
          </Button>

          </div>
          {/* Tabla de Ant Design */}
          <div className="mb-2 flex justify-between">
            <h3 className="text-2xl font-bold">Cuentas a Cobrar</h3>
          </div>
      </div>
      <Table
        columns={columns}
        dataSource={comprobantes}
        pagination={pagination}
        loading={loading}
        rowKey="idComprobanteVenta"
        expandable={{
          expandedRowRender,
          expandedRowKeys,
          onExpand: handleExpand,
          expandIcon: ({ expanded, onExpand, record }) => 
            expanded 
              ? <i className="fas fa-chevron-up" onClick={e => onExpand(record, e)} />
              : <i className="fas fa-chevron-down" onClick={e => onExpand(record, e)} />
        }}
        scroll={{
          x: 'max-content',
          y: 400,
        }}
        className='w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-400'
        onChange={(pagination, filters, sorter) => fetchData(pagination, filters, sorter)}
      />

      {/* Conditionally render ProductoModal only when envases and tipos are loaded */}
      {monedas.length > 0 && formasCobros.length > 0 && editingComprobante &&  (
        <CobrosModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSave}
          form={form}
          comprobante={editingComprobante}
          monedas={monedas}
          formasCobros={formasCobros}
        />
      )}
    </div>
  );
};

export default CuentasXCobrar;

