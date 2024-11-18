import { useEffect } from 'react';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';
import '@fortawesome/fontawesome-free/css/all.min.css';
import CustomButton from "../../../components/inputs/CustomButton";

const MetodosPagos = ({ formData, availablePaymentMethods, selectedsPaymentMethod, setSelectedsPaymentMethod }) => {
    const shouldShowPaymentTable = formData.estado !== 'CRE';

    // Busca el método de pago efectivo (EFE) y lo agrega al array de métodos de pago
    useEffect(() => {
      console.log(availablePaymentMethods);
      let metodoEfectivo = availablePaymentMethods.find((method) => method.value === 'EFE');
      if (metodoEfectivo) {
        setSelectedsPaymentMethod((prev) => {
          // Solo agrega si no está ya presente
          const exists = prev.some((method) => method.value === 'EFE');
      
          if (exists) {
            // Si ya existe, actualiza solo la cantidad
            return prev.map((method) =>
              method.value === 'EFE' ? { ...method, cantidad: formData.total } : method
            );
          } else {
            // Si no existe, agrégalo con la cantidad inicial de formData.total
            return [...prev, { ...metodoEfectivo, cantidad: formData.total }];
          }
        });
      }
    }, [formData, availablePaymentMethods, setSelectedsPaymentMethod]);

    // Función que calcula la suma total de las cantidades
    const getTotalPaymentAmount = () => {
      return selectedsPaymentMethod.reduce((sum, method) => sum + (method.cantidad || 0), 0);
    };

    // Función para agregar otro método de pago
    const handlePaymentMetodAdd = () => {
      if (getTotalPaymentAmount() >= formData.total) {
        Swal.fire('Advertencia', 'El monto total ya ha sido alcanzado', 'warning');
        return;
      }
      let metodoEfectivo = availablePaymentMethods.find((method) => method.formaPago !== 'EFE');
      let nuevoMonto = formData.total - getTotalPaymentAmount();
      if (metodoEfectivo) {
        setSelectedsPaymentMethod((prev) => [...prev, { ...metodoEfectivo, cantidad: nuevoMonto }]);
      }
    };

    // Actualiza el método de pago seleccionado
    const handlePaymentMethodChange = (index, newFormaPago) => {
      const updatedPayments = [...selectedsPaymentMethod];
      updatedPayments[index].formaPago = newFormaPago;
      setSelectedsPaymentMethod(updatedPayments);
    };

    // Actualiza la cantidad del método de pago
    const handlePaymentAmountChange = (index, newAmount) => {
      const updatedPayments = [...selectedsPaymentMethod];
      updatedPayments[index].cantidad = newAmount;

      // Validar que la suma no sea mayor que el total
      const totalAmount = getTotalPaymentAmount();
      if (totalAmount > formData.total) {
        Swal.fire('Error', 'La suma de los métodos de pago no puede exceder el total', 'error');
        return;
      }

      setSelectedsPaymentMethod(updatedPayments);
    };

    // Elimina un método de pago
    const handleRemovePaymentMethod = (index) => {
      const updatedPayments = selectedsPaymentMethod.filter((_, i) => i !== index);
      setSelectedsPaymentMethod(updatedPayments);
    };

    return (
      <>
        {shouldShowPaymentTable && (
          <div className="mt-4 col-span-2">
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="col-span-1">
                <CustomButton 
                  placeholder="Formas de Pago" 
                  onClick={handlePaymentMetodAdd} 
                  sizeClass="px-4 py-2"
                ><i className="fas fa-plus"></i></CustomButton>
              </div>
            </div>
            <div className='grid grid-cols-1'>
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
                  <tr>
                    <th className="px-4 py-2 border-b">Forma de Pago</th>
                    <th className="px-4 py-2 border-b">Cantidad</th>
                    <th className="px-4 py-2 border-b">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedsPaymentMethod.map((pm, index) => (
                    <tr key={index} className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'>
                      <td className="px-4 py-2 border-b">
                        <select
                          value={pm.formaPago}
                          onChange={(e) => handlePaymentMethodChange(index, e.target.value)}
                          className="w-full h-8 px-2 py-1 bg-gray-200 dark:bg-gray-600 border border-gray-300 rounded-md"
                        >
                          {availablePaymentMethods.map((method) => (
                            <option key={method.value} value={method.value}>
                              {method.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2 border-b">
                        <input
                          type="number"
                          value={pm.cantidad}
                          onChange={(e) => handlePaymentAmountChange(index, parseFloat(e.target.value))}
                          className="w-full h-8 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-md"
                        />
                      </td>
                      <td className="px-4 py-2 border-b text-center">
                        <button
                          onClick={() => handleRemovePaymentMethod(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4">Total Actual: {getTotalPaymentAmount()} / Total Necesario: {formData.total}</p>
            </div>
          </div>
        )}
      </>
    );
  };

MetodosPagos.propTypes = {
  formData: PropTypes.object.isRequired,
  availablePaymentMethods: PropTypes.array.isRequired,
  setSelectedsPaymentMethod: PropTypes.func.isRequired, // Cambia el nombre aquí también
  selectedsPaymentMethod: PropTypes.array.isRequired,
};

export default MetodosPagos;
