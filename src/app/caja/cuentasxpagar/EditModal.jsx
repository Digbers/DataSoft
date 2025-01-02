import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, InputNumber, DatePicker } from 'antd';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';


const EditModal = ({ visible, onClose, onSave, form, comprobante, monedas, formasPagos, pago}) => {

  useEffect(() => {
    if (comprobante) {
      if(pago){
        console.log(pago);
        console.log(comprobante);
              // Desestructuramos para transformar fechaCobro
        const { fechaPago, ...resto } = pago;

        // Creamos el nuevo objeto con la fecha transformada
        const nuevoPago = {
          ...resto,
          fechaPago: dayjs(fechaPago, 'YYYY-MM-DD'), // Convertimos a day.js
        };
        console.log(nuevoPago);
        form.setFieldsValue(nuevoPago);
      }
    } else {
      form.resetFields();
    }
  }, [comprobante, form]);
  
  const handleSubmit = async () => {
    try {
      //validar que no exeda el saldo del comprobante
      if(pago.montoPagado > comprobante.saldo){
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'El monto pagado no puede ser mayor al saldo del comprobante',
        });
        return;
      }
      const values = await form.validateFields();
      const fechaParseada = values.fechaPago.format('YYYY-MM-DD');
      const nuevoPago = {
        ...values,
        idComprobanteCompra: pago.idComprobanteCompra,
        id: pago.id,
        idEmpresa: pago.idEmpresa,
        fechaPago: fechaParseada
      }
      onSave(nuevoPago);
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
      title={pago ? 'Editar Pago' : 'No existe pago'}
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
              name="fechaPago"
              label="Fecha"
              rules={[{ required: true, message: 'Por favor ingrese la fecha' }]}
            >
              <DatePicker format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="formaPagosEntity"
              label="Forma de Pago"
              rules={[{ required: true, message: 'Por favor seleccione la forma de pago' }]}
            >
              <Select>
                {formasPagos && formasPagos.map((formaPago, index) => (
                  <Select.Option key={formaPago.value || index} value={formaPago.value}>
                    {formaPago.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="monedasEntity"
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
              name="montoPagado"
              label="Monto Pagado"
              rules={[{ required: true, message: 'Por favor ingrese el monto pagado' }]}
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
  formasPagos: PropTypes.array.isRequired,
  pago: PropTypes.object.isRequired,
};

export default EditModal;
