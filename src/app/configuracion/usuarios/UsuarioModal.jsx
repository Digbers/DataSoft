import { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import PropTypes from 'prop-types';

const UsuarioModal = ({ visible, form, onClose, onSave, usuario, roles }) => {
  // Establece el rol actual del usuario al editar
  useEffect(() => {
    if (usuario) {
      form.setFieldsValue({
        codigo: usuario.usercodigo,
        nombre: usuario.username,
        rol: usuario.roles?.[0]?.id, // Ajusta según cómo tengas la estructura del rol
      });
    } else {
      form.resetFields();
    }
  }, [usuario, form]);

  return (
    <Modal
      title={usuario ? 'Editar Usuario' : 'Agregar Usuario'}
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
    >
      <Form form={form} layout="vertical" onFinish={onSave}>
        <Form.Item
          name="codigo"
          label="Código de Usuario"
          rules={[
            { required: true, message: 'Por favor ingrese el código de usuario' },
            { max: 5, message: 'El código debe tener máximo 5 caracteres' }
          ]}
        >
          <Input
            placeholder="Código de usuario"
            maxLength={5}
            onInput={(e) => e.target.value = e.target.value.toUpperCase()}
          />
        </Form.Item>
        
        <Form.Item
          name="nombre"
          label="Nombre de Usuario"
          rules={[
            { required: true, message: 'Por favor ingrese el nombre del usuario' },
            { max: 20, message: 'El nombre debe tener máximo 20 caracteres' }
          ]}
        >
          <Input
            placeholder="Nombre del usuario"
            maxLength={20}
          />
        </Form.Item>
        <Form.Item
          name="password"
          label="Contraseña"
          rules={[
            { required: usuario ? false : true, message: 'Por favor ingrese la contraseña' },
            { max: 30, message: 'La contraseña debe tener máximo 30 caracteres' }
          ]}
        >
          <Input
            placeholder="Sin cambios"
            maxLength={30}
          />
        </Form.Item>

        <Form.Item
          name="rol"
          label="Rol"
          rules={[{ required: true, message: 'Por favor selecciona un rol' }]}
        >
          <Select placeholder="Selecciona un rol">
            {roles.map((rol) => {
              //console.log("Renderizando rol:", rol); // Debug: Ver cada rol
              return (
                <Select.Option key={rol.value} value={rol.value}>
                  {rol.label}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

UsuarioModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  usuario: PropTypes.object,
  roles: PropTypes.array.isRequired,
  form: PropTypes.object.isRequired,
};

export default UsuarioModal;
