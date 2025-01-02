
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../context/ThemeContext';
const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md focus:outline-none mx-4 focus:ring bg-white dark:bg-gray-900"
    >
      {theme === 'dark' ? (
        <FontAwesomeIcon icon={faSun} className="text-yellow-500" />
      ) : (
        <FontAwesomeIcon icon={faMoon} className="text-gray-500" />
      )}
    </button>
  );
};

export default ThemeToggleButton;
