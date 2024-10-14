import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2'; 
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const BarChart = React.memo(({ data }) => {
  return <Bar data={data} options={{ maintainAspectRatio: false }} />;
});
BarChart.displayName = 'BarChart'; // Añadiendo nombre de visualización

const Dashboard = () => {
  // Datos de ejemplo para el gráfico de proyecciones de ventas
  const salesData = useMemo(() => ({
    labels: ['Hora 1', 'Hora 2', 'Hora 3', 'Hora 4', 'Hora 5', 'Hora 6', 'Hora 7'],
    datasets: [
      {
        label: 'Proyecciones de Ventas',
        data: [50, 70, 60, 90, 100, 80, 120],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  }), []);

  return (
    <div className="p-6 bg-gray-100 overflow-auto h-full relative">
      <h1 className="text-2xl font-bold mb-4">Dashboard de Inventario</h1>

      {/* Panel Principal: Resumen de Inventario */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white shadow-lg p-4 rounded-lg">
          <h2 className="font-semibold">Stock Actual</h2>
          <p className="text-xl">500 Pollos (Vivos)</p>
          <p className="text-xl">200 Pollos (Sacrificados)</p>
          <p className="text-xl">300 Pollos (En Proceso de Venta)</p>
          <p className="text-xl">150 Pollos (Vendidos)</p>
        </div>

        <div className="bg-white shadow-lg p-4 rounded-lg">
          <h2 className="font-semibold">Tiempo de Almacenamiento</h2>
          <p className="text-xl">Últimos 3 días</p>
        </div>

        <div className="bg-white shadow-lg p-4 rounded-lg">
          <h2 className="font-semibold">Estado del Stock</h2>
          <div className="flex flex-col">
            <span className="bg-green-500 text-white p-2 rounded mb-2">Verde: Stock Normal</span>
            <span className="bg-yellow-500 text-white p-2 rounded mb-2">Amarillo: Stock Alto</span>
            <span className="bg-red-500 text-white p-2 rounded">Rojo: Riesgo de Desperdicio</span>
          </div>
        </div>
      </div>

      {/* Proyecciones de Ventas y Consumo */}
      <div className="bg-white shadow-lg p-4 rounded-lg mb-6 h-72">
        <h2 className="font-semibold">Proyecciones de Ventas y Consumo</h2>
        <BarChart data={salesData} />
      </div>

      {/* Gestión de Compras */}
      <div className="bg-white shadow-lg p-4 rounded-lg mb-6">
        <h2 className="font-semibold">Gestión de Compras</h2>
        <p className="text-xl">Sugerencia: Comprar 50 Pollos para mañana</p>
      </div>

      {/* Monitoreo de Ventas y Ganancias */}
      <div className="bg-white shadow-lg p-4 rounded-lg">
        <h2 className="font-semibold">Monitoreo de Ventas y Ganancias</h2>
        <p className="text-xl">Ventas por Hora: 100 unidades</p>
        <p className="text-xl">Margen de Ganancia: 20%</p>
      </div>
    </div>
  );
};
// Definición de tipos de props para BarChart
BarChart.propTypes = {
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        data: PropTypes.arrayOf(PropTypes.number).isRequired,
        backgroundColor: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default Dashboard;
