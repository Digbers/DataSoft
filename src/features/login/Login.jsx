import { useState } from 'react';
import axios from 'axios';
import avicola from '../../assets/avicola.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import PasswordInput from '../../components/inputs/PasswordInput';
import TextInput from '../../components/inputs/TextInput';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/alerts/Alert';
import ParticlesComponent from '../../components/Particles';
//import { useNavigate } from 'react-router-dom';

 const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const { login } = useAuth();
  //const navigate = useNavigate();

  const handleSubmit =  async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/auth/log-in', {
        username: username,
        password: password
      });
      if (response.data.status) {
        console.log(response.data.jwt);
        login(response.data.jwt);
        //navigate('/empresa');
        //window.location.href = '/empresa'; 
         
      } else {
        console.error('Error:', response.data.message);
        setAlertMessage(response.data.message);
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      if (error.response) {
        if (error.response.status === 401) {
          setAlertMessage('Invalid credentials. Please try again.');
        } else {
          setAlertMessage('Error logging in. Please try again.');
        }
        console.error('Error response:', error.response);
      } else if (error.request) {
        // La solicitud se hizo pero no se recibió respuesta
        setAlertMessage('No response from server. Please try again later.');
        console.error('Error request:', error.request);
      } else {
        setAlertMessage('Error logging in. Please try again.');
        console.error('Error message:', error.message);
      }
      setShowAlert(true);
    }
  };

  return (
    <div className="absolute flex items-center justify-center min-h-screen bg-gradient-to-br from-green-600 via-blue-500 to-purple-500 overflow-hidden w-full">
  {/* Fondo de partículas */}
  <ParticlesComponent id="tsparticles" className="absolute top-0 left-0 w-full h-full" />

  {/* Contenedor del login */}
  <div className="relative z-10 flex flex-col mt-2 mb-2 md:flex-row items-center bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl shadow-lg p-10 md:p-14 space-y-6 md:space-y-0 md:space-x-8">
    
    {/* Imagen del logotipo */}
    <div className="flex flex-col items-center justify-center mb-4 md:mb-0">
      <img className="w-28 h-28 md:w-48 md:h-48 object-contain animate-pulse" src={avicola} alt="Avicola Logo" />
    </div>

    {/* Formulario de Login */}
    <div className="w-full max-w-md p-6 bg-white bg-opacity-80 backdrop-blur-lg rounded-3xl shadow-xl">
      <div className="text-center mb-8">
        <h3 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600">
        DataSoft IS.
        </h3>
      </div>

      {/* Mostrar alertas */}
      {showAlert && (
        <Alert message={alertMessage} onClose={() => setShowAlert(false)} />
      )}

      {/* Formulario de inicio de sesión */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <TextInput
          text={username}
          typeInput="text"
          placeholder="Username"
          setText={setUsername}
          sizeClass="md"
        />
        <PasswordInput
          placeholder="Password"
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />

        <button
          className="w-full flex justify-center bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white p-3 rounded-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105"
          type="submit"
        >
          Ingresar
        </button>
      </form>

      {/* Pie de página del login */}
      <div className="mt-8 space-y-6 text-center text-gray-500 text-sm">
        <p>By MicroData</p>
        <p>&copy; 2024 DataSoft IS. Todos los derechos reservados.</p>
      </div>
    </div>
  </div>
</div>

  );
};

export default Login;
