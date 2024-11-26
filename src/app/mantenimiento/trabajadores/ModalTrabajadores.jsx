import { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';

const ModalTrabajadores = ({ visible, form, onClose, onSave, trabajador }) => {

  // Cargar los valores de la moneda en el formulario si estamos editando
  useEffect(() => {
    if (trabajador) {
      console.log(trabajador);
      form.setFieldsValue(trabajador);
    } else {
      form.resetFields();
    }
  }, [trabajador, form]);
  
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
      title={trabajador ? 'Editar Trabajador' : 'Nuevo Trabajador'}
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
          name="nombre"
          label="Nombre"
          rules={[
            { required: true, message: 'Por favor ingrese el nombre' },
            { max: 100, message: 'El nombre debe tener máximo 100 caracteres' }
          ]}
        >
          <Input
            maxLength={100}
            onInput={(e) => e.target.value = e.target.value.toUpperCase()}
          />
        </Form.Item>
        <Form.Item
          name="simbolo"
          label="Símbolo"
          rules={[
            { required: true, message: 'Por favor ingrese el símbolo' },
            { max: 3, message: 'El símbolo debe tener máximo 3 caracteres' }
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

ModalTrabajadores.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  trabajador: PropTypes.object,
};

export default ModalTrabajadores;
