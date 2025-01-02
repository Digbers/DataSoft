import PropTypes from 'prop-types';
import { Modal, Form, Input, Select, Row, Col, message, Table } from 'antd';
import axios from "../../../config/axiosConfig";
import { useEffect, useState } from "react";

const ComprobanteModal = ({ visible, onCancel, form, comprobante, monedas, comprobantesTipos, estados }) => {
  const [detalle, setDetalle] = useState([]);

  // Cargar los detalles del comprobante
  const fetchDetalle = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/compras/comprobantes/find-detalle/${comprobante.id}`);
      setDetalle(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching detalle:', error);
      message.error('Error fetching detalle');
    }
  };

  useEffect(() => {
    if (comprobante?.id) {
      fetchDetalle();
      console.log(comprobante);
      console.log(comprobantesTipos)
    }
  }, [comprobante]);

  // Columnas para la tabla de detalles
  const detalleColumns = [
    { title: 'N°', dataIndex: 'numero', key: 'numero' },
    { title: 'Codigo', dataIndex: 'codigo', key: 'codigo' },
    { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
    { title: 'Unidad', dataIndex: 'unidad', key: 'unidad' },
    { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
    { title: 'Cantidad Pollo', dataIndex: 'cantidadPollo', key: 'cantidadPollo' },
    { title: 'Peso', dataIndex: 'peso', key: 'peso' },
    { title: 'Precio Unitario', dataIndex: 'precioUnitario', key: 'precioUnitario' },
    { title: 'Descuento', dataIndex: 'descuento', key: 'descuento' },
    { title: 'Total', dataIndex: 'total', key: 'total' },
  ];

  return (
    <Modal
      title={comprobante && comprobante.id ? `${comprobante.serie} - ${comprobante.numero} - ${comprobante.fechaEmision  ? comprobante.fechaEmision .split('T')[0] : 'N/A'} - ${comprobante.nombreProveedor}` : 'No existe el comprobante'}
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
                value={comprobante?.fechaEmision ? comprobante.fechaEmision.split('T')[0] : ''}
                disabled
                className="!opacity-100 !dark:text-gray-300 !text-gray-700 !dark:bg-gray-700 !bg-gray-100 !cursor-not-allowed"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Fecha de Creación</span>}>
              <Input 
                value={`${comprobante?.fechaCreacion 
                  ? comprobante.fechaCreacion.split('T')[0] + ' ' + comprobante.fechaCreacion.split('T')[1]?.split('.')[0] 
                  : ''}`}
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
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Tipo de Comprobante</span>}>
              <Select 
                value={comprobante?.comprobantesTipos.codigo || ''} 
                disabled 
                className="w-full"
              >
                {comprobantesTipos.map((tipo) => (
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
          </Col>
        </Row>

        {/* Fila 2 */}
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Serie</span>}>
              <Input 
                value={comprobante?.serie || ''} 
                disabled 
                className="!opacity-100 !dark:text-gray-300 !text-gray-700 !dark:bg-gray-700 !bg-gray-100 !cursor-not-allowed"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Número</span>}>
              <Input 
                value={comprobante?.numero || ''} 
                disabled 
                className="!opacity-100 !dark:text-gray-300 !text-gray-700 !dark:bg-gray-700 !bg-gray-100 !cursor-not-allowed"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Estado</span>}>
              <Select 
                value={comprobante?.comprobanteCompraEstados.codigo || ''} 
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
        </Row>

        {/* Fila 3 */}
        <Row gutter={16}>
          
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Número de Documento del Proveedor</span>}>
              <Input 
                value={comprobante?.nroDocumentoProveedor || ''}
                disabled 
                className="!opacity-100 !dark:text-gray-300 !text-gray-700 !dark:bg-gray-700 !bg-gray-100 !cursor-not-allowed"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Nombre/Razón Social del Proveedor</span>}>
              <Input 
                value={comprobante?.nombreProveedor || ''}
                disabled 
                className="!opacity-100 !dark:text-gray-300 !text-gray-700 !dark:bg-gray-700 !bg-gray-100 !cursor-not-allowed"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Moneda</span>}>
              <Select 
                value={comprobante?.codigoMoneda || ''} 
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
        </Row>

        {/* Fila 4 */}
        <Row gutter={16}>
          <Col xs={24} md={24}>
            <Form.Item label={<span className="dark:text-gray-300">Observaciones</span>}>
              <Input.TextArea 
                value={comprobante?.observaciones || ''} 
                disabled 
                className="!opacity-100 !dark:text-gray-300 !text-gray-700 !dark:bg-gray-700 !bg-gray-100 !cursor-not-allowed"
              />
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
              className="dark:border-gray-700"
              rowClassName="dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              scroll={{ x: '100%' }} 
            />
          </Col>
        </Row>

        {/* Subtotal, Impuesto y Total */}
        <Row gutter={16} style={{ marginTop: '16px' }}>
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Subtotal</span>}>
              <Input 
                value={comprobante?.subtotal || ''} 
                disabled 
                className="!opacity-100 !dark:text-gray-300 !text-gray-700 !dark:bg-gray-700 !bg-gray-100 !cursor-not-allowed"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Impuesto</span>}>
              <Input 
                value={comprobante?.impuesto || ''} 
                disabled 
                className="!opacity-100 !dark:text-gray-300 !text-gray-700 !dark:bg-gray-700 !bg-gray-100 !cursor-not-allowed"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<span className="dark:text-gray-300">Total</span>}>
              <Input 
                value={comprobante?.total || ''} 
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
ComprobanteModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  comprobante: PropTypes.object.isRequired,
  monedas: PropTypes.array.isRequired,
  comprobantesTipos: PropTypes.array.isRequired,
  estados: PropTypes.array.isRequired,
};

export default ComprobanteModal;
