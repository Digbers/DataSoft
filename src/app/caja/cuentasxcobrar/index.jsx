import { useState, useEffect } from 'react';
import { Table, Button, Form, message, Tag} from 'antd';
import axios from "../../../config/axiosConfig"; 
import CuentasModal from './CuentasModal';
import { useAuth } from '../../../context/AuthContext';
import Swal from 'sweetalert2';

const CuentasXCobrar = () => {
  const [comprobantes, setComprobantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [editingComprobante, setEditingComprobante] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [comprobantesTipos, setComprobantesTipos] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const { sesionEmpId, userCode} = useAuth();
  
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
    fetchMonedas();
    fetchComprobantesTipos();
  }, [sesionEmpId]);

  

  const fetchData = async (pagination, filters = {}, sorter = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:8080/api/finanzas/cuentas-cobrar/findAll', {
        params: {
          page: pagination.current - 1, // El backend comienza en 0
          size: pagination.pageSize,
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
  const handleNuevoCobro = (record) => {
    console.log(record);
    setEditingComprobante(record);
  };
  const handleCobros = (record) => {
    console.log(record);
    console.log(userCode);
  };
  const columns = [
    {
     title: 'Fecha',
     dataIndex: 'fecha',
     sorter: true,
     width: '5%',
     filterSearch: true,
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
        const comprobanteTipo = comprobantesTipos.find(t => t.value === tipo.codigo);
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
          <Button onClick={() => handleNuevoCobro(record)} icon={<i className="fas fa-plus" />} />
          <Button onClick={() => handleCobros(record)} icon={<i className="fas fa-money-bill" />} />
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
          </div>
          {/* Tabla de Ant Design */}
          <div className="mb-2 flex justify-between">
            <h3 className="text-2xl font-bold">Comprobantes Ventas</h3>
          </div>
      </div>
      <Table
        columns={columns}
        dataSource={comprobantes}
        pagination={pagination}
        loading={loading}
        rowKey="id"
        scroll={{
          x: 'max-content',
          y: 400,
        }}
        className='w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-400'
        onChange={(pagination, filters, sorter) => fetchData(pagination, filters, sorter)}
      />

      {/* Conditionally render ProductoModal only when envases and tipos are loaded */}
      {monedas.length > 0 && comprobantesTipos.length > 0 &&  (
        <CuentasModal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          //onOk={handleSave}
          form={form}
          comprobante={editingComprobante}
          monedas={monedas}
          comprobantesTipos={comprobantesTipos}
        />
      )}
    </div>
  );
};

export default CuentasXCobrar;

