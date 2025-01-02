import PropTypes from "prop-types";
import { motion } from "framer-motion";
import '@fortawesome/fontawesome-free/css/all.min.css';

const CustomButton = ({ placeholder, onClick, sizeClass = "", icon }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white p-3 rounded-lg font-semibold transition-all duration-300 ease-in-out transform ${sizeClass}`}
      type="button"
    >
      {icon && <i className={`${icon} mr-2`}></i>} {/* Icono si existe */}
      {placeholder}
    </motion.button>
  );
};

CustomButton.propTypes = {
  placeholder: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  sizeClass: PropTypes.string,
  icon: PropTypes.string, // Nueva prop para el ícono
};

export default CustomButton;
