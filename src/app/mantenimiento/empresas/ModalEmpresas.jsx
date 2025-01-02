import { useEffect, useState } from 'react';
import { Modal, Form, Input, Checkbox, Row, Col, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';

const ModalEmpresas = ({ visible, form, onClose, onSave, empresa, file, setFile }) => {
  const [fileList, setFileList] = useState([]);

  // Cargar los valores de la moneda en el formulario si estamos editando
  useEffect(() => {
    if (empresa) {
      form.setFieldsValue(empresa);
  
      // Sincronizar logo existente
      if (empresa.logo) {
        const initialFile = {
          uid: '-1',
          name: 'logo.png',
          status: 'done',
          url: empresa.logo,
        };
        setFileList([initialFile]);
        setFile(initialFile); // Sincronizamos el archivo global
      }
    } else {
      form.resetFields();
      setFileList([]);
      setFile(null); // Limpieza del archivo global
    }
  }, [empresa, form, setFile]);
  const handleFileChange = ({ fileList }) => {
    // Actualizamos el fileList local y el archivo externo
    const updatedFileList = fileList.slice(-1); // Solo un archivo
    setFileList(updatedFileList);
    setFile(updatedFileList[0] || null); // En caso de que no haya archivo
  };
  
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('Submitting values:', values);
    console.log('File in submit:', file);
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
      title={empresa ? 'Editar Empresa' : 'Nueva Empresa'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical"
        initialValues={{
          estado: true
        }}
      >
      <Row gutter={16}>
          {/* Campo Código */}
          <Col span={12}>
          <Form.Item
            name="empresaCodigo"
            label="Código Empresa"
            rules={[
              { required: true, message: 'Por favor ingrese el código' },
              { max: 11, message: 'El código debe tener máximo 11 caracteres' }
            ]}
          >
            <Input
              maxLength={11}
              onInput={(e) => e.target.value = e.target.value.toUpperCase()}
            />
          </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="razonSocial"
              label="Razón Social"
              rules={[
                { required: true, message: 'Por favor ingrese la razón social' },
                { max: 200, message: 'La razón social debe tener máximo 200 caracteres' }
              ]}
            >
              <Input
                maxLength={200}
                onInput={(e) => e.target.value = e.target.value.toUpperCase()}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
          <Form.Item
            name="ruc"
            label="Documento"
            rules={[
              { required: true, message: 'Por favor ingrese el RUC' },
              {
                pattern: /^\d+$/,
                message: 'Solo se permiten números',
              },
            ]}
          >
            <Input
                maxLength={11}
                onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))}
              />
          </Form.Item>
          </Col>
          <Col span={12}>
          <Form.Item
            name="direccion"
            label="Dirección"
            rules={[
              { required: true, message: 'Por favor ingrese la dirección' },
              { max: 255, message: 'La dirección debe tener máximo 255 caracteres' }
            ]}
          >
            <Input
              maxLength={255}
              onInput={(e) => e.target.value = e.target.value.toUpperCase()}
            />
          </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="departamento"
              label="Departamento"
              rules={[
                { required: true, message: 'Por favor ingrese el departamento' },
                { max: 40, message: 'El departamento debe tener máximo 40 caracteres' }
              ]}
            >
              <Input
                maxLength={40}
                onInput={(e) => e.target.value = e.target.value.toUpperCase()}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="provincia"
              label="Provincia"
              rules={[
                { required: true, message: 'Por favor ingrese la provincia' },
                { max: 40, message: 'La provincia debe tener máximo 40 caracteres' }
              ]}
            >
              <Input
                maxLength={40}
                onInput={(e) => e.target.value = e.target.value.toUpperCase()}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="distrito"
              label="Distrito"
              rules={[
                { required: true, message: 'Por favor ingrese el distrito' },
                { max: 40, message: 'El distrito debe tener máximo 40 caracteres' }
              ]}
            >
              <Input
                maxLength={40}
                onInput={(e) => e.target.value = e.target.value.toUpperCase()}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="ubigeo"
              label="Ubigeo"
              rules={[
                { required: true, message: 'Por favor ingrese el Ubigeo' },
                {
                  pattern: /^\d+$/,
                  message: 'Solo se permiten números',
                },
              ]}
            >
              <Input
                maxLength={6}
                onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="telefono"
              label="Teléfono"
              rules={[
                { required: true, message: 'Por favor ingrese el teléfono' },
                {
                  pattern: /^\d+$/,
                  message: 'Solo se permiten números',
                },
              ]}
            >
              <Input
                maxLength={20}
                onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="celular"
              label="Celular"
              rules={[
                { required: true, message: 'Por favor ingrese el celular' },
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
              name="correo"
            label="Correo"
            rules={[
              { required: true, message: 'Por favor ingrese el correo' },
              { max: 50, message: 'El correo debe tener máximo 50 caracteres' }
            ]}
          >
            <Input
              maxLength={50}
            />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Form.Item
                  name="estado"
                  valuePropName="checked"
              >
                  <Checkbox>Estado</Checkbox>
              </Form.Item>
              </div>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="web"
              label="Web"
              rules={[
                { required: true, message: 'Por favor ingrese la web' },
                { max: 100, message: 'La web debe tener máximo 100 caracteres' }
              ]}
            >
              <Input
                maxLength={100}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            {/* Campo Imagen */}
            <Form.Item label="Logo" name="logo">
              <Upload
                beforeUpload={() => false} // No sube automáticamente
                onChange={handleFileChange}
                fileList={fileList} // Configuramos fileList
                maxCount={1} // Solo permite un archivo
                accept="image/*" // Solo imágenes
                listType="picture" // Muestra miniaturas
              >
                <Button icon={<UploadOutlined />}>Seleccionar Logo</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

ModalEmpresas.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  empresa: PropTypes.object,
  file: PropTypes.object,
  setFile: PropTypes.func,
};

export default ModalEmpresas;
