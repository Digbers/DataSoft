import PropTypes from 'prop-types';
import { Modal, Form, Input, Select, Row, Col, InputNumber, Checkbox } from 'antd';

const ComprobanteModal = ({ visible, onCancel, onOk, form, producto, monedas, comprobantesTipos, estados }) => {
  return (
    <Modal
      title={producto ? 'Editar Producto' : 'Nuevo Producto'}
      open={visible} // Cambiar 'visible' por 'open'
      onCancel={onCancel}
      onOk={onOk}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form 
        form={form} 
        layout="vertical" 
        initialValues={{ 
          comprobanteTipo: comprobantesTipos[0]?.value,  // Selecciona el primer tipo por defecto
          moneda: monedas[0]?.value,  // Selecciona el primer envase por defecto
          estado: estados[0]?.value,
        }}
      >
        <Row gutter={16}>
          {/* Campo Código */}
          <Col span={12}>
            <Form.Item
              name="codigo"
              label="Código"
              rules={[{ required: true, message: 'Por favor ingrese el código' }]}
            >
              <Input />
            </Form.Item>
          </Col>

          {/* Campo Nombre */}
          <Col span={12}>
            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Campo Tipo */}
          <Col span={12}>
            <Form.Item
              name="tipo"
              label="Tipo"
              rules={[{ required: true, message: 'Por favor seleccione el tipo' }]}
            >
              <Select>
                {comprobantesTipos && comprobantesTipos.map((comprobanteTipo, index) => (
                  <Select.Option key={comprobanteTipo.value || index} value={comprobanteTipo.value}>
                    {comprobanteTipo.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Campo Cantidad */}
          <Col span={12}>
            <Form.Item
              name="cantidadProducto"
              label="Cantidad"
              rules={[{ required: true, message: 'Por favor ingrese la cantidad' }]}
            >
              <InputNumber 
                min={0} 
                style={{ width: '100%' }} 
                onKeyPress={(e) => {
                  if (!/^\d+$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Campo para seleccionar envase */}
          <Col span={12}>
            <Form.Item
              name="envase"
              label="Envase"
              rules={[{ required: true, message: 'Por favor selecciona un envase' }]}
            >
              <Select>
                {monedas && monedas.map((moneda, index) => (
                  <Select.Option key={moneda.value || index} value={moneda.value}>
                    {moneda.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Campo Peso Total */}
          <Col span={12}>
            <Form.Item
              name="pesoTotal"
              label="Peso total"
              rules={[{ required: true, message: 'Por favor ingrese el peso total' }]}
            >
              <InputNumber 
                min={0} 
                style={{ width: '100%' }} 
                onKeyPress={(e) => {
                  if (!/^\d+$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Checkboxes Generar Stock y Estado */}
          <Col span={12}>
            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Form.Item
                  name="generarStock"
                  valuePropName="checked"
                  style={{ marginRight: '10px' }}  
                >
                  <Checkbox>Generar stock</Checkbox>
                </Form.Item>
                <Form.Item
                  name="estado"
                  valuePropName="checked"
                >
                  <Checkbox>Estado</Checkbox>
                </Form.Item>
              </div>
            </Form.Item>
          </Col>

          {/* Campo Precio Unitario */}
          <Col span={12}>
            <Form.Item
              name="precioSugerido"
              label="Precio Unitario"
              rules={[{ required: true, message: 'Por favor ingrese el precio unitario' }]}
            >
              <InputNumber 
                min={0} 
                style={{ width: '100%' }} 
                onKeyPress={(e) => {
                  if (!/^\d+$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
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
  producto: PropTypes.object,
  monedas: PropTypes.array.isRequired,
  comprobantesTipos: PropTypes.array.isRequired,
  estados: PropTypes.array.isRequired,
};

export default ComprobanteModal;
