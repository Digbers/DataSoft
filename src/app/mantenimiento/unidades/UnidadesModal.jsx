import { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';

const UnidadesModal = ({ visible, form, onClose, onSave, unidad }) => {

  // Cargar los valores de la moneda en el formulario si estamos editando
  useEffect(() => {
    if (unidad) {
      console.log(unidad);
      form.setFieldsValue(unidad);
    } else {
      form.resetFields();
    }
  }, [unidad, form]);
  
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
      title={unidad ? 'Editar Unidad' : 'Nueva Unidad'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="idEmpresa"
          label="Empresa"
          rules={[
            { required: true, message: 'Por favor ingrese la empresa' },
            { max: 100, message: 'La empresa debe tener máximo 100 caracteres' }
          ]}
        >
          <Input
            maxLength={100}
            onInput={(e) => e.target.value = e.target.value.toUpperCase()}
          />
        </Form.Item>
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
      </Form>
    </Modal>
  );
};

UnidadesModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  unidad: PropTypes.object,
};

export default UnidadesModal;
