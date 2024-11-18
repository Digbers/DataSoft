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
import { Bar, Line } from 'react-chartjs-2'; 
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const BarChart = React.memo(({ data }) => (
  <Bar data={data} options={{ maintainAspectRatio: false }} />
));
BarChart.displayName = 'BarChart';

const LineChart = React.memo(({ data }) => (
  <Line data={data} options={{ maintainAspectRatio: false }} />
));
LineChart.displayName = 'LineChart';

const Dashboard = () => {
  // Datos de ejemplo
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

  const forecastData = useMemo(() => ({
    labels: ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Día 7'],
    datasets: [
      {
        label: 'Pronóstico de Ventas',
        data: [150, 130, 180, 200, 220, 210, 230],
        borderColor: 'rgba(54, 162, 235, 0.6)',
        fill: false,
      },
    ],
  }), []);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-auto h-full relative">
      <h1 className="text-2xl font-bold mb-8">Dashboard de Inventario</h1>

      {/* Resumen de Inventario */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stock Actual */}
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 shadow-lg p-6 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center">
          <div className="mr-4">
            <i className="fa-solid fa-box-open size-2x text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Stock Actual</h2>
            <p className="text-xl">500 Pollos (Vivos)</p>
            <p className="text-xl">200 Pollos (Sacrificados)</p>
            <p className="text-xl">300 Pollos (En Proceso de Venta)</p>
            <p className="text-xl">150 Pollos (Vendidos)</p>
          </div>
        </div>

        {/* Total de Ingresos */}
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 shadow-lg p-6 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center">
          <div className="mr-4">
            <i className="fa-solid fa-dollar-sign size-2x text-green-500 dark:text-green-400" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Total de Ingresos</h2>
            <p className="text-2xl">S/. 15,000</p>
          </div>
        </div>

        {/* Total de Egresos */}
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 shadow-lg p-6 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center">
          <div className="mr-4">
            <i className="fa-solid fa-shopping-bag size-2x text-red-500 dark:text-red-400" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Total de Egresos</h2>
            <p className="text-2xl">S/. 12,000</p>
          </div>
        </div>

        {/* Margen de Ganancia */}
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 shadow-lg p-6 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center">
          <div className="mr-4">
            <i className="fa-solid fa-percentage size-2x text-yellow-500 dark:text-yellow-400" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Margen de Ganancia</h2>
            <p className="text-2xl">20%</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de Proyección de Ventas */}
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 shadow-lg p-6 rounded-lg border border-gray-200 dark:border-gray-700" style={{ height: '400px' }}>
          <h2 className="font-semibold text-lg mb-4 flex items-center">
            <i className="fa-solid fa-chart-line mr-2" />
            Proyecciones de Ventas y Consumo
          </h2>
          <BarChart data={salesData} />
        </div>

        {/* Gráfico de Pronóstico de Ventas */}
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 shadow-lg p-6 rounded-lg border border-gray-200 dark:border-gray-700" style={{ height: '400px' }}>
          <h2 className="font-semibold text-lg mb-4 flex items-center">
            <i className="fa-solid fa-chart-line mr-2" />
            Pronóstico de Ventas para Próximos 7 Días
          </h2>
          <LineChart data={forecastData} />
        </div>
      </div>

      {/* Gestión de Compras */}
      <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 shadow-lg p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="font-semibold text-lg mb-4 flex items-center">
          <i className="fa-solid fa-shopping-bag mr-2" />
          Gestión de Compras
        </h2>
        <p className="text-xl">Sugerencia: Comprar 50 Pollos para mañana</p>
      </div>

      {/* Monitoreo de Ventas */}
      <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 shadow-lg p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-lg mb-4 flex items-center">
          <i className="fa-solid fa-user mr-2" />
          Monitoreo de Ventas y Ganancias
        </h2>
        <p className="text-xl">Ventas por Hora: 100 unidades</p>
        <p className="text-xl">Margen de Ganancia: 20%</p>
      </div>
    </div>
  );
};

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

LineChart.propTypes = {
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        data: PropTypes.arrayOf(PropTypes.number).isRequired,
        borderColor: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default Dashboard;
