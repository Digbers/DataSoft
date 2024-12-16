import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, InputNumber, DatePicker } from 'antd';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';


const EditModal = ({ visible, onClose, onSave, form, comprobante, monedas, formasCobros, cobro}) => {

  useEffect(() => {
    if (comprobante) {
      if(cobro){
        console.log(cobro);
        console.log(comprobante);
              // Desestructuramos para transformar fechaCobro
        const { fechaCobro, ...resto } = cobro;

        // Creamos el nuevo objeto con la fecha transformada
        const nuevoCobro = {
          ...resto,
          fechaCobro: dayjs(fechaCobro, 'YYYY-MM-DD'), // Convertimos a day.js
        };
        console.log(nuevoCobro);
        form.setFieldsValue(nuevoCobro);
      }
    } else {
      form.resetFields();
    }
  }, [comprobante, form]);
  
  const handleSubmit = async () => {
    try {
      //validar que no exeda el saldo del comprobante
      if(cobro.montoCobrado > comprobante.saldo){
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'El monto cobrado no puede ser mayor al saldo del comprobante',
        });
        return;
      }
      const values = await form.validateFields();
      const fechaParseada = values.fechaCobro.format('YYYY-MM-DD');
      const nuevoCobro = {
        ...values,
        idComprobanteVenta: cobro.idComprobanteVenta,
        id: cobro.id,
        idEmpresa: cobro.idEmpresa,
        fechaCobro: fechaParseada
      }
      onSave(nuevoCobro);
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
      title={cobro ? 'Editar Cobro' : 'No existe cobro'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form 
        form={form} 
        layout="vertical" 
      >
        <Row gutter={16}>
          {/* Campo Código */}
          <Col span={12}>
            <Form.Item
              name="fechaCobro"
              label="Fecha"
              rules={[{ required: true, message: 'Por favor ingrese la fecha' }]}
            >
              <DatePicker format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="formasDeCobros"
              label="Forma de Cobro"
              rules={[{ required: true, message: 'Por favor seleccione la forma de cobro' }]}
            >
              <Select>
                {formasCobros && formasCobros.map((formaCobro, index) => (
                  <Select.Option key={formaCobro.value || index} value={formaCobro.value}>
                    {formaCobro.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="monedas"
              label="Moneda"
              rules={[{ required: true, message: 'Por favor selecciona una moneda' }]}
            >
              <Select>
                {monedas && monedas.map((moneda, index) => (
                  <Select.Option key={moneda.value || index} value={moneda.value} selected={moneda.value === comprobante?.monedaCodigo} disabled>
                    {moneda.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          {/* Campo Monto Cobrado */}
          <Col span={12}>
            <Form.Item
              name="montoCobrado"
              label="Monto Cobrado"
              rules={[{ required: true, message: 'Por favor ingrese el monto cobrado' }]}
            >
              <InputNumber 
                min={0}
                max={comprobante.saldo}
                style={{ width: '100%' }} 
                onKeyPress={(e) => {
                  if (!/^\d+$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Campo para seleccionar envase */}
          <Col span={24}>
            <Form.Item
              name="descripcion"
              label="Descripción"
              rules={[{ required: true, message: 'Por favor ingrese la descripción' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
EditModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  comprobante: PropTypes.object,
  monedas: PropTypes.array.isRequired,
  formasCobros: PropTypes.array.isRequired,
  cobro: PropTypes.object.isRequired,
};

export default EditModal;
