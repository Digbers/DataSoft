import { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';

const ModalPuntoVenta = ({ visible, form, onClose, onSave, puntoVenta, almacenes }) => {

  // Cargar los valores de la moneda en el formulario si estamos editando
  useEffect(() => {
    if (puntoVenta) {
      console.log(puntoVenta);
      form.setFieldsValue(puntoVenta);
    } else {
      form.resetFields();
    }
  }, [puntoVenta, form]);
  
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
      title={puntoVenta ? 'Editar Punto de Venta' : 'Nuevo Punto de Venta'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="direccion"
          label="Dirección"
          rules={[
            { required: true, message: 'Por favor ingrese la dirección' },
            { max: 100, message: 'La dirección debe tener máximo 100 caracteres' }
          ]}
        >
          <Input
            maxLength={100}
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
          name="almacen"
          label="Almacén"
          rules={[{ required: true, message: 'Por favor seleccione el almacén' }]}
        >
          <Select>
            {almacenes && almacenes.map((almacen, index) => (
              <Select.Option key={almacen.value || index} value={almacen.value}>
                {almacen.label}
              </Select.Option>
            ))}
              </Select>
            </Form.Item>
      </Form>
    </Modal>
  );
};

ModalPuntoVenta.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  puntoVenta: PropTypes.object,
  almacenes: PropTypes.array.isRequired,
};

export default ModalPuntoVenta;