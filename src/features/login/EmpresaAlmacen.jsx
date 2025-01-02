import { useState, useEffect } from 'react';
import axios from 'axios';
//import avicola from '../../assets/avicola.png';
import milagro from '../../assets/ac-el-milagro.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import SelectInput from '../../components/inputs/SelectInput';
import { useAuth } from '../../context/AuthContext';
import PropTypes from 'prop-types';
import ParticlesComponent from '../../components/Particles';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';  // Importar SweetAlert2

const EmpresaAlmacen = ({ user, userCode }) => {
    const [empresas, setEmpresas] = useState([]);
    const [almacenes, setAlmacenes] = useState([]);
    const [puntosVenta, setPuntosVenta] = useState([]);
    const { loginComplete } = useAuth();
    const [formData, setFormData] = useState({
        empresa: '',
        almacen: '',
        puntoVenta: ''
    });
    const handleInputChange = (value, name) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    useEffect(() => {
        const fetchEmpresas = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/empresas/all');
                const empresas = response.data.map(empresa => ({
                    value: empresa.id.toString(),
                    label: empresa.razonSocial
                }));
                setEmpresas(empresas);
                
                if (response.data.length > 0) {
                    handleInputChange(empresas[0].value, 'empresa'); 
                    handleEmpresaChange(empresas[0].value);
                }
            } catch (error) {
                console.error('Error fetching empresas:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al cargar empresas',
                    text: 'No se pudo obtener la lista de empresas, intenta más tarde.'
                });
            }
        };
        fetchEmpresas();
    }, []);

    const handleEmpresaChange = async (value) => {
        handleInputChange(value, 'empresa');
        try {
            const response = await axios.get(`http://localhost:8080/api/inventario/almacenes/find/empresa/${value}`);
            const almacenes = response.data.map(almacen => ({
                value: almacen.id.toString(),
                label: almacen.nombre
            }));
            setAlmacenes(almacenes);
            if (response.data.length > 0) {
                handleInputChange(almacenes[0].value, 'almacen');
                handleAlmacenChange(almacenes[0].value);
            }
        } catch (error) {
            console.error('Error fetching almacenes:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al cargar almacenes',
                text: 'No se pudo obtener la lista de almacenes.'
            });
        }
    };

    const handleAlmacenChange = async (value) => {
        handleInputChange(value, 'almacen');
        try {
            const response = await axios.get(`http://localhost:8080/api/inventario/punto-venta/find/almacen/${value}`);
            const puntosVenta = response.data.map(puntoVenta => ({
                value: puntoVenta.id.toString(),
                label: puntoVenta.nombre
            }));
            setPuntosVenta(puntosVenta);
            if (response.data.length > 0) {
                handleInputChange(puntosVenta[0].value, 'puntoVenta');
            }
        } catch (error) {
            console.error('Error fetching puntos de venta:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al cargar puntos de venta',
                text: 'No se pudo obtener la lista de puntos de venta.'
            });
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/auth/log-in-complete', {
                usercodigo: userCode,
                username: user,
                idEmpresa: formData.empresa,
                idAlmacen: formData.almacen,
                idPuntoVenta: formData.puntoVenta
            });
            if (response.data.status) {
                loginComplete(response.data.jwt);
                Swal.fire({
                    icon: 'success',
                    title: 'Inicio de sesión exitoso',
                    text: 'Bienvenido de nuevo, ' + user,
                    showConfirmButton: false,
                    timer: 1000
                }).then(() => {
                    window.location.href = '/main/';  // Redirige a la página principal
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error en el inicio de sesión',
                    text: response.data.message
                });
            }
        } catch (error) {
            console.error('Error logging in:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al iniciar sesión',
                text: 'Hubo un problema al iniciar sesión. Inténtalo de nuevo más tarde.'
            });
        }
    };

    return (
        <>
  <div className="absolute flex items-center justify-center min-h-screen bg-gradient-to-br from-green-600 via-blue-500 to-purple-500 overflow-hidden w-full">
    {/* Fondo de partículas */}
    <ParticlesComponent id="tsparticles" className="absolute top-0 left-0 w-full h-full" />

    {/* Contenedor Principal */}
    <div className="relative z-10 flex flex-col mt-2 mb-2 md:flex-row items-center bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl shadow-lg p-10 md:p-14 space-y-6 md:space-y-0 md:space-x-8">

      {/* Imagen del logotipo */}
      <div className="flex flex-col items-center justify-center mb-4 md:mb-0 hidden md:flex">
        <img className="w-28 h-28 md:w-48 md:h-48 object-contain animate-pulse" src={milagro} alt="Avicola Logo" />
      </div>
      {/* Formulario de Login */}
      <div className="w-full max-w-md p-6 bg-white bg-opacity-80 backdrop-blur-lg rounded-3xl shadow-xl">
        <div className="text-center mb-8">
          <h3 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600">
          DataSoft IS.
          </h3>
        </div>

          {/* Formulario de Selección */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <SelectInput
              options={empresas}
              value={formData.empresa}
              setValue={(value) => handleEmpresaChange(value)}
              placeholder="Empresa"
              sizeClass="md"
            />

            {formData.empresa && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SelectInput
                    value={formData.almacen}
                    setValue={(value) => handleInputChange(value, 'almacen')}
                  options={almacenes}
                  placeholder="Almacén"
                  sizeClass="md"
                />
              </motion.div>
            )}

            {formData.almacen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SelectInput
                  options={puntosVenta}
                  setValue={(value) => handleInputChange(value, 'puntoVenta')}
                  value={formData.puntoVenta}
                  placeholder="Punto de Venta"
                  sizeClass="md"
                />
              </motion.div>
            )}

            {/* Botón de Enviar */}
            <motion.button
              className={`w-full flex justify-center bg-gradient-to-r from-purple-700 to-blue-500 hover:from-purple-600 hover:to-blue-400 text-white p-3 rounded-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 ${
                !formData.puntoVenta ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              type="submit"
              disabled={!formData.puntoVenta}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Ingresar
            </motion.button>
          </form>

          {/* Pie de página del formulario */}
          <div className="space-y-6 mt-8 text-center text-gray-300 text-xs">
            <p>By MicroData</p>
            <p>© 2023-2024 All Rights Reserved</p>
          </div>
        </div>
      </div>
    </div>
</>

    );
};

EmpresaAlmacen.propTypes = {
    user: PropTypes.string.isRequired,
    userCode: PropTypes.string.isRequired
};

export default EmpresaAlmacen;
