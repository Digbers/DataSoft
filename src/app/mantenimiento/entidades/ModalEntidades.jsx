import { useEffect, useState } from 'react';
import { Modal, Form, Input, Checkbox, Select, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';

const ModalEntidades = ({ visible, form, onClose, onSave, entidad, documentosTipos, entidadesTipos }) => {
  const [maxLength, setMaxLength] = useState(8);
  const [isRuc, setIsRuc] = useState(false);

  const handleDocumentoTipoChange = (value) => {

    if (value === 'RUC') {
      setMaxLength(11);
      setIsRuc(true);
      form.setFieldsValue({ apellidoPaterno: '', apellidoMaterno: '' });
    } else if (value === 'DNI') {
      setMaxLength(8);
      setIsRuc(false);
    } else {
      setMaxLength(15);
      setIsRuc(false);
    }
    // Limpia el campo del número de documento al cambiar el tipo
    form.setFieldsValue({ nroDocumento: '' });
  };

  // Cargar los valores de la moneda en el formulario si estamos editando
  useEffect(() => {
    if (entidad) {
      //console.log(entidad);
      form.setFieldsValue(entidad);
    } else {
      form.resetFields();
    }
    // resetear el estado del isRuc
    if (entidad?.documentoTipo === 'RUC') {
      setIsRuc(true);
      setMaxLength(11);
    } else if (entidad?.documentoTipo === 'DNI') {
      setMaxLength(8);
      setIsRuc(false);
    } else {
      setMaxLength(15);
      setIsRuc(false);
    }
  }, [entidad, form]);
  
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
      title={entidad ? 'Editar Entidad' : 'Nueva Entidad'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical"
      initialValues={{
        documentoTipo: documentosTipos.find(tipo => tipo.codigo === 'DNI')?.codigo,
        estado: true,
        condicion: 'Habido',
        sexo: 'M',
      }}
      >
        <Row gutter={16}>
          <Col span={12}>
              <Form.Item
                name="documentoTipo"
              label="Tipo de Documento"
            >
              <Select onChange={handleDocumentoTipoChange}>
                {documentosTipos.map((documentoTipo) => (
                  <Select.Option key={documentoTipo.id} value={documentoTipo.id}>
                    {documentoTipo.codigo}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="nroDocumento"
              label="Número de Documento"
              rules={[
                { required: true, message: 'Por favor ingrese el número de documento' },
                {
                  pattern: /^\d+$/,
                  message: 'Solo se permiten números',
                },
                {
                  validator: (_, value) => {
                    if (!value || value.length <= maxLength) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(`El número de documento debe tener máximo ${maxLength} caracteres`)
                    );
                  },
                },
              ]}
            >
              <Input
                maxLength={maxLength}
                onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[
                { required: true, message: 'Por favor ingrese el nombre' },
                { max: 100, message: 'El nombre debe tener máximo 100 caracteres' }
              ]}
            >
              <Input
                maxLength={255}
                onInput={(e) => e.target.value = e.target.value.toUpperCase()}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="apellidoPaterno"
              label="Apellido Paterno"
              rules={[
                { required: !isRuc, message: 'Por favor ingrese el apellido paterno' },
                { max: 200, message: 'El apellido paterno debe tener máximo 200 caracteres' }
              ]}
            >
              <Input
                maxLength={200}
                onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                disabled={isRuc}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="apellidoMaterno"
              label="Apellido Materno"
              rules={[
                { required: !isRuc, message: 'Por favor ingrese el apellido materno' },
                { max: 200, message: 'El apellido materno debe tener máximo 200 caracteres' },
              ]}
            >
              <Input
                maxLength={200}
                onInput={(e) => (e.target.value = e.target.value.toUpperCase())}
                disabled={isRuc}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
            name="direccion"
            label="Dirección"
            rules={[
              { max: 255, message: 'La dirección debe tener máximo 255 caracteres' }
            ]}
          >
            <Input
              maxLength={255}
            />
          </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
            name="email"
            label="Email"
            rules={[
              { max: 50, message: 'El email debe tener máximo 50 caracteres' }
            ]}
          >
            <Input
              maxLength={50}
            />
          </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="celular"
            label="Celular"
            rules={[
              { max: 15, message: 'El celular debe tener máximo 15 caracteres' },
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
            <Form.Item
              name="sexo"
            label="Sexo"
            rules={[
              { required: true, message: 'Por favor ingrese el sexo' },
              { max: 20, message: 'El sexo debe tener máximo 20 caracteres' }
            ]}
          >
            <Select>
              <Select.Option value="M">Masculino</Select.Option>
              <Select.Option value="F">Femenino</Select.Option>
              <Select.Option value="O">Otro</Select.Option>
            </Select>
          </Form.Item>
          </Col>
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
        <Row gutter={16}>
          <Col span={12}>
              <Form.Item
                name="condicion"
                label="Condición"
                rules={[
                  { required: true, message: 'Por favor ingrese el sexo' },
                  { max: 20, message: 'El sexo debe tener máximo 20 caracteres' }
                ]}
              >
            <Select>
              <Select.Option value="Habido">Habido</Select.Option>
              <Select.Option value="No habido">No habido</Select.Option>
            </Select>
          </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="entidadesTiposList"
              label="Tipo de Entidad"
              rules={[
                { 
                  required: true, 
                  message: 'Por favor seleccione al menos un tipo de entidad' 
                },
                () => ({
                  validator(_, value) {
                    if (value && value.length > 0) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Debe seleccionar al menos un tipo de entidad'));
                  },
                }),
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Seleccione los tipos de entidad"
                allowClear
              >
                {entidadesTipos.map((entidadTipo) => (
                  <Select.Option key={entidadTipo.codigo} value={entidadTipo.codigo}>
                    {entidadTipo.descripcion}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

      </Form>
    </Modal>
  );
};

ModalEntidades.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  entidad: PropTypes.object,
  documentosTipos: PropTypes.array.isRequired,
  entidadesTipos: PropTypes.array.isRequired,
};

export default ModalEntidades;
