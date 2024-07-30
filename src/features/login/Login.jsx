import { useState } from 'react';
import axios from 'axios';
import avicola from '../../assets/avicola.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import PasswordInput from '../../components/inputs/PasswordInput';
import TextInput from '../../components/inputs/TextInput';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/alerts/Alert';
import ParticlesComponent from '../../components/Particles';

 const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const { login } = useAuth();

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
        window.location.href = '/main'; 
         
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
    <>
      <div
        className="absolute top-0 left-0 bg-gradient-to-b from-green-950 via-green-600 to-green-500 bottom-0 leading-5 h-full w-full overflow-hidden">
        <ParticlesComponent id="tsparticles" className="absolute top-0 left-0 w-full h-full" />
        <div
          className="relative flex md:flex-row items-center justify-center bg-transparent rounded-3xl shadow-xl h-full">
          <div className="hidden items-center sm:block justify-center lg:px-14 sm:max-w-4xl xl:max-w-md z-10">
            <div className="self-center flex flex-col items-center text-gray-300">
              <img className="w-48 h-48" src={avicola} alt="Avicola" />
            </div>
          </div>

          <div className="flex justify-center self-center  z-10">
            <div className="p-12 bg-white bg-opacity-30 mx-auto rounded-3xl w-96 ">
              <div className="block sm:hidden items-center  justify-center lg:px-14 sm:max-w-4xl xl:max-w-md z-10">
                <div className="self-center flex flex-col items-center text-gray-300">
                  <img className="w-32 h-32" src={avicola} alt="Avicola" />
                </div>
              </div>
              <div className="mb-7">
                <h3 className="font-semibold text-2xl text-white">Avícola Don Jose</h3>
              </div>
              {showAlert && (
                <Alert message={alertMessage} onClose={() => setShowAlert(false)} />
              )}
              <form className='space-y-6' onSubmit={handleSubmit}>
                <TextInput
                  text={username}
                  setText={setUsername}
                />
                <PasswordInput 
                  password={password}
                  setPassword={setPassword}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
                  <button
                  className='w-full flex justify-center bg-purple-800  hover:bg-purple-700 text-gray-100 p-3  rounded-lg tracking-wide font-semibold  cursor-pointer transition ease-in duration-500'
                  type="submit">Ingresar</button>

              </form>
              <div className="space-y-6">
                
                <div className="mt-7 text-center text-gray-300 text-xs">
                  <span>
                      By Dig
                      </span>
                </div>
                <div className="mt-7 text-center text-gray-300 text-xs">
                  <span>
                    Copyright © 2024
                    </span>
                </div>
              </div>
            </div>
          </div >
        </div>
      </div>
    </>
  );
};

export default Login;
