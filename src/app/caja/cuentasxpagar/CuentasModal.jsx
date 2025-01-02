import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, InputNumber, DatePicker } from 'antd';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';


const PagosModal = ({ visible, onClose, onSave, form, comprobante, monedas, formasPagos}) => {
  // Cargar los valores de la moneda en el formulario si estamos editando
  useEffect(() => {
    if (comprobante) {
        console.log(comprobante);
        form.setFieldsValue(comprobante);
    
    } else {
      form.resetFields();
    }
  }, [comprobante, form]);
  
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      let fechaParseada = values.fechaPago.format('YYYY-MM-DD');
      const nuevoCobro = {
        ...values,
        idComprobanteVenta: comprobante.idComprobanteCompra,
        fechaPago: fechaParseada
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
      title={comprobante ? 'Nuevo Pago' : 'No existe comprobante'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form 
        form={form} 
        layout="vertical" 
        initialValues={{ 
          formaPagosEntity: formasPagos[0]?.value,
          monedasEntity: comprobante.monedaCodigo,
          montoPagado: comprobante.saldo,
          fechaPago : dayjs()
        }}
      >
        <Row gutter={16}>
          {/* Campo Código */}
          <Col span={12}>
            <Form.Item
              name="fechaPago"
              label="Fecha"
              rules={[{ required: true, message: 'Por favor ingrese la fecha' }]}
            >
              <DatePicker format="DD/MM/YYYY" />

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
                  <Select.Option key={moneda.value || index} value={moneda.value} selected={moneda.value === comprobante.monedaCodigo} disabled>
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
PagosModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  comprobante: PropTypes.object,
  monedas: PropTypes.array.isRequired,
  formasPagos: PropTypes.array.isRequired,
};

export default PagosModal;
