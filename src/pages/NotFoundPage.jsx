
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-4">Lo siento, la página que buscas no existe.</p>
      <Link to="/" className="text-blue-500 hover:underline">
        Volver al Inicio
      </Link>
    </div>
  );
};

export default NotFoundPage;
