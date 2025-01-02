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
import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from '../config/axiosConfig';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';
import { Carousel } from 'antd';


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
  const [forecastData, setForecastData] = useState(null); // Datos reales
  const [error, setError] = useState(false); // Estado de error
  const [egresosIngresos, setEgresosIngresos] = useState({});
  const fechaInicio = dayjs().format('YYYY-MM-DD'); // Fecha por defecto (hoy)
  const { sesionEmpId } = useAuth();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({});
  const [salesData, setSalesData] = useState(null);

  const fetchEgresosIngresos = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/finanzas/reportes/ingresos-egresos/${sesionEmpId}`,
        {
          params: {
            fecha: fechaInicio,
          },
        }
      );
      setEgresosIngresos(response.data);
    } catch (error) {
      console.error('Error fetching egresos/ingresos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al obtener los datos de egresos/ingresos',
      });
    }
  };
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/inventario/productos/find-productos/${sesionEmpId}`);
      setProducts(response.data);
      const product = response.data.find(p => p.codigo === "POLLOSAC");
      setSelectedProduct(product);
    } catch (error) {
      console.error('Error fetching products:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al obtener los datos de productos',
      });
    }
  };
  const fetchProductosXClientes = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/ventas/comprobantes/productos-xcliente/${fechaInicio}`);
      const data = response.data;

      // Transforma los datos en el formato necesario
      const transformedData = transformSalesData(data);
      setSalesData(transformedData);
    } catch (error) {
      console.error('Error fetching products/clients:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al obtener los datos de productos/clientes',
      });
    }
  };

  // Función para generar fechas dinámicas para la semana actual
  const getCurrentWeekDates = () => {
    const today = new Date();
    const dates = []; 

    // Obtener los últimos 7 días desde hoy
    for (let i = 0; i <= 6; i++) { // Desde 0 hasta 6 días a partir de hoy
      const date = new Date();
      date.setDate(today.getDate() + i); // Sumar días
      dates.push(date.toISOString().split('T')[0]); // Convertir a formato YYYY-MM-DD
  }
    
    return dates;
  };
  // Obtener predicciones para el producto seleccionado
  const fetchPredictions = async (productId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/ventas/prediccion-ventas/${sesionEmpId}`, {
        params: { idProducto: productId },
      });

      const { predicciones } = response.data;
      console.log('Predicciones:', predicciones);

      // Mapeo de los datos obtenidos
      setForecastData({
        labels: predicciones.map((p) => p.fecha), // Fechas provistas por la API
        datasets: [
          {
            label: 'Pronóstico de Ventas',
            data: predicciones.map((p) => p.demanda_predicha), // Valores predichos
            borderColor: 'rgba(54, 162, 235, 0.6)', // Color de la línea
            fill: false,
          },
        ],
      });

      setError(false); // Limpiar estado de error si la carga fue exitosa
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setError(true); // En caso de error, marcar el estado
    }
  };

  useEffect(() => {
    fetchEgresosIngresos();
    fetchProductosXClientes();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct.id) {
      fetchPredictions(selectedProduct.id);
    }
  }, [selectedProduct]);


  // Placeholder en caso de error
  const placeholderData = {
    labels: getCurrentWeekDates(), 
    datasets: [
      {
        label: 'Datos no disponibles',
        data: [0, 0, 0, 0, 0, 0, 0], // Datos ficticios
        borderColor: 'rgba(255, 99, 132, 0.6)', // Color para indicar falta de datos
        fill: false,
      },
    ],
  };
  // Datos de ejemplo
  /*
  const salesData = useMemo(() => ({
    labels: ['Cliente 1', 'Cliente 2', 'Cliente 3'], // Clientes
    datasets: [
      {
        label: 'Pollo Sacrificado',
        data: [50, 30, 80], // Cantidad de pollo vendido por cliente
        backgroundColor: 'rgba(75, 192, 192, 0.6)', // Color para "Pollo"
      },
      {
        label: 'Pato Sacrificado',
        data: [10, 20, 5], // Cantidad de pato vendido por cliente
        backgroundColor: 'rgba(192, 75, 75, 0.6)', // Color para "Pato"
      },
    ],
  }), []);*/
  const options = useMemo(() => ({
    plugins: {
      tooltip: {
        enabled: true,
      },
      legend: {
        display: true,
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
    maintainAspectRatio: false,
  }), []);
  // Función para transformar datos
  const transformSalesData = (data) => {
    // Desestructura la respuesta del servidor
    const { nombresClientes, productosCantidades } = data;

    // Crea la estructura para labels y datasets
    return {
      labels: nombresClientes, // Clientes
      datasets: productosCantidades.map((producto) => ({
        label: producto.label, // Nombre del producto
        data: producto.data, // Cantidades para cada cliente
        backgroundColor: generateRandomColor(), // Color para cada producto
      })),
    };
  };

  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, 0.6)`;
  };
  
  

  const flatProducts = products.flat(); // Asegúrate de aplanar el array
  const groupedProducts = flatProducts.reduce((acc, curr, index) => {
    const groupIndex = Math.floor(index / 2);
    if (!acc[groupIndex]) {
      acc[groupIndex] = [];
    }
    acc[groupIndex].push(curr);
    return acc;
  }, []);
  //console.log('Productos agrupados:', groupedProducts);
  
  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-auto h-full relative">
      <h1 className="text-2xl font-bold mb-8">Dashboard de Inventario</h1>

      {/* Resumen de Inventario */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 shadow-lg p-4 rounded-lg border border-gray-200 dark:border-gray-700 w-full overflow-hidden">
          {groupedProducts.length > 0 ? (
            <Carousel autoplay dotPosition="bottom" autoplaySpeed={5000} className="w-full">
              {groupedProducts.map((group, groupIndex) => (
                <div key={groupIndex} className="flex justify-start w-full min-w-0">
                  {group.map((product) => (
                    <div
                      key={`${product.nombre}-${product.codigo}-${groupIndex}`}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 w-auto flex-shrink-0 mx-2"
                    >
                      <div className="flex items-center">
                        <i className="fa-solid fa-box-open text-blue-500 dark:text-blue-400 mr-4" />
                        <div>
                          <h2 className="font-semibold text-sm">{product.nombre}</h2>
                          <p className="text-sm">{product.stock} unidades</p>
                          <p className="text-sm">P. Venta: S/. {product.precioVenta}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </Carousel>
          ) : (
            <p>No hay productos disponibles para mostrar</p>
          )}
        </div>
        <div className='flex justify-evenly md:col-span-3'>
            {/* Total de Ingresos */}
          <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 shadow-lg p-6 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center">
            <div className="mr-4">
              <i className="fa-solid fa-dollar-sign size-2x text-green-500 dark:text-green-400" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Total de Ingresos</h2>
              <p className="text-2xl">S/. {egresosIngresos.ingresos ? egresosIngresos.ingresos : 0}</p>
            </div>
          </div>

          {/* Total de Egresos */}
          <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 shadow-lg p-6 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center">
            <div className="mr-4">
              <i className="fa-solid fa-shopping-bag size-2x text-red-500 dark:text-red-400" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Total de Egresos</h2>
              <p className="text-2xl">S/. {egresosIngresos.egresos ? egresosIngresos.egresos : 0}</p>
            </div>
          </div>

          {/* Margen de Ganancia */}
          <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 shadow-lg p-6 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center">
            <div className="mr-4">
              <i className="fa-solid fa-percentage size-2x text-yellow-500 dark:text-yellow-400" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Margen de Ganancia</h2>
              <p className="text-2xl">{egresosIngresos.margen ? egresosIngresos.margen : 0}%</p>
            </div>
          </div>

        </div>
        
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de Proyección de Ventas */}
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 shadow-lg p-6 rounded-lg border border-gray-200 dark:border-gray-700" style={{ height: '400px' }}>
          <h2 className="font-semibold text-lg mb-4 flex items-center">
            <i className="fa-solid fa-chart-line mr-2" />
            Ventas por Clientes
          </h2>
          {salesData ? (
            <BarChart data={salesData} options={options} />
          ) : (
            <p>Cargando datos...</p>
          )}
          
        </div>

        {/* Gráfico de Pronóstico de Ventas */}
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 shadow-lg p-6 rounded-lg border border-gray-200 dark:border-gray-700" style={{ height: '400px' }}>
          <h2 className="font-semibold text-lg mb-4 flex items-center">
            <i className="fa-solid fa-chart-line mr-2" />
            Pronóstico de Ventas para Próximos 7 Días
          </h2>
          {error ? (
            <>
              <p>Error al cargar datos. Mostrando gráfico con datos no disponibles.</p>
              <LineChart data={placeholderData} />
            </>
          ) : forecastData ? (
            <LineChart data={forecastData} />
          ) : (
            <p>Cargando datos...</p>
          )}
        </div>
      </div>

      {/* Gestión de Compras 
      <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 shadow-lg p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="font-semibold text-lg mb-4 flex items-center">
          <i className="fa-solid fa-shopping-bag mr-2" />
          Gestión de Compras
        </h2>
        <p className="text-xl">Sugerencia: Comprar 50 Pollos para mañana</p>
      </div> */}
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
