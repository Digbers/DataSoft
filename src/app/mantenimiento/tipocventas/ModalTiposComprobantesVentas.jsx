import { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';

const ModalTiposComprobantesVentas = ({ visible, form, onClose, onSave, tipoComprobanteVenta }) => {

  // Cargar los valores de la moneda en el formulario si estamos editando
  useEffect(() => {
    if (tipoComprobanteVenta) {
      console.log(tipoComprobanteVenta);
      form.setFieldsValue(tipoComprobanteVenta);
    } else {
      form.resetFields();
    }
  }, [tipoComprobanteVenta, form]);
  
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
      title={tipoComprobanteVenta ? 'Editar Tipo de Comprobante de Venta' : 'Nuevo Tipo de Comprobante de Venta'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
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
            { max: 100, message: 'La descripción debe tener máximo 100 caracteres' }
          ]}
        >
          <Input
            maxLength={100}
            onInput={(e) => e.target.value = e.target.value.toUpperCase()}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

ModalTiposComprobantesVentas.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  tipoComprobanteVenta: PropTypes.object,
};


export default ModalTiposComprobantesVentas;