import { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';

const ModalTiposDocumentos = ({ visible, form, onClose, onSave, tipoDocumento }) => {

  // Cargar los valores de la moneda en el formulario si estamos editando
  useEffect(() => {
    if (tipoDocumento) {
      console.log(tipoDocumento);
      form.setFieldsValue(tipoDocumento);
    } else {
      form.resetFields();
    }
  }, [tipoDocumento, form]);
  
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
      title={tipoDocumento ? 'Editar Tipo de Documento' : 'Nuevo Tipo de Documento'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="docCodigo"
          label="Código"
          rules={[
            { required: true, message: 'Por favor ingrese el código' },
            { max: 3, message: 'El código debe tener máximo 3 caracteres' }
          ]}
        >
          <Input
            maxLength={3}
            onInput={(e) => e.target.value = e.target.value.toUpperCase()}
          />
        </Form.Item>
        <Form.Item
          name="descripcion"
          label="Descripción"
          rules={[
            { required: true, message: 'Por favor ingrese la descripción' },
            { max: 100, message: 'La descripción debe tener máximo 100 caracteres' }
          ]}
        >
          <Input
            maxLength={100}
            onInput={(e) => e.target.value = e.target.value.toUpperCase()}
          />
        </Form.Item>
        <Form.Item
          name="codigoSunat"
          label="Código Sunat"
          rules={[
            { required: true, message: 'Por favor ingrese el código sunat' },
            { max: 3, message: 'El código sunat debe tener máximo 3 caracteres' }
          ]}
        >
          <Input
            maxLength={3}
            onInput={(e) => e.target.value = e.target.value.toUpperCase()}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

ModalTiposDocumentos.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  tipoDocumento: PropTypes.object,
};

export default ModalTiposDocumentos;
