import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Modal, Form, Input, Row, Col, Table, message } from 'antd';
import axios from '../../../config/axiosConfig';

const MovimientoModal = ({ visible, onCancel, form, movimiento }) => {
  const [detalle, setDetalle] = useState([]);
  // Cargar los detalles del comprobante
  const fetchMovimientoDetalle = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/inventario/movimientos/find-detalle/${id}`);
      setDetalle(response.data);
    } catch (error) {
      message.error('Error fetching movimiento detalle');
    }
  };

  useEffect(() => {
    if (movimiento?.id) {
      fetchMovimientoDetalle(movimiento.id);
    }
  }, [movimiento]);

  // Columnas para la tabla de detalles
  const detalleColumns = [
    { title: 'N°', dataIndex: 'numero', key: 'numero' },
    { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
    { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
    { title: 'Peso', dataIndex: 'peso', key: 'peso' },
    { title: 'Precio Unitario', dataIndex: 'precioUnitario', key: 'precioUnitario' },
    { title: 'Descuento', dataIndex: 'descuento', key: 'descuento' },
  ];

  return (
    <Modal
      title={movimiento && movimiento.id ? `${movimiento.serie} - ${movimiento.numero} - ${movimiento.fechaEmision} - ${movimiento.nombreCliente}` : 'No existe el movimiento'}
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
            <Form.Item label={<span className="dark:text-gray-300">Fecha de Emisión</span>}>
              <Input 
                value={movimiento?.fechaEmision || ''} 
                disabled
                className="!opacity-100 !dark:text-gray-300 !text-gray-700 !dark:bg-gray-700 !bg-gray-100 !cursor-not-allowed"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Fecha de Vencimiento</span>}>
              <Input 
                value={movimiento?.fechaVencimiento || ''} 
                disabled 
                className="
                  !opacity-100 
                  !dark:text-gray-300 
                  !text-gray-700 
                  !dark:bg-gray-700 
                  !bg-gray-100 
                  !cursor-not-allowed
                "
              />
            </Form.Item>
          </Col>
          {/* <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Tipo de Comprobante</span>}>
              <Select 
                value={movimiento?.comprobanteTipo || ''} 
                disabled 
                className="w-full"
              >
                {movimientoTipos.map((tipo) => (
                  <Select.Option 
                    key={tipo.value} 
                    value={tipo.value} 
                    className="
                    !opacity-100 
                    !dark:text-gray-300 
                    !text-gray-700 
                    !dark:bg-gray-700 
                    !bg-gray-100 
                    !cursor-not-allowed
                  "
                  >
                    {tipo.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col> */}
        </Row>

        {/* Fila 2 */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={<span className="dark:text-gray-300">Serie</span>}>
              <Input 
                value={movimiento?.serie || ''} 
                disabled 
                className="!opacity-100 !dark:text-gray-300 !text-gray-700 !dark:bg-gray-700 !bg-gray-100 !cursor-not-allowed"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={<span className="dark:text-gray-300">Número</span>}>
              <Input 
                value={movimiento?.numero || ''} 
                disabled 
                className="!opacity-100 !dark:text-gray-300 !text-gray-700 !dark:bg-gray-700 !bg-gray-100 !cursor-not-allowed"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Fila 3 */}
        <Row gutter={16}>
          {/* <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Estado</span>}>
              <Select 
                value={movimiento?.estado || ''} 
                disabled 
                className="w-full"
                dropdownClassName="dark:bg-gray-800"
              >
                {estados.map((estado) => (
                  <Select.Option 
                    key={estado.value} 
                    value={estado.value} 
                    className="dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    {estado.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col> */}
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Número de Documento del Cliente</span>}>
              <Input 
                value={movimiento?.numeroDocumentoCliente || ''} 
                disabled 
                className="!opacity-100 !dark:text-gray-300 !text-gray-700 !dark:bg-gray-700 !bg-gray-100 !cursor-not-allowed"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Nombre/Razón Social del Cliente</span>}>
              <Input 
                value={movimiento?.nombreCliente || ''} 
                disabled 
                className="!opacity-100 !dark:text-gray-300 !text-gray-700 !dark:bg-gray-700 !bg-gray-100 !cursor-not-allowed"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Fila 4 */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={<span className="dark:text-gray-300">Observaciones</span>}>
              <Input.TextArea 
                value={movimiento?.observaciones || ''} 
                disabled 
                className="!opacity-100 !dark:text-gray-300 !text-gray-700 !dark:bg-gray-700 !bg-gray-100 !cursor-not-allowed"
              />
            </Form.Item>
          </Col>
          {/* <Col xs={24} md={12}>
            <Form.Item label={<span className="dark:text-gray-300">Moneda</span>}>
              <Select 
                value={movimiento?.moneda || ''} 
                disabled 
                className="w-full"
                dropdownClassName="dark:bg-gray-800"
              >
                {monedas.map((moneda) => (
                  <Select.Option 
                    key={moneda.value} 
                    value={moneda.value} 
                    className="dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    {moneda.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col> */}
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
              className="dark:border-gray-700"
              rowClassName="dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            />
          </Col>
        </Row>

        {/* Subtotal, Impuesto y Total */}
        <Row gutter={16} style={{ marginTop: '16px' }}>
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Subtotal</span>}>
              <Input 
                value={movimiento?.subtotal || ''} 
                disabled 
                className="!opacity-100 !dark:text-gray-300 !text-gray-700 !dark:bg-gray-700 !bg-gray-100 !cursor-not-allowed"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Impuesto</span>}>
              <Input 
                value={movimiento?.impuesto || ''} 
                disabled 
                className="!opacity-100 !dark:text-gray-300 !text-gray-700 !dark:bg-gray-700 !bg-gray-100 !cursor-not-allowed"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Total</span>}>
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
  movimientoDetalle: PropTypes.array.isRequired,
};

export default MovimientoModal;
