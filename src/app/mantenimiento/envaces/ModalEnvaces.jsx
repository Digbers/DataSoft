import { useEffect } from 'react';
import { Modal, Form, Input, Select, Checkbox, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';

const ModalEnvaces = ({ visible, form, onClose, onSave, envace, tiposEnvases }) => {

  useEffect(() => {
    if (envace) {
      console.log(envace);
      form.setFieldsValue(envace);
    } else {
      form.resetFields();
    }
  }, [envace, form]);
  
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSave(values);
      onClose();
    } catch (error) {
      console.log(error);
      const errorMessage = error.errorFields
        .map((field) => field.errors.join(', '))
        .join('\n');
      
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: errorMessage || 'Algo salió mal!',
      });
    }
  };

  return (
    <Modal
      title={envace ? 'Editar Envase' : 'Nuevo Envase'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical"
        initialValues={{
          tipoEnvase: tiposEnvases.find(tipo => tipo.value === 'NA')?.value,
          estado: true,
        }}
      >
      <Row gutter={16}>
        <Col span={12}>
              <Form.Item
                name="tipoEnvase"
              label="Tipo de Envase"
            >
              <Select>
                {tiposEnvases.map((tipoEnvase) => (
                  <Select.Option key={tipoEnvase.value} value={tipoEnvase.value}>
                    {tipoEnvase.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="descripcion"
              label="Descripción"
              rules={[
                { required: true, message: 'Por favor ingrese la descripción' },
                { max: 150, message: 'La descripción debe tener máximo 150 caracteres' }
              ]}
            >
              <Input
                maxLength={150}
                onInput={(e) => (e.target.value = e.target.value.toUpperCase())}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="capacidad"
              label="Capacidad"
              rules={[
                {
                  pattern: /^\d+$/,
                  message: 'Solo se permiten números',
                },
              ]}
            >
              <Input
                maxLength={15}
                onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="pesoReferencia"
              label="Peso Referencia"
              rules={[
                { required: true, message: 'Por favor ingrese el peso referencia' },
                {
                  pattern: /^\d+$/,
                  message: 'Solo se permiten números',
                },
              ]}
            >
               <Input
                maxLength={15}
                onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Form.Item
                  name="estado"
                  valuePropName="checked"
              >
                  <Checkbox>Estado</Checkbox>
              </Form.Item>
              </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

ModalEnvaces.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  envace: PropTypes.object,
  tiposEnvases: PropTypes.array.isRequired,
};

export default ModalEnvaces;
