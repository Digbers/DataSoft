import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Alert = ({ message, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 3000); // 3 seconds
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  return (
    visible && (
        <div className="fixed top-5 bg-opacity-30 left-1/2 transform -translate-x-1/2 p-4 bg-red-500 text-white rounded-md animate-slideDownFadeOut">
            {message}
        </div>
    )
  );
};

Alert.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Alert;
