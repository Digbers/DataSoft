import { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
const ModalAlmacen = ({ visible, form, onClose, onSave, almacen, tipos, padres }) => {

  // Cargar los valores de la moneda en el formulario si estamos editando
  useEffect(() => {
    if (almacen) {
      console.log(almacen);
      
        form.setFieldsValue({
          tipoAlmacen: almacen.tipoAlmacen,
          almacenPadre: almacen.almacenPadre === null ? padres[0]?.value : almacen.almacenPadre,
          nombre: almacen.nombre,
        }); 
      
    } else {
      form.resetFields();
    }
  }, [almacen, form]);

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
        title={almacen ? 'Editar Almacén' : 'Nuevo Almacén'}
        open={visible}
        onCancel={onClose}
        onOk={handleSubmit}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical"
          initialValues={{
            tipoAlmacen: tipos[0]?.value,
            almacenPadre: padres[0]?.value,
          }}
        >
        <Form.Item
          name="tipoAlmacen"
          label="Tipo"
          rules={[
            { required: true, message: 'Por favor ingrese el tipo' },
          ]}
        >
          <Select>
            {tipos.map(tipo => (
              <Select.Option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </Select.Option>
            ))}
          </Select>
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
          name="almacenPadre"
          label="Padre"
          rules={[
            { required: true, message: 'Por favor ingrese el padre' },
          ]}
        >
          <Select>
            {/* Opciones dinámicas */}
            {padres.map(padre => (
              <Select.Option key={padre.value} value={padre.value}>
                {padre.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

      </Form>
    </Modal>
  );
};

ModalAlmacen.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  almacen: PropTypes.object,
  tipos: PropTypes.array,
  padres: PropTypes.array,
};

export default ModalAlmacen;

