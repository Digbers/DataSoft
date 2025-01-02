import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Modal, Form, Input, Row, Col, Table, message, Select } from 'antd';
import axios from '../../../config/axiosConfig';

const MovimientoModal = ({ visible, onCancel, form, movimiento, almacenes, monedas, estados, motivos }) => {
  const [detalle, setDetalle] = useState([]);
  // Cargar los detalles del comprobante
  const fetchDetalle = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/inventario/movimientos/find-detalle/${id}`);
      setDetalle(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching detalle:', error);
      message.error('Error fetching detalle');
    }
  };

  useEffect(() => {
    if (movimiento?.id) {
      fetchDetalle(movimiento.id);
    }
  }, [movimiento]);

  // Columnas para la tabla de detalles
  const detalleColumns = [
    { title: 'Codigo', dataIndex: 'codigo', key: 'codigo', width: '5%' },
    { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion', width: '10%' },
    { title: 'Unidad', dataIndex: 'unidad', key: 'unidad', width: '2%' },
    { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad', width: '2%' },
    { title: 'Peso', dataIndex: 'peso', key: 'peso', width: '2%' },
    { title: 'Tara', dataIndex: 'tara', key: 'tara', width: '2%' },
    { title: 'Precio Unitario', dataIndex: 'precioUnitario', key: 'precioUnitario', width: '2%' },
    { title: 'Total', dataIndex: 'total', key: 'total', width: '2%' },
  ];

  return (
    <Modal
      title={movimiento && movimiento.id ? `${movimiento.serie} - ${movimiento.numero}` : 'No existe el movimiento'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width="80%"
      className="dark:bg-gray-800 dark:text-gray-200"
    >
      <Form form={form} layout="vertical">
        {/* Fila 1 */}
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Documento Referencia</span>}>
              <Input 
                value={movimiento?.documentoReferencia || ''} 
                disabled
                className="!opacity-100 !dark:text-gray-300 !text-gray-700 !dark:bg-gray-700 !bg-gray-100 !cursor-not-allowed"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<span className="!dark:text-gray-300">Motivo</span>}>
              <Select 
                value={movimiento?.motivoCodigo || ''} 
                disabled 
                className="w-full"
              >
                {motivos.map((motivo) => (
                  <Select.Option 
                    key={motivo.value} 
                    value={motivo.value} 
                    className="
                    !opacity-100 
                    !dark:text-gray-300 
                    !text-gray-700 
                    !dark:bg-gray-700 
                    !bg-gray-100 
                    !cursor-not-allowed
                  "
                  >
                    {motivo.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Usuario</span>}>
              <Input 
                value={movimiento?.idUsuario || ''} 
                disabled 
                className="!opacity-100 !dark:text-gray-300 !text-gray-700 !dark:bg-gray-700 !bg-gray-100 !cursor-not-allowed"
              />
            </Form.Item>
          </Col> 
        </Row>
        {/* Fila 2 */}
        <Row gutter={16}>
          
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Moneda</span>}>
              <Select 
                value={movimiento?.monedaCodigo || ''} 
                disabled 
                className="w-full"
              >
                {monedas.map((moneda) => (
                  <Select.Option 
                    key={moneda.value} 
                    value={moneda.value} 
                    className="!dark:bg-gray-700 !dark:text-gray-300 !dark:hover:bg-gray-600"
                  >
                    {moneda.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Estado</span>}>
              <Select 
                value={movimiento?.estadoCodigo || ''} 
                disabled 
                className="w-full"
              >
                {estados.map((estado) => (
                  <Select.Option 
                    key={estado.value} 
                    value={estado.value} 
                    className="!dark:bg-gray-700 !dark:text-gray-300 !dark:hover:bg-gray-600"
                  >
                    {estado.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<span className="!dark:text-gray-300">Almacén</span>}>
              <Select 
                value={movimiento?.idAlmacen || ''} 
                disabled 
                className="w-full"
              >
                {almacenes.map((almacen) => (
                  <Select.Option 
                    key={almacen.value} 
                    value={almacen.value} 
                    className="!dark:bg-gray-700 !dark:text-gray-300 !dark:hover:bg-gray-600"
                  >
                    {almacen.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Tabla de detalles */}
        <Row>
          <Col span={24}>
            <Table
              dataSource={detalle}
              columns={detalleColumns}
              pagination={false}
              rowKey="id"
              bordered
              className="!dark:border-gray-700"
              rowClassName="!dark:bg-gray-800 !dark:text-gray-300 !dark:hover:bg-gray-700"
              scroll={{ x: '100%' }} 
            />
          </Col>
        </Row>

        {/* Subtotal, Impuesto y Total */}
        <Row gutter={16} style={{ marginTop: '16px' }}>
          <Col xs={24} md={8}>
            <Form.Item label={<span className="!dark:text-gray-300">Total</span>}>
              <Input 
                value={movimiento?.total || ''} 
                disabled 
                className="!opacity-100 !dark:text-gray-300 !text-gray-700 !dark:bg-gray-700 !bg-gray-100 !cursor-not-allowed"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

MovimientoModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  movimiento: PropTypes.object,
  almacenes: PropTypes.array.isRequired,
  monedas: PropTypes.array.isRequired,
  estados: PropTypes.array.isRequired,
  motivos: PropTypes.array.isRequired,
};

export default MovimientoModal;
