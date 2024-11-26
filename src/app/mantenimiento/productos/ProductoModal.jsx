import PropTypes from 'prop-types';
import { Modal, Form, Input, Select, Row, Col, InputNumber, Checkbox } from 'antd';

const ProductoModal = ({ visible, onCancel, onOk, form, producto, envases, tipos, unidades }) => {
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
          tipo: tipos[0]?.value,  // Selecciona el primer tipo por defecto
          envase: envases[0]?.value,  // Selecciona el primer envase por defecto
          unidad: unidades[0]?.value,  // Selecciona la primera unidad por defecto
          generarStock: true,
          estado: true
        }}
      >
        <Row gutter={16}>
          {/* Campo Código */}
          <Col span={12}>
            <Form.Item
              name="codigo"
              label="Código"
              rules={[{ required: true, message: 'Por favor ingrese el código' },
                { max: 20, message: 'El código debe tener máximo 50 caracteres' }
              ]}
            >
              <Input
                maxLength={20}
                onInput={(e) => e.target.value = e.target.value.toUpperCase()}
              />
            </Form.Item>
          </Col>

          {/* Campo Nombre */}
          <Col span={12}>
            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[{ required: true, message: 'Por favor ingrese el nombre' },
                {max: 150, message: 'El nombre debe tener máximo 150 caracteres'}
              ]}
            >
              <Input
                maxLength={150}
                onInput={(e) => e.target.value = e.target.value.toUpperCase()}
              />
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
                {tipos && tipos.map((tipo, index) => (
                  <Select.Option key={tipo.value || index} value={tipo.value}>
                    {tipo.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          {/* Campo para seleccionar envase */}
          <Col span={12}>
            <Form.Item
              name="envase"
              label="Envase"
              rules={[{ required: true, message: 'Por favor selecciona un envase' }]}
            >
              <Select>
                {envases && envases.map((envase, index) => (
                  <Select.Option key={envase.value || index} value={envase.value}>
                    {envase.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

        </Row>

        <Row gutter={16}>
          {/* Campo para seleccionar unidad */}
          <Col span={12}>
            <Form.Item
              name="unidad"
              label="Unidad"
              rules={[{ required: true, message: 'Por favor selecciona una unidad' }]}
            >
              <Select>
                {unidades && unidades.map((unidad, index) => (
                  <Select.Option key={unidad.value || index} value={unidad.value}>
                    {unidad.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

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
        
        </Row>

        <Row gutter={16}>
          
          {/* Campo Precio Unitario */}
          <Col span={12}>
            <Form.Item
              name="precioVenta"
              label="Precio Venta"
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
          {/* Campo Precio Unitario */}
          <Col span={12}>
            <Form.Item
              name="precioCompra"
              label="Precio Compra"
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
ProductoModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  producto: PropTypes.object,
  envases: PropTypes.array.isRequired,
  tipos: PropTypes.array.isRequired,
  unidades: PropTypes.array.isRequired,
};

export default ProductoModal;
