import { useState, useEffect } from 'react';
import { Table, Button, Form, message, Tag} from 'antd';
import axios from "../../../config/axiosConfig"; 
import CuentasModal from './CuentasModal';
import { useAuth } from '../../../context/AuthContext';
import Swal from 'sweetalert2';
import EditModal from './EditModal';

const CuentasXPagar = () => {
  const [comprobantes, setComprobantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [editingComprobante, setEditingComprobante] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [cobrobanteEdit, setComprobanteEdit] = useState(null);
  const [form] = Form.useForm();
  const [formEdit] = Form.useForm();
  const [comprobantesTipos, setComprobantesTipos] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [formasPagos, setFormasPagos] = useState([]);
  const { sesionEmpId, userCode} = useAuth();
  const [loadingRows, setLoadingRows] = useState({});
  const [expandedData, setExpandedData] = useState({});
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [inPagados, setInPagados] = useState(false);
  const [pago, setPago] = useState(null);

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
    const fetchFormasPagos = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/finanzas/metodos-pagos/find-by-empresa/${sesionEmpId}`);
        const formasPagos = response.data.map((formaPago) => ({
          value: formaPago.codigo,
          label: formaPago.descripcion,
        }));
        setFormasPagos(formasPagos);
      } catch (error) {
        console.error('Error fetching formas de pagos:', error);
        Swal.fire({
          icon: "error",
          title: "Error al buscar formas de pagos",
          text: "No se pudo obtener la lista de formas de pagos.",
        });
      }
    };
    fetchMonedas();
    fetchFormasPagos();
    fetchComprobantesTipos();
  }, [sesionEmpId]);

  const handleInPagados = () => {
    setInPagados(!inPagados);
  };


  const handleSave = async (values) => {
    try{
      values.usuarioCreacion = userCode;
      values.idComprobanteCompra = editingComprobante.idComprobanteCompra;
      values.idEmpresa = sesionEmpId;
      //console.log(values);
      const response = await axios.post(`http://localhost:8080/api/finanzas/cuentas-pagar/save-pago`, values);
      console.log(response.data);
      message.success('Pago guardado correctamente');
      setModalVisible(false);
      form.resetFields();
      fetchData(pagination);
    } catch (error) {
      console.error('Error al guardar el pago:', error);
      message.error('No se pudo guardar el pago');
    }
  };
  const handleUpdate = async (values) => {
    try{
      //console.log(values);
      values.usuarioActualizacion = userCode;

      await axios.patch(`http://localhost:8080/api/finanzas/cuentas-pagar/update-pago/${values.id}`, values);
      //console.log(response.data);
      message.success('Pago actualizado correctamente');
      setModalEditVisible(false);
      formEdit.resetFields();
      fetchData(pagination);
      // Refrescar la fila expandida si corresponde
      const idComprobanteCompra = cobrobanteEdit.idComprobanteCompra; // Asegúrate de que esto contiene la fila relacionada
      if (expandedRowKeys.includes(idComprobanteCompra)) {
        const pagos = await fetchPagos({ idComprobanteCompra });
        setExpandedData((prev) => ({
          ...prev,
          [idComprobanteCompra]: pagos, // Actualiza la fila expandida específica
        }));
      }
      
    } catch (error) {
      console.error('Error al actualizar el pago:', error);
      message.error('No se pudo actualizar el pago');
    }
  }
  const fetchPagos = async (comprobante) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/finanzas/cuentas-pagar/find-pagos-by-comprobante/${comprobante.idComprobanteCompra}`);
      //console.log(response.data);
      return response.data;

    } catch (error) {
      console.error('Error fetching pagos:', error);
      message.error('No se pudieron cargar los pagos');
      return [];
    }
  };
  const handleExpand = async (expanded, record) => {
    if (expanded) {
      // Mostrar indicador de carga para la fila expandida
      setLoadingRows((prev) => ({ ...prev, [record.idComprobanteCompra]: true }));

      // Obtener datos de cobros
      const pagos = await fetchPagos(record);

      // Almacenar datos en el estado
      setExpandedData((prev) => ({
        ...prev,
        [record.idComprobanteCompra]: pagos,
      }));

      // Finalizar la carga
      setLoadingRows((prev) => ({ ...prev, [record.idComprobanteCompra]: false }));

      // Agregar la clave de la fila expandida
      setExpandedRowKeys((prev) => [...prev, record.idComprobanteCompra]);
    } else {
      // Remover la clave de la fila expandida
      setExpandedRowKeys((prev) =>
        prev.filter((key) => key !== record.idComprobanteCompra)
      );
    }
  };
  const handleEditarPago = (record, recordC) => {
    console.log(recordC);
    let recordComprobante = {
      idComprobanteCompra: recordC.idComprobanteCompra,
      monedaCodigo: recordC.monedaCodigo,
      saldo: recordC.saldo
    };
    //console.log(record);
    setComprobanteEdit(recordComprobante);
    setPago(record);
    setModalEditVisible(true);
  };

  const expandedRowRender = (recordC) => {
    const pagos = expandedData[recordC.idComprobanteCompra] || [];
    const pagosColumns = [
      {
        title: 'Fecha',
        dataIndex: 'fechaPago',
        key: 'fechaPago',
      },
      {
        title: 'Monto',
        dataIndex: 'montoPagado',
        key: 'montoPagado',
      },
      {
        title: 'Formas de Pago ',
        dataIndex: 'formaPagosEntity',
        key: 'formasPagosEntity',
      },
      {
        title: 'Descripción',
        dataIndex: 'descripcion',
        key: 'descripcion',
      },
      {
        title: 'Moneda',
        dataIndex: 'monedasEntity',
        key: 'monedasEntity',
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
          <Button onClick={() => handleEditarPago(record, recordC)} icon={<i className="fas fa-edit" />} />
        ),
      },
    ];

    return (
      <>
      <Table
        columns={pagosColumns}
        dataSource={pagos}
        pagination={false}
        rowKey="id"
        loading={loadingRows[recordC.idComprobanteCompra]}
      />  
      {/* Conditionally render ProductoModal only when envases and tipos are loaded */}
      {monedas.length > 0 && formasPagos.length > 0 && pago &&  (
        <EditModal
          visible={modalEditVisible}
          onClose={() => setModalEditVisible(false)}
          onSave={handleUpdate}
          form={formEdit}
          comprobante={cobrobanteEdit}
          monedas={monedas}
          formasPagos={formasPagos}
          pago={pago}
        />
      )}
      </>
    );
  };

  

  const fetchData = async (pagination, filters = {}, sorter = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:8080/api/finanzas/cuentas-pagar/findAll', {
        params: {
          page: pagination.current - 1, // El backend comienza en 0
          size: pagination.pageSize,
          inPagado: inPagados,
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
  const handleNuevoPago = (record) => {
    console.log(record);
    if(record.saldo === 0){
      message.error('No se puede crear un pago con saldo 0');
      return;
    }
    setEditingComprobante(record);
    setModalVisible(true);
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
        // Buscar el tipo por el ID y definir el color
        const comprobanteTipo = comprobantesTipos.find(t => t.value === tipo);
        let color = '';
        if (comprobanteTipo?.value === 'FAC') {
          color = 'green';
        } else if (comprobanteTipo?.value === 'BOL') {
          color = 'blue';
        } else if (comprobanteTipo?.value === 'TIK') {
          color = 'volcano';
        }
        return comprobanteTipo ? (
          <Tag color={color}>{comprobanteTipo.label.toUpperCase()}</Tag>
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
        title: 'Pagado',
        dataIndex: 'pagado',
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
          <Button onClick={() => handleNuevoPago(record)} icon={<i className="fas fa-plus" />} />
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
              onClick={handleInPagados}
              icon={<i className={`fas ${inPagados ? 'fa-check' : 'fa-times'}`} />}
            >
              {inPagados ? 'Pagados' : 'No Pagados'}
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
            <h3 className="text-2xl font-bold">Cuentas a Pagar</h3>
          </div>
      </div>
      <Table
        columns={columns}
        dataSource={comprobantes}
        pagination={pagination}
        loading={loading}
        rowKey="idComprobanteCompra"
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
      {monedas.length > 0 && formasPagos.length > 0 && editingComprobante &&  (
        <CuentasModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSave}
          form={form}
          comprobante={editingComprobante}
          monedas={monedas}
          formasPagos={formasPagos}
        />
      )}
    </div>
  );
};

export default CuentasXPagar;

