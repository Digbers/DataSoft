import { useEffect} from 'react';
import { Modal, Form, Input} from 'antd';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';

const ModalComprobanteComprasEstados = ({ visible, form, onClose, onSave, estadoComprobante }) => {

  useEffect(() => {
    if (estadoComprobante) {
      //console.log(entidad);
      form.setFieldsValue(estadoComprobante);
    } else {
      form.resetFields();
    }
  }, [estadoComprobante, form]);
  
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
      title={estadoComprobante ? 'Editar Estado Comprobante' : 'Nuevo Estado Comprobante'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical"
      >
        <Form.Item
          name="codigo"
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
            { max: 50, message: 'La descripción debe tener máximo 50 caracteres' }
          ]}
        >
          <Input
            maxLength={50}
            onInput={(e) => e.target.value = e.target.value.toUpperCase()}
          />
        </Form.Item>

      </Form>
    </Modal>
  );
};
ModalComprobanteComprasEstados.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  estadoComprobante: PropTypes.object,
};


export default ModalComprobanteComprasEstados;